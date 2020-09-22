const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create redis client
let client = redis.createClient();
client.on('connect', () => {
    console.log('Connected to Redis');
})

const port = 3000;
const app = express();

// Handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Home Page
app.get('/', (req, res, next) => {
    res.render('searchusers') // In Home page searchusers gonna be rendered
});

// Search an user
app.post("/user/search", (req, res, next) => {
    let id = req.body.id;
    client.hgetall(id, (err, obj) => { // has get all: Get all attributtes of a hash
        if (!obj) {
            res.render('searchusers', {
                error: "Requested user does not exist"
            });
        } else {
            obj.id = id; // Add id sent as parameter in the URL, to object
            res.render('details', {
                user: obj
            });
        }
    });
});

// Add user page
app.get('/user/add', (req, res, next) => {
    res.render('adduser') // In Home page searchusers gonna be rendered
});

// Add a new user
app.post('/user/add', function (req, res, next) {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
    let age = req.body.age;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
        'age', age
    ], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// Delete a User
app.delete('/user/delete/:id', function (req, res, next) {
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});

