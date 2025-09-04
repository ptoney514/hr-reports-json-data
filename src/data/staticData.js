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
    faculty: 786,
    staff: 1323,  // Corrected: BE staff only (from F12, F11, F09, F10, PT12, PT9, PT11, PT10 categories)
    hsp: 608,
    temp: 566,  // Corrected: TEMP (447) + NBE (14) + PRN (105) = 566
    jesuits: 17,
    other: 0,  // NBE and PRN moved to temp
    locations: {
      "Omaha Campus": 4260,
      "Phoenix Campus": 514
    },
    locationDetails: {
      omaha: {
        faculty: 646,
        staff: 1219,
        hsp: 264,
        students: 1549,
        tempFac: 185,
        tempStaff: 195,
        temp: 380
      },
      phoenix: {
        faculty: 140,
        staff: 104,
        hsp: 344,
        students: 58,
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
                "name": "VPSL",
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
                "name": "VPEM",
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
                "name": "SueSucs",
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
                "name": "VPUR",
                "faculty": 0,
                "staff": 130,
                "hsp": 0,
                "total": 130
          },
          {
                "name": "VPIT",
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
      total: 1714,
      studentWorker: 1607,
      fws: 107
    },
    totalEmployees: 5037,
    faculty: 788,
    staff: 1349,  // Corrected: BE staff only (from F12, F11, F09, F10, PT12, PT9, PT11, PT10 categories)
    hsp: 612,
    temp: 574,  // Corrected: TEMP (457) + NBE (7) + PRN (110) = 574
    jesuits: 17,
    other: 0,  // NBE and PRN moved to temp
    locations: {
      "Omaha Campus": 4287,  // Correct total including all components
      "Phoenix Campus": 750   // Sum of all Phoenix components
    },
    locationDetails: {
      omaha: {
        faculty: 650,
        staff: 1245,
        hsp: 248,
        students: 1612,
        tempFac: 192,
        tempStaff: 198,
        temp: 390  // tempFac + tempStaff
      },
      phoenix: {
        faculty: 138,
        staff: 104,
        hsp: 364,
        students: 102,
        tempFac: 20,
        tempStaff: 22,
        temp: 42  // tempFac + tempStaff
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
                "name": "VPSL",
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
                "name": "VPEM",
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
                "name": "SueSucs",
                "faculty": 0,
                "staff": 132,
                "hsp": 0,
                "total": 132
          },
          {
                "name": "VPUR",
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
                "name": "VPIT",
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
  // Q1 FY25 - July-September 2024 (Survey program starting)
  "2024-09-30": {
    reportingDate: "9/30/24",
    quarter: "Q1 FY25",
    responseRate: 31.6, // 25 of 79 exits
    totalResponses: 25,
    totalExits: 79,
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
    responseRate: 34.2, // 26 of 76 exits
    totalResponses: 26,
    totalExits: 76,
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
    totalExits: 52,
    totalResponses: 20,
    responseRate: 38.5,
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
  "2025-06-30": {
    reportingDate: "6/30/25",
    quarter: "Q4 FY25",
    responseRate: 35.3, // 18 of 51 exits (corrected from turnover data)
    totalResponses: 18,
    totalExits: 51,
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
  }
};

// Available reporting dates - All FY25 quarters
export const AVAILABLE_DATES = [
  { value: "2024-09-30", label: "9/30/24 (Q1 FY25)", status: "complete" },
  { value: "2024-12-31", label: "12/31/24 (Q2 FY25)", status: "complete" },
  { value: "2025-03-31", label: "3/31/25 (Q3 FY25)", status: "complete" },
  { value: "2025-06-30", label: "6/30/25 (Q4 FY25)", status: "complete" }
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