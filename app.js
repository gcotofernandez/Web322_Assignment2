const express = require('express');
const exphbs  = require('express-handlebars');
const cookieParser = require('cookie-parser');
const clientSessions = require('client-sessions');
const path = require('path');
const fs = require('fs');
const randomstring = require('randomstring');

const app = express();

const constants = require('./constants');
const configs = require('./configs');

// Setting up Handlebars as view engine
const handlebars = exphbs.create({ 
    extname: '.hbs', 
    defaultLayout: 'main', 
    helpers: {
        isSelected: function(value, test) {
            return value == test ? 'selected' : '';
        }
    }
});
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// Setting up middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(clientSessions({
    cookieName: 'session',
    secret: randomstring.generate(),
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
}));

// Routing
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { layout: 'login' });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const userDB = JSON.parse(fs.readFileSync(constants.USER_DATA_FILE));

    if (username in userDB) {
        if (userDB[username] === password) {
            req.session.user = username;
            res.redirect('/gallery');
        } else {
            res.render('login', { layout: 'login', message: 'Invalid password.' });
        }
    } else {
        res.render('login', { layout: 'login', message: 'Not a registered username.' });
    }
});

app.get('/gallery', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        const imageList = fs.readFileSync(constants.IMAGE_LIST_FILE, 'utf-8').split('\n').map(line => line.trim());
        res.render('gallery', { username: req.session.user, images: imageList });
    }
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/login');
});

// Server startup
app.listen(configs.PORT, () => console.log(`Server started on port ${configs.PORT}`));
