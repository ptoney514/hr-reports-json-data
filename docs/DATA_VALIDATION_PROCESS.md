# Data Validation Process for Exit Survey Dashboard

## Overview
This document describes the data validation process implemented for the Exit Survey FY25 Dashboard to ensure accuracy and consistency.

## Data Flow

```
Excel Source File → Processing Script → JSON Data → Dashboard Component
```

### 1. Excel Source File
- **Location**: `/source-metrics/turnover/fy25/Terms Since 2017 Detail PT.xlsx`
- **Sheet**: Sheet1 (contains 11,307 total records)
- **Key Fields**: Empl Num, Term Date, Faxc Staff, Assignment Category, Term Reason 2

### 2. Processing Script
- **Script**: `/scripts/processTurnoverData.js`
- **Filters Applied**:
  - Date Range: FY25 (July 1, 2024 - June 30, 2025)
  - Excludes: HSR, CWS, SUE, TEMP, PRN, NBE categories
  - Result: 222 unique employee terminations

### 3. JSON Data File
- **Location**: `/src/data/fy25TurnoverData.json`
- **Structure**:
  - Summary: Total counts, faculty/staff split, average years of service
  - Quarterly: Q1-Q4 breakdowns with faculty/staff counts
  - Term Reasons: Counts and percentages
  - Demographics: Gender, ethnicity distributions

### 4. Dashboard Component
- **Location**: `/src/components/dashboards/ExitSurveyFY25Dashboard.jsx`
- **Data Integration**:
  - Dynamically loads turnoverData.json
  - Calculates response rates using actual termination counts
  - Performs integrity checks on load

## Validation Scripts

### validateExitSurveyData.js
**Purpose**: Validates all data points on the dashboard
**Checks**:
- Quarterly totals match annual total
- Faculty + Staff = Total for each quarter
- Response rate calculations
- Termination reason percentages

**Run**: `node scripts/validateExitSurveyData.js`

### testCalculations.js
**Purpose**: Tests all mathematical calculations
**Verifies**:
- Response rate formulas
- Satisfaction averages
- Percentage calculations
- Quarterly distributions

**Run**: `node scripts/testCalculations.js`

## Key Findings from Validation

### Corrected Data Points
1. **Q1 Terminations**: 79 (was 76)
2. **Q4 Terminations**: 51 (was incorrectly showing 186 which was total staff)
3. **Overall Response Rate**: 31.1% (69 responses / 222 terminations)
4. **Average Satisfaction**: 65.3% (average of Q1-Q4)

### Data Integrity Notes
- 4 employees have no quarter assigned (222 total, 218 in quarters)
- Faculty/Staff percentages: 14.4% / 83.8% (1.8% unknown)
- Top exit reason: Resigned at 50%

## Response Rate Calculations

```javascript
// Quarterly Response Rate
Q1: 20 responses / 79 terminations = 25.3%
Q2: 11 responses / 36 terminations = 30.6%
Q3: 20 responses / 52 terminations = 38.5%
Q4: 18 responses / 51 terminations = 35.3%

// Overall Response Rate
Total: 69 responses / 222 terminations = 31.1%
```

## Changes Implemented

### 1. Fixed Hardcoded Values
- Replaced static numbers with dynamic references to turnoverData
- Updated Q4 termination count from 186 to 51
- Fixed Q1 termination count from 76 to 79

### 2. Added Data Integrity Checks
- Validates quarterly sums match annual total on load
- Checks faculty + staff = total for consistency
- Logs warnings for any discrepancies

### 3. Dynamic Calculations
- Response rates calculated from actual turnover data
- Percentages computed dynamically
- All metrics reference source data

## Testing Checklist

- [x] Run processTurnoverData.js to refresh data
- [x] Run validateExitSurveyData.js to check all values
- [x] Run testCalculations.js to verify math
- [x] Check browser console for integrity warnings
- [x] Verify dashboard displays correct values
- [x] Confirm print layout shows all data

## Maintenance

### To Update Data:
1. Place new Excel file in `/source-metrics/turnover/fy25/`
2. Run: `node scripts/processTurnoverData.js`
3. Run: `node scripts/validateExitSurveyData.js`
4. Check dashboard for updated values

### To Add New Quarter:
1. Update exitSurveyData object in validation script
2. Add quarter's survey responses to dashboard
3. Rerun validation scripts

## Contact
For questions about this validation process, refer to:
- EXIT_SURVEY_METHODOLOGY.md
- TURNOVER_METHODOLOGY.md

Last Updated: September 2025