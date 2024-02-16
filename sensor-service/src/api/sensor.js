let readings = [];

module.exports = (app) => {
  app.post('/reading', async (req, res, next) => {
    const { temperature, relativeHumidity, windSpeed } = req.body;

    if (!temperature || !relativeHumidity || !windSpeed) {
      return res.status(400).json({ error: 'Received incomplete data.' });
    }

    const timestamp = new Date();

    readings.unshift({
      temperature,
      relativeHumidity,
      windSpeed,
      timestamp,
    });

    res.status(200).json({ message: `Data from sensors successfully received at ${timestamp}.` });
  });

  app.delete('/readings', async (req, res, next) => {
    readings = [];
    res.sendStatus(200);
  });

  app.get('/readings', async (req, res, next) => {
    if (!readings.length)
      res.status(204).send({});
    else
      res.status(200).json(readings);
  });

  app.get('/last-reading', async (req, res, next) => {
    if (!readings.length)
      res.status(204).send({});
    else
      res.status(200).json(readings[0]);
  });
};