// Hard-coded HR data with exact reporting dates
// No quarterly logic - only specific reporting dates

export const WORKFORCE_DATA = {
  "2025-03-31": {
    reportingDate: "3/31/25",
    starters: {
      omaha: 207,
      phoenix: 100,
      total: 307
    },
    studentCount: {
      total: 1491,
      studentWorker: 1384,
      fws: 107
    },
    totalEmployees: 3328,
    faculty: 967,
    staff: 1761,
    hsp: 600,
    locations: {
      "Omaha Campus": 2759,
      "Phoenix Campus": 569
    },
    locationDetails: {
      omaha: {
        faculty: 906,
        staff: 1590,
        hsp: 263
      },
      phoenix: {
        faculty: 61,
        staff: 171,
        hsp: 337
      }
    },
    departments: [
      { name: "College of Medicine", total: 485, faculty: 312, staff: 173 },
      { name: "Academic Affairs", total: 298, faculty: 198, staff: 100 },
      { name: "Student Affairs", total: 245, faculty: 89, staff: 156 },
      { name: "Information Technology", total: 189, faculty: 45, staff: 144 },
      { name: "Finance & Administration", total: 167, faculty: 23, staff: 144 },
      { name: "College of Nursing", total: 145, faculty: 98, staff: 47 },
      { name: "Human Resources", total: 134, faculty: 12, staff: 122 },
      { name: "Research & Innovation", total: 128, faculty: 87, staff: 41 },
      { name: "College of Pharmacy", total: 112, faculty: 76, staff: 36 },
      { name: "Library Services", total: 98, faculty: 34, staff: 64 }
    ],
    assignmentTypes: [
      { type: "Full-Time", count: 2135, percentage: 64.2 },
      { type: "House Staff Physicians", count: 600, percentage: 18.0 },
      { type: "Temporary", count: 515, percentage: 15.5 },
      { type: "Part-Time Regular", count: 78, percentage: 2.3 }
    ],
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
    studentCount: {
      total: 1714,
      studentWorker: 1607,
      fws: 107
    },
    totalEmployees: 3206,
    faculty: 785,
    staff: 1809,
    hsp: 612,
    locations: {
      "Omaha Campus": 2566,
      "Phoenix Campus": 640
    },
    locationDetails: {
      omaha: {
        faculty: 727,
        staff: 1571,
        hsp: 268
      },
      phoenix: {
        faculty: 58,
        staff: 238,
        hsp: 344
      }
    },
    departments: [
      { name: "College of Medicine", total: 492, faculty: 318, staff: 174 },
      { name: "Academic Affairs", total: 304, faculty: 201, staff: 103 },
      { name: "Student Affairs", total: 251, faculty: 91, staff: 160 },
      { name: "Information Technology", total: 195, faculty: 47, staff: 148 },
      { name: "Finance & Administration", total: 172, faculty: 24, staff: 148 },
      { name: "College of Nursing", total: 149, faculty: 101, staff: 48 },
      { name: "Human Resources", total: 138, faculty: 13, staff: 125 },
      { name: "Research & Innovation", total: 132, faculty: 89, staff: 43 },
      { name: "College of Pharmacy", total: 116, faculty: 78, staff: 38 },
      { name: "Library Services", total: 101, faculty: 36, staff: 65 }
    ],
    schoolOrgData: [
      { name: "Medicine", faculty: 117, staff: 206, hsp: 268, total: 591 },
      { name: "Phoenix", faculty: 0, staff: 28, hsp: 344, total: 372 },
      { name: "Pharmacy & Health Professions", faculty: 120, staff: 214, hsp: 0, total: 334 },
      { name: "Arts & Sciences", faculty: 253, staff: 67, hsp: 0, total: 320 },
      { name: "Nursing", faculty: 94, staff: 52, hsp: 0, total: 146 },
      { name: "Dentistry", faculty: 76, staff: 76, hsp: 0, total: 152 },
      { name: "Facilities", faculty: 0, staff: 152, hsp: 0, total: 152 },
      { name: "Provost", faculty: 2, staff: 121, hsp: 0, total: 123 },
      { name: "VPSL", faculty: 0, staff: 109, hsp: 0, total: 109 },
      { name: "Athletics", faculty: 0, staff: 89, hsp: 0, total: 89 },
      { name: "Heider College of Business", faculty: 67, staff: 19, hsp: 0, total: 86 },
      { name: "VPIT", faculty: 0, staff: 85, hsp: 0, total: 85 },
      { name: "VPEM", faculty: 0, staff: 79, hsp: 0, total: 79 },
      { name: "VPUR", faculty: 0, staff: 77, hsp: 0, total: 77 },
      { name: "SueSucs", faculty: 0, staff: 72, hsp: 0, total: 72 },
      { name: "Law School", faculty: 28, staff: 26, hsp: 0, total: 54 },
      { name: "VPFN", faculty: 0, staff: 54, hsp: 0, total: 54 },
      { name: "Public Safety", faculty: 0, staff: 52, hsp: 0, total: 52 },
      { name: "CollProCE", faculty: 26, staff: 14, hsp: 0, total: 40 },
      { name: "UCOM", faculty: 0, staff: 35, hsp: 0, total: 35 },
      { name: "VPLS", faculty: 0, staff: 33, hsp: 0, total: 33 },
      { name: "Research", faculty: 0, staff: 27, hsp: 0, total: 27 },
      { name: "HR", faculty: 0, staff: 24, hsp: 0, total: 24 },
      { name: "VPGE", faculty: 1, staff: 21, hsp: 0, total: 22 },
      { name: "VPMM", faculty: 0, staff: 20, hsp: 0, total: 20 },
      { name: "CFE", faculty: 0, staff: 18, hsp: 0, total: 18 },
      { name: "GENC", faculty: 0, staff: 9, hsp: 0, total: 9 },
      { name: "EVP", faculty: 0, staff: 8, hsp: 0, total: 8 },
      { name: "EDI", faculty: 0, staff: 7, hsp: 0, total: 7 },
      { name: "VPAA", faculty: 0, staff: 6, hsp: 0, total: 6 },
      { name: "PRES", faculty: 0, staff: 4, hsp: 0, total: 4 },
      { name: "JesCom", faculty: 0, staff: 3, hsp: 0, total: 3 },
      { name: "(blank)", faculty: 1, staff: 2, hsp: 0, total: 3 }
    ],
    assignmentTypes: [
      { type: "Full-Time", count: 2059, percentage: 64.2 },
      { type: "House Staff Physicians", count: 612, percentage: 19.1 },
      { type: "Temporary", count: 457, percentage: 14.3 },
      { type: "Part-Time Regular", count: 77, percentage: 2.4 }
    ],
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
    involuntaryTurnover: 2.1,
    terminations: 55,
    starters: 225,
    leavers: 55,
    netChange: 18,
    monthlyTrends: [
      { month: "Jan", starters: 78, leavers: 23, net: 55 },
      { month: "Feb", starters: 67, leavers: 28, net: 39 },
      { month: "Mar", starters: 80, leavers: 18, net: 62 }
    ],
    exitReasons: [
      { reason: "Resignation - Better Opportunity", count: 18, percentage: 26.1 },
      { reason: "Resignation - Personal", count: 14, percentage: 20.3 },
      { reason: "Resignation - Career Change", count: 12, percentage: 17.4 },
      { reason: "Termination - Performance", count: 8, percentage: 11.6 },
      { reason: "Retirement", count: 7, percentage: 10.1 },
      { reason: "Termination - Policy", count: 5, percentage: 7.2 },
      { reason: "Other", count: 5, percentage: 7.2 }
    ],
    schoolTurnover: [
      { school: "College of Medicine", rate: 6.8, departures: 33 },
      { school: "Academic Affairs", rate: 7.2, departures: 21 },
      { school: "Student Affairs", rate: 8.9, departures: 22 },
      { school: "Information Technology", rate: 5.3, departures: 10 },
      { school: "Finance & Administration", rate: 9.6, departures: 16 }
    ]
  },
  "2025-06-30": {
    reportingDate: "6/30/25", 
    totalTurnoverRate: 8.1,
    facultyTurnoverRate: 6.4,
    staffTurnoverRate: 8.7,
    voluntaryTurnover: 6.0,
    involuntaryTurnover: 2.1,
    terminations: 62,
    starters: 262,
    leavers: 62,
    netChange: 17,
    monthlyTrends: [
      { month: "Apr", starters: 89, leavers: 25, net: 64 },
      { month: "May", starters: 85, leavers: 24, net: 61 },
      { month: "Jun", starters: 88, leavers: 23, net: 65 }
    ],
    exitReasons: [
      { reason: "Resigned", total: 25, percentage: 40.3, faculty: 3, staff: 22 },
      { reason: "Retirement", total: 14, percentage: 22.6, faculty: 9, staff: 5 },
      { reason: "End Assignment", total: 9, percentage: 14.5, faculty: 7, staff: 2 },
      { reason: "Better Opportunity", total: 5, percentage: 8.1, faculty: 0, staff: 5 },
      { reason: "Invol Performance", total: 3, percentage: 4.8, faculty: 1, staff: 2 },
      { reason: "Personal Reasons", total: 2, percentage: 3.2, faculty: 0, staff: 2 },
      { reason: "Relocation", total: 2, percentage: 3.2, faculty: 0, staff: 2 },
      { reason: "Death", total: 1, percentage: 1.6, faculty: 1, staff: 0 },
      { reason: "Reduction In Force", total: 1, percentage: 1.6, faculty: 0, staff: 1 }
    ],
    schoolTurnover: [
      { school: "College of Medicine", rate: 7.1, departures: 35 },
      { school: "Academic Affairs", rate: 7.6, departures: 23 },
      { school: "Student Affairs", rate: 9.2, departures: 23 },
      { school: "Information Technology", rate: 5.6, departures: 11 },
      { school: "Finance & Administration", rate: 9.9, departures: 17 }
    ],
    facultyTurnoverByDivision: [
      { division: "College of Nursing", rate: 13.7 },
      { division: "Pharmacy & Health Professions", rate: 7.5 },
      { division: "School of Dentistry", rate: 6.9 },
      { division: "Total Faculty Turnover", rate: 6.3 },
      { division: "School of Medicine", rate: 5.6 },
      { division: "Law School", rate: 3.7 },
      { division: "Heider College of Business", rate: 1.6 },
      { division: "Coll of Pro Studies and Cont Ed", rate: 0.0 }
    ],
    turnoverByLengthOfService: {
      faculty: [
        { name: "Less Than One", tenure: "< 1 Year", percentage: 13.8, value: 9 },
        { name: "1 to 5", tenure: "1-5 Years", percentage: 7.2, value: 5 },
        { name: "5 to 10", tenure: "5-10 Years", percentage: 5.5, value: 4 },
        { name: "10 to 20", tenure: "10-20 Years", percentage: 4.0, value: 3 },
        { name: "20 Plus", tenure: "20+ Years", percentage: 6.2, value: 4 }
      ],
      staff: [
        { name: "Less Than One", tenure: "< 1 Year", percentage: 29.8, value: 18 },
        { name: "1 to 5", tenure: "1-5 Years", percentage: 14.2, value: 9 },
        { name: "5 to 10", tenure: "5-10 Years", percentage: 11.6, value: 7 },
        { name: "10 to 20", tenure: "10-20 Years", percentage: 9.0, value: 6 },
        { name: "20 Plus", tenure: "20+ Years", percentage: 5.3, value: 3 }
      ]
    }
  }
};

