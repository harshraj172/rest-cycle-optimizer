const mongoose = require('mongoose');

const sleepLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0, max: 24 },
  quality: { type: Number, required: true, min: 1, max: 5 },
  morningEnergy: { type: Number, default: 3, min: 1, max: 5 },
  afternoonEnergy: { type: Number, default: 3, min: 1, max: 5 },
  eveningEnergy: { type: Number, default: 3, min: 1, max: 5 },
  tags: [String],
  notes: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SleepLog', sleepLogSchema);