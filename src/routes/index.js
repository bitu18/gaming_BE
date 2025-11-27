const newsRouter = require('./news');
const siteRouter = require('./site');
const users = require('./users');
const login = require('./login');
const user = require('./profile');

function routes(app) {
    app.use('/news', newsRouter);
    app.use('/users', users);
    app.use('/api', login);
    app.use('/api/user', user);

    app.use('/', siteRouter);
}

module.exports = routes;
