const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('client-sessions');
const randomstring = require('randomstring');
const bodyParser = require('body-parser');
const readline = require('readline');

const app = express();

// Configure client sessions middleware
app.use(session({
  cookieName: 'session',
  secret: randomstring.generate(),
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000, // 5 minutes
}));

// App constants
const appConstants = {
  imagesListPath: 'imagelist.txt',
  imagesDir: 'images',
  images: [],
};

function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
      // User is logged in
      next();
    } else {
      // User is not logged in, redirect to login page
      res.redirect('/');
    }
  }
  
  function requireAuthorization(req, res, next) {
    if (req.session && req.session.isAuthenticated && req.session.username) {
      // User is authenticated and authorized to access the gallery page
      return next();
    } else {
      // User is not authorized, redirect to login page
      res.redirect('/login');
    }
  }  

// Read the image list file
const lineReader = readline.createInterface({
  input: fs.createReadStream(appConstants.imagesListPath),
});
lineReader.on('line', (line) => {
  const parsed = path.parse(line);
  appConstants.images.push({
    value: parsed.name,
    name: parsed.name,
    path: path.join(appConstants.imagesDir, line),
  });
});

// Configure body parser middleware for handling POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Handlebars as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Define routes
// Define a route for the homepage
app.get('/', requireLogin, requireAuthorization, (req, res) => {
  let image =
    appConstants.images.find((image) => image.value === req.query.image) || {
      value: 'Default',
      name: 'Default',
      path: 'images/smile.jpg',
    };

  // Render the 'gallery' view with the image and constants
  res.render('gallery', {
    constants: appConstants,
    image: image,
  });
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
        res.redirect('/gallery');
      } else {
        res.redirect('/?message=Invalid password');
      }
    } else {
      res.redirect('/?message=Not a registered username');
    }
  });
});

app.get('/gallery', (req, res) => {
  // Check if user is logged in
  if (req.session && req.session.user) {
    // Render gallery view with user info
    const user = req.session.user;
    res.render('gallery', { title: 'Gallery', user });
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


// Add a new route to handle registration form
app.get('/register', (req, res) => {
    // Render the registration form
    res.render('register', { title: 'Gallery', message: req.query.message });
  });
  
  app.post('/register', (req, res) => {
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
        // User already exists, redirect to login page
        res.redirect('/?message=Username already taken');
      } else {
        // Add new user to user.json
        users[username] = password;
        fs.writeFile('user.json', JSON.stringify(users), (err) => {
          if (err) {
            console.error(`Error writing to user.json file: ${err.message}`);
            res.status(500).send('Internal server error');
            return;
          }
  
          // Save user session and redirect to gallery page
          req.session.user = username;
          res.redirect('/gallery');
        });
      }
    });
  });  


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
