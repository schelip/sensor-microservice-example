(async () => {
    require("dotenv").config();
    const report = require('./api/sensor');
    const server = require("./server/server");
 
    try {
        await server.start(report);
        console.log('Server is up and running at ' + process.env.PORT);
    } catch (error) {
        console.error(error);
    }
})();