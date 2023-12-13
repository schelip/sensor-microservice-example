require('express-async-errors');
require('axios');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

let server = null;

async function start(api) {
    const app = express();
    app.use(morgan('dev'));
    app.use(bodyParser.json())

    app.use((err, req, res, next) => {
        console.error(err);
        res.sendStatus(500);
    });

    api(app);

    server = app.listen(process.env.PORT);
    return server;
}

async function stop() {
    if (server) await server.close();
    return true;
}

module.exports = { start, stop };