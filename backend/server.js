const express = require('express');
const app = express();

const router = express.Router();
const login = express.Router();
const users = express.Router();

// body parser for the req.body
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// datastore import and initialization
const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore();
const USERS = "Users";
const QUESTIONS = "Questions";


function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}

/* ------------- Begin Model Functions ------------- */

function add_user(name, email, user_id) {
    var key = datastore.key(USERS)
    const new_user = { "name": name, "email": email, "user_id": user_id }
    return datastore.save({ "key": key, "data": new_user }).then((user) => { return user })
}

function add_questions(mentors, mentees) {
    var key = datastore.key(QUESTIONS)
    const new_question = { "mentor_questions": mentors, "mentees": mentees }
    return datastore.save({ "key": key, "data": new_question }).then((question) => { return question })
}

function get_questions() {
    const q = datastore.createQuery(QUESTIONS);
    return datastore.runQuery(q).then((entities) => {
        console.log(entities)
        return entities[0].map(fromDatastore);
    });
}

function get_users() {
    const q = datastore.createQuery(USERS);

    return datastore.runQuery(q).then((users) => {
        return users[0].map(fromDatastore);
    })
}

function get_user(user_id) {
    const q = datastore.createQuery(USERS);
    return datastore.runQuery(q).then((users) => {
        users[0].map(fromDatastore);
        for (let user of users[0]) {
            console.log(user.id)
            if (user.user_id === user_id) {
                console.log(user)
                return user
            }
        }
    })
}

function add_user_answers(user_id, questions) {
    
    // find the user that matches the id
    return get_user(user_id).then((user) => {
        console.log(questions)
        const key = datastore.key([USERS, parseInt(user.id, 10)]);

        // update that user to have the questions in the form needed
        user.type = questions.type
        user.questions = questions
        user.questions.type = undefined;

        return datastore.save({"key": key, "data": user}).then(() => {
            return user
        })
    })


}

/* ------------- End Model Functions ------------- */



/* ------------- Begin Routes --------------- */

app.get('/users/:user_id', function (req, res) {
    get_user(req.params.user_id).then(user => {
        res.status(200).json(user);
    })

})

app.get('/users', function (req, res) {
    get_users().then(users => {
        res.status(200).json(users);
    })

})

app.post('/users', function (req, res) {
    console.log(req.body)
    add_user(req.body.name, req.body.email, req.body.user_id).then((user) => {
        res.status(201).json(user);
    })
})

app.post('/questions', function (req, res) {
    var mentor_questions = req.body.mentors
    var mentee_questions = req.body.mentees
    add_questions(mentor_questions, mentee_questions).then((question) => {
        res.status(201).json(question);
    })
})

app.get('/questions', function (req, res) {
    get_questions().then(questions => {
        res.status(200).json(questions[0])
    })
})

app.post('/users/:user_id/questions', function (req, res) {
    var user_id = req.params.user_id;
    var body = req.body;
    add_user_answers(user_id, body).then(result => {
        res.status(200).json(result);
    })

})

/* ------------- End Routes ------------- */


app.use('/users', users);
app.use('/questions', router);
app.use('/login', login);


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});