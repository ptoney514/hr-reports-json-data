// Real Data Validation Service for HR Reports
import { WORKFORCE_DATA, TURNOVER_DATA, EXIT_SURVEY_DATA, RECRUITING_DATA } from '../data/staticData';

class DataValidationService {
  constructor() {
    this.validationResults = [];
    this.errors = [];
    this.warnings = [];
  }

  // Main validation runner
  async runAllValidations() {
    this.validationResults = [];
    this.errors = [];
    this.warnings = [];

    const results = {
      timestamp: new Date().toISOString(),
      dataConsistency: await this.validateDataConsistency(),
      turnoverSync: await this.validateTurnoverSync(),
      exitSurveyValidation: await this.validateExitSurveys(),
      calculationAccuracy: await this.validateCalculations(),
      locationDistribution: await this.validateLocationDistribution(),
      errors: this.errors,
      warnings: this.warnings,
      passed: this.errors.length === 0
    };

    // Save to localStorage for audit trail
    this.saveValidationResults(results);
    
    return results;
  }

  // Validate location distribution (Omaha vs Phoenix)
  validateLocationDistribution() {
    const validation = {
      name: 'Location Distribution',
      checks: [],
      status: 'passed'
    };

    try {
      const currentData = WORKFORCE_DATA["2025-06-30"];
      const locations = currentData.locationDistribution;
      
      // Check Omaha totals
      const omahaTotal = locations.omaha.faculty + locations.omaha.staff + 
                        locations.omaha.hsp + locations.omaha.students + 
                        locations.omaha.temp;
      
      validation.checks.push({
        item: 'Omaha Total',
        expected: 4287,
        actual: omahaTotal,
        passed: omahaTotal === 4287
      });

      // Check Phoenix totals
      const phoenixTotal = locations.phoenix.faculty + locations.phoenix.staff + 
                          locations.phoenix.hsp + locations.phoenix.students + 
                          locations.phoenix.temp;
      
      validation.checks.push({
        item: 'Phoenix Total',
        expected: 750,
        actual: phoenixTotal,
        passed: phoenixTotal === 750
      });

      // Check student distribution ratio
      const totalStudents = locations.omaha.students + locations.phoenix.students;
      const phoenixStudentRatio = (locations.phoenix.students / totalStudents * 100).toFixed(1);
      
      validation.checks.push({
        item: 'Phoenix Student Ratio',
        expected: '>15%',
        actual: phoenixStudentRatio + '%',
        passed: phoenixStudentRatio > 15,
        warning: phoenixStudentRatio < 15 ? 'Phoenix student ratio seems unusually low' : null
      });

      if (phoenixStudentRatio < 15) {
        this.warnings.push({
          type: 'Location Distribution',
          message: `Phoenix students (${locations.phoenix.students}) is only ${phoenixStudentRatio}% of total students. Expected ratio >15%`,
          severity: 'medium'
        });
        validation.status = 'warning';
      }

      // Check if components sum to grand total
      const grandTotal = omahaTotal + phoenixTotal;
      validation.checks.push({
        item: 'Grand Total',
        expected: 5037,
        actual: grandTotal,
        passed: grandTotal === 5037
      });

      if (grandTotal !== 5037) {
        this.errors.push({
          type: 'Location Distribution',
          message: `Location totals (${grandTotal}) don't match expected total (5037)`,
          severity: 'high'
        });
        validation.status = 'failed';
      }

    } catch (error) {
      validation.status = 'failed';
      this.errors.push({
        type: 'Location Distribution',
        message: error.message,
        severity: 'critical'
      });
    }

    return validation;
  }

