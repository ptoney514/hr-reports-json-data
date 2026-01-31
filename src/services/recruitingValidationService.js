/**
 * Recruiting Validation Service
 *
 * Validates JSON data against Neon database data for the Recruiting Dashboard.
 * Ensures all labels and values match between Excel source and database.
 *
 * Validation Categories:
 * - Summary Metrics (7 checks) - Total hires, faculty/staff, campus breakdown
 * - Hire Rates (8 checks) - Hire rates by source/channel
 * - Pipeline Staff (12 checks) - myJobs pipeline metrics
 * - Pipeline Faculty (8 checks) - Interfolio pipeline metrics
 * - Application Sources (6+ checks) - LinkedIn, Indeed, etc.
 * - Top Jobs (10 checks) - Top 10 jobs by applications
 * - Demographics (15+ checks) - Gender, ethnicity, age band
 */

import * as apiService from './apiService';

/**
 * Validation rules for recruiting data points
 */
export const VALIDATION_RULES = {
  summaryMetrics: [
    { id: 'total_hires', label: 'Total Hires', expected: 69, unit: 'count' },
    { id: 'faculty_hires', label: 'Faculty Hires', expected: 31, unit: 'count' },
    { id: 'staff_hires', label: 'Staff Hires', expected: 38, unit: 'count' },
    { id: 'omaha_hires', label: 'Omaha Hires', expected: 68, unit: 'count' },
    { id: 'phoenix_hires', label: 'Phoenix Hires', expected: 1, unit: 'count' },
    { id: 'open_requisitions', label: 'Open Requisitions', expected: 143, unit: 'count' },
    { id: 'active_applications', label: 'Active Applications', expected: 767, unit: 'count' }
  ],

  pipelineStaff: [
    { id: 'open_reqs', label: 'Open Requisitions', expected: 143, unit: 'count' },
    { id: 'reqs_per_recruiter', label: 'Reqs per Recruiter', expected: 28.6 },
    { id: 'avg_days_open', label: 'Avg Days Open', expected: 71 },
    { id: 'avg_time_to_fill', label: 'Avg Time to Fill', expected: 35.5 },
    { id: 'active_applications', label: 'Active Applications', expected: 767, unit: 'count' },
    { id: 'new_applications', label: 'New Applications', expected: 2000, unit: 'count' },
    { id: 'apps_per_req', label: 'Apps per Requisition', expected: 11.1 },
    { id: 'internal_app_pct', label: 'Internal App %', expected: 3.0, unit: 'percent' },
    { id: 'referrals', label: 'Referrals', expected: 7, unit: 'count' },
    { id: 'total_hires', label: 'Total Staff Hires', expected: 40, unit: 'count' },
    { id: 'internal_hires', label: 'Internal Hires', expected: 13, unit: 'count' },
    { id: 'internal_hire_rate', label: 'Internal Hire Rate', expected: 32.5, unit: 'percent' },
    { id: 'offer_acceptance_rate', label: 'Offer Acceptance Rate', expected: 97.7, unit: 'percent' }
  ],

  pipelineFaculty: [
    { id: 'active_searches', label: 'Active Searches', expected: 15, unit: 'count' },
    { id: 'completed_searches', label: 'Completed Searches', expected: 6, unit: 'count' },
    { id: 'total_hires', label: 'Total Faculty Hires', expected: 6, unit: 'count' },
    { id: 'tenure_track', label: 'Tenure Track', expected: 3, unit: 'count' },
    { id: 'non_tenure', label: 'Non-Tenure', expected: 1, unit: 'count' },
    { id: 'instructor', label: 'Instructor', expected: 1, unit: 'count' },
    { id: 'special_faculty', label: 'Special Faculty', expected: 1, unit: 'count' }
  ],

  applicationSources: [
    { id: 'linkedin', label: 'LinkedIn', source: 'LinkedIn', expected: 800, pct: 40, unit: 'count' },
    { id: 'creighton_careers', label: 'Creighton Careers', source: 'Creighton Careers', expected: 400, pct: 20, unit: 'count' },
    { id: 'external_career', label: 'External Career Site', source: 'External Career Site', expected: 380, pct: 19, unit: 'count' },
    { id: 'jobright', label: 'jobright', source: 'jobright', expected: 120, pct: 6, unit: 'count' },
    { id: 'internal_career', label: 'Internal Career Site', source: 'Internal Career Site', expected: 100, pct: 5, unit: 'count' },
    { id: 'other', label: 'Other', source: 'Other', expected: 200, pct: 10, unit: 'count' }
  ],

  topJobs: [
    { id: 'top_job_1', label: 'Top Job #1', rank: 1, expected: 165, unit: 'count' },
    { id: 'top_job_2', label: 'Top Job #2', rank: 2, expected: 140, unit: 'count' },
    { id: 'top_job_3', label: 'Top Job #3', rank: 3, expected: 95, unit: 'count' },
    { id: 'top_job_4', label: 'Top Job #4', rank: 4, expected: 85, unit: 'count' },
    { id: 'top_job_5', label: 'Top Job #5', rank: 5, expected: 72, unit: 'count' },
    { id: 'top_job_6', label: 'Top Job #6', rank: 6, expected: 65, unit: 'count' },
    { id: 'top_job_7', label: 'Top Job #7', rank: 7, expected: 58, unit: 'count' },
    { id: 'top_job_8', label: 'Top Job #8', rank: 8, expected: 52, unit: 'count' },
    { id: 'top_job_9', label: 'Top Job #9', rank: 9, expected: 48, unit: 'count' },
    { id: 'top_job_10', label: 'Top Job #10', rank: 10, expected: 42, unit: 'count' }
  ],

  demographics: [
    { id: 'gender_female', label: 'Gender - Female', demoType: 'Gender', demoValue: 'Female', expected: 34, pct: 49.3, unit: 'count' },
    { id: 'gender_male', label: 'Gender - Male', demoType: 'Gender', demoValue: 'Male', expected: 35, pct: 50.7, unit: 'count' },
    { id: 'eth_white', label: 'Ethnicity - White', demoType: 'Ethnicity', demoValue: 'White', expected: 34, pct: 49.3, unit: 'count' },
    { id: 'eth_not_disclosed', label: 'Ethnicity - Not Disclosed', demoType: 'Ethnicity', demoValue: 'Not Disclosed', expected: 14, pct: 20.3, unit: 'count' },
    { id: 'eth_asian', label: 'Ethnicity - Asian', demoType: 'Ethnicity', demoValue: 'Asian', expected: 10, pct: 14.5, unit: 'count' },
    { id: 'eth_multi', label: 'Ethnicity - Multiple', demoType: 'Ethnicity', demoValue: 'More than one Ethnicity', expected: 6, pct: 8.7, unit: 'count' },
    { id: 'eth_hispanic', label: 'Ethnicity - Hispanic', demoType: 'Ethnicity', demoValue: 'Hispanic or Latino', expected: 3, pct: 4.3, unit: 'count' },
    { id: 'eth_black', label: 'Ethnicity - Black', demoType: 'Ethnicity', demoValue: 'Black or African American', expected: 2, pct: 2.9, unit: 'count' },
    { id: 'age_21_30', label: 'Age Band - 21-30', demoType: 'Age Band', demoValue: '21-30', expected: 21, pct: 30.4, unit: 'count' },
    { id: 'age_31_40', label: 'Age Band - 31-40', demoType: 'Age Band', demoValue: '31-40', expected: 28, pct: 40.6, unit: 'count' },
    { id: 'age_41_50', label: 'Age Band - 41-50', demoType: 'Age Band', demoValue: '41-50', expected: 11, pct: 15.9, unit: 'count' },
    { id: 'age_51_60', label: 'Age Band - 51-60', demoType: 'Age Band', demoValue: '51-60', expected: 6, pct: 8.7, unit: 'count' },
    { id: 'age_61_plus', label: 'Age Band - 61+', demoType: 'Age Band', demoValue: '61+', expected: 3, pct: 4.3, unit: 'count' }
  ],

  requisitionAging: [
    { id: 'aging_0_30', label: '0-30 Days', range: '0-30 Days', expected: 45, pct: 31.5, unit: 'count' },
    { id: 'aging_31_60', label: '31-60 Days', range: '31-60 Days', expected: 38, pct: 26.6, unit: 'count' },
    { id: 'aging_61_90', label: '61-90 Days', range: '61-90 Days', expected: 28, pct: 19.6, unit: 'count' },
    { id: 'aging_91_120', label: '91-120 Days', range: '91-120 Days', expected: 18, pct: 12.6, unit: 'count' },
    { id: 'aging_120_plus', label: '>120 Days', range: '>120 Days', expected: 14, pct: 9.8, unit: 'count' }
  ],

  hiresBySchool: [
    { id: 'school_arts_sciences', label: 'Arts & Sciences', school: 'Arts & Sciences', expected: 17, unit: 'count' },
    { id: 'school_medicine', label: 'Medicine', school: 'Medicine', expected: 8, unit: 'count' },
    { id: 'school_facilities', label: 'Facilities', school: 'Facilities', expected: 8, unit: 'count' },
    { id: 'school_dentistry', label: 'Dentistry', school: 'Dentistry', expected: 7, unit: 'count' },
    { id: 'school_business', label: 'Heider Business', school: 'Heider College of Business', expected: 5, unit: 'count' },
    { id: 'school_nursing', label: 'Nursing', school: 'Nursing', expected: 4, unit: 'count' },
    { id: 'school_athletics', label: 'Athletics', school: 'Athletics', expected: 3, unit: 'count' },
    { id: 'school_law', label: 'Law School', school: 'Law School', expected: 3, unit: 'count' },
    { id: 'school_other', label: 'Other', school: 'Other', expected: 14, unit: 'count' }
  ]
};

