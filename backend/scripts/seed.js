const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rest-cycle', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sleep Log Schema (duplicate from models)
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

// Generate realistic sleep data for a college student
function generateSleepData() {
  const logs = [];
  const userId = 'demo-user';
  const today = new Date();
  
  // Generate 60 days of data
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const weekNumber = Math.floor(i / 7);
    
    // Base sleep patterns
    let hours = 7;
    let quality = 3;
    let morningEnergy = 3;
    let afternoonEnergy = 3;
    let eveningEnergy = 3;
    let tags = [];
    let notes = '';
    
    // Simulate different scenarios
    
    // Week 8-7: Irregular sleep (beginning of semester)
    if (weekNumber >= 7) {
      hours = 5 + Math.random() * 4; // 5-9 hours
      quality = Math.floor(2 + Math.random() * 2); // 2-3 quality
      morningEnergy = 2;
      afternoonEnergy = 2;
      eveningEnergy = 3;
      
      if (Math.random() > 0.7) {
        tags.push('Stress');
      }
    }
    
    // Week 6: First exam week
    else if (weekNumber === 6) {
      hours = 4 + Math.random() * 3; // 4-7 hours
      quality = Math.floor(2 + Math.random() * 2); // 2-3 quality
      morningEnergy = 2;
      afternoonEnergy = 1;
      eveningEnergy = 2;
      tags.push('Exam week');
      
      // Simulate an all-nighter
      if (i === 42) {
        hours = 2;
        quality = 1;
        tags.push('All-nighter');
        notes = 'Studied all night for algorithms exam';
      }
      
      if (Math.random() > 0.5) {
        tags.push('Caffeine late');
      }
    }
    
    // Week 5: Recovery week
    else if (weekNumber === 5) {
      hours = 8 + Math.random() * 2; // 8-10 hours (catching up)
      quality = Math.floor(3 + Math.random() * 2); // 3-4 quality
      morningEnergy = 3;
      afternoonEnergy = 3;
      eveningEnergy = 4;
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        hours = 9 + Math.random() * 2; // Weekend oversleep
      }
    }
    
    // Week 4-3: Getting better
    else if (weekNumber >= 3) {
      hours = 6.5 + Math.random() * 2; // 6.5-8.5 hours
      quality = Math.floor(3 + Math.random() * 2); // 3-4 quality
      morningEnergy = 3;
      afternoonEnergy = 2; // Still afternoon crashes
      eveningEnergy = 4;
      
      // Weekend pattern
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        hours = 8 + Math.random() * 2; // Weekend oversleep
        quality = 4;
        tags.push('Weekend');
      }
      
      // Exercise days
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        tags.push('Exercise');
        quality = Math.min(5, quality + 1);
        eveningEnergy = 3; // More tired in evening after exercise
      }
    }
    
    // Week 2: Midterm week
    else if (weekNumber === 2) {
      hours = 5 + Math.random() * 2; // 5-7 hours
      quality = Math.floor(2 + Math.random() * 2); // 2-3 quality
      morningEnergy = 2;
      afternoonEnergy = 2;
      eveningEnergy = 3;
      tags.push('Exam week');
      
      // Another all-nighter
      if (i === 14) {
        hours = 3;
        quality = 1;
        tags.push('All-nighter');
        notes = 'HCI project due tomorrow';
      }
      
      if (Math.random() > 0.6) {
        tags.push('Stress');
      }
    }
    
    // Week 1-0: Optimized sleep (after using the app!)
    else {
      // Showing improvement - more consistent sleep
      hours = 7 + Math.random() * 1; // 7-8 hours
      quality = Math.floor(4 + Math.random() * 2); // 4-5 quality
      morningEnergy = 4;
      afternoonEnergy = 3; // Still some afternoon dips
      eveningEnergy = 4;
      
      // Maintain consistency even on weekends (social jetlag reduction)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        hours = 7.5 + Math.random() * 1; // Only slightly more on weekends
        quality = 5;
      }
      
      // Regular exercise
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        tags.push('Exercise');
        quality = 5;
        morningEnergy = 5;
      }
      
      // Occasional stress but better managed
      if (Math.random() > 0.85) {
        tags.push('Stress');
        quality = Math.max(3, quality - 1);
      }
    }
    
    // Night owl pattern (lower morning energy, higher evening)
    if (i > 30) {
      // First month: clear night owl
      morningEnergy = Math.max(1, morningEnergy - 1);
      eveningEnergy = Math.min(5, eveningEnergy + 1);
    } else {
      // After using app: slightly adjusted but still night owl tendency
      eveningEnergy = Math.max(morningEnergy, eveningEnergy);
    }
    
    // Random adjustments for realism
    hours = Math.round(hours * 2) / 2; // Round to nearest 0.5
    hours = Math.max(2, Math.min(12, hours)); // Clamp between 2-12
    
    // Special cases for demo
    if (i === 7) {
      notes = 'Tried the 20-min power nap suggestion - actually helped!';
      afternoonEnergy = 4;
    }
    
    if (i === 3) {
      notes = 'Best sleep quality this month! Consistent bedtime working';
      quality = 5;
      hours = 7.5;
    }
    
    if (i === 1) {
      tags.push('Sick');
      hours = 9;
      quality = 2;
      notes = 'Feeling under the weather';
      morningEnergy = 2;
      afternoonEnergy = 2;
      eveningEnergy = 2;
    }
    
    logs.push({
      userId,
      date,
      hours,
      quality,
      morningEnergy,
      afternoonEnergy,
      eveningEnergy,
      tags: tags.length > 0 ? tags : [],
      notes,
      timestamp: new Date(date.getTime() + 8 * 60 * 60 * 1000) // Logged at 8 AM
    });
  }
  
  return logs;
}

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  userId: String,
  email: String,
  name: String,
  chronotype: String,
  targetSleepHours: Number,
  targetQuality: Number,
  createdAt: Date,
  preferences: {
    darkMode: Boolean,
    quickInsights: Boolean,
    notifications: Boolean
  }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

