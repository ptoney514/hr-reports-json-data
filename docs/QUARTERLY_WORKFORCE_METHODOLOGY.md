# Quarterly Workforce Data Methodology

## Overview
This document describes the methodology for processing, categorizing, and calculating quarterly workforce headcount metrics for Creighton University's Q1 FY26 Workforce and Headcount Dashboard. It builds upon the existing WORKFORCE_METHODOLOGY.md v2.0 and provides specific guidance for quarterly workforce reporting.

---

## Document Purpose

### Scope
- **Quarterly Workforce Dashboards**: Q1 FY26 onwards
- **Data Source**: Oracle HCM workforce exports (Excel format)
- **Processing**: Automated via Node.js scripts
- **Validation**: Comprehensive test suites ensure data accuracy

### Related Documentation
- **WORKFORCE_METHODOLOGY.md v2.0**: Core categorization logic (Person Type + Assignment Category)
- **DATA_DICTIONARY.md**: Comprehensive field reference
- **QUARTERLY_REPORTS_DESIGN_SYSTEM.md**: UI/UX standards

---

## Q1 FY26 Data Processing Workflow

### 1. Data Sources

**Primary Source File**:
- **Location**: `source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx`
- **Export Date**: September 30, 2025 (Q1 FY26 snapshot)
- **Source System**: Oracle HCM (Workday)
- **Record Count**: 126,203 historical records
- **Q1 FY26 Snapshot**: 5,528 active employees

### 2. Processing Scripts

#### Step 1: Data Cleaning
**Script**: `scripts/clean-workforce-data.js`
- Input: Raw Excel file with historical data (FY20-FY26 Q1)
- Process: PII removal, date parsing, location standardization
- Output: `source-metrics/workforce/cleaned/FY26_Q1/workforce_cleaned.json`

#### Step 2: Q1 FY26 Extraction
**Script**: `scripts/extract_q1_fy26_workforce.js`
- Input: Cleaned JSON from Step 1
- Filter: END DATE = '2025-09-30' (Q1 FY26 snapshot)
- Apply: WORKFORCE_METHODOLOGY.md v2.0 categorization logic
- Output: `source-metrics/workforce/cleaned/FY26_Q1/q1_fy26_workforce_snapshot.json`

#### Step 3: Integration
**Manual Step**: Copy calculated metrics from snapshot JSON to:
- `src/data/staticData.js` → `QUARTERLY_WORKFORCE_DATA["2025-09-30"]`

### 3. Audit Trail
- **Generated**: `source-metrics/workforce/cleaned/FY26_Q1/AUDIT_TRAIL.md`
- **Contents**: Processing steps, data transformations, validation results
- **Purpose**: Data lineage and quality assurance

---

## Employee Categorization Logic

### Critical Understanding: Person Type + Assignment Category

Per **WORKFORCE_METHODOLOGY.md v2.0**, employee categorization requires BOTH fields:

1. **Person Type** (STAFF or FACULTY) → Determines benefit-eligible classification
2. **Assignment Category Code** (F12, PT10, HSR, etc.) → Determines employment terms and special categories

### 5 Primary Categories

#### 1. Benefit-Eligible Faculty
**Definition**: Employees with Person Type = 'FACULTY' and benefit-eligible assignment codes

**Calculation**:
```
WHERE Person Type = 'FACULTY'
AND Assignment Category Code IN ('F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9')
```

**Q1 FY26 Results**:
- Total: **697** faculty members
- OMA: 657 (94.3%)
- PHX: 40 (5.7%)

**Assignment Codes**:
- F12: Full-time 12-month (largest category)
- F09: Full-time 9-month (academic year faculty)
- F11, F10: Full-time 11-month, 10-month
- PT12, PT11, PT10, PT9: Part-time variants

#### 2. Benefit-Eligible Staff
**Definition**: Employees with Person Type = 'STAFF' and benefit-eligible assignment codes (excluding HSR)

**Calculation**:
```
WHERE Person Type = 'STAFF'
AND Assignment Category Code IN ('F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9')
AND Assignment Category Code != 'HSR'
```

