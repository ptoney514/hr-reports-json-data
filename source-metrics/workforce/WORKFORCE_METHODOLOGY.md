# Workforce Data Methodology

## Overview
This document describes the methodology for categorizing and calculating workforce headcount metrics for Creighton University's workforce analytics dashboard. It explains the logic, calculations, and business rules used to transform raw HR data into actionable workforce insights.

---

## Critical Understanding: Person Type vs Assignment Category Codes

### The Key Distinction

**Person Type** and **Assignment Category Code** serve different purposes and must both be considered for accurate employee categorization:

#### Person Type Field
- **Values**: STAFF or FACULTY
- **Purpose**: Determines the fundamental classification of benefit-eligible employees
- **Source**: HR system classification
- **Importance**: **PRIMARY** determinant for categorizing benefit-eligible employees as Staff vs Faculty

#### Assignment Category Codes (F12, PT10, etc.)
- **Values**: F12, F11, F10, F09, PT12, PT11, PT10, PT9, HSR, SUE, CWS, TEMP, NBE, PRN
- **Purpose**: Indicates employment **TERMS** (time commitment and duration)
- **Examples**:
  - **F12** = Full-time 12-month (NOT "Faculty 12")
  - **PT10** = Part-time 10-month (NOT just "Part-time")
  - **F09** = Full-time 9-month
- **Importance**: Used to identify benefit eligibility and special categories (House Staff, Students, Non-Benefit)

#### Common Misconception
❌ **INCORRECT**: "F-codes are Faculty, PT-codes are Staff"
✅ **CORRECT**: "F and PT indicate full-time vs part-time TERMS. Person Type determines Staff vs Faculty."

**Example**: An employee with code **F12** could be:
- A Faculty member (if Person Type = 'FACULTY')
- A Staff member (if Person Type = 'STAFF')

---

## Employee Categorization Logic

### Category Definitions

The workforce dashboard categorizes employees into 5 primary groups:

#### 1. Benefit Eligible Staff
**Definition**: Benefit-eligible employees classified as STAFF, excluding House Staff physicians

**Calculation Logic**:
```
Benefit Eligible Staff =
  WHERE Person Type = 'STAFF'
  AND Benefit Eligible = 'Yes'
  AND Assignment Category Code != 'HSR'
```

**Included Assignment Codes**:
- Full-time codes: F12, F11, F10, F09
- Part-time codes: PT12, PT11, PT10, PT9
- **Excludes**: HSR (House Staff - separate category)

**FY25 Q4 (6/30/2025)**:
- Total: **1,448** employees
- OMA Campus: 1,344 (92.8%)
- PHX Campus: 104 (7.2%)

#### 2. Benefit Eligible Faculty
**Definition**: Benefit-eligible employees classified as FACULTY

**Calculation Logic**:
```
Benefit Eligible Faculty =
  WHERE Person Type = 'FACULTY'
  AND Benefit Eligible = 'Yes'
```

**Included Assignment Codes**:
- Full-time codes: F12, F11, F10, F09
- Part-time codes: PT12, PT11, PT10, PT9

**FY25 Q4 (6/30/2025)**:
- Total: **689** faculty members
- OMA Campus: 649 (94.2%)
- PHX Campus: 40 (5.8%)

#### 3. Benefit Eligible House Staff Physicians
**Definition**: Physicians in residency/house staff programs

**Calculation Logic**:
```
House Staff Physicians =
  WHERE Assignment Category Code = 'HSR'
```

**Note**: House Staff are benefit-eligible but tracked separately due to their unique role in medical education.

**FY25 Q4 (6/30/2025)**:
- Total: **612** physicians
- OMA Campus: 268 (43.8%)
- PHX Campus: 344 (56.2%)

**Observation**: Phoenix campus has higher house staff count due to medical center operations.

#### 4. Student Workers
**Definition**: Student employees including federal work-study positions