  // Validate data consistency across sources
  validateDataConsistency() {
    const validation = {
      name: 'Data Consistency',
      checks: [],
      status: 'passed'
    };

    try {
      // Check FY25 turnover totals match across all quarters
      const fy25Quarters = ["2024-09-30", "2024-12-31", "2025-03-31", "2025-06-30"];
      const quarterTotals = {
        Q1: { exits: 79, faculty: 5, staff: 74 },
        Q2: { exits: 36, faculty: 3, staff: 33 },
        Q3: { exits: 52, faculty: 9, staff: 43 },
        Q4: { exits: 51, faculty: 15, staff: 36 }
      };

      fy25Quarters.forEach((quarter, index) => {
        const qName = `Q${index + 1}`;
        const expected = quarterTotals[qName];
        const actual = EXIT_SURVEY_DATA[quarter];
        
        if (actual) {
          const exitMatch = actual.totalExits === expected.exits;
          validation.checks.push({
            item: `FY25 ${qName} Total Exits`,
            expected: expected.exits,
            actual: actual.totalExits,
            passed: exitMatch
          });

          if (!exitMatch) {
            this.errors.push({
              type: 'Data Consistency',
              message: `${qName} exit count mismatch: Expected ${expected.exits}, got ${actual.totalExits}`,
              severity: 'high'
            });
            validation.status = 'failed';
          }
        }
      });

      // Validate total unique employees
      const totalExits = Object.values(quarterTotals).reduce((sum, q) => sum + q.exits, 0);
      validation.checks.push({
        item: 'FY25 Total Unique Exits',
        expected: 222,
        actual: totalExits,
        passed: totalExits === 222
      });

    } catch (error) {
      validation.status = 'failed';
      this.errors.push({
        type: 'Data Consistency',
        message: error.message,
        severity: 'critical'
      });
    }

    return validation;
  }

  // Validate turnover sync
  validateTurnoverSync() {
    const validation = {
      name: 'Turnover Sync',
      checks: [],
      status: 'passed'
    };

    try {
      // Check each quarter's turnover data
      const quarters = {
        "2024-09-30": { total: 79, voluntary: 60, involuntary: 19 },
        "2024-12-31": { total: 36, voluntary: 25, involuntary: 11 },
        "2025-03-31": { total: 52, voluntary: 38, involuntary: 14 },
        "2025-06-30": { total: 51, voluntary: 37, involuntary: 14 }
      };

      Object.entries(quarters).forEach(([quarter, expected]) => {
        const actual = TURNOVER_DATA[quarter];
        
        if (actual) {
          const totalMatch = actual.totalTerminations === expected.total;
          validation.checks.push({
            item: `${quarter} Total Terminations`,
            expected: expected.total,
            actual: actual.totalTerminations,
            passed: totalMatch
          });

          if (!totalMatch) {
            this.errors.push({
              type: 'Turnover Sync',
              message: `${quarter} turnover mismatch: Expected ${expected.total}, got ${actual.totalTerminations}`,
              severity: 'high'
            });
            validation.status = 'failed';
          }
        }
      });

    } catch (error) {
      validation.status = 'failed';
      this.errors.push({
        type: 'Turnover Sync',
        message: error.message,
        severity: 'critical'
      });
    }

    return validation;
  }

  // Validate exit survey data
  validateExitSurveys() {
    const validation = {
      name: 'Exit Survey Validation',
      checks: [],
      status: 'passed'
    };

    try {
      // Calculate overall response rate
      let totalResponses = 0;
      let totalExits = 0;
      
      const fy25Quarters = ["2024-09-30", "2024-12-31", "2025-03-31", "2025-06-30"];
      
      fy25Quarters.forEach(quarter => {
        if (EXIT_SURVEY_DATA[quarter]) {
          totalResponses += EXIT_SURVEY_DATA[quarter].totalResponses;
          totalExits += EXIT_SURVEY_DATA[quarter].totalExits;
        }
      });

      const responseRate = ((totalResponses / totalExits) * 100).toFixed(1);
      
      validation.checks.push({
        item: 'FY25 Response Rate',
        expected: '31.1%',
        actual: responseRate + '%',
        passed: responseRate === '31.1'
      });

      validation.checks.push({
        item: 'Total Survey Responses',
        expected: 69,
        actual: totalResponses,
        passed: totalResponses === 69
      });

      // Validate satisfaction scores are in range
      fy25Quarters.forEach(quarter => {
        const data = EXIT_SURVEY_DATA[quarter];
        if (data && data.overallSatisfaction) {
          const satisfactionValid = data.overallSatisfaction >= 1 && data.overallSatisfaction <= 5;
          validation.checks.push({
            item: `${quarter} Satisfaction Score Range`,
            expected: '1-5',
            actual: data.overallSatisfaction.toFixed(1),
            passed: satisfactionValid
          });

          if (!satisfactionValid) {
            this.errors.push({
              type: 'Exit Survey',
              message: `Invalid satisfaction score for ${quarter}: ${data.overallSatisfaction}`,
              severity: 'high'
            });
            validation.status = 'failed';
          }
        }
      });

    } catch (error) {
      validation.status = 'failed';
      this.errors.push({
        type: 'Exit Survey',
        message: error.message,
        severity: 'critical'
      });
    }

    return validation;
  }

