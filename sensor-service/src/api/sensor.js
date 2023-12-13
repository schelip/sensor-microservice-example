let sensorData = {
  temperature: null,
  relativeHumidity: null,
  windSpeed: null,
};

module.exports = (app) => {
  app.post('/sensors', async (req, res, next) => {
    const { temperature, relativeHumidity, windSpeed } = req.body;

    if (!temperature || !relativeHumidity || !windSpeed) {
      return res.status(400).json({ error: 'Received incomplete data.' });
    }

    sensorData = {
      temperature,
      relativeHumidity,
      windSpeed,
    };

    res.status(200).json({ message: 'Data from sensors successfully received.' });
  });

  app.get('/last-reading', async (req, res, next) => {
    res.status(200).json(sensorData);
  });
};