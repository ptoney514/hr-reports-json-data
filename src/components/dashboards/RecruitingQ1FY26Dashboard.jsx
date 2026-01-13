import React, { useState, useMemo } from 'react';
import { UserPlus, Users, UserCheck, Briefcase, Building2, TrendingUp, FileText, CheckCircle, AlertCircle, Info, Clock, Target, Filter, Award, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

/**
 * Q1 FY26 Recruiting Dashboard
 * Displays quarterly new hire data for benefit-eligible Faculty and Staff
 * Plus recruitment pipeline metrics from Oracle Recruiting Cloud (myJobs) and Interfolio
 *
 * Data Sources:
 * - Oracle HCM: Validated new hire counts
 * - Oracle Recruiting Cloud (myJobs): Staff recruitment pipeline
 * - Interfolio: Faculty recruitment pipeline
 *
 * Methodology: NEW_HIRES_METHODOLOGY.md
 * Design System Reference: docs/QUARTERLY_REPORTS_DESIGN_SYSTEM.md
 */

// Q1 FY26 New Hire Data - extracted from Oracle HCM (Source of Truth)
const Q1_FY26_DATA = {
  reportingDate: "9/30/25",
  quarter: "Q1 FY26",
  fiscalPeriod: "July 2025 - September 2025",
  dataAsOf: "2025-08-31",
  note: "Data available through August 2025. September hires pending next data refresh.",
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
  byMonth: [
    { month: "July 2025", faculty: 25, staff: 17, total: 42 },
    { month: "August 2025", faculty: 6, staff: 21, total: 27 },
    { month: "September 2025", faculty: 0, staff: 0, total: 0 }
  ],
  demographics: {
    gender: {
      female: 34,
      male: 35,
      femalePercentage: 49.3,
      malePercentage: 50.7
    },
    ethnicity: [
      { category: "White", count: 34, percentage: 49.3, color: "#3B82F6" },
      { category: "Not Disclosed", count: 14, percentage: 20.3, color: "#9CA3AF" },
      { category: "Asian", count: 10, percentage: 14.5, color: "#10B981" },
      { category: "More than one Ethnicity", count: 6, percentage: 8.7, color: "#8B5CF6" },
      { category: "Hispanic or Latino", count: 3, percentage: 4.3, color: "#F59E0B" },
      { category: "Black or African American", count: 2, percentage: 2.9, color: "#EF4444" }
    ],
    ageDistribution: [
      { band: "21-30", count: 21, percentage: 30.4, color: "#3B82F6" },
      { band: "31-40", count: 28, percentage: 40.6, color: "#10B981" },
      { band: "41-50", count: 11, percentage: 15.9, color: "#F59E0B" },
      { band: "51-60", count: 6, percentage: 8.7, color: "#8B5CF6" },
      { band: "61+", count: 3, percentage: 4.3, color: "#EF4444" }
    ]
  }
};

// Oracle Recruiting Cloud (myJobs) - Staff Pipeline Data
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
    { source: "LinkedIn", applications: 800, percentage: 40, color: "#0A66C2" },
    { source: "Creighton Careers", applications: 400, percentage: 20, color: "#0054A6" },
    { source: "External Career Site", applications: 380, percentage: 19, color: "#10B981" },
    { source: "jobright", applications: 120, percentage: 6, color: "#F59E0B" },
    { source: "Internal Career Site", applications: 100, percentage: 5, color: "#8B5CF6" },
    { source: "Other", applications: 200, percentage: 10, color: "#9CA3AF" }
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
    { range: "0-30 Days", count: 45, percentage: 31.5, color: "#10B981" },
    { range: "31-60 Days", count: 38, percentage: 26.6, color: "#3B82F6" },
    { range: "61-90 Days", count: 28, percentage: 19.6, color: "#F59E0B" },
    { range: "91-120 Days", count: 18, percentage: 12.6, color: "#EF4444" },
    { range: ">120 Days", count: 14, percentage: 9.8, color: "#7F1D1D" }
  ]
};

