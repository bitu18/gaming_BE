const express = require('express');
const path = require('path');

function configViewEngine(app) {
    app.use(express.static(path.join(__dirname, 'public')));

    // handlebars
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '../resources/views'));
}

module.exports = configViewEngine;
