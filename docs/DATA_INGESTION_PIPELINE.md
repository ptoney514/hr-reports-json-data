# Data Ingestion & Transformation Pipeline Design

**Version:** 1.0.0
**Last Updated:** November 14, 2025
**Author:** Technical Architect Agent

---

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Data Sources](#data-sources)
4. [Script Architecture](#script-architecture)
5. [User Workflow](#user-workflow)
6. [Data Transformation Rules](#data-transformation-rules)
7. [Validation & Audit Trail](#validation--audit-trail)
8. [staticData.js Integration Strategy](#staticdatajs-integration-strategy)
9. [Migration Guide](#migration-guide)
10. [Example Implementation](#example-implementation)
11. [Testing Strategy](#testing-strategy)
12. [Security & Compliance](#security--compliance)

---

## Overview

### Purpose
Transform Excel exports from Workday HRIS into cleaned JSON data for the HR Reports React dashboard, mirroring the Flask project's simplicity while maintaining data security and quality.

### Design Principles
1. **Simplicity:** One command to transform Excel → JSON
2. **Security:** Raw Excel files never committed to git
3. **Auditability:** Comprehensive transformation logs
4. **Consistency:** Same business rules as Flask pipeline
5. **Maintainability:** Clear, documented Node.js scripts

### Architecture Pattern
```
OneDrive (Raw Excel + PII)
    ↓
Local source-metrics/ (temporary staging, gitignored)
    ↓
Node.js Cleaning Scripts (remove PII, transform, calculate)
    ↓
Cleaned JSON (committed to git)
    ↓
staticData.js (merged automatically or manually)
```

---

## Folder Structure

### Current Flask Project Structure
```
hr-reports-workspace/
└── source-metrics/
    ├── workforce-headcount/
    │   ├── New Emp List since FY20 to Q1FY25.xlsx (gitignored)
    │   └── cleaned_data/
    │       ├── workforce_cleaned.csv (committed)
    │       └── DATA_CLEANING_AUDIT.md (committed)
    └── terminations/
        ├── FY25_Q1/
        │   └── Terms_Q1.xlsx (gitignored)
        ├── FY25_Q2/
        │   └── Terms_Q2.xlsx (gitignored)
        └── cleaned_data/
            ├── FY25_Q1/
            │   ├── terminations_cleaned.csv (committed)
            │   └── DATA_CLEANING_AUDIT.md (committed)
            └── FY25_Q2/
                ├── terminations_cleaned.csv (committed)
                └── DATA_CLEANING_AUDIT.md (committed)
```

### Proposed React Project Structure
```
hr-reports-json-data/
└── source-metrics/
    ├── .gitignore (blocks raw Excel, allows cleaned JSON)
    ├── README.md (user guide)
    │
    ├── workforce/
    │   ├── raw/ (gitignored - temporary staging)
    │   │   ├── FY25_Q1_workforce.xlsx
    │   │   ├── FY25_Q2_workforce.xlsx
    │   │   └── FY25_Q3_workforce.xlsx
    │   └── cleaned/ (committed to git)
    │       ├── FY25_Q1/
    │       │   ├── workforce_cleaned.json
    │       │   └── DATA_CLEANING_AUDIT.md
    │       ├── FY25_Q2/
    │       │   ├── workforce_cleaned.json
    │       │   └── DATA_CLEANING_AUDIT.md
    │       └── latest/
    │           ├── workforce_cleaned.json (symlink or copy)
    │           └── DATA_CLEANING_AUDIT.md
    │
    ├── terminations/
    │   ├── raw/ (gitignored)
    │   │   ├── FY25_Q1_terms.xlsx
    │   │   ├── FY25_Q2_terms.xlsx
    │   │   ├── FY25_Q3_terms.xlsx
    │   │   └── FY25_Q4_terms.xlsx
    │   └── cleaned/ (committed to git)
    │       ├── FY25_Q1/
    │       │   ├── terminations_cleaned.json
    │       │   └── DATA_CLEANING_AUDIT.md
    │       ├── FY25_Q2/
    │       │   ├── terminations_cleaned.json
    │       │   └── DATA_CLEANING_AUDIT.md
    │       └── latest/
    │           ├── terminations_cleaned.json
    │           └── DATA_CLEANING_AUDIT.md
    │
    ├── exit-surveys/
    │   ├── raw/ (gitignored)
    │   │   ├── FY25_Q1_exit_surveys.xlsx
    │   │   └── FY25_Q2_exit_surveys.xlsx
    │   └── cleaned/ (committed to git)
    │       ├── FY25_Q1/
    │       │   ├── exit_surveys_cleaned.json
    │       │   └── DATA_CLEANING_AUDIT.md
    │       └── latest/
    │           ├── exit_surveys_cleaned.json
    │           └── DATA_CLEANING_AUDIT.md
    │
    ├── recruiting/
    │   ├── raw/ (gitignored)
    │   │   ├── FY25_Q1_recruiting.xlsx
    │   │   └── FY25_Q2_recruiting.xlsx
    │   └── cleaned/ (committed to git)
    │       └── FY25_Q1/
    │           ├── recruiting_cleaned.json
    │           └── DATA_CLEANING_AUDIT.md
    │
    └── templates/
        ├── workforce_template.xlsx (example structure)
        ├── terminations_template.xlsx
        └── exit_survey_template.xlsx
```

### Updated .gitignore
```gitignore
# Ignore raw Excel files (contain PII)
*/raw/**/*.xlsx
*/raw/**/*.xls
*/raw/**/*.csv

# Keep cleaned JSON (PII removed)
!*/cleaned/**/*.json
!*/cleaned/**/*.md

# Allow templates
!templates/*.xlsx

# Keep folder structure
!.gitkeep
!README.md
!*/README.md

# Ignore any files with PII indicators
*_pii.*
*_private.*
*_confidential.*
*.bak
*.tmp

# Ignore large data dumps
raw-exports/*/*
!raw-exports/*/.gitkeep
```

---

## Data Sources

### 1. Workforce Headcount
**Frequency:** Quarterly snapshots
**Source System:** Workday
**Excel Format:** "New Emp List since FY20 to Q1FY25.xlsx"

**Key Fields:**
- Employee ID (anonymized)
- Person Type (STAFF, FACULTY)
- Assignment Category Code (F12, PT10, SUE, HSR, etc.)
- Department
- Location (Omaha Campus, Phoenix Campus)
- Hire Date
- Status (Active, Terminated)

**Business Rules:**
- Exclude: HSR, CWS, SUE, TEMP, PRN, NBE from staff/faculty counts
- Student counts: SUE (student worker), CWS (Federal Work Study)
- House Staff: HSR assignment category code
- Non-Benefit: TEMP, NBE, PRN assignment categories

### 2. Terminations
**Frequency:** Quarterly exports
**Source System:** Workday
**Excel Format:** "Terms Since 2017 Detail PT.xlsx"

**Key Fields:**
- Employee ID (anonymized)
- Term Date
- Hire Date
- Department
- Assignment Category
- Termination Reason
- Voluntary/Involuntary

**Business Rules:**
- FY25 Date Range: July 1, 2024 - June 30, 2025
- Exclude: HSR, CWS, SUE, TEMP, PRN, NBE from turnover counts
- Calculate: Years of service, tenure categories, quarter assignment
- Validated Total: 222 unique exits in FY25

### 3. Exit Surveys
**Frequency:** Quarterly collection
**Source System:** Qualtrics export
**Excel/CSV Format:** Variable

**Key Fields:**
- Response ID
- Exit Date
- Department
- Would Recommend (Yes/No)
- Satisfaction Ratings (1-5 scale)
- Exit Reason(s)
- Comments (anonymized before import)

**Business Rules:**
- Response rate calculation: surveys / voluntary terms
- Must match termination counts by quarter
- Comments require manual redaction before import

### 4. Recruiting
**Frequency:** Quarterly/Monthly
**Source System:** Workday Recruiting
**Excel Format:** "Recruiting Activity Report.xlsx"

**Key Fields:**
- Requisition ID
- Department
- Position Title
- Posted Date
- Filled Date
- Days to Fill
- Source of Hire

**Business Rules:**
- Time to fill calculations
- Source effectiveness metrics
- Funnel conversion rates

---

## Script Architecture

### Design Pattern: Modular Cleaning Scripts

Each data source gets its own cleaning script that follows this pattern:

```javascript
// scripts/clean-<source>-data.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 1. Configuration
const CONFIG = {
  inputFile: path.join(__dirname, '../source-metrics/<source>/raw/FY25_Q1_<source>.xlsx'),
  outputDir: path.join(__dirname, '../source-metrics/<source>/cleaned/FY25_Q1'),
  fiscalYear: 'FY25',
  quarter: 'Q1'
};

// 2. Business Rules
const EXCLUDED_CATEGORIES = ['HSR', 'CWS', 'SUE', 'TEMP', 'PRN', 'NBE'];
const FY25_DATE_RANGE = { start: '2024-07-01', end: '2025-06-30' };

// 3. Load Excel
function loadExcel(filePath) { ... }

// 4. Remove PII
function removePII(data) { ... }

// 5. Apply Transformations
function transformData(data) { ... }

// 6. Calculate Derived Fields
function calculateDerivedFields(data) { ... }

// 7. Validate Data
function validateData(data) { ... }

// 8. Generate Audit Trail
function generateAudit(stats) { ... }

// 9. Export JSON
function exportJSON(data, outputPath) { ... }

// 10. Main Orchestration
async function main() {
  const raw = loadExcel(CONFIG.inputFile);
  const anonymized = removePII(raw);
  const transformed = transformData(anonymized);
  const enriched = calculateDerivedFields(transformed);
  const validated = validateData(enriched);

  exportJSON(validated, path.join(CONFIG.outputDir, '<source>_cleaned.json'));
  generateAudit(validated, path.join(CONFIG.outputDir, 'DATA_CLEANING_AUDIT.md'));
}

main();
```

### Script Inventory

#### Core Cleaning Scripts
1. **scripts/clean-workforce-data.js** - Workforce headcount transformation
2. **scripts/clean-terminations-data.js** - Terminations transformation
3. **scripts/clean-exit-survey-data.js** - Exit survey transformation
4. **scripts/clean-recruiting-data.js** - Recruiting data transformation

#### Utility Scripts
5. **scripts/utils/excel-helpers.js** - Excel date conversion, sheet reading
6. **scripts/utils/pii-removal.js** - PII detection and removal
7. **scripts/utils/fiscal-calendar.js** - FY quarter calculations
8. **scripts/utils/validation.js** - Data validation rules
9. **scripts/utils/audit-generator.js** - Markdown audit trail generation

#### Orchestration Scripts
10. **scripts/data-import.js** - Main CLI entry point (handles all sources)
11. **scripts/merge-to-static-data.js** - Merge cleaned JSON → staticData.js

---

## User Workflow

### Step-by-Step Process

#### Current Flask Workflow (for reference)
```bash
# 1. User receives Excel from HR
# 2. Save to OneDrive: ~/OneDrive/HR-Reports-Raw-Data/terminations/FY25_Q2/Terms_Q2.xlsx
# 3. Copy to project: source-metrics/terminations/FY25_Q2/
# 4. Run cleaning script
python scripts/clean_termination_data.py

# 5. Review audit file: source-metrics/terminations/cleaned_data/FY25_Q2/DATA_CLEANING_AUDIT.md
# 6. Commit cleaned CSV to git
# 7. Flask API reads cleaned CSV
```

#### Proposed React Workflow (simplified)

**Option A: Single Command Import (Recommended)**
```bash
# 1. User receives Excel from HR
# 2. Save to OneDrive (archive copy)
# 3. Run import command with source type and file path

npm run data:import workforce ~/OneDrive/HR-Reports-Raw-Data/workforce/FY25_Q2_workforce.xlsx

# Script automatically:
# - Copies file to source-metrics/workforce/raw/
# - Cleans and transforms to JSON
# - Saves to source-metrics/workforce/cleaned/FY25_Q2/
# - Generates audit trail
# - Prompts to merge into staticData.js

# 4. Review audit file
# 5. Commit cleaned JSON to git
```

**Option B: Manual Two-Step Process**
```bash
# 1. User receives Excel from HR
# 2. Manually copy to: source-metrics/workforce/raw/FY25_Q2_workforce.xlsx
# 3. Run cleaning script

npm run clean:workforce FY25_Q2

# 4. Review output
# 5. Merge to staticData.js

npm run merge:workforce FY25_Q2

# 6. Commit to git
```

**Option C: Interactive CLI**
```bash
# 1. Run interactive import wizard
npm run data:wizard

# Prompts:
# - Select data source: [Workforce, Terminations, Exit Surveys, Recruiting]
# - Select fiscal period: [FY25_Q1, FY25_Q2, FY25_Q3, FY25_Q4]
# - Browse for Excel file
# - Confirm cleaning rules
# - Auto-merge to staticData.js? [Y/n]

# 2. Review and commit
```

### Recommended Implementation: Option A

**Command Structure:**
```bash
npm run data:import <source> <file-path> [options]

# Examples:
npm run data:import workforce ~/OneDrive/HR-Data/workforce_Q2.xlsx
npm run data:import terminations ./Terms_Q2.xlsx --quarter Q2 --fy FY25
npm run data:import exit-surveys survey_data.csv --auto-merge
```

**Script Arguments:**
- `<source>`: workforce | terminations | exit-surveys | recruiting
- `<file-path>`: Path to Excel/CSV file
- `--quarter, -q`: Fiscal quarter (Q1, Q2, Q3, Q4)
- `--fy`: Fiscal year (FY25, FY26)
- `--auto-merge`: Automatically merge to staticData.js after cleaning
- `--skip-validation`: Skip validation checks (not recommended)
- `--dry-run`: Preview changes without writing files

**package.json Scripts:**
```json
{
  "scripts": {
    "data:import": "node scripts/data-import.js",
    "data:wizard": "node scripts/data-wizard-interactive.js",
    "clean:workforce": "node scripts/clean-workforce-data.js",
    "clean:terminations": "node scripts/clean-terminations-data.js",
    "clean:exit-surveys": "node scripts/clean-exit-survey-data.js",
    "merge:staticdata": "node scripts/merge-to-static-data.js",
    "validate:all": "node scripts/validate-all-sources.js"
  }
}
```

---

## Data Transformation Rules

### Workforce Data Transformation

**Input:** Excel file with ~5,000 rows, 20+ columns
**Output:** JSON with categorized employee counts

**Transformations:**

1. **PII Removal**
   ```javascript
   // Remove before saving to JSON
   const PII_FIELDS = [
     'Employee ID',
     'Legal Name',
     'Preferred Name',
     'Email',
     'SSN',
     'Phone',
     'Address',
     'Emergency Contact'
   ];

   // Replace with anonymized ID
   data.forEach(row => {
     row.employee_id = hashEmployeeID(row['Employee ID']);
     PII_FIELDS.forEach(field => delete row[field]);
   });
   ```

2. **Category Derivation**
   ```javascript
   function getEmployeeCategory(row) {
     const code = row['Assignment Category Code'];
     const personType = row['Person Type'];

     if (code === 'HSR') return 'House Staff';
     if (['SUE', 'CWS'].includes(code)) return 'Students';
     if (['TEMP', 'NBE', 'PRN'].includes(code)) return 'Non-Benefit';

     if (BENEFIT_ELIGIBLE_CODES.includes(code)) {
       if (personType === 'FACULTY') return 'Faculty';
       if (personType === 'STAFF') return 'Benefit Staff';
     }

     return 'Other';
   }
   ```

3. **Fiscal Period Assignment**
   ```javascript
   function assignFiscalPeriod(date) {
     const d = new Date(date);
     const month = d.getMonth(); // 0-indexed

     if (month >= 6 && month <= 8) return 'Q1'; // Jul-Sep
     if (month >= 9 && month <= 11) return 'Q2'; // Oct-Dec
     if (month >= 0 && month <= 2) return 'Q3'; // Jan-Mar
     if (month >= 3 && month <= 5) return 'Q4'; // Apr-Jun
   }
   ```

4. **Aggregation**
   ```javascript
   const output = {
     reportingDate: "9/30/24",
     totalEmployees: allRecords.length,
     faculty: records.filter(r => r.category === 'Faculty').length,
     staff: records.filter(r => r.category === 'Benefit Staff').length,
     hsp: records.filter(r => r.category === 'House Staff').length,
     students: records.filter(r => r.category === 'Students').length,
     locations: {
       "Omaha Campus": records.filter(r => r.location === 'Omaha').length,
       "Phoenix Campus": records.filter(r => r.location === 'Phoenix').length
     },
     departments: aggregateDepartments(records),
     schoolOrgData: aggregateSchools(records)
   };
   ```

### Terminations Data Transformation

**Input:** Excel file with termination records
**Output:** JSON with quarterly turnover analysis

**Transformations:**

1. **Date Filtering**
   ```javascript
   const FY25_START = new Date('2024-07-01');
   const FY25_END = new Date('2025-06-30');

   const fy25Terms = allTerms.filter(row => {
     const termDate = excelDateToJSDate(row['Term Date']);
     return termDate >= FY25_START && termDate <= FY25_END;
   });
   ```

2. **Tenure Calculation**
   ```javascript
   function calculateTenure(hireDate, termDate) {
     const hire = new Date(hireDate);
     const term = new Date(termDate);
     const years = (term - hire) / (365.25 * 24 * 60 * 60 * 1000);

     if (years < 1) return '0-1 years';
     if (years < 2) return '1-2 years';
     if (years < 3) return '2-3 years';
     if (years < 5) return '3-5 years';
     return '5+ years';
   }
   ```

3. **Category Exclusion**
   ```javascript
   const EXCLUDED_FROM_TURNOVER = ['HSR', 'CWS', 'SUE', 'TEMP', 'PRN', 'NBE'];

   const countableTerms = fy25Terms.filter(row => {
     const category = row['Assignment Category'];
     return !EXCLUDED_FROM_TURNOVER.includes(category);
   });

   // Expected: 222 unique exits in FY25
   ```

4. **Voluntary/Involuntary Classification**
   ```javascript
   function classifyTermination(reason) {
     const VOLUNTARY_REASONS = [
       'Resignation',
       'Retirement',
       'End of Contract',
       'Personal Reasons'
     ];

     const INVOLUNTARY_REASONS = [
       'Termination',
       'Layoff',
       'Performance',
       'Attendance'
     ];

     if (VOLUNTARY_REASONS.includes(reason)) return 'Voluntary';
     if (INVOLUNTARY_REASONS.includes(reason)) return 'Involuntary';
     return 'Other';
   }
   ```

### Exit Survey Data Transformation

**Input:** CSV/Excel with survey responses
**Output:** JSON with aggregated satisfaction metrics

**Transformations:**

1. **Response Matching**
   ```javascript
   // Match exit surveys to terminations by date range
   function matchSurveyToTerm(surveyDate, terminations) {
     const survey = new Date(surveyDate);
     const matchWindow = 30; // days before/after

     return terminations.find(term => {
       const termDate = new Date(term.termDate);
       const daysDiff = Math.abs((survey - termDate) / (24 * 60 * 60 * 1000));
       return daysDiff <= matchWindow;
     });
   }
   ```

2. **Satisfaction Aggregation**
   ```javascript
   function calculateSatisfactionMetrics(surveys) {
     const total = surveys.length;
     const wouldRecommend = surveys.filter(s => s.recommend === 'Yes').length;

     return {
       responseRate: (total / totalTerminations * 100).toFixed(1),
       wouldRecommendPct: (wouldRecommend / total * 100).toFixed(1),
       avgSatisfaction: (surveys.reduce((sum, s) => sum + s.rating, 0) / total).toFixed(2)
     };
   }
   ```

3. **Comment Redaction**
   ```javascript
   function redactComments(comment) {
     // Remove names, emails, phone numbers
     let redacted = comment;

     // Remove email addresses
     redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REDACTED]');

     // Remove phone numbers
     redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE REDACTED]');

     // Manual review still required for names
     return redacted;
   }
   ```

---

## Validation & Audit Trail

### Validation Checks

Each cleaning script performs these validations:

#### 1. Required Field Validation
```javascript
function validateRequiredFields(data, requiredFields) {
  const errors = [];

  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field] || row[field] === '') {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });
  });

  if (errors.length > 0) {
    throw new ValidationError(`Found ${errors.length} validation errors`, errors);
  }
}
```

#### 2. Duplicate Detection
```javascript
function checkDuplicates(data, uniqueField) {
  const seen = new Set();
  const duplicates = [];

  data.forEach((row, index) => {
    const value = row[uniqueField];
    if (seen.has(value)) {
      duplicates.push({ row: index + 1, value });
    }
    seen.add(value);
  });

  return duplicates;
}
```

#### 3. Date Range Validation
```javascript
function validateDateRange(data, dateField, expectedRange) {
  const outOfRange = data.filter(row => {
    const date = new Date(row[dateField]);
    return date < expectedRange.start || date > expectedRange.end;
  });

  if (outOfRange.length > 0) {
    console.warn(`Warning: ${outOfRange.length} records outside expected date range`);
  }
}
```

#### 4. Cross-Reference Validation
```javascript
function validateTurnoverMatch(terminations, exitSurveys) {
  const termCount = terminations.filter(t => t.voluntary === true).length;
  const surveyCount = exitSurveys.length;
  const responseRate = (surveyCount / termCount * 100).toFixed(1);

  console.log(`✓ Voluntary terminations: ${termCount}`);
  console.log(`✓ Exit surveys: ${surveyCount}`);
  console.log(`✓ Response rate: ${responseRate}%`);

  if (responseRate < 40) {
    console.warn('⚠ Response rate below 40% - review data quality');
  }
}
```

#### 5. Business Rule Validation
```javascript
function validateFY25Total(terminations) {
  const EXPECTED_FY25_EXITS = 222; // Validated total
  const actual = terminations.length;

  if (actual !== EXPECTED_FY25_EXITS) {
    throw new ValidationError(
      `FY25 exit count mismatch: Expected ${EXPECTED_FY25_EXITS}, got ${actual}`
    );
  }

  console.log(`✓ FY25 total validated: ${actual} exits`);
}
```

### Audit Trail Format

**File:** `source-metrics/<source>/cleaned/<period>/DATA_CLEANING_AUDIT.md`

```markdown
# Data Cleaning Audit Report

**Date:** 2024-11-14 10:30:00
**Script:** scripts/clean-workforce-data.js
**Source File:** FY25_Q2_workforce.xlsx
**Output File:** workforce_cleaned.json
**Fiscal Period:** FY25 Q2 (Oct 1 - Dec 31, 2024)

---

## Data Overview

| Metric | Value |
|--------|-------|
| Total Records Loaded | 4,856 |
| Records After Filtering | 4,774 |
| Records Removed | 82 |
| Output Records | 4,774 |
| Processing Time | 2.3 seconds |

---

## Transformations Applied

### 1. PII Removal
**Fields Removed:**
- Employee ID (replaced with anonymized hash)
- Legal Name
- Email
- Phone Number
- Address

**Records Affected:** 4,774 (100%)

### 2. Category Assignment
**Logic:** Person Type + Assignment Category Code → Employee Category

| Category | Count | % of Total |
|----------|-------|------------|
| Benefit Staff | 1,431 | 30.0% |
| Faculty | 678 | 14.2% |
| House Staff | 608 | 12.7% |
| Students | 1,491 | 31.2% |
| Non-Benefit | 566 | 11.9% |

**Excluded from Staff/Faculty Counts:**
- HSR: 608 (House Staff)
- SUE: 1,414 (Student Workers)
- CWS: 77 (Federal Work Study)
- TEMP: 447 (Temporary)
- NBE: 14 (Non-Benefit Eligible)
- PRN: 105 (Per Diem)

### 3. Fiscal Period Assignment
**Reporting Date:** 2024-12-31 (End of Q2 FY25)
**Quarter:** Q2 FY25

### 4. Location Standardization
| Original | Standardized | Count |
|----------|-------------|--------|
| Omaha | Omaha Campus | 4,260 |
| Phoenix | Phoenix Campus | 514 |

---

## Validation Results

### ✓ Required Fields
- All records contain: Person Type, Assignment Category, Location
- No missing required fields

### ✓ Date Validation
- All hire dates are valid
- All dates within expected range: 1970-01-01 to 2024-12-31

### ✓ Duplicate Check
- No duplicate employee IDs detected

### ✓ Category Validation
- All assignment categories recognized
- No "Other" or "Unknown" categories

### ✓ Business Rules
- Staff count (excluding HSR, students, non-benefit): 1,431 ✓
- Faculty count: 678 ✓
- Total employees: 4,774 ✓
- Matches HR slide totals ✓

---

## Data Quality Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Data Completeness | >95% | 100% | ✓ Pass |
| Duplicate Rate | <1% | 0% | ✓ Pass |
| Invalid Categories | 0 | 0 | ✓ Pass |
| Missing Required Fields | 0 | 0 | ✓ Pass |

---

## Warnings & Notes

⚠ **Note:** 82 records excluded due to:
- Invalid assignment categories: 42
- Terminated before reporting date: 40

✓ **Data Quality:** High - All validation checks passed

---

## Next Steps

1. Review this audit file for accuracy
2. Compare totals to HR slide deck
3. Merge cleaned JSON to staticData.js:
   ```bash
   npm run merge:workforce FY25_Q2
   ```
4. Commit cleaned data to git:
   ```bash
   git add source-metrics/workforce/cleaned/FY25_Q2/
   git commit -m "feat: Add FY25 Q2 workforce data"
   ```

---

## File Locations

- **Source Excel:** `source-metrics/workforce/raw/FY25_Q2_workforce.xlsx` (gitignored)
- **Cleaned JSON:** `source-metrics/workforce/cleaned/FY25_Q2/workforce_cleaned.json` (committed)
- **Audit Report:** `source-metrics/workforce/cleaned/FY25_Q2/DATA_CLEANING_AUDIT.md` (committed)

---

*Generated by data-cleaning-pipeline v1.0.0*
```

---

## staticData.js Integration Strategy

### Option A: Automated Merge (Recommended)

**Approach:** Script automatically updates staticData.js with new data

**Pros:**
- Fastest workflow
- Eliminates manual errors
- Consistent formatting
- Version control friendly

**Cons:**
- Requires careful script design
- Potential for overwriting manual fixes

**Implementation:**
```javascript
// scripts/merge-to-static-data.js

const fs = require('fs');
const path = require('path');

function mergeWorkforceData(fiscalPeriod) {
  // 1. Read cleaned JSON
  const cleanedPath = path.join(
    __dirname,
    `../source-metrics/workforce/cleaned/${fiscalPeriod}/workforce_cleaned.json`
  );
  const cleanedData = JSON.parse(fs.readFileSync(cleanedPath, 'utf8'));

  // 2. Read current staticData.js
  const staticDataPath = path.join(__dirname, '../src/data/staticData.js');
  let staticDataContent = fs.readFileSync(staticDataPath, 'utf8');

  // 3. Parse staticData.js (it's a JS module, not pure JSON)
  const WORKFORCE_DATA_REGEX = /export const WORKFORCE_DATA = ({[\s\S]*?});/;
  const match = staticDataContent.match(WORKFORCE_DATA_REGEX);

  if (!match) {
    throw new Error('Could not find WORKFORCE_DATA in staticData.js');
  }

  // 4. Parse existing WORKFORCE_DATA object
  const existingData = eval(`(${match[1]})`);

  // 5. Merge new data (add or update reporting date key)
  const reportingDate = cleanedData.reportingDate; // e.g., "12/31/24"
  const dateKey = convertToDateKey(reportingDate); // "2024-12-31"

  existingData[dateKey] = cleanedData;

  // 6. Generate updated JavaScript code
  const updatedWorkforceData = `export const WORKFORCE_DATA = ${JSON.stringify(existingData, null, 2)};`;

  // 7. Replace in staticData.js
  staticDataContent = staticDataContent.replace(
    WORKFORCE_DATA_REGEX,
    updatedWorkforceData
  );

  // 8. Write back to file
  fs.writeFileSync(staticDataPath, staticDataContent, 'utf8');

  console.log(`✓ Merged ${fiscalPeriod} workforce data into staticData.js`);
  console.log(`  Date key: ${dateKey}`);
  console.log(`  Total employees: ${cleanedData.totalEmployees}`);
}

// Helper to convert "12/31/24" → "2024-12-31"
function convertToDateKey(reportingDate) {
  const [month, day, year] = reportingDate.split('/');
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

module.exports = { mergeWorkforceData };
```

**Usage:**
```bash
npm run merge:workforce FY25_Q2
npm run merge:terminations FY25_Q2
npm run merge:exit-surveys FY25_Q2
```

### Option B: Manual Copy/Paste

**Approach:** User manually copies JSON into staticData.js

**Pros:**
- Full control
- Easy to verify
- No risk of script errors

**Cons:**
- Manual effort
- Prone to formatting errors
- Slower workflow

**Process:**
1. Open `source-metrics/workforce/cleaned/FY25_Q2/workforce_cleaned.json`
2. Copy JSON content
3. Open `src/data/staticData.js`
4. Paste into appropriate section
5. Format with Prettier
6. Save and test

### Option C: Separate JSON Files with Dynamic Import

**Approach:** Keep cleaned JSON separate, import dynamically in React

**Pros:**
- Clean separation of concerns
- Easy to update individual periods
- No risk of breaking staticData.js

**Cons:**
- Requires code changes in React components
- More files to manage
- Slight performance overhead

**Implementation:**
```javascript
// src/data/workforce/index.js
import fy25q1 from './cleaned/FY25_Q1/workforce_cleaned.json';
import fy25q2 from './cleaned/FY25_Q2/workforce_cleaned.json';
import fy25q3 from './cleaned/FY25_Q3/workforce_cleaned.json';

export const WORKFORCE_DATA = {
  '2024-09-30': fy25q1,
  '2024-12-31': fy25q2,
  '2025-03-31': fy25q3
};
```

### Recommendation: Option A (Automated Merge)

**Rationale:**
- Matches Flask simplicity (one command)
- Reduces manual errors
- Maintains staticData.js structure
- Easy to audit changes via git diff
- Can be reverted if issues arise

**Safety Measures:**
1. Create backup before merge: `staticData.js.backup`
2. Validate JSON structure before merge
3. Run tests after merge
4. Prompt user to review git diff before committing

---

## Migration Guide

### Migrating Existing FY25 Data

**Current State:**
- React project has manually entered data in `staticData.js`
- Flask project has cleaned CSV files for FY25 Q1-Q4

**Migration Strategy:**

#### Step 1: Convert Flask CSV to JSON

```bash
# Create conversion script
node scripts/migrate-flask-to-json.js

# Script reads:
# - hr-reports-workspace/source-metrics/terminations/cleaned_data/FY25_Q1/terminations_cleaned.csv
# - hr-reports-workspace/source-metrics/workforce-headcount/cleaned_data/workforce_cleaned.csv

# Outputs:
# - hr-reports-json-data/source-metrics/terminations/cleaned/FY25_Q1/terminations_cleaned.json
# - hr-reports-json-data/source-metrics/workforce/cleaned/FY25_Q1/workforce_cleaned.json
```

**Implementation:**
```javascript
// scripts/migrate-flask-to-json.js

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const FLASK_PROJECT = '/Users/pernelltoney/My Projects/02-development/hr-reports-workspace';
const REACT_PROJECT = '/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data';

function convertWorkforceCSVtoJSON(fiscalPeriod) {
  // 1. Read Flask CSV
  const csvPath = path.join(
    FLASK_PROJECT,
    'source-metrics/workforce-headcount/cleaned_data/workforce_cleaned.csv'
  );
  const csv = fs.readFileSync(csvPath, 'utf8');

  // 2. Parse CSV
  const parsed = Papa.parse(csv, { header: true, dynamicTyping: true });

  // 3. Transform to staticData.js format
  const json = transformWorkforceToJSON(parsed.data, fiscalPeriod);

  // 4. Write to React project
  const outputPath = path.join(
    REACT_PROJECT,
    `source-metrics/workforce/cleaned/${fiscalPeriod}/workforce_cleaned.json`
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf8');

  console.log(`✓ Migrated ${fiscalPeriod} workforce data to JSON`);
}

function transformWorkforceToJSON(csvData, fiscalPeriod) {
  // Group by department, location, category, etc.
  // Return staticData.js format
  return {
    reportingDate: getReportingDate(fiscalPeriod),
    totalEmployees: csvData.length,
    faculty: csvData.filter(r => r.category === 'Faculty').length,
    // ... rest of aggregation
  };
}
```

#### Step 2: Validate Migration

```bash
# Compare migrated JSON to existing staticData.js
node scripts/validate-migration.js

# Expected output:
# ✓ FY25 Q1: Total employees match (4,774 = 4,774)
# ✓ FY25 Q1: Faculty count match (678 = 678)
# ✓ FY25 Q1: Staff count match (1,431 = 1,431)
# ⚠ FY25 Q2: Department totals differ (manual review needed)
```

#### Step 3: Merge Migrated Data

```bash
# Merge FY25 Q1-Q4 data into staticData.js
npm run migrate:fy25

# Creates backup: src/data/staticData.js.backup
# Updates: src/data/staticData.js
# Generates: migration_report.md
```

#### Step 4: Verify and Commit

```bash
# Run tests
npm test

# Compare before/after
git diff src/data/staticData.js

# Commit if satisfied
git add source-metrics/*/cleaned/FY25_*/
git commit -m "feat: Migrate FY25 Q1-Q4 data from Flask CSV to JSON"
```

---

## Example Implementation

### Complete Workforce Cleaning Script

**File:** `scripts/clean-workforce-data.js`

```javascript
/**
 * Workforce Data Cleaning Script
 *
 * Transforms raw Workday Excel export into cleaned JSON for React dashboard
 * Mirrors Flask project's clean_workforce_data.py logic
 *
 * Usage:
 *   npm run clean:workforce FY25_Q2
 *   node scripts/clean-workforce-data.js --quarter FY25_Q2 --input workforce.xlsx
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ==================== CONFIGURATION ====================

const CONFIG = {
  // Assignment Category Code mappings
  STUDENT_CODES: ['SUE', 'CWS'],
  NON_BENEFIT_CODES: ['TEMP', 'NBE', 'PRN'],
  HOUSE_STAFF_CODE: 'HSR',
  BENEFIT_ELIGIBLE_CODES: [
    'F12', 'F11', 'F10', 'F09',  // Full-time
    'PT12', 'PT11', 'PT10', 'PT9'  // Part-time
  ],

  // PII fields to remove
  PII_FIELDS: [
    'Employee ID',
    'Legal Name',
    'Preferred Name',
    'Email',
    'SSN',
    'Phone',
    'Address',
    'Emergency Contact',
    'Birth Date'
  ],

  // Fiscal quarters
  FISCAL_QUARTERS: {
    Q1: { start: new Date('2024-07-01'), end: new Date('2024-09-30'), reportDate: '2024-09-30' },
    Q2: { start: new Date('2024-10-01'), end: new Date('2024-12-31'), reportDate: '2024-12-31' },
    Q3: { start: new Date('2025-01-01'), end: new Date('2025-03-31'), reportDate: '2025-03-31' },
    Q4: { start: new Date('2025-04-01'), end: new Date('2025-06-30'), reportDate: '2025-06-30' }
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert Excel date number to JavaScript Date
 * Excel stores dates as days since 1900-01-01 (with leap year bug)
 */
function excelDateToJSDate(excelDate) {
  if (typeof excelDate === 'number') {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  }
  if (typeof excelDate === 'string') {
    return new Date(excelDate);
  }
  return excelDate;
}

/**
 * Hash Employee ID to anonymize while maintaining uniqueness
 */
function hashEmployeeID(employeeId) {
  return crypto
    .createHash('sha256')
    .update(String(employeeId))
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for readability
}

/**
 * Determine employee category based on Assignment Category Code and Person Type
 *
 * Logic mirrors Flask clean_workforce_data.py:
 * - Person Type determines STAFF vs FACULTY
 * - Assignment Category Code indicates employment terms and special categories
 */
function getEmployeeCategory(row) {
  const code = row['Assignment Category Code'];
  const personType = row['Person Type'];

  if (!code) return null;

  // Check special categories first
  if (code === CONFIG.HOUSE_STAFF_CODE) {
    return 'House Staff';
  }

  if (CONFIG.STUDENT_CODES.includes(code)) {
    return 'Students';
  }

  if (CONFIG.NON_BENEFIT_CODES.includes(code)) {
    return 'Non-Benefit';
  }

  // Benefit-eligible employees: use Person Type
  if (CONFIG.BENEFIT_ELIGIBLE_CODES.includes(code)) {
    if (personType && personType.toUpperCase() === 'FACULTY') {
      return 'Faculty';
    }
    if (personType && personType.toUpperCase() === 'STAFF') {
      return 'Benefit Staff';
    }
  }

  return 'Other';
}

/**
 * Standardize campus location
 */
function getCampus(location) {
  if (!location) return 'Unknown';

  const loc = location.toLowerCase();

  if (loc.includes('omaha')) return 'Omaha Campus';
  if (loc.includes('phoenix')) return 'Phoenix Campus';

  return location; // Keep original if no match
}

/**
 * Get fiscal quarter from date
 */
function getFiscalQuarter(date) {
  const d = new Date(date);

  for (const [quarter, range] of Object.entries(CONFIG.FISCAL_QUARTERS)) {
    if (d >= range.start && d <= range.end) {
      return quarter;
    }
  }

  return null;
}

// ==================== DATA LOADING ====================

/**
 * Load Excel file and convert to JSON
 */
function loadExcelFile(filePath) {
  console.log(`Loading Excel file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Use first sheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with proper date handling
  const data = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    dateNF: 'mm/dd/yyyy'
  });

  console.log(`✓ Loaded ${data.length} records from sheet: ${sheetName}`);

  return data;
}

// ==================== DATA TRANSFORMATION ====================

/**
 * Remove PII fields and anonymize Employee ID
 */
function removePII(data) {
  console.log('Removing PII fields...');

  const anonymized = data.map(row => {
    const clean = { ...row };

    // Hash Employee ID
    if (clean['Employee ID']) {
      clean['employee_id_hash'] = hashEmployeeID(clean['Employee ID']);
    }

    // Remove all PII fields
    CONFIG.PII_FIELDS.forEach(field => {
      delete clean[field];
    });

    return clean;
  });

  console.log(`✓ Removed ${CONFIG.PII_FIELDS.length} PII fields from ${anonymized.length} records`);

  return anonymized;
}

/**
 * Apply transformations: category assignment, location standardization
 */
function transformData(data) {
  console.log('Applying transformations...');

  const transformed = data.map(row => {
    return {
      ...row,
      category: getEmployeeCategory(row),
      campus: getCampus(row['Location']),
      assignmentCategory: row['Assignment Category Code'],
      personType: row['Person Type'],
      department: row['Department'],
      hireDate: row['Hire Date'] ? excelDateToJSDate(row['Hire Date']) : null
    };
  });

  console.log(`✓ Transformed ${transformed.length} records`);

  return transformed;
}

/**
 * Filter to active employees only (for headcount snapshot)
 */
function filterActiveEmployees(data, reportingDate) {
  console.log(`Filtering to active employees as of ${reportingDate}...`);

  const reportDate = new Date(reportingDate);

  const active = data.filter(row => {
    // Include if hire date is before or on reporting date
    const hired = row.hireDate && row.hireDate <= reportDate;

    // Exclude if terminated before reporting date
    const termDate = row['Term Date'] ? excelDateToJSDate(row['Term Date']) : null;
    const notTerminated = !termDate || termDate > reportDate;

    return hired && notTerminated;
  });

  console.log(`✓ Filtered to ${active.length} active employees (from ${data.length} total)`);

  return active;
}

// ==================== AGGREGATION ====================

/**
 * Aggregate data into staticData.js format
 */
function aggregateData(data, quarter) {
  console.log('Aggregating data...');

  const reportDate = CONFIG.FISCAL_QUARTERS[quarter].reportDate;
  const reportDateFormatted = formatReportingDate(reportDate);

  // Category counts
  const faculty = data.filter(r => r.category === 'Faculty').length;
  const staff = data.filter(r => r.category === 'Benefit Staff').length;
  const hsp = data.filter(r => r.category === 'House Staff').length;
  const students = data.filter(r => r.category === 'Students').length;
  const nonBenefit = data.filter(r => r.category === 'Non-Benefit').length;

  // Location counts
  const omaha = data.filter(r => r.campus === 'Omaha Campus').length;
  const phoenix = data.filter(r => r.campus === 'Phoenix Campus').length;

  // Department aggregation (top 10)
  const departments = aggregateDepartments(data);

  // School/Org aggregation
  const schoolOrgData = aggregateSchools(data);

  // Assignment category breakdown
  const categories = aggregateCategories(data);

  const output = {
    reportingDate: reportDateFormatted,
    fiscalQuarter: quarter,
    totalEmployees: data.length,
    faculty,
    staff,
    hsp,
    students,
    temp: nonBenefit, // Match staticData.js naming
    locations: {
      "Omaha Campus": omaha,
      "Phoenix Campus": phoenix
    },
    categories,
    departments,
    schoolOrgData
  };

  console.log('✓ Aggregation complete');
  console.log(`  Total Employees: ${output.totalEmployees}`);
  console.log(`  Faculty: ${faculty}, Staff: ${staff}, HSP: ${hsp}`);

  return output;
}

/**
 * Format reporting date as "M/D/YY"
 */
function formatReportingDate(dateString) {
  const d = new Date(dateString);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = String(d.getFullYear()).substring(2);
  return `${month}/${day}/${year}`;
}

/**
 * Aggregate by department
 */
function aggregateDepartments(data) {
  const deptMap = {};

  data.forEach(row => {
    const dept = row.department || 'Unknown';

    if (!deptMap[dept]) {
      deptMap[dept] = { name: dept, total: 0, faculty: 0, staff: 0 };
    }

    deptMap[dept].total++;

    if (row.category === 'Faculty') {
      deptMap[dept].faculty++;
    } else if (row.category === 'Benefit Staff') {
      deptMap[dept].staff++;
    }
  });

  // Convert to array and sort by total (descending)
  const departments = Object.values(deptMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10 departments

  return departments;
}

/**
 * Aggregate by school/organization
 */
function aggregateSchools(data) {
  // This would map departments to schools based on HR org structure
  // Placeholder implementation - would need actual mapping
  const schoolMap = {
    'Arts & Sciences': [],
    'School of Medicine': [],
    'Pharmacy & Health Professions': [],
    // ... other schools
  };

  // TODO: Implement actual school mapping
  // For now, return empty array
  return [];
}

/**
 * Aggregate by assignment category code
 */
function aggregateCategories(data) {
  const categoryMap = {};

  data.forEach(row => {
    const code = row.assignmentCategory;
    if (code) {
      categoryMap[code] = (categoryMap[code] || 0) + 1;
    }
  });

  return categoryMap;
}

// ==================== VALIDATION ====================

/**
 * Validate cleaned data
 */
function validateData(data, aggregated) {
  console.log('Validating data...');

  const errors = [];
  const warnings = [];

  // Check required fields
  const requiredFields = ['category', 'campus', 'department'];
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });
  });

  // Check for unknown categories
  const unknownCategories = data.filter(r => r.category === 'Other' || r.category === null);
  if (unknownCategories.length > 0) {
    warnings.push(`${unknownCategories.length} records with unknown category`);
  }

  // Validate totals
  const totalCheck = aggregated.faculty + aggregated.staff + aggregated.hsp + aggregated.students + aggregated.temp;
  if (totalCheck !== aggregated.totalEmployees) {
    errors.push(`Total mismatch: ${totalCheck} (sum of categories) ≠ ${aggregated.totalEmployees} (total)`);
  }

  // Validate location totals
  const locationTotal = aggregated.locations["Omaha Campus"] + aggregated.locations["Phoenix Campus"];
  if (locationTotal !== aggregated.totalEmployees) {
    warnings.push(`Location total (${locationTotal}) doesn't match total employees (${aggregated.totalEmployees})`);
  }

  console.log(`✓ Validation complete: ${errors.length} errors, ${warnings.length} warnings`);

  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Data validation failed');
  }

  if (warnings.length > 0) {
    console.warn('Validation warnings:');
    warnings.forEach(warn => console.warn(`  ⚠ ${warn}`));
  }

  return { errors, warnings };
}

// ==================== AUDIT TRAIL ====================

/**
 * Generate audit trail markdown
 */
function generateAuditTrail(stats, outputPath) {
  const auditContent = `# Data Cleaning Audit Report

**Date:** ${new Date().toISOString()}
**Script:** scripts/clean-workforce-data.js
**Source File:** ${stats.sourceFile}
**Output File:** ${stats.outputFile}
**Fiscal Period:** ${stats.fiscalQuarter}

---

## Data Overview

| Metric | Value |
|--------|-------|
| Total Records Loaded | ${stats.totalLoaded} |
| Records After Filtering | ${stats.totalActive} |
| Records Removed | ${stats.totalLoaded - stats.totalActive} |
| Output Records | ${stats.totalActive} |
| Processing Time | ${stats.processingTime}s |

---

## Transformations Applied

### 1. PII Removal
**Fields Removed:**
${CONFIG.PII_FIELDS.map(f => `- ${f}`).join('\n')}

**Records Affected:** ${stats.totalActive} (100%)

### 2. Category Assignment
**Logic:** Person Type + Assignment Category Code → Employee Category

| Category | Count | % of Total |
|----------|-------|------------|
| Benefit Staff | ${stats.aggregated.staff} | ${((stats.aggregated.staff / stats.totalActive) * 100).toFixed(1)}% |
| Faculty | ${stats.aggregated.faculty} | ${((stats.aggregated.faculty / stats.totalActive) * 100).toFixed(1)}% |
| House Staff | ${stats.aggregated.hsp} | ${((stats.aggregated.hsp / stats.totalActive) * 100).toFixed(1)}% |
| Students | ${stats.aggregated.students} | ${((stats.aggregated.students / stats.totalActive) * 100).toFixed(1)}% |
| Non-Benefit | ${stats.aggregated.temp} | ${((stats.aggregated.temp / stats.totalActive) * 100).toFixed(1)}% |

### 3. Location Standardization
| Original | Standardized | Count |
|----------|-------------|--------|
| Omaha | Omaha Campus | ${stats.aggregated.locations["Omaha Campus"]} |
| Phoenix | Phoenix Campus | ${stats.aggregated.locations["Phoenix Campus"]} |

---

## Validation Results

${stats.validation.errors.length === 0 ? '✓ All validation checks passed' : '⚠ Validation errors found'}

${stats.validation.warnings.length > 0 ? '**Warnings:**\n' + stats.validation.warnings.map(w => `- ${w}`).join('\n') : ''}

---

## Next Steps

1. Review this audit file for accuracy
2. Compare totals to HR slide deck
3. Merge cleaned JSON to staticData.js:
   \`\`\`bash
   npm run merge:workforce ${stats.fiscalQuarter}
   \`\`\`
4. Commit cleaned data to git

---

## File Locations

- **Source Excel:** \`${stats.sourceFile}\` (gitignored)
- **Cleaned JSON:** \`${stats.outputFile}\` (committed)
- **Audit Report:** \`${outputPath}\` (committed)

---

*Generated by data-cleaning-pipeline v1.0.0*
`;

  fs.writeFileSync(outputPath, auditContent, 'utf8');
  console.log(`✓ Audit trail saved to: ${outputPath}`);
}

// ==================== MAIN ORCHESTRATION ====================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const quarterIndex = args.indexOf('--quarter') + 1 || args.indexOf('-q') + 1;
  const quarter = quarterIndex ? args[quarterIndex] : 'Q2'; // Default to Q2

  const inputIndex = args.indexOf('--input') + 1 || args.indexOf('-i') + 1;
  const inputFile = inputIndex ? args[inputIndex] : null;

  if (!inputFile) {
    console.error('Error: --input file is required');
    console.log('Usage: node scripts/clean-workforce-data.js --quarter FY25_Q2 --input workforce.xlsx');
    process.exit(1);
  }

  // Extract quarter (Q1, Q2, Q3, Q4)
  const quarterMatch = quarter.match(/Q(\d)/);
  const q = quarterMatch ? `Q${quarterMatch[1]}` : 'Q2';

  if (!CONFIG.FISCAL_QUARTERS[q]) {
    console.error(`Error: Invalid quarter: ${q}`);
    process.exit(1);
  }

  // Setup paths
  const inputPath = path.resolve(inputFile);
  const outputDir = path.join(__dirname, `../source-metrics/workforce/cleaned/${quarter}`);
  const outputFile = path.join(outputDir, 'workforce_cleaned.json');
  const auditFile = path.join(outputDir, 'DATA_CLEANING_AUDIT.md');

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  const startTime = Date.now();

  try {
    // 1. Load Excel
    const rawData = loadExcelFile(inputPath);

    // 2. Remove PII
    const anonymized = removePII(rawData);

    // 3. Transform
    const transformed = transformData(anonymized);

    // 4. Filter to active employees
    const reportingDate = CONFIG.FISCAL_QUARTERS[q].reportDate;
    const active = filterActiveEmployees(transformed, reportingDate);

    // 5. Aggregate
    const aggregated = aggregateData(active, q);

    // 6. Validate
    const validation = validateData(active, aggregated);

    // 7. Export JSON
    fs.writeFileSync(outputFile, JSON.stringify(aggregated, null, 2), 'utf8');
    console.log(`✓ Cleaned data saved to: ${outputFile}`);

    // 8. Generate audit trail
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = {
      sourceFile: inputPath,
      outputFile,
      fiscalQuarter: quarter,
      totalLoaded: rawData.length,
      totalActive: active.length,
      aggregated,
      validation,
      processingTime
    };

    generateAuditTrail(stats, auditFile);

    console.log('\n✅ Workforce data cleaning complete!');
    console.log(`📊 Total employees: ${aggregated.totalEmployees}`);
    console.log(`📁 Output: ${outputFile}`);
    console.log(`📝 Audit: ${auditFile}`);

  } catch (error) {
    console.error('\n❌ Error during data cleaning:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  loadExcelFile,
  removePII,
  transformData,
  aggregateData,
  validateData,
  generateAuditTrail
};
```

---

## Testing Strategy

### Unit Tests

**File:** `scripts/__tests__/clean-workforce-data.test.js`

```javascript
const {
  getEmployeeCategory,
  getCampus,
  hashEmployeeID,
  aggregateData
} = require('../clean-workforce-data');

describe('Workforce Data Cleaning', () => {
  describe('getEmployeeCategory', () => {
    test('assigns Faculty category correctly', () => {
      const row = {
        'Assignment Category Code': 'F12',
        'Person Type': 'FACULTY'
      };

      expect(getEmployeeCategory(row)).toBe('Faculty');
    });

    test('assigns House Staff category correctly', () => {
      const row = {
        'Assignment Category Code': 'HSR',
        'Person Type': 'STAFF'
      };

      expect(getEmployeeCategory(row)).toBe('House Staff');
    });

    test('assigns Students category correctly', () => {
      const row = {
        'Assignment Category Code': 'SUE',
        'Person Type': 'STUDENT'
      };

      expect(getEmployeeCategory(row)).toBe('Students');
    });
  });

  describe('getCampus', () => {
    test('standardizes Omaha location', () => {
      expect(getCampus('Omaha')).toBe('Omaha Campus');
      expect(getCampus('omaha campus')).toBe('Omaha Campus');
    });

    test('standardizes Phoenix location', () => {
      expect(getCampus('Phoenix')).toBe('Phoenix Campus');
      expect(getCampus('PHOENIX CAMPUS')).toBe('Phoenix Campus');
    });
  });

  describe('hashEmployeeID', () => {
    test('generates consistent hash', () => {
      const id = '123456';
      const hash1 = hashEmployeeID(id);
      const hash2 = hashEmployeeID(id);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(16);
    });

    test('generates unique hashes', () => {
      const hash1 = hashEmployeeID('123456');
      const hash2 = hashEmployeeID('654321');

      expect(hash1).not.toBe(hash2);
    });
  });
});
```

### Integration Tests

**File:** `scripts/__tests__/integration.test.js`

```javascript
const fs = require('fs');
const path = require('path');
const { main } = require('../clean-workforce-data');

describe('Workforce Data Cleaning Integration', () => {
  const testInputFile = path.join(__dirname, 'fixtures/test_workforce.xlsx');
  const testOutputDir = path.join(__dirname, 'tmp/workforce/cleaned/FY25_Q2');

  afterEach(() => {
    // Clean up test output
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  test('processes sample Excel file correctly', async () => {
    // Run cleaning script
    process.argv = [
      'node',
      'clean-workforce-data.js',
      '--quarter', 'FY25_Q2',
      '--input', testInputFile
    ];

    await main();

    // Verify output files exist
    const outputFile = path.join(testOutputDir, 'workforce_cleaned.json');
    const auditFile = path.join(testOutputDir, 'DATA_CLEANING_AUDIT.md');

    expect(fs.existsSync(outputFile)).toBe(true);
    expect(fs.existsSync(auditFile)).toBe(true);

    // Verify JSON structure
    const json = JSON.parse(fs.readFileSync(outputFile, 'utf8'));

    expect(json).toHaveProperty('reportingDate');
    expect(json).toHaveProperty('totalEmployees');
    expect(json).toHaveProperty('faculty');
    expect(json).toHaveProperty('staff');
    expect(json).toHaveProperty('locations');
    expect(json).toHaveProperty('departments');
  });
});
```

### End-to-End Testing

```bash
# Create test script
npm run test:e2e

# Tests full workflow:
# 1. Load sample Excel file
# 2. Clean and transform
# 3. Merge to staticData.js
# 4. Validate React app still works
# 5. Rollback changes
```

**File:** `scripts/__tests__/e2e.test.sh`

```bash
#!/bin/bash

set -e

echo "Running end-to-end data pipeline test..."

# 1. Backup current staticData.js
cp src/data/staticData.js src/data/staticData.js.backup

# 2. Run cleaning script with test data
node scripts/clean-workforce-data.js \
  --quarter FY25_Q2_TEST \
  --input scripts/__tests__/fixtures/test_workforce.xlsx

# 3. Merge to staticData.js
node scripts/merge-to-static-data.js workforce FY25_Q2_TEST

# 4. Run React tests
npm test -- --watchAll=false

# 5. Restore backup
mv src/data/staticData.js.backup src/data/staticData.js

echo "✅ End-to-end test passed!"
```

---

## Security & Compliance

### PII Protection Strategy

#### Level 1: Excel Files (Raw Data)
**Location:** OneDrive (NOT in git)
**Contains:** Full PII (names, SSN, email, etc.)
**Access:** HR staff only
**Retention:** Permanent archive

#### Level 2: Local Staging (Temporary)
**Location:** `source-metrics/*/raw/` (gitignored)
**Contains:** Full PII (temporary copy)
**Access:** Developer workstation only
**Retention:** Deleted after cleaning (or kept if needed)

#### Level 3: Cleaned JSON (Committed to Git)
**Location:** `source-metrics/*/cleaned/` (committed)
**Contains:** Anonymized data only
**PII Removed:**
- Employee names
- Employee IDs (replaced with hashes)
- SSN
- Email addresses
- Phone numbers
- Addresses
- Birth dates
- Emergency contacts

**Retained (Non-PII):**
- Department names
- Job titles
- Hire dates (month/year only)
- Termination dates (month/year only)
- Location (campus level only, not building/office)
- Assignment categories

### .gitignore Configuration

```gitignore
# === HR Reports JSON Data - Git Ignore ===

# RAW DATA - NEVER COMMIT (Contains PII)
source-metrics/*/raw/**/*
source-metrics/*/raw/**/*.xlsx
source-metrics/*/raw/**/*.xls
source-metrics/*/raw/**/*.csv

# CLEANED DATA - SAFE TO COMMIT (PII Removed)
!source-metrics/*/cleaned/**/*.json
!source-metrics/*/cleaned/**/*.md

# TEMPLATES - SAFE TO COMMIT (No real data)
!source-metrics/templates/**/*

# PII INDICATORS - NEVER COMMIT
*_pii.*
*_private.*
*_confidential.*
*_ssn.*
*_personal.*

# BACKUPS - MAY CONTAIN PII
*.backup
*.bak
*.tmp
*.old

# LOGS - MAY CONTAIN PII FROM ERRORS
logs/
*.log

# EXCEPTION: Allow audit logs (should not contain PII if scripts work correctly)
!source-metrics/*/cleaned/**/DATA_CLEANING_AUDIT.md
```

### Pre-Commit Hook

**File:** `.git/hooks/pre-commit`

```bash
#!/bin/bash

# Pre-commit hook: Block PII from being committed

echo "Checking for PII in staged files..."

# Check for raw data files
STAGED_RAW=$(git diff --cached --name-only | grep -E 'source-metrics/.*/raw/')

if [ ! -z "$STAGED_RAW" ]; then
  echo "❌ ERROR: Attempting to commit raw data files (may contain PII)"
  echo "Files:"
  echo "$STAGED_RAW"
  echo ""
  echo "Raw data should NEVER be committed to git."
  echo "Only commit cleaned JSON files from source-metrics/*/cleaned/"
  exit 1
fi

# Check for PII indicator filenames
STAGED_PII=$(git diff --cached --name-only | grep -E '_pii\.|_private\.|_confidential\.')

if [ ! -z "$STAGED_PII" ]; then
  echo "❌ ERROR: Attempting to commit files with PII indicators"
  echo "Files:"
  echo "$STAGED_PII"
  exit 1
fi

# Check for suspicious patterns in staged JSON files
STAGED_JSON=$(git diff --cached --name-only | grep '\.json$')

if [ ! -z "$STAGED_JSON" ]; then
  # Check for common PII patterns
  for file in $STAGED_JSON; do
    if git diff --cached $file | grep -qiE '(ssn|social.?security|employee.?id.*[0-9]{5,})'; then
      echo "⚠ WARNING: Possible PII detected in $file"
      echo "Please review manually before committing."
      read -p "Continue anyway? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
      fi
    fi
  done
fi

echo "✅ PII check passed"
exit 0
```

### WCAG Accessibility Compliance

Ensure all generated JSON data supports accessible visualizations:

- Include `aria-label` friendly keys
- Provide text alternatives for numeric data
- Support screen reader navigation patterns
- Follow WCAG 2.1 AA standards

---

## Summary

This data pipeline design provides:

✅ **Simplicity:** One command to import and clean data (`npm run data:import`)
✅ **Security:** Raw Excel files never committed, PII removed before git
✅ **Auditability:** Comprehensive markdown audit trails for every cleaning operation
✅ **Consistency:** Same business rules as Flask project, validated totals
✅ **Maintainability:** Modular Node.js scripts, well-documented, unit tested
✅ **Robustness:** Validation checks, error handling, rollback capability

### Recommended Next Steps

1. **Create scripts directory structure:**
   ```bash
   mkdir -p scripts/utils
   mkdir -p scripts/__tests__/fixtures
   ```

2. **Implement core cleaning script:**
   - Start with `scripts/clean-workforce-data.js` (example provided above)
   - Port Flask logic to Node.js
   - Add comprehensive comments

3. **Build CLI wrapper:**
   - Create `scripts/data-import.js` for unified interface
   - Support interactive wizard mode
   - Add helpful error messages

4. **Test with FY25 Q2 data:**
   - Run cleaning script on sample Excel file
   - Compare output to existing staticData.js values
   - Validate totals match HR slides

5. **Migrate existing FY25 data:**
   - Convert Flask CSV files to JSON format
   - Validate consistency
   - Merge into staticData.js

6. **Document workflow:**
   - Update README with import instructions
   - Create video walkthrough
   - Train HR staff on process

---

**Questions or Issues?**
Contact: Technical Architect Agent
Last Updated: November 14, 2025
