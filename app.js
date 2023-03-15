const express = require('express');
const path = require('path');
const hbs = require('hbs');

const app = express();

const {appConfigs}   = require('./configs.js')
const {appConstants} = require('./constants.js')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));

hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

app.get('/', (req, res) => {
    let image = {
        value: 'Default',
        name : 'Default',
        path : 'images/smile.jpg'
    }
    if (req.query.image)
        image = appConstants.images.find(image => image.value === req.query.image) ?? image

    res.render('gallery', {
        layout: null,

        constants: appConstants,
        image    : image
    });
});


app.listen(appConfigs.port);

