# New Hires Data Methodology

## Overview
This document describes the methodology for calculating and analyzing new hire data from HR system exports for Creighton University's recruiting dashboard.

## Data Source
- **Primary File**: `source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT.xlsx`
- **Extraction Script**: `scripts/extract_q1_fy26_new_hires.py`
- **Output Location**: `source-metrics/recruiting/cleaned/FY26_Q1/q1_fy26_new_hires.json`
- **Date Range**: Fiscal year basis (July 1 - June 30) with quarterly snapshots

## Key Fields and Definitions

### Employee Identification
- **Empl num**: Unique employee identifier
- **Note**: Count unique employee IDs to avoid duplicates from multiple snapshot appearances

### Date Fields
- **Current Hire Date**: The employee's hire date (used to determine when hired)
- **END DATE**: Snapshot date in the source system (not used for hire date filtering)

### Classification Fields

#### Employee Type Classification
Employee type is determined by the `Person Type` field:
- **FACULTY**: Classified as Faculty
- **STAFF**: Classified as Staff

When `Person Type` is ambiguous, fallback to assignment category:
- F09, F10, F11 typically indicate Faculty
- Other codes default to Staff

### Benefit Eligibility Criteria

**CRITICAL: Two-Step Filter Process**

#### Step 1: Assignment Category Filter
Only include employees with benefit-eligible assignment categories:

**Faculty Categories (Benefit Eligible)**:
- **F12**: Full-time Faculty (12-month)
- **F11**: Faculty (11-month)
- **F10**: Faculty (10-month)
- **F09**: Faculty (9-month)

**Staff Categories (Benefit Eligible)**:
- **PT12**: Part-time Staff (12-month)
- **PT11**: Part-time Staff (11-month)
- **PT10**: Part-time Staff (10-month)
- **PT9**: Part-time Staff (9-month)

**Excluded Categories (NOT Benefit Eligible)**:
- **HSR**: House Staff Residents/Physicians
- **TEMP**: Temporary Workers
- **NBE**: Non-Benefit Eligible
- **PRN**: As-Needed/Per Diem Workers
- **SUE**: Student University Employees
- **CWS**: College Work Study

#### Step 2: Grade R Exclusion

**CRITICAL EXCLUSION**: Grade R (Residents/Fellows)

Even if an employee has a benefit-eligible assignment category (F12, PT12, etc.), they must be excluded if their Grade Code starts with "R":

```
Benefit_Eligible_New_Hires = WHERE
    Assignment_Category IN ('F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9')
    AND Grade_Code NOT LIKE 'R%'
```

**Job Titles Excluded by Grade R**:
- Physical Therapy Resident
- Occupational Therapy Fellow
- Pharmacy Resident
- Other residency/fellowship positions

**Rationale**: These are training programs with different compensation and benefits structures, not standard benefit-eligible employment.

## Calculation Methodology

### 1. New Hire Count Calculation

```python
# Step 1: Filter by hire date range (Q1 FY26 = July 1 - September 30, 2025)
q1_hires = WHERE Hire_Date >= '2025-07-01' AND Hire_Date <= '2025-09-30'

# Step 2: Filter for benefit-eligible assignment categories
be_hires = WHERE Assignment_Category IN (
    'F12', 'F11', 'F10', 'F09',
    'PT12', 'PT11', 'PT10', 'PT9'
)

# Step 3: Exclude Grade R (Residents/Fellows)
final_hires = WHERE Grade_Code NOT LIKE 'R%'

# Step 4: Deduplicate by Employee ID
unique_hires = DISTINCT(Empl_num)
```

### 2. Faculty vs. Staff Classification

```python
def classify_employee(row):
    if row['Person Type'] == 'FACULTY':
        return 'Faculty'
    elif row['Person Type'] == 'STAFF':
        return 'Staff'
    elif row['Assignment Category'] in ['F09', 'F10', 'F11']:
        return 'Faculty'  # These codes are typically faculty-only
    else:
        return 'Staff'
```

### 3. Location Normalization

Location values are normalized to Omaha or Phoenix:
- Values containing "Phoenix" or "PHX" → Phoenix
- Values containing "Omaha" or starting with "HR " → Omaha
- Default → Omaha

### 4. School/Organization Mapping

The `New School` field provides the school/organization classification:
- Arts & Sciences
- Medicine
- Dentistry
- Nursing
- Heider College of Business
- Law School
- Pharmacy & Health Professions
- And others...

## Q1 FY26 Results Summary

**Reporting Period**: July 1 - September 30, 2025
**Data Available Through**: August 31, 2025

| Metric | Count |
|--------|-------|
| **Total Benefit-Eligible New Hires** | **69** |
| Faculty | 31 |
| Staff | 38 |
| Omaha Campus | 68 |
| Phoenix Campus | 1 |

### Monthly Breakdown

| Month | Faculty | Staff | Total |
|-------|---------|-------|-------|
| July 2025 | 25 | 17 | 42 |
| August 2025 | 6 | 21 | 27 |
| September 2025 | 0 | 0 | 0* |

*September data pending next Oracle HCM refresh

### Top Schools/Organizations