// Interfolio - Faculty Pipeline Data
const INTERFOLIO_DATA = {
  source: "Interfolio",
  asOf: "Q1 FY26",
  hires: [
    { name: "Matthew Cheung", degree: "Pharm.D.", position: "Asst/Assoc Professor of Pharmacy Practice", department: "Pharmacy Practice", hireDate: "8/11/2025", type: "Tenure Track" },
    { name: "Hannah Clark", degree: "M.F.A.", position: "Non-Tenure Track Asst Professor", department: "Fine & Performing Arts", hireDate: "8/17/2025", type: "Non-Tenure" },
    { name: "Bryan Harmer", degree: "Ph.D.", position: "Assistant Professor", department: "Paramedicine (Nursing)", hireDate: "7/10/2025", type: "Tenure Track" },
    { name: "Jessie Kernagis", degree: "M.H.A.", position: "AHA Instructor", department: "Phoenix Campus", hireDate: "7/22/2025", type: "Instructor" },
    { name: "McKenzie Lehman", degree: "Ph.D.", position: "Asst/Assoc Professor (tenure track)", department: "Medical Microbiology", hireDate: "8/23/2025", type: "Tenure Track" },
    { name: "Casey Marriott", degree: "B.Sc.", position: "Special Faculty", department: "Nursing - Omaha", hireDate: "9/29/2025", type: "Special Faculty" }
  ],
  summary: {
    total: 6,
    tenureTrack: 3,
    nonTenure: 1,
    instructor: 1,
    specialFaculty: 1
  }
};

