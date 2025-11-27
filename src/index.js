require('dotenv').config();
const express = require('express');
var cors = require('cors');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const app = express();
const methodOverride = require('method-override');
const routes = require('./routes');
const viewEngine = require('./config/viewEngine');
const cookieParser = require('cookie-parser');

app.use(morgan('combined'));
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true, // allow cookies to be sent
    }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// override with the X-HTTP-Method-Override header in the request
// This lets you use ?_method=PUT or ?_method=DELETE
app.use(methodOverride('_method'));

// Template engine
app.engine(
    'hbs',
    engine({
        extname: '.hbs',
        helpers: {
            sum: (a, b) => a + b,
        },
    }),
);

// config viewEngine
viewEngine(app);

// Routes init
routes(app);

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
