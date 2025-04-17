const newsRouter = require('./news');
const siteRouter = require('./site');

function routes(app) {
    app.use('/', siteRouter);

    app.use('/news', newsRouter);
}

module.exports = routes;
