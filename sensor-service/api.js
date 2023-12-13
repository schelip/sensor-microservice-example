const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let sensorData = {
  temperature: null,
  relativeHumidity: null,
  windSpeed: null,
};

app.post('/sensors', (req, res) => {
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

app.get('/last-reading', (req, res) => {
  res.status(200).json(sensorData);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
