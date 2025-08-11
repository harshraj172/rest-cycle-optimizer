const express = require('express');
const router = express.Router();
const SleepLog = require('../models/SleepLog');

// Get user's sleep logs
router.get('/:userId', async (req, res) => {
  try {
    const logs = await SleepLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new sleep log
router.post('/', async (req, res) => {
  try {
    const log = new SleepLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sleep log
router.put('/:id', async (req, res) => {
  try {
    const log = await SleepLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sleep log
router.delete('/:id', async (req, res) => {
  try {
    await SleepLog.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;