  // Validate calculations
  validateCalculations() {
    const validation = {
      name: 'Calculation Accuracy',
      checks: [],
      status: 'passed'
    };

    try {
      // Validate YoY calculations
      const fy24Data = WORKFORCE_DATA["2024-06-30"];
      const fy25Data = WORKFORCE_DATA["2025-06-30"];
      
      if (fy24Data && fy25Data) {
        // Check headcount change calculation
        const fy24Total = fy24Data.totalEmployees;
        const fy25Total = fy25Data.totalEmployees;
        const actualChange = ((fy25Total - fy24Total) / fy24Total * 100).toFixed(1);
        
        validation.checks.push({
          item: 'YoY Headcount Change',
          expected: '0.8%',
          actual: actualChange + '%',
          passed: Math.abs(parseFloat(actualChange) - 0.8) < 0.1
        });

        // Check turnover rate calculation
        const q4Turnover = TURNOVER_DATA["2025-06-30"];
        if (q4Turnover) {
          const turnoverRate = (q4Turnover.totalTerminations / fy25Total * 100).toFixed(1);
          validation.checks.push({
            item: 'Q4 Turnover Rate',
            expected: '<5%',
            actual: turnoverRate + '%',
            passed: parseFloat(turnoverRate) < 5
          });
        }
      }

    } catch (error) {
      validation.status = 'failed';
      this.errors.push({
        type: 'Calculations',
        message: error.message,
        severity: 'critical'
      });
    }

    return validation;
  }

  // Save validation results to localStorage
  saveValidationResults(results) {
    try {
      // Get existing audit log
      const existingLog = JSON.parse(localStorage.getItem('dataValidationAuditLog') || '[]');
      
      // Create audit entry
      const auditEntry = {
        id: Date.now(),
        timestamp: results.timestamp,
        action: 'Full System Validation',
        status: results.passed ? 'success' : 'error',
        details: `${results.errors.length} errors, ${results.warnings.length} warnings`,
        user: 'System',
        results: results
      };
      
      // Add to log and keep last 100 entries
      const newLog = [auditEntry, ...existingLog].slice(0, 100);
      localStorage.setItem('dataValidationAuditLog', JSON.stringify(newLog));
      
      // Save current status
      const status = {
        dataConsistency: results.dataConsistency.status,
        turnoverSync: results.turnoverSync.status,
        exitSurveyValidation: results.exitSurveyValidation.status,
        calculationAccuracy: results.calculationAccuracy.status,
        locationDistribution: results.locationDistribution.status,
        lastValidated: results.timestamp
      };
      
      localStorage.setItem('dataValidationStatus', JSON.stringify(status));
      
    } catch (error) {
      console.error('Error saving validation results:', error);
    }
  }

  // Get validation summary
  getValidationSummary() {
    const status = JSON.parse(localStorage.getItem('dataValidationStatus') || '{}');
    const auditLog = JSON.parse(localStorage.getItem('dataValidationAuditLog') || '[]');
    
    return {
      status,
      auditLog,
      lastValidated: status.lastValidated ? new Date(status.lastValidated) : null
    };
  }
}

export default new DataValidationService();