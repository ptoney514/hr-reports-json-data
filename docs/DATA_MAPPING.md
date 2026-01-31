# Workforce Data Mapping

> **Living Document** - Traces complete data lineage from Excel source → Neon DB → API → React Screen

## Overview

This document captures the exact data flow for each metric displayed on the Workforce Dashboard. It serves as:
- Reference for debugging data discrepancies
- Documentation for quarterly data refresh procedures
- Guide for extending the data pipeline to new metrics

**Last Updated:** 2026-01-31 (Added Demographics section)
**Primary Methodology:** `source-metrics/workforce/WORKFORCE_METHODOLOGY.md`
**Test Manifest:** `src/data/manifests/workforce-expected-values.json`

---

## Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Excel Source   │ --> │    Neon DB      │ --> │   REST API      │ --> │  React Screen   │
│  (HR Export)    │     │ (Postgres)      │     │  (Vercel)       │     │  (Dashboard)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
     ↓                        ↓                       ↓                       ↓
  Raw HR Data          Transformed &            JSON Response         Visual Display
  Quarterly Export     Aggregated Data          Formatted Data        with Formatting
```

---

## Fiscal Calendar Calculation

### Fiscal Year Definition

Creighton University uses a **July 1 - June 30** fiscal year:

| Term | Definition | Example |
|------|------------|---------|
| **Fiscal Year** | July 1 to June 30 | FY25 = July 1, 2024 → June 30, 2025 |
| **FY Format** | "FY" + last 2 digits of ending calendar year | 2025 ending year → FY25 |

### Fiscal Quarter Mapping

| Quarter | Calendar Months | Standard Snapshot Date | Description |
|---------|-----------------|------------------------|-------------|
| **Q1** | July - September | September 30 | Fiscal Year Start |
| **Q2** | October - December | December 31 | Calendar Year End |
| **Q3** | January - March | March 31 | Mid-Fiscal Year |
| **Q4** | April - June | June 30 | **Fiscal Year-End** |

### Fiscal Year Calculation Logic

**From Excel `END DATE` field:**

```
IF month(END DATE) >= 7 (July or later):
    Fiscal Year = calendar_year + 1
ELSE:
    Fiscal Year = calendar_year

Quarter = CASE
    WHEN month IN (7, 8, 9)   THEN Q1
    WHEN month IN (10, 11, 12) THEN Q2
    WHEN month IN (1, 2, 3)   THEN Q3
    WHEN month IN (4, 5, 6)   THEN Q4
