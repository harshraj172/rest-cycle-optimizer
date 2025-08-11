class SleepAnalyzer {
  static analyze(logs) {
    if (!logs || logs.length === 0) {
      return {
        avgSleep: 0,
        avgQuality: 0,
        sleepDebt: 0,
        efficiency: 0,
        consistency: 0,
        chronotype: 'unknown'
      };
    }
    
    const recentLogs = logs.slice(0, 7);
    const avgSleep = recentLogs.reduce((sum, log) => sum + log.hours, 0) / recentLogs.length;
    const avgQuality = recentLogs.reduce((sum, log) => sum + log.quality, 0) / recentLogs.length;
    
    // Calculate sleep debt
    const optimalSleep = 7.5;
    const sleepDebt = recentLogs.reduce((debt, log) => 
      debt + Math.max(0, optimalSleep - log.hours), 0);
    
    // Calculate consistency
    const sleepValues = recentLogs.map(log => log.hours);
    const mean = sleepValues.reduce((a, b) => a + b) / sleepValues.length;
    const variance = sleepValues.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0) / sleepValues.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (stdDev * 20));
    
    // Calculate efficiency
    const efficiency = Math.min(100, (avgQuality / 5) * 60 + (avgSleep / optimalSleep) * 40);
    
    // Detect chronotype
    const avgMorningEnergy = recentLogs.reduce((sum, log) => 
      sum + (log.morningEnergy || 3), 0) / recentLogs.length;
    const avgEveningEnergy = recentLogs.reduce((sum, log) => 
      sum + (log.eveningEnergy || 3), 0) / recentLogs.length;
    
    let chronotype = 'intermediate';
    if (avgMorningEnergy > avgEveningEnergy + 0.5) {
      chronotype = 'morning lark';
    } else if (avgEveningEnergy > avgMorningEnergy + 0.5) {
      chronotype = 'night owl';
    }
    
    return {
      avgSleep,
      avgQuality,
      sleepDebt,
      efficiency,
      consistency,
      chronotype,
      recommendations: this.generateRecommendations({
        sleepDebt,
        consistency,
        chronotype,
        avgSleep
      })
    };
  }
  
  static generateRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.sleepDebt > 10) {
      recommendations.push('Priority: Add 1 hour to your sleep for the next week');
    } else if (analysis.sleepDebt > 5) {
      recommendations.push('Add 30 minutes to your sleep schedule');
    }
    
    if (analysis.consistency < 60) {
      recommendations.push('Set a fixed bedtime to improve consistency');
    }
    
    if (analysis.chronotype === 'night owl') {
      recommendations.push('Schedule important tasks after 2 PM when you peak');
    } else if (analysis.chronotype === 'morning lark') {
      recommendations.push('Use morning hours (9-11 AM) for complex work');
    }
    
    return recommendations;
  }
}

module.exports = { SleepAnalyzer };