// Oracle HCM - All 69 Benefit-Eligible New Hires (Source of Truth)
// Cross-referenced with Interfolio (Faculty) and ORC ATS/myJobs (Staff)
// Includes Assignment Category (Benefit Eligibility) codes
const ORACLE_HIRES_DATA = {
  source: "Oracle HCM",
  asOf: "Q1 FY26",
  hires: [
    { name: "Emma Irwin-Herzog", position: "Assistant Professor", department: "Philosophy Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Adam Garzoli", position: "Assistant Professor", department: "Law School Instruction", school: "Law School", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Kwanghyun Kim", position: "Assistant Professor", department: "Masters in Public Health", school: "Medicine", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Kristina Medero", position: "Assistant Professor", department: "Communication Studies Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Ann Aindow", position: "Assistant Professor", department: "Biology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Patrick Kelly", position: "Professor", department: "Theology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Cameron Flynn", position: "Assistant Professor", department: "Modern Languages and Literatures", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Nicole Buczkowski", position: "Assistant Professor", department: "Mathematics Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Caleb Krieger", position: "Assistant Professor", department: "Business Intelligence and Analytics", school: "Heider College of Business", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Benedict Shoup", position: "Assistant Professor", department: "Theology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Cole Bruening", position: "Resident Assistant Professor", department: "Philosophy Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Ivan Andreu Rascon", position: "Assistant Professor", department: "Modern Languages and Literatures", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Jedediah Pida-Reese", position: "Resident Assistant Professor", department: "Economics & Finance Dept", school: "Heider College of Business", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Sara Hanson", position: "Adjunct Instructor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "PT10", assignmentType: "PT 10-Mo", inInterfolio: false, inORC: false },
    { name: "Jessica Farrell", position: "Resident Assistant Professor", department: "History Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "David Paternostro", position: "Assistant Professor", department: "Philosophy Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Mehdi Maleki Sanukesh", position: "Resident Assistant Professor", department: "Physics Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Altangerel Tsogtsaikhan", position: "Resident Assistant Professor", department: "Biology Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Jill Hibbard", position: "Adjunct Assistant Professor", department: "Fine and Performing Arts", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "PT9", assignmentType: "PT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Kathryn Hecht-Weber", position: "Assistant Professor", department: "Education Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Lauren Loyd", position: "Instructor", department: "Nursing - Undergrad Faculty", school: "Nursing", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "David Cooke", position: "Professor", department: "Mathematics Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Derrick Ganye", position: "Assistant Professor", department: "Business Intelligence and Analytics", school: "Heider College of Business", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Schuyler Chambers", position: "Assistant Professor", department: "Chemistry Department", school: "Arts & Sciences", type: "FACULTY", hireDate: "07/01/2025", assignmentCode: "F09", assignmentType: "FT 9-Mo", inInterfolio: false, inORC: false },
    { name: "Poe Meh", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "07/07/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Ronette Bruner", position: "Director of Assessment", department: "CFE Administrative", school: "CFE", type: "STAFF", hireDate: "07/07/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Angela Goltl", position: "Dental Assistant II", department: "Dental Dean Administration", school: "Dentistry", type: "STAFF", hireDate: "07/07/2025", assignmentCode: "F11", assignmentType: "FT 11-Mo", inInterfolio: false, inORC: true },
    { name: "Kristen Nichols", position: "Assistant Professor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "07/14/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Zachariah Barrientos", position: "Client Engagement Specialist", department: "Interdisciplinary Studies", school: "CollProCE", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Teresa Gibbons", position: "Research Laboratory Technician II", department: "Bio-Medical Sciences", school: "Medicine", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Parisa Rafiei", position: "Research Laboratory Technician II", department: "Pharmacology & Neuro Ops", school: "Medicine", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Hayden Newburn", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "07/14/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Mohammad Alharakeh", position: "Postdoctoral Research Fellow", department: "Bio-Medical Sciences", school: "Medicine", type: "STAFF", hireDate: "07/16/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Dominic Boand", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Erfei Zhou", position: "Research Laboratory Technician I", department: "Pharmacology & Neurosciences", school: "Medicine", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Zhanna Griffin-Bell", position: "Sr Academic Info Resource Specialist", department: "Reinert Alumni Library", school: "VPLS", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Jeffrey Sapakoff", position: "Athletic Intern", department: "Athletic Department - Weight Room", school: "Athletics", type: "STAFF", hireDate: "07/21/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "James Stannard", position: "Assoc Dir Marketing and Sales Athletics", department: "Athletic Department - Marketing", school: "Athletics", type: "STAFF", hireDate: "07/22/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Paige Baker", position: "Painter II", department: "Facilities Management - Paint Shop", school: "Facilities", type: "STAFF", hireDate: "07/22/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Clarissa Thiriot", position: "Instructional Designer II", department: "CFE Administrative", school: "CFE", type: "STAFF", hireDate: "07/23/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Audrey Meyersieck", position: "Pre-Professional Advisor", department: "Center for Advising Resources", school: "SueSucs", type: "STAFF", hireDate: "07/28/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Amy Peterson", position: "Administrative Assistant III", department: "Heider College of Business", school: "Heider College of Business", type: "STAFF", hireDate: "07/30/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Amritpal Singh", position: "Premier Club Coach", department: "Enrollment Management", school: "VPEM", type: "STAFF", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Joshua Kochanowsky", position: "Assistant Professor", department: "Microbiology Department", school: "Medicine", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Adam Goodrick", position: "Assistant Professor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Dawn Fichter", position: "Assistant Professor", department: "Nursing - Undergrad Faculty", school: "Nursing", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Joseph Tariman", position: "Associate Dean", department: "Nursing - Undergrad Faculty", school: "Nursing", type: "STAFF", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Bryan Harmer", position: "Assistant Professor", department: "EMS (Paramedicine)", school: "Nursing", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: true, inORC: false },
    { name: "Vincent Strand", position: "Endowed Chair", department: "Waite Chair", school: "PRES", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Kyuchul Oh", position: "Assistant Professor", department: "Dental Dean Administration", school: "Dentistry", type: "FACULTY", hireDate: "08/01/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: false },
    { name: "Amy Riessland", position: "Mental Health Practitioner", department: "Counseling Center", school: "VPSL", type: "STAFF", hireDate: "08/04/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Nicholas Wells", position: "Postdoctoral Research Fellow", department: "Bio-Medical Sciences", school: "Medicine", type: "STAFF", hireDate: "08/11/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Pray Meh", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/11/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Alexis Robinson-Dailey", position: "Program Coordinator", department: "Multicultural & Community Affairs", school: "Medicine", type: "STAFF", hireDate: "08/13/2025", assignmentCode: "PT12", assignmentType: "PT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Alexis Hartley", position: "Asst Director of Student Affairs", department: "Law School - Dean's Office", school: "Law School", type: "STAFF", hireDate: "08/13/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Andrew Kollath", position: "Senior Web Strategist", department: "Web Strategy", school: "UCOM", type: "STAFF", hireDate: "08/13/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Ulysses Johnson", position: "Admin Assistant II - Student Groups", department: "VP's Office - Student Life", school: "VPSL", type: "STAFF", hireDate: "08/14/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Dee Paw", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Hannah Haack", position: "Global Program Advisor", department: "Global Engagement Office", school: "VPGE", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Emery Laine", position: "Metadata and Digital Initiatives Spec", department: "Law Library", school: "Law School", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Poh Naw", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/18/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Kimberly Duckworth", position: "Team Lead iJay Store", department: "iJay Apple Store", school: "Heider College of Business", type: "STAFF", hireDate: "08/19/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Lyman Jacoba", position: "Driver", department: "Shuttle Bus Department", school: "Public Safety", type: "STAFF", hireDate: "08/19/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Cody Willoughby", position: "Athletic Equipment Manager", department: "Athletic Department", school: "Athletics", type: "STAFF", hireDate: "08/23/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Naw Gay", position: "Custodian", department: "Facilities Management - Custodial", school: "Facilities", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Allison Krotter", position: "Speech Pathologist", department: "Creighton Pediatric Therapy", school: "Pharmacy & Health Professions", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Guadalupe Perez-Aguilar", position: "Administrative Assistant III", department: "Dental Dean Administration", school: "Dentistry", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Jacqueline Fuentes", position: "Contracts Coordinator", department: "Admin. Office - Provost", school: "Provost", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true },
    { name: "Christopher Vavra", position: "Administrative Assistant III", department: "Dental Dean Administration", school: "Dentistry", type: "STAFF", hireDate: "08/25/2025", assignmentCode: "F12", assignmentType: "FT 12-Mo", inInterfolio: false, inORC: true }
  ],
  summary: {
    total: 69,
    faculty: 31,
    staff: 38,
    inInterfolio: 1,
    inORC: 38,
    notInEitherSystem: 30,
    byAssignment: {
      F12: 44,
      F09: 21,
      F11: 1,
      PT12: 1,
      PT10: 1,
      PT9: 1
    }
  }
};

// Quarterly Hiring Trends - Benefit-Eligible New Hires (FY24-Q1 FY26)
// Source: Oracle HCM new hire data, extracted from workforce headcount Excel
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

const RecruitingQ1FY26Dashboard = () => {
  const data = Q1_FY26_DATA;
  const summary = data.summary;
  const myJobs = MYJOBS_DATA;
  const interfolio = INTERFOLIO_DATA;
  const oracleHires = ORACLE_HIRES_DATA;

  // Sorting state for Oracle Hiring Details table
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sorted hires data
  const sortedHires = useMemo(() => {
    if (!sortConfig.key) return oracleHires.hires;

    return [...oracleHires.hires].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'ats') {
        // Sort by ATS coverage: Interfolio first, then ORC, then neither
        aVal = a.inInterfolio ? 2 : (a.inORC ? 1 : 0);
        bVal = b.inInterfolio ? 2 : (b.inORC ? 1 : 0);
      } else if (sortConfig.key === 'hireDate') {
        // Parse dates for proper sorting
        aVal = new Date(a.hireDate);
        bVal = new Date(b.hireDate);
      } else {
        aVal = a[sortConfig.key]?.toLowerCase?.() || a[sortConfig.key] || '';
        bVal = b[sortConfig.key]?.toLowerCase?.() || b[sortConfig.key] || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [oracleHires.hires, sortConfig]);

  // Sortable header component
  const SortableHeader = ({ label, sortKey, className = '' }) => (
    <th
      className={`py-3 px-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1 justify-center">
        <span>{label}</span>
        <span className="flex flex-col">
          <ChevronUp
            size={10}
            className={sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-300'}
          />
          <ChevronDown
            size={10}
            className={sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-300'}
            style={{ marginTop: '-4px' }}
          />
        </span>
      </div>
    </th>
  );

  // Colors for charts
  const COLORS = {
    faculty: '#10B981',  // Green
    staff: '#3B82F6',    // Blue
    primary: '#0054A6'   // Creighton Blue
  };

  // Prepare bar chart data for schools
  const schoolChartData = data.bySchool.slice(0, 8).map(s => ({
    name: s.school.length > 15 ? s.school.substring(0, 12) + '...' : s.school,
    fullName: s.school,
    Faculty: s.faculty,
    Staff: s.staff,
    total: s.total
  }));

  return (
    <div id="recruiting-q1-fy26-dashboard" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">

        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserPlus style={{color: '#0054A6'}} size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.quarter} Recruiting & New Hires Report
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    Benefit Eligible Employees • {data.fiscalPeriod}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    New hire counts, recruitment pipeline, and hiring analytics
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold" style={{color: '#0054A6'}}>
                  {summary.total.count}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total {data.quarter} New Hires</div>
                <div className="text-xs text-gray-500 mt-1">
                  Benefit Eligible - Faculty: {summary.faculty.count} | Staff: {summary.staff.count}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Freshness Note */}
        <div className="text-xs text-amber-700 mb-6 bg-amber-50 p-3 rounded border border-amber-200">
          <span className="font-semibold">Note:</span> {data.note} Data as of {data.dataAsOf}.
        </div>

        {/* Hiring Trends Chart - Matches Workforce Dashboard Style */}
        <div className="bg-white rounded-2xl border p-8 mb-8" style={{ borderColor: '#D7D2CB' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#00245D' }}>
            Quarterly Benefit-Eligible Hiring Trend
          </h2>
          <ResponsiveContainer width="100%" height={385}>
            <LineChart data={QUARTERLY_HIRING_TRENDS} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D7D2CB" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#5F7FC3' }}
                domain={[0, 120]}
                ticks={[0, 20, 40, 60, 80, 100, 120]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '2px solid #4366D0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px -5px rgba(67, 102, 208, 0.25)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />

              {/* Total New Hires Line */}
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0054A6"
                strokeWidth={4}
                dot={{ r: 7, fill: '#0054A6', strokeWidth: 2, stroke: '#ffffff' }}
                name="Total Benefit-Eligible Hires"
                activeDot={{ r: 9, fill: '#0054A6', stroke: '#ffffff', strokeWidth: 3 }}
                label={{
                  position: 'top',
                  offset: 15,
                  style: { fontSize: 14, fontWeight: 'bold', fill: '#0054A6' }
                }}
              />

              {/* Faculty Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="faculty"
                stroke="#10B981"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit-Eligible Faculty"
                activeDot={{ r: 8, fill: '#10B981', stroke: '#ffffff', strokeWidth: 3 }}
              />

              {/* Staff Line (Dashed) */}
              <Line
                type="monotone"
                dataKey="staff"
                stroke="#3B82F6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff' }}
                name="Benefit-Eligible Staff"
                activeDot={{ r: 8, fill: '#3B82F6', stroke: '#ffffff', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Trend Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Q1 shows peak hiring aligned with academic year start. Faculty hiring is concentrated in Q1 (fall semester), while staff hiring is more evenly distributed. Year-over-year Q1 comparison: FY25 (93) vs FY26 (69) reflects 26% decrease.
          </div>
        </div>

        {/* New Hire Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Total New Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Users style={{color: '#0054A6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                Q1
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.total.count}</div>
            <div className="text-sm text-gray-600 font-medium">Total New Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.total.oma} | PHX: {summary.total.phx}
            </div>
          </div>

          {/* Faculty New Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <UserCheck style={{color: '#10B981'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                FACULTY
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.faculty.count}</div>
            <div className="text-sm text-gray-600 font-medium">Benefit Eligible Faculty Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.faculty.oma} | PHX: {summary.faculty.phx}
            </div>
          </div>

          {/* Staff New Hires Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <Briefcase style={{color: '#3B82F6'}} size={24} />
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                STAFF
              </span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">{summary.staff.count}</div>
            <div className="text-sm text-gray-600 font-medium">Benefit Eligible Staff Hires</div>
            <div className="text-xs text-gray-500 mt-2">
              OMA: {summary.staff.oma} | PHX: {summary.staff.phx}
            </div>
          </div>

        </div>

        {/* ============================================== */}
        {/* RECRUITMENT PIPELINE SECTION (from myJobs)    */}
        {/* ============================================== */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Filter style={{color: '#0054A6'}} size={28} />
            Staff Recruitment Pipeline
            <span className="text-sm font-normal text-gray-500 ml-2">(Oracle Recruiting Cloud - myJobs)</span>
          </h2>

          {/* Pipeline Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Open Requisitions</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.requisitions.open}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Applications</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.applications.active}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Apps per Req</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.applications.perRequisition}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Days to Fill</div>
              <div className="text-2xl font-bold text-gray-900">{myJobs.requisitions.avgTimeToFill}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Offer Accept Rate</div>
              <div className="text-2xl font-bold text-green-600">{myJobs.offerAcceptance}%</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Internal Hire Rate</div>
              <div className="text-2xl font-bold text-blue-600">{myJobs.hires.internalRate}%</div>
            </div>

          </div>

          {/* Two Column Layout: Sources + Top Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Application Sources */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe size={18} style={{color: '#0054A6'}} />
                Top Application Sources
              </h3>

              <div className="space-y-3">
                {myJobs.applicationSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-28 text-sm text-gray-700 truncate">{source.source}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                          style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                        >
                          {source.percentage >= 10 && `${source.percentage}%`}
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">{source.applications}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                LinkedIn leads with 40% of applications
              </div>
            </div>

            {/* Top Jobs Attracting Candidates */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target size={18} style={{color: '#0054A6'}} />
                Top 10 Jobs by Applications
              </h3>

              <div className="space-y-2">
                {myJobs.topJobs.map((job, index) => {
                  const maxApps = myJobs.topJobs[0].applications;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-48 text-xs text-gray-700 truncate" title={job.title}>{job.title}</div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-100 rounded overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(job.applications / maxApps) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-10 text-right text-xs font-semibold text-gray-700">{job.applications}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* ============================================== */}
        {/* NEW HIRES BREAKDOWN SECTION                   */}
        {/* ============================================== */}

        {/* New Hires by School/Organization */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 style={{color: '#0054A6'}} size={20} />
            New Hires by School/Organization
          </h2>

          {/* Horizontal Bar Chart */}
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schoolChartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#374151' }}
                  width={110}
                />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="Faculty" stackId="a" fill={COLORS.faculty} />
                <Bar dataKey="Staff" stackId="a" fill={COLORS.staff} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-4 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Arts & Sciences leads with 17 faculty hires (all academic positions). Facilities and Medicine tied for second with 8 hires each, primarily staff positions.
          </div>
        </div>

        {/* Demographics Section - Two Charts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Ethnicity Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              New Hire Ethnicity Distribution
            </h2>

            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.demographics.ethnicity}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={(entry) => entry.percentage >= 5 ? `${entry.count}` : null}
                    labelLine={false}
                  >
                    {data.demographics.ethnicity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.category]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{summary.total.count}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 w-full">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {data.demographics.ethnicity.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.category}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
              New Hire Age Distribution
            </h2>

            <div className="flex flex-col items-center relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.demographics.ageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={(entry) => entry.percentage >= 5 ? `${entry.count}` : null}
                    labelLine={false}
                  >
                    {data.demographics.ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, props.payload.band]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Label */}
              <div className="absolute top-[140px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{summary.total.count}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">TOTAL</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 w-full">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                  {data.demographics.ageDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{backgroundColor: item.color}}></div>
                      <span className="text-gray-700">{item.band}: <strong>{item.count}</strong> ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Gender Distribution Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users style={{color: '#0054A6'}} size={20} />
            New Hire Gender Distribution
          </h2>

          <div className="max-w-2xl mx-auto">
            {/* Horizontal stacked bar */}
            <div className="flex h-12 rounded-lg overflow-hidden">
              <div
                className="bg-pink-500 flex items-center justify-center text-white font-semibold"
                style={{ width: `${data.demographics.gender.femalePercentage}%` }}
              >
                {data.demographics.gender.female} Female ({data.demographics.gender.femalePercentage}%)
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-white font-semibold"
                style={{ width: `${data.demographics.gender.malePercentage}%` }}
              >
                {data.demographics.gender.male} Male ({data.demographics.gender.malePercentage}%)
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-pink-500"></div>
                <span className="text-gray-700">Female: {data.demographics.gender.female} ({data.demographics.gender.femalePercentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-gray-700">Male: {data.demographics.gender.male} ({data.demographics.gender.malePercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Data Note */}
          <div className="text-xs text-gray-600 mt-6 bg-blue-50 p-3 rounded border border-blue-200 text-center">
            <span className="font-semibold">Note:</span> Gender distribution shows near-equal representation with 49.3% female and 50.7% male new hires in {data.quarter}.
          </div>
        </div>

        {/* ============================================== */}
        {/* ORACLE HIRING DETAILS (All 69 Hires)          */}
        {/* ============================================== */}

        <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users style={{color: '#0054A6'}} size={24} />
            Oracle Hiring Details
            <span className="text-sm font-normal text-gray-500 ml-2">(Oracle HCM - Source of Truth)</span>
          </h2>

          {/* Coverage Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">{oracleHires.summary.total}</div>
              <div className="text-xs text-gray-600">Total Hires</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">{oracleHires.summary.faculty}</div>
              <div className="text-xs text-gray-600">Faculty</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">{oracleHires.summary.staff}</div>
              <div className="text-xs text-gray-600">Staff</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-purple-600">{oracleHires.summary.inORC}</div>
              <div className="text-xs text-gray-600">In ORC ATS</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-amber-600">{oracleHires.summary.notInEitherSystem}</div>
              <div className="text-xs text-gray-600">Not in ATS</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">FACULTY</span>
              <span className="text-gray-600">Faculty Hire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">STAFF</span>
              <span className="text-gray-600">Staff Hire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-1 rounded font-mono bg-teal-100 text-teal-800 font-medium">F##</span>
              <span className="text-gray-600">Full-Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-1 rounded font-mono bg-orange-100 text-orange-800 font-medium">PT##</span>
              <span className="text-gray-600">Part-Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-purple-100 text-purple-800 font-bold text-xs">I</span>
              <span className="text-gray-600">In Interfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-blue-100 text-blue-800 font-bold text-xs">O</span>
              <span className="text-gray-600">In ORC ATS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-gray-100 text-gray-500 font-bold text-xs">-</span>
              <span className="text-gray-600">Not in ATS</span>
            </div>
          </div>

          {/* Oracle Hires Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <SortableHeader label="Name" sortKey="name" className="text-left" />
                  <SortableHeader label="Position" sortKey="position" className="text-left" />
                  <SortableHeader label="Department" sortKey="department" className="text-left" />
                  <SortableHeader label="School" sortKey="school" className="text-left" />
                  <SortableHeader label="Type" sortKey="type" />
                  <SortableHeader label="Elig Code" sortKey="assignmentCode" />
                  <SortableHeader label="Hire Date" sortKey="hireDate" />
                  <SortableHeader label="ATS" sortKey="ats" />
                </tr>
              </thead>
              <tbody>
                {sortedHires.map((hire, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${!hire.inInterfolio && !hire.inORC ? 'bg-amber-50' : ''}`}>
                    <td className="py-2 px-3 text-sm font-medium text-gray-900">{hire.name}</td>
                    <td className="py-2 px-3 text-sm text-gray-700 max-w-[180px] truncate" title={hire.position}>{hire.position}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 max-w-[150px] truncate" title={hire.department}>{hire.department}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 max-w-[100px] truncate" title={hire.school}>{hire.school}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        hire.type === 'FACULTY' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {hire.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded font-mono font-medium ${
                        hire.assignmentCode.startsWith('F') ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800'
                      }`} title={hire.assignmentCode.startsWith('F') ? 'Full-Time' : 'Part-Time'}>
                        {hire.assignmentCode}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-sm text-gray-600">{hire.hireDate}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex justify-center gap-1">
                        {hire.inInterfolio && (
                          <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-purple-100 text-purple-800 font-bold text-xs" title="In Interfolio">I</span>
                        )}
                        {hire.inORC && (
                          <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-blue-100 text-blue-800 font-bold text-xs" title="In ORC ATS (myJobs)">O</span>
                        )}
                        {!hire.inInterfolio && !hire.inORC && (
                          <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-gray-100 text-gray-500 font-bold text-xs" title="Not tracked in ATS">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            {oracleHires.summary.notInEitherSystem} of {oracleHires.summary.total} hires ({Math.round(oracleHires.summary.notInEitherSystem / oracleHires.summary.total * 100)}%) not captured in Interfolio or ORC ATS
          </div>

          {/* Coverage Gap Analysis */}
          <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Coverage Gap Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-amber-700">
              <div>
                <span className="font-semibold">Faculty not in Interfolio:</span> {oracleHires.summary.faculty - oracleHires.summary.inInterfolio} of {oracleHires.summary.faculty}
                <p className="text-gray-600 mt-1">Most faculty hired directly without Interfolio search</p>
              </div>
              <div>
                <span className="font-semibold">Staff in ORC ATS:</span> {oracleHires.summary.inORC} of {oracleHires.summary.staff}
                <p className="text-gray-600 mt-1">100% of staff hires tracked in ORC</p>
              </div>
              <div>
                <span className="font-semibold">Not in any ATS:</span> {oracleHires.summary.notInEitherSystem}
                <p className="text-gray-600 mt-1">Primarily faculty direct hires</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* FACULTY HIRING SECTION (from Interfolio)      */}
        {/* ============================================== */}

        <div className="bg-gradient-to-r from-green-50 to-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award style={{color: '#10B981'}} size={24} />
            Faculty Hiring Detail
            <span className="text-sm font-normal text-gray-500 ml-2">(Interfolio)</span>
          </h2>

          {/* Faculty Hire Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">{interfolio.summary.total}</div>
              <div className="text-xs text-gray-600">Total Hires</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">{interfolio.summary.tenureTrack}</div>
              <div className="text-xs text-gray-600">Tenure Track</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">{interfolio.summary.nonTenure}</div>
              <div className="text-xs text-gray-600">Non-Tenure</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-purple-600">{interfolio.summary.instructor}</div>
              <div className="text-xs text-gray-600">Instructor</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-amber-600">{interfolio.summary.specialFaculty}</div>
              <div className="text-xs text-gray-600">Special Faculty</div>
            </div>
          </div>

          {/* Faculty Hires Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Degree</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Department</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hire Date</th>
                </tr>
              </thead>
              <tbody>
                {interfolio.hires.map((hire, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{hire.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{hire.degree}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{hire.position}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{hire.department}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        hire.type === 'Tenure Track' ? 'bg-green-100 text-green-800' :
                        hire.type === 'Non-Tenure' ? 'bg-blue-100 text-blue-800' :
                        hire.type === 'Instructor' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {hire.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{hire.hireDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            50% tenure-track positions (3 of 6 faculty hires)
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText style={{color: '#0054A6'}} size={24} />
            Executive Summary
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Key Metrics</h3>
              <div className="space-y-3">

                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">69 benefit-eligible new hires</span> in Q1 FY26 (July-August data)
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">97.7% offer acceptance rate</span> - strong candidate experience
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">32.5% internal hire rate</span> - promoting from within
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">35.5 avg days to fill</span> - efficient hiring process
                  </div>
                </div>

              </div>
            </div>

            {/* Critical Insights */}
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-4">Critical Insights</h3>
              <div className="space-y-3">

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">LinkedIn top source:</span> 40% of applications from LinkedIn
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">22% of reqs open 90+ days:</span> May need sourcing support
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">Academic & Student Affairs:</span> 45 openings (largest job family)
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">50% tenure-track faculty:</span> 3 of 6 faculty hires on tenure track
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Methodology Note */}
        <div className="text-xs text-gray-500 text-center">
          <p>Data Sources: Oracle HCM (New Hires) • Oracle Recruiting Cloud/myJobs (Staff Pipeline) • Interfolio (Faculty Pipeline)</p>
          <p className="mt-1">Methodology: NEW_HIRES_METHODOLOGY.md • Grade R (Residents/Fellows) included as House Staff Physicians</p>
        </div>

      </div>
    </div>
  );
};

export default RecruitingQ1FY26Dashboard;