export const RECRUITING_DATA = {
  "2024-06-30": {
    reportingDate: "6/30/24",
    openPositions: 85,
    newHiresYTD: 185,
    leaversYTD: 45,
    costPerHire: 3900,
    timeToFill: 40,
    applicationCount: 2150,
    offerAcceptanceRate: 74.8,
    facultyHiring: {
      applications: 1450,
      hires: 42,
      hireRate: 2.9
    },
    staffHiring: {
      totalApplications: 6200,
      totalHired: 275,
      overallHireRate: 4.4,
      internalApplicants: 180,
      externalApplicants: 6020,
      internalHired: 38,
      externalHired: 237,
      internalSuccessRate: 21.1,
      externalSuccessRate: 3.9,
      internalAdvantage: 5.4
    },
    diversityMetrics: {
      femaleHires: 58.9,
      minorityHires: 31.2,
      veteranHires: 7.1
    },
    positionsByDepartment: [
      { department: "College of Medicine", openings: 22, filled: 11 },
      { department: "Academic Affairs", openings: 13, filled: 8 },
      { department: "Student Affairs", openings: 12, filled: 7 },
      { department: "Information Technology", openings: 10, filled: 5 },
      { department: "Finance & Administration", openings: 8, filled: 4 }
    ],
    headcountByLocation: {
      phoenix: { faculty: 55, staff: 158, hsp: 315, total: 528 },
      omaha: { faculty: 875, staff: 1520, hsp: 245, total: 2640 }
    }
  },
  "2024-12-31": {
    reportingDate: "12/31/24",
    openPositions: 98,
    newHiresYTD: 225,
    leaversYTD: 50,
    costPerHire: 4100,
    timeToFill: 42,
    applicationCount: 2534,
    offerAcceptanceRate: 76.2,
    diversityMetrics: {
      femaleHires: 61.1,
      minorityHires: 33.5,
      veteranHires: 7.8
    },
    positionsByDepartment: [
      { department: "College of Medicine", openings: 25, filled: 13 },
      { department: "Academic Affairs", openings: 15, filled: 10 },
      { department: "Student Affairs", openings: 14, filled: 9 },
      { department: "Information Technology", openings: 12, filled: 7 },
      { department: "Finance & Administration", openings: 10, filled: 6 }
    ],
    headcountByLocation: {
      phoenix: { faculty: 59, staff: 169, hsp: 341, total: 569 },
      omaha: { faculty: 905, staff: 1588, hsp: 264, total: 2757 }
    }
  },
  "2025-03-31": {
    reportingDate: "3/31/25",
    openPositions: 119,
    newHiresYTD: 168,
    leaversYTD: 67,
    costPerHire: 4350,
    timeToFill: 44,
    applicationCount: 2847,
    offerAcceptanceRate: 78.5,
    diversityMetrics: {
      femaleHires: 62.3,
      minorityHires: 34.7,
      veteranHires: 8.2
    },
    positionsByDepartment: [
      { department: "College of Medicine", openings: 28, filled: 15 },
      { department: "Academic Affairs", openings: 18, filled: 12 },
      { department: "Student Affairs", openings: 16, filled: 11 },
      { department: "Information Technology", openings: 14, filled: 9 },
      { department: "Finance & Administration", openings: 12, filled: 8 }
    ],
    headcountByLocation: {
      phoenix: { faculty: 61, staff: 171, hsp: 337, total: 569 },
      omaha: { faculty: 906, staff: 1590, hsp: 263, total: 2759 }
    }
  },
  "2025-06-30": {
    reportingDate: "6/30/25",
    openPositions: 127,
    newHiresYTD: 262,
    leaversYTD: 250,
    costPerHire: 4200,
    timeToFill: 45,
    applicationCount: 3156,
    offerAcceptanceRate: 81.2,
    facultyHiring: {
      applications: 1746,
      hires: 53,
      hireRate: 3.0
    },
    staffHiring: {
      totalApplications: 6362,
      totalHired: 340,
      overallHireRate: 4.3,
      internalApplicants: 225,
      externalApplicants: 6137,
      internalHired: 54,
      externalHired: 286,
      internalSuccessRate: 24.0,
      externalSuccessRate: 3.7,
      internalAdvantage: 6.4
    },
    diversityMetrics: {
      femaleHires: 64.1,
      minorityHires: 36.8,
      veteranHires: 8.8
    },
    positionsByDepartment: [
      { department: "College of Medicine", openings: 31, filled: 18 },
      { department: "Academic Affairs", openings: 20, filled: 14 },
      { department: "Student Affairs", openings: 18, filled: 13 },
      { department: "Information Technology", openings: 16, filled: 11 },
      { department: "Finance & Administration", openings: 14, filled: 10 }
    ],
    headcountByLocation: {
      phoenix: { faculty: 58, staff: 238, hsp: 344, total: 640 },
      omaha: { faculty: 727, staff: 1571, hsp: 268, total: 2566 }
    }
  }
};

