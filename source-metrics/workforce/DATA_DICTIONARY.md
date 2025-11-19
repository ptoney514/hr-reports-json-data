# Workforce Data Dictionary

## Overview
This document provides a comprehensive reference for all fields in the workforce headcount dataset. Use this as a quick lookup guide for field definitions, codes, and data types.

---

## Source Data Information

### Primary Source File
- **File Name**: `New Emp List since FY20 to Q1FY25 1031 PT.xlsx`
- **Location**: `source-metrics/workforce-headcount/`
- **Export Source**: HR System (Workday)
- **Update Frequency**: Quarterly snapshots
- **Data Scope**: All active employees as of snapshot date

### Cleaned Data Output
- **File Name**: `workforce_cleaned.csv`
- **Location**: `source-metrics/workforce-headcount/cleaned_data/`
- **Format**: UTF-8 CSV
- **Generation**: Automated via `scripts/clean_workforce_data.py`

---

## Core Field Definitions

### Employee Identification Fields

| Field Name | Data Type | Description | Notes |
|------------|-----------|-------------|-------|
| **Empl num** | Number | Unique employee identifier | Primary key for employee records |
| **Net ID** | Text | Network login ID | Used for system access |
| **Last Name** | Text | Employee last name | |
| **First Name** | Text | Employee first name | |

### Classification Fields

| Field Name | Data Type | Description | Example Values | Critical Notes |
|------------|-----------|-------------|----------------|----------------|
| **Person Type** | Text | Employee classification | STAFF, FACULTY | **KEY FIELD**: Determines Staff vs Faculty classification for benefit-eligible employees |
| **Assignment Category Code** | Text | Employment terms code | F12, PT10, HSR | **IMPORTANT**: Indicates employment TERMS, NOT employee type (see Assignment Category Codes table below) |
| **Employee Category** | Text | Derived category | Benefit Staff, Faculty, House Staff, Students, Non-Benefit | Calculated field - see WORKFORCE_METHODOLOGY.md |
| **Grade Code** | Text | Employee grade/level | | Organizational hierarchy level |
| **Hourly/Salaried** | Text | Compensation type | Hourly, Salaried | Pay structure |
| **Benefit Eligible** | Text | Benefits eligibility flag | Yes, No | Calculated based on Assignment Category Code |

### Temporal Fields

| Field Name | Data Type | Description | Format | Notes |
|------------|-----------|-------------|--------|-------|
| **END DATE** | Date | Snapshot date | YYYY-MM-DD | Date when workforce count was captured |
| **Current Hire Date** | Date | Most recent hire date | YYYY-MM-DD | Resets if employee leaves and returns |
| **Snapshot Fiscal Year** | Text | Fiscal year of snapshot | FY23, FY24, FY25 | Calculated field (FY starts July 1) |
| **Snapshot Fiscal Quarter** | Text | Fiscal quarter of snapshot | Q1, Q2, Q3, Q4 | Calculated field |
| **Snapshot Fiscal Period** | Text | Combined period identifier | Q1 FY25 | Format: "Q# FY##" |

### Organizational Fields

| Field Name | Data Type | Description | Example Values |
|------------|-----------|-------------|----------------|
| **Job Name** | Text | Job title | Associate Professor, Financial Analyst |
| **Organization Name** | Text | Department/organization | School of Medicine, Finance Department |
| **Dept Num** | Number | Department number | Unique dept identifier |
| **New VP** | Text | Vice President area | VPSL, VPEM, VPFN, etc. |
| **New School** | Text | School affiliation | Medicine, Arts & Sciences, Business |

### Location Fields

| Field Name | Data Type | Description | Values | Notes |
|------------|-----------|-------------|--------|-------|
| **Location** | Text | Original location | Omaha, Phoenix | From source data |
| **Campus** | Text | Standardized campus code | OMA, PHX | Calculated/standardized field |
| **State** | Text | Employee state | NE, AZ, etc. | |

### Demographic Fields

| Field Name | Data Type | Description | Values/Notes |
|------------|-----------|-------------|--------------|
| **Gender** | Text | Employee gender | |
| **Employee Ethnicity** | Text | Employee ethnicity | |
| **Age** | Number | Employee age in years | As of snapshot date |
| **Age Band** | Text | Age range grouping | 20-29, 30-39, 40-49, etc. |

### Tenure Fields

| Field Name | Data Type | Description | Notes |
|------------|-----------|-------------|-------|
| **LOS** | Number | Length of Service (years) | Calculated from Current Hire Date |
| **LOS Band** | Text | Length of service range | 0-1 years, 1-3 years, etc. |

