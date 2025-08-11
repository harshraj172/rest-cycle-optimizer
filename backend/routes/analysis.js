const express = require('express');
const router = express.Router();
const SleepLog = require('../models/SleepLog');
const { SleepAnalyzer } = require('../utils/sleepAnalyzer');

router.get('/:userId', async (req, res) => {
  try {
    const logs = await SleepLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(30);
    
    if (logs.length === 0) {
      return res.json({ message: 'No sleep data available' });
    }
    
    const analysis = SleepAnalyzer.analyze(logs);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;