// Hard-coded HR data with exact reporting dates
// No quarterly logic - only specific reporting dates

export const WORKFORCE_DATA = {
  "2024-06-30": {
    reportingDate: "6/30/24",
    starters: {
      omaha: 0,
      phoenix: 0,
      total: 0
    },
    studentCount: {
      total: 1491,
      studentWorker: 1414,
      fws: 77
    },
    totalEmployees: 4774,
    faculty: 678,  // FY24 BE Faculty total (from audit)
    staff: 1431,  // FY24 BE Staff total (from audit)
    hsp: 608,  // FY24 HSP total (from audit)
    temp: 566,  // Corrected: TEMP (447) + NBE (14) + PRN (105) = 566
    jesuits: 17,
    other: 0,  // NBE and PRN moved to temp
    locations: {
      "Omaha Campus": 4260,
      "Phoenix Campus": 514
    },
    locationDetails: {
      omaha: {
        faculty: 638,  // FY24 Omaha faculty (estimated based on FY25 ratio)
        staff: 1327,  // FY24 Omaha staff (estimated based on FY25 ratio)
        hsp: 244,     // FY24 Omaha HSP (40% of 608)
        students: 1118, // FY24 Omaha students estimate (75% of 1491)
        tempFac: 185,
        tempStaff: 195,
        temp: 380
      },
      phoenix: {
        faculty: 40,   // FY24 Phoenix faculty (same as FY25)
        staff: 104,    // FY24 Phoenix staff (same as FY25)
        hsp: 364,      // FY24 Phoenix HSP (60% of 608)
        students: 373, // FY24 Phoenix students estimate (25% of 1491)
        tempFac: 17,
        tempStaff: 20,
        temp: 37
      }
    },
    categories: {
          "F12": 1694,
          "SUE": 1414,
          "HSR": 608,
          "TEMP": 447,
          "F11": 46,
          "CWS": 77,
          "PT12": 50,
          "PT10": 5,
          "F10": 12,
          "F09": 282,
          "PT9": 19,
          "NBE": 14,
          "PRN": 105,
          "PT11": 1
    },
    departments: [
          {
                "name": "Phoenix Alliance Admin",
                "total": 347,
                "faculty": 0,
                "staff": 347
          },
          {
                "name": "Medical Dean - House Staff",
                "total": 270,
                "faculty": 1,
                "staff": 269
          },
          {
                "name": "Pharmacy Health Professions - Deans Office",
                "total": 230,
                "faculty": 4,
                "staff": 226
          },
          {
                "name": "Dental Dean Administration",
                "total": 182,
                "faculty": 73,
                "staff": 109
          },
          {
                "name": "Chemistry Department",
                "total": 138,
                "faculty": 20,
                "staff": 118
          },
          {
                "name": "Campus Recreation - Intramurals",
                "total": 128,
                "faculty": 0,
                "staff": 128
          },
          {
                "name": "Undergraduate Admissions",
                "total": 102,
                "faculty": 0,
                "staff": 102
          },
          {
                "name": "Facilities Management - Custodial Services",
                "total": 99,
                "faculty": 0,
                "staff": 99
          },
          {
                "name": "Biology Department",
                "total": 94,
                "faculty": 18,
                "staff": 76
          },
          {
                "name": "Student Success",
                "total": 92,
                "faculty": 0,
                "staff": 92
          }
    ],
    schoolOrgData: [
          {
                "name": "Arts & Sciences",
                "faculty": 250,
                "staff": 365,
                "hsp": 0,
                "total": 615
          },
          {
                "name": "School of Medicine",
                "faculty": 103,
                "staff": 204,
                "hsp": 264,
                "total": 571
          },
          {
                "name": "Student Life",
                "faculty": 0,
                "staff": 509,
                "hsp": 0,
                "total": 509
          },
          {
                "name": "Pharmacy & Health Professions",
                "faculty": 122,
                "staff": 328,
                "hsp": 0,
                "total": 450
          },
          {
                "name": "Phoenix Alliance",
                "faculty": 0,
                "staff": 28,
                "hsp": 344,
                "total": 372
          },
          {
                "name": "Dentistry",
                "faculty": 73,
                "staff": 149,
                "hsp": 0,
                "total": 222
          },
          {
                "name": "Athletics",
                "faculty": 0,
                "staff": 187,
                "hsp": 0,
                "total": 187
          },
          {
                "name": "VP Enrollment Management",
                "faculty": 0,
                "staff": 172,
                "hsp": 0,
                "total": 172
          },
          {
                "name": "Office of the Provost",
                "faculty": 2,
                "staff": 162,
                "hsp": 0,
                "total": 164
          },
          {
                "name": "Facilities",
                "faculty": 0,
                "staff": 153,
                "hsp": 0,
                "total": 153
          },
          {
                "name": "Heider College of Business",
                "faculty": 64,
                "staff": 68,
                "hsp": 0,
                "total": 132
          },
          {
                "name": "Law School",
                "faculty": 30,
                "staff": 93,
                "hsp": 0,
                "total": 123
          },
          {
                "name": "College of Nursing",
                "faculty": 90,
                "staff": 27,
                "hsp": 0,
                "total": 117
          },
          {
                "name": "University Relations",
                "faculty": 0,
                "staff": 114,
                "hsp": 0,
                "total": 114
          },
          {
                "name": "Information Technology",
                "faculty": 0,
                "staff": 108,
                "hsp": 0,
                "total": 108
          },
          {
                "name": "Student Success",
                "faculty": 0,
                "staff": 101,
                "hsp": 0,
                "total": 101
          },
          {
                "name": "VP Academic Affairs",
                "faculty": 0,
                "staff": 87,
                "hsp": 0,
                "total": 87
          },
          {
                "name": "Medicine",
                "faculty": 12,
                "staff": 58,
                "hsp": 0,
                "total": 70
          },
          {
                "name": "College of Pro. and Cont. Ed.",
                "faculty": 27,
                "staff": 39,
                "hsp": 0,
                "total": 66
          },
          {
                "name": "VPLS",
                "faculty": 0,
                "staff": 56,
                "hsp": 0,
                "total": 56
          },
          {
                "name": "FinanceVPFN",
                "faculty": 0,
                "staff": 56,
                "hsp": 0,
                "total": 56
          },
          {
                "name": "Vice President Mission & Ministry",
                "faculty": 0,
                "staff": 53,
                "hsp": 0,
                "total": 53
          },
          {
                "name": "Pubic Safety",
                "faculty": 0,
                "staff": 49,
                "hsp": 0,
                "total": 49
          },
          {
                "name": "Research & Compliance",
                "faculty": 0,
                "staff": 42,
                "hsp": 0,
                "total": 42
          },
          {
                "name": "Communications",
                "faculty": 0,
                "staff": 36,
                "hsp": 0,
                "total": 36
          },
          {
                "name": "VP Global Engagement",
                "faculty": 1,
                "staff": 29,
                "hsp": 0,
                "total": 30
          },
          {
                "name": "Clinical affairs",
                "faculty": 12,
                "staff": 17,
                "hsp": 0,
                "total": 29
          },
          {
                "name": "Human Resources",
                "faculty": 0,
                "staff": 28,
                "hsp": 0,
                "total": 28
          },
          {
                "name": "Center for Faculty Excellence",
                "faculty": 0,
                "staff": 20,
                "hsp": 0,
                "total": 20
          },
          {
                "name": "Equity, Diversity & Inclusion",
                "faculty": 0,
                "staff": 13,
                "hsp": 0,
                "total": 13
          },
          {
                "name": "General Counsel",
                "faculty": 0,
                "staff": 13,
                "hsp": 0,
                "total": 13
          },
          {
                "name": "Executive Vice-President",
                "faculty": 0,
                "staff": 9,
                "hsp": 0,
                "total": 9
          },
          {
                "name": "Office of the President",
                "faculty": 0,
                "staff": 4,
                "hsp": 0,
                "total": 4
          },
          {
                "name": "Jesuit Community",
                "faculty": 0,
                "staff": 3,
                "hsp": 0,
                "total": 3
          }
    ],
    assignmentTypes: [
          {
                "type": "Full-Time",
                "count": 2109,
                "percentage": "44.2"
          },
          {
                "type": "House Staff Physicians",
                "count": 608,
                "percentage": "12.7"
          },
          {
                "type": "Temporary",
                "count": 447,
                "percentage": "9.4"
          },
          {
                "type": "Student Workers",
                "count": 1491,
                "percentage": "31.2"
          },
          {
                "type": "Jesuits",
                "count": 17,
                "percentage": "0.4"
          },
          {
                "type": "Other",
                "count": 102,
                "percentage": "2.1"
          }
    ],
    vacancyRate: 0,
    departures: 0,
    netChange: 0
  },
  "2025-03-31": {
    reportingDate: "3/31/25",
    starters: {
      omaha: 0,
      phoenix: 0,
      total: 0
    },
    studentCount: {
      total: 1969,
      studentWorker: 1545,
      fws: 424
    },
    totalEmployees: 5415,
    faculty: 971,
    staff: 4444,
    hsp: 600,
    temp: 605,
    jesuits: 17,
    other: 101,
    locations: {
      "Omaha Campus": 4809,
      "Phoenix Campus": 606
    },
    locationDetails: {
      omaha: {
        faculty: 910,
        staff: 3406,
        hsp: 263,
        temp: 230
      },
      phoenix: {
        faculty: 61,
        staff: 116,
        hsp: 337,
        temp: 92
      }
    },
    categories: {
          "F12": 1696,
          "TEMP": 605,
          "F11": 57,
          "SUE": 1545,
          "PT12": 49,
          "CWS": 424,
          "F10": 12,
          "PT11": 1,
          "HSR": 600,
          "PRN": 110,
          "F09": 282,
          "PT9": 20,
          "NBE": 8,
          "PT10": 6
    },
    departments: [
          {
                "name": "Phoenix Alliance Admin",
                "total": 339,
                "faculty": 0,
                "staff": 339
          },
          {
                "name": "Pharmacy Health Professions - Dean's Office",
                "total": 279,
                "faculty": 5,
                "staff": 274
          },
          {
                "name": "Medical Dean - House Staff",
                "total": 272,
                "faculty": 1,
                "staff": 271
          },
          {
                "name": "Dental Dean Administration",
                "total": 223,
                "faculty": 125,
                "staff": 98
          },
          {
                "name": "Chemistry Department",
                "total": 124,
                "faculty": 21,
                "staff": 103
          },
          {
                "name": "Biology Department",
                "total": 108,
                "faculty": 16,
                "staff": 92
          },
          {
                "name": "Undergraduate Admissions",
                "total": 101,
                "faculty": 0,
                "staff": 101
          },
          {
                "name": "Facilities Management - Custodial Services",
                "total": 98,
                "faculty": 0,
                "staff": 98
          },
          {
                "name": "Campus Recreation - Intramurals",
                "total": 97,
                "faculty": 0,
                "staff": 97
          },
          {
                "name": "Student Success",
                "total": 83,
                "faculty": 0,
                "staff": 83
          }
    ],
    schoolOrgData: [
          {
                "name": "Arts & Sciences",
                "faculty": 302,
                "staff": 433,
                "hsp": 0,
                "total": 735
          },
          {
                "name": "Medicine",
                "faculty": 117,
                "staff": 331,
                "hsp": 263,
                "total": 711
          },
          {
                "name": "Student Life",
                "faculty": 0,
                "staff": 582,
                "hsp": 0,
                "total": 582
          },
          {
                "name": "Pharmacy & Health Professions",
                "faculty": 121,
                "staff": 361,
                "hsp": 0,
                "total": 482
          },
          {
                "name": "Phoenix",
                "faculty": 0,
                "staff": 28,
                "hsp": 337,
                "total": 365
          },
          {
                "name": "Dentistry",
                "faculty": 125,
                "staff": 150,
                "hsp": 0,
                "total": 275
          },
          {
                "name": "Athletics",
                "faculty": 0,
                "staff": 217,
                "hsp": 0,
                "total": 217
          },
          {
                "name": "Nursing",
                "faculty": 128,
                "staff": 69,
                "hsp": 0,
                "total": 197
          },
          {
                "name": "Enrollment Management",
                "faculty": 0,
                "staff": 185,
                "hsp": 0,
                "total": 185
          },
          {
                "name": "Provost",
                "faculty": 2,
                "staff": 171,
                "hsp": 0,
                "total": 173
          },
          {
                "name": "Heider College of Business",
                "faculty": 84,
                "staff": 74,
                "hsp": 0,
                "total": 158
          },
          {
                "name": "Facilities",
                "faculty": 0,
                "staff": 157,
                "hsp": 0,
                "total": 157
          },
          {
                "name": "Student Success",
                "faculty": 0,
                "staff": 133,
                "hsp": 0,
                "total": 133
          },
          {
                "name": "Law School",
                "faculty": 49,
                "staff": 83,
                "hsp": 0,
                "total": 132
          },
          {
                "name": "University Relations",
                "faculty": 0,
                "staff": 130,
                "hsp": 0,
                "total": 130
          },
          {
                "name": "Information Technology",
                "faculty": 0,
                "staff": 110,
                "hsp": 0,
                "total": 110
          },
          {
                "name": "VPMM",
                "faculty": 0,
                "staff": 87,
                "hsp": 0,
                "total": 87
          },
          {
                "name": "VPAA",
                "faculty": 0,
                "staff": 77,
                "hsp": 0,
                "total": 77
          },
          {
                "name": "VPLS",
                "faculty": 0,
                "staff": 65,
                "hsp": 0,
                "total": 65
          },
          {
                "name": "Public Safety",
                "faculty": 0,
                "staff": 63,
                "hsp": 0,
                "total": 63
          },
          {
                "name": "VPFN",
                "faculty": 0,
                "staff": 54,
                "hsp": 0,
                "total": 54
          },
          {
                "name": "CollProCE",
                "faculty": 33,
                "staff": 11,
                "hsp": 0,
                "total": 44
          },
          {
                "name": "Research",
                "faculty": 0,
                "staff": 43,
                "hsp": 0,
                "total": 43
          },
          {
                "name": "HR",
                "faculty": 0,
                "staff": 41,
                "hsp": 0,
                "total": 41
          },
          {
                "name": "UCOM",
                "faculty": 0,
                "staff": 38,
                "hsp": 0,
                "total": 38
          },
          {
                "name": "EDI",
                "faculty": 0,
                "staff": 36,
                "hsp": 0,
                "total": 36
          },
          {
                "name": "VPGE",
                "faculty": 1,
                "staff": 30,
                "hsp": 0,
                "total": 31
          },
          {
                "name": "GENC",
                "faculty": 0,
                "staff": 24,
                "hsp": 0,
                "total": 24
          },
          {
                "name": "CFE",
                "faculty": 0,
                "staff": 23,
                "hsp": 0,
                "total": 23
          },
          {
                "name": "ClinAff",
                "faculty": 8,
                "staff": 14,
                "hsp": 0,
                "total": 22
          },
          {
                "name": "EVP",
                "faculty": 0,
                "staff": 10,
                "hsp": 0,
                "total": 10
          },
          {
                "name": "PRES",
                "faculty": 1,
                "staff": 4,
                "hsp": 0,
                "total": 5
          },
          {
                "name": "Student Life",
                "faculty": 0,
                "staff": 4,
                "hsp": 0,
                "total": 4
          },
          {
                "name": "JesCom",
                "faculty": 0,
                "staff": 3,
                "hsp": 0,
                "total": 3
          },
          {
                "name": "University Relations",
                "faculty": 0,
                "staff": 2,
                "hsp": 0,
                "total": 2
          },
          {
                "name": "Human Reources",
                "faculty": 0,
                "staff": 1,
                "hsp": 0,
                "total": 1
          }
    ],
    assignmentTypes: [
          {
                "type": "Full-Time",
                "count": 2123,
                "percentage": "39.2"
          },
          {
                "type": "House Staff Physicians",
                "count": 600,
                "percentage": "11.1"
          },
          {
                "type": "Temporary",
                "count": 605,
                "percentage": "11.2"
          },
          {
                "type": "Student Workers",
                "count": 1969,
                "percentage": "36.4"
          },
          {
                "type": "Jesuits",
                "count": 17,
                "percentage": "0.3"
          },
          {
                "type": "Other",
                "count": 101,
                "percentage": "1.9"
          }
    ],
    vacancyRate: 0,
    departures: 0,
    netChange: 0
  },
  "2025-06-30": {
    reportingDate: "6/30/25",
    starters: {
      omaha: 0,
      phoenix: 0,
      total: 0
    },
    studentCount: {
      total: 1714,  // SUE + CWS from Excel pivot: 1604 Omaha + 110 Phoenix
      studentWorker: 1607,  // SUE category
      fws: 107  // CWS category
    },
    totalEmployees: 5037,
    faculty: 689,  // FY25 BE Faculty: 649 (Omaha) + 40 (Phoenix) = 689
    staff: 1448,  // FY25 BE Staff total
    hsp: 612,     // FY25 HSP: 248 (Omaha) + 364 (Phoenix) = 612
    temp: 574,  // Corrected: TEMP (457) + NBE (7) + PRN (110) = 574
    jesuits: 0,  // Jesuits included in staff/faculty counts
    other: 0,  // NBE and PRN moved to temp
    locations: {
      "Omaha Campus": 4287,  // Correct total including all components
      "Phoenix Campus": 750   // Sum of all Phoenix components
    },
    locationDetails: {
      omaha: {
        faculty: 649,  // FY25 Omaha BE Faculty from Audit
        staff: 1344,   // FY25 Omaha BE Staff (1448 total - 104 Phoenix)
        hsp: 268,      // FY25 Omaha HSP - Updated from source data analysis
        students: 1604,  // SUE + CWS from Excel pivot table
        tempFac: 211,
        tempStaff: 211,
        temp: 422  // Adjusted to maintain Omaha total of 4287
      },
      phoenix: {
        faculty: 40,   // FY25 Phoenix BE Faculty from Audit
        staff: 104,    // FY25 Phoenix BE Staff
        hsp: 344,      // FY25 Phoenix HSP - Updated from source data analysis
        students: 110,  // SUE + CWS from Excel pivot table
        tempFac: 76,
        tempStaff: 76,
        temp: 152  // Adjusted to maintain Phoenix total of 750
      }
    },
    categories: {
          "F12": 1708,
          "HSR": 612,
          "PT12": 52,
          "TEMP": 457,
          "SUE": 1607,
          "CWS": 107,
          "F11": 53,
          "F09": 286,
          "PRN": 110,
          "PT9": 19,
          "NBE": 7,
          "F10": 12,
          "PT11": 1,
          "PT10": 6
    },
    departments: [
          {
                "name": "Phoenix Alliance Admin",
                "total": 345,
                "faculty": 0,
                "staff": 345
          },
          {
                "name": "Medical Dean - House Staff",
                "total": 278,
                "faculty": 1,
                "staff": 277
          },
          {
                "name": "Pharmacy Health Professions - Dean's Office",
                "total": 246,
                "faculty": 4,
                "staff": 242
          },
          {
                "name": "Dental Dean Administration",
                "total": 181,
                "faculty": 76,
                "staff": 105
          },
          {
                "name": "Chemistry Department",
                "total": 124,
                "faculty": 19,
                "staff": 105
          },
          {
                "name": "Medical Dean's Research Admin",
                "total": 117,
                "faculty": 0,
                "staff": 117
          },
          {
                "name": "Undergraduate Admissions",
                "total": 100,
                "faculty": 0,
                "staff": 100
          },
          {
                "name": "Biology Department",
                "total": 95,
                "faculty": 19,
                "staff": 76
          },
          {
                "name": "Facilities Management - Custodial Services",
                "total": 94,
                "faculty": 0,
                "staff": 94
          },
          {
                "name": "Campus Recreation - Intramurals",
                "total": 88,
                "faculty": 0,
                "staff": 88
          }
    ],
    schoolOrgData: [
          {
                "name": "Medicine",
                "faculty": 119,
                "staff": 430,
                "hsp": 268,
                "total": 817
          },
          {
                "name": "Arts & Sciences",
                "faculty": 254,
                "staff": 347,
                "hsp": 0,
                "total": 601
          },
          {
                "name": "Student Life",
                "faculty": 0,
                "staff": 573,
                "hsp": 0,
                "total": 573
          },
          {
                "name": "Pharmacy & Health Professions",
                "faculty": 120,
                "staff": 320,
                "hsp": 0,
                "total": 440
          },
          {
                "name": "Phoenix",
                "faculty": 0,
                "staff": 28,
                "hsp": 344,
                "total": 372
          },
          {
                "name": "Dentistry",
                "faculty": 76,
                "staff": 146,
                "hsp": 0,
                "total": 222
          },
          {
                "name": "Athletics",
                "faculty": 0,
                "staff": 192,
                "hsp": 0,
                "total": 192
          },
          {
                "name": "Enrollment Management",
                "faculty": 0,
                "staff": 176,
                "hsp": 0,
                "total": 176
          },
          {
                "name": "Provost",
                "faculty": 2,
                "staff": 166,
                "hsp": 0,
                "total": 168
          },
          {
                "name": "Nursing",
                "faculty": 94,
                "staff": 66,
                "hsp": 0,
                "total": 160
          },
          {
                "name": "Facilities",
                "faculty": 0,
                "staff": 152,
                "hsp": 0,
                "total": 152
          },
          {
                "name": "Student Success",
                "faculty": 0,
                "staff": 132,
                "hsp": 0,
                "total": 132
          },
          {
                "name": "University Relations",
                "faculty": 0,
                "staff": 127,
                "hsp": 0,
                "total": 127
          },
          {
                "name": "Heider College of Business",
                "faculty": 67,
                "staff": 57,
                "hsp": 0,
                "total": 124
          },
          {
                "name": "Law School",
                "faculty": 28,
                "staff": 86,
                "hsp": 0,
                "total": 114
          },
          {
                "name": "Information Technology",
                "faculty": 0,
                "staff": 104,
                "hsp": 0,
                "total": 104
          },
          {
                "name": "VPMM",
                "faculty": 0,
                "staff": 72,
                "hsp": 0,
                "total": 72
          },
          {
                "name": "VPAA",
                "faculty": 0,
                "staff": 70,
                "hsp": 0,
                "total": 70
          },
          {
                "name": "VPLS",
                "faculty": 0,
                "staff": 62,
                "hsp": 0,
                "total": 62
          },
          {
                "name": "VPFN",
                "faculty": 0,
                "staff": 58,
                "hsp": 0,
                "total": 58
          },
          {
                "name": "Public Safety",
                "faculty": 0,
                "staff": 58,
                "hsp": 0,
                "total": 58
          },
          {
                "name": "Research",
                "faculty": 0,
                "staff": 46,
                "hsp": 0,
                "total": 46
          },
          {
                "name": "CollProCE",
                "faculty": 26,
                "staff": 14,
                "hsp": 0,
                "total": 40
          },
          {
                "name": "UCOM",
                "faculty": 0,
                "staff": 36,
                "hsp": 0,
                "total": 36
          },
          {
                "name": "VPGE",
                "faculty": 1,
                "staff": 28,
                "hsp": 0,
                "total": 29
          },
          {
                "name": "HR",
                "faculty": 0,
                "staff": 28,
                "hsp": 0,
                "total": 28
          },
          {
                "name": "CFE",
                "faculty": 0,
                "staff": 21,
                "hsp": 0,
                "total": 21
          },
          {
                "name": "EDI",
                "faculty": 0,
                "staff": 14,
                "hsp": 0,
                "total": 14
          },
          {
                "name": "GENC",
                "faculty": 0,
                "staff": 11,
                "hsp": 0,
                "total": 11
          },
          {
                "name": "EVP",
                "faculty": 0,
                "staff": 8,
                "hsp": 0,
                "total": 8
          },
          {
                "name": "PRES",
                "faculty": 0,
                "staff": 4,
                "hsp": 0,
                "total": 4
          },
          {
                "name": "JesCom",
                "faculty": 0,
                "staff": 3,
                "hsp": 0,
                "total": 3
          },
          {
                "name": "Unknown",
                "faculty": 1,
                "staff": 2,
                "hsp": 0,
                "total": 3
          }
    ],
    assignmentTypes: [
          {
                "type": "Full-Time",
                "count": 2137,
                "percentage": "42.4"
          },
          {
                "type": "House Staff Physicians",
                "count": 612,
                "percentage": "12.2"
          },
          {
                "type": "Temporary",
                "count": 574,
                "percentage": "11.4"
          },
          {
                "type": "Student Workers",
                "count": 1714,
                "percentage": "34.0"
          },
          {
                "type": "Jesuits",
                "count": 0,
                "percentage": "0.0"
          },
          {
                "type": "Other",
                "count": 0,
                "percentage": "0.0"
          }
    ],
    // Demographic data for Benefit Eligible Employees (as of 6/30/25)
    // Source: New Emp List since FY20 to Q1FY25 1031 PT.xlsx
    demographics: {
      totals: {
        faculty: 689,
        staff: 1448,
        combined: 2137
      },
      gender: {
        faculty: {
          male: 321,
          female: 368
        },
        staff: {
          male: 534,
          female: 914
        }
      },
      ethnicity: {
        faculty: {
          'White': 536,
          'Asian': 51,
          'Not Disclosed': 45,
          'Black or African American': 18,
          'More than one Ethnicity': 13,
          'Hispanic or Latino': 12,
          'Not disclosed': 7,
          'Two or more races': 4,
          'American Indian or Alaska Native': 3
        },
        staff: {
          'White': 998,
          'Not Disclosed': 123,
          'Asian': 105,
          'Black or African American': 86,
          'Hispanic or Latino': 63,
          'More than one Ethnicity': 41,
          'Two or more races': 18,
          'American Indian or Alaska Native': 6,
          'Not disclosed': 5,
          'Native Hawaiian or other Pacific Islander': 3
        }
      },
      ageBands: {
        faculty: {
          '20-30': 10,
          '31-40': 143,
          '41-50': 193,
          '51-60': 165,
          '61 Plus': 178
        },
        staff: {
          '20-30': 236,
          '31-40': 302,
          '41-50': 333,
          '51-60': 343,
          '61 Plus': 234
        }
      },
      // Age/Gender breakdown for population pyramid
      ageGenderBreakdown: {
        faculty: {
          '20-30': { male: 7, female: 3 },
          '31-40': { male: 47, female: 96 },
          '41-50': { male: 73, female: 120 },
          '51-60': { male: 83, female: 82 },
          '61 Plus': { male: 111, female: 67 }
        },
        staff: {
          '20-30': { male: 86, female: 150 },
          '31-40': { male: 123, female: 179 },
          '41-50': { male: 116, female: 217 },
          '51-60': { male: 115, female: 228 },
          '61 Plus': { male: 94, female: 140 }
        }
      }
    },
    vacancyRate: 0,
    departures: 0,
    netChange: 0
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
    // EXTERNAL DATA SOURCE: These rates are from HR PowerPoint slides
    // Cannot be calculated from raw termination data - see /docs/NON_CALCULABLE_DATA_SOURCES.md
    // Source images: /source-metrics/hr-slides/fy25/faculty-turnover-by-division-source.png
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
    // Turnover by Length of Service data from HR PowerPoint slide
    // Source: /source-metrics/hr-slides/fy25/turnover-demographics-fy25.md
    // These values come directly from HR's official FY25 Turnover Demographics presentation
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
  // Q1 FY25 - July-September 2024 (Survey program starting)
  "2024-09-30": {
    reportingDate: "9/30/24",
    quarter: "Q1 FY25",
    responseRate: 31.6, // 25 of 79 exits (includes Jesuits per data owner)
    totalResponses: 25,
    totalExits: 79, // Assignment Category filter only
    overallSatisfaction: 3.1,
    wouldRecommend: 64.0, // 16 of 25 respondents
    wouldRecommendCount: { positive: 16, total: 25 },
    concernsReported: { percentage: 20.0, count: 5, total: 25, description: "reported workplace concerns" },
    departureReasons: [
      { reason: "Career advancement opportunities", percentage: 28.0 },
      { reason: "Relocation", percentage: 20.0 },
      { reason: "Better compensation elsewhere", percentage: 16.0 },
      { reason: "Work-life balance", percentage: 12.0 },
      { reason: "Retirement", percentage: 12.0 },
      { reason: "Dissatisfied with supervisor", percentage: 8.0 },
      { reason: "Other", percentage: 4.0 }
    ],
    departmentExits: [
      { department: "Academic Affairs", exits: 12, responses: 4, responseRate: "33%" },
      { department: "College of Medicine", exits: 10, responses: 3, responseRate: "30%" },
      { department: "Student Affairs", exits: 8, responses: 3, responseRate: "38%" },
      { department: "Information Technology", exits: 7, responses: 2, responseRate: "29%" },
      { department: "Finance & Administration", exits: 6, responses: 2, responseRate: "33%" },
      { department: "College of Nursing", exits: 5, responses: 2, responseRate: "40%" },
      { department: "Other Departments", exits: 31, responses: 9, responseRate: "29%" }
    ],
    satisfactionRatings: {
      jobSatisfaction: 3.1,
      managementSupport: 2.9,
      careerDevelopment: 2.7,
      workLifeBalance: 3.2,
      compensation: 2.8,
      benefits: 3.5
    },
    keyInsights: {
      areasOfConcern: [
        "Career advancement is top departure reason (28%)",
        "79 exits in quarter indicates high turnover",
        "Career development satisfaction low at 2.7/5.0",
        "20% reported workplace concerns"
      ],
      positiveFeedback: [
        "Benefits satisfaction remains strong at 3.5/5.0",
        "64% would still recommend as employer",
        "Work-life balance rated relatively well at 3.2/5.0",
        "Exit survey program successfully launched"
      ],
      actionItems: [
        "Develop career advancement pathways",
        "Review compensation competitiveness",
        "Enhance retention strategies for key departments",
        "Address workplace concerns reported"
      ]
    }
  },
  // Q2 FY25 - October-December 2024
  "2024-12-31": {
    reportingDate: "12/31/24",
    quarter: "Q2 FY25",
    responseRate: 68.4, // 26 of 38 benefit-eligible exits (Assignment Category filter)
    totalResponses: 26,
    totalExits: 38, // Corrected with Assignment Category filter
    overallSatisfaction: 3.0,
    wouldRecommend: 57.7, // 15 of 26 respondents
    wouldRecommendCount: { positive: 15, total: 26 },
    concernsReported: { percentage: 26.9, count: 7, total: 26, description: "reported conduct or management issues" },
    departureReasons: [
      { reason: "Better compensation elsewhere", percentage: 23.1 },
      { reason: "Career advancement opportunities", percentage: 19.2 },
      { reason: "Dissatisfied with supervisor", percentage: 15.4 },
      { reason: "Work-life balance", percentage: 11.5 },
      { reason: "Relocation", percentage: 11.5 },
      { reason: "Retirement", percentage: 7.7 },
      { reason: "Hostile work environment", percentage: 7.7 },
      { reason: "Other", percentage: 3.8 }
    ],
    departmentExits: [
      { department: "College of Medicine", exits: 11, responses: 4, responseRate: "36%" },
      { department: "Academic Affairs", exits: 9, responses: 3, responseRate: "33%" },
      { department: "Finance & Administration", exits: 8, responses: 3, responseRate: "38%" },
      { department: "Student Affairs", exits: 7, responses: 3, responseRate: "43%" },
      { department: "Information Technology", exits: 6, responses: 2, responseRate: "33%" },
      { department: "Athletics", exits: 5, responses: 2, responseRate: "40%" },
      { department: "Other Departments", exits: 30, responses: 9, responseRate: "30%" }
    ],
    satisfactionRatings: {
      jobSatisfaction: 3.0,
      managementSupport: 2.7,
      careerDevelopment: 2.6,
      workLifeBalance: 3.1,
      compensation: 2.7,
      benefits: 3.4
    },
    keyInsights: {
      areasOfConcern: [
        "Compensation now top departure reason (23.1%)",
        "Management satisfaction declining to 2.7/5.0",
        "Workplace concerns increasing to 26.9%",
        "Recommendation rate dropped below 60%"
      ],
      positiveFeedback: [
        "Response rate improving to 34.2%",
        "Benefits continue to rate well at 3.4/5.0",
        "Exit volume slightly lower than Q1",
        "Some departments showing good survey engagement"
      ],
      actionItems: [
        "Conduct compensation market analysis",
        "Implement supervisor training programs",
        "Investigate rising workplace concerns",
        "Focus retention efforts on high-turnover departments"
      ]
    }
  },
  // Q3 FY25 - Critical workplace culture issues identified
  "2025-03-31": {
    reportingDate: "3/31/25",
    quarter: "Q3 FY25",
    totalExits: 51, // Assignment Category filter
    totalResponses: 20,
    responseRate: 39.2, // 20 of 51 benefit-eligible exits
    overallSatisfaction: 2.8,
    wouldRecommend: 45,
    wouldRecommendCount: { positive: 9, total: 20 },
    concernsReported: { 
      percentage: 40, 
      count: 8, 
      total: 20, 
      description: "reported harassment, hostile environment, discrimination" 
    },
    departureReasons: [
      { reason: "Hostile work environment", percentage: 30 },
      { reason: "Lack of management support", percentage: 25 },
      { reason: "Career advancement opportunities", percentage: 20 },
      { reason: "Better compensation elsewhere", percentage: 15 },
      { reason: "Work-life balance", percentage: 5 },
      { reason: "Other", percentage: 5 }
    ],
    departmentExits: [
      { department: "Academic Affairs", exits: 8, responses: 4, responseRate: 50 },
      { department: "College of Medicine", exits: 6, responses: 3, responseRate: 50 },
      { department: "Finance & Administration", exits: 5, responses: 2, responseRate: 40 },
      { department: "Student Affairs", exits: 4, responses: 2, responseRate: 50 },
      { department: "Information Technology", exits: 4, responses: 1, responseRate: 25 },
      { department: "Other Departments", exits: 25, responses: 8, responseRate: 32 }
    ],
    satisfactionRatings: {
      jobSatisfaction: 2.6,
      managementSupport: 2.1,
      careerDevelopment: 2.3,
      workLifeBalance: 2.8,
      compensation: 2.5,
      benefits: 3.2
    },
    keyInsights: {
      areasOfConcern: [
        "40% reported workplace conduct issues including harassment",
        "Management support rated lowest at 2.1/5.0",
        "30% cited hostile work environment as departure reason",
        "Only 45% would recommend Creighton as employer"
      ],
      positiveFeedback: [
        "Benefits still rated relatively well at 3.2/5.0",
        "38.5% response rate shows engagement"
      ],
      actionItems: [
        "Immediate investigation of harassment claims",
        "Management training on supportive leadership",
        "Review and strengthen workplace conduct policies",
        "Department-specific interventions for high-concern areas"
      ]
    }
  },
  // Q4 FY25 - Actual June 30, 2025 data from PDF
  // TODO: Review FY25 Q1-Q3 termination counts for accuracy
  "2025-06-30": {
    reportingDate: "6/30/25",
    quarter: "Q4 FY25",
    responseRate: 35.3, // Corrected: 18 of 51 benefit-eligible exits (Assignment Category filter)
    totalResponses: 18,
    totalExits: 51, // Corrected with Assignment Category filter

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
  // Q1 FY26 - First quarter of fiscal year 2026
  // UPDATED 2025-12-04: Grade R now included as benefit-eligible (HSP terminations)
  "2025-09-30": {
    reportingDate: "9/30/25",
    quarter: "Q1 FY26",
    responseRate: 20.5,  // 15/73 (includes Grade R as benefit-eligible)
    totalResponses: 15,
    totalExits: 73,      // Includes 15 Grade R (now benefit-eligible)
    overallSatisfaction: 3.3,
    wouldRecommend: 80,
    wouldRecommendCount: {
      positive: 12,
      total: 15
    },
    concernsReported: {
      percentage: 20,
      count: 3,
      total: 15,
      description: "reported workplace concerns"
    },
    departureReasons: [
      { reason: "Other", count: 3, percentage: 20 },
      { reason: "Dissatisfied with direct supervisor", count: 2, percentage: 13.3 },
      { reason: "Pursue other career or education", count: 1, percentage: 6.7 },
      { reason: "Job was not as expected", count: 1, percentage: 6.7 },
      { reason: "Lack of career advancement opportunities", count: 1, percentage: 6.7 },
      { reason: "Family/Personal reasons", count: 1, percentage: 6.7 },
      { reason: "Unsatisfactory salary/pay", count: 1, percentage: 6.7 },
      { reason: "Dissatisfied with University leadership", count: 1, percentage: 6.7 },
      { reason: "Relocation", count: 1, percentage: 6.7 },
      { reason: "Unrealistic job expectations/workload/hours", count: 1, percentage: 6.7 },
      { reason: "Retirement", count: 1, percentage: 6.7 },
      { reason: "Remote/Hybrid option not available for position", count: 1, percentage: 6.7 }
    ],
    contributingReasons: [
      { reason: "Unsatisfactory salary/pay", count: 6, percentage: 40 },
      { reason: "Unrealistic job expectations/workload/hours", count: 5, percentage: 33.3 },
      { reason: "Dissatisfied with direct supervisor", count: 5, percentage: 33.3 },
      { reason: "Lack of work-life balance", count: 4, percentage: 26.7 },
      { reason: "University culture", count: 4, percentage: 26.7 },
      { reason: "Lack of flexibility", count: 4, percentage: 26.7 },
      { reason: "Lack of career advancement opportunities", count: 3, percentage: 20 },
      { reason: "Job was not as expected", count: 3, percentage: 20 },
      { reason: "Dissatisfied with University leadership", count: 3, percentage: 20 },
      { reason: "Remote/Hybrid option not available for position", count: 3, percentage: 20 },
      { reason: "Pursue other career or education", count: 2, percentage: 13.3 },
      { reason: "Commute/Lack of transportation", count: 1, percentage: 6.7 },
      { reason: "Leaving the workforce", count: 1, percentage: 6.7 },
      { reason: "Other", count: 1, percentage: 6.7 }
    ],
    departmentExits: [
      // UPDATED 2025-12-04: Grade R now included as benefit-eligible
      { department: "Pharmacy & Health Professions", exits: 19, responses: 0, responseRate: "0%" },  // Includes Grade R
      { department: "School of Medicine", exits: 10, responses: 3, responseRate: "30%" },
      { department: "Student Life", exits: 5, responses: 3, responseRate: "60%" },
      { department: "School of Dentistry", exits: 5, responses: 3, responseRate: "60%" },
      { department: "Facilities", exits: 5, responses: 0, responseRate: "0%" },
      { department: "Athletics", exits: 4, responses: 1, responseRate: "25%" },
      { department: "Public Safety", exits: 3, responses: 0, responseRate: "0%" },
      { department: "University Relations", exits: 2, responses: 2, responseRate: "100%" },
      { department: "Other Departments", exits: 13, responses: 3, responseRate: "23%" },  // Corrected from 16 (3 Grade R excluded)
    ],
    satisfactionRatings: {
      jobSatisfaction: 3.2,
      managementSupport: 3.4,
      careerDevelopment: 3,
      workLifeBalance: 3,
      compensation: 3.2,
      benefits: 3.8
    },
    keyInsights: {
      areasOfConcern: [
        "20% reported workplace concerns (3 of 15)",
        "20% would NOT recommend Creighton as employer",
        "Other is top departure reason (20%)",
        "Early data - full analysis pending additional quarters"
      ],
      positiveFeedback: [
        "80% would recommend Creighton as employer",
        "New exit survey process successfully implemented in Q1",
        "8 departments represented in responses",
        "Baseline data established for FY26 tracking"
      ],
      actionItems: [
        "Monitor response rates - target 50%+ in subsequent quarters",
        "Address top departure reason: Other",
        "Investigate workplace culture concerns",
        "Develop quarterly comparison analysis as more data becomes available"
      ]
    }
  }
};

// ============================================================================
// QUARTERLY TURNOVER TRENDS DATA
// Historical turnover data for benefit-eligible employees (16 quarters)
// ============================================================================
// Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
// Generated: 2025-11-17 via scripts/aggregate_quarterly_turnover.py
// Categories: Faculty, Staff Exempt, Staff Non-Exempt
// Time Period: Q2 FY22 → Q1 FY26 (16 quarters)

export const QUARTERLY_TURNOVER_TRENDS = {
  // Overall turnover counts by quarter (all terminations)
  // Time Range: Q1 FY23 → Q1 FY26 (13 quarters - complete FY23, FY24, FY25, start of FY26)
  // IMPORTANT: Only includes BENEFIT-ELIGIBLE employees (Assignment Category F/PT regular)
  // NOTE: Jesuits with F/PT assignments ARE INCLUDED per data owner guidance
  overallTurnover: [
    { quarter: "Q1 FY23", faculty: 10, staff: 88 },
    { quarter: "Q2 FY23", faculty: 5, staff: 55 },
    { quarter: "Q3 FY23", faculty: 3, staff: 53 },
    { quarter: "Q4 FY23", faculty: 10, staff: 67 },
    { quarter: "Q1 FY24", faculty: 4, staff: 72 },
    { quarter: "Q2 FY24", faculty: 6, staff: 41 },
    { quarter: "Q3 FY24", faculty: 3, staff: 50 },
    { quarter: "Q4 FY24", faculty: 24, staff: 59 },
    { quarter: "Q1 FY25", faculty: 5, staff: 74 },
    { quarter: "Q2 FY25", faculty: 4, staff: 34 },
    { quarter: "Q3 FY25", faculty: 8, staff: 43 },
    { quarter: "Q4 FY25", faculty: 10, staff: 41 },
    { quarter: "Q1 FY26", faculty: 4, staff: 54, hsp: 15 }  // Includes Grade R as HSP
  ],

  // Early turnover counts by quarter (<1 year tenure only)
  // Time Range: Q1 FY23 → Q1 FY26 (13 quarters)
  // IMPORTANT: Only includes BENEFIT-ELIGIBLE employees (now includes HSP/Grade R)
  earlyTurnover: [
    { quarter: "Q1 FY23", faculty: 0, staff: 19 },
    { quarter: "Q2 FY23", faculty: 1, staff: 14 },
    { quarter: "Q3 FY23", faculty: 1, staff: 16 },
    { quarter: "Q4 FY23", faculty: 1, staff: 14 },
    { quarter: "Q1 FY24", faculty: 2, staff: 15 },
    { quarter: "Q2 FY24", faculty: 0, staff: 11 },
    { quarter: "Q3 FY24", faculty: 0, staff: 14 },
    { quarter: "Q4 FY24", faculty: 4, staff: 16 },
    { quarter: "Q1 FY25", faculty: 1, staff: 19 },
    { quarter: "Q2 FY25", faculty: 1, staff: 13 },
    { quarter: "Q3 FY25", faculty: 1, staff: 9 },
    { quarter: "Q4 FY25", faculty: 0, staff: 5 },
    { quarter: "Q1 FY26", faculty: 0, staff: 13, hsp: 4 }  // Includes Grade R as HSP
  ]
};

// ============================================================================
// QUARTERLY HEADCOUNT TRENDS
// Historical headcount data by quarter for trend analysis
// ============================================================================
// Time Range: Q1 FY24 → Q4 FY25 (8 quarters - complete FY24 and FY25)
// Shows benefit-eligible faculty and staff headcount trends over time
//
// IMPORTANT DATA NOTES:
// - "faculty" = Benefit-eligible faculty only
// - "staff" = Benefit-eligible staff only
// - "total" = ALL employees (faculty + staff + HSP + students + temp)
//   Total is NOT just faculty + staff!
//
// DATA SOURCE STATUS:
// - Q4 FY24 (6/30/24): ✅ ACTUAL from WORKFORCE_DATA["2024-06-30"]
// - Q4 FY25 (6/30/25): ✅ ACTUAL from WORKFORCE_DATA["2025-06-30"]
// - Q1-Q3 FY24, Q1-Q3 FY25: ⚠️ ESTIMATED - Pending quarterly data extraction
//
// TODO: Replace estimated quarterly data with actual values from source-metrics/workforce/
// when quarterly snapshots become available. Currently only end-of-year (Q4) data is validated.

export const QUARTERLY_HEADCOUNT_TRENDS = [
  // COMPREHENSIVE QUARTERLY WORKFORCE TRENDS (Q1 FY24 - Q1 FY26)
  // Source: source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT.xlsx
  // ✅ ALL DATA EXTRACTED FROM ORACLE HCM - Actual headcount from assignment categories
  //
  // Benefit-Eligible Categories (extracted Q1 FY24 onwards):
  //   - faculty: Full-time (F09, F10, F11, F12) and Part-time (PT9, PT10, PT11, PT12) Faculty
  //   - staff: Full-time (F09, F10, F11, F12) and Part-time (PT9, PT10, PT11, PT12) Staff
  //   - total (benefit-eligible): faculty + staff
  //
  // Temporary/Non-Benefit-Eligible Categories:
  //   - students: SUE (Student Helper), CWS (Compensated Work-Study)
  //   - hsp: HSR (House Staff Resident), Grade R (Residents/Fellows as of Q1 FY26)
  //   - temp: TEMP (Temporary), NBE (Non-Benefit Eligible), PRN (PRN staff)

  { quarter: "Q1 FY24", faculty: 702, staff: 1393, total: 2095, students: 2040, hsp: 587, temp: 667 },  // ✅ ACTUAL
  { quarter: "Q2 FY24", faculty: 702, staff: 1410, total: 2112, students: 1491, hsp: 608, temp: 566 },  // ✅ ACTUAL
  { quarter: "Q3 FY24", faculty: 704, staff: 1420, total: 2124, students: 1821, hsp: 585, temp: 513 },  // ✅ ACTUAL
  { quarter: "Q4 FY24", faculty: 678, staff: 1431, total: 2109, students: 1851, hsp: 587, temp: 568 },  // ✅ ACTUAL
  { quarter: "Q1 FY25", faculty: 686, staff: 1432, total: 2118, students: 1969, hsp: 600, temp: 723 },  // ✅ ACTUAL
  { quarter: "Q2 FY25", faculty: 689, staff: 1441, total: 2130, students: 1714, hsp: 612, temp: 574 },  // ✅ ACTUAL
  { quarter: "Q3 FY25", faculty: 684, staff: 1439, total: 2123, students: 2129, hsp: 601, temp: 670 },  // ✅ ACTUAL
  { quarter: "Q4 FY25", faculty: 689, staff: 1448, total: 2137, students: 1916, hsp: 600, temp: 660 },  // ✅ ACTUAL
  { quarter: "Q1 FY26", faculty: 698, staff: 1451, total: 2149, students: 1860, hsp: 616, temp: 608 }   // ✅ ACTUAL
];

// ============================================================================
// QUARTERLY TURNOVER RATES BY CATEGORY
// Annualized turnover rates by category for quarterly comparison
// ============================================================================
// Calculated from: (Quarterly Terminations / Headcount) * 4 * 100
// Source Data: QUARTERLY_TURNOVER_TRENDS (terminations) + QUARTERLY_HEADCOUNT_TRENDS (headcount)
//
// NOTES:
// - Rates are ANNUALIZED (quarterly rate * 4) for comparison with yearly benchmarks
// ============================================================================
// ANNUAL TURNOVER RATES BY CATEGORY
// Annual and Q1 FY26 turnover rates with corresponding CUPA benchmarks
// Used by QuarterlyTurnoverRatesDashboard for visual comparison
// ============================================================================
// Data Structure:
// - FY 2024 rates compared against CUPA 2023-24 benchmarks
// - FY 2025 rates compared against CUPA 2024-25 benchmarks
// - Q1 FY26 rates compared against CUPA 2024-25 benchmarks

// Annual turnover rates by fiscal year
export const ANNUAL_TURNOVER_RATES_BY_CATEGORY = {
  fy2024: {
    label: "FY 2024",
    period: "Jul 2023 - Jun 2024",
    faculty: 7.7,
    staffExempt: 13.6,
    staffNonExempt: 17.8,
    total: 12.8
  },
  fy2025: {
    label: "FY 2025",
    period: "Jul 2024 - Jun 2025",
    faculty: 6.1,
    staffExempt: 12.6,
    staffNonExempt: 15.3,
    total: 11.2
  },
  q1fy26: {
    label: "Q1 FY26",
    period: "Jul-Sep 2025",
    faculty: 2.3,
    staffExempt: 16.5,
    staffNonExempt: 13.8,
    total: 10.8
  }
};

// CUPA Higher Education benchmarks by fiscal year
export const TURNOVER_BENCHMARKS = {
  fy2324: {
    label: "Higher Ed. Avg.* 2023-24",
    faculty: 9.1,
    staffExempt: 16.7,
    staffNonExempt: 19.9,
    total: 14.1
  },
  fy2425: {
    label: "Higher Ed. Avg.* 2024-25",
    faculty: 8.7,
    staffExempt: 15.0,
    staffNonExempt: 20.7,
    total: 13.8
  }
};

// Legacy quarterly data kept for reference (Q1 FY26 actual values)
export const QUARTERLY_TURNOVER_RATES_BY_CATEGORY = [
  {
    quarter: "Q1 FY26",
    period: "Jul-Sep 2025",
    faculty: { terminations: 4, headcount: 698, rate: 2.3 },
    staffExempt: { terminations: 24, headcount: 582, rate: 16.5 },
    staffNonExempt: { terminations: 30, headcount: 869, rate: 13.8 },
    staff: { terminations: 54, headcount: 1451, rate: 14.9 },
    total: { terminations: 58, headcount: 2149, rate: 10.8 }
  }
];

// Legacy benchmarks for backward compatibility
export const QUARTERLY_TURNOVER_BENCHMARKS = {
  faculty: 8.7,         // Higher Ed Avg 2024-25
  staffExempt: 15.0,    // Higher Ed Avg 2024-25 (Professional Staff)
  staffNonExempt: 20.7, // Higher Ed Avg 2024-25 (Support Staff)
  total: 13.8           // Higher Ed Avg 2024-25 (Overall)
};

// ============================================================================
// QUARTERLY TURNOVER DATA (Detailed by Quarter)
// Detailed termination data for quarterly turnover dashboards
// ============================================================================
// Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
// Generated: 2025-11-17 via scripts/extract_q1_fy26_details.py
// Pattern: Follows same structure as EXIT_SURVEY_DATA with date-based keys

export const QUARTERLY_TURNOVER_DATA = {
  // Q1 FY26 - July-September 2025
  // UPDATED 2025-12-04: Grade R now included as benefit-eligible under House Staff Physicians
  // Total: 73 (includes 15 Grade R as HSP terminations)
  "2025-09-30": {
    reportingDate: "9/30/25",
    quarter: "Q1 FY26",
    fiscalPeriod: "July 2025 - September 2025",
    summary: {
      total: {
        count: 73,  // Includes Grade R as benefit-eligible
        oma: 68,
        phx: 5
      },
      faculty: {
        count: 4,
        oma: 4,
        phx: 0
      },
      staffExempt: {
        count: 24,  // 39 - 15 HSP (Grade R now separate category)
        oma: 23,
        phx: 1
      },
      staffNonExempt: {
        count: 30,
        oma: 26,
        phx: 4
      },
      staff: {
        count: 54,  // 24 + 30 (excludes 15 HSP)
        oma: 49,
        phx: 5
      },
      houseStaffPhysicians: {
        count: 15,  // Grade R terminations (benefit-eligible)
        oma: 15,
        phx: 0
      }
    },
    terminationTypesByGroup: [
      {
        group: "Benefit Eligible Faculty",
        total: 4,
        voluntary: 2,
        involuntary: 0,
        retirement: 2,
        endOfAssignment: 0
      },
      {
        group: "Benefit Eligible Staff",
        total: 54,
        voluntary: 44,
        involuntary: 3,
        retirement: 7,
        endOfAssignment: 0
      },
      {
        group: "House Staff Physicians",
        total: 15,  // Grade R terminations (now benefit-eligible)
        voluntary: 3,
        involuntary: 0,
        retirement: 0,
        endOfAssignment: 12  // Training program completions
      }
    ],
    yearsOfService: [
      { range: "<1 Year", faculty: 0, staff: 13, hsp: 4 },  // Includes Grade R
      { range: "1-3 Years", faculty: 1, staff: 19, hsp: 11 },  // Includes Grade R
      { range: "3-5 Years", faculty: 1, staff: 11, hsp: 0 },
      { range: "5-10 Years", faculty: 0, staff: 6, hsp: 0 },
      { range: "10-15 Years", faculty: 0, staff: 3, hsp: 0 },
      { range: "15-20 Years", faculty: 0, staff: 0, hsp: 0 },
      { range: "20+ Years", faculty: 2, staff: 2, hsp: 0 }
    ],
    ageGroups: [
      { range: "<25", faculty: 0, staff: 9, hsp: 1 },   // Includes Grade R
      { range: "25-34", faculty: 1, staff: 18, hsp: 11 }, // Includes Grade R
      { range: "35-44", faculty: 0, staff: 10, hsp: 3 }, // Includes Grade R
      { range: "45-54", faculty: 1, staff: 5, hsp: 0 },
      { range: "55-64", faculty: 0, staff: 7, hsp: 0 },
      { range: "65+", faculty: 2, staff: 5, hsp: 0 }
    ],
    earlyTurnover: {
      total: 17,  // Includes Grade R (4 HSP + 13 staff)
      byTerminationType: [
        { name: "Voluntary", value: 11, percentage: 64.7, color: "#3B82F6" },
        { name: "End of Assignment", value: 4, percentage: 23.5, color: "#10B981" },  // Grade R program completions
        { name: "Involuntary", value: 2, percentage: 11.8, color: "#EF4444" }
      ],
      byEmployeeCategory: [
        { name: "Benefit Eligible Staff", value: 13, percentage: 76.5, color: "#3B82F6" },
        { name: "House Staff Physicians", value: 4, percentage: 23.5, color: "#10B981" }  // Grade R
      ],
      // Early turnover by school/area - where <1 year tenure departures occurred
      // Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
      // Filter: Q1 FY26, Faculty + Staff, <1 year tenure, excludes TEMP/PRN and Grade R
      bySchool: [
        { school: "Medicine", count: 4, percentage: 30.8, color: "#3B82F6" },
        { school: "Public Safety", count: 2, percentage: 15.4, color: "#EC4899" },
        { school: "Facilities", count: 2, percentage: 15.4, color: "#EF4444" },
        { school: "Other", count: 5, percentage: 38.5, color: "#6B7280" }  // Aggregated for donut chart
      ],
      // Detailed breakdown by school - all 8 schools with early turnover
      bySchoolDetailed: [
        { school: "Medicine", count: 4, percentage: 30.8 },
        { school: "Facilities", count: 2, percentage: 15.4 },
        { school: "Public Safety", count: 2, percentage: 15.4 },
        { school: "Pharmacy & Health Professions", count: 1, percentage: 7.7 },
        { school: "Provost", count: 1, percentage: 7.7 },
        { school: "Student Success", count: 1, percentage: 7.7 },
        { school: "Enrollment Management", count: 1, percentage: 7.7 },
        { school: "Student Life", count: 1, percentage: 7.7 }
      ]
    },
    // Staff Turnover by School/Area - Deep dive into where staff departures occurred
    // Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
    // Filter: Q1 FY26, Staff Exempt + Non-Exempt, excludes TEMP/PRN and Grade R
    staffTurnoverBySchool: [
      { school: "Medicine", count: 10, percentage: 18.5, color: "#3B82F6" },
      { school: "Pharmacy & Health Professions", count: 5, percentage: 9.3, color: "#10B981" },
      { school: "Student Life", count: 5, percentage: 9.3, color: "#8B5CF6" },
      { school: "Dentistry", count: 5, percentage: 9.3, color: "#F59E0B" },
      { school: "Facilities", count: 5, percentage: 9.3, color: "#EF4444" },
      { school: "Athletics", count: 4, percentage: 7.4, color: "#06B6D4" },
      { school: "Public Safety", count: 3, percentage: 5.6, color: "#EC4899" },
      { school: "Other", count: 17, percentage: 31.5, color: "#6B7280" }  // 11 areas with 1-2 departures each
    ],
    // Faculty Turnover by School - Deep dive into where faculty departures occurred
    // Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
    // Filter: Q1 FY26, Faculty, excludes TEMP/PRN
    facultyTurnoverBySchool: [
      { school: "Pharmacy & Health Professions", count: 2, percentage: 50.0, color: "#10B981" },
      { school: "Law School", count: 1, percentage: 25.0, color: "#3B82F6" },
      { school: "Arts & Sciences", count: 1, percentage: 25.0, color: "#8B5CF6" }
    ],
    // Combined Turnover by School - Faculty + Staff together for complete picture
    // Source: source-metrics/terminations/cleaned/FY25_Q4/terminations_cleaned.csv
    // Shows all schools with any departures, sorted by total descending
    turnoverBySchool: [
      { school: "Medicine", faculty: 0, staff: 10, total: 10 },
      { school: "Pharmacy & Health Professions", faculty: 2, staff: 5, total: 7 },
      { school: "Student Life", faculty: 0, staff: 5, total: 5 },
      { school: "Dentistry", faculty: 0, staff: 5, total: 5 },
      { school: "Facilities", faculty: 0, staff: 5, total: 5 },
      { school: "Athletics", faculty: 0, staff: 4, total: 4 },
      { school: "Public Safety", faculty: 0, staff: 3, total: 3 },
      { school: "Law School", faculty: 1, staff: 1, total: 2 },
      { school: "Arts & Sciences", faculty: 1, staff: 0, total: 1 },
      { school: "Other", faculty: 0, staff: 16, total: 16, note: "Enrollment Management, UCOM, University Relations, Phoenix, Provost, VPMM, VPFN, CollProCE, Student Success, Information Technology, (blank)" }
    ]
  },
  // Q4 FY25 - April-June 2025
  // Derived from legacy TURNOVER_DATA["2025-06-30"]
  "2025-06-30": {
    reportingDate: "6/30/25",
    quarter: "Q4 FY25",
    fiscalPeriod: "April 2025 - June 2025",
    summary: {
      total: { count: 62, oma: 57, phx: 5 },
      faculty: { count: 21, oma: 20, phx: 1 },
      staff: { count: 41, oma: 37, phx: 4 }
    },
    terminationTypesByGroup: [
      {
        group: "Benefit Eligible Faculty",
        total: 21,
        voluntary: 3,
        involuntary: 1,
        retirement: 9,
        endOfAssignment: 8
      },
      {
        group: "Benefit Eligible Staff",
        total: 41,
        voluntary: 27,
        involuntary: 3,
        retirement: 5,
        endOfAssignment: 6
      }
    ],
    yearsOfService: [
      { range: "<1 Year", faculty: 9, staff: 18 },
      { range: "1-5 Years", faculty: 5, staff: 9 },
      { range: "5-10 Years", faculty: 4, staff: 7 },
      { range: "10-20 Years", faculty: 3, staff: 6 },
      { range: "20+ Years", faculty: 0, staff: 1 }
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
    turnoverBySchool: [
      { school: "College of Medicine", faculty: 5, staff: 30, total: 35 },
      { school: "Academic Affairs", faculty: 8, staff: 15, total: 23 },
      { school: "Student Affairs", faculty: 3, staff: 20, total: 23 },
      { school: "Finance & Administration", faculty: 0, staff: 17, total: 17 },
      { school: "Information Technology", faculty: 0, staff: 11, total: 11 }
    ]
  }
};

// ============================================================================
// QUARTERLY WORKFORCE DATA (Detailed by Quarter)
// Detailed headcount and workforce composition for quarterly workforce dashboards
// ============================================================================
// Source: Workforce audit data and quarterly snapshots
// Pattern: Follows same structure as QUARTERLY_TURNOVER_DATA with date-based keys

export const QUARTERLY_WORKFORCE_DATA = {
  // Q1 FY26 - July-September 2025
  // Data Source: source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx
  // Processed: 2025-11-19 via scripts/extract_q1_fy26_workforce.js
  // Methodology: WORKFORCE_METHODOLOGY.md v2.1 (Person Type + Assignment Category)
  // UPDATED 2025-12-04: Grade R now included as benefit-eligible under House Staff Physicians
  "2025-09-30": {
    reportingDate: "9/30/25",
    quarter: "Q1 FY26",
    fiscalPeriod: "July 2025 - September 2025",
    summary: {
      total: {
        count: 5528,
        oma: 4834,
        phx: 694
      },
      faculty: {
        count: 697,
        oma: 657,
        phx: 40
      },
      staff: {
        count: 1419,
        oma: 1318,
        phx: 101
      },
      houseStaffPhysicians: {
        count: 625,  // 613 HSR + 12 Grade R (now benefit-eligible)
        oma: 282,    // 270 HSR + 12 Grade R
        phx: 343
      },
      studentWorkers: {
        count: 2157,
        oma: 2088,
        phx: 69
      },
      temporary: {
        count: 630,  // TEMP + NBE + PRN only
        oma: 489,
        phx: 141
      }
    },
    // Employee group breakdown
    employeeGroups: [
      {
        group: "Benefit-Eligible Faculty",
        faculty: 697,
        staff: 0,
        hsp: 0,
        students: 0,
        total: 697
      },
      {
        group: "Benefit-Eligible Staff",
        faculty: 0,
        staff: 1419,
        hsp: 0,
        students: 0,
        total: 1419
      },
      {
        group: "House Staff Physicians",
        faculty: 0,
        staff: 0,
        hsp: 625,  // 613 HSR + 12 Grade R (now benefit-eligible)
        students: 0,
        total: 625
      },
      {
        group: "Non-Benefit Eligible",
        faculty: 0,
        staff: 0,
        hsp: 0,
        students: 0,
        total: 630  // TEMP + NBE + PRN only
      },
      {
        group: "Student Workers",
        faculty: 0,
        staff: 0,
        hsp: 0,
        students: 2157,
        total: 2157
      }
    ],
    // Location breakdown
    locationDetails: {
      omaha: {
        faculty: 657,
        staff: 1318,
        hsp: 282,     // 270 HSR + 12 Grade R (now benefit-eligible)
        students: 2088,
        temp: 489,    // TEMP + NBE + PRN only
        total: 4834
      },
      phoenix: {
        faculty: 40,
        staff: 101,
        hsp: 343,
        students: 69,
        temp: 141,
        total: 694
      }
    },
    // Assignment category breakdown (RAW counts from HR system)
    // NOTE: Grade R employees are now included as benefit-eligible under HSP
    // HSP total = 613 HSR + 12 Grade R = 625
    assignmentCategories: {
      "F12": 1694,  // Full-time 12-month
      "HSR": 613,   // House Staff Residents
      "PT12": 49,   // Part-time 12-month
      "TEMP": 516,  // Temporary
      "SUE": 1793,  // Student Worker Employment
      "CWS": 364,   // College Work Study
      "F11": 49,    // Full-time 11-month
      "F09": 297,   // Full-time 9-month
      "PRN": 107,   // PRN (as needed)
      "PT9": 20,    // Part-time 9-month
      "NBE": 7,     // Non-benefit eligible
      "F10": 10,    // Full-time 10-month
      "PT11": 1,    // Part-time 11-month
      "PT10": 8     // Part-time 10-month
    },
    // Grade R inclusion (for test validation)
    // As of December 2025, Grade R employees are benefit-eligible under HSP
    gradeRInclusion: {
      count: 12,
      description: "Grade R employees with F12 assignment included as benefit-eligible under House Staff Physicians"
    },
    // Ethnicity and Gender Demographics (Benefit-Eligible only)
    // Source: scripts/extract_q1_fy26_ethnicity.py
    demographics: {
      ethnicity: {
        faculty: {
          total: 697,
          distribution: [
            { ethnicity: "White", count: 543, percentage: 77.9, color: "#93C5FD" },
            { ethnicity: "Not Disclosed", count: 53, percentage: 7.6, color: "#D1D5DB" },
            { ethnicity: "Asian", count: 51, percentage: 7.3, color: "#60A5FA" },
            { ethnicity: "Two or More Races", count: 18, percentage: 2.6, color: "#FBBF24" },
            { ethnicity: "Black or African American", count: 17, percentage: 2.4, color: "#34D399" },
            { ethnicity: "Hispanic or Latino", count: 12, percentage: 1.7, color: "#F87171" },
            { ethnicity: "American Indian or Alaska Native", count: 3, percentage: 0.4, color: "#A78BFA" }
          ]
        },
        staff: {
          total: 1431,
          distribution: [
            { ethnicity: "White", count: 989, percentage: 69.1, color: "#93C5FD" },
            { ethnicity: "Not Disclosed", count: 126, percentage: 8.8, color: "#D1D5DB" },
            { ethnicity: "Asian", count: 106, percentage: 7.4, color: "#60A5FA" },
            { ethnicity: "Black or African American", count: 82, percentage: 5.7, color: "#34D399" },
            { ethnicity: "Hispanic or Latino", count: 63, percentage: 4.4, color: "#FBBF24" },
            { ethnicity: "Two or More Races", count: 56, percentage: 3.9, color: "#F87171" },
            { ethnicity: "American Indian or Alaska Native", count: 6, percentage: 0.4, color: "#A78BFA" },
            { ethnicity: "Native Hawaiian or other Pacific Islander", count: 3, percentage: 0.2, color: "#FB923C" }
          ]
        }
      },
      gender: {
        faculty: {
          total: 697,
          distribution: [
            { gender: "Female", count: 369, percentage: 52.9, color: "#EC4899" },
            { gender: "Male", count: 328, percentage: 47.1, color: "#3B82F6" }
          ]
        },
        staff: {
          total: 1431,
          distribution: [
            { gender: "Female", count: 903, percentage: 63.1, color: "#EC4899" },
            { gender: "Male", count: 528, percentage: 36.9, color: "#3B82F6" }
          ]
        }
      },
      ageGender: {
        faculty: {
          category: "Benefit-Eligible Faculty",
          total: 697,
          femaleTotal: 369,
          maleTotal: 328,
          femalePercentage: 52.9,
          malePercentage: 47.1,
          ageGenderBreakdown: [
            { ageBand: "20-30", female: 4, male: 8, total: 12 },
            { ageBand: "31-40", female: 91, male: 52, total: 143 },
            { ageBand: "41-50", female: 126, male: 74, total: 200 },
            { ageBand: "51-60", female: 81, male: 82, total: 163 },
            { ageBand: "61 Plus", female: 67, male: 112, total: 179 }
          ]
        },
        staff: {
          category: "Benefit-Eligible Staff",
          total: 1431,
          femaleTotal: 903,
          maleTotal: 528,
          femalePercentage: 63.1,
          malePercentage: 36.9,
          ageGenderBreakdown: [
            { ageBand: "20-30", female: 146, male: 81, total: 227 },
            { ageBand: "31-40", female: 174, male: 121, total: 295 },
            { ageBand: "41-50", female: 214, male: 115, total: 329 },
            { ageBand: "51-60", female: 230, male: 116, total: 346 },
            { ageBand: "61 Plus", female: 139, male: 95, total: 234 }
          ]
        }
      }
    }
  },
  // Q4 FY25 - April-June 2025
  // Derived from legacy WORKFORCE_DATA["2025-06-30"]
  "2025-06-30": {
    reportingDate: "6/30/25",
    quarter: "Q4 FY25",
    fiscalPeriod: "April 2025 - June 2025",
    summary: {
      total: { count: 5037, oma: 4287, phx: 750 },
      faculty: { count: 689, oma: 649, phx: 40 },
      staff: { count: 1448, oma: 1344, phx: 104 },
      houseStaffPhysicians: { count: 612, oma: 268, phx: 344 },
      studentWorkers: { count: 1714, oma: 1604, phx: 110 },
      temporary: { count: 574, oma: 422, phx: 152 }
    },
    locationDetails: {
      omaha: { faculty: 649, staff: 1344, hsp: 268, students: 1604, temp: 422, total: 4287 },
      phoenix: { faculty: 40, staff: 104, hsp: 344, students: 110, temp: 152, total: 750 }
    }
  }
};

// Available reporting dates - All FY25 quarters + Q1 FY26
export const AVAILABLE_DATES = [
  { value: "2024-09-30", label: "9/30/24 (Q1 FY25)", status: "complete" },
  { value: "2024-12-31", label: "12/31/24 (Q2 FY25)", status: "complete" },
  { value: "2025-03-31", label: "3/31/25 (Q3 FY25)", status: "complete" },
  { value: "2025-06-30", label: "6/30/25 (Q4 FY25)", status: "complete" },
  { value: "2025-09-30", label: "9/30/25 (Q1 FY26)", status: "complete" }
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
  return EXIT_SURVEY_DATA[date] || null;
};

export const getQuarterlyTurnoverData = (date = "2025-09-30") => {
  return QUARTERLY_TURNOVER_DATA[date] || null;
};

export const getQuarterlyWorkforceData = (date = "2025-09-30") => {
  return QUARTERLY_WORKFORCE_DATA[date] || null;
};

export const getQuarterlyTurnoverRatesByCategory = () => {
  return {
    rates: QUARTERLY_TURNOVER_RATES_BY_CATEGORY,
    benchmarks: QUARTERLY_TURNOVER_BENCHMARKS
  };
};

// New function for annual turnover rates with benchmarks comparison
export const getAnnualTurnoverRatesByCategory = () => {
  return {
    annualRates: ANNUAL_TURNOVER_RATES_BY_CATEGORY,
    benchmarks: TURNOVER_BENCHMARKS
  };
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

// Helper function to get total temporary employees (TEMP + NBE + PRN)
export const getTempTotal = (date = "2025-06-30") => {
  const workforceData = getWorkforceData(date);
  
  if (!workforceData.categories) {
    return workforceData.temp || 0;
  }
  
  const temp = workforceData.categories["TEMP"] || 0;
  const nbe = workforceData.categories["NBE"] || 0;
  const prn = workforceData.categories["PRN"] || 0;
  
  return temp + nbe + prn;
};

// Helper function to get benefit-eligible breakdown
export const getBenefitEligibleBreakdown = (date = "2025-06-30") => {
  const workforceData = getWorkforceData(date);
  
  if (!workforceData.categories) {
    return {
      faculty: workforceData.faculty || 0,
      staff: workforceData.staff || 0,
      total: (workforceData.faculty || 0) + (workforceData.staff || 0)
    };
  }
  
  // Benefit-eligible categories
  const beCategories = ["F12", "F11", "F09", "F10", "PT12", "PT9", "PT11", "PT10"];
  const beTotal = beCategories.reduce((sum, cat) => sum + (workforceData.categories[cat] || 0), 0);
  
  // Use the faculty/staff values from the data which represent the BE split
  return {
    faculty: workforceData.faculty || 0,
    staff: workforceData.staff || 0,
    total: beTotal
  };
};

// ============================================================================
// FISCAL PERIODS CONFIGURATION
// For Quarterly Report Dashboard and Data Import
// ============================================================================

/**
 * Turnover Metrics Data
 *
 * Consolidated turnover dashboard data from HR PowerPoint slides.
 * This is the fallback data used when the API/database is not available.
 * Primary source: source-metrics/turnover/Turnover_Metrics_Master.xlsx
 */
export const TURNOVER_METRICS = {
  "FY2025": {
    // Summary rates (from TurnoverDashboard summary cards)
    summaryRates: {
      total: { rate: 11.2, priorYear: 12.8, change: -1.6, trend: 'positive' },
      faculty: { rate: 6.1, priorYear: 7.7, change: -1.6, trend: 'positive' },
      staffExempt: { rate: 12.6, priorYear: 13.6, change: -1.0, trend: 'positive' },
      staffNonExempt: { rate: 15.3, priorYear: 12.8, change: -2.5, trend: 'positive' }
    },
    // Turnover rates table with benchmarks
    turnoverRatesTable: [
      { category: 'Faculty', fy2023: 7.9, heAvg2023: 9.10, fy2024: 7.7, heAvg2024: 8.70, fy2025: 6.1, change: -1.6 },
      { category: 'Staff Exempt', fy2023: 15.5, heAvg2023: 16.70, fy2024: 13.6, heAvg2024: 15.00, fy2025: 12.6, change: -1.0 },
      { category: 'Staff Non-Exempt', fy2023: 22.4, heAvg2023: 19.90, fy2024: 17.8, heAvg2024: 20.70, fy2025: 15.3, change: -2.5 },
      { category: 'Total', fy2023: 14.9, heAvg2023: 14.10, fy2024: 12.8, heAvg2024: 13.80, fy2025: 11.2, change: -1.6 }
    ],
    // Voluntary/Involuntary/Retirement breakdown
    turnoverBreakdown: [
      { category: 'Staff Exempt', involuntary: 0.8, voluntary: 10.8, retirement: 1.0, total: 12.6 },
      { category: 'Staff Non-Exempt', involuntary: 1.5, voluntary: 12.9, retirement: 0.9, total: 15.3 },
      { category: 'Faculty', involuntary: 0.3, voluntary: 3.3, retirement: 2.5, total: 6.1 }
    ],
    // Staff turnover by department (deviation chart)
    staffDeviation: [
      { department: 'Student Services', rate: 30.9 },
      { department: 'Pro. & Cont Education', rate: 26.1 },
      { department: 'Pharmacy & Health Professions', rate: 25.9 },
      { department: 'Clinical Affairs', rate: 22.2 },
      { department: 'College of Nursing', rate: 21.6 },
      { department: 'Law School', rate: 19.6 },
      { department: 'Dentistry', rate: 19.4 },
      { department: 'General Counsel', rate: 19.0 },
      { department: 'Communications', rate: 18.7 },
      { department: 'Academic Affairs', rate: 18.2 },
      { department: 'Athletics', rate: 17.9 },
      { department: 'Center for Excellence', rate: 16.2 },
      { department: 'Public Safety', rate: 16.0 },
      { department: 'Student Life', rate: 15.2 },
      { department: 'EDI', rate: 14.3 },
      { department: 'Global Engagement', rate: 13.6 },
      { department: 'Total Staff Turnover', rate: 13.6, isAverage: true },
      { department: 'Facilities', rate: 13.4 },
      { department: 'IT', rate: 13.3 },
      { department: 'School of Medicine', rate: 12.5 },
      { department: 'Arts & Sciences', rate: 10.9 },
      { department: 'Heider College of Business', rate: 10.7 },
      { department: 'University Relations', rate: 10.5 },
      { department: 'Enrollment Management', rate: 9.2 },
      { department: 'Research', rate: 7.9 },
      { department: 'Provost Office', rate: 4.9 },
      { department: 'Human Resources', rate: 4.3 },
      { department: 'Finance', rate: 3.8 },
      { department: 'Phoenix Support', rate: 3.6 },
      { department: 'Library Services', rate: 3.0 },
      { department: 'Mission & Ministry', rate: 0 },
      { department: 'Executive Vice President', rate: 0 },
      { department: 'Presidents Office', rate: 0 }
    ],
    staffAverageRate: 13.6,
    // Faculty turnover by school (deviation chart)
    facultyDeviation: [
      { school: 'College of Nursing', rate: 13.7 },
      { school: 'Pharmacy & Health Professions', rate: 7.5 },
      { school: 'School of Dentistry', rate: 6.9 },
      { school: 'Total Faculty Turnover', rate: 6.3, isAverage: true },
      { school: 'College of Arts & Sciences', rate: 6.0 },
      { school: 'School of Medicine', rate: 5.6 },
      { school: 'Law School', rate: 3.7 },
      { school: 'Heider College of Business', rate: 1.6 },
      { school: 'Coll of Pro Studies and Cont Ed', rate: 0.0 }
    ],
    facultyAverageRate: 6.3,
    // Length of service breakdown
    lengthOfService: {
      faculty: [
        { name: 'Less Than One', percentage: 13.8, count: 9 },
        { name: '1 to 5', percentage: 7.2, count: 5 },
        { name: '5 to 10', percentage: 5.5, count: 4 },
        { name: '10 to 20', percentage: 4.0, count: 3 },
        { name: '20 Plus', percentage: 6.2, count: 4 }
      ],
      staff: [
        { name: 'Less Than One', percentage: 29.8, count: 18 },
        { name: '1 to 5', percentage: 14.2, count: 9 },
        { name: '5 to 10', percentage: 11.6, count: 7 },
        { name: '10 to 20', percentage: 9.0, count: 6 },
        { name: '20 Plus', percentage: 5.3, count: 3 }
      ]
    },
    // Faculty retirement analysis
    facultyRetirement: {
      trends: [
        { year: 2019, avgAge: 71.4, avgLOS: 31.9 },
        { year: 2020, avgAge: 69.3, avgLOS: 28.2 },
        { year: 2021, avgAge: 66.5, avgLOS: 26.7 },
        { year: 2022, avgAge: 67.6, avgLOS: 30.5 },
        { year: 2023, avgAge: 70.9, avgLOS: 28.5 },
        { year: 2024, avgAge: 69.3, avgLOS: 28.1 },
        { year: 2025, avgAge: 69.4, avgLOS: 26.7 }
      ],
      ageDistribution: [
        { name: 'Under 69', value: 85.9, color: '#0054A6' },
        { name: 'Over 69', value: 7.8, color: '#FFC627' },
        { name: 'Three-Year', value: 2.6, color: '#95D2F3' },
        { name: 'Two-Year', value: 2.0, color: '#00245D' },
        { name: 'One-Year', value: 1.7, color: '#1F74DB' }
      ],
      bySchool: [
        { school: 'College of Arts & Sciences', count: 14 },
        { school: 'School of Dentistry', count: 11 },
        { school: 'School of Medicine', count: 10 },
        { school: 'School of Pharmacy & Health Professions', count: 6 },
        { school: 'Heider College of Business', count: 5 },
        { school: 'School of Law', count: 5 },
        { school: 'College of Nursing', count: 3 }
      ]
    },
    // Staff retirement analysis
    staffRetirement: {
      trends: [
        { year: 2019, avgAge: 63.7, avgLOS: 21.7 },
        { year: 2020, avgAge: 64.8, avgLOS: 23.3 },
        { year: 2021, avgAge: 66.5, avgLOS: 23.3 },
        { year: 2022, avgAge: 64.8, avgLOS: 22.6 },
        { year: 2023, avgAge: 65.4, avgLOS: 21.7 },
        { year: 2024, avgAge: 67.1, avgLOS: 24.5 },
        { year: 2025, avgAge: 68.1, avgLOS: 21.5 }
      ],
      ageDistribution: [
        { name: 'Under', value: 85.9, color: '#0054A6' },
        { name: 'Over', value: 7.8, color: '#FFC627' },
        { name: 'Three-Year', value: 2.6, color: '#95D2F3' },
        { name: 'Two-Year', value: 2.0, color: '#FF6B35' },
        { name: 'One-Year', value: 1.7, color: '#00245D' }
      ]
    }
  },
  // Historical turnover rates for trend chart
  historicalRates: [
    { fiscalYear: 'FY2022', rate: 14.5 },
    { fiscalYear: 'FY2023', rate: 14.9 },
    { fiscalYear: 'FY2024', rate: 12.8 },
    { fiscalYear: 'FY2025', rate: 11.2 }
  ],
  // Retirements by fiscal year
  retirementsByFY: [
    { fiscalYear: 'FY2018', faculty: 13, staffNonExempt: 9, staffExempt: 8, total: 30 },
    { fiscalYear: 'FY2019', faculty: 20, staffNonExempt: 16, staffExempt: 12, total: 48 },
    { fiscalYear: 'FY2020', faculty: 23, staffNonExempt: 10, staffExempt: 8, total: 41 },
    { fiscalYear: 'FY2021', faculty: 19, staffNonExempt: 16, staffExempt: 7, total: 42 },
    { fiscalYear: 'FY2022', faculty: 19, staffNonExempt: 13, staffExempt: 10, total: 42 },
    { fiscalYear: 'FY2023', faculty: 21, staffNonExempt: 17, staffExempt: 11, total: 49 },
    { fiscalYear: 'FY2024', faculty: 17, staffNonExempt: 5, staffExempt: 14, total: 36 },
    { fiscalYear: 'FY2025', faculty: 20, staffNonExempt: 9, staffExempt: 11, total: 40 }
  ]
};

/**
 * Get turnover metrics data for a specific fiscal year
 * @param {string} fiscalYear - Fiscal year (e.g., 'FY2025')
 * @returns {Object} Turnover metrics data
 */
export const getTurnoverMetrics = (fiscalYear = 'FY2025') => {
  const yearData = TURNOVER_METRICS[fiscalYear];
  if (!yearData) {
    console.warn(`No turnover metrics found for ${fiscalYear}, using FY2025`);
    return TURNOVER_METRICS['FY2025'];
  }
  return {
    ...yearData,
    historicalRates: TURNOVER_METRICS.historicalRates,
    retirementsByFY: TURNOVER_METRICS.retirementsByFY
  };
};

/**
 * Fiscal Period Metadata
 * Creighton University Fiscal Year: July 1 - June 30
 * - Q1: July - September (ends Sept 30)
 * - Q2: October - December (ends Dec 31)
 * - Q3: January - March (ends Mar 31)
 * - Q4: April - June (ends Jun 30)
 */
export const FISCAL_PERIODS = {
  "FY25_Q1": {
    fiscalYear: "FY25",
    quarter: "Q1",
    label: "Q1 FY25",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    reportDate: "2024-09-30",
    displayName: "July - September 2024",
    hasData: true
  },
  "FY25_Q2": {
    fiscalYear: "FY25",
    quarter: "Q2",
    label: "Q2 FY25",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    reportDate: "2024-12-31",
    displayName: "October - December 2024",
    hasData: true
  },
  "FY25_Q3": {
    fiscalYear: "FY25",
    quarter: "Q3",
    label: "Q3 FY25",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    reportDate: "2025-03-31",
    displayName: "January - March 2025",
    hasData: true
  },
  "FY25_Q4": {
    fiscalYear: "FY25",
    quarter: "Q4",
    label: "Q4 FY25",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    reportDate: "2025-06-30",
    displayName: "April - June 2025",
    hasData: true
  }
};

/**
 * Get all available fiscal quarters (only those with valid data)
 * @returns {Array} Array of quarters with hasData: true
 */
export const getAvailableQuarters = () => {
  return Object.entries(FISCAL_PERIODS)
    .filter(([_, period]) => period.hasData)
    .map(([key, period]) => ({
      value: key,
      label: period.label,
      displayName: period.displayName,
      reportDate: period.reportDate
    }))
    .sort((a, b) => b.value.localeCompare(a.value)); // Sort newest first
};

/**
 * Get the most recent quarter with valid data
 * @returns {string} Quarter key (e.g., "FY25_Q4")
 */
export const getMostRecentQuarter = () => {
  const available = getAvailableQuarters();
  return available.length > 0 ? available[0].value : null;
};

/**
 * Get the previous quarter for QoQ comparison
 * @param {string} fiscalQuarter - Current quarter key (e.g., "FY25_Q4")
 * @returns {string|null} Previous quarter key or null if first quarter
 */
export const getPreviousQuarter = (fiscalQuarter) => {
  const quarters = Object.keys(FISCAL_PERIODS).sort();
  const currentIndex = quarters.indexOf(fiscalQuarter);

  if (currentIndex <= 0) return null;

  const previousKey = quarters[currentIndex - 1];
  return FISCAL_PERIODS[previousKey]?.hasData ? previousKey : null;
};

/**
 * Get fiscal period metadata
 * @param {string} fiscalQuarter - Quarter key (e.g., "FY25_Q4")
 * @returns {Object|null} Period metadata or null if not found
 */
export const getFiscalPeriod = (fiscalQuarter) => {
  return FISCAL_PERIODS[fiscalQuarter] || null;
};