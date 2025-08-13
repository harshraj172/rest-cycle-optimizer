const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rest-cycle');

const sleepLogRoutes = require('./routes/sleepLogs');
const analysisRoutes = require('./routes/analysis');
const aiRoutes = require('./routes/ai');

app.use('/api/sleep-logs', sleepLogRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai-insights', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});