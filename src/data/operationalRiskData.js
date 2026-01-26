/**
 * Operational Risk - Talent Management (O.3) Data
 *
 * This data represents the operational risk metrics for talent management
 * as displayed in the quarterly HR reports to the Board.
 *
 * Status Key:
 * - "good": Current value is below checkpoint threshold
 * - "checkpoint": Current value is at or above checkpoint but below tolerance
 * - "tolerance": Current value is at or above tolerance threshold (red alert)
 */

export const operationalRiskData = {
  // Report metadata
  reportingDate: "2025-12-31",
  reportingFrequency: "Quarterly",
  reportedBy: "HR",
  reportTitle: "Operational Risk - Talent Management (O.3)",
  fiscalPeriod: "Q2 FY26",

  // Turnover Risk Indicators
  // Status thresholds: checkpoint = yellow, tolerance = red
  turnover: {
    faculty: {
      label: "Faculty",
      current: 2.6,
      checkpoint: 8,
      tolerance: 12,
      benchmark: 8.71,
      benchmarkSource: "CUPA",
      status: "good",
      unit: "%"
    },
    staffExempt: {
      label: "Staff Exempt",
      current: 8.0,
      checkpoint: 18,
      tolerance: 27,
      benchmark: 15.0,
      benchmarkSource: "CUPA",
      status: "good",
      unit: "%"
    },
    staffNonExempt: {
      label: "Staff Non-Exempt",
      current: 17.9,
      checkpoint: 20,
      tolerance: 30,
      benchmark: 20.7,
      benchmarkSource: "CUPA",
      status: "good",
      unit: "%"
    },
    total: {
      label: "Total",
      current: 8.7,
      checkpoint: 16,
      tolerance: 24,
      benchmark: 13.8,
      benchmarkSource: "CUPA",
      status: "good",
      unit: "%"
    }
  },

  // Talent Management Areas
  // These represent the key HR functional areas and their current status
  talentManagement: {
    acquisition: {
      label: "Acquisition",
      status: "good",
      description: "Diverse and deep talent pool",
      icon: "UserPlus"
    },
    onboarding: {
      label: "Onboarding",
      status: "good",
      description: "Establishing Culture",
      icon: "BookOpen"
    },
    retention: {
      label: "Retention",
      status: "good",
      description: "Training and Career Development",
      icon: "Heart"
    },
    hrOperations: {
      label: "HR Operations",
      status: "good",
      description: "Operating Procedures",
      icon: "Settings"
    },
    benefits: {
      label: "Benefits",
      status: "good",
      description: "Package of Benefits (w/o comp.)",
      icon: "Gift"
    },
    compensation: {
      label: "Compensation",
      status: "good",
      description: "Fac, Staff Ex, Staff Non-Ex",
      icon: "DollarSign"
    }
  },

  // Open Positions Risk Indicators
  // Days to fill thresholds
  openPositions: {
    staffExempt: {
      label: "Staff Exempt",
      checkpoint: 90,
      tolerance: 120,
      currentDays: 65,
      status: "good",
      unit: "days"
    },
    staffNonExempt: {
      label: "Staff Non-Exempt",
      checkpoint: 90,
      tolerance: 120,
      currentDays: 58,
      status: "good",
      unit: "days"
    }
  },

  // Overall Risk Assessment
  overallRisk: {
    status: "good",
    label: "Low Overall Risk",
    summary: "All indicators within acceptable ranges. No immediate action required."
  },

  // Legend/Reference Information
  legend: {
    good: {
      color: "green",
      label: "Good",
      description: "Below checkpoint threshold"
    },
    checkpoint: {
      color: "yellow",
      label: "Checkpoint",
      description: "At or above checkpoint, below tolerance"
    },
    tolerance: {
      color: "red",
      label: "Tolerance",
      description: "At or above tolerance threshold"
    }
  },

  // Notes and disclaimers
  notes: [
    "Turnover rates are calculated on a rolling 12-month basis",
    "Benchmarks sourced from CUPA-HR (College and University Professional Association)",
    "Status thresholds established by HR leadership and approved by Finance Committee"
  ]
};

/**
 * Helper function to get status color class
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'good':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500'
      };
    case 'checkpoint':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
      };
    case 'tolerance':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        dot: 'bg-red-500'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        dot: 'bg-gray-500'
      };
  }
};

/**
 * Helper function to get status emoji
 */
export const getStatusEmoji = (status) => {
  switch (status) {
    case 'good':
      return '🟢';
    case 'checkpoint':
      return '🟡';
    case 'tolerance':
      return '🔴';
    default:
      return '⚪';
  }
};

/**
 * Helper function to calculate status based on value and thresholds
 */
export const calculateStatus = (value, checkpoint, tolerance) => {
  if (value >= tolerance) return 'tolerance';
  if (value >= checkpoint) return 'checkpoint';
  return 'good';
};

export default operationalRiskData;
