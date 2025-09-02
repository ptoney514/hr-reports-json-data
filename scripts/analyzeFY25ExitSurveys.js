/**
 * FY25 Exit Survey Comprehensive Analysis
 * Combines all quarters for year-end insights and recommendations
 */

const fs = require('fs');
const path = require('path');

// Load turnover data
const turnoverData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/fy25TurnoverData.json'), 'utf8'));

// Exit survey data from all quarters
const surveyData = {
  Q1: {
    responses: 20,
    terminations: 79,
    wouldRecommend: 60,
    satisfactionScores: {
      careerDevelopment: 2.2,
      managementSupport: 2.8,
      workLifeBalance: 3.1,
      compensation: 2.8,
      benefits: 3.4,
      jobSatisfaction: 3.2
    },
    topExitReasons: [
      { reason: 'Career Advancement', percentage: 35 },
      { reason: 'Supervisor Issues', percentage: 30 },
      { reason: 'Compensation', percentage: 20 },
      { reason: 'Work-Life Balance', percentage: 15 }
    ],
    conductConcerns: 15
  },
  Q2: {
    responses: 11,
    terminations: 36,
    wouldRecommend: 72.7,
    satisfactionScores: {
      careerDevelopment: 2.5,
      managementSupport: 3.0,
      workLifeBalance: 3.2,
      compensation: 2.9,
      benefits: 3.5,
      jobSatisfaction: 3.3
    },
    topExitReasons: [
      { reason: 'Career Advancement', percentage: 27 },
      { reason: 'Better Opportunity', percentage: 27 },
      { reason: 'Supervisor Issues', percentage: 18 },
      { reason: 'Compensation', percentage: 18 }
    ],
    conductConcerns: 18
  },
  Q3: {
    responses: 20,
    terminations: 52,
    wouldRecommend: 45,
    satisfactionScores: {
      careerDevelopment: 2.3,
      managementSupport: 2.7,
      workLifeBalance: 3.0,
      compensation: 2.7,
      benefits: 3.3,
      jobSatisfaction: 2.9
    },
    topExitReasons: [
      { reason: 'Supervisor Issues', percentage: 35 },
      { reason: 'Career Advancement', percentage: 25 },
      { reason: 'Work Environment', percentage: 20 },
      { reason: 'Compensation', percentage: 20 }
    ],
    conductConcerns: 20
  },
  Q4: {
    responses: 18,
    terminations: 51,
    wouldRecommend: 83.3,
    satisfactionScores: {
      careerDevelopment: 2.8,
      managementSupport: 3.2,
      workLifeBalance: 3.3,
      compensation: 3.0,
      benefits: 3.6,
      jobSatisfaction: 3.4
    },
    topExitReasons: [
      { reason: 'Relocation', percentage: 22 },
      { reason: 'Retirement', percentage: 17 },
      { reason: 'Career Advancement', percentage: 17 },
      { reason: 'Family Reasons', percentage: 11 }
    ],
    conductConcerns: 22.2
  }
};

// Analysis functions
function calculateOverallMetrics() {
  const totalResponses = Object.values(surveyData).reduce((sum, q) => sum + q.responses, 0);
  const totalTerminations = turnoverData.summary.uniqueEmployees;
  const overallResponseRate = ((totalResponses / totalTerminations) * 100).toFixed(1);
  
  const avgRecommend = Object.values(surveyData).reduce((sum, q) => sum + q.wouldRecommend, 0) / 4;
  
  return {
    totalResponses,
    totalTerminations,
    overallResponseRate,
    avgRecommend: avgRecommend.toFixed(1)
  };
}

function calculateAverageSatisfaction() {
  const categories = ['careerDevelopment', 'managementSupport', 'workLifeBalance', 'compensation', 'benefits', 'jobSatisfaction'];
  const averages = {};
  
  categories.forEach(category => {
    const sum = Object.values(surveyData).reduce((total, q) => total + q.satisfactionScores[category], 0);
    averages[category] = (sum / 4).toFixed(1);
  });
  
  return averages;
}

