#!/usr/bin/env node

/**
 * Generate Recruiting Metrics Excel Template
 *
 * Creates Recruiting_Metrics_Master.xlsx with 12 sheets pre-populated
 * with Q1 FY26 data from the RecruitingQ1FY26Dashboard.
 *
 * Usage:
 *   node scripts/generate-recruiting-excel-template.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'source-metrics', 'recruiting');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'Recruiting_Metrics_Master.xlsx');

// Q1 FY26 Data from RecruitingQ1FY26Dashboard
const Q1_FY26_DATA = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  fiscalPeriod: "July 2025 - September 2025",
  dataAsOf: "2025-08-31",
  summary: {
    total: { count: 69, oma: 68, phx: 1 },
    faculty: { count: 31, oma: 31, phx: 0 },
    staff: { count: 38, oma: 37, phx: 1 }
  },
  bySchool: [
    { school: "Arts & Sciences", faculty: 17, staff: 0, total: 17 },
    { school: "Medicine", faculty: 2, staff: 6, total: 8 },
    { school: "Facilities", faculty: 0, staff: 8, total: 8 },
    { school: "Dentistry", faculty: 4, staff: 3, total: 7 },
    { school: "Heider College of Business", faculty: 3, staff: 2, total: 5 },
    { school: "Nursing", faculty: 3, staff: 1, total: 4 },
    { school: "Athletics", faculty: 0, staff: 3, total: 3 },
    { school: "Law School", faculty: 1, staff: 2, total: 3 },
    { school: "Other", faculty: 1, staff: 13, total: 14 }
  ],
  demographics: {
    gender: {
      female: 34,
      male: 35,
      femalePercentage: 49.3,
      malePercentage: 50.7
    },
    ethnicity: [
      { category: "White", count: 34, percentage: 49.3 },
      { category: "Not Disclosed", count: 14, percentage: 20.3 },
      { category: "Asian", count: 10, percentage: 14.5 },
      { category: "More than one Ethnicity", count: 6, percentage: 8.7 },
      { category: "Hispanic or Latino", count: 3, percentage: 4.3 },
      { category: "Black or African American", count: 2, percentage: 2.9 }
    ],
    ageDistribution: [
      { band: "21-30", count: 21, percentage: 30.4 },
      { band: "31-40", count: 28, percentage: 40.6 },
      { band: "41-50", count: 11, percentage: 15.9 },
      { band: "51-60", count: 6, percentage: 8.7 },
      { band: "61+", count: 3, percentage: 4.3 }
    ]
  }
};

const MYJOBS_DATA = {
  source: "Oracle Recruiting Cloud (myJobs)",
  asOf: "Q1 FY26",
  requisitions: {
    open: 143,
    perRecruiter: 28.6,
    avgDaysOpen: 71,
    avgTimeToFill: 35.5,
    jobPostings: 0
  },
  applications: {
    active: 767,
    new: 2000,
    perRequisition: 11.1,
    internalPercentage: 3.0,
    referrals: 7
  },
  hires: {
    total: 40,
    internal: 13,
    internalRate: 32.5,
    avgDaysToHire: 15.5,
    hrProcessing: 35
  },
  offerAcceptance: 97.7,
  topJobFamilies: [
    { name: "Academic & Student Affairs", openings: 45 },
    { name: "Administration", openings: 32 },
    { name: "Health Services", openings: 12 },
    { name: "Information Technology", openings: 10 },
    { name: "Research", openings: 9 },
    { name: "Facilities", openings: 8 },
    { name: "Mission and Ministry", openings: 5 },
    { name: "Public Safety & Transport", openings: 4 },
    { name: "Communications & Marketing", openings: 3 },
    { name: "Athletics & Recreation", openings: 2 }
  ],
  applicationSources: [
    { source: "LinkedIn", applications: 800, percentage: 40 },
    { source: "Creighton Careers", applications: 400, percentage: 20 },
    { source: "External Career Site", applications: 380, percentage: 19 },
    { source: "jobright", applications: 120, percentage: 6 },
    { source: "Internal Career Site", applications: 100, percentage: 5 },
    { source: "Other", applications: 200, percentage: 10 }
  ],
  topJobs: [
    { title: "Senior Software Developer", applications: 165 },
    { title: "Senior Data Engineer", applications: 140 },
    { title: "Senior Human Resource Gen...", applications: 95 },
    { title: "Assistant Director for Leader...", applications: 85 },
    { title: "Data Manager/IT and Commu...", applications: 72 },
    { title: "Program Planner CPCE", applications: 65 },
    { title: "Director of Corporate Partner...", applications: 58 },
    { title: "Events Management Specialist", applications: 52 },
    { title: "Administrative Assistant II", applications: 48 },
    { title: "Research Laboratory Technic...", applications: 42 }
  ],
  requisitionAging: [
    { range: "0-30 Days", count: 45, percentage: 31.5 },
    { range: "31-60 Days", count: 38, percentage: 26.6 },
    { range: "61-90 Days", count: 28, percentage: 19.6 },
    { range: "91-120 Days", count: 18, percentage: 12.6 },
    { range: ">120 Days", count: 14, percentage: 9.8 }
  ]
};

const INTERFOLIO_DATA = {
  source: "Interfolio",
  asOf: "Q1 FY26",
  summary: {
    total: 6,
    tenureTrack: 3,
    nonTenure: 1,
    instructor: 1,
    specialFaculty: 1
  }
};

const QUARTERLY_HIRING_TRENDS = [
  { quarter: "Q1 FY24", faculty: 33, staff: 77, total: 110 },
  { quarter: "Q2 FY24", faculty: 5, staff: 56, total: 61 },
  { quarter: "Q3 FY24", faculty: 11, staff: 60, total: 71 },
  { quarter: "Q4 FY24", faculty: 4, staff: 66, total: 70 },
  { quarter: "Q1 FY25", faculty: 31, staff: 62, total: 93 },
  { quarter: "Q2 FY25", faculty: 8, staff: 44, total: 52 },
  { quarter: "Q3 FY25", faculty: 3, staff: 44, total: 47 },
  { quarter: "Q4 FY25", faculty: 3, staff: 47, total: 50 },
  { quarter: "Q1 FY26", faculty: 31, staff: 38, total: 69 }
];

// Oracle HCM Hire Data (69 benefit-eligible hires)
const ORACLE_HIRES = [
  { name: "Emma Irwin-Herzog", position: "Assistant Professor", department: "Philosophy Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Adam Garzoli", position: "Assistant Professor", department: "Law School Instruction", school: "Law School", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Kwanghyun Kim", position: "Assistant Professor", department: "Masters in Public Health", school: "Medicine", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Kristina Medero", position: "Assistant Professor", department: "Communication Studies Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Ann Aindow", position: "Assistant Professor", department: "Biology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Patrick Kelly", position: "Professor", department: "Theology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Cameron Flynn", position: "Assistant Professor", department: "Modern Languages and Literatures", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Nicole Buczkowski", position: "Assistant Professor", department: "Mathematics Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Caleb Krieger", position: "Assistant Professor", department: "Business Intelligence and Analytics", school: "Heider College of Business", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Benedict Shoup", position: "Assistant Professor", department: "Theology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Cole Bruening", position: "Resident Assistant Professor", department: "Philosophy Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Ivan Andreu Rascon", position: "Assistant Professor", department: "Modern Languages and Literatures", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Jedediah Pida-Reese", position: "Resident Assistant Professor", department: "Economics & Finance Dept", school: "Heider College of Business", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Sara Hanson", position: "Adjunct Instructor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "PT10", inInterfolio: false, inORC: false },
  { name: "Jessica Farrell", position: "Resident Assistant Professor", department: "History Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "David Paternostro", position: "Assistant Professor", department: "Philosophy Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Mehdi Maleki Sanukesh", position: "Resident Assistant Professor", department: "Physics Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Altangerel Tsogtsaikhan", position: "Resident Assistant Professor", department: "Biology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Jill Hibbard", position: "Adjunct Assistant Professor", department: "Fine and Performing Arts", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "PT9", inInterfolio: false, inORC: false },
  { name: "Kathryn Hecht-Weber", position: "Assistant Professor", department: "Education Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Lauren Loyd", position: "Instructor", department: "Nursing - Undergrad Faculty", school: "Nursing", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "David Cooke", position: "Professor", department: "Mathematics Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Derrick Ganye", position: "Assistant Professor", department: "Business Intelligence and Analytics", school: "Heider College of Business", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Schuyler Chambers", position: "Assistant Professor", department: "Chemistry Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", inInterfolio: false, inORC: false },
  { name: "Poe Meh", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "07/07/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Ronette Bruner", position: "Director of Assessment", department: "CFE Administrative", school: "CFE", type: "STAFF", hireDate: "07/07/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Angela Goltl", position: "Dental Assistant II", department: "Dental Dean Administration", school: "Dentistry", type: "STAFF", hireDate: "07/07/2025", assignmentCode: "F11", inInterfolio: false, inORC: true },
  { name: "Kristen Nichols", position: "Assistant Professor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "07/14/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Zachariah Barrientos", position: "Client Engagement Specialist", department: "Interdisciplinary Studies", school: "CollProCE", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Teresa Gibbons", position: "Research Laboratory Technician II", department: "Bio-Medical Sciences", school: "Medicine", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Parisa Rafiei", position: "Research Laboratory Technician II", department: "Pharmacology & Neuro Ops", school: "Medicine", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Hayden Newburn", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Mohammad Alharakeh", position: "Postdoctoral Research Fellow", department: "Bio-Medical Sciences", school: "Medicine", type: "STAFF", hireDate: "07/16/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Dominic Boand", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Erfei Zhou", position: "Research Laboratory Technician I", department: "Pharmacology & Neurosciences", school: "Medicine", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Zhanna Griffin-Bell", position: "Sr Academic Info Resource Specialist", department: "Reinert Alumni Library", school: "VPLS", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Jeffrey Sapakoff", position: "Athletic Intern", department: "Athletic Department - Weight Room", school: "Athletics", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "James Stannard", position: "Assoc Dir Marketing and Sales Athletics", department: "Athletic Department - Marketing", school: "Athletics", type: "STAFF", hireDate: "07/22/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Paige Baker", position: "Painter II", department: "Facilities Management - Paint Shop", school: "Facilities", type: "STAFF", hireDate: "07/22/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Clarissa Thiriot", position: "Instructional Designer II", department: "CFE Administrative", school: "CFE", type: "STAFF", hireDate: "07/23/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Audrey Meyersieck", position: "Pre-Professional Advisor", department: "Center for Advising Resources", school: "SueSucs", type: "STAFF", hireDate: "07/28/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Amy Peterson", position: "Administrative Assistant III", department: "Heider College of Business", school: "Heider College of Business", type: "STAFF", hireDate: "07/30/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Amritpal Singh", position: "Premier Club Coach", department: "Enrollment Management", school: "VPEM", type: "STAFF", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Joshua Kochanowsky", position: "Assistant Professor", department: "Microbiology Department", school: "Medicine", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Adam Goodrick", position: "Assistant Professor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Dawn Fichter", position: "Assistant Professor", department: "Nursing - Undergrad Faculty", school: "Nursing", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Joseph Tariman", position: "Associate Dean", department: "Nursing - Undergrad Faculty", school: "Nursing", type: "STAFF", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Bryan Harmer", position: "Assistant Professor", department: "EMS (Paramedicine)", school: "Nursing", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: true, inORC: false },
  { name: "Vincent Strand", position: "Endowed Chair", department: "Waite Chair", school: "PRES", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Kyuchul Oh", position: "Assistant Professor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", inInterfolio: false, inORC: false },
  { name: "Amy Riessland", position: "Mental Health Practitioner", department: "Counseling Center", school: "VPSL", type: "STAFF", hireDate: "08/04/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Nicholas Wells", position: "Postdoctoral Research Fellow", department: "Bio-Medical Sciences", school: "Medicine", type: "STAFF", hireDate: "08/11/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Pray Meh", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/11/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Alexis Robinson-Dailey", position: "Program Coordinator", department: "Multicultural & Community Affairs", school: "Medicine", type: "STAFF", hireDate: "08/13/2025", assignmentCode: "PT12", inInterfolio: false, inORC: true },
  { name: "Alexis Hartley", position: "Asst Director of Student Affairs", department: "Law School - Dean's Office", school: "Law School", type: "STAFF", hireDate: "08/13/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Andrew Kollath", position: "Senior Web Strategist", department: "Web Strategy", school: "UCOM", type: "STAFF", hireDate: "08/13/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Ulysses Johnson", position: "Admin Assistant II - Student Groups", department: "VP's Office - Student Life", school: "VPSL", type: "STAFF", hireDate: "08/14/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Dee Paw", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Hannah Haack", position: "Global Program Advisor", department: "Global Engagement Office", school: "VPGE", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Emery Laine", position: "Metadata and Digital Initiatives Spec", department: "Law Library", school: "Law School", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Poh Naw", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Kimberly Duckworth", position: "Team Lead iJay Store", department: "iJay Apple Store", school: "Heider College of Business", type: "STAFF", hireDate: "08/19/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Lyman Jacoba", position: "Driver", department: "Shuttle Bus Department", school: "Public Safety", type: "STAFF", hireDate: "08/19/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Cody Willoughby", position: "Athletic Equipment Manager", department: "Athletic Department", school: "Athletics", type: "STAFF", hireDate: "08/23/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Naw Gay", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Allison Krotter", position: "Speech Pathologist", department: "Creighton Pediatric Therapy", school: "Pharmacy & Health Professions", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Guadalupe Perez-Aguilar", position: "Administrative Assistant III", department: "Dental Dean Administration", school: "Dentistry", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Jacqueline Fuentes", position: "Contracts Coordinator", department: "Admin. Office - Provost", school: "Provost", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", inInterfolio: false, inORC: true },
  { name: "Christopher Vavra", position: "Administrative Assistant III", department: "Dental Dean Administration", school: "Dentistry", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", inInterfolio: false, inORC: true }
];

/**
 * Create all sheets for the Excel workbook
 */
