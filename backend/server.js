const express = require("express");
const path = require('path');
const app = express();



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
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
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
        if (user.user_id === user_id) {
            return user;
        }
    }
}

/* UPDATE - add a user's question answers */
async function add_user_answers(user_id, questions, type) {

    console.log("Writing to User");
    console.log(questions);
    var user = {email: user_id,
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
    const user = await get_user(user_id);
    const matches = [];

    // get all users of opposite type
    let options = await get_users();
    options = options.filter((potential_user) => potential_user.type !== user.type);


    let optionScore;
    // iterate through questions/answers key value. compare it to the answer that the mentor has: if matching, add 1 to match score
    for (let option of options) {
        // iterate options and calculate score: score+=1 if they have the same answer to questions
        optionScore = 0;
        for (let question in option.questions) {
            const optionWords = option.questions[question].split(" ");
            const userWords = user.questions[question].split(" ");
            for (let word of optionWords) {
                if (userWords.includes(word)) {
                    optionScore++;
                    break;
                }
            }
        }

    }

    // return matches sorted by frequency of highest scores array
    matches.sort((a, b) => b.score - a.score);
    return matches;

}

/* ------------- End Model Functions ------------- */

/* ------------- Begin USERS Routes --------------- */

/* REQUEST FORMAT:
    body: {
        "name": 'STRING',
        "email": 'STRING',
        "user_id": Auth0 authentication number? 
    }
*/
/*
Disabling this given our users will be created for us by Auth0

app.post("/users", async function (req, res) {
    const user = await add_user(req.body.name, req.body.email, req.body.user_id);
    res.status(201).json(user);
});*/

app.get("/users/:user_id", async function (req, res) {
    const user = await get_user(req.params.user_id);
    res.status(200).json(user);
});

/*
Disabling because it currently isn't used
app.get("/users", async function (req, res) {
    const users = await get_users();
    res.status(200).json(users);
});*/

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
    console.log(req.body);
    const user = await add_user_answers(user_id, questions, type);
    res.status(200).json(user);
});

/*
app.delete("/users/:user_id", async function (req, res) {
    var user_id = req.params.user_id;
    await delete_user(user_id);
    res.status(204).end();
});
*/

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

/* REQUEST FORMAT:
    body: {
        "type": STRING (mentor/mentee/both),
        "question": STRING,
        "options": [STRING, STRING, STRING, (ctn...)]
    }
*/
/*
app.post("/questions", async function (req, res) {
    const type = req.body.type;
    const question = req.body.question;
    const options = req.body.options;
    const response = await add_questions(type, question, options)
    res.status(201).json(response);
});
*/

app.get("/questions/:type", async function (req, res) {
    const type = req.params.type;
    const questions = await get_questions(type)
    res.status(200).json(questions[0]);
});

app.get("/test", function (req, res) {
    res.status(200).send("Success");
});
app.use(express.static(path.join(__dirname, '../frontend/build/')));

/* ------------- End Routes ------------- */


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