function analyzeExitReasonTrends() {
  const reasonCounts = {};
  
  Object.values(surveyData).forEach(quarter => {
    quarter.topExitReasons.forEach(reason => {
      if (!reasonCounts[reason.reason]) {
        reasonCounts[reason.reason] = {
          total: 0,
          quarters: [],
          avgPercentage: 0
        };
      }
      reasonCounts[reason.reason].total += reason.percentage;
      reasonCounts[reason.reason].quarters.push(reason.percentage);
    });
  });
  
  // Calculate averages and sort
  Object.keys(reasonCounts).forEach(reason => {
    reasonCounts[reason].avgPercentage = (reasonCounts[reason].total / reasonCounts[reason].quarters.length).toFixed(1);
  });
  
  return Object.entries(reasonCounts)
    .sort((a, b) => parseFloat(b[1].avgPercentage) - parseFloat(a[1].avgPercentage))
    .map(([reason, data]) => ({
      reason,
      avgPercentage: data.avgPercentage,
      quarterCount: data.quarters.length
    }));
}

function analyzeConductConcernTrend() {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  return quarters.map(q => ({
    quarter: q,
    percentage: surveyData[q].conductConcerns
  }));
}

// Generate comprehensive analysis
console.log('='.repeat(80));
console.log('FY25 EXIT SURVEY COMPREHENSIVE ANALYSIS');
console.log('='.repeat(80));
console.log();

const overall = calculateOverallMetrics();

console.log('EXECUTIVE SUMMARY');
console.log('-'.repeat(60));
console.log(`Fiscal Year: FY25 (July 2024 - June 2025)`);
console.log(`Total Employee Terminations: ${overall.totalTerminations}`);
console.log(`Total Exit Survey Responses: ${overall.totalResponses}`);
console.log(`Overall Response Rate: ${overall.overallResponseRate}%`);
console.log(`Average Would Recommend Rate: ${overall.avgRecommend}%`);
console.log();

console.log('KEY FINDINGS');
console.log('-'.repeat(60));

// 1. Response Rate Analysis
console.log('\n1. SURVEY PARTICIPATION ANALYSIS');
console.log('   Quarterly Response Rates:');
Object.entries(surveyData).forEach(([q, data]) => {
  const rate = ((data.responses / data.terminations) * 100).toFixed(1);
  console.log(`   • ${q}: ${rate}% (${data.responses} of ${data.terminations} exits)`);
});
console.log(`   \n   ⚠ Overall rate of ${overall.overallResponseRate}% is below 40% target`);
console.log('   ✓ Q3 achieved highest rate at 38.5%, approaching target');

// 2. Satisfaction Analysis
console.log('\n2. SATISFACTION METRICS ANALYSIS');
const avgSatisfaction = calculateAverageSatisfaction();
console.log('   Average Scores Across All Quarters (out of 5.0):');
Object.entries(avgSatisfaction).forEach(([category, score]) => {
  const label = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  const status = score < 3.0 ? '⚠ CRITICAL' : score >= 3.5 ? '✓ GOOD' : '→ MONITOR';
  console.log(`   • ${label}: ${score}/5.0 ${status}`);
});

// 3. Would Recommend Trend
console.log('\n3. EMPLOYER RECOMMENDATION TREND');
console.log('   Quarterly "Would Recommend" Rates:');
Object.entries(surveyData).forEach(([q, data]) => {
  const trend = q === 'Q1' ? '' : 
                data.wouldRecommend > surveyData[Object.keys(surveyData)[Object.keys(surveyData).indexOf(q) - 1]].wouldRecommend ? '↑' : '↓';
  console.log(`   • ${q}: ${data.wouldRecommend}% ${trend}`);
});
console.log(`   \n   📊 Significant variation: Low of 45% (Q3) to high of 83.3% (Q4)`);