export const EXIT_SURVEY_DATA = {
  // Q1 FY25 - Baseline period with high exit volume
  "2024-06-30": {
    reportingDate: "6/30/24",
    quarter: "Q1 FY25",
    responseRate: 0, // No survey data available for this baseline
    totalResponses: 0,
    totalExits: 80, // Critical baseline: 80 exits this quarter
    overallSatisfaction: null,
    wouldRecommend: null,
    wouldRecommendCount: { positive: null, total: null },
    concernsReported: { percentage: null, count: null, total: null, description: "No survey data available" },
    departureReasons: [],
    departmentExits: [],
    satisfactionRatings: {
      jobSatisfaction: null,
      managementSupport: null,
      careerDevelopment: null,
      workLifeBalance: null,
      compensation: null,
      benefits: null
    },
    keyInsights: {
      areasOfConcern: [
        "High exit volume - 80 departures in single quarter",
        "No exit survey data available for analysis",
        "Baseline period for measuring subsequent trends"
      ],
      positiveFeedback: [],
      actionItems: [
        "Establish exit survey process for future quarters",
        "Investigate reasons behind high exit volume",
        "Implement retention strategies"
      ]
    }
  },
  "2025-03-31": {
    reportingDate: "3/31/25",
    responseRate: 68,
    totalResponses: 47,
    overallSatisfaction: 3.2,
    wouldRecommend: 62,
    departureReasons: [
      { reason: "Career advancement opportunities", percentage: 28.7 },
      { reason: "Work-life balance", percentage: 21.3 },
      { reason: "Compensation", percentage: 19.1 },
      { reason: "Management/leadership", percentage: 14.9 },
      { reason: "Job responsibilities", percentage: 10.6 },
      { reason: "Other", percentage: 5.3 }
    ],
    satisfactionRatings: {
      jobSatisfaction: 3.2,
      managementSupport: 2.9,
      careerDevelopment: 2.7,
      workLifeBalance: 3.1,
      compensation: 3.4,
      benefits: 3.8
    }
  },
  // Q4 FY25 - Actual June 30, 2025 data from PDF
  "2025-06-30": {
    reportingDate: "6/30/25",
    quarter: "Q4 FY25",
    responseRate: 29.0, // 18 of 62 exits
    totalResponses: 18,
    totalExits: 62,
    overallSatisfaction: 3.4,
    wouldRecommend: 83.3, // 15 of 18 respondents
    wouldRecommendCount: { positive: 15, total: 18 },
    concernsReported: { percentage: 22.2, count: 4, total: 18, description: "reported improper conduct" },
    departureReasons: [
      { reason: "Relocation", percentage: 22.2 },
      { reason: "Lack of career advancement opportunities", percentage: 16.7 },
      { reason: "Other", percentage: 16.7 },
      { reason: "Retirement", percentage: 11.1 },
      { reason: "Dissatisfied with direct supervisor", percentage: 11.1 },
      { reason: "Pursue other career or education", percentage: 11.1 },
      { reason: "Remote/Hybrid option not available", percentage: 5.6 },
      { reason: "Leaving the workforce", percentage: 5.6 }
    ],
    departmentExits: [
      { department: "Athletics", exits: 4, responses: 4, responseRate: "100%" },
      { department: "Information Technology", exits: 2, responses: 2, responseRate: "100%" },
      { department: "Center For Faculty Excellence", exits: 1, responses: 1, responseRate: "100%" },
      { department: "University Communications", exits: 1, responses: 1, responseRate: "100%" },
      { department: "Student Life", exits: 1, responses: 1, responseRate: "100%" },
      { department: "School of Medicine", exits: 1, responses: 1, responseRate: "100%" },
      { department: "Student Success", exits: 0, responses: 0, responseRate: "0%" },
      { department: "University Relations", exits: 0, responses: 0, responseRate: "0%" },
      { department: "School of Dentistry", exits: 0, responses: 0, responseRate: "0%" },
      { department: "Provost's Office", exits: 0, responses: 0, responseRate: "0%" }
    ],
    satisfactionRatings: {
      jobSatisfaction: 3.4,
      managementSupport: 3.2,
      careerDevelopment: 2.8,
      workLifeBalance: 3.3,
      compensation: 3.0,
      benefits: 3.6
    },
    keyInsights: {
      areasOfConcern: [
        "Career advancement opportunities primary concern (16.7%)",
        "Supervisor relationships causing 11.1% of exits",
        "Remote work policy changes driving departures",
        "Low response rate indicates potential survey fatigue"
      ],
      positiveFeedback: [
        "High recommendation rate at 83%",
        "Strong departmental response rates (Athletics, IT)",
        "Benefits package satisfaction remains high",
        "Work environment generally positive"
      ],
      actionItems: [
        "Review and improve career advancement pathways",
        "Enhance remote/hybrid work policy flexibility",
        "Continue supervisor training initiatives",
        "Develop strategies to improve exit survey participation"
      ]
    }
  },
  // Q1 FY26 - September 30, 2024 data from PDF (INCOMPLETE - Only 1 month of data)
  "2024-09-30": {
    reportingDate: "9/30/24",
    quarter: "Q1 FY26",
    dataStatus: "INCOMPLETE - Partial Quarter (1 month only)",
    responseRate: 32.3, // 20 of 62 exits
    totalResponses: 20,
    totalExits: 62,
    overallSatisfaction: 2.9,
    wouldRecommend: 57.9, // 11 of 19 who answered
    wouldRecommendCount: { positive: 11, total: 19 },
    concernsReported: { percentage: 40, count: 8, total: 20, description: "reported improper conduct" },
    departureReasons: [
      { reason: "Pursue other career or education", percentage: 30 },
      { reason: "Dissatisfied with direct supervisor", percentage: 25 },
      { reason: "Other", percentage: 15 },
      { reason: "Retirement", percentage: 10 },
      { reason: "Lack of career advancement opportunities", percentage: 10 },
      { reason: "Dissatisfied with University leadership", percentage: 5 },
      { reason: "Lack of work-life balance", percentage: 5 }
    ],
    departmentExits: [
      { department: "School of Dentistry", exits: 4, responses: 4, responseRate: "100%" },
      { department: "Student Life", exits: 3, responses: 3, responseRate: "100%" },
      { department: "School of Medicine", exits: 3, responses: 3, responseRate: "100%" },
      { department: "Information Technology", exits: 2, responses: 2, responseRate: "100%" },
      { department: "Athletics", exits: 1, responses: 1, responseRate: "100%" },
      { department: "University Relations", exits: 1, responses: 1, responseRate: "100%" },
      { department: "University Communications", exits: 1, responses: 1, responseRate: "100%" },
      { department: "Student Success", exits: 0, responses: 0, responseRate: "0%" },
      { department: "Center For Faculty Excellence", exits: 0, responses: 0, responseRate: "0%" },
      { department: "Provost's Office", exits: 0, responses: 0, responseRate: "0%" }
    ],
    satisfactionRatings: {
      jobSatisfaction: 2.9,
      managementSupport: 2.3,
      careerDevelopment: 2.1,
      workLifeBalance: 2.8,
      compensation: 2.5,
      benefits: 3.4
    },
    keyInsights: {
      areasOfConcern: [
        "CAUTION: Data represents only 1 month of quarter - incomplete analysis",
        "Cannot draw quarter-wide conclusions from partial data",
        "Survey timing may not be representative of full quarter"
      ],
      positiveFeedback: [
        "Survey process functioning when implemented",
        "Employee feedback collection system operational"
      ],
      actionItems: [
        "Complete full quarter data collection before analysis",
        "Ensure consistent monthly survey distribution",
        "Wait for complete quarterly data before making policy decisions"
      ]
    }
  }
};

