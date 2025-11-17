# Termination Data Dictionary

## Overview
This document provides a comprehensive reference for all fields in the termination dataset. Use this as a quick lookup guide for field definitions, codes, and data types.

---

## Source Data Information

### Primary Source File
- **File Name**: `Terms Since 2017 Detail PT.xlsx`
- **Location**: `source-metrics/terminations/FY25_Q4/` (example)
- **Export Source**: HR System (Workday)
- **Update Frequency**: Quarterly snapshots
- **Data Scope**: All employee terminations since 2017
- **Total Records**: 11,418 terminations (as of FY25 Q4 export)

### Cleaned Data Output
- **File Name**: `terminations_cleaned.csv`
- **Location**: `source-metrics/terminations/cleaned_data/FY25_Q4/` (per quarter)
- **Format**: UTF-8 CSV
- **Generation**: Automated via `scripts/clean_termination_data.py`

---

## Core Field Definitions

### Employee Identification Fields

| Field Name | Data Type | Description | Notes |
|------------|-----------|-------------|-------|
| **Empl_num** | Number | Unique employee identifier | Primary key, used for joining with workforce data |

**Privacy Note**: Names removed from cleaned data for privacy protection
- Last_Name, First_Name, Middle_Name, Display_Name → REMOVED

---

### Termination Event Fields

| Field Name | Data Type | Description | Example Values | Critical Notes |
|------------|-----------|-------------|----------------|----------------|
| **Term_Date** | Date | Employee termination date | 2024-10-04 | Actual last day of employment |
| **Term_Qtr_End_Date** | Date | Quarter end date for grouping | 2024-12-02 | Used for quarterly aggregation |
| **Term_Reason_1** | Text | Primary termination reason code | CRUNV_BETTER_OP, CRUNV_DISSATISFIED | Workday reason code |
| **Term_Reason_2** | Text | Secondary termination reason | Resigned, Terminated, Retired | More specific classification |
| **Hire_Date** | Date | Original hire date | 2022-07-30 | Used to calculate tenure |

**Termination Reason Codes** (Common):
- `CRUNV_BETTER_OP` - Better Opportunity
- `CRUNV_DISSATISFIED` - Dissatisfied (with job, supervisor, etc.)
- `Resigned` - Voluntary resignation
- `Terminated` - Involuntary termination
- `Retired` - Retirement

Full mapping documented in TERMINATION_METHODOLOGY.md

---

### Employment Classification Fields

| Field Name | Data Type | Description | Example Values | Critical Notes |
|------------|-----------|-------------|----------------|----------------|
| **User_Person_Type** | Text | Employee classification | Employee, Faculty | Determines if Faculty or Staff |
| **Assignment_Category** | Text | Employment terms code | F12, PT12, CWS | Same codes as workforce data |
| **Grade** | Text | Employee grade/level | E, F, G, J, Y | Organizational hierarchy |
| **Hourly/Salaried** | Text | Compensation type | Hourly, Salaried | Determines Exempt/Non-Exempt |
| **Faxc_Staff** | Text | Faculty or Staff flag | Staff, Faculty | Legacy classification field |
| **People_Group** | Text | Detailed employee group | ...Non Exempt Staff 6110 | Combines multiple attributes |
| **Benefit_Program_(Description)** | Text | Benefits program | Cobra Eligible, etc. | Benefit eligibility indicator |

---

### Organizational Fields

| Field Name | Data Type | Description | Example Values |
|------------|-----------|-------------|----------------|
| **Dept_Name** | Text | Department name | 204000 Chemistry Department |
| **School** | Text | School affiliation | Arts & Sciences, Facilities, Athletics |
| **VP_Area** | Text | Vice President area | PROV, EVP, PRES |
| **Job_Name** | Text | Job title | Lead Custodian, Internal Operations Manager |
| **Location** | Text | Work location | Omaha, Phoenix |

---

### Demographic Fields