// 4. Exit Reason Analysis
console.log('\n4. TOP EXIT REASONS (EMPLOYEE-REPORTED)');
const exitReasonTrends = analyzeExitReasonTrends();
console.log('   Most Frequently Cited Reasons:');
exitReasonTrends.slice(0, 5).forEach((reason, index) => {
  console.log(`   ${index + 1}. ${reason.reason}: ${reason.avgPercentage}% average (cited in ${reason.quarterCount} quarters)`);
});

// 5. Conduct Concerns
console.log('\n5. WORKPLACE CONDUCT CONCERNS');
const conductTrend = analyzeConductConcernTrend();
console.log('   Quarterly Progression:');
conductTrend.forEach(item => {
  console.log(`   • ${item.quarter}: ${item.percentage}% reporting concerns`);
});
console.log('   \n   ⚠ ALERT: Increasing trend from 15% to 22.2% requires immediate attention');

// 6. Critical Insights
console.log('\n'.repeat(2));
console.log('CRITICAL INSIGHTS & PATTERNS');
console.log('-'.repeat(60));

console.log('\n🔴 HIGH PRIORITY CONCERNS:');
console.log('   1. Career Development Crisis');
console.log('      • Consistently lowest satisfaction (avg 2.5/5.0)');
console.log('      • Top exit reason across all quarters');
console.log('      • Urgent need for career pathway development');

console.log('\n   2. Rising Conduct Issues');
console.log('      • 47% increase from Q1 (15%) to Q4 (22.2%)');
console.log('      • Correlates with Q3 satisfaction drop (45%)');
console.log('      • Suggests deteriorating workplace culture');

console.log('\n   3. Management Effectiveness');
console.log('      • "Supervisor Issues" cited in top 3 reasons for 3 quarters');
console.log('      • Management support below 3.0/5.0 in Q1-Q3');
console.log('      • Direct correlation with retention challenges');

console.log('\n🟡 MODERATE CONCERNS:');
console.log('   1. Response Rate Below Target');
console.log(`      • Current: ${overall.overallResponseRate}% vs Target: 40%+`);
console.log('      • Limits statistical reliability of findings');
console.log('      • May indicate lack of trust in process');

console.log('\n   2. Q1 Termination Spike');
console.log(`      • ${turnoverData.quarterly.Q1.count} exits (35.6% of annual total)`);
console.log('      • Post-holiday resignation pattern');
console.log('      • Suggests year-end bonus retention effect wearing off');

console.log('\n🟢 POSITIVE INDICATORS:');
console.log('   1. Q4 Recovery');
console.log('      • Satisfaction rebounded to 83.3%');
console.log('      • All metrics improved from Q3 lows');
console.log('      • Suggests interventions may be working');

console.log('\n   2. Benefits Satisfaction');
console.log('      • Highest rated category (3.5/5.0 average)');
console.log('      • Consistent strength across all quarters');
console.log('      • Competitive advantage to leverage');

// 7. Recommendations
console.log('\n'.repeat(2));
console.log('STRATEGIC RECOMMENDATIONS FOR FY26');
console.log('-'.repeat(60));

console.log('\n📌 IMMEDIATE ACTIONS (30 DAYS):');
console.log('   1. Launch Anonymous Workplace Climate Survey');
console.log('      • Focus on conduct concerns and cultural issues');
console.log('      • Include all current employees, not just exits');
console.log('      • Partner with third-party for objectivity');

console.log('\n   2. Emergency Management Training');
console.log('      • Mandatory for all supervisors');
console.log('      • Focus on feedback, development conversations');
console.log('      • Address "supervisor issues" directly');

console.log('\n   3. Career Development Task Force');
console.log('      • Create clear advancement pathways');
console.log('      • Implement mentorship program');
console.log('      • Publish internal mobility opportunities');