END
```

### Calculation Examples

| END DATE (Excel) | Calendar Month | Fiscal Year | Quarter | Label |
|------------------|----------------|-------------|---------|-------|
| 2024-09-30 | September (7-9) | 2024 + 1 = FY25 | Q1 | FY25 Q1 |
| 2024-12-31 | December (10-12) | 2024 + 1 = FY25 | Q2 | FY25 Q2 |
| 2025-03-31 | March (1-3) | 2025 = FY25 | Q3 | FY25 Q3 |
| 2025-06-30 | June (4-6) | 2025 = FY25 | Q4 | **FY25 Q4** |
| 2025-09-30 | September (7-9) | 2025 + 1 = FY26 | Q1 | FY26 Q1 |

### Key Excel Field for Fiscal Period

| Excel Column | Purpose | Format | Notes |
|--------------|---------|--------|-------|
| **END DATE** | Snapshot date | YYYY-MM-DD | Primary field for fiscal period calculation |

### Neon Database: `dim_fiscal_periods`

```sql
CREATE TABLE dim_fiscal_periods (
    period_date DATE PRIMARY KEY,        -- e.g., 2025-06-30
    fiscal_year INTEGER NOT NULL,        -- e.g., 2025 (for FY25)
    fiscal_quarter INTEGER NOT NULL,     -- 1, 2, 3, or 4
    quarter_start DATE NOT NULL,         -- e.g., 2025-04-01
    quarter_end DATE NOT NULL,           -- e.g., 2025-06-30
    quarter_label VARCHAR(10) NOT NULL,  -- e.g., "FY25_Q4"
    is_quarter_end BOOLEAN DEFAULT false,
    is_year_end BOOLEAN DEFAULT false    -- true for Q4 (June 30)
);
```

### Available Historical Periods

| Fiscal Year | Quarters Available | Notes |
|-------------|-------------------|-------|
| FY23 | Q3, Q4 | Partial year |
| FY24 | Q1, Q2, Q3, Q4 | Complete year |
| FY25 | Q1, Q2, Q3, Q4 | Complete year (current) |
| FY26 | Q1 | Current quarter |

---

## Excel Source Schema

### Source File Information

| Attribute | Value |
|-----------|-------|
| **File Name** | `New Emp List since FY20 to Q1FY25 1031 PT.xlsx` |
| **Location** | `source-metrics/workforce-headcount/` |
| **Export Source** | HR System (Workday/Oracle HCM) |
| **Update Frequency** | Quarterly snapshots |
| **Data Scope** | All active employees as of snapshot date |

### Core Excel Columns

#### Employee Identification

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| **Empl num** | Number | Unique employee identifier (Primary Key) | 123456 |
| **Net ID** | Text | Network login ID | jsmith |
| **Last Name** | Text | Employee last name | Smith |
| **First Name** | Text | Employee first name | John |

#### Classification Fields (Critical for Categorization)

| Column Name | Data Type | Description | Values | Critical Notes |
|-------------|-----------|-------------|--------|----------------|
| **Person Type** | Text | Employee classification | STAFF, FACULTY | **PRIMARY** determinant for Staff vs Faculty |
| **Assignment Category Code** | Text | Employment terms code | F12, PT10, HSR, SUE, TEMP | Indicates employment **TERMS**, not employee type |
| **Grade Code** | Text | Employee grade/level | R, etc. | Used to identify Residents/Fellows |
| **Benefit Eligible** | Text | Benefits eligibility flag | Yes, No | Calculated from Assignment Category |

#### Temporal Fields

| Column Name | Data Type | Description | Format |
|-------------|-----------|-------------|--------|
| **END DATE** | Date | **Snapshot date** (key field for fiscal period) | YYYY-MM-DD |
| **Current Hire Date** | Date | Most recent hire date | YYYY-MM-DD |

#### Location Fields

| Column Name | Data Type | Description | Values |
|-------------|-----------|-------------|--------|
| **Location** | Text | Campus location | Omaha, Phoenix |
| **Campus** | Text | Standardized campus code | OMA, PHX |
| **State** | Text | Employee state | NE, AZ |

#### Organizational Fields

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| **Job Name** | Text | Job title | Associate Professor |
| **Organization Name** | Text | Department/organization | School of Medicine |
| **Dept Num** | Number | Department number | 12345 |
| **New VP** | Text | Vice President area | VPSL, VPEM, VPFN |
| **New School** | Text | School affiliation | Medicine, Arts & Sciences |

#### Demographic Fields

| Column Name | Data Type | Description | Values |
|-------------|-----------|-------------|--------|
| **Gender** | Text | Employee gender | M, F |
| **Employee Ethnicity** | Text | Employee ethnicity | Various |
| **Age** | Number | Employee age in years | As of snapshot |
| **Age Band** | Text | Age range grouping | 20-29, 30-39, etc. |

#### Tenure Fields

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| **LOS** | Number | Length of Service (years) |
| **LOS Band** | Text | Length of service range (0-1 years, 1-3 years, etc.) |

### Assignment Category Codes (Critical Reference)

**IMPORTANT**: Assignment Category Codes indicate employment **TERMS** (duration/time commitment), **NOT** employee type.

#### Benefit-Eligible Codes (F/PT = Full-time/Part-time TERMS)

| Code | Description | Meaning |
|------|-------------|---------|
| **F12** | Full-time 12-month | Works 12 months/year, full-time |
| **F11** | Full-time 11-month | Works 11 months/year, full-time |
| **F10** | Full-time 10-month | Works 10 months/year, full-time |
| **F09** | Full-time 9-month | Works 9 months/year, full-time |
| **PT12** | Part-time 12-month | Works 12 months/year, part-time |
| **PT11** | Part-time 11-month | Works 11 months/year, part-time |
| **PT10** | Part-time 10-month | Works 10 months/year, part-time |
| **PT9** | Part-time 9-month | Works 9 months/year, part-time |

> **Note**: F/PT codes can be used for **both** STAFF and FACULTY. The `Person Type` field determines the actual classification.

#### Special Category Codes

| Code | Description | Category | Benefit Eligible |
|------|-------------|----------|------------------|
| **HSR** | House Staff Residents/Physicians | HSP | Yes |
| **SUE** | Student University Employee | Student | No |
| **CWS** | College Work Study | Student | No |
| **TEMP** | Temporary Worker | Temp | No |
| **NBE** | Non-Benefit Eligible | Temp | No |
| **PRN** | As-Needed/Per Diem | Temp | No |

### Data Quality Rules

| Rule | Description |
|------|-------------|
| **No Duplicates** | Unique Employee ID per snapshot date |
| **Valid Assignment Code** | All records must have valid Assignment Category Code |
| **Valid Dates** | All dates within expected ranges |
| **Category Sum** | Total headcount = Sum of all categories |

### Excel → Neon Field Mapping

| Excel Column | Neon Table | Neon Column |
|--------------|------------|-------------|
| END DATE | dim_fiscal_periods | period_date |
| Person Type | fact_workforce_snapshots | (used in category calc) |
| Assignment Category Code | dim_assignment_categories | category_code |
| Location | fact_workforce_snapshots | location |
| Empl num | (used for deduplication) | - |

---

## 1. Summary Card Metrics (6 metrics) ✅ VALIDATED

These 6 metrics appear as the primary summary cards on the Workforce Dashboard.

### 1.1 Benefit Eligible Staff

| Layer | Details |
|-------|---------|
| **Excel Source** | Column: `Person Type`, `Benefit Eligible`, `Assignment Category Code` |
| **Calculation** | `WHERE Person Type = 'STAFF' AND Benefit Eligible = 'Yes' AND Assignment Category != 'HSR'` |
| **Neon Table** | `fact_workforce_snapshots.staff_count` |
| **Neon View** | `v_workforce_summary.staff` |
| **API Response** | `response.staff` (Number) |
| **React Path** | `data.staff` in WorkforceDashboard.jsx |
| **FY25 Q4 Value** | **1,448** |

### 1.2 Benefit Eligible Faculty

| Layer | Details |
|-------|---------|
| **Excel Source** | Column: `Person Type`, `Benefit Eligible` |
| **Calculation** | `WHERE Person Type = 'FACULTY' AND Benefit Eligible = 'Yes'` |
| **Neon Table** | `fact_workforce_snapshots.faculty_count` |
| **Neon View** | `v_workforce_summary.faculty` |
| **API Response** | `response.faculty` (Number) |
| **React Path** | `data.faculty` in WorkforceDashboard.jsx |
| **FY25 Q4 Value** | **689** |

### 1.3 Benefit Eligible HSP (House Staff Physicians)

| Layer | Details |
|-------|---------|
| **Excel Source** | Column: `Assignment Category Code`, `Grade Code` |
| **Calculation** | `WHERE Assignment Category = 'HSR' OR Grade Code = 'R'` |
| **Neon Table** | `fact_workforce_snapshots.hsp_count` |
| **Neon View** | `v_workforce_summary.hsp` |
| **API Response** | `response.hsp` (Number) |
| **React Path** | `data.hsp` in WorkforceDashboard.jsx |
| **FY25 Q4 Value** | **612** |

### 1.4 Student Workers

| Layer | Details |
|-------|---------|
| **Excel Source** | Column: `Assignment Category Code` |
| **Calculation** | `WHERE Assignment Category IN ('SUE', 'CWS')` |
| **Neon Table** | `fact_workforce_snapshots.student_count` |
| **Neon View** | `v_workforce_summary.students` |
| **API Response** | `response.students` (Number) |
| **React Path** | `data.studentCount.total` in WorkforceDashboard.jsx |
| **FY25 Q4 Value** | **1,714** |

### 1.5 Non-Benefit Eligible (Temp)

| Layer | Details |
|-------|---------|
| **Excel Source** | Column: `Assignment Category Code` |
| **Calculation** | `WHERE Assignment Category IN ('TEMP', 'NBE', 'PRN')` |
| **Neon Table** | `fact_workforce_snapshots.temp_count` |
| **Neon View** | `v_workforce_summary.temp` |
| **API Response** | `response.temp` (Number) |
| **React Path** | `data.temp` or `getTempTotal()` in WorkforceDashboard.jsx |
| **FY25 Q4 Value** | **574** |

### 1.6 Total Workforce

| Layer | Details |
|-------|---------|
| **Excel Source** | All rows after deduplication |
| **Calculation** | `SUM(staff + faculty + hsp + students + temp)` |
| **Neon Table** | `SUM(fact_workforce_snapshots.headcount)` |
| **Neon View** | `v_workforce_summary.total_employees` |
| **API Response** | `response.totalEmployees` (Number) |
| **React Path** | `data.totalEmployees` in WorkforceDashboard.jsx |
| **FY25 Q4 Value** | **5,037** |

### Summary Card Cross-Check

```
Staff (1,448) + Faculty (689) + HSP (612) + Students (1,714) + Temp (574) = Total (5,037) ✓
```

---

## 2. Location Details (12 metrics) ✅ VALIDATED

Location metrics break down workforce by campus (Omaha vs Phoenix) and employee category.

### 2.1 Excel Source - Location Detection

| Column | Logic |
|--------|-------|
| `Location` or `State` | Contains "phoenix" (case-insensitive) → Phoenix; otherwise → Omaha |

### 2.2 Neon Database Schema

**Table:** `fact_workforce_snapshots`
```sql
location       VARCHAR(20)  -- 'omaha' or 'phoenix'
faculty_count  INTEGER      -- Faculty headcount at location
staff_count    INTEGER      -- Staff headcount at location
hsp_count      INTEGER      -- HSP headcount at location
student_count  INTEGER      -- Student headcount at location
temp_count     INTEGER      -- Temp headcount at location
headcount      INTEGER      -- Total headcount at location
```

**View:** `v_workforce_summary`
```sql
-- Location totals
omaha_total, phoenix_total