| Field Name | Data Type | Description | Values/Notes | Kept in Cleaned Data |
|------------|-----------|-------------|--------------|---------------------|
| **Gender** | Text | Employee gender | M, F | ✅ YES |
| **Ethnicity** | Text | Employee ethnicity | White, Asian, Hispanic, etc. | ✅ YES |
| **Person_Date_of_Birth** | Date | Employee birth date | 1990-06-07 | ✅ YES (for age calculation validation) |
| **Disabled** | Text/Boolean | Disability status | Yes, No, blank | ✅ YES (for diversity metrics) |
| **Vet_Status** | Text | Veteran status | Not a Protected Veteran, etc. | ✅ YES (for diversity metrics) |

**Note**: Names are removed for privacy, but Empl_num retained for joining with workforce data

---

### Working Hours Fields

| Field Name | Data Type | Description | Notes |
|------------|-----------|-------------|-------|
| **Std_Working_Hours** | Number | Standard annual hours | 2080 for full-time |
| **Normal_Working_Hours** | Number | Normal working hours | May differ from standard |

---

## Calculated Fields (Added During Cleaning)

### Tenure Fields

| Field Name | Data Type | Description | Calculation | Example |
|------------|-----------|-------------|-------------|---------|
| **Tenure** | Float | Years of service | (Term_Date - Hire_Date) / 365.25 | 2.3 years |
| **Tenure_Band** | Text | Service length category | Banding logic in METHODOLOGY | "1-3 Years" |

**Tenure Bands:**
- "<1 Year" - Less than 1 year of service
- "1-3 Years" - 1 to less than 3 years
- "3-5 Years" - 3 to less than 5 years
- "5-10 Years" - 5 to less than 10 years
- "10+ Years" - 10 or more years

---

### Employee Category (Standardized)

| Field Name | Data Type | Description | Logic |
|------------|-----------|-------------|-------|
| **Employee_Category** | Text | Standardized employee type | See TERMINATION_METHODOLOGY.md |

**Categories:**
- "Faculty" - Faculty members
- "Staff Exempt" - Salaried/exempt staff
- "Staff Non-Exempt" - Hourly/non-exempt staff
- "House Staff" - If Assignment_Category = "HSR"
- "Students" - If Assignment_Category in ("CWS", "SUE")
- "Other" - Other employment types

**Logic**: Derived from User_Person_Type, Hourly/Salaried, and Assignment_Category

---

### Termination Type Classification

| Field Name | Data Type | Description | Values |
|------------|-----------|-------------|--------|
| **Termination_Type** | Text | Termination classification | Voluntary, Involuntary, Retirement |

**Classification Logic:**
- **Voluntary**: Resigned, Better Opportunity, Relocation, Personal Reasons
- **Involuntary**: Terminated, Laid Off, Performance
- **Retirement**: Retirement codes

Full mapping in TERMINATION_METHODOLOGY.md

---

### Location Fields

| Field Name | Data Type | Description | Values | Logic |
|------------|-----------|-------------|--------|-------|
| **Campus** | Text | Standardized campus code | OMA, PHX, Unknown | Derived from Location field |

**Campus Mapping:**
- "OMA" if Location contains "Omaha"
- "PHX" if Location contains "Phoenix"
- "Unknown" otherwise

---

### Temporal Fields (Fiscal Calendar)

| Field Name | Data Type | Description | Format | Logic |
|------------|-----------|-------------|--------|-------|
| **Termination_Fiscal_Year** | Text | Fiscal year of termination | FY25 | Based on Term_Date (FY starts July 1) |
| **Termination_Fiscal_Quarter** | Text | Fiscal quarter | Q1, Q2, Q3, Q4 | Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun |
| **Termination_Fiscal_Period** | Text | Combined period identifier | Q4 FY25 | Format: "Q# FY##" |

---

## Fiscal Calendar Reference

### Fiscal Year Structure
- **Fiscal Year Start**: July 1
- **Fiscal Year End**: June 30
- **Format**: FY## (e.g., FY25 = July 1, 2024 - June 30, 2025)