async function seedDatabase() {
  try {
    console.log('🌙 Rest Cycle Optimizer - Seeding Database');
    console.log('=========================================');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await SleepLog.deleteMany({ userId: 'demo-user' });
    await UserProfile.deleteMany({ userId: 'demo-user' });
    
    // Create user profile
    console.log('Creating user profile...');
    const userProfile = new UserProfile({
      userId: 'demo-user',
      email: 'student@northeastern.edu',
      name: 'Demo Student',
      chronotype: 'night owl',
      targetSleepHours: 7.5,
      targetQuality: 4,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      preferences: {
        darkMode: false,
        quickInsights: true,
        notifications: true
      }
    });
    await userProfile.save();
    
    // Generate and insert sleep logs
    console.log('Generating 60 days of sleep data...');
    const sleepLogs = generateSleepData();
    
    console.log('Inserting sleep logs...');
    await SleepLog.insertMany(sleepLogs);
    
    // Calculate some statistics for display
    const lastWeek = sleepLogs.slice(-7);
    const avgSleep = lastWeek.reduce((sum, log) => sum + log.hours, 0) / 7;
    const avgQuality = lastWeek.reduce((sum, log) => sum + log.quality, 0) / 7;
    
    const firstWeek = sleepLogs.slice(0, 7);
    const initialAvgSleep = firstWeek.reduce((sum, log) => sum + log.hours, 0) / 7;
    const initialAvgQuality = firstWeek.reduce((sum, log) => sum + log.quality, 0) / 7;
    
    console.log('\n✅ Seeding completed successfully!');
    console.log('=====================================');
    console.log('\n📊 Data Summary:');
    console.log(`- Total logs created: ${sleepLogs.length} days`);
    console.log(`- Date range: ${sleepLogs[0].date.toLocaleDateString()} to ${sleepLogs[sleepLogs.length-1].date.toLocaleDateString()}`);
    console.log('\n📈 Sleep Improvement (App Impact):');
    console.log(`- Initial avg sleep: ${initialAvgSleep.toFixed(1)}h → Current: ${avgSleep.toFixed(1)}h`);
    console.log(`- Initial avg quality: ${initialAvgQuality.toFixed(1)}/5 → Current: ${avgQuality.toFixed(1)}/5`);
    console.log(`- Improvement: +${(avgSleep - initialAvgSleep).toFixed(1)}h sleep, +${(avgQuality - initialAvgQuality).toFixed(1)} quality`);
    
    console.log('\n🎯 Special Events in Data:');
    console.log('- 2 all-nighters (days 42 and 14)');
    console.log('- 2 exam weeks');
    console.log('- Clear weekend oversleep pattern (early data)');
    console.log('- Improved consistency in recent weeks');
    console.log('- Night owl chronotype visible in energy patterns');
    
    console.log('\n🚀 Ready for demo!');
    console.log('Start the app and login as "demo-user"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();