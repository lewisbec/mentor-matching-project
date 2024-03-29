const express = require("express");
const path = require('path');
const app = express();
const Fuse = require('fuse.js');


// body parser for the req.body
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// datastore import and initialization
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();
const USERS = "Users";
const QUESTIONS = "Questions";

function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}

// adding this header to allow the client to be able to fetch from their localhost:3000
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://lithe-site-375901.uc.r.appspot.com');
    next();
});

/* ------------- Begin Model Functions ------------- */

/* CREATE a user */
async function add_user(name, email, user_id) {
    var key = datastore.key(USERS);
    const new_user = await datastore.save({
        key: key,
        data: { name: name, email: email, user_id: user_id },
    });
    return new_user;
}

/* READ all users */
async function get_users() {
    const q = datastore.createQuery(USERS);
    const users = await datastore.runQuery(q);
    return users[0].map(fromDatastore);
}

/* READ a user by their user ID */
async function get_user(user_id) {
    const q = datastore.createQuery(USERS);
    const users = await datastore.runQuery(q);
    users[0].map(fromDatastore);

    // iterate through all users until finding the matching user_id
    for (let user of users[0]) {
        if (user.email === user_id) {
            return user;
        }
    }
}

/* UPDATE - add a user's question answers */
async function add_user_answers(user_id, questions, type) {

    var user = {
        email: user_id,
        questions: questions,
        type: type
    };
    const key = datastore.key([USERS, user_id]);


    // save to datastore
    const updated_user = await datastore.save({ key: key, data: user });
    return updated_user;
}

/* DELETE - delete a user by their user_id */
async function delete_user(user_id) {
    // get the matching user id
    const user = await get_user(user_id);
    const key = datastore.key([USERS, parseInt(user.id, 10)]);

    await datastore.delete(key);
}

/* CREATE - add a question */
async function add_questions(type, question, options) {
    var key = datastore.key(QUESTIONS);
    const new_question = { type: type, question: question, options: options };
    return await datastore.save({ key: key, data: new_question });
}

/* READ - get all questions for specified type of user */
async function get_questions(type) {
    const q = datastore.createQuery(QUESTIONS);
    let questions = [];
    const all_questions = await datastore.runQuery(q)
    all_questions[0].map(fromDatastore);
    for (let question of all_questions) {
        if (question.type === type) {
            questions.push(question);
        }
    };
    return questions;
}

/* GET - Get all matches for the specified user */
async function get_matches(user_id) {
    // get user
    const user = await get_user(user_id);
    // get all users of opposite type
    let options = await get_users();
    if (user.type !== "both") {
        options = options.filter((potential_user) => potential_user.type !== user.type);
    } else {
        // only have to remove the user itself
        options = options.filter((potential_user) => potential_user.email !== user.email);
    }
    options = options.map(item => JSON.parse(item.questions));
    options.forEach(option => { option.score = 0 });

    const user_questions = JSON.parse(user["questions"]);


    // Set initial fuse search options 
    let fuseOptions = {
        shouldSort: true,
        threshold: 0.3, // can be modified to lower of raise the score matching
        includeScore: true,
    };

    // for each question in questions list, update the search to only look at that key and with the certain weight desired, then look for the matches, update the scoring array for each one
    for (let question in user_questions) {
        if (!(question.includes("interests") || question.includes("gender") || question.includes("race"))) {
            continue;
        }
        // search in the questions being looked at
        if (question.startsWith("interests_input")) {
            fuseOptions.keys = ["interests_input_1", "interests_input_2", "interests_input_3"];
        } else if (question.startsWith("prof_interests_input")) {
            fuseOptions.keys = ["prof_interests_input_1", "prof_interests_input_2", "prof_interests_input_3"];
        } else {
            fuseOptions.keys = [question];
        }

        const fuse = new Fuse(options, fuseOptions);
        const result = fuse.search(user_questions[question]);
        // update the matched users' score if there was a met and increment their score
        let string = question.concat("_rank")
        let weight = parseInt(user_questions[string]);
        for (let match of result) {
            // find weighting from user
            if (weight) {
                options[match.refIndex].score += weight;
            } else {
                options[match.refIndex].score++;
            }
        }

        // remove key from search
        fuseOptions.keys = null;

    }

    // sort results by score
    options.sort((a, b) => b.score - a.score);

    // remap the scoring as a percentage match // NEEDS REWORKED
    maxScore = options[0].hasOwnProperty("score") ? options[0].score : 1;
    options.forEach(option => option.score = (option.score / maxScore) * 100)

    // filter for score has to reach a certain threshold
    const MATCH_THRESHOLD = 1;
    options = options.filter(match => match.score >= MATCH_THRESHOLD);

    return options

}

/* ------------- End Model Functions ------------- */

/* ------------- Begin USERS Routes --------------- */

app.get("/users/:user_id", async function (req, res) {
    const user = await get_user(req.params.user_id);
    res.status(200).json(user);
});

/* REQUEST FORMAT:
    body: {
        "user_id": Auth0 authentication number,
        "questions": {question: answer, question2: answer2, (ctn...)}
        "type": STRING (mentor/mentee/both)
    }
*/
app.post("/users/", async function (req, res) {
    var user_id = req.body.user_id;
    var questions = req.body.questions;
    var type = req.body.type;
    const user = await add_user_answers(user_id, questions, type);
    res.status(200).json(user);
});


/* 
REQUEST FORMAT:
    Method: POST
    Body: {"user_id": {user_id}}
    example: {"user_id": "4"}

RESPONSE FORMAT:
    RETURNS: an array of JSON objects which each represent a user. Sorted by highest to lowest score
    example response body:
    [
    {name: "Jim", email: "jim@gmail.com", score: 5, questions: {gender: "male", experience: 6, interest: "web development"}},
    {name: "Will", email: "will@gmail.com", score: 3 questions: {gender: "male", experience: 6, interest: "research"}}, 
    {name: "Pam", email: "pam@gmail.com", score: 2, questions: {gender: "female", experience: 20, interest: "game development"}},
    ]
*/
app.post("/matches", async function (req, res) {
    var user_id = req.body.user_id;
    const matches = await get_matches(user_id);
    res.status(200).json(matches);
});

/* ------------- End USER Routes ------------- */



/* ------------- Begin QUESTION Routes --------------- */


app.get("/questions/:type", async function (req, res) {
    const type = req.params.type;
    const questions = await get_questions(type)
    res.status(200).json(questions[0]);
});

app.get("/test", function (req, res) {
    res.status(200).send("Success");
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://lithe-site-375901.uc.r.appspot.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // Add the 'content-type' header to the list of allowed headers
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

/* ------------- End Routes ------------- */


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