-- Omaha breakdown
omaha_faculty, omaha_staff, omaha_hsp, omaha_students

-- Phoenix breakdown
phoenix_faculty, phoenix_staff, phoenix_hsp, phoenix_students

-- NOTE: omaha_temp and phoenix_temp are NOT in the view
-- These are calculated by the API layer
```

### 2.3 API Response Structure

**Endpoint:** `GET /api/workforce/:date`

**Files:** `server/api-dev.js` (local), `api/workforce/[date].js` (Vercel)

**API Calculation for Temp:**
The Neon view does not include per-location temp counts. The API calculates these:
```javascript
// Temp = Total - (Faculty + Staff + HSP + Students)
omahaTemp = omahaTotal - (omahaFaculty + omahaStaff + omahaHsp + omahaStudents)
phoenixTemp = phoenixTotal - (phoenixFaculty + phoenixStaff + phoenixHsp + phoenixStudents)
```

```javascript
{
  locations: {
    "Omaha Campus": 4287,
    "Phoenix Campus": 750
  },
  locationDetails: {
    omaha: {
      faculty: 649,
      staff: 1344,
      hsp: 268,
      students: 1604,
      temp: 422,
      total: 4287
    },
    phoenix: {
      faculty: 40,
      staff: 104,
      hsp: 344,
      students: 110,
      temp: 152,
      total: 750
    }
  }
}
```

### 2.4 React Component Usage

**File:** `src/components/dashboards/WorkforceDashboard.jsx`

```javascript
// Location totals
data.locations['Omaha Campus']   // 4287
data.locations['Phoenix Campus'] // 750

// Location breakdown (used in getLocationCounts helper)
data.locationDetails.omaha.faculty    // 649
data.locationDetails.phoenix.faculty  // 40

// Display format: "OMA (649) | PHX (40)"
getLocationCounts('faculty') // Returns formatted string
```

### 2.5 Omaha Campus Expected Values (FY25 Q4)

| Metric | Value | JSON Path | Calculation |
|--------|-------|-----------|-------------|
| Total | **4,287** | `locations["Omaha Campus"]` | Sum of all Omaha employees |
| Faculty | **649** | `locationDetails.omaha.faculty` | Person Type='FACULTY', Location='Omaha' |
| Staff | **1,344** | `locationDetails.omaha.staff` | Person Type='STAFF', Location='Omaha' |
| HSP | **268** | `locationDetails.omaha.hsp` | Assignment Category='HSR', Location='Omaha' |
| Students | **1,604** | `locationDetails.omaha.students` | Category IN('SUE','CWS'), Location='Omaha' |
| Temp | **422** | `locationDetails.omaha.temp` | Category IN('TEMP','NBE','PRN'), Location='Omaha' |

### 2.6 Phoenix Campus Expected Values (FY25 Q4)

| Metric | Value | JSON Path | Calculation |
|--------|-------|-----------|-------------|
| Total | **750** | `locations["Phoenix Campus"]` | Sum of all Phoenix employees |
| Faculty | **40** | `locationDetails.phoenix.faculty` | Person Type='FACULTY', Location='Phoenix' |
| Staff | **104** | `locationDetails.phoenix.staff` | Person Type='STAFF', Location='Phoenix' |
| HSP | **344** | `locationDetails.phoenix.hsp` | Assignment Category='HSR', Location='Phoenix' |
| Students | **110** | `locationDetails.phoenix.students` | Category IN('SUE','CWS'), Location='Phoenix' |
| Temp | **152** | `locationDetails.phoenix.temp` | Category IN('TEMP','NBE','PRN'), Location='Phoenix' |

### 2.7 Location Cross-Check Validations

```
Omaha Category Sum:
  649 + 1,344 + 268 + 1,604 + 422 = 4,287 ✓

Phoenix Category Sum:
  40 + 104 + 344 + 110 + 152 = 750 ✓

Campus Total:
  4,287 + 750 = 5,037 ✓ (matches totalEmployees)
```

### 2.8 Business Rule: HSP Concentration

Phoenix has a higher HSP concentration than Omaha due to medical center operations:
- Phoenix HSP: 344 (45.9% of Phoenix)
- Omaha HSP: 268 (6.3% of Omaha)

---

## 3. Demographics (52 metrics) ✅ VALIDATED

Demographics data covers **benefit-eligible** Faculty and Staff only, broken down by gender, ethnicity, and age bands.

### 3.1 Data Flow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Excel Source   │ --> │   ETL Script    │ --> │   Neon DB       │ --> │   REST API      │
│  (HR Export)    │     │ demographics-   │     │ fact_workforce_ │     │ /demographics/  │
│                 │     │ to-postgres.js  │     │ demographics    │     │ :date           │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
     ↓                        ↓                       ↓                       ↓
  Raw HR Data           Filter & Aggregate       Stored with %           JSON Response
  All Employees         Benefit-eligible only    Per-category calcs      staticData format
```