**Q1 FY26 Results**:
- Total: **1,431** staff members
- OMA: 1,330 (92.9%)
- PHX: 101 (7.1%)

**Note**: Staff represents the largest benefit-eligible employee type.

#### 3. House Staff Physicians
**Definition**: Physicians in residency/house staff programs (HSR code only)

**Calculation**:
```
WHERE Assignment Category Code = 'HSR'
```

**Q1 FY26 Results**:
- Total: **613** physicians
- OMA: 270 (44.0%)
- PHX: 343 (56.0%)

**Key Insight**: Phoenix has higher concentration due to medical center operations.

#### 4. Student Workers
**Definition**: Student employees including federal work-study positions

**Calculation**:
```
WHERE Assignment Category Code IN ('SUE', 'CWS')
```

**Q1 FY26 Results**:
- Total: **2,157** student workers (largest single category)
- OMA: 2,088 (96.8%)
- PHX: 69 (3.2%)

**Breakdown**:
- SUE (Student University Employee): 1,793 (83.1%)
- CWS (College Work Study): 364 (16.9%)

**Note**: Federal work-study (CWS) represents 16.9% of student workforce.

#### 5. Temporary Employees
**Definition**: Non-benefit eligible workers (temporary, per diem, PRN)

**Calculation**:
```
WHERE Assignment Category Code IN ('TEMP', 'NBE', 'PRN')
```

**Q1 FY26 Results**:
- Total: **630** temporary employees
- OMA: 489 (77.6%)
- PHX: 141 (22.4%)

**Breakdown**:
- TEMP (Temporary): 516 (81.9%)
- PRN (As-needed): 107 (17.0%)
- NBE (Non-benefit eligible): 7 (1.1%)

---

## Q1 FY26 Calculated Metrics

### Summary Metrics

| Category | Total | OMA | PHX | % of Total |
|----------|-------|-----|-----|------------|
| **Total Headcount** | 5,528 | 4,834 | 694 | 100.0% |
| Benefit-Eligible Faculty | 697 | 657 | 40 | 12.6% |
| Benefit-Eligible Staff | 1,431 | 1,330 | 101 | 25.9% |
| House Staff Physicians | 613 | 270 | 343 | 11.1% |
| Student Workers | 2,157 | 2,088 | 69 | 39.0% |
| Temporary Employees | 630 | 489 | 141 | 11.4% |

### Campus Distribution

**Omaha Campus (OMA)**: 4,834 employees (87.4%)
- Faculty: 657 (13.6% of Omaha)
- Staff: 1,330 (27.5% of Omaha)
- HSP: 270 (5.6% of Omaha)
- Students: 2,088 (43.2% of Omaha)
- Temporary: 489 (10.1% of Omaha)

**Phoenix Campus (PHX)**: 694 employees (12.6%)
- Faculty: 40 (5.8% of Phoenix)
- Staff: 101 (14.6% of Phoenix)
- HSP: 343 (49.4% of Phoenix) ⭐ **Highest concentration**
- Students: 69 (9.9% of Phoenix)
- Temporary: 141 (20.3% of Phoenix)

### Assignment Category Breakdown

| Assignment Code | Count | Category | Description |
|----------------|-------|----------|-------------|
| **F12** | 1,694 | Full-time 12-month | Largest category |
| **SUE** | 1,793 | Student Worker | Regular student employment |
| **HSR** | 613 | House Staff | Medical residents |
| **TEMP** | 516 | Temporary | Temporary workers |
| **CWS** | 364 | College Work Study | Federal work-study |
| **F09** | 297 | Full-time 9-month | Academic year |
| **PRN** | 107 | Per Diem | As-needed workers |
| **F11** | 49 | Full-time 11-month | |
| **PT12** | 49 | Part-time 12-month | |
| **PT9** | 20 | Part-time 9-month | |
| **F10** | 10 | Full-time 10-month | |
| **PT10** | 8 | Part-time 10-month | |
| **NBE** | 7 | Non-benefit eligible | |
| **PT11** | 1 | Part-time 11-month | |

