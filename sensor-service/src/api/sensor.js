const SensorReading = require('../db/model/sensorReading');

const exchange = process.env.RABBITMQ_XNAME;

async function publishLast24HoursReadings(channel) {
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  try {
    const readings = await SensorReading.find({ timestamp: { $gte: last24Hours } });

    for (const reading of readings) {
      channel.publish(exchange, '', Buffer.from(JSON.stringify(reading)));
    }

    console.log(`Published ${readings.length} readings from the last 24 hours.`);
  } catch (error) {
    console.error('Error publishing readings:', error);
  }
}

module.exports = async (app, db, channel) => {
  await publishLast24HoursReadings(channel);

  app.post('/reading', async (req, res, next) => {
    const { temperature, relativeHumidity, windSpeed } = req.body;

    if (!temperature || !relativeHumidity || !windSpeed) {
      return res.status(400).json({ error: 'Received incomplete data.' });
    }

    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - 1);

    try {
      const reading = new SensorReading({
        temperature,
        relativeHumidity,
        windSpeed,
        timestamp
      });

      await reading.save();

      channel.publish(exchange, '', Buffer.from(JSON.stringify(reading)));
      console.info('Publishing reading to exchange', exchange);

      res.status(200).json({ message: `Data from sensors successfully received at ${timestamp}.` });
    } catch (e) {
      res.status(500).send({ error:`Error saving reading: ${e}`});
    }
  });

  app.delete('/readings', async (req, res, next) => {
    try {
      await SensorReading.deleteMany({});
      res.status(200).json({ message: `All readings deleted succesfully.` });
    } catch (e) {
      res.status(500).send({ error:`'Error deleting readings from database: ${e}`});
    }
  });

  app.get('/readings', async (req, res, next) => {
    try {
      readings = await SensorReading.find();
      if (!readings.length)
        res.status(204).send({});
      else
        res.status(200).json(readings);
    } catch (e) {
      res.status(500).send({ error:`'Error getting readings from database: ${e}`});
    }
  });

  app.get('/last-reading', async (req, res, next) => {
    try {
      reading = await SensorReading.findOne({}, null, { sort: { timestamp: -1 } });
      if (!reading)
        res.status(204).send({});
      else
        res.status(200).json(readings);
    } catch (e) {
      res.status(500).send({ error:`'Error getting last reading from database: ${e}`});
    }
  });
};