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
    // find the user that matches the id
    const user = await get_user(user_id);
    const key = datastore.key([USERS, parseInt(user.id, 10)]);

    // update that user to have a mentor/mentee type and save their questions
    user.type = type;
    user.questions = questions;

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
    const question = await datastore.save({ key: key, data: new_question });
    return question;
}

/* READ - get all questions for specified type of user */
async function get_questions(type) {
    const q = datastore.createQuery(type);
    const questions = await datastore.runQuery(q)
    return questions[0].map(fromDatastore)
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Routes --------------- */

app.post("/users", async function (req, res) {
    const user = await add_user(req.body.name, req.body.email, req.body.user_id);
    res.status(201).json(user);
});

app.get("/users/:user_id", async function (req, res) {
    const user = await get_user(req.params.user_id);
    res.status(200).json(user);
});

app.get("/users", async function (req, res) {
    const users = await get_users();
    res.status(200).json(users);
});

app.post("/users/:user_id/questions", async function (req, res) {
    var user_id = req.params.user_id;
    var questions = req.body.questions;
    var type = req.body.type;
    const user = await add_user_answers(user_id, questions, type);
    res.status(200).json(user);
});

app.delete("/users/:user_id", async function (req, res) {
    var user_id = req.params.user_id;
    await delete_user(user_id);
    res.status(204).end();
});

app.post("/questions", async function (req, res) {
    const type = req.body.type;
    const question = req.body.question;
    const options = req.body.options;
    const response = await add_questions(type, question, options)
    res.status(201).json(response);
});

app.get("/questions/:type", async function (req, res) {
    const type = req.params.type;
    const questions = await get_questions(type)
    res.status(200).json(questions[0]);
});

app.use(express.static(path.join(__dirname, '../frontend/build/')));

/* ------------- End Routes ------------- */


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