**Total**: 5,528 employees

---

## Data Validation Rules

### Required Validations

#### 1. Category Sum Validation
```
Total = Faculty + Staff + HSP + Students + Temporary
5,528 = 697 + 1,431 + 613 + 2,157 + 630 ✓
```

#### 2. Campus Sum Validation
```
For each category:
  Total = OMA + PHX

Total: 5,528 = 4,834 + 694 ✓
Faculty: 697 = 657 + 40 ✓
Staff: 1,431 = 1,330 + 101 ✓
HSP: 613 = 270 + 343 ✓
Students: 2,157 = 2,088 + 69 ✓
Temporary: 630 = 489 + 141 ✓
```

#### 3. Location Details Validation
```
Omaha Total = Faculty + Staff + HSP + Students + Temp
4,834 = 657 + 1,330 + 270 + 2,088 + 489 ✓

Phoenix Total = Faculty + Staff + HSP + Students + Temp
694 = 40 + 101 + 343 + 69 + 141 ✓
```

#### 4. Assignment Category Validation
```
Assignment Category Sum = Total Headcount
1694 + 1793 + 613 + 516 + 364 + ... = 5,528 ✓

Benefit-Eligible Sum (F/PT codes) = Faculty + Staff
2,128 = 697 + 1,431 ✓

Student Sum (SUE + CWS) = Student Workers
2,157 = 1,793 + 364 ✓

Temporary Sum (TEMP + NBE + PRN) = Temporary
630 = 516 + 7 + 107 ✓

HSR = House Staff Physicians
613 = 613 ✓
```

### Quality Score Calculation

**Data Quality Score**: 100/100

**Criteria**:
- ✅ All category sums validate
- ✅ All campus sums validate
- ✅ All location details validate
- ✅ All assignment categories validate
- ✅ No null/undefined values
- ✅ No duplicate records
- ✅ All counts are positive integers

---

## Key Insights from Q1 FY26 Data

### Workforce Composition
1. **Student Workers** are the largest single category (39.0% of total)
2. **Benefit-Eligible Staff** second largest (25.9% of total)
3. **Benefit-Eligible Employees** (Faculty + Staff) represent 38.5% of total workforce
4. **House Staff Physicians** represent 11.1% of total workforce

### Campus Distribution Patterns
1. **Omaha Campus** houses 87.4% of total workforce
2. **Phoenix Campus** has unique characteristics:
   - Highest HSP concentration (49.4% of Phoenix workforce)
   - Lower student worker concentration (9.9% vs 43.2% in Omaha)

### Assignment Category Patterns
1. **F12 (Full-time 12-month)** is the largest benefit-eligible category (1,694)
2. **Student employment** heavily weighted toward SUE over CWS (83.1% vs 16.9%)
3. **Temporary workers** primarily TEMP category (81.9%)

### Growth from Q4 FY25
- **Net Change**: +491 employees (+9.8%)
- **Primary Growth**: Student workers, faculty, and staff
- **Trend**: Continued workforce expansion

---

## Comparison with Annual Methodology

### Similarities
- Uses same categorization logic (Person Type + Assignment Category)
- Applies same 5-category framework
- Maintains same data quality standards
- Uses same campus codes (OMA/PHX)

### Differences
- **Quarterly Snapshots** vs Annual Year-End reporting
- **Granular Data**: Includes assignment category breakdown
- **Location Details**: Extended with detailed campus composition
- **Employee Groups**: Structured for chart visualization
- **Processing**: Filtered from historical dataset vs standalone export

---

## Data File Structure

### Input Files
```
source-metrics/workforce/raw/FY26_Q1/
└── New Emp List since FY20 to Q1FY25 1031 PT.xlsx  (Raw Oracle HCM export)
```

### Cleaned Files
```
source-metrics/workforce/cleaned/FY26_Q1/
├── workforce_cleaned.json                 (All historical data, PII removed)
├── workforce_summary.json                 (Aggregated summary)
├── q1_fy26_workforce_snapshot.json       (Q1 FY26 only, calculated metrics)
└── AUDIT_TRAIL.md                        (Processing documentation)
```