**Calculation Logic**:
```
Student Workers =
  WHERE Assignment Category Code IN ('SUE', 'CWS')
```

**Included Codes**:
- **SUE** (Student University Employee): Regular student workers
- **CWS** (College Work Study): Federal work-study positions

**FY25 Q4 (6/30/2025)**:
- Total: **1,714** student workers
- OMA Campus: 1,604 (93.6%)
- PHX Campus: 110 (6.4%)
- Federal Work Study Rate: 6.2% (107 CWS out of 1,714 total)

#### 5. Non-Benefit Eligible Employees
**Definition**: Temporary, per diem, and non-benefit eligible workers

**Calculation Logic**:
```
Non-Benefit Eligible =
  WHERE Assignment Category Code IN ('TEMP', 'NBE', 'PRN')
```

**Included Codes**:
- **TEMP**: Temporary workers
- **NBE**: Non-benefit eligible positions
- **PRN**: As-needed/per diem workers

**FY25 Q4 (6/30/2025)**:
- Total: **574** employees
- OMA Campus: 422 (73.5%)
- PHX Campus: 152 (26.5%)

---

## Calculation Methodology

### Total Workforce Count

**Formula**:
```
Total Workforce = COUNT(DISTINCT Employee ID WHERE END DATE = [snapshot date])
```

**FY25 Q4 (6/30/2025)**: 5,037 employees

**Calculation Steps**:
1. Filter to specific snapshot date (e.g., 6/30/2025)
2. Count unique Employee IDs
3. Ensure no duplicates per snapshot

### Year-over-Year (YoY) Comparisons

**Formula**:
```
YoY Change (%) = ((Current Count - Prior Year Count) / Prior Year Count) × 100
YoY Change (Absolute) = Current Count - Prior Year Count
```

**Prior Year Logic**:
- Compare same fiscal quarter from previous year
- Example: Q4 FY25 (6/30/2025) compared to Q4 FY24 (6/30/2024)
- Maintains quarterly consistency for accurate trend analysis

**Example (FY25 Q4 vs FY24 Q4)**:
- Total FY25 Q4: 5,037
- Total FY24 Q4: 4,774
- YoY Change: +263 (+5.5%)

### Campus Distribution

**Formula for Each Category**:
```
OMA Count = COUNT(WHERE Campus = 'OMA' AND [category filters])
PHX Count = COUNT(WHERE Campus = 'PHX' AND [category filters])
Campus % = (Campus Count / Total Count) × 100
```

**FY25 Q4 Total Distribution**:
- **Omaha (OMA)**: 4,287 employees (85.1%)
- **Phoenix (PHX)**: 750 employees (14.9%)

---

## Fiscal Calendar

### Fiscal Year Structure
- **Fiscal Year Definition**: July 1 - June 30
- **Format**: FY## (last 2 digits of ending calendar year)
- **Example**: FY25 = July 1, 2024 to June 30, 2025

### Fiscal Year Calculation Logic
```
IF snapshot month >= 7 (July or later):
    Fiscal Year = "FY" + (snapshot year + 1 last 2 digits)
ELSE:
    Fiscal Year = "FY" + (snapshot year last 2 digits)

Examples:
- Date: 2024-09-30 → FY25 (July 2024 is start of FY25)
- Date: 2025-06-30 → FY25 (June 2025 is end of FY25)
- Date: 2025-07-01 → FY26 (July 2025 is start of FY26)
```

### Fiscal Quarters

| Quarter | Months | Typical Snapshot | Description |
|---------|--------|------------------|-------------|
| **Q1** | July - September | September 30 | Year Start |
| **Q2** | October - December | December 31 | Mid-Year (Calendar) |
| **Q3** | January - March | March 31 | Mid-Year (Fiscal) |
| **Q4** | April - June | June 30 | **Year-End** |

**Note**: Q4 snapshots (June 30) are the official fiscal year-end counts used for annual reporting.

---

## Data Scope and Filters

### Included Data
- **Date Range**: 2023 onwards (FY23 Q3 forward)
- **Status**: Active employees as of snapshot date
- **Records**: All records with valid Assignment Category Codes

### Excluded Data
- Records prior to 2023-01-01 (pre-FY23 Q3)
- Records with null or missing Assignment Category Codes
- Duplicate employee records (deduplication by Employee ID + Snapshot Date)

**Rationale**: Focus on recent workforce trends while maintaining data quality through strict validation.

---

## Data Validation Rules

### Quality Checks Applied

1. **No Duplicate Employees per Snapshot**
   - Validation: Each Employee ID appears only once per END DATE
   - Action: Most recent record retained if duplicates found

2. **Valid Assignment Category Codes**
   - Validation: All records must have a recognized Assignment Category Code
   - Action: Records with null codes are excluded

3. **Valid Dates**
   - Validation: All END DATE values are valid and within expected range
   - Action: Records with invalid dates are flagged

4. **Category Totals Match**
   - Validation: Sum of all categories equals total headcount
   - Action: Audit trail documents any discrepancies

5. **Campus Totals Match**
   - Validation: OMA + PHX counts equal total headcount
   - Action: Records with unknown campus are flagged

---

## Reporting Periods

### Standard Reporting Dates
- **Year-End**: June 30 (Q4 close) - **PRIMARY ANNUAL REPORT**
- **Mid-Year**: December 31 (Q2 close) or March 31 (Q3 close)
- **Quarterly**: Each quarter end (Sept 30, Dec 31, Mar 31, Jun 30)

### Available Historical Data
Current dataset includes 11 quarterly snapshots:
- **FY23**: Q3, Q4
- **FY24**: Q1, Q2, Q3, Q4
- **FY25**: Q1, Q2, Q3, Q4
- **FY26**: Q1

---

## Special Considerations

### House Staff Distribution
House Staff physicians show unique campus distribution:
- Higher concentration in Phoenix (56.2% vs 43.8% Omaha)
- Reflects medical center clinical operations
- Tracked separately from general staff due to educational role

### Student Worker Seasonality
Student worker counts may fluctuate based on:
- Academic calendar (higher during Fall/Spring semesters)
- Summer programs
- Federal work-study allocation timing

### Benefit-Eligible Categories
The combination of Person Type and Assignment Category Code ensures:
- Accurate Staff vs Faculty classification
- Proper benefit eligibility tracking
- Correct organizational reporting

---

## Change History and Methodology Updates

### Version 2.0 (October 2025)
**Major Update**: Corrected categorization logic to use Person Type field

**Changes Made**:
- ✅ Updated category logic to use Person Type as primary determinant for Staff vs Faculty
- ✅ Clarified that Assignment Category Codes indicate employment TERMS, not employee type
- ✅ Separated House Staff from general Benefit Eligible Staff category
- ✅ Updated all counts to reflect FY25 Q4 actual verified numbers
- ✅ Removed outdated Power BI references

**Impact**: Numbers now match official Creighton University FY25 Year-End Report exactly.

### Version 1.0 (Original)
- Initial methodology documented
- Based on Assignment Category Code prefixes only
- **Note**: This logic was incomplete and has been superseded by Version 2.0

---

## Related Documentation

- **DATA_DICTIONARY.md**: Comprehensive field reference and code definitions
- **DATA_CLEANING_AUDIT.md**: Automated audit trail of data transformations
- **README.md**: Project setup and usage instructions

---

## Validation and Accuracy

This methodology has been validated against:
- ✅ Creighton University FY25 Year-End Report (6/30/2025)
- ✅ FY24 Year-End Report (6/30/2024)
- ✅ Quarterly HR system exports

All counts match official university reporting with 100% accuracy.

---

*This methodology is maintained to ensure consistent, accurate workforce analysis across all dashboards and reports. Any changes to categorization logic must be documented and validated against official university reports.*
