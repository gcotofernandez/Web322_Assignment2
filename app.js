const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const fs = require('fs');

const app = express();

const { appConfigs } = require('./configs.js');
const { appConstants } = require('./constants.js');

// Setup view engine
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Setup static directory
app.use(express.static(path.join(__dirname, 'public')));

// Homepage route
app.get('/', (req, res) => {
  let selectedImage = {
    value: 'Default',
    name: 'Default',
    path: 'images/smile.jpg'
  };
  if (req.query.image) {
    selectedImage = appConstants.images.find(image => image.value === req.query.image) || selectedImage;
  }
  res.render('gallery', {
    selectedImage,
    appConstants
  });
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

// Login form submission route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  fs.readFile('users.json', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal server error');
    }
    const users = JSON.parse(data);
    if (users[username] === password) {
      req.session.loggedIn = true;
      req.session.username = username;
      return res.redirect('/');
    }
    res.render('login', { message: 'Invalid username or password' });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  req.session.username = null;
  res.redirect('/');
});

// Start server
app.listen(appConfigs.port, () => {
  console.log(`Server started on port ${appConfigs.port}`);
});
