const readFile = require("linebyline");
const path = require('path');

const appConstants = {
    imagesListPath: 'imagelist.txt',
    imagesDir: 'images',
    images   : [],
}

readFile(appConstants.imagesListPath)
    .on('line', (line) => {
        const parsed = path.parse(line)
        appConstants.images.push({
            value: parsed.name,
            name : parsed.name,
            path : path.join(appConstants.imagesDir, line),
        })
    })

module.exports = {
    appConstants
}