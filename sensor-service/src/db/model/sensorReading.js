const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  temperature: {
    type: Number,
    required: true,
  },
  relativeHumidity: {
    type: Number,
    required: true,
  },
  windSpeed: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);