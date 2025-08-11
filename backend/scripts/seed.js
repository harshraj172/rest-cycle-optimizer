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

// Generate realistic demo data
function generateDemoData() {
  const logs = [];
  const userId = 'demo-user';
  const today = new Date();
  
  // 45 days of realistic college student data
  for (let i = 44; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    let hours, quality, morningEnergy, afternoonEnergy, eveningEnergy, tags = [], notes = '';
    
    // Phase 1: Days 44-30 - Typical irregular student sleep
    if (i >= 30) {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - trying to catch up but not extreme
        hours = 8.0 + Math.random() * 1.5; // 8.5-10 hours
        quality = 3;
        morningEnergy = 2;
        afternoonEnergy = 3;
        eveningEnergy = 4;
        tags = ['Weekend'];
        
        if (dayOfWeek === 0) {
          // Sunday - bit less sleep (homework panic)
          hours = hours - 1;
          if (Math.random() > 0.5) {
            tags.push('Stress');
            notes = 'Sunday scaries - assignments due';
          }
        }
      } else {
        // Weekdays - typical student pattern
        if (dayOfWeek === 1) {
          // Monday - rough start
          hours = 6.0 + Math.random() * 1; // 5.5-6.5 hours
          quality = 2;
          notes = 'Monday blues';
        } else if (dayOfWeek === 2 || dayOfWeek === 4) {
          // Tuesday/Thursday - moderate
          hours = 6 + Math.random() * 1.5; // 6-7.5 hours
          quality = 3;
        } else if (dayOfWeek === 3) {
          // Wednesday - midweek crash
          hours = 5 + Math.random() * 1.5; // 5-6.5 hours
          quality = 2;
        } else {
          // Friday - stayed up late
          hours = 4.5 + Math.random() * 1.5; // 4.5-6 hours
          quality = 2;
          if (Math.random() > 0.5) {
            tags.push('Social');
            notes = 'Friday night with friends';
          }
        }
        
        morningEnergy = 2;
        afternoonEnergy = 1; // Afternoon crash
        eveningEnergy = 4; // Night owl
        
        if (Math.random() > 0.7) {
          tags.push('Caffeine late');
        }
      }
      
      // Occasional bad nights (but not too many)
      if (i === 42) {
        hours = 3.5;
        quality = 1;
        tags = ['Exam week'];
        notes = 'Midterm tomorrow - cramming';
        morningEnergy = 1;
        afternoonEnergy = 1;
        eveningEnergy = 2;
      }
      
      if (i === 38) {
        hours = 4;
        quality = 1;
        tags = ['Stress'];
        notes = 'Project deadline';
      }
      
      if (i === 33) {
        hours = 3;
        quality = 1;
        tags = ['All-nighter'];
        notes = 'CS assignment due at midnight';
        morningEnergy = 1;
        afternoonEnergy = 1;
        eveningEnergy = 1;
      }
    }
    
    // Phase 2: Days 29-15 - Exam period but trying to manage
    else if (i >= 15) {
      // Exam week - stressed but not completely destroyed
      if (i >= 22 && i <= 28) {
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Weekend during exams - studying but getting some sleep
          hours = 7.0 + Math.random() * 1.5; // 6.5-8 hours
          quality = 3;
          tags = ['Exam week', 'Weekend'];
        } else {
          // Weekday exams
          hours = 5 + Math.random() * 2; // 5-7 hours
          quality = 2;
          tags = ['Exam week'];
          
          if (Math.random() > 0.6) {
            tags.push('Stress');
          }
        }
        
        // One more all-nighter during exam week
        if (i === 25) {
          hours = 2.5;
          quality = 1;
          tags = ['All-nighter', 'Exam week'];
          notes = 'Finals crunch - algorithms exam';
          morningEnergy = 1;
          afternoonEnergy = 1;
          eveningEnergy = 1;
        } else {
          morningEnergy = 2;
          afternoonEnergy = 2;
          eveningEnergy = 3;
        }
        
        if (Math.random() > 0.5) {
          tags.push('Caffeine late');
        }
      } else {
        // Post-exam recovery
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          hours = 8 + Math.random() * 1.5; // 8-9.5 hours
          quality = 3;
          tags = ['Weekend'];
          
          if (i === 20) {
            notes = 'Finally recovering from exams';
          }
        } else {
          hours = 7.0 + Math.random() * 1.5; // 6.5-8 hours
          quality = 3;
        }
        
        morningEnergy = 3;
        afternoonEnergy = 2;
        eveningEnergy = 4;
        
        // Starting to exercise
        if ((dayOfWeek === 1 || dayOfWeek === 3) && Math.random() > 0.5) {
          tags.push('Exercise');
          quality = Math.min(4, quality + 1);
        }
      }
    }
    
    // Phase 3: Days 14-0 - Using the app, realistic improvement
    else {
      // Gradual, realistic improvement
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekends - more consistent
        if (i > 7) {
          hours = 8 + Math.random() * 1; // 8-9 hours
        } else {
          // Last week - really good consistency
          hours = 6.5 + Math.random() * 0.5; // 7.5-8 hours
        }
        quality = 4;
        
        if (dayOfWeek === 0 && Math.random() > 0.5) {
          tags.push('Weekend');
        }
      } else {
        // Weekdays - getting better
        if (i > 7) {
          // Week 2 of improvement
          hours = 7.5 + Math.random() * 1; // 6.5-7.5 hours
          quality = 3;
        } else {
          // Last week - consistent
          hours = 7 + Math.random() * 0.5; // 7-7.5 hours
          quality = 4;
          
          // Still some variation
          if (dayOfWeek === 1) {
            hours = hours - 0.5; // Mondays still harder
          }
          if (dayOfWeek === 5) {
            hours = hours - 0.5; // Friday nights
            if (Math.random() > 0.5) {
              tags.push('Social');
            }
          }
        }
      }
      
      // Energy improving gradually
      if (i > 7) {
        morningEnergy = 3;
        afternoonEnergy = 2;
        eveningEnergy = 4;
      } else {
        // Last week - better energy
        morningEnergy = 3 + Math.round(Math.random());
        afternoonEnergy = 3;
        eveningEnergy = 4;
      }
      
      // Regular exercise
      if ((dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) && i < 10) {
        tags.push('Exercise');
        quality = Math.min(5, quality + 1);
        morningEnergy = Math.min(4, morningEnergy + 1);
      }
      
      // Milestone moments
      if (i === 10) {
        notes = 'Starting to feel the difference';
      }
      
      if (i === 7) {
        afternoonEnergy = 4;
        notes = 'Power nap trick is amazing! No more 2pm crash';
      }
      
      if (i === 3) {
        hours = 7.5;
        quality = 5;
        notes = 'Consistent sleep schedule working!';
        morningEnergy = 4;
        afternoonEnergy = 4;
        eveningEnergy = 4;
      }
      
      if (i === 1) {
        hours = 7.5;
        quality = 4;
        notes = 'Sleep debt under control finally';
      }
      
      if (i === 0) {
        hours = 6;
        quality = 4;
        notes = 'Demo day prep!';
        tags.push('Stress');
      }
    }
    
    // Maintain night owl pattern throughout
    if (morningEnergy > eveningEnergy) {
      const temp = morningEnergy;
      morningEnergy = Math.max(1, eveningEnergy - 1);
      eveningEnergy = temp;
    }
    
    // Round and bound values
    hours = Math.round(hours * 2) / 2;
    hours = Math.max(2, Math.min(11, hours));
    
    morningEnergy = Math.max(1, Math.min(5, Math.round(morningEnergy)));
    afternoonEnergy = Math.max(1, Math.min(5, Math.round(afternoonEnergy)));
    eveningEnergy = Math.max(1, Math.min(5, Math.round(eveningEnergy)));
    
    logs.push({
      userId,
      date,
      hours,
      quality,
      morningEnergy,
      afternoonEnergy,
      eveningEnergy,
      tags,
      notes,
      timestamp: new Date(date.getTime() + 8 * 60 * 60 * 1000)
    });
  }
  
  return logs;
}

