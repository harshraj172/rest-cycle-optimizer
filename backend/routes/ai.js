const express = require('express');
const router = express.Router();
const SleepLog = require('../models/SleepLog');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache insights for better performance
const insightsCache = new Map();

router.post('/:userId', async (req, res) => {
  try {
    const { quickMode = true } = req.body;
    const cacheKey = `${req.params.userId}-${quickMode}`;
    
    // Check cache (5 minute expiry)
    const cached = insightsCache.get(cacheKey);
    if (cached && cached.timestamp > Date.now() - 5 * 60 * 1000) {
      return res.json({ insights: cached.insights, fromCache: true });
    }
    
    const logs = await SleepLog.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(14);
    
    if (logs.length < 3) {
      return res.json({
        insights: quickMode 
          ? ['Log 3+ nights for insights']
          : 'You need at least 3 nights of sleep data to generate personalized insights.',
        requiresMoreData: true
      });
    }
    
    // Advanced pattern analysis
    const patterns = analyzeAdvancedPatterns(logs);
    
    let insights;
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        const systemPrompt = createSystemPrompt(patterns, quickMode);
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Provide sleep optimization advice." }
          ],
          max_tokens: quickMode ? 100 : 300,
          temperature: 0.7
        });
        
        insights = quickMode 
          ? completion.choices[0].message.content.split('\n').filter(line => line.trim()).slice(0, 3)
          : completion.choices[0].message.content;
          
      } catch (aiError) {
        console.error('OpenAI error:', aiError);
        insights = generateFallbackInsights(patterns, quickMode);
      }
    } else {
      insights = generateFallbackInsights(patterns, quickMode);
    }
    
    // Cache the result
    insightsCache.set(cacheKey, {
      insights,
      timestamp: Date.now()
    });
    
    res.json({ insights, patterns: quickMode ? undefined : patterns });
    
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: error.message });
  }
});

function analyzeAdvancedPatterns(logs) {
  const recent = logs.slice(0, 7);
  const older = logs.slice(7, 14);
  
  const avgSleep = recent.reduce((sum, log) => sum + log.hours, 0) / recent.length;
  const avgQuality = recent.reduce((sum, log) => sum + log.quality, 0) / recent.length;
  const optimalSleep = 7.5;
  const sleepDebt = recent.reduce((debt, log) => debt + Math.max(0, optimalSleep - log.hours), 0);
  
  // Chronotype detection
  const avgMorning = recent.reduce((sum, log) => sum + (log.morningEnergy || 3), 0) / recent.length;
  const avgEvening = recent.reduce((sum, log) => sum + (log.eveningEnergy || 3), 0) / recent.length;
  const chronotype = avgMorning > avgEvening + 0.5 ? 'morning lark' : 
                     avgEvening > avgMorning + 0.5 ? 'night owl' : 'intermediate';
  
  // Consistency calculation
  const sleepStd = Math.sqrt(
    recent.reduce((sum, log) => sum + Math.pow(log.hours - avgSleep, 2), 0) / recent.length
  );
  
  // Trend analysis
  let trend = 'stable';
  if (older.length > 0) {
    const olderAvg = older.reduce((sum, log) => sum + log.hours, 0) / older.length;
    if (avgSleep > olderAvg + 0.5) trend = 'improving';
    else if (avgSleep < olderAvg - 0.5) trend = 'declining';
  }
  
  // Special patterns
  const allNighters = logs.filter(log => log.tags && log.tags.includes('All-nighter')).length;
  const examWeeks = logs.filter(log => log.tags && log.tags.includes('Exam week')).length;
  const avgAfternoonEnergy = recent.reduce((sum, log) => sum + (log.afternoonEnergy || 3), 0) / recent.length;
  
  return {
    avgSleep: avgSleep.toFixed(1),
    avgQuality: avgQuality.toFixed(1),
    sleepDebt: sleepDebt.toFixed(1),
    chronotype,
    consistency: Math.max(0, 100 - sleepStd * 20).toFixed(0),
    trend,
    allNighters,
    examWeeks,
    afternoonCrash: avgAfternoonEnergy < 2.5
  };
}

