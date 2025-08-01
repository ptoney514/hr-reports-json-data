// JSON Data Utilities for Admin Dashboard
import dataService from '../services/DataService';

/**
 * Generate a sample JSON template for a specific quarter
 * @param {string} quarter - The quarter (e.g., 'Q2-2025')
 * @returns {object} Sample JSON data for the quarter
 */
export const generateSampleTemplate = (quarter = 'Q2-2025') => {
  const quarterDate = quarter.match(/Q(\d)-(\d{4})/) 
    ? `${quarter.charAt(1) === '1' ? '3-31' : quarter.charAt(1) === '2' ? '6-30' : quarter.charAt(1) === '3' ? '9-30' : '12-31'}-${quarter.substring(3)}`
    : '6-30-2025';
    
  return {
    reportingPeriods: {
      [quarterDate]: {
        label: quarter,
        quarter: quarter,
        startDate: getQuarterStartDate(quarter),
        endDate: quarterDate
      }
    },
    workforce: {
      [quarterDate]: {
        period: quarterDate,
        totalEmployees: 2000,
        demographics: {
          faculty: 700,
          staff: 1100,
          students: 200,
          hsr: 120,
          hsrOmaha: 80,
          hsrPhoenix: 40,
          beFaculty: 600,
          beStaff: 1000,
          nbeFaculty: 100,
          nbeStaff: 100
        },
        byLocation: {
          "Omaha Campus": 1600,
          "Phoenix Campus": 400
        },
        byDepartment: {
          "School of Medicine": 400,
          "College of Arts & Sciences": 350,
          "School of Business": 250,
          "School of Law": 150,
          "School of Dentistry": 200,
          "School of Pharmacy": 180,
          "College of Nursing": 250,
          "Graduate School": 150,
          "School of Social Work": 90,
          "Athletics": 80
        },
        trends: {
          quarterlyGrowth: 2.0,
          yearOverYearGrowth: 5.0
        },
        headcountChange: 40,
        lastUpdated: new Date().toISOString()
      }
    },
    turnover: {
      [quarterDate]: {
        period: quarterDate,
        overallTurnoverRate: 12.0,
        totalDepartures: 240,
        turnoverRateChange: -0.5,
        facultyTurnoverRate: 8.0,
        facultyDepartures: 56,
        facultyTurnoverChange: -0.2,
        staffTurnoverRate: 15.0,
        staffDepartures: 165,
        staffTurnoverChange: -0.6,
        totalCostImpact: 5760000,
        avgCostPerDeparture: 24000,
        costImpactChange: -3.0,
        voluntaryReasons: {
          "Career Advancement": 96,
          "Compensation": 48,
          "Work-Life Balance": 36,
          "Retirement": 30,
          "Relocation": 20,
          "Other": 10
        },
        tenureAnalysis: {
          "< 1 Year": 84,
          "1-3 Years": 72,
          "3-5 Years": 43,
          "5-10 Years": 26,
          "10+ Years": 15
        },
        lastUpdated: new Date().toISOString()
      }
    },
    i9Compliance: {
      [quarterDate]: {
        period: quarterDate,
        overallComplianceRate: 93.0,
        totalActive: 2000,
        compliant: 1860,
        nonCompliant: 140,
        expiringSoon: 80,
        overdue: 60,
        highRiskDepartments: [
          { name: "School of Medicine", complianceRate: 90.0, issues: 40 },
          { name: "Athletics", complianceRate: 88.0, issues: 10 },
          { name: "School of Business", complianceRate: 91.0, issues: 25 }
        ],
        riskCategories: {
          expired: 60,
          expiring30Days: 80,
          missingDocuments: 30,
          pendingReverification: 20
        },
        lastUpdated: new Date().toISOString()
      }
    },
    recruiting: {
      [quarterDate]: {
        period: quarterDate,
        openPositions: 200,
        newHires: 80,
        timeToFill: 45,
        acceptanceRate: 75.0,
        candidatesInPipeline: 500,
        offersPending: 20,
        interviewsScheduled: 60,
        byDepartment: {
          "School of Medicine": 40,
          "College of Arts & Sciences": 30,
          "School of Business": 25,
          "School of Law": 15,
          "Other": 90
        },
        sourceEffectiveness: {
          "Employee Referral": 24,
          "Job Boards": 20,
          "LinkedIn": 16,
          "University Website": 12,
          "Recruitment Agencies": 8
        },
        lastUpdated: new Date().toISOString()
      }
    },
    exitSurvey: {
      [quarterDate]: {
        period: quarterDate,
        responseRate: 85.0,
        totalResponses: 204,
        overallSatisfaction: 3.7,
        wouldRecommend: 70.0,
        primaryReasons: {
          "Career Growth": 82,
          "Compensation": 45,
          "Work-Life Balance": 35,
          "Management": 25,
          "Culture Fit": 12,
          "Other": 5
        },
        satisfactionScores: {
          compensation: 3.1,
          benefits: 4.0,
          workLifeBalance: 3.4,
          careerDevelopment: 3.3,
          management: 3.5,
          culture: 3.8
        },
        themes: {
          positive: ["Great colleagues", "Good benefits", "Mission-driven work"],
          negative: ["Limited growth", "Below-market pay", "Heavy workload"]
        },
        lastUpdated: new Date().toISOString()
      }
    }
  };
};

