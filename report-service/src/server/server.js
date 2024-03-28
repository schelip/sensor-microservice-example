require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const amqp = require('amqplib');

let server = null;

const rabbitmqUrl = process.env.RABBITMQ_CONN;
const exchange = process.env.RABBITMQ_XNAME;

async function start(api) {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, '');

    const app = express();
    app.use(morgan('dev'));

    app.use((err, req, res, next) => {
        console.error(err);
        res.sendStatus(500);
    });

    api(app, channel, queue);

    server = app.listen(process.env.PORT);
    return server;
}

async function stop() {
    if (server) await server.close();
    return true;
}

module.exports = { start, stop };