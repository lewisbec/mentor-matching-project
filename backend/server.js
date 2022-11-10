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


/* ------------- End Model Functions ------------- */



/* ------------- Begin Routes --------------- */

router.get('/', function (req, res) {
    res.send('Questions page here')
});

login.get('/', function (req, res) {
    res.send('Login route here with Auth0')
})

app.post('/users', function (req, res) {
    console.log(req.body)
    add_user(req.body.name, req.body.email).then((user) => {
        res.status(201).json(user);
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