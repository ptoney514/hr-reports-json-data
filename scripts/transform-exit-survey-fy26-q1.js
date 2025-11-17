#!/usr/bin/env node

/**
 * Exit Survey Q1 FY26 Data Transformation Script
 *
 * Reads cleaned CSV data from the original workspace and transforms it
 * into the JSON format required for staticData.js
 *
 * Usage: node scripts/transform-exit-survey-fy26-q1.js
 *
 * Input:  /hr-reports-workspace/source-metrics/exit-surveys/cleaned_data/FY26_Q1/exit_survey_cleaned.csv
 * Output: Console output with JSON for staticData.js + validation report
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CSV_PATH = '/Users/pernelltoney/My Projects/02-development/hr-reports-workspace/source-metrics/exit-surveys/cleaned_data/FY26_Q1/exit_survey_cleaned.csv';
const REPORTING_DATE = '2025-09-30';
const QUARTER_LABEL = 'Q1 FY26';
const FISCAL_YEAR = 'FY26';
const FISCAL_QUARTER = 'Q1';

// Rating scale conversion (text → numeric)
const RATING_SCALE = {
  'Very Dissatisfied': 1,
  'Dissatisfied': 2,
  'Somewhat Dissatisfied': 2.5,
  'Neutral': 3,
  'Somewhat Satisfied': 3.5,
  'Satisfied': 4,
  'Very Satisfied': 5,
  'Did Not Participate': null,
  'N/A': null,
  '': null
};

// ============================================================================
// CSV PARSING
// ============================================================================

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Use csv-parse for robust CSV parsing
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true, // Allow rows with varying column counts
  });

  return records;
}

// ============================================================================
// METRIC CALCULATIONS
// ============================================================================

function calculateWouldRecommend(data) {
  const total = data.length;
  const yesCount = data.filter(row => row.Would_Recommend === 'Yes').length;
  const percentage = total > 0 ? Math.round((yesCount / total) * 1000) / 10 : 0;

  return {
    percentage,
    count: { positive: yesCount, total }
  };
}

function calculateOverallSatisfaction(data) {
  const satisfactionColumns = [
    'Career_Dev_Rating',
    'Recognition_Rating',
    'Advancement_Rating',
    'Supervisor_Goals_Rating',
    'Supervisor_Feedback_Rating',
    'Supervisor_Communication_Rating',
    'Supervisor_Effectiveness_Rating',
    'Salary_Rating'
  ];

  let totalScore = 0;
  let totalCount = 0;

  data.forEach(row => {
    satisfactionColumns.forEach(col => {
      const value = RATING_SCALE[row[col]];
      if (value !== null && value !== undefined) {
        totalScore += value;
        totalCount++;
      }
    });
  });

  return totalCount > 0 ? Math.round((totalScore / totalCount) * 10) / 10 : 0;
}

function calculateSatisfactionRatings(data) {
  const columns = {
    jobSatisfaction: 'Career_Dev_Rating',
    managementSupport: 'Supervisor_Effectiveness_Rating',
    careerDevelopment: 'Advancement_Rating',
    workLifeBalance: null, // Not directly captured - use placeholder
    compensation: 'Salary_Rating',
    benefits: 'CALCULATE_FROM_BENEFITS' // Calculate from benefit columns
  };

  const ratings = {};

  // Benefit columns to average
  const benefitColumns = [
    'Benefit_Tuition_Dependent',
    'Benefit_EAP',
    'Benefit_Tuition_Self',
    'Benefit_Medical',
    'Benefit_Dental',
    'Benefit_Retirement',
    'Benefit_PTO'
  ];

  // Calculate individual averages
  Object.keys(columns).forEach(key => {
    if (columns[key] === 'CALCULATE_FROM_BENEFITS') {
      // Calculate benefits satisfaction from all benefit columns
      let total = 0;
      let count = 0;

      data.forEach(row => {
        benefitColumns.forEach(col => {
          const value = RATING_SCALE[row[col]];
          if (value !== null && value !== undefined) {
            total += value;
            count++;
          }
        });
      });

      ratings[key] = count > 0 ? Math.round((total / count) * 10) / 10 : 3.0;
    } else if (columns[key]) {
      // Calculate from single column
      let total = 0;
      let count = 0;

      data.forEach(row => {
        const value = RATING_SCALE[row[columns[key]]];
        if (value !== null && value !== undefined) {
          total += value;
          count++;
        }
      });

      ratings[key] = count > 0 ? Math.round((total / count) * 10) / 10 : 3.0;
    } else {
      // Placeholder for missing categories
      ratings[key] = 3.0;
    }
  });

  return ratings;
}

function calculateConcernsReported(data) {
  // Count responses with "Caring_Culture" = "No"
  const total = data.length;
  const concernsCount = data.filter(row => row.Caring_Culture === 'No').length;
  const percentage = total > 0 ? Math.round((concernsCount / total) * 1000) / 10 : 0;

  return {
    percentage,
    count: concernsCount,
    total,
    description: 'reported workplace concerns'
  };
}

function calculateDepartureReasons(data) {
  const reasonCounts = {};
  const total = data.length;

  // Count primary reasons
  data.forEach(row => {
    const reason = row.Primary_Reason;
    if (reason && reason.trim()) {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    }
  });

  // Convert to array and calculate percentages
  const reasons = Object.keys(reasonCounts).map(reason => ({
    reason,
    count: reasonCounts[reason],
    percentage: Math.round((reasonCounts[reason] / total) * 1000) / 10
  }));

  // Sort by count descending
  reasons.sort((a, b) => b.count - a.count);

  return reasons;
}

function calculateDepartmentExits(data) {
  const deptCounts = {};
  const total = data.length;

  // Count by department
  data.forEach(row => {
    const dept = row.School_Department;
    if (dept && dept.trim()) {
      if (!deptCounts[dept]) {
        deptCounts[dept] = { exits: 0, responses: 0 };
      }
      deptCounts[dept].exits += 1; // In survey data, exits = responses
      deptCounts[dept].responses += 1;
    }
  });

  // Convert to array with response rates
  const departments = Object.keys(deptCounts).map(department => {
    const exits = deptCounts[department].exits;
    const responses = deptCounts[department].responses;
    const responseRate = exits > 0 ? `${Math.round((responses / exits) * 100)}%` : '0%';

    return {
      department,
      exits,
      responses,
      responseRate
    };
  });

  // Sort by exits descending
  departments.sort((a, b) => b.exits - a.exits);

  return departments;
}

function calculateContributingReasons(data) {
  const reasonCounts = {};
  const total = data.length;

  // Parse Other_Reasons field (comma-separated multi-select)
  data.forEach(row => {
    const otherReasons = row.Other_Reasons;
    if (otherReasons && otherReasons.trim()) {
      // Split by comma and trim each reason
      const reasons = otherReasons.split(',').map(r => r.trim()).filter(r => r.length > 0);

      reasons.forEach(reason => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    }
  });

  // Convert to array and calculate percentages
  const reasons = Object.keys(reasonCounts).map(reason => ({
    reason,
    count: reasonCounts[reason],
    percentage: Math.round((reasonCounts[reason] / total) * 1000) / 10
  }));

  // Sort by count descending
  reasons.sort((a, b) => b.count - a.count);

  return reasons;
}

// ============================================================================
// MAIN TRANSFORMATION
// ============================================================================

function transformExitSurveyData() {
  console.log('\n' + '='.repeat(80));
  console.log('Q1 FY26 EXIT SURVEY DATA TRANSFORMATION');
  console.log('='.repeat(80) + '\n');

  // Read and parse CSV
  console.log(`📂 Reading CSV from: ${CSV_PATH}`);
  const data = parseCSV(CSV_PATH);
  console.log(`✓ Loaded ${data.length} responses\n`);

  // Calculate all metrics
  const wouldRecommend = calculateWouldRecommend(data);
  const overallSatisfaction = calculateOverallSatisfaction(data);
  const satisfactionRatings = calculateSatisfactionRatings(data);
  const concernsReported = calculateConcernsReported(data);
  const departureReasons = calculateDepartureReasons(data);
  const contributingReasons = calculateContributingReasons(data);
  const departmentExits = calculateDepartmentExits(data);

  // Build final data structure
  const exitSurveyData = {
    reportingDate: REPORTING_DATE.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (match, year, month, day) => {
      // Convert YYYY-MM-DD to M/D/YY format
      return `${parseInt(month)}/${parseInt(day)}/${year.slice(2)}`;
    }),
    quarter: QUARTER_LABEL,
    responseRate: null, // Will be calculated when termination data is available
    totalResponses: data.length,
    totalExits: null, // Will be filled from termination data
    overallSatisfaction,
    wouldRecommend: wouldRecommend.percentage,
    wouldRecommendCount: wouldRecommend.count,
    concernsReported,
    departureReasons,
    contributingReasons,
    departmentExits,
    satisfactionRatings,
    keyInsights: {
      areasOfConcern: [
        `${concernsReported.percentage}% reported workplace concerns (${concernsReported.count} of ${concernsReported.total})`,
        `${100 - wouldRecommend.percentage}% would NOT recommend Creighton as employer`,
        `${departureReasons.length > 0 ? departureReasons[0].reason : 'N/A'} is top departure reason (${departureReasons.length > 0 ? departureReasons[0].percentage : 0}%)`,
        'Early data - full analysis pending additional quarters'
      ],
      positiveFeedback: [
        `${wouldRecommend.percentage}% would recommend Creighton as employer`,
        'New exit survey process successfully implemented in Q1',
        `${departmentExits.length} departments represented in responses`,
        'Baseline data established for FY26 tracking'
      ],
      actionItems: [
        'Monitor response rates - target 50%+ in subsequent quarters',
        `Address top departure reason: ${departureReasons.length > 0 ? departureReasons[0].reason : 'N/A'}`,
        'Investigate workplace culture concerns',
        'Develop quarterly comparison analysis as more data becomes available'
      ]
    }
  };

  // Validation Report
  console.log('📊 VALIDATION REPORT');
  console.log('─'.repeat(80));
  console.log(`✓ Total Responses:        ${exitSurveyData.totalResponses}`);
  console.log(`✓ Would Recommend:        ${exitSurveyData.wouldRecommend}% (${wouldRecommend.count.positive}/${wouldRecommend.count.total})`);
  console.log(`✓ Overall Satisfaction:   ${exitSurveyData.overallSatisfaction}/5.0`);
  console.log(`✓ Concerns Reported:      ${concernsReported.percentage}% (${concernsReported.count}/${concernsReported.total})`);
  console.log(`✓ Departments Tracked:    ${departmentExits.length}`);
  console.log(`✓ Unique Exit Reasons:    ${departureReasons.length}`);
  console.log(`✓ Top Reason:             ${departureReasons.length > 0 ? departureReasons[0].reason : 'N/A'} (${departureReasons.length > 0 ? departureReasons[0].percentage : 0}%)`);
  console.log(`✓ Contributing Factors:   ${contributingReasons.length} (multi-select)`);
  console.log(`✓ Top Contributing:       ${contributingReasons.length > 0 ? contributingReasons[0].reason : 'N/A'} (${contributingReasons.length > 0 ? contributingReasons[0].count : 0} mentions)`);
  console.log();

  // Output JSON for staticData.js
  console.log('📝 JSON OUTPUT FOR staticData.js');
  console.log('─'.repeat(80));
  console.log(`Add this entry to EXIT_SURVEY_DATA in src/data/staticData.js:\n`);
  console.log(`  "${REPORTING_DATE}": ${JSON.stringify(exitSurveyData, null, 2).replace(/^/gm, '  ').trim()},\n`);
  console.log('─'.repeat(80) + '\n');

  // Data Quality Checks
  console.log('🔍 DATA QUALITY CHECKS');
  console.log('─'.repeat(80));
  const checks = [
    { name: 'Response count > 0', pass: data.length > 0 },
    { name: 'Would Recommend % in range', pass: wouldRecommend.percentage >= 0 && wouldRecommend.percentage <= 100 },
    { name: 'Satisfaction score in range', pass: overallSatisfaction >= 1 && overallSatisfaction <= 5 },
    { name: 'All percentages sum correctly', pass: Math.abs(departureReasons.reduce((sum, r) => sum + r.percentage, 0) - 100) < 1 },
    { name: 'Department totals match responses', pass: departmentExits.reduce((sum, d) => sum + d.responses, 0) === data.length },
    { name: 'No missing primary reasons', pass: data.every(row => row.Primary_Reason && row.Primary_Reason.trim()) }
  ];

  checks.forEach(check => {
    console.log(`${check.pass ? '✓' : '✗'} ${check.name}`);
  });
  console.log();

  const allPassed = checks.every(c => c.pass);
  if (allPassed) {
    console.log('✅ All validation checks PASSED\n');
  } else {
    console.log('⚠️  Some validation checks FAILED - review data quality\n');
  }

  console.log('='.repeat(80) + '\n');

  return exitSurveyData;
}

// ============================================================================
// EXECUTION
// ============================================================================

if (require.main === module) {
  try {
    transformExitSurveyData();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { transformExitSurveyData, parseCSV };
