/**
 * Exit Survey Analytics Utility
 * Provides historical analysis and calculations for exit survey data
 * Focus: Complete quarters only, no predictions
 */

import { EXIT_SURVEY_DATA, AVAILABLE_DATES } from '../data/staticData';

/**
 * Calculate Turnover Velocity Index (TVI) between two periods
 * TVI = (Current Quarter Exits / Previous Quarter Exits) × 100
 * Values below 100 indicate improving (decreasing) turnover
 */
export const calculateTurnoverVelocityIndex = (currentPeriod, previousPeriod) => {
  const current = EXIT_SURVEY_DATA[currentPeriod];
  const previous = EXIT_SURVEY_DATA[previousPeriod];
  
  if (!current?.totalExits || !previous?.totalExits) {
    return null;
  }
  
  const tvi = (current.totalExits / previous.totalExits) * 100;
  return Math.round(tvi * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate exit volume change percentage
 */
export const calculateExitVolumeChange = (currentPeriod, previousPeriod) => {
  const current = EXIT_SURVEY_DATA[currentPeriod];
  const previous = EXIT_SURVEY_DATA[previousPeriod];
  
  if (!current?.totalExits || !previous?.totalExits) {
    return null;
  }
  
  const change = ((current.totalExits - previous.totalExits) / previous.totalExits) * 100;
  return Math.round(change * 10) / 10;
};

/**
 * Get historical comparison between Q1 FY25 and Q4 FY25
 */
export const getHistoricalComparison = () => {
  const q1fy25 = EXIT_SURVEY_DATA["2024-06-30"];
  const q4fy25 = EXIT_SURVEY_DATA["2025-06-30"];
  
  if (!q1fy25 || !q4fy25) {
    return null;
  }
  
  return {
    baseline: {
      period: q1fy25.quarter,
      totalExits: q1fy25.totalExits,
      surveyAvailable: q1fy25.totalResponses > 0
    },
    current: {
      period: q4fy25.quarter,
      totalExits: q4fy25.totalExits,
      responseRate: q4fy25.responseRate,
      wouldRecommend: q4fy25.wouldRecommend,
      concernsReported: q4fy25.concernsReported?.percentage
    },
    changes: {
      exitVolumeChange: calculateExitVolumeChange("2025-06-30", "2024-06-30"),
      tvi: calculateTurnoverVelocityIndex("2025-06-30", "2024-06-30"),
      direction: q4fy25.totalExits < q1fy25.totalExits ? "improving" : "worsening"
    }
  };
};

/**
 * Calculate department risk score based on Q4 FY25 data
 * Score = (Exit Count × 0.3) + (Low Response Rate × 0.4) + (Concerns × 0.3)
 */
export const calculateDepartmentRiskScores = () => {
  const q4fy25 = EXIT_SURVEY_DATA["2025-06-30"];
  
  if (!q4fy25?.departmentExits) {
    return [];
  }
  
  return q4fy25.departmentExits.map(dept => {
    // Exit risk (normalized to 0-100 scale)
    const exitRisk = Math.min((dept.exits / 5) * 100, 100); // 5+ exits = max risk
    
    // Response rate risk (lower response rate = higher risk)
    const responseRate = parseFloat(dept.responseRate) || 0;
    const responseRisk = 100 - responseRate;
    
    // Concern risk (if we had concerns data per department)
    const concernRisk = 0; // Default as we don't have dept-specific concern data
    
    // Weighted risk score
    const riskScore = (exitRisk * 0.3) + (responseRisk * 0.4) + (concernRisk * 0.3);
    
    return {
      department: dept.department,
      exits: dept.exits,
      responses: dept.responses,
      responseRate: dept.responseRate,
      riskScore: Math.round(riskScore),
      riskLevel: getRiskLevel(riskScore)
    };
  });
};

/**
 * Convert numeric risk score to risk level
 */
export const getRiskLevel = (score) => {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Moderate";
  return "Low";
};

/**
 * Get exit reason analysis for Q4 FY25
 */
export const getExitReasonAnalysis = () => {
  const q4fy25 = EXIT_SURVEY_DATA["2025-06-30"];
  
  if (!q4fy25?.departureReasons) {
    return [];
  }
  
  // Sort by percentage descending
  const sortedReasons = [...q4fy25.departureReasons].sort((a, b) => b.percentage - a.percentage);
  
  return sortedReasons.map((reason, index) => ({
    ...reason,
    rank: index + 1,
    category: categorizeExitReason(reason.reason)
  }));
};

/**
 * Categorize exit reasons
 */
export const categorizeExitReason = (reason) => {
  const reasonLower = reason.toLowerCase();
  
  if (reasonLower.includes('supervisor') || reasonLower.includes('management')) {
    return 'Management Issues';
  }
  if (reasonLower.includes('career') || reasonLower.includes('advancement')) {
    return 'Career Development';
  }
  if (reasonLower.includes('relocation') || reasonLower.includes('remote')) {
    return 'Location/Flexibility';
  }
  if (reasonLower.includes('retirement') || reasonLower.includes('workforce')) {
    return 'Natural Transitions';
  }
  return 'Other';
};

/**
 * Get survey quality metrics
 */
export const getSurveyQualityMetrics = () => {
  const periods = AVAILABLE_DATES.map(date => date.value);
  
  return periods.map(period => {
    const data = EXIT_SURVEY_DATA[period];
    if (!data) return null;
    
    // Survey Confidence Score = Response Rate × Recommendation Rate
    const confidenceScore = data.responseRate && data.wouldRecommend 
      ? Math.round((data.responseRate / 100) * data.wouldRecommend) 
      : null;
    
    return {
      period: data.quarter || data.reportingDate,
      totalExits: data.totalExits,
      totalResponses: data.totalResponses,
      responseRate: data.responseRate,
      wouldRecommend: data.wouldRecommend,
      confidenceScore,
      dataQuality: data.responseRate >= 50 ? 'High' : 
                  data.responseRate >= 30 ? 'Medium' : 
                  data.responseRate > 0 ? 'Low' : 'No Survey Data'
    };
  }).filter(item => item !== null);
};

/**
 * Get manager impact analysis from Q4 FY25
 */
export const getManagerImpactAnalysis = () => {
  const q4fy25 = EXIT_SURVEY_DATA["2025-06-30"];
  
  if (!q4fy25?.departureReasons) {
    return null;
  }
  
  // Find supervisor-related exits
  const supervisorReason = q4fy25.departureReasons.find(reason => 
    reason.reason.toLowerCase().includes('supervisor')
  );
  
  return {
    supervisorIssuePercentage: supervisorReason?.percentage || 0,
    totalResponses: q4fy25.totalResponses,
    impactLevel: (supervisorReason?.percentage || 0) >= 20 ? 'High' : 
                (supervisorReason?.percentage || 0) >= 10 ? 'Medium' : 'Low',
    recommendation: (supervisorReason?.percentage || 0) >= 15 
      ? 'Immediate supervisor training recommended'
      : 'Continue monitoring supervisor relationships'
  };
};

/**
 * Get complete quarters data for analysis (excludes partial data)
 */
export const getCompleteQuartersData = () => {
  return AVAILABLE_DATES
    .filter(date => date.status === 'complete')
    .map(date => ({
      ...date,
      data: EXIT_SURVEY_DATA[date.value]
    }));
};

/**
 * Check if a period has complete survey data
 */
export const isCompleteSurveyData = (period) => {
  const data = EXIT_SURVEY_DATA[period];
  return data && !data.dataStatus?.includes('INCOMPLETE') && data.totalResponses > 0;
};