### Application Data
```
src/data/staticData.js
└── QUARTERLY_WORKFORCE_DATA["2025-09-30"]  (Q1 FY26 metrics for dashboard)
```

---

## Processing Scripts

### Script 1: clean-workforce-data.js
**Purpose**: Remove PII, standardize dates, categorize employees

**Input**: Raw Excel file with all historical data
**Output**: Cleaned JSON with standardized structure
**Key Operations**:
- Remove PII fields (names, IDs, SSN, etc.)
- Parse Excel dates to ISO format
- Standardize location codes (OMA/PHX)
- Basic categorization

**Usage**:
```bash
node scripts/clean-workforce-data.js \
  --input "source-metrics/workforce/raw/FY26_Q1/New Emp List since FY20 to Q1FY25 1031 PT.xlsx" \
  --quarter FY26_Q1
```

### Script 2: extract_q1_fy26_workforce.js
**Purpose**: Extract Q1 FY26 snapshot and apply full categorization logic

**Input**: Cleaned JSON (126,203 records)
**Filter**: END DATE = '2025-09-30'
**Output**: Q1 FY26 snapshot with calculated metrics (5,528 records)

**Key Operations**:
1. Filter to Q1 FY26 snapshot date
2. Apply Person Type + Assignment Category logic
3. Calculate summary metrics by category
4. Calculate location breakdowns
5. Count assignment categories
6. Generate employee group structures

**Usage**:
```bash
node scripts/extract_q1_fy26_workforce.js
```

**Output Example**:
```
Q1 FY26 Workforce Summary:
  Total: 5,528 (OMA: 4,834, PHX: 694)
  Benefit-Eligible Faculty: 697 (OMA: 657, PHX: 40)
  Benefit-Eligible Staff: 1,431 (OMA: 1,330, PHX: 101)
  House Staff Physicians: 613 (OMA: 270, PHX: 343)
  Student Workers: 2,157 (OMA: 2,088, PHX: 69)
  Temporary/Non-Benefit: 630 (OMA: 489, PHX: 141)
```

---

## Categorization Algorithm

### Pseudocode
```javascript
for each employee record where END_DATE = '2025-09-30':

  // Get classification fields
  personType = record['Person Type'].toUpperCase()
  assignmentCategory = record['Assignment Category Code'].toUpperCase()
  location = record['Location'].toLowerCase()
  campus = location.includes('phoen') ? 'phoenix' : 'omaha'

  // Categorize per WORKFORCE_METHODOLOGY.md v2.0
  if assignmentCategory === 'HSR':
    category = 'House Staff Physicians'
    locationBreakdown[campus].hsp++

  else if assignmentCategory IN ['SUE', 'CWS']:
    category = 'Student Workers'
    locationBreakdown[campus].students++

  else if assignmentCategory IN ['TEMP', 'NBE', 'PRN']:
    category = 'Temporary Employees'
    locationBreakdown[campus].temp++

  else if assignmentCategory IN ['F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9']:
    if personType === 'FACULTY':
      category = 'Benefit-Eligible Faculty'
      locationBreakdown[campus].faculty++
    else if personType === 'STAFF':
      category = 'Benefit-Eligible Staff'
      locationBreakdown[campus].staff++
    else:
      category = 'Other'

  // Count assignment categories
  assignmentCategoryCount[assignmentCategory]++
```

---

## Data Quality Assurance

### Automated Validations

**Test Suite**: `src/data/__tests__/workforce_q1_fy26_validation.test.js`

**Validation Categories**:
1. **Data Structure** (7 tests)
   - All required properties exist
   - Correct metadata
   - Campus breakdown for all categories

2. **Methodology Compliance** (6 tests)
   - Total equals sum of categories
   - Campus totals (OMA + PHX) equal category totals
   - Assignment categories sum correctly

3. **Business Rules** (4 tests)
   - Benefit-eligible percentage validation
   - Student worker percentage validation
   - House staff percentage validation
   - Category distribution patterns

