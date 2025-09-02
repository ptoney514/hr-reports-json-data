# Turnover Data Methodology

## Overview
This document describes the methodology for calculating and analyzing employee turnover data from HR system exports.

## Data Source
- **Primary File**: `source-metrics/turnover/fy[YY]/Terms Since 2017 Detail PT.xlsx`
- **Sheet Used**: Sheet1 (contains the actual termination data)
- **Date Range**: Fiscal year basis (July 1 - June 30)

## Key Fields and Definitions

### Employee Identification
- **Empl Num**: Unique employee identifier
- **Note**: Count unique employee numbers to avoid duplicates

### Date Fields
- **Term Date**: Employee termination date (Excel serial number format)
- **Hire Date**: Employee start date (Excel serial number format)
- **Conversion**: Excel dates are days since 1900-01-01, converted using:
  ```javascript
  new Date((excelDate - 25569) * 86400 * 1000)
  ```

### Classification Fields
- **Faxc Staff**: Faculty/Staff classification
  - Values containing "fac" = Faculty
  - All others = Staff
- **Assignment Category**: Employment type classification
  - **IMPORTANT**: Exclude the following categories from standard turnover counts:
    - HSR (Hourly Student Rate)
    - CWS (College Work Study)
    - SUE (Student University Employee)
    - TEMP (Temporary employees)
    - PRN (As-needed/Per diem)
    - NBE (Non-benefited employees)
  - Included categories: F12, F11, F09, PT12, PT10, PT9, and other regular employee categories

### Termination Information
- **Term Reason 2**: HR-entered termination reason
  - Note: May differ from employee-reported exit survey reason
  - Common reasons: Resigned, Graduated, End Assignment, Retirement, Better Opportunity

## Calculation Methodology

### 1. Total Turnover Count
```
Total Turnover = COUNT(DISTINCT Empl Num) 
WHERE Term Date BETWEEN FY_START AND FY_END
AND Assignment Category NOT IN ('HSR', 'CWS', 'SUE', 'TEMP', 'PRN', 'NBE')
```

### 2. Quarterly Breakdown
- **Q1**: July 1 - September 30
- **Q2**: October 1 - December 31
- **Q3**: January 1 - March 31
- **Q4**: April 1 - June 30

### 3. Faculty vs Staff Split
```
Faculty Count = COUNT WHERE Faxc Staff CONTAINS 'fac'
Staff Count = Total Count - Faculty Count
```

### 4. Years of Service
```
Years of Service = (Term Date - Hire Date) / 365.25
```

Categorization:
- 0-1 years
- 1-3 years
- 3-5 years
- 5-10 years
- 10-15 years
- 15-20 years
- 20+ years

### 5. Termination Reason Analysis
- Count occurrences of each Term Reason 2
- Calculate percentages based on total unique employees
- Sort by frequency for reporting

## Response Rate Calculation

When combined with exit survey data:
```
Response Rate = (Exit Survey Responses / Total Turnover) × 100
```

Where:
- Exit Survey Responses = Count of completed surveys for the period
- Total Turnover = Unique terminations excluding TEMPS

## FY25 Example Results

Based on processing the FY25 data (excluding HSR, CWS, SUE, TEMP, PRN, NBE):
- **Total Unique Terminations**: 222 (regular employees only)
- **Faculty**: 32 (14.4%)
- **Staff**: 186 (83.8%)
- **Unknown**: 4 (1.8%)
- **Average Years of Service**: 6.5 years

### Excluded Categories Impact:
- HSR: 18 records excluded
- CWS: 21 records excluded  
- SUE: 116 records excluded
- TEMP: 61 records excluded
- PRN: 4 records excluded
- **Total Excluded**: 220 records

### Quarterly Distribution:
- Q1: 79 terminations (35.6%)
- Q2: 36 terminations (16.2%)
- Q3: 52 terminations (23.4%)
- Q4: 51 terminations (23.0%)

### Top Termination Reasons:
1. Resigned: 50.0%
2. Retirement: 12.2%
3. End Assignment: 10.4%
4. Better Opportunity: 9.5%
5. Personal Reasons: 5.9%

## Data Quality Notes

1. **Date Validation**: Ensure Term Date falls within fiscal year boundaries
2. **Duplicate Handling**: Use DISTINCT on Empl Num to avoid counting multiple records for same employee
3. **Missing Data**: Handle null/empty fields appropriately
4. **Category Exclusions**: Critical to exclude HSR, CWS, SUE, TEMP, PRN, NBE for accurate permanent workforce turnover metrics
5. **Faculty/Staff Classification**: Check for variations in "Faxc Staff" field spelling
6. **Assignment Category Values**: Verify exact spelling and case sensitivity of categories to exclude

## Integration with Exit Surveys

This turnover data provides the denominator for calculating exit survey response rates:
- Match turnover periods with survey collection periods
- Calculate response rates by quarter and overall
- Compare HR-entered termination reasons with employee-reported reasons
- Analyze patterns between turnover metrics and survey satisfaction scores

## Processing Script

The automated processing script is located at:
`scripts/processTurnoverData.js`

This script:
1. Reads the Excel file from source-metrics
2. Filters for fiscal year date range
3. Excludes TEMPS category
4. Calculates all metrics described above
5. Outputs to `src/data/fy[YY]TurnoverData.json`

## Update Frequency

Turnover data should be processed:
- Quarterly for interim reporting
- Annually for comprehensive analysis
- As needed for ad-hoc requests

Last Updated: September 2025