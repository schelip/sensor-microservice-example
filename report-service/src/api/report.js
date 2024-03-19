const queueName = process.env.RABBITMQ_QNAME;

let readings = [];

function calcHeatIndex(temperature, relativeHumidity) {
  const tempFahrenheit = 1.8 * temperature + 32;
  const tempFahrenheitSqr = tempFahrenheit * tempFahrenheit;
  const relativeHumiditySqr = relativeHumidity * relativeHumidity;

  return (5 / 9) * (
    -42.379 +
    2.04901523 * tempFahrenheit +
    10.14333127 * relativeHumidity +
    -0.22475541 * tempFahrenheit * relativeHumidity +
    -6.83783e-03 * tempFahrenheitSqr +
    -5.481717e-02 * relativeHumiditySqr +
    1.22874e-03 * tempFahrenheitSqr * relativeHumidity +
    8.5282e-04 * tempFahrenheit * relativeHumiditySqr +
    -1.99e-06 * tempFahrenheitSqr * relativeHumiditySqr
  ) - 32;
}

function calcApparentTemp(temperature, windSpeed) {
  return 33 + (10 * Math.sqrt(windSpeed) + 10.45 - windSpeed) * ((temperature - 33) / 22);
}

function connectQueue(channel) {
  channel.consume(queueName, msg => {
    const reading = JSON.parse(msg.content.toString())
    if (!(readings.some(r => r._id === reading._id))) {
      readings.unshift(reading);
      console.log(`Consumed reading with timestamp ${reading.timestamp}`);
    }
    if (readings.length > 20)
      readings.pop();
    channel.ack(msg);
  });
}

module.exports = (app, channel) => {
  connectQueue(channel);

  app.get('/full-report', async (req, res, next) => {
    try {
      if (readings.length === 0) {
        res.status(204).send({});
        return;
      }

      const lastReading = readings[0];
      
      const heatIndex = calcHeatIndex(lastReading.temperature, lastReading.relativeHumidity);
      const apparentTemp = calcApparentTemp(lastReading.temperature, lastReading.windSpeed);
      const averageTemp = readings.reduce((acc, curr) => acc + curr.temperature, 0) / readings.length;
      const lastReadingTimestamp = lastReading.timestamp;
      const oldestReadingTimestamp = readings[readings.length - 1].timestamp;
      const totalReadings = readings.length;

      res.status(200).json({
        lastReading,
        heatIndex,
        apparentTemp,
        averageTemp,
        lastReadingTimestamp,
        oldestReadingTimestamp,
        totalReadings
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  app.get(`/report/heat-index`, async (req, res) => {
    try {
      const lastReading = readings[0];

      if (!lastReading || !lastReading.temperature || !lastReading.relativeHumidity) {
        res.status(500).json({ error: 'Sensor data unavailable' });
      }
    
      const heatIndex = calcHeatIndex(lastReading.temperature, lastReading.relativeHumidity);

      res.status(200).json({
        'heatIndex': heatIndex,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  app.get(`/report/apparent-temperature`, async (req, res) => {
    try {
      const lastReading = readings[0];

      if (!lastReading || !lastReading.temperature || !lastReading.windSpeed) {
        res.status(500).json({ error: 'Sensor data unavailable' });
      }
    
      const apparentTemp = calcApparentTemp(lastReading.temperature, lastReading.windSpeed);
    
      res.status(200).json({
        'apparentTemp': apparentTemp,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Internal server error.' });
    }
  })
};
