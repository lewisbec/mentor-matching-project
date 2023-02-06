const express = require("express");
const app = express();

const router = express.Router();
const login = express.Router();
const users = express.Router();

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

    console.log(user);
    // save to datastore
    const updated_user = await datastore.save({ key: key, data: user });
    return updated_user;
}

/* DELETE - delete a user by their user_id */
async function delete_user(user_id) {
    // get the matching user id
    const user = await get_user(user_id);
    console.log(user)
    const key = datastore.key([USERS, parseInt(user.id, 10)]);

    datastore.delete(key);
}

function add_questions(mentors, mentees) {
    var key = datastore.key(QUESTIONS);
    const new_question = { mentor_questions: mentors, mentees: mentees };
    return datastore.save({ key: key, data: new_question }).then((question) => {
        return question;
    });
}

function get_questions() {
    const q = datastore.createQuery(QUESTIONS);
    return datastore.runQuery(q).then((entities) => {
        console.log(entities);
        return entities[0].map(fromDatastore);
    });
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

app.post("/questions", function (req, res) {
    var mentor_questions = req.body.mentors;
    var mentee_questions = req.body.mentees;
    add_questions(mentor_questions, mentee_questions).then((question) => {
        res.status(201).json(question);
    });
});

app.get("/questions", function (req, res) {
    get_questions().then((questions) => {
        res.status(200).json(questions[0]);
    });
});

/* ------------- End Routes ------------- */

app.use("/users", users);
app.use("/questions", router);
app.use("/login", login);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
