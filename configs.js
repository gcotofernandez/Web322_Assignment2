const {engine} = require('express-handlebars')

const appConfigs = {
    port: 3000,
    //
    engine: engine({
    })
}

module.exports = {
    appConfigs
}