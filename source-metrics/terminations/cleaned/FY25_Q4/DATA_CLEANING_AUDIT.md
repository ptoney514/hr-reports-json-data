# Data Cleaning Audit - Termination Data FY25_Q4

## Metadata
- **Source File**: `../../FY25_Q4/Terms Since 2017 Detail PT.xlsx`
- **Cleaning Date**: 2025-10-29
- **Cleaned By**: Automated script (clean_termination_data.py)
- **Script Location**: `scripts/clean_termination_data.py`
- **Output File**: `terminations_cleaned.csv`

## Source Data Summary
- **Original Records**: 11,418
- **Original Columns**: 29
- **Source System**: Workday Termination Report
- **Data Scope**: All terminations since 2017

## Transformations Applied

### 1. Column Standardization
**Action**: Standardized column names
- Removed spaces, replaced with underscores
- Removed parentheses and special characters
- Examples:
  - "Empl Num" → "Empl_Num"
  - "Term Date" → "Term_Date"
  - "User Person Type" → "User_Person_Type"
  - "Benefit Program (Description)" → "Benefit_Program_Description"

### 2. Date Filtering
**Action**: Filtered to FY2020 onwards
- **Reason**: Align with workforce data methodology (FY20+ only)
- **Filter**: Term_Date >= 2020-07-01
- **Records Removed**: 5,806 records (pre-FY20)
- **Records Retained**: 5,612 records

### 3. Privacy and Anonymization
**Action**: Removed personal identifiers
- ❌ **Removed**: Last_Name, First_Name, Middle_Name, Display_Name
- ✅ **Kept**: Empl_Num (for joining with workforce data)
- ✅ **Kept**: Person_Date_of_Birth (for age calculations and validation)
- ✅ **Kept**: Disabled, Vet_Status (for diversity metrics)

**Rationale**: Protect employee privacy while maintaining analytical capability

### 4. Calculated Fields Added

#### Tenure (Years of Service)
**Formula**: `(Term_Date - Hire_Date) / 365.25`
**Data Type**: Float
**Purpose**: Measure how long employee worked before leaving

#### Tenure_Band
**Logic**: Categorize tenure into bands
- "<1 Year" if Tenure < 1
- "1-3 Years" if 1 <= Tenure < 3
- "3-5 Years" if 3 <= Tenure < 5
- "5-10 Years" if 5 <= Tenure < 10
- "10+ Years" if Tenure >= 10
- "Unknown" if Tenure is NULL

**Distribution**:
Tenure_Band
1-3 Years     2111
<1 Year       1411
3-5 Years     1293
5-10 Years     435
10+ Years      362

#### Employee_Category
**Logic**: Standardized classification from User_Person_Type, Hourly/Salaried, Assignment_Category
- "Faculty" - Faculty members
- "Staff Exempt" - Salaried/exempt staff
- "Staff Non-Exempt" - Hourly/non-exempt staff
- "House Staff" - House staff physicians (HSR)
- "Students" - Student workers (CWS, SUE)
- "Other" - Other classifications

**Distribution**:
Employee_Category
Students            2486
Staff Non-Exempt    1045
House Staff          828
Staff Exempt         652
Faculty              600
Other                  1

Full logic documented in TERMINATION_METHODOLOGY.md

#### Termination_Type
**Logic**: Classified from Term_Reason_1 and Term_Reason_2
- "Voluntary" - Employee-initiated (Resigned, Better Opportunity, etc.)
- "Involuntary" - Employer-initiated (Terminated, Performance, etc.)
- "Retirement" - Retirement
- "Other" - Cannot determine from reason codes

**Distribution**:
Termination_Type
End of Assignment    3193
Voluntary            1154
Graduation            855
Retirement            243
Involuntary            88
Other                  59
Death                  20

Full classification rules in TERMINATION_METHODOLOGY.md

#### Campus
**Logic**: Standardized from Location field
- "OMA" if Location contains "Omaha"
- "PHX" if Location contains "Phoenix"
- "Unknown" otherwise

**Distribution**:
Campus
OMA        4817
Unknown     434
PHX         361

#### Fiscal Period Fields
**Termination_Fiscal_Year**: Fiscal year of termination (FY starts July 1)
**Termination_Fiscal_Quarter**: Q1 (Jul-Sep), Q2 (Oct-Dec), Q3 (Jan-Mar), Q4 (Apr-Jun)
**Termination_Fiscal_Period**: Combined format "Q# FY##"

**Fiscal Periods in Data**:
Termination_Fiscal_Period
Q1 FY21    188
Q1 FY22    262
Q1 FY23    291
Q1 FY24    229
Q1 FY25    128
Q1 FY26    111
Q2 FY21    254
Q2 FY22    249
Q2 FY23    231
Q2 FY24    101
Q2 FY25     62
Q3 FY21    122
Q3 FY22    169
Q3 FY23    314
Q3 FY24     65
Q3 FY25     69
Q4 FY21    722
Q4 FY22    718
Q4 FY23    651
Q4 FY24    304
Q4 FY25    372

### 5. Data Quality Checks Performed
- [x] Removed duplicate records: 0 duplicates found
- [x] Validated dates: Term_Date >= Hire_Date
- [x] Tenure calculations verified
- [x] Employee categories assigned to all records
- [x] Termination types classified
- [x] Fiscal periods calculated

## Output Data Summary
- **Final Records**: 5,612
- **Final Columns**: 32
- **Date Range**: 2020-07-01 to 2025-09-30
- **Fiscal Periods**: 21 unique periods
- **Unique Employees**: 5,470

## Data Quality Issues Found

### Invalid Tenure Records
- **Issue**: 0 records had missing or invalid tenure
- **Cause**: Missing Hire_Date or Term_Date < Hire_Date
- **Action**: Tenure set to NULL, Tenure_Band = "Unknown"
- **Impact**: These records kept but tenure analysis limited

### Missing Fields
- Gender missing: 2 records
- Ethnicity missing: 1793 records
- Location missing: 201 records

## Validation Results
- ✅ Total terminations by fiscal period calculated
- ✅ Employee categories sum to total
- ✅ Termination types classified for all records
- ✅ Fiscal period assignments validated
- ✅ No data loss in required fields
- ✅ Privacy fields removed successfully

## Files Generated
1. `terminations_cleaned.csv` - Main cleaned dataset (5,612 records)
2. `DATA_CLEANING_AUDIT.md` - This audit file

## Reproducibility
To reproduce this cleaning:
```bash
cd workforce-dashboard-excel
python scripts/clean_termination_data.py --quarter FY25_Q4
```

## Next Steps
1. Review cleaned data quality
2. Join with workforce headcount data to calculate turnover rates
3. Build turnover analytics dashboards
4. Validate calculations against HR official reports

---
*Cleaning completed: 2025-10-29*
*Script version: clean_termination_data.py*
*Next cleaning: When next quarter data received (e.g., FY26_Q1)*