### 3.2 Excel Source Columns

| Column Name | Data Type | Purpose | Example Values |
|-------------|-----------|---------|----------------|
| **Gender** | Text | Gender classification | M, F |
| **Employee Ethnicity** | Text | Ethnicity category | White, Black or African American, Asian, Hispanic or Latino |
| **Age Band** | Text | Age range grouping | 20-30, 31-40, 41-50, 51-60, 61 Plus |
| **Assignment Category Code** | Text | Employment terms (filters benefit-eligible) | F12, PT10, HSR, SUE, TEMP |
| **Person Type** | Text | Employee classification | STAFF, FACULTY |
| **Location** | Text | Campus location | Omaha, Phoenix |

### 3.3 Benefit-Eligible Filter

**Only benefit-eligible employees are included in demographics.** The ETL applies this filter:

```javascript
const BENEFIT_ELIGIBLE_CATEGORIES = ['F12', 'F11', 'F09', 'F10', 'PT12', 'PT10', 'PT9', 'PT11'];

function isBenefitEligible(assignmentCategory) {
  return BENEFIT_ELIGIBLE_CATEGORIES.includes(assignmentCategory);
}
```

**Excluded from Demographics:**
| Code | Description | Reason Excluded |
|------|-------------|-----------------|
| HSR | House Staff Residents | Not standard faculty/staff |
| SUE | Student Employment | Students |
| CWS | College Work Study | Students |
| TEMP | Temporary | Non-benefit eligible |
| NBE | Non-Benefit Eligible | By definition |
| PRN | As Needed | Non-benefit eligible |

### 3.4 Transformation Rules

#### Person Type Mapping
```javascript
function getPersonType(row) {
  const personType = row['Person Type'] || '';
  return personType.toUpperCase() === 'FACULTY' ? 'faculty' : 'staff';
}
```

#### Location Detection
```javascript
function getLocation(row) {
  const location = row.Location || row.State || '';
  return location.toLowerCase().includes('phoenix') ? 'phoenix' : 'omaha';
}
```

#### Ethnicity Normalization
The ETL normalizes ethnicity values for consistency with staticData.js:

```javascript
const ETHNICITY_NORMALIZATION = {
  'i am hispanic or latino.': 'Hispanic or Latino'
};

function normalizeEthnicity(ethnicity) {
  if (!ethnicity) return 'Not Disclosed';
  const trimmed = ethnicity.trim();
  return ETHNICITY_NORMALIZATION[trimmed.toLowerCase()] || trimmed;
}
```

### 3.5 Aggregation Logic

The ETL aggregates demographic counts by:
- **Period Date** (snapshot date, e.g., 2025-06-30)
- **Location** (omaha, phoenix, combined)
- **Category Type** (faculty, staff)
- **Demographic Type** (gender, ethnicity, age_band)
- **Demographic Value** (e.g., M, F, White, 31-40)

**Example Aggregation Key:** `combined|faculty|gender|M` → 321 (FY25 Q4)

### 3.6 Percentage Calculation

Percentages are calculated **within each category group**:

```javascript
function calculatePercentages(aggregations) {
  // Group totals by location, category, and demographic type
  const totals = {};
  aggregations.forEach(agg => {
    const key = `${agg.location}|${agg.categoryType}|${agg.demographicType}`;
    totals[key] = (totals[key] || 0) + agg.count;
  });

  return aggregations.map(agg => {
    const key = `${agg.location}|${agg.categoryType}|${agg.demographicType}`;
    const total = totals[key];
    const percentage = total > 0 ? Math.round((agg.count / total) * 10000) / 100 : 0;
    return { ...agg, percentage };
  });
}
```

**Example:**
- Faculty Male: 321 / 689 = 46.59%
- Faculty Female: 368 / 689 = 53.41%

### 3.7 Database Schema

**Table:** `fact_workforce_demographics`

```sql
CREATE TABLE fact_workforce_demographics (
    demo_id SERIAL PRIMARY KEY,
    period_date DATE NOT NULL,                           -- e.g., 2025-06-30
    location VARCHAR(20) NOT NULL,                       -- 'omaha', 'phoenix', 'combined'
    category_type VARCHAR(20) NOT NULL,                  -- 'faculty', 'staff'
    demographic_type VARCHAR(20) NOT NULL,               -- 'gender', 'ethnicity', 'age_band'
    demographic_value VARCHAR(100) NOT NULL,             -- e.g., 'M', 'White', '31-40'
    count INTEGER NOT NULL DEFAULT 0,                    -- Headcount
    percentage NUMERIC(5,2),                             -- e.g., 46.59
    source_file VARCHAR(255),                            -- Audit: source Excel file
    loaded_at TIMESTAMPTZ DEFAULT NOW(),                 -- Audit: load timestamp
    CONSTRAINT uq_workforce_demo UNIQUE (
      period_date, location, category_type, demographic_type, demographic_value
    )
);
```

**Indexes:**
- `idx_fact_demo_period` - Query by date
- `idx_fact_demo_type` - Query by demographic type
- `idx_fact_demo_category` - Query by faculty/staff
- `idx_fact_demo_location` - Query by campus

### 3.8 API Endpoint

**Endpoint:** `GET /api/demographics/:date`

**Files:** `server/api-dev.js` (local), `api/demographics/[date].js` (Vercel)

**Query:**
```sql
SELECT category_type, demographic_type, demographic_value, count, percentage
FROM v_workforce_demographics
WHERE period_date = :date AND location = 'combined'
ORDER BY demographic_type, category_type, count DESC
```

**Response Structure:**
```javascript
{
  totals: {
    faculty: 689,           // Sum of faculty gender counts
    staff: 1448,            // Sum of staff gender counts
    combined: 2137          // faculty + staff
  },
  gender: {
    faculty: { male: 321, female: 368 },
    staff: { male: 534, female: 914 }
  },
  ethnicity: {
    faculty: {
      "White": 457,
      "Asian": 121,
      "Hispanic or Latino": 45,
      "Black or African American": 32,
      "Two or More Races": 15,
      "Not Disclosed": 19
    },
    staff: {
      "White": 1089,
      "Hispanic or Latino": 147,
      "Black or African American": 96,
      "Asian": 52,
      "Two or More Races": 34,
      "Not Disclosed": 30
    }
  },
  ageBands: {
    faculty: {
      "20-30": 45,
      "31-40": 156,
      "41-50": 189,
      "51-60": 178,
      "61 Plus": 121
    },
    staff: {
      "20-30": 287,
      "31-40": 398,
      "41-50": 356,
      "51-60": 289,
      "61 Plus": 118
    }
  }
}
```

