require('express-async-errors');
require('axios');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

let server = null;

const rabbitmqUrl = process.env.RABBITMQ_CONN;
const queueName = process.env.RABBITMQ_QNAME;

async function start(api, db) {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    
    await channel.assertQueue(queueName, { durable: true });

    const app = express();
    app.use(morgan('dev'));
    app.use(bodyParser.json())

    app.use((err, req, res, next) => {
        console.error(err);
        res.sendStatus(500);
    });

    api(app, db, channel);

    server = app.listen(process.env.PORT);
    return server;
}

async function stop() {
    if (server) await server.close();
    return true;
}

module.exports = { start, stop };