const express = require('express');
const app = express();

const router = express.Router();
const login = express.Router();



/* ------------- Begin Routes --------------- */

router.get('/', function (req, res) {
    res.send('Questions page here')
});

login.get('/', function (req, res) {
    res.send('Login route here with Auth0')
})

/* ------------- End Routes ------------- */


app.use('/questions', router);
app.use('/login', login);


// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});