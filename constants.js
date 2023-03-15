const path = require('path');

const IMAGE_FOLDER = path.join(__dirname, 'public/images');
const IMAGE_LIST = path.join(__dirname, 'imagelist.txt');
const GALLERY_TITLE = 'Random Things';
const USER_FILE = path.join(__dirname, 'user.json');
const LOGIN_PAGE_TITLE = 'Login';
const LOGIN_ERROR_MESSAGE = 'Invalid username or password';
const REGISTRATION_PAGE_TITLE = 'Registration';
const REGISTRATION_SUCCESS_MESSAGE = 'User registered successfully';
const REGISTRATION_ERROR_MESSAGE = 'User already registered or passwords do not match';

module.exports = {
  IMAGE_FOLDER,
  IMAGE_LIST,
  GALLERY_TITLE,
  USER_FILE,
  LOGIN_PAGE_TITLE,
  LOGIN_ERROR_MESSAGE,
  REGISTRATION_PAGE_TITLE,
  REGISTRATION_SUCCESS_MESSAGE,
  REGISTRATION_ERROR_MESSAGE,
};
