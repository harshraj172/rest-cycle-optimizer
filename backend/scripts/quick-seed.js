const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rest-cycle');

const sleepLogSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  hours: Number,
  quality: Number,
  morningEnergy: Number,
  afternoonEnergy: Number,
  eveningEnergy: Number,
  tags: [String],
  notes: String,
  timestamp: Date
});

const SleepLog = mongoose.model('SleepLog', sleepLogSchema);

// Quick 14 days of recent data for immediate demo
const quickSeedData = [
  // Week 1 - Inconsistent
  { days: 13, hours: 5.5, quality: 2, tags: ['Exam week'], morning: 2, afternoon: 1, evening: 3 },
  { days: 12, hours: 9, quality: 3, tags: ['Weekend'], morning: 4, afternoon: 3, evening: 3 },
  { days: 11, hours: 6, quality: 3, tags: [], morning: 3, afternoon: 2, evening: 3 },
  { days: 10, hours: 4, quality: 2, tags: ['All-nighter', 'Exam week'], morning: 1, afternoon: 1, evening: 2 },
  { days: 9, hours: 10, quality: 4, tags: ['Weekend'], morning: 4, afternoon: 3, evening: 4 },
  { days: 8, hours: 6.5, quality: 3, tags: [], morning: 3, afternoon: 2, evening: 4 },
  { days: 7, hours: 7, quality: 3, tags: ['Exercise'], morning: 3, afternoon: 3, evening: 3 },
  
  // Week 2 - Improving
  { days: 6, hours: 7.5, quality: 4, tags: ['Exercise'], morning: 4, afternoon: 3, evening: 4 },
  { days: 5, hours: 7, quality: 4, tags: [], morning: 4, afternoon: 2, evening: 4, notes: 'Tried consistent bedtime' },
  { days: 4, hours: 7.5, quality: 4, tags: ['Exercise'], morning: 4, afternoon: 3, evening: 4 },
  { days: 3, hours: 8, quality: 5, tags: [], morning: 5, afternoon: 4, evening: 4, notes: 'Best sleep this week!' },
  { days: 2, hours: 7, quality: 4, tags: [], morning: 4, afternoon: 3, evening: 4 },
  { days: 1, hours: 7.5, quality: 4, tags: ['Exercise'], morning: 4, afternoon: 4, evening: 3, notes: 'Power nap helped!' },
  { days: 0, hours: 7.5, quality: 5, tags: [], morning: 5, afternoon: 4, evening: 4, notes: 'Feeling great!' }
];

async function quickSeed() {
  try {
    console.log('🚀 Quick seeding for demo...');
    
    await SleepLog.deleteMany({ userId: 'demo-user' });
    
    const logs = quickSeedData.map(data => {
      const date = new Date();
      date.setDate(date.getDate() - data.days);
      date.setHours(0, 0, 0, 0);
      
      return {
        userId: 'demo-user',
        date,
        hours: data.hours,
        quality: data.quality,
        morningEnergy: data.morning,
        afternoonEnergy: data.afternoon,
        eveningEnergy: data.evening,
        tags: data.tags,
        notes: data.notes || '',
        timestamp: new Date()
      };
    });
    
    await SleepLog.insertMany(logs);
    
    console.log('✅ Quick seed complete! 14 days of data added.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

quickSeed();