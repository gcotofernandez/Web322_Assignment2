const fs = require('fs');
const path = require('path');

const appConstants = {
    imagesListPath: path.join(__dirname, 'imagelist.txt'),
    imagesDir: 'images',
    images   : [],
}

const lines = fs.readFileSync(appConstants.imagesListPath, 'utf-8').split(/\r?\n/);
lines.forEach((line) => {
    const parsed = path.parse(line)
    appConstants.images.push({
        value: parsed.name,
        name : parsed.name,
        path : path.join(appConstants.imagesDir, line),
    })
});

module.exports = {
    appConstants
}