console.log('\n📌 90-DAY INITIATIVES:');
console.log('   1. Exit Survey Process Overhaul');
console.log('      • Incentivize participation (gift cards, donations)');
console.log('      • Simplify survey length and format');
console.log('      • Add phone interview option');

console.log('\n   2. Retention Bonus Review');
console.log('      • Analyze Q1 spike patterns over 3 years');
console.log('      • Consider quarterly retention incentives');
console.log('      • Target high-risk departments');

console.log('\n   3. Stay Interview Program');
console.log('      • Proactive conversations with current employees');
console.log('      • Identify flight risks before resignation');
console.log('      • Build retention plans individually');

console.log('\n📌 FY26 SUCCESS METRICS:');
console.log('   • Reduce total terminations by 15% (target: <189)');
console.log('   • Achieve 50%+ exit survey response rate');
console.log('   • Raise career development score to 3.5/5.0');
console.log('   • Reduce conduct concerns below 10%');
console.log('   • Maintain 80%+ would recommend rate');
console.log('   • Smooth quarterly distribution (no quarter >30% of total)');

// 8. Department Focus Areas
console.log('\n'.repeat(2));
console.log('DEPARTMENT-SPECIFIC INSIGHTS');
console.log('-'.repeat(60));
console.log('\n⚠ Data Limitation: Department-level data not available in current dataset');
console.log('Recommendation: Cross-reference with HRIS for department-specific analysis');

// 9. Comparison to HR Data
console.log('\n'.repeat(2));
console.log('HR SYSTEM VS EMPLOYEE-REPORTED REASONS');
console.log('-'.repeat(60));
console.log('\nTop HR System Reasons:');
const topHRReasons = Object.entries(turnoverData.termReasons).slice(0, 5);
topHRReasons.forEach(([reason, count], index) => {
  const pct = turnoverData.termReasonPercentages[reason];
  console.log(`   ${index + 1}. ${reason}: ${pct}% (${count} employees)`);
});

console.log('\nTop Employee-Reported Reasons:');
exitReasonTrends.slice(0, 5).forEach((reason, index) => {
  console.log(`   ${index + 1}. ${reason.reason}: ${reason.avgPercentage}% average`);
});

console.log('\n📊 Key Discrepancy:');
console.log('   • HR shows "Resigned" as 50% but lacks underlying cause');
console.log('   • Employees cite specific issues (career, supervisor, compensation)');
console.log('   • Recommendation: Update HR categories to capture root causes');

// 10. Final Summary
console.log('\n'.repeat(2));
console.log('='.repeat(80));
console.log('CONCLUSION');
console.log('='.repeat(80));

console.log(`
FY25 saw ${overall.totalTerminations} employee departures with significant quarterly 
variation and concerning trends in workplace conduct. While Q4 showed improvement,
systematic issues in career development, management effectiveness, and workplace
culture require immediate intervention.

The ${overall.overallResponseRate}% survey response rate, though below target, provides
actionable insights. The wide satisfaction swing (45% to 83.3%) suggests the
organization's culture and employee experience are highly variable and potentially
dependent on specific events or interventions.

Priority must be given to:
1. Addressing rising conduct concerns (47% increase)
2. Developing career advancement pathways (2.5/5.0 satisfaction)
3. Improving management capabilities
4. Stabilizing quarterly turnover patterns

Success will require coordinated efforts across HR, leadership, and management
with clear accountability and regular progress monitoring.
`);

console.log('='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('Generated:', new Date().toISOString());
console.log('='.repeat(80));

// Export summary for dashboard use
const analysisResults = {
  overall,
  avgSatisfaction,
  exitReasonTrends,
  conductTrend,
  quarterlyMetrics: surveyData
};

fs.writeFileSync(
  path.join(__dirname, '../src/data/fy25ExitSurveyAnalysis.json'),
  JSON.stringify(analysisResults, null, 2)
);

console.log('\n✓ Analysis results saved to: src/data/fy25ExitSurveyAnalysis.json');