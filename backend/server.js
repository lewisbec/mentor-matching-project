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

function add_user(name, email) {
    var key = datastore.key(USERS)
    const new_user = { "name": name, "email": email }
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


/* ------------- End Model Functions ------------- */



/* ------------- Begin Routes --------------- */

app.get('/questions', function (req, res) {
    get_questions().then(questions => {
        res.status(200).json(questions[0])
    })
})


login.get('/', function (req, res) {
    res.send('Login route here with Auth0')
})

app.post('/users', function (req, res) {
    console.log(req.body)
    add_user(req.body.name, req.body.email).then((user) => {
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

app.post('/mentee-questions', function (req, res) {
    var questions = req.body.questions
    add_questions(questions).then((question) => {
        res.status(201).json(question);
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