async function seedDemoData() {
  try {
    console.log('🌙 Rest Cycle Optimizer - Realistic Demo Data');
    console.log('=============================================\n');
    
    // Clear existing data
    await SleepLog.deleteMany({ userId: 'demo-user' });
    
    // Generate and insert new data
    const logs = generateDemoData();
    await SleepLog.insertMany(logs);
    
    // Calculate realistic statistics
    const recentWeek = logs.slice(-7);
    const firstWeek = logs.slice(0, 7);
    const examWeek = logs.slice(19, 26);
    
    const calculateStats = (weekLogs) => {
      const avgSleep = weekLogs.reduce((sum, log) => sum + log.hours, 0) / 7;
      const avgQuality = weekLogs.reduce((sum, log) => sum + log.quality, 0) / 7;
      const optimalSleep = 7.5;
      const debt = weekLogs.reduce((total, log) => 
        total + Math.max(0, optimalSleep - log.hours), 0);
      return { avgSleep, avgQuality, debt };
    };
    
    const firstStats = calculateStats(firstWeek);
    const examStats = calculateStats(examWeek);
    const recentStats = calculateStats(recentWeek);
    
    // Count events
    const allNighters = logs.filter(log => log.tags.includes('All-nighter')).length;
    const examDays = logs.filter(log => log.tags.includes('Exam week')).length;
    const exerciseDays = logs.filter(log => log.tags.includes('Exercise')).length;
    
    console.log('✅ Realistic demo data created!\n');
    
    console.log('📊 45-Day Sleep Journey:\n');
    
    console.log('WEEK 1 (Baseline - Typical Student):');
    console.log(`  💤 Average: ${firstStats.avgSleep.toFixed(1)}h/night`);
    console.log(`  ⭐ Quality: ${firstStats.avgQuality.toFixed(1)}/5`);
    console.log(`  📊 Weekly debt: ${firstStats.debt.toFixed(1)}h`);
    console.log(`  💭 "Normal college chaos"\n`);
    
    console.log('WEEK 4 (Exam Period):');
    console.log(`  💤 Average: ${examStats.avgSleep.toFixed(1)}h/night`);
    console.log(`  ⭐ Quality: ${examStats.avgQuality.toFixed(1)}/5`);
    console.log(`  📊 Weekly debt: ${examStats.debt.toFixed(1)}h`);
    console.log(`  💭 "Struggling but surviving"\n`);
    
    console.log('CURRENT WEEK (With App):');
    console.log(`  💤 Average: ${recentStats.avgSleep.toFixed(1)}h/night`);
    console.log(`  ⭐ Quality: ${recentStats.avgQuality.toFixed(1)}/5`);
    console.log(`  📊 Weekly debt: ${recentStats.debt.toFixed(1)}h`);
    console.log(`  💭 "Actually feeling rested!"\n`);
    
    console.log('📈 Improvement Metrics:');
    console.log(`  ✅ Sleep increase: +${(recentStats.avgSleep - firstStats.avgSleep).toFixed(1)}h/night`);
    console.log(`  ✅ Quality boost: +${(recentStats.avgQuality - firstStats.avgQuality).toFixed(1)} stars`);
    console.log(`  ✅ Debt reduction: -${(firstStats.debt - recentStats.debt).toFixed(1)}h/week\n`);
    
    console.log('🎯 Demo Features:');
    console.log(`  • ${allNighters} all-nighters (realistic for 45 days)`);
    console.log(`  • ${examDays} exam period days`);
    console.log(`  • ${exerciseDays} exercise sessions`);
    console.log(`  • Night owl pattern (evening > morning energy)`);
    console.log(`  • Afternoon energy crashes → improvement`);
    console.log(`  • Weekend oversleep → better consistency\n`);
    
    console.log('📝 Key Talking Points:');
    console.log('  1. "Started with typical 6-hour average"');
    console.log('  2. "All-nighters dropped my quality for days"');
    console.log('  3. "Power naps fixed my 2 PM crashes"');
    console.log('  4. "Consistency matters more than total hours"');
    console.log('  5. "Sleep debt is now manageable"\n');
    
    console.log('🎬 Ready for demo presentation!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDemoData();