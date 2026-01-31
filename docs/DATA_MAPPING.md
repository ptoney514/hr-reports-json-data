# Workforce Data Mapping

> **Living Document** - Traces complete data lineage from Excel source → Neon DB → API → React Screen

## Overview

This document captures the exact data flow for each metric displayed on the Workforce Dashboard. It serves as:
- Reference for debugging data discrepancies
- Documentation for quarterly data refresh procedures
- Guide for extending the data pipeline to new metrics

**Last Updated:** 2026-01-30 (Location validation fix)
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

## 3. Demographics (Future)

*To be documented when demographics ETL is implemented.*

### Planned Metrics
- Age distribution
- Tenure distribution
- Gender breakdown
- Ethnicity (optional, if collected)

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

---

## Appendix C: Validation Test Coverage

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