| School | Faculty | Staff | Total |
|--------|---------|-------|-------|
| Arts & Sciences | 17 | 0 | 17 |
| Medicine | 2 | 6 | 8 |
| Facilities | 0 | 8 | 8 |
| Dentistry | 4 | 3 | 7 |
| Heider College of Business | 3 | 2 | 5 |

### Grade R Exclusions

13 employees were excluded due to Grade R classification:
- Pharmacy Resident
- Physical Therapy Resident
- Occupational Therapy Fellow

## Data Quality and Validation

### 1. Validation Rules

**Hire Date Validation**:
```
All hires must have Hire_Date within fiscal quarter range
```

**Category Validation**:
```
All hires must have valid Assignment_Category code
```

**Deduplication Check**:
```
COUNT(DISTINCT Empl_num) = Final_Count
```

### 2. Data Quality Checks

1. **No Duplicate Employees**: Verify unique employee IDs after deduplication
2. **Valid Hire Dates**: All hire dates within reporting period
3. **Assignment Category**: Every hire has a valid benefit-eligible code
4. **Grade R Properly Excluded**: Verify residents/fellows not in count
5. **Faculty/Staff Split**: Sum equals total

### 3. Known Data Limitations

**Q1 FY26 Specific**:
- Data available through August 31, 2025 only
- September 2025 hires will be included in next data refresh
- Estimated 10-15 additional September hires expected

**General Limitations**:
- Multiple applicant tracking systems (2 ATS + manual hires)
- Excel export may lag actual HRIS by 1-2 weeks
- Some location data requires normalization

## Comparison with Other Metrics

### Relationship to Headcount Data

New hires contribute to headcount growth:
```
End Period Headcount = Start Period Headcount + New Hires - Departures
```

**Q1 FY26 Reconciliation**:
- Q4 FY25 Benefit-Eligible: ~2,116
- Q1 FY26 New Hires: 69
- Q1 FY26 Departures: 58
- Expected Net Change: +11

### Relationship to Turnover Data

Early turnover (< 1 year) in Q1 FY26: 13 employees
- These were hired within the past year but departed in Q1 FY26
- Not included in current quarter new hire counts

## Integration with Dashboards

### 1. Recruiting Dashboard
- New hire counts by period
- Faculty vs. staff distribution
- Hiring by school/organization
- Monthly trends

### 2. Workforce Dashboard
- Provides context for headcount changes
- Faculty/staff composition trends
- Location distribution

### 3. Turnover Dashboard
- Early turnover compared to new hire volume
- Retention of recent hires

## Update Frequency and Maintenance

### Regular Updates
- **Quarterly**: Update new hire data within 10 days of quarter close
- **Monthly**: Optional interim updates for recruiting dashboard

### Maintenance Tasks
1. **Data Validation**: Verify counts after each extraction
2. **Grade R Review**: Confirm new residency programs are properly excluded
3. **Category Updates**: Check for new assignment category codes
4. **Script Updates**: Update extraction script for any schema changes

## Data Processing Script

### Script Location
`scripts/extract_q1_fy26_new_hires.py`

### Usage
```bash
cd scripts
python3 extract_q1_fy26_new_hires.py
```

### Output
- JSON file: `source-metrics/recruiting/cleaned/FY26_Q1/q1_fy26_new_hires.json`
- Console summary with validation

### Script Parameters
The script uses these constants that may need updating for future periods:
```python
Q1_FY26_START = pd.Timestamp('2025-07-01')
Q1_FY26_END = pd.Timestamp('2025-09-30')

BENEFIT_ELIGIBLE_CODES = [
    'F12', 'F11', 'F10', 'F09',
    'PT12', 'PT11', 'PT10', 'PT9'
]
```

## Common Issues and Troubleshooting

### Issue 1: Missing September Data
**Symptoms**: September shows 0 hires
**Causes**: Oracle HCM export hasn't been refreshed
**Resolution**: Wait for next data refresh, document in output notes

### Issue 2: Higher Than Expected Grade R Exclusions
**Symptoms**: Many employees excluded due to Grade R
**Causes**: New residency programs added
**Resolution**: Verify exclusions are legitimate residents/fellows

### Issue 3: Faculty/Staff Misclassification
**Symptoms**: F12 employees showing as wrong category
**Causes**: Person Type field inconsistency
**Resolution**: Check Person Type field, may need manual review

### Issue 4: Location Data Issues
**Symptoms**: Unknown or missing locations
**Causes**: New building codes not in normalization map
**Resolution**: Update location normalization function

## Version History

### Current Version
- **Version**: 1.0
- **Last Updated**: December 2025
- **Data Through**: August 31, 2025 (Q1 FY26 partial)

### Change Log
- **December 2025**: Initial methodology documentation created
- **December 2025**: Created extraction script for Q1 FY26 new hires

## References and Related Documentation

- **WORKFORCE_METHODOLOGY.md**: Employee classification and headcount methodology
- **TURNOVER_METHODOLOGY.md**: Termination data methodology
- **EXIT_SURVEY_METHODOLOGY.md**: Exit survey data collection
- **PROJECT_STATUS.md**: Overall project status

---

**Last Updated**: December 2025
**Next Review**: After Q2 FY26 data available (January 2026)