---

## Assignment Category Code Reference

**CRITICAL UNDERSTANDING**: Assignment Category Codes indicate employment **TERMS** (duration and time commitment), **NOT** employee type (Staff vs Faculty).

### Full-Time Codes (F-codes)

| Code | Full Description | Meaning |
|------|------------------|---------|
| **F12** | Full-time 12-month | Full-time employee working 12 months per year |
| **F11** | Full-time 11-month | Full-time employee working 11 months per year |
| **F10** | Full-time 10-month | Full-time employee working 10 months per year |
| **F09** | Full-time 9-month | Full-time employee working 9 months per year |

**Note**: F-codes can be used for both STAFF and FACULTY. The **Person Type** field determines whether the employee is Staff or Faculty.

### Part-Time Codes (PT-codes)

| Code | Full Description | Meaning |
|------|------------------|---------|
| **PT12** | Part-time 12-month | Part-time employee working 12 months per year |
| **PT11** | Part-time 11-month | Part-time employee working 11 months per year |
| **PT10** | Part-time 10-month | Part-time employee working 10 months per year |
| **PT9** | Part-time 9-month | Part-time employee working 9 months per year |

**Note**: PT-codes can be used for both STAFF and FACULTY. The **Person Type** field determines whether the employee is Staff or Faculty.

### Special Category Codes

| Code | Full Description | Category | Benefit Eligible |
|------|------------------|----------|------------------|
| **HSR** | House Staff Residents/Physicians | House Staff Physicians | Yes |
| **SUE** | Student University Employee | Student Workers | No |
| **CWS** | College Work Study (Federal Work Study) | Student Workers | No |
| **TEMP** | Temporary Worker | Non-Benefit Eligible | No |
| **NBE** | Non-Benefit Eligible | Non-Benefit Eligible | No |
| **PRN** | As-Needed/Per Diem Worker | Non-Benefit Eligible | No |

---

## Campus Codes

| Code | Full Name | Primary Location |
|------|-----------|------------------|
| **OMA** | Omaha Campus | Omaha, Nebraska |
| **PHX** | Phoenix Campus | Phoenix, Arizona |

---

## Fiscal Calendar Reference

### Fiscal Year Structure
- **Fiscal Year Start**: July 1
- **Fiscal Year End**: June 30
- **Format**: FY## (e.g., FY25 = July 1, 2024 - June 30, 2025)

### Fiscal Quarters

| Quarter | Months | Typical Snapshot Date |
|---------|--------|----------------------|
| **Q1** | July - September | September 30 |
| **Q2** | October - December | December 31 |
| **Q3** | January - March | March 31 |
| **Q4** | April - June | June 30 (Year-End) |

---

## Age Bands

| Age Band | Age Range |
|----------|-----------|
| Under 20 | < 20 years |
| 20-29 | 20-29 years |
| 30-39 | 30-39 years |
| 40-49 | 40-49 years |
| 50-59 | 50-59 years |
| 60-69 | 60-69 years |
| 70+ | 70+ years |

---

## Length of Service (LOS) Bands

| LOS Band | Service Range |
|----------|---------------|
| 0-1 years | Less than 1 year |
| 1-3 years | 1 to less than 3 years |
| 3-5 years | 3 to less than 5 years |
| 5-10 years | 5 to less than 10 years |
| 10-15 years | 10 to less than 15 years |
| 15-20 years | 15 to less than 20 years |
| 20+ years | 20 or more years |

---

## Data Quality Notes

### Known Limitations
- **Pre-2023 Data**: Excluded from analysis per methodology
- **Missing Assignment Codes**: Records with null Assignment Category Codes are excluded
- **Campus Assignment**: Based on Location field; may not reflect remote workers
- **Person Type**: Critical for proper categorization; missing values may result in "Other" category

### Validation Rules
- No duplicate Employee IDs per snapshot date
- All included records have valid Assignment Category Code
- All dates are valid and fall within expected ranges
- Total headcount equals sum of all categories

---

## Related Documentation

- **WORKFORCE_METHODOLOGY.md**: Categorization logic and calculation methods
- **DATA_CLEANING_AUDIT.md**: Audit trail of data transformations
- **README.md**: Project overview and setup instructions

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-17 | 1.0 | Initial DATA_DICTIONARY.md created with corrected Person Type logic |

---

*This data dictionary is maintained to ensure consistent understanding and usage of workforce data across all dashboards and reports.*