/**
 * Get quarter start date
 */
const getQuarterStartDate = (quarter) => {
  const q = quarter.charAt(1);
  const year = quarter.substring(3);
  switch(q) {
    case '1': return `${year}-01-01`;
    case '2': return `${year}-04-01`;
    case '3': return `${year}-07-01`;
    case '4': return `${year}-10-01`;
    default: return `${year}-01-01`;
  }
};

/**
 * Download JSON data as a file
 * @param {object} data - The data to download
 * @param {string} filename - The filename for the download
 */
export const downloadJSON = (data, filename = 'hr-data.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download current data store as JSON
 */
export const downloadCurrentData = () => {
  const currentData = dataService.getDataStore();
  const filename = `hr-data-backup-${new Date().toISOString().split('T')[0]}.json`;
  downloadJSON(currentData, filename);
};

/**
 * Download sample template
 * @param {string} quarter - Optional quarter for the template
 */
export const downloadSampleTemplate = (quarter) => {
  const template = generateSampleTemplate(quarter);
  const filename = `hr-data-template-${quarter || 'sample'}.json`;
  downloadJSON(template, filename);
};

/**
 * Parse uploaded JSON file
 * @param {File} file - The uploaded file
 * @returns {Promise<object>} Parsed JSON data
 */
export const parseJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Validate JSON data structure
 * @param {object} data - The data to validate
 * @returns {object} Validation result { isValid: boolean, errors: string[] }
 */
export const validateJSONStructure = (data) => {
  const errors = [];
  
  // Check for at least one dashboard type
  const dashboardTypes = ['workforce', 'turnover', 'i9Compliance', 'recruiting', 'exitSurvey'];
  const hasDashboard = dashboardTypes.some(type => data[type]);
  
  if (!hasDashboard) {
    errors.push('JSON must contain at least one dashboard type (workforce, turnover, i9Compliance, recruiting, exitSurvey)');
  }
  
  // Validate each dashboard type if present
  if (data.workforce) {
    Object.entries(data.workforce).forEach(([period, metrics]) => {
      if (!metrics.totalEmployees) errors.push(`Workforce data for ${period} missing totalEmployees`);
      if (!metrics.demographics) errors.push(`Workforce data for ${period} missing demographics`);
    });
  }
  
  if (data.turnover) {
    Object.entries(data.turnover).forEach(([period, metrics]) => {
      if (!metrics.overallTurnoverRate) errors.push(`Turnover data for ${period} missing overallTurnoverRate`);
      if (!metrics.totalDepartures) errors.push(`Turnover data for ${period} missing totalDepartures`);
    });
  }
  
  // Add more validation as needed
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge uploaded data with existing data
 * @param {object} uploadedData - The uploaded data
 * @returns {object} Merged data
 */
export const mergeUploadedData = (uploadedData) => {
  const currentData = dataService.getDataStore();
  const mergedData = { ...currentData };
  
  // Merge each dashboard type
  Object.keys(uploadedData).forEach(key => {
    if (typeof uploadedData[key] === 'object' && !Array.isArray(uploadedData[key])) {
      mergedData[key] = {
        ...mergedData[key],
        ...uploadedData[key]
      };
    }
  });
  
  return mergedData;
};