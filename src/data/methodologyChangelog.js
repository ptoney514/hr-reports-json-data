/**
 * Methodology Change Log
 * Tracks all formula and calculation methodology changes
 * Used for audit trail and data quality tracking
 */

export const METHODOLOGY_CHANGELOG = [
  {
    id: 'grade-r-exclusion-2025-11',
    date: '2025-11-19',
    title: 'Grade R (Residents/Fellows) Exclusion from Benefit-Eligible Counts',
    type: 'formula_change',
    severity: 'critical',
    affectedReports: ['Q1 FY26 Workforce', 'Q1 FY26 Turnover', 'Q1 FY26 Exit Survey'],
    affectedQuarters: ['2025-09-30'],

    description: 'Grade R employees (PT Residents, OT Fellows, Pharmacy Residents/Fellows) have F12/PT12 assignment categories but are NOT benefit-eligible. They are training program participants with different compensation structures.',

    formulaChange: {
      before: {
        label: 'Old Formula (Incorrect)',
        formula: 'Benefit-Eligible = WHERE Assignment IN (F12, F11, F10, F09, PT12, PT11, PT10, PT9)',
        issue: 'Incorrectly included Grade R employees'
      },
      after: {
        label: 'New Formula (Correct)',
        formula: [
          'Step 1: Assignment Filter = WHERE Assignment IN (F12, F11, F10, F09, PT12, PT11, PT10, PT9)',
          'Step 2: Grade R Exclusion = WHERE Grade NOT LIKE "R%"',
          'Benefit-Eligible = Step 1 AND Step 2'
        ],
        rationale: 'Two-step filter: Assignment Category + Grade exclusion'
      }
    },

    dataImpact: {
      q1_fy26: {
        workforce: {
          before: { benefitEligibleStaff: 1431, temporary: 630 },
          after: { benefitEligibleStaff: 1419, temporary: 642 },
          change: { benefitEligibleStaff: -12, temporary: +12 },
          notes: '12 Grade R employees moved from benefit-eligible to temporary'
        },
        terminations: {
          before: { total: 73, staffExempt: 39, endOfAssignment: 12 },
          after: { total: 58, staffExempt: 24, endOfAssignment: 0 },
          change: { total: -15, staffExempt: -15, endOfAssignment: -12 },
          notes: 'All 12 "End of Assignment" terminations were Grade R program completions'
        },
        exitSurvey: {
          before: { responseRate: 20.5, totalExits: 73, responses: 15 },
          after: { responseRate: 25.9, totalExits: 58, responses: 15 },
          change: { responseRate: +5.4, totalExits: -15, responses: 0 },
          notes: 'Response rate improved due to reduced denominator'
        }
      }
    },

    gradeRBreakdown: {
      totalGradeR: 625,
      byAssignment: {
        HSR: { count: 613, eligible: false, note: 'House Staff Residents - already excluded' },
        F12: { count: 12, eligible: false, note: 'PT/OT/Pharmacy Residents - newly excluded' }
      },
      byJobTitle: {
        'Physical Therapy Resident': 6,
        'Occupational Therapy Fellow': 3,
        'Pharmacy Resident/Fellow': 3
      },
      terminations: {
        total: 15,
        byJobTitle: {
          'Physical Therapy Resident': 11,
          'Pharmacy Resident': 2,
          'Occupational Therapy Fellow': 2
        }
      }
    },

    filesModified: [
      'WORKFORCE_METHODOLOGY.md',
      'source-metrics/terminations/TERMINATION_METHODOLOGY.md',
      'scripts/extract_q1_fy26_details.py',
      'scripts/extract_q1_fy26_workforce.js',
      'src/data/staticData.js (QUARTERLY_WORKFORCE_DATA, QUARTERLY_TURNOVER_DATA, EXIT_SURVEY_DATA)',
      'src/components/dashboards/ExitSurveyQ1FY26Dashboard.jsx'
    ],

    validation: {
      automatedTests: ['test_grade_r_exclusion.py - 5 tests, all passing'],
      checks: [
        'Faculty + Staff = Total (4 + 54 = 58)',
        'Grade R properly excluded (625 employees)',
        '100% of Grade R are Residents/Fellows',
        'All workforce categories sum correctly'
      ]
    },

    documentation: 'GRADE_R_EXCLUSION_SUMMARY.md',
    relatedIssues: ['#49 - Apply to historical data'],
    commitHash: 'd26f1b7'
  }

  // Future methodology changes will be added here
  // Template:
  // {
  //   id: 'unique-id',
  //   date: 'YYYY-MM-DD',
  //   title: 'Change description',
  //   type: 'formula_change' | 'data_source_change' | 'calculation_update',
  //   severity: 'critical' | 'major' | 'minor',
  //   affectedReports: [],
  //   affectedQuarters: [],
  //   description: '',
  //   formulaChange: { before: {}, after: {} },
  //   dataImpact: {},
  //   filesModified: [],
  //   validation: {},
  //   documentation: '',
  //   relatedIssues: [],
  //   commitHash: ''
  // }
];

/**
 * Get methodology changes by date range
 */
export const getChangesByDateRange = (startDate, endDate) => {
  return METHODOLOGY_CHANGELOG.filter(change => {
    const changeDate = new Date(change.date);
    return changeDate >= new Date(startDate) && changeDate <= new Date(endDate);
  });
};

/**
 * Get methodology changes by quarter
 */
export const getChangesByQuarter = (quarterDate) => {
  return METHODOLOGY_CHANGELOG.filter(change =>
    change.affectedQuarters.includes(quarterDate)
  );
};

/**
 * Get methodology changes by type
 */
export const getChangesByType = (type) => {
  return METHODOLOGY_CHANGELOG.filter(change => change.type === type);
};

/**
 * Get most recent methodology change
 */
export const getMostRecentChange = () => {
  if (METHODOLOGY_CHANGELOG.length === 0) return null;

  return [...METHODOLOGY_CHANGELOG].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  )[0];
};

export default METHODOLOGY_CHANGELOG;
