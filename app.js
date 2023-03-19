const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('client-sessions');
const randomstring = require('randomstring');
const bodyParser = require('body-parser');
const readline = require('readline');

const app = express();

const {appConfigs}   = require('./configs.js')
const {appConstants} = require('./constants.js')

// Configure client sessions middleware
app.use(session({
  cookieName: 'session',
  secret: randomstring.generate(),
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000, // 5 minutes
}));

// Serve static files from the 'public' folder
app.use(express.static('public'));

function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    // User is logged in
    next();
  } else {
    // User is not logged in, redirect to login page
    res.redirect('/login');
  }
}

function requireAuthorization(req, res, next) {
  if (req.session && req.session.isAuthenticated && req.session.username) {
    // User is authenticated and authorized to access the gallery page
    next();
  } else {
    // User is not authorized, redirect to homepage
    res.redirect('/');
  }
}

// Read the image list file
const lineReader = readline.createInterface({
  input: fs.createReadStream(appConstants.imagesListPath),
});

appConstants.images = []; // Define the images array

lineReader.on('line', (line) => {
  try {
    const parsed = path.parse(line);
    appConstants.images.push({
      value: parsed.name,
      name: parsed.name,
      path: path.join(appConstants.imagesDir, line),
    });
  } catch (err) {
    console.error(`Error parsing line '${line}': ${err.message}`);
  }
});

lineReader.on('close', () => {
  // Set up Handlebars as the view engine
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  // Configure body parser middleware for handling POST requests
  app.use(bodyParser.urlencoded({ extended: true }));

  // Middleware for passing user info to views
  app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
  });

  // Define routes
  // Define a route for the homepage
  app.get('/', requireLogin, (req, res) => {
    if (req.session.isAuthenticated && req.session.username) {
      // User is authorized, redirect to gallery page
      res.redirect('/gallery');
    } else {
      // User is not authenticated, render the login form
      res.render('login', { title: 'Login', message: req.query.message });
    }
  });

  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if user exists in user.json
    fs.readFile('user.json', 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading user.json file: ${err.message}`);
        res.status(500).send('Internal server error');
        return;
      }

      const users = JSON.parse(data);
      if (users[username]) {
        // Check if password matches
        if (users[username] === password) {
          // Save user session
          req.session.user = username;
          req.session.isAuthenticated = true;
          req.session.username = username;
          res.redirect('/gallery');
        } else {
          res.redirect('/?message=Invalid password');
        }
      } else {
        res.redirect('/?message=Not a registered username');
      }
    });
  });

  app.get('/login', (req, res) => {
    // Render the login form
    res.render('login', { title: 'Login', message: req.query.message });
  });
  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/public/images', express.static(path.join(__dirname, 'public/images')));


  app.set('views', 'views');
  app.get('/gallery', requireAuthorization, (req, res) => {
    // Render gallery view with user info
    const user = req.session.user;
    let image = {
      value: 'Default',
      name : 'Default',
      path : 'images/smile.jpg'
    }

    if (req.query.image) {
      const imageValue = req.query.image.toLowerCase().trim();
      const selectedImage = appConstants.images.find(image => image.value.toLowerCase().trim() === imageValue);

      if (selectedImage) {
        image = selectedImage;
      }
    }

    if (user) {
      res.render('gallery', {
        layout: null,
        constants: appConstants,
        user: user,
        image: image
      });
    } else {
      // Redirect to login page
      res.redirect('/');
    }
  });

  app.get('/logout', (req, res) => {
    // Clear user session and redirect to login page
    req.session.reset();
    res.redirect('/');
  });

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
