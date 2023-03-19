const readFile = require("linebyline");
const path = require('path');

const appConstants = {
    imagesListPath: 'imagelist.txt',
    imagesDir: './public/images',
    images   : [],
}

module.exports = {
    appConstants
}