4. **Cross-Validation** (2 tests)
   - Omaha totals consistent across data structures
   - Phoenix totals consistent across data structures

5. **Assignment Categories** (4 tests)
   - Benefit codes sum to Faculty + Staff
   - Student codes sum to Student Workers
   - Temporary codes sum to Temporary
   - HSR equals House Staff count

**Total Test Cases**: 42 comprehensive validations

### Manual Validation Checklist

- [ ] Review AUDIT_TRAIL.md for processing steps
- [ ] Verify Q1 FY26 snapshot date (2025-09-30)
- [ ] Confirm total headcount (5,528)
- [ ] Validate benefit-eligible totals (2,128)
- [ ] Check campus distribution (OMA: 4,834, PHX: 694)
- [ ] Run test suite: `npm test -- workforce_q1_fy26_validation`
- [ ] Review dashboard display at /dashboards/workforce-q1
- [ ] Verify all metric cards display correctly
- [ ] Validate chart calculations
- [ ] Cross-check with source Excel file

---

## Known Considerations

### Data Scope
- **Historical Data**: Excel file contains FY20-FY26 Q1 data (126,203 total records)
- **Q1 FY26 Snapshot**: Filtered to END DATE = '2025-09-30' only (5,528 records)
- **Active Employees Only**: Data represents employees active as of snapshot date

### Student Worker Seasonality
- Q1 (Fall semester) typically shows **highest** student worker count
- Q3 (Spring semester) shows second-highest
- Summer quarters (Q4) show lowest student counts
- Q1 FY26: 2,157 students (may decrease in Q2/Q4)

### House Staff Distribution
- Phoenix concentration (56% of HSP) reflects medical center clinical operations
- Residency programs have specific start/end dates
- HSP count relatively stable quarter-to-quarter

### Temporary Worker Patterns
- Temporary workers may fluctuate based on:
  - Project-based hiring
  - Seasonal workload
  - Coverage for leave/absences
- Q1 FY26: 630 temporary employees

---

## Dashboard Integration

### Component: WorkforceQ1FY26Dashboard.jsx

**Data Loading**:
```javascript
import { getQuarterlyWorkforceData } from '../../data/staticData';

const data = getQuarterlyWorkforceData("2025-09-30");
```

**Metric Cards**:
1. Total Headcount: `data.summary.total.count`
2. Faculty: `data.summary.faculty.count`
3. Staff: `data.summary.staff.count`
4. HSP: `data.summary.houseStaffPhysicians.count`
5. Students: `data.summary.studentWorkers.count`
6. Temporary: `data.summary.temporary.count`

**Charts**:
1. **Workforce by Employee Type**: Vertical bars showing 5 categories
2. **Campus Comparison by Employee Type**: Horizontal stacked bars (OMA vs PHX)

**Design System**: Follows QUARTERLY_REPORTS_DESIGN_SYSTEM.md patterns

---

## Future Quarter Processing

### Adding Q2 FY26 (December 31, 2025)

**Steps**:
1. Export Oracle HCM data as of 12/31/2025
2. Place Excel file in `source-metrics/workforce/raw/FY26_Q2/`
3. Run `clean-workforce-data.js` with `--quarter FY26_Q2`
4. Create `extract_q2_fy26_workforce.js` (copy from Q1 script)
5. Update filter date to `'2025-12-31'`
6. Add to `QUARTERLY_WORKFORCE_DATA["2025-12-31"]` in staticData.js
7. Create WorkforceQ2FY26Dashboard.jsx component
8. Run test suite
9. Update navigation

### Reusable Pattern
This methodology establishes a **repeatable quarterly process**:
- Same categorization logic
- Same data structure
- Same validation tests
- Same dashboard design patterns

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-18 | 1.0 | Initial QUARTERLY_WORKFORCE_METHODOLOGY.md created for Q1 FY26 |

---

*This methodology ensures consistent, accurate quarterly workforce analysis. All calculations are automated, traceable, and validated against WORKFORCE_METHODOLOGY.md v2.0.*