/**
 * Compare two values for equality with tolerance
 */
export function compareValues(actual, expected, tolerance = 0.01) {
  if (actual === expected) return true;
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) <= tolerance;
  }
  return false;
}

/**
 * Format value for display
 */
export function formatValue(value, unit) {
  if (value === undefined || value === null) return '--';
  if (typeof value === 'number') {
    if (unit === 'count') {
      return value.toLocaleString();
    }
    if (unit === 'percent') {
      return value.toFixed(1) + '%';
    }
    return value.toFixed(1);
  }
  return String(value);
}

/**
 * Validate summary metrics
 */
async function validateSummaryMetrics(apiData) {
  const summary = apiData?.summary;
  if (!summary) {
    return VALIDATION_RULES.summaryMetrics.map(rule => ({
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue: null,
      expected: rule.expected,
      status: 'api_missing',
      unit: rule.unit
    }));
  }

  return VALIDATION_RULES.summaryMetrics.map(rule => {
    const apiValue = summary[rule.id];
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null || apiValue === undefined ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate pipeline staff metrics
 */
async function validatePipelineStaff(apiData) {
  const pipeline = apiData?.pipelineStaff;
  if (!pipeline) {
    return VALIDATION_RULES.pipelineStaff.map(rule => ({
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue: null,
      expected: rule.expected,
      status: 'api_missing',
      unit: rule.unit
    }));
  }

  const fieldMap = {
    open_reqs: 'open_requisitions',
    reqs_per_recruiter: 'reqs_per_recruiter',
    avg_days_open: 'avg_days_open',
    avg_time_to_fill: 'avg_time_to_fill',
    active_applications: 'active_applications',
    new_applications: 'new_applications',
    apps_per_req: 'apps_per_requisition',
    internal_app_pct: 'internal_app_percentage',
    referrals: 'referrals',
    total_hires: 'total_hires',
    internal_hires: 'internal_hires',
    internal_hire_rate: 'internal_hire_rate',
    offer_acceptance_rate: 'offer_acceptance_rate'
  };

  return VALIDATION_RULES.pipelineStaff.map(rule => {
    const dbField = fieldMap[rule.id];
    const apiValue = pipeline[dbField] !== undefined ? Number(pipeline[dbField]) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate pipeline faculty metrics
 */
async function validatePipelineFaculty(apiData) {
  const pipeline = apiData?.pipelineFaculty;
  if (!pipeline) {
    return VALIDATION_RULES.pipelineFaculty.map(rule => ({
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue: null,
      expected: rule.expected,
      status: 'api_missing',
      unit: rule.unit
    }));
  }

  const fieldMap = {
    active_searches: 'active_searches',
    completed_searches: 'completed_searches',
    total_hires: 'total_hires',
    tenure_track: 'tenure_track_hires',
    non_tenure: 'non_tenure_hires',
    instructor: 'instructor_hires',
    special_faculty: 'special_faculty_hires'
  };

  return VALIDATION_RULES.pipelineFaculty.map(rule => {
    const dbField = fieldMap[rule.id];
    const apiValue = pipeline[dbField] !== undefined ? Number(pipeline[dbField]) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate application sources
 */
async function validateApplicationSources(apiData) {
  const sources = apiData?.applicationSources || [];

  return VALIDATION_RULES.applicationSources.map(rule => {
    const sourceData = sources.find(s => s.source_name === rule.source);
    const apiValue = sourceData ? Number(sourceData.application_count) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate top jobs
 */
async function validateTopJobs(apiData) {
  const jobs = apiData?.topJobs || [];

  return VALIDATION_RULES.topJobs.map(rule => {
    const jobData = jobs.find(j => Number(j.rank) === rule.rank);
    const apiValue = jobData ? Number(jobData.application_count) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate demographics
 */
async function validateDemographics(apiData) {
  const demographics = apiData?.demographics || [];

  return VALIDATION_RULES.demographics.map(rule => {
    const demoData = demographics.find(
      d => d.demo_type === rule.demoType && d.demo_value === rule.demoValue
    );
    const apiValue = demoData ? Number(demoData.count) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate requisition aging
 */
async function validateRequisitionAging(apiData) {
  const aging = apiData?.requisitionAging || [];

  return VALIDATION_RULES.requisitionAging.map(rule => {
    const agingData = aging.find(a => a.age_range === rule.range);
    const apiValue = agingData ? Number(agingData.requisition_count) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Validate hires by school
 */
async function validateHiresBySchool(apiData) {
  const schools = apiData?.bySchool || [];

  return VALIDATION_RULES.hiresBySchool.map(rule => {
    const schoolData = schools.find(s => s.school_name === rule.school);
    const apiValue = schoolData ? Number(schoolData.total_hires) : null;
    const match = compareValues(apiValue, rule.expected);
    return {
      id: rule.id,
      label: rule.label,
      jsonValue: rule.expected,
      apiValue,
      expected: rule.expected,
      status: apiValue === null ? 'api_missing' : (match ? 'passed' : 'failed'),
      unit: rule.unit
    };
  });
}

/**
 * Run all recruiting validations
 */
export async function validateRecruitingData(fiscalYear = 'FY2026', quarter = 1) {
  const startTime = Date.now();

  // Get API data
  let apiData = null;
  let apiError = null;

  try {
    apiData = await apiService.getRecruitingMetrics?.(fiscalYear, quarter);
  } catch (error) {
    apiError = error.message;
    console.warn('[RecruitingValidation] API unavailable:', error.message);
  }

  // Run validations by category
  const results = {
    summaryMetrics: await validateSummaryMetrics(apiData),
    pipelineStaff: await validatePipelineStaff(apiData),
    pipelineFaculty: await validatePipelineFaculty(apiData),
    applicationSources: await validateApplicationSources(apiData),
    topJobs: await validateTopJobs(apiData),
    demographics: await validateDemographics(apiData),
    requisitionAging: await validateRequisitionAging(apiData),
    hiresBySchool: await validateHiresBySchool(apiData)
  };

  // Calculate summary statistics
  const allResults = Object.values(results).flat();
  const totalChecks = allResults.length;
  const passedChecks = allResults.filter(r => r.status === 'passed').length;
  const failedChecks = allResults.filter(r => r.status === 'failed').length;
  const apiMissingChecks = allResults.filter(r => r.status === 'api_missing').length;

  // Overall status
  let overallStatus = 'passed';
  if (failedChecks > 0) {
    overallStatus = 'failed';
  } else if (apiMissingChecks === totalChecks) {
    overallStatus = 'api_unavailable';
  } else if (passedChecks > 0 && apiMissingChecks > 0) {
    overallStatus = 'partial';
  }

  // Match rate calculation
  const validatedChecks = passedChecks + failedChecks;
  const matchRate = validatedChecks > 0
    ? Math.round((passedChecks / validatedChecks) * 100)
    : 0;

  return {
    fiscalYear,
    quarter,
    status: overallStatus,
    apiAvailable: apiData !== null,
    apiError,
    summary: {
      totalChecks,
      passedChecks,
      failedChecks,
      apiMissingChecks,
      matchRate
    },
    results,
    metadata: {
      excelSource: 'source-metrics/recruiting/Recruiting_Metrics_Master.xlsx',
      apiSource: 'Neon PostgreSQL (fact_recruiting_* tables)',
      duration: Date.now() - startTime
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get validation rules count by category
 */
export function getValidationRulesCounts() {
  return {
    summaryMetrics: VALIDATION_RULES.summaryMetrics.length,
    pipelineStaff: VALIDATION_RULES.pipelineStaff.length,
    pipelineFaculty: VALIDATION_RULES.pipelineFaculty.length,
    applicationSources: VALIDATION_RULES.applicationSources.length,
    topJobs: VALIDATION_RULES.topJobs.length,
    demographics: VALIDATION_RULES.demographics.length,
    requisitionAging: VALIDATION_RULES.requisitionAging.length,
    hiresBySchool: VALIDATION_RULES.hiresBySchool.length,
    total: Object.values(VALIDATION_RULES).flat().length
  };
}

/**
 * Export validation results as JSON
 */
export function exportResults(results) {
  return JSON.stringify(results, null, 2);
}

const recruitingValidationService = {
  VALIDATION_RULES,
  compareValues,
  formatValue,
  validateRecruitingData,
  getValidationRulesCounts,
  exportResults
};

export default recruitingValidationService;
