// Hard-coded HR data with exact reporting dates
// No quarterly logic - only specific reporting dates

export const WORKFORCE_DATA = {
  "2025-03-31": {
    reportingDate: "3/31/25",
    starters: {
      omaha: 207,
      phoenix: 18,
      total: 225
    },
    totalEmployees: 2815,
    faculty: 1192,
    staff: 1623,
    locations: {
      "Omaha Campus": 2119,
      "Phoenix Campus": 696
    },
    // Add other workforce metrics as needed
    vacancyRate: 4.3,
    departures: 69,
    netChange: 18
  },
  "2025-06-30": {
    reportingDate: "6/30/25", 
    starters: {
      omaha: 162,
      phoenix: 100,
      total: 262
    },
    totalEmployees: 2847,
    faculty: 1203,
    staff: 1644,
    locations: {
      "Omaha Campus": 2145,
      "Phoenix Campus": 702
    },
    // Add other workforce metrics as needed
    vacancyRate: 4.2,
    departures: 72,
    netChange: 17
  }
};

export const TURNOVER_DATA = {
  "2025-03-31": {
    reportingDate: "3/31/25",
    totalTurnoverRate: 7.9,
    facultyTurnoverRate: 6.2,
    staffTurnoverRate: 8.5,
    voluntaryTurnover: 5.8,
    involuntaryTurnover: 2.1
  },
  "2025-06-30": {
    reportingDate: "6/30/25", 
    totalTurnoverRate: 8.1,
    facultyTurnoverRate: 6.4,
    staffTurnoverRate: 8.7,
    voluntaryTurnover: 6.0,
    involuntaryTurnover: 2.1
  }
};

export const RECRUITING_DATA = {
  "2025-03-31": {
    reportingDate: "3/31/25",
    openPositions: 119,
    newHiresYTD: 187,
    costPerHire: 4350,
    timeToFill: 44
  },
  "2025-06-30": {
    reportingDate: "6/30/25",
    openPositions: 127,
    newHiresYTD: 228,
    costPerHire: 4200,
    timeToFill: 45
  }
};

export const EXIT_SURVEY_DATA = {
  "2025-03-31": {
    reportingDate: "3/31/25",
    responseRate: 68,
    totalResponses: 47,
    overallSatisfaction: 3.2,
    wouldRecommend: 62
  },
  "2025-06-30": {
    reportingDate: "6/30/25",
    responseRate: 72,
    totalResponses: 52,
    overallSatisfaction: 3.4,
    wouldRecommend: 65
  }
};

// Available reporting dates (no quarters!)
export const AVAILABLE_DATES = [
  { value: "2025-03-31", label: "3/31/25" },
  { value: "2025-06-30", label: "6/30/25" }
];

// Helper functions for accessing data
export const getWorkforceData = (date = "2025-06-30") => {
  return WORKFORCE_DATA[date] || WORKFORCE_DATA["2025-06-30"];
};

export const getTurnoverData = (date = "2025-06-30") => {
  return TURNOVER_DATA[date] || TURNOVER_DATA["2025-06-30"];
};

export const getRecruitingData = (date = "2025-06-30") => {
  return RECRUITING_DATA[date] || RECRUITING_DATA["2025-06-30"];
};

export const getExitSurveyData = (date = "2025-06-30") => {
  return EXIT_SURVEY_DATA[date] || EXIT_SURVEY_DATA["2025-06-30"];
};