### Fiscal Quarters

| Quarter | Months | Typical Data Export Date |
|---------|--------|-------------------------|
| **Q1** | July - September | September 30 |
| **Q2** | October - December | December 31 |
| **Q3** | January - March | March 31 |
| **Q4** | April - June | June 30 (Year-End) |

---

## Data Quality Notes

### Known Limitations
- **Pre-FY20 Data**: Excluded from cleaned data (aligns with workforce methodology)
- **Missing Fields**: Some records may have null values in optional fields
- **Term Reason Codes**: Some codes may be ambiguous or require manual classification

### Validation Rules
- No duplicate Empl_num per termination event
- All Term_Date values must be valid dates
- Hire_Date must be before or equal to Term_Date
- Tenure calculations must be non-negative
- Fiscal period assignments must be valid

---

## Joining with Workforce Data

### Join Key
**Primary Join**: `Empl_num`

### Use Cases
**Calculate Turnover Rates:**
```
For Period = Q4 FY25:
  Headcount = COUNT DISTINCT(workforce[Empl_num]) WHERE END_DATE = '2025-06-30'
  Terminations = COUNT(terminations[Empl_num]) WHERE Term_Qtr_End_Date = '2025-06-30'
  Turnover_Rate = (Terminations / Headcount) * 100
```

**Employee Context:**
- Join to get employee's department size
- Join to get employee's full demographics
- Join to understand if employee was in last snapshot before leaving

---

## Common Term Reason Codes

### Voluntary Terminations
- `CRUNV_BETTER_OP` - Better Opportunity
- `CRUNV_RELOCATION` - Relocation
- `CRUNV_PERSONAL` - Personal/Family Reasons
- `CRUNV_RETURN_SCHOOL` - Returning to School
- `Resigned` - General Resignation

### Involuntary Terminations
- `CRUNV_PERFORMANCE` - Performance Issues
- `CRUNV_CONDUCT` - Conduct Violations
- `Terminated` - General Termination
- `Laid Off` - Reduction in Force

### Retirement
- `CRUNV_RETIREMENT` - Retirement
- `Retired` - Retirement

### Other
- `CRUNV_END_TEMP` - Temporary Assignment Ended
- `CRUNV_END_CONTRACT` - Contract Ended
- End of academic appointment

---

## Grade Code Reference

| Grade | Typical Positions | Employee Type |
|-------|------------------|---------------|
| **A-D** | Entry-level staff | Staff Non-Exempt |
| **E-F** | Mid-level staff | Staff Exempt |
| **G-I** | Senior staff, managers | Staff Exempt |
| **J-K** | Directors, senior managers | Staff Exempt |
| **IT01-05** | IT-specific grades | Staff (varies) |
| **X** | Special classifications | Varies |
| **Y** | Faculty and senior positions | Faculty/Staff Exempt |

---

## Data Quality Metrics (FY25 Q4 Export)

### Source File Statistics
- **Total Records**: 11,418
- **Date Range**: 2017-01-01 to 2025-06-30
- **Columns**: 29

### Expected Cleaned Data (FY20+)
- **Expected Records**: ~6,000-7,000 (filtered to FY20+)
- **Columns**: ~35 (original + calculated fields)
- **Fiscal Years**: FY20, FY21, FY22, FY23, FY24, FY25

---

## Related Documentation

- **TERMINATION_METHODOLOGY.md**: Calculation logic and business rules
- **DATA_GOVERNANCE_STANDARDS.md**: Quarterly archive standards
- **DATA_CLEANING_AUDIT.md**: Per-quarter transformation audit trail
- **Workforce DATA_DICTIONARY.md**: For joining and context

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-29 | 1.0 | Initial DATA_DICTIONARY.md created for termination data |

---

*This data dictionary is maintained to ensure consistent understanding and usage of termination data across all dashboards and reports.*