function createSheets() {
  const sheets = {};

  // 1. Metadata Sheet
  sheets['Metadata'] = [
    { field: 'fiscal_year', value: 'FY2026' },
    { field: 'fiscal_quarter', value: '1' },
    { field: 'fiscal_period', value: 'Q1 FY26' },
    { field: 'reporting_start_date', value: '2025-07-01' },
    { field: 'reporting_end_date', value: '2025-09-30' },
    { field: 'data_as_of', value: '2025-08-31' },
    { field: 'preparer', value: 'HR Analytics' },
    { field: 'generated_at', value: new Date().toISOString() },
    { field: 'oracle_hcm_source', value: 'Oracle HCM (Benefit-Eligible New Hires)' },
    { field: 'taleo_source', value: 'Oracle Recruiting Cloud (myJobs)' },
    { field: 'interfolio_source', value: 'Interfolio (Faculty Pipeline)' }
  ];

  // 2. Summary Metrics Sheet
  sheets['Summary_Metrics'] = [
    {
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      total_hires: Q1_FY26_DATA.summary.total.count,
      faculty_hires: Q1_FY26_DATA.summary.faculty.count,
      staff_hires: Q1_FY26_DATA.summary.staff.count,
      omaha_hires: Q1_FY26_DATA.summary.total.oma,
      phoenix_hires: Q1_FY26_DATA.summary.total.phx,
      open_requisitions: MYJOBS_DATA.requisitions.open,
      active_applications: MYJOBS_DATA.applications.active,
      new_applications: MYJOBS_DATA.applications.new
    }
  ];

  // 3. Hire Rates Sheet
  sheets['Hire_Rates'] = [
    {
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      source_system: 'Taleo',
      channel: 'External',
      applications: 2000,
      hires: 40,
      hire_rate: 2.0
    },
    {
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      source_system: 'Taleo',
      channel: 'Internal',
      applications: 60,
      hires: 13,
      hire_rate: 21.7
    },
    {
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      source_system: 'Interfolio',
      channel: 'Faculty',
      applications: 140,
      hires: 6,
      hire_rate: 4.3
    }
  ];

  // 4. Pipeline Staff Sheet (myJobs)
  sheets['Pipeline_Staff'] = [
    {
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      open_requisitions: MYJOBS_DATA.requisitions.open,
      reqs_per_recruiter: MYJOBS_DATA.requisitions.perRecruiter,
      avg_days_open: MYJOBS_DATA.requisitions.avgDaysOpen,
      avg_time_to_fill: MYJOBS_DATA.requisitions.avgTimeToFill,
      active_applications: MYJOBS_DATA.applications.active,
      new_applications: MYJOBS_DATA.applications.new,
      apps_per_req: MYJOBS_DATA.applications.perRequisition,
      internal_app_percentage: MYJOBS_DATA.applications.internalPercentage,
      referrals: MYJOBS_DATA.applications.referrals,
      total_hires: MYJOBS_DATA.hires.total,
      internal_hires: MYJOBS_DATA.hires.internal,
      internal_hire_rate: MYJOBS_DATA.hires.internalRate,
      avg_days_to_hire: MYJOBS_DATA.hires.avgDaysToHire,
      hr_processing_time: MYJOBS_DATA.hires.hrProcessing,
      offer_acceptance_rate: MYJOBS_DATA.offerAcceptance
    }
  ];

  // 5. Pipeline Faculty Sheet (Interfolio)
  sheets['Pipeline_Faculty'] = [
    {
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      active_searches: 15,
      completed_searches: 6,
      total_hires: INTERFOLIO_DATA.summary.total,
      tenure_track_hires: INTERFOLIO_DATA.summary.tenureTrack,
      non_tenure_hires: INTERFOLIO_DATA.summary.nonTenure,
      instructor_hires: INTERFOLIO_DATA.summary.instructor,
      special_faculty_hires: INTERFOLIO_DATA.summary.specialFaculty
    }
  ];

  // 6. New Hires Detail Sheet (69 rows - hashed for PII)
  sheets['New_Hires_Detail'] = ORACLE_HIRES.map((hire, index) => ({
    row_id: index + 1,
    employee_hash: `EMP_${String(index + 1).padStart(4, '0')}`,
    hire_date: hire.hireDate,
    position_title: hire.position,
    department: hire.department,
    school: hire.school,
    employee_type: hire.type,
    assignment_code: hire.assignmentCode,
    location: 'OMA',
    gender: '', // Would come from Oracle HCM
    ethnicity: '', // Would come from Oracle HCM
    age_band: '', // Would come from Oracle HCM
    in_interfolio: hire.inInterfolio,
    in_orc_ats: hire.inORC
  }));

  // 7. Hires By School Sheet
  sheets['Hires_By_School'] = Q1_FY26_DATA.bySchool.map(school => ({
    fiscal_year: 'FY2026',
    fiscal_quarter: 1,
    school_name: school.school,
    faculty_hires: school.faculty,
    staff_hires: school.staff,
    total_hires: school.total
  }));

  // 8. Application Sources Sheet
  sheets['Application_Sources'] = MYJOBS_DATA.applicationSources.map(source => ({
    fiscal_year: 'FY2026',
    fiscal_quarter: 1,
    source_name: source.source,
    applications: source.applications,
    percentage: source.percentage
  }));

  // 9. Top Jobs Sheet
  sheets['Top_Jobs'] = MYJOBS_DATA.topJobs.map((job, index) => ({
    fiscal_year: 'FY2026',
    fiscal_quarter: 1,
    rank: index + 1,
    job_title: job.title,
    application_count: job.applications
  }));

  // 10. Requisition Aging Sheet
  sheets['Requisition_Aging'] = MYJOBS_DATA.requisitionAging.map(age => ({
    fiscal_year: 'FY2026',
    fiscal_quarter: 1,
    age_range: age.range,
    requisition_count: age.count,
    percentage: age.percentage
  }));

  // 11. New Hire Demographics Sheet
  const demographicsRows = [];

  // Gender
  demographicsRows.push({
    fiscal_year: 'FY2026',
    fiscal_quarter: 1,
    demo_type: 'Gender',
    demo_value: 'Female',
    count: Q1_FY26_DATA.demographics.gender.female,
    percentage: Q1_FY26_DATA.demographics.gender.femalePercentage
  });
  demographicsRows.push({
    fiscal_year: 'FY2026',
    fiscal_quarter: 1,
    demo_type: 'Gender',
    demo_value: 'Male',
    count: Q1_FY26_DATA.demographics.gender.male,
    percentage: Q1_FY26_DATA.demographics.gender.malePercentage
  });

  // Ethnicity
  Q1_FY26_DATA.demographics.ethnicity.forEach(eth => {
    demographicsRows.push({
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      demo_type: 'Ethnicity',
      demo_value: eth.category,
      count: eth.count,
      percentage: eth.percentage
    });
  });

  // Age Band
  Q1_FY26_DATA.demographics.ageDistribution.forEach(age => {
    demographicsRows.push({
      fiscal_year: 'FY2026',
      fiscal_quarter: 1,
      demo_type: 'Age Band',
      demo_value: age.band,
      count: age.count,
      percentage: age.percentage
    });
  });

  sheets['New_Hire_Demographics'] = demographicsRows;

  // 12. Hiring Trends Sheet
  sheets['Hiring_Trends'] = QUARTERLY_HIRING_TRENDS.map(trend => ({
    quarter: trend.quarter,
    faculty_hires: trend.faculty,
    staff_hires: trend.staff,
    total_hires: trend.total
  }));

  return sheets;
}

