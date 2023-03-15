const path = require('path');

module.exports = {
  webServer: {
    port: 3000
  },
  session: {
    cookieName: 'session',
    secret: 'web322_assignment2',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  },
  userFile: path.join(__dirname, 'data', 'users.json'),
  imageFile: path.join(__dirname, 'data', 'imagelist.txt'),
  imageFolder: path.join(__dirname, 'public', 'images'),
};