### 3.9 React Component Usage

**File:** `src/components/dashboards/DemographicsQ1FY26Dashboard.jsx`

```javascript
// Access demographics data
const { demographics } = staticData.getReportData('FY26_Q1');

// Gender display
demographics.gender.faculty.male     // 321
demographics.gender.faculty.female   // 368
demographics.gender.staff.male       // 534
demographics.gender.staff.female     // 914

// Ethnicity display (used in charts)
Object.entries(demographics.ethnicity.faculty)
  .map(([name, count]) => ({ name, count }))

// Age band display
Object.entries(demographics.ageBands.faculty)
  .map(([name, count]) => ({ name, count }))
```

### 3.10 Expected Values (FY25 Q4)

#### Gender Breakdown

| Category | Male | Female | Total |
|----------|------|--------|-------|
| Faculty | 321 | 368 | 689 |
| Staff | 534 | 914 | 1,448 |
| **Combined** | **855** | **1,282** | **2,137** |

#### Ethnicity Breakdown (Combined Location)

| Ethnicity | Faculty | Staff | Total |
|-----------|---------|-------|-------|
| White | 457 | 1,089 | 1,546 |
| Asian | 121 | 52 | 173 |
| Hispanic or Latino | 45 | 147 | 192 |
| Black or African American | 32 | 96 | 128 |
| Two or More Races | 15 | 34 | 49 |
| Not Disclosed | 19 | 30 | 49 |

#### Age Band Breakdown (Combined Location)

| Age Band | Faculty | Staff | Total |
|----------|---------|-------|-------|
| 20-30 | 45 | 287 | 332 |
| 31-40 | 156 | 398 | 554 |
| 41-50 | 189 | 356 | 545 |
| 51-60 | 178 | 289 | 467 |
| 61 Plus | 121 | 118 | 239 |

### 3.11 Cross-Check Validations

```
Gender Faculty Sum: 321 + 368 = 689 ✓ (matches benefit-eligible faculty)
Gender Staff Sum: 534 + 914 = 1,448 ✓ (matches benefit-eligible staff)
Combined Total: 689 + 1,448 = 2,137 ✓

Note: Demographics totals (2,137) differ from workforce totals (5,037)
because demographics only includes benefit-eligible Faculty and Staff.
Excluded: HSP (612) + Students (1,714) + Temp (574) = 2,900
```

### 3.12 Validation Service

**File:** `src/services/demographicsValidationService.js`

The demographics validation service includes **52 validation rules** across categories:

| Category | Rules | Description |
|----------|-------|-------------|
| Gender Totals | 6 | Male/female counts for faculty/staff/combined |
| Gender Faculty | 6 | Faculty gender breakdown (combined + by location) |
| Gender Staff | 6 | Staff gender breakdown (combined + by location) |
| Ethnicity Faculty | 12 | Faculty ethnicity counts by category |
| Ethnicity Staff | 12 | Staff ethnicity counts by category |
| Age Bands Faculty | 5 | Faculty age band distribution |
| Age Bands Staff | 5 | Staff age band distribution |

### 3.13 ETL Command

```bash
# Load demographics for FY25 Q4
npm run etl:demographics -- --date 2025-06-30

# Dry run (preview without database writes)
npm run etl:demographics -- --date 2025-06-30 --dry-run

# Specify custom input file
npm run etl:demographics -- --input file.xlsx --date 2025-06-30 --verbose
```

### 3.14 File References

| Purpose | File Path |
|---------|-----------|
| ETL Script | `scripts/etl/demographics-to-postgres.js` |
| Database Migration | `database/migrations/004_create_demographics_tables.sql` |
| Validation Service | `src/services/demographicsValidationService.js` |
| API Endpoint | `server/api-dev.js` (lines 161-235) |
| Dashboard | `src/components/dashboards/DemographicsQ1FY26Dashboard.jsx` |
| Test Dashboard | `src/components/dashboards/WorkforceTestDashboard.jsx` |
| JSON Data | `src/data/staticData.js` (demographics section) |

---

## 4. Year-over-Year Comparisons

### FY25 vs FY24 Total Workforce

| Period | Total | Change |
|--------|-------|--------|
| FY25 Q4 (6/30/2025) | 5,037 | +263 (+5.5%) |
| FY24 Q4 (6/30/2024) | 4,774 | baseline |

### Category Changes FY24 → FY25

| Category | FY24 | FY25 | Change |
|----------|------|------|--------|
| Staff | 1,431 | 1,448 | +17 |
| Faculty | 678 | 689 | +11 |
| HSP | 608 | 612 | +4 |
| Students | 1,491 | 1,714 | +223 |
| Temp | 566 | 574 | +8 |

---

## 5. Validation Service API Path Mappings

The validation service (`src/services/workforceValidationService.js`) compares JSON data against Neon API data. The `apiPath` values must match the actual API response structure.

### 5.1 Data Lineage

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Excel Source   │ --> │    JSON File    │ --> │   Neon DB       │ --> │   REST API      │
│  (HR Export)    │     │ (staticData.js) │     │  (Postgres)     │     │  (Express)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
     ↓                        ↓                       ↓                       ↓
  True Source           Local Dev Data          Raw DB Data            Calculated Fields
  Quarterly Export      Manual Sync             ETL Pipeline           (temp, total)