/**
 * Main execution
 */
function main() {
  console.log('\n========================================');
  console.log('  Generate Recruiting Excel Template');
  console.log('========================================\n');

  // Ensure directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  const sheets = createSheets();

  // Add sheets to workbook
  Object.entries(sheets).forEach(([name, data]) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
    console.log(`  Created sheet: ${name} (${data.length} rows)`);
  });

  // Write workbook
  XLSX.writeFile(workbook, OUTPUT_FILE);

  console.log(`\n\u2713 Created: ${OUTPUT_FILE}`);
  console.log('\nSheet Summary:');
  console.log('  - Metadata: Configuration and data sources');
  console.log('  - Summary_Metrics: High-level hire counts');
  console.log('  - Hire_Rates: Hire rates by source/channel');
  console.log('  - Pipeline_Staff: myJobs pipeline metrics');
  console.log('  - Pipeline_Faculty: Interfolio pipeline metrics');
  console.log('  - New_Hires_Detail: 69 individual hire records');
  console.log('  - Hires_By_School: Aggregated by school');
  console.log('  - Application_Sources: LinkedIn, Indeed, etc.');
  console.log('  - Top_Jobs: Top 10 jobs by application count');
  console.log('  - Requisition_Aging: Aging distribution');
  console.log('  - New_Hire_Demographics: Gender, ethnicity, age');
  console.log('  - Hiring_Trends: Historical quarterly trends');
  console.log('\n========================================\n');
}

main();
