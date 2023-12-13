let sensorReading = {
  temperature: null,
  relativeHumidity: null,
  windSpeed: null,
  timestamp: null
};

module.exports = (app) => {
  app.post('/sensor-reading', async (req, res, next) => {
    const { temperature, relativeHumidity, windSpeed } = req.body;

    if (!temperature || !relativeHumidity || !windSpeed) {
      return res.status(400).json({ error: 'Received incomplete data.' });
    }

    const timestamp = new Date();

    sensorReading = {
      temperature,
      relativeHumidity,
      windSpeed,
      timestamp
    };

    res.status(200).json({ message: `Data from sensors successfully received at ${timestamp}.` });
  });

  app.get('/last-reading', async (req, res, next) => {
    res.status(200).json(sensorReading);
  });
};