/**
 * Methodology Change Log
 * Tracks all formula and calculation methodology changes
 * Used for audit trail and data quality tracking
 */

export const METHODOLOGY_CHANGELOG = [
  {
    id: 'grade-r-inclusion-2025-12',
    date: '2025-12-04',
    title: 'Grade R (Residents/Fellows) Inclusion as Benefit-Eligible under House Staff Physicians',
    type: 'formula_change',
    severity: 'critical',
    affectedReports: ['Q1 FY26 Workforce', 'Q1 FY26 Turnover', 'Q1 FY26 Exit Survey'],
    affectedQuarters: ['2025-09-30'],

    description: 'Grade R employees (PT Residents, OT Fellows, Pharmacy Residents/Fellows) are now included as benefit-eligible under the House Staff Physicians (HSP) category. This reverses the November 2025 exclusion policy.',

    formulaChange: {
      before: {
        label: 'Previous Formula (Nov 2025 - Exclusion)',
        formula: [
          'Step 1: Assignment Filter = WHERE Assignment IN (F12, F11, F10, F09, PT12, PT11, PT10, PT9)',
          'Step 2: Grade R Exclusion = WHERE Grade NOT LIKE "R%"',
          'Benefit-Eligible = Step 1 AND Step 2'
        ],
        issue: 'Excluded Grade R from benefit-eligible counts'
      },
      after: {
        label: 'New Formula (Dec 2025 - Inclusion)',
        formula: [
          'Faculty/Staff: WHERE Assignment IN (F12, F11, F10, F09, PT12, PT11, PT10, PT9) AND Person Type IN (FACULTY, STAFF)',
          'House Staff Physicians: WHERE Assignment = HSR OR Grade LIKE "R%"',
          'Benefit-Eligible = Faculty + Staff + House Staff Physicians'
        ],
        rationale: 'Grade R employees are benefit-eligible as part of House Staff Physicians category'
      }
    },

    dataImpact: {
      q1_fy26: {
        workforce: {
          before: { houseStaffPhysicians: 613, temporary: 642 },
          after: { houseStaffPhysicians: 625, temporary: 630 },
          change: { houseStaffPhysicians: +12, temporary: -12 },
          notes: '12 Grade R employees moved from temporary to House Staff Physicians'
        },
        terminations: {
          before: { total: 58, staffExempt: 24, hsp: 0 },
          after: { total: 73, staffExempt: 39, hsp: 15 },
          change: { total: +15, staffExempt: +15, hsp: +15 },
          notes: '15 Grade R terminations now included as benefit-eligible HSP'
        },
        exitSurvey: {
          before: { responseRate: 25.9, totalExits: 58, responses: 15 },
          after: { responseRate: 20.5, totalExits: 73, responses: 15 },
          change: { responseRate: -5.4, totalExits: +15, responses: 0 },
          notes: 'Response rate adjusted due to increased denominator'
        }
      }
    },

    gradeRBreakdown: {
      totalHSP: 625,
      byAssignment: {
        HSR: { count: 613, eligible: true, note: 'House Staff Residents - benefit-eligible' },
        F12: { count: 12, eligible: true, note: 'PT/OT/Pharmacy Residents - now included as HSP' }
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
      'docs/QUARTERLY_WORKFORCE_METHODOLOGY.md',
      'source-metrics/workforce/WORKFORCE_METHODOLOGY.md',
      'source-metrics/terminations/TERMINATION_METHODOLOGY.md',
      'NEW_HIRES_METHODOLOGY.md',
      'src/data/staticData.js',
      'src/services/dataBreakdownService.js',
      'src/data/methodologyChangelog.js',
      'src/components/dashboards/*.jsx (multiple)',
      'scripts/*.py (multiple)'
    ],

    validation: {
      automatedTests: ['test_grade_r_inclusion.py - validates inclusion'],
      checks: [
        'Faculty + Staff + HSP = Total BE (4 + 54 + 15 = 73 terminations)',
        'Grade R properly included as HSP (625 employees)',
        'HSP = HSR (613) + Grade R with F12 (12)',
        'All workforce categories sum correctly'
      ]
    },

    supersedes: 'grade-r-exclusion-2025-11',
    documentation: 'WORKFORCE_METHODOLOGY.md (Grade R Inclusion section)',
    relatedIssues: [],
    commitHash: ''
  },
  {
    id: 'grade-r-exclusion-2025-11',
    date: '2025-11-19',
    title: '[SUPERSEDED] Grade R (Residents/Fellows) Exclusion from Benefit-Eligible Counts',
    type: 'formula_change',
    severity: 'critical',
    status: 'superseded',
    supersededBy: 'grade-r-inclusion-2025-12',
    affectedReports: ['Q1 FY26 Workforce', 'Q1 FY26 Turnover', 'Q1 FY26 Exit Survey'],
    affectedQuarters: ['2025-09-30'],

    description: '[SUPERSEDED by grade-r-inclusion-2025-12] Grade R employees were temporarily excluded from benefit-eligible counts. This policy has been reversed as of December 2025.',

    formulaChange: {
      before: {
        label: 'Old Formula',
        formula: 'Benefit-Eligible = WHERE Assignment IN (F12, F11, F10, F09, PT12, PT11, PT10, PT9)',
        issue: 'Did not account for Grade R'
      },
      after: {
        label: 'Exclusion Formula (Now Superseded)',
        formula: [
          'Step 1: Assignment Filter = WHERE Assignment IN (F12, F11, F10, F09, PT12, PT11, PT10, PT9)',
          'Step 2: Grade R Exclusion = WHERE Grade NOT LIKE "R%"',
          'Benefit-Eligible = Step 1 AND Step 2'
        ],
        rationale: 'This formula has been superseded - Grade R is now included as HSP'
      }
    },

    dataImpact: {
      q1_fy26: {
        note: 'These impacts have been reversed by grade-r-inclusion-2025-12'
      }
    },

    gradeRBreakdown: {
      note: 'See grade-r-inclusion-2025-12 for current Grade R handling'
    },

    filesModified: [],

    validation: {
      automatedTests: ['Superseded by test_grade_r_inclusion.py'],
      checks: []
    },

    documentation: 'GRADE_R_EXCLUSION_SUMMARY.md (deleted)',
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