// Available reporting dates - Complete quarters only for analysis
export const AVAILABLE_DATES = [
  { value: "2024-06-30", label: "6/30/24 (Q1 FY25 - Baseline)", status: "complete" },
  { value: "2025-03-31", label: "3/31/25", status: "complete" },
  { value: "2025-06-30", label: "6/30/25 (Q4 FY25)", status: "complete" }
];

// Incomplete/partial data periods (excluded from primary analysis)
export const PARTIAL_DATA_DATES = [
  { value: "2024-09-30", label: "9/30/24 (Q1 FY26 - Incomplete)", status: "partial" }
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

export const getTop15SchoolOrgData = (date = "2025-06-30") => {
  const workforceData = getWorkforceData(date);
  
  if (!workforceData.schoolOrgData) {
    return [];
  }
  
  // Sort by total in descending order
  const sortedData = [...workforceData.schoolOrgData].sort((a, b) => b.total - a.total);
  
  // Take top 15
  const top15 = sortedData.slice(0, 15);
  
  // Calculate "Others" from remaining data
  const others = sortedData.slice(15);
  const othersTotal = others.reduce((acc, org) => ({
    faculty: acc.faculty + org.faculty,
    staff: acc.staff + org.staff,
    hsp: acc.hsp + org.hsp,
    total: acc.total + org.total
  }), { faculty: 0, staff: 0, hsp: 0, total: 0 });
  
  // Format data for DepartmentHeadcountDisplay (use lowercase property names)
  const chartData = top15.map(org => ({
    name: org.name,
    faculty: org.faculty,
    staff: org.staff,
    hsp: org.hsp,
    total: org.total
  }));
  
  // Add "Others" row if there are remaining organizations
  if (others.length > 0) {
    chartData.push({
      name: "Others",
      faculty: othersTotal.faculty,
      staff: othersTotal.staff,
      hsp: othersTotal.hsp,
      total: othersTotal.total
    });
  }
  
  return chartData;
};

// New function to get ALL school/org data without limiting to top 15 and without "Others"
export const getAllSchoolOrgData = (date = "2025-06-30") => {
  const workforceData = getWorkforceData(date);
  
  if (!workforceData.schoolOrgData) {
    return [];
  }
  
  // Sort by total in descending order and return all data
  const sortedData = [...workforceData.schoolOrgData].sort((a, b) => b.total - a.total);
  
  // Format data for chart (use lowercase property names)
  const chartData = sortedData.map(org => ({
    name: org.name,
    faculty: org.faculty,
    staff: org.staff,
    hsp: org.hsp,
    total: org.total
  }));
  
  return chartData;
};

// Get Starters vs Leavers trend data for recruiting dashboard
export const getStartersLeaversData = () => {
  const periods = ["2024-12-31", "2025-03-31", "2025-06-30"];
  
  return periods.map(period => {
    const data = RECRUITING_DATA[period];
    return {
      period: data.reportingDate,
      Starters: data.newHiresYTD,
      Leavers: data.leaversYTD
    };
  });
};

// Get Headcount Trends data by location for recruiting dashboard
export const getHeadcountTrendsData = () => {
  const periods = ["2025-03-31", "2025-06-30"];
  
  const phoenixData = periods.map(period => {
    const data = RECRUITING_DATA[period];
    return {
      period: data.reportingDate + " - Phoenix",
      Faculty: data.headcountByLocation.phoenix.faculty,
      Staff: data.headcountByLocation.phoenix.staff,
      HSP: data.headcountByLocation.phoenix.hsp
    };
  });

  const omahaData = periods.map(period => {
    const data = RECRUITING_DATA[period];
    return {
      period: data.reportingDate + " - Omaha",
      Faculty: data.headcountByLocation.omaha.faculty,
      Staff: data.headcountByLocation.omaha.staff,
      HSP: data.headcountByLocation.omaha.hsp
    };
  });

  return [...phoenixData, ...omahaData];
};

// New separate data functions for dual charts
export const getPhoenixHeadcountData = () => {
  const periods = ["2025-03-31", "2025-06-30"];
  
  return periods.map(period => {
    const data = RECRUITING_DATA[period];
    return {
      period: data.reportingDate,
      Faculty: data.headcountByLocation.phoenix.faculty,
      Staff: data.headcountByLocation.phoenix.staff,
      HSP: data.headcountByLocation.phoenix.hsp
    };
  });
};

export const getOmahaHeadcountData = () => {
  const periods = ["2025-03-31", "2025-06-30"];
  
  return periods.map(period => {
    const data = RECRUITING_DATA[period];
    return {
      period: data.reportingDate,
      Faculty: data.headcountByLocation.omaha.faculty,
      Staff: data.headcountByLocation.omaha.staff,
      HSP: data.headcountByLocation.omaha.hsp
    };
  });
};