function createSystemPrompt(patterns, quickMode) {
  return `You are an expert sleep coach for college students.
  
  Student Profile:
  - Chronotype: ${patterns.chronotype}
  - Average sleep: ${patterns.avgSleep} hours
  - Sleep debt: ${patterns.sleepDebt} hours
  - Quality: ${patterns.avgQuality}/5
  - Trend: ${patterns.trend}
  - Consistency: ${patterns.consistency}%
  ${patterns.afternoonCrash ? '- Experiences afternoon energy crashes' : ''}
  ${patterns.allNighters > 0 ? `- Had ${patterns.allNighters} all-nighters recently` : ''}
  
  ${quickMode 
    ? 'Provide exactly 3 actionable tips. Each tip should be one short sentence (max 15 words). Format as bullet points. Be specific and practical for a college student.'
    : 'Provide comprehensive advice in 2-3 paragraphs. Include specific recommendations based on their chronotype and patterns. Explain the science briefly. Be encouraging but realistic about student life constraints.'}`;
}

function generateFallbackInsights(patterns, quickMode) {
  if (quickMode) {
    const tips = [];
    
    // Prioritize based on biggest issues
    if (patterns.sleepDebt > 10) {
      tips.push(`🚨 Critical: Add 1 hour nightly to reduce ${patterns.sleepDebt}h debt`);
    } else if (patterns.sleepDebt > 5) {
      tips.push(`📊 Sleep debt ${patterns.sleepDebt}h - add 30min to bedtime`);
    }
    
    if (patterns.chronotype === 'night owl') {
      tips.push(`🦉 Night owl: Schedule important work after 2 PM`);
    } else if (patterns.chronotype === 'morning lark') {
      tips.push(`🌅 Morning lark: Use 9-11 AM for complex tasks`);
    }
    
    if (patterns.afternoonCrash) {
      tips.push(`⚡ Combat 2 PM crash with 20-minute power nap`);
    }
    
    if (patterns.consistency < 60) {
      tips.push(`⏰ Set fixed bedtime - your sleep varies too much`);
    }
    
    if (patterns.trend === 'improving') {
      tips.push(`📈 Great progress! Sleep improved vs last week`);
    } else if (patterns.trend === 'declining') {
      tips.push(`📉 Sleep declining - check stress and screen time`);
    }
    
    // Always return 3 tips
    while (tips.length < 3) {
      const genericTips = [
        `💡 Your optimal bedtime: ${patterns.chronotype === 'night owl' ? '11:30 PM' : '10:30 PM'}`,
        `💤 Aim for ${patterns.avgSleep < 7 ? '7-8' : '7.5-8.5'} hours consistently`,
        `📱 No screens 30min before bed for better quality`
      ];
      tips.push(genericTips[tips.length]);
    }
    
    return tips.slice(0, 3);
  }
  
  // Detailed mode
  return `Based on your ${patterns.chronotype} chronotype and current patterns, you're averaging ${patterns.avgSleep} hours of sleep with a quality score of ${patterns.avgQuality}/5. 

Your sleep debt of ${patterns.sleepDebt} hours is ${patterns.sleepDebt > 7 ? 'significantly impacting' : 'moderately affecting'} your cognitive performance and energy levels. ${patterns.afternoonCrash ? 'The consistent afternoon energy crashes you experience are directly related to this sleep debt.' : ''}

To optimize your sleep, focus on consistency first. ${patterns.chronotype === 'night owl' ? 'As a night owl, work with your natural rhythm by scheduling demanding tasks for late afternoon and evening when you peak.' : 'As a morning lark, protect your morning hours for your most important work.'} Gradually shift your bedtime by 15 minutes earlier each night until you consistently get 7.5-8 hours. ${patterns.consistency < 70 ? 'Your sleep varies significantly, which disrupts your circadian rhythm. A fixed bedtime, even on weekends, will improve both quality and energy.' : 'Maintain your improving consistency for continued benefits.'}`;
}

module.exports = router;