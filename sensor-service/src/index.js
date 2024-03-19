(async () => {
    require("dotenv").config();
    const sensor = require('./api/sensor');
    const server = require('./server/server');
    const db = require('./db/index');
    
    try {
        await server.start(sensor, db);
        console.log('Server is up and running at ' + process.env.PORT);
    } catch (error) {
        console.error(error);
    }
})();