```

**Note:** The API layer calculates `temp` and `total` per location since these are not stored in the Neon view.

### 5.2 Location Validation Rules

| Rule ID | JSON Path | API Path | Expected (FY25 Q4) |
|---------|-----------|----------|-------------------|
| omaha_total | `locations["Omaha Campus"]` | `locationDetails.omaha.total` | 4,287 |
| omaha_faculty | `locationDetails.omaha.faculty` | `locationDetails.omaha.faculty` | 649 |
| omaha_staff | `locationDetails.omaha.staff` | `locationDetails.omaha.staff` | 1,344 |
| omaha_hsp | `locationDetails.omaha.hsp` | `locationDetails.omaha.hsp` | 268 |
| omaha_students | `locationDetails.omaha.students` | `locationDetails.omaha.students` | 1,604 |
| omaha_temp | `locationDetails.omaha.temp` | `locationDetails.omaha.temp` | 422 |
| phoenix_total | `locations["Phoenix Campus"]` | `locationDetails.phoenix.total` | 750 |
| phoenix_faculty | `locationDetails.phoenix.faculty` | `locationDetails.phoenix.faculty` | 40 |
| phoenix_staff | `locationDetails.phoenix.staff` | `locationDetails.phoenix.staff` | 104 |
| phoenix_hsp | `locationDetails.phoenix.hsp` | `locationDetails.phoenix.hsp` | 344 |
| phoenix_students | `locationDetails.phoenix.students` | `locationDetails.phoenix.students` | 110 |
| phoenix_temp | `locationDetails.phoenix.temp` | `locationDetails.phoenix.temp` | 152 |

### 5.3 Test Coverage

| Test File | Tests | Description |
|-----------|-------|-------------|
| `workforceValidationService.test.js` | 43 | API path mappings, value extraction, category validation |

### 5.4 Important Implementation Notes

1. **API calculates temp per location**: The Neon view `v_workforce_summary` does not include `omaha_temp` or `phoenix_temp`. The API calculates these as: `temp = total - (faculty + staff + hsp + students)`

2. **Total is included for convenience**: While `locations["Omaha Campus"]` provides the total, `locationDetails.omaha.total` is also included for consistent access patterns in validation.

3. **All 12 location metrics validated**: The validation dashboard compares JSON vs API for all location breakdown metrics.

---

## Appendix A: Assignment Category Codes Reference

| Code | Description | Category Type | Benefit Eligible |
|------|-------------|---------------|------------------|
| F12 | Full-time 12-month | benefit | Yes |
| F11 | Full-time 11-month | benefit | Yes |
| F10 | Full-time 10-month | benefit | Yes |
| F09 | Full-time 9-month | benefit | Yes |
| PT12 | Part-time 12-month | benefit | Yes |
| PT11 | Part-time 11-month | benefit | Yes |
| PT10 | Part-time 10-month | benefit | Yes |
| PT9 | Part-time 9-month | benefit | Yes |
| HSR | House Staff Resident | hsp | Yes |
| SUE | Student Employment | student | No |
| CWS | College Work Study | student | No |
| TEMP | Temporary | temp | No |
| NBE | Non-Benefit Eligible | temp | No |
| PRN | As Needed | temp | No |

---

## Appendix B: File References

### Workforce Files
| Purpose | File Path |
|---------|-----------|
| Excel Source | `source-metrics/workforce/*.xlsx` |
| Methodology | `source-metrics/workforce/WORKFORCE_METHODOLOGY.md` |
| JSON Data | `src/data/staticData.js` |
| Test Manifest | `src/data/manifests/workforce-expected-values.json` |
| Data Validation Tests | `src/data/__tests__/workforce_summary_cards.test.js` |
| Service Validation Tests | `src/services/__tests__/workforceValidationService.test.js` |
| Validation Service | `src/services/workforceValidationService.js` |
| Neon Schema | `database/migrations/001_create_tables.sql` |
| Neon Views | `database/migrations/003_create_views.sql` |
| API Endpoint | `api/workforce/[date].js`, `server/api-dev.js` |
| Dashboard | `src/components/dashboards/WorkforceDashboard.jsx` |
| Validation Dashboard | `src/components/dashboards/WorkforceTestDashboard.jsx` |

### Demographics Files
| Purpose | File Path |
|---------|-----------|
| ETL Script | `scripts/etl/demographics-to-postgres.js` |
| Database Migration | `database/migrations/004_create_demographics_tables.sql` |
| Validation Service | `src/services/demographicsValidationService.js` |
| API Endpoint | `server/api-dev.js` (lines 161-235) |
| Dashboard | `src/components/dashboards/DemographicsQ1FY26Dashboard.jsx` |

### Turnover Files
| Purpose | File Path |
|---------|-----------|
| ETL Script | `scripts/etl/turnover-metrics-to-postgres.js` |
| Database Migration | `database/migrations/005_create_turnover_tables.sql` |
| Validation Service | `src/services/turnoverValidationService.js` |
| API Endpoint | `server/api-dev.js` (lines 237-433) |
| Dashboard | `src/components/dashboards/TurnoverDashboard.jsx` |
| Validation Dashboard | `src/components/dashboards/TurnoverTestDashboard.jsx` |

---

## Appendix C: Validation Test Coverage

### Workforce Validation (43 rules)

| Section | Tests | Status |
|---------|-------|--------|
| Summary Cards (6 metrics) | 6 value checks + 1 sum validation | ✅ Validated |
| Location Details (12 metrics) | 12 value checks + 2 sum validations | ✅ Validated |
| Year-over-Year | 4 change validations | ✅ Validated |
| Data Quality | 6 integrity checks | ✅ Validated |
| Methodology Compliance | 5 ratio checks | ✅ Validated |
| Validation Service API Paths | 12 path mapping tests | ✅ Validated |
| Value Extraction (getValueByPath) | 10 unit tests | ✅ Validated |
| API Response Structure | 6 integration tests | ✅ Validated |

### Demographics Validation (52 rules)

| Section | Tests | Status |
|---------|-------|--------|
| Gender Totals | 6 rules | ✅ Validated |
| Gender Faculty | 6 rules (combined + per-location) | ✅ Validated |
| Gender Staff | 6 rules (combined + per-location) | ✅ Validated |
| Ethnicity Faculty | 12 rules (6 categories × 2 locations) | ✅ Validated |
| Ethnicity Staff | 12 rules (6 categories × 2 locations) | ✅ Validated |
| Age Bands Faculty | 5 rules (5 bands) | ✅ Validated |
| Age Bands Staff | 5 rules (5 bands) | ✅ Validated |

### Turnover Validation (80 rules)

| Section | Tests | Status |
|---------|-------|--------|
| Summary Rates | 8 rules | ✅ Validated |
| Turnover Rates Table | 12 rules | ✅ Validated |
| Turnover Breakdown | 9 rules | ✅ Validated |
| Staff Deviation | 12 rules | ✅ Validated |
| Faculty Deviation | 9 rules | ✅ Validated |
| Length of Service | 10 rules | ✅ Validated |
| Retirements by FY | 8 rules | ✅ Validated |
| Faculty Retirement Trends | 6 rules | ✅ Validated |
| Staff Retirement Trends | 6 rules | ✅ Validated |

### Total Validation Coverage

| Domain | Rules | Match Rate |
|--------|-------|------------|
| Workforce | 43 | 100% |
| Demographics | 52 | 100% |
| Turnover | 80 | 100% |
| Recruiting | 70 | 100% |
| **Total** | **245** | **100%** |

---

## 6. Recruiting & Hiring (70 metrics)

Recruiting data covers quarterly hiring metrics from multiple source systems (Oracle HCM, Oracle Recruiting Cloud/myJobs, Interfolio).

### 6.1 Data Flow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Excel Source   │ --> │   ETL Script    │ --> │   Neon DB       │ --> │   REST API      │
│  (HR Systems)   │     │ recruiting-     │     │ fact_recruiting │     │ /recruiting/    │
│ HCM + myJobs +  │     │ metrics-to-     │     │ * tables        │     │ metrics/:fy/:q  │
│ Interfolio      │     │ postgres.js     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
     ↓                        ↓                       ↓                       ↓
  Oracle HCM Data         Hash PII,              11 fact tables          useRecruitingData
  myJobs Pipeline         Aggregate              Fiscal period           hook transforms
  Interfolio Faculty      Transform              indexing                to dashboard format
```

### 6.2 Excel Source Structure

**Source File:** `source-metrics/recruiting/Recruiting_Metrics_Master.xlsx`

**Methodology:** `source-metrics/recruiting/RECRUITING_METHODOLOGY.md`

| Sheet | Purpose | Source System | Key Columns |
|-------|---------|---------------|-------------|
| Metadata | Period info | Manual | fiscal_year, quarter, data_as_of, preparer |
| Summary_Metrics | Card metrics | Combined | total_hires, faculty_hires, staff_hires |
| Hire_Rates | Success rates | Taleo + Interfolio | source_system, channel, rate |
| Pipeline_Staff | myJobs metrics | Oracle Recruiting Cloud | open_reqs, apps, time_to_fill |
| Pipeline_Faculty | Interfolio metrics | Interfolio | active_searches, hires_by_type |
| New_Hires_Detail | Individual hires | Oracle HCM | hire_date, position, department, school |
| Hires_By_School | School aggregation | Derived | school_name, faculty_hires, staff_hires |
| Application_Sources | Channel counts | Taleo | source_name, application_count, percentage |
| Top_Jobs | Top 10 by apps | Taleo | rank, job_title, application_count |
| Requisition_Aging | Open req ages | Taleo | age_range, requisition_count, percentage |
| New_Hire_Demographics | Demographics | Oracle HCM | demo_type, demo_value, count, percentage |
| Hiring_Trends | Historical | Derived | quarter, faculty_hires, staff_hires |

### 6.3 Database Schema

**Migration:** `database/migrations/006_create_recruiting_metrics_tables.sql`

#### Dimension Tables

```sql
-- Application source channels
CREATE TABLE dim_application_sources (
    source_id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) UNIQUE NOT NULL,
    source_category VARCHAR(50),
    display_color VARCHAR(20)
);

-- Job family categories
CREATE TABLE dim_job_families (
    job_family_id SERIAL PRIMARY KEY,
    job_family_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50)
);
```

#### Fact Tables (11 tables)

| Table | Purpose | Row Count (Q1 FY26) |
|-------|---------|---------------------|
| `fact_recruiting_summary` | Summary card metrics | 1 |
| `fact_hire_rates` | Hire rates by system/channel | 2 |
| `fact_pipeline_metrics_staff` | myJobs pipeline data | 1 |
| `fact_pipeline_metrics_faculty` | Interfolio pipeline data | 1 |
| `fact_new_hires` | Individual hire records | 69 |
| `fact_hires_by_school` | School aggregations | 9 |
| `fact_application_sources` | Source channel counts | 6 |
| `fact_top_jobs` | Top jobs by applications | 10 |
| `fact_requisition_aging` | Aging distribution | 5 |
| `fact_new_hire_demographics` | Demographics breakdown | 13 |
| `fact_hiring_trends` | Historical quarterly trends | 10 |

### 6.4 Summary Metrics (7 checks)

| Metric | Excel Column | Database Column | Q1 FY26 Value |
|--------|--------------|-----------------|---------------|
| Total Hires | total_hires | total_hires | **69** |
| Faculty Hires | faculty_hires | faculty_hires | **31** |
| Staff Hires | staff_hires | staff_hires | **38** |
| Omaha Hires | omaha_hires | omaha_hires | **68** |
| Phoenix Hires | phoenix_hires | phoenix_hires | **1** |
| Open Requisitions | open_requisitions | open_requisitions | **143** |
| Active Applications | active_applications | active_applications | **767** |

**Validation:**
```
Faculty (31) + Staff (38) = Total (69) ✓
Omaha (68) + Phoenix (1) = Total (69) ✓
```

### 6.5 Pipeline Staff Metrics (13 checks)

myJobs/Oracle Recruiting Cloud metrics:

| Metric | Q1 FY26 Value | Unit |
|--------|---------------|------|
| Open Requisitions | 143 | count |
| Reqs per Recruiter | 28.6 | ratio |
| Avg Days Open | 71 | days |
| Avg Time to Fill | 35.5 | days |
| Active Applications | 767 | count |
| New Applications | 2,000 | count |
| Apps per Requisition | 11.1 | ratio |
| Internal App % | 3.0% | percent |
| Referrals | 7 | count |
| Total Staff Hires | 40 | count |
| Internal Hires | 13 | count |
| Internal Hire Rate | 32.5% | percent |
| Offer Acceptance Rate | 97.7% | percent |

### 6.6 Pipeline Faculty Metrics (7 checks)

Interfolio metrics:

| Metric | Q1 FY26 Value | Unit |
|--------|---------------|------|
| Active Searches | 15 | count |
| Completed Searches | 6 | count |
| Total Faculty Hires | 6 | count |
| Tenure Track | 3 | count |
| Non-Tenure | 1 | count |
| Instructor | 1 | count |
| Special Faculty | 1 | count |

**Validation:**
```
Tenure Track (3) + Non-Tenure (1) + Instructor (1) + Special Faculty (1) = Total (6) ✓
```

### 6.7 Application Sources (6 checks)

| Source | Applications | Percentage | Color |
|--------|--------------|------------|-------|
| LinkedIn | 800 | 40% | #0A66C2 |
| Creighton Careers | 400 | 20% | #0054A6 |
| External Career Site | 380 | 19% | #10B981 |
| jobright | 120 | 6% | #F59E0B |
| Internal Career Site | 100 | 5% | #8B5CF6 |
| Other | 200 | 10% | #9CA3AF |

### 6.8 Top Jobs by Applications (10 checks)

| Rank | Job Title | Applications |
|------|-----------|--------------|
| 1 | Facilities Maintenance | 165 |
| 2 | Administrative Assistant | 140 |
| 3 | Research Associate | 95 |
| 4 | Clinical Coordinator | 85 |
| 5 | Program Coordinator | 72 |
| 6 | Office Coordinator | 65 |
| 7 | Lab Technician | 58 |
| 8 | Teaching Assistant | 52 |
| 9 | Data Analyst | 48 |
| 10 | Marketing Specialist | 42 |

### 6.9 Demographics (13 checks)

#### Gender Distribution

| Gender | Count | Percentage |
|--------|-------|------------|
| Female | 34 | 49.3% |
| Male | 35 | 50.7% |

#### Ethnicity Distribution

| Ethnicity | Count | Percentage |
|-----------|-------|------------|
| White | 34 | 49.3% |
| Not Disclosed | 14 | 20.3% |
| Asian | 10 | 14.5% |
| More than one Ethnicity | 6 | 8.7% |
| Hispanic or Latino | 3 | 4.3% |
| Black or African American | 2 | 2.9% |

#### Age Band Distribution

| Age Band | Count | Percentage |
|----------|-------|------------|
| 21-30 | 21 | 30.4% |
| 31-40 | 28 | 40.6% |
| 41-50 | 11 | 15.9% |
| 51-60 | 6 | 8.7% |
| 61+ | 3 | 4.3% |

### 6.10 Requisition Aging (5 checks)

| Age Range | Count | Percentage |
|-----------|-------|------------|
| 0-30 Days | 45 | 31.5% |
| 31-60 Days | 38 | 26.6% |
| 61-90 Days | 28 | 19.6% |
| 91-120 Days | 18 | 12.6% |
| >120 Days | 14 | 9.8% |

### 6.11 Hires by School (9 checks)

| School | Faculty | Staff | Total |
|--------|---------|-------|-------|
| Arts & Sciences | 8 | 9 | 17 |
| Medicine | 5 | 3 | 8 |
| Facilities | 0 | 8 | 8 |
| Dentistry | 4 | 3 | 7 |
| Heider College of Business | 3 | 2 | 5 |
| Nursing | 2 | 2 | 4 |
| Athletics | 0 | 3 | 3 |
| Law School | 2 | 1 | 3 |
| Other | 7 | 7 | 14 |

### 6.12 API Endpoints

**Base Path:** `/api/recruiting/`

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/summary/:fiscalYear/:quarter` | GET | Summary card metrics |
| `/hire-rates/:fiscalYear/:quarter` | GET | Hire rates by source |
| `/pipeline-staff/:fiscalYear/:quarter` | GET | myJobs pipeline metrics |
| `/pipeline-faculty/:fiscalYear/:quarter` | GET | Interfolio pipeline metrics |
| `/new-hires/:fiscalYear/:quarter` | GET | Individual hire records |
| `/by-school/:fiscalYear/:quarter` | GET | School aggregations |
| `/application-sources/:fiscalYear/:quarter` | GET | Source channel data |
| `/top-jobs/:fiscalYear/:quarter` | GET | Top jobs by applications |
| `/requisition-aging/:fiscalYear/:quarter` | GET | Aging distribution |
| `/demographics/:fiscalYear/:quarter` | GET | Demographics breakdown |
| `/hiring-trends` | GET | Historical trends |
| `/metrics/:fiscalYear/:quarter` | GET | Combined all metrics |

### 6.13 React Hook

**File:** `src/hooks/useRecruitingData.js`

```javascript
const { data, isLoading, error, refetch, apiAvailable } = useRecruitingData('FY2026', 1);

// Data structure
data.summary           // Total/faculty/staff/campus breakdown
data.pipelineStaff     // myJobs metrics
data.pipelineFaculty   // Interfolio metrics
data.hireRates         // Hire rates by source
data.bySchool          // School breakdown
data.applicationSources // LinkedIn, Indeed, etc.
data.topJobs           // Top 10 jobs
data.requisitionAging  // Age distribution
data.demographics      // Gender, ethnicity, age band
data.newHires          // Individual hire records
data.hiringTrends      // Historical quarterly trends
```

### 6.14 ETL Command

```bash
# Generate Excel template with Q1 FY26 data
npm run etl:recruiting:generate

# Load recruiting data to Neon
npm run etl:recruiting

# Dry run (preview without database writes)
npm run etl:recruiting -- --dry-run

# Specify custom input file and quarter
npm run etl:recruiting -- --input file.xlsx --quarter FY26_Q1 --verbose
```

### 6.15 File References

| Purpose | File Path |
|---------|-----------|
| Excel Template | `source-metrics/recruiting/Recruiting_Metrics_Master.xlsx` |
| Methodology | `source-metrics/recruiting/RECRUITING_METHODOLOGY.md` |
| Database Migration | `database/migrations/006_create_recruiting_metrics_tables.sql` |
| ETL Script | `scripts/etl/recruiting-metrics-to-postgres.js` |
| Template Generator | `scripts/generate-recruiting-excel-template.js` |
| API Service | `src/services/apiService.js` (lines 150-286) |
| API Server | `server/api-dev.js` (recruiting routes) |
| Data Hook | `src/hooks/useRecruitingData.js` |
| Validation Service | `src/services/recruitingValidationService.js` |
| Dashboard | `src/components/dashboards/RecruitingQ1FY26Dashboard.jsx` |
| Test Dashboard | `src/components/dashboards/RecruitingTestDashboard.jsx` |

### 6.16 PII Protection

Employee identifiers are hashed before storage:

```javascript
function hashEmployeeId(name, hireDate) {
  const input = `${name}|${hireDate}`;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}
```

**Stored:** `employee_hash` (16-char hex string)
**Not Stored:** Name, Employee ID, SSN, or other PII
