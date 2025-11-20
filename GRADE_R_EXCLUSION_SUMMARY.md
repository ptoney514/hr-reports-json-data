# Grade R Exclusion - Data Correction Summary

**Date**: 2025-11-19
**Issue**: Grade R employees (Residents/Fellows) were incorrectly counted as benefit-eligible
**Resolution**: Implemented Grade R exclusion across all data processing and updated Q1 FY26 metrics

---

## Executive Summary

Grade R employees (Physical Therapy Residents, Occupational Therapy Fellows, Pharmacy Residents/Fellows) have F12/PT12 assignment categories but are **NOT benefit-eligible**. They are training program participants with different compensation structures and should be excluded from benefit-eligible reporting.

### Impact on Q1 FY26 Data:

| Metric | Before | After | Difference |
|--------|--------|-------|------------|
| **Benefit-Eligible Terminations** | 73 | **58** | -15 Grade R |
| **Benefit-Eligible Staff (Headcount)** | 1,431 | **1,419** | -12 Grade R |
| **Exit Survey Response Rate** | 20.5% | **25.9%** | +5.4 pts |

---

## Detailed Findings

### Q1 FY26 Workforce (Active Employees)

**Total Grade R Employees**: 625
- **613 HSR** (House Staff Residents) - Already excluded ✅
- **12 F12** - Were incorrectly counted as benefit-eligible ❌

**The 12 F12 Grade R Employees**:
- Physical Therapy Residents: 6
- Occupational Therapy Fellows: 3
- Pharmacy Residents: 3

**Impact**:
- Benefit-Eligible Staff: 1,431 → **1,419** (-12)
- Temporary Employees: 630 → **642** (+12)
- Omaha Staff: 1,330 → **1,318** (-12)
- Omaha Temp: 489 → **501** (+12)

---

### Q1 FY26 Terminations

**Total Grade R Terminations**: 15 (all F12)
- Physical Therapy Residents: 11
- Pharmacy Residents: 2
- Occupational Therapy Fellows: 2

**Impact on Turnover Metrics**:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Terminations** | 73 | **58** | -15 |
| Staff Exempt | 39 | **24** | -15 |
| Total Staff | 69 | **54** | -15 |
| Omaha Terminations | 68 | **53** | -15 |

**By Termination Type**:
- Voluntary: 47 → **44** (-3)
- End of Assignment: 12 → **0** (-12)
  - All 12 "End of Assignment" were Grade R residents completing programs

**By Tenure**:
- <1 Year: 17 → **13** (-4)
- 1-3 Years: 30 → **19** (-11)

**By Age**:
- <25: 10 → **9** (-1)
- 25-34: 29 → **18** (-11)
- 35-44: 13 → **10** (-3)

**By Department**:
- Pharmacy & Health Professions: 19 → **7** (-12)
- Other Departments: 16 → **13** (-3)

---

### Exit Survey Impact

**Response Rate Improvement**:
- Total Responses: 15 (unchanged)
- Total Exits: 73 → **58** (-15)
- Response Rate: 20.5% → **25.9%** (+5.4 pts)

**Department Response Rates** (corrected):
- Pharmacy & Health Professions: 0% (was 0/19, now 0/7)
- Other Departments: 23% (was 19%, corrected from 3/16 to 3/13)

---

## Implementation Details

### 1. Methodology Documentation Updated

**Files Updated**:
- `WORKFORCE_METHODOLOGY.md` - Added Grade R exclusion to benefit-eligible definition
- `source-metrics/terminations/TERMINATION_METHODOLOGY.md` - Added Section 4: Benefit Eligibility with two-step filter

**New Rule**:
```
Step 1: Filter by Assignment Category (F12, F11, F10, F09, PT12, PT11, PT10, PT9)
Step 2: EXCLUDE Grade Code starting with 'R'
```

### 2. Scripts Updated

**Turnover Processing**:
- `scripts/extract_q1_fy26_details.py` - Added Grade R exclusion filter
  - Output now shows 58 terminations (15 Grade R excluded)

**Workforce Processing**:
- `scripts/extract_q1_fy26_workforce.js` - Added Grade R check before benefit-eligible categorization
  - Output now shows 1,419 staff (12 Grade R moved to temporary)

**Analysis Tools**:
- `scripts/analyze_grade_r_workforce.py` - New tool to identify Grade R employees
- `scripts/test_grade_r_exclusion.py` - Automated test suite (5 tests, all passing)

### 3. Data Files Updated

**staticData.js** - Three sections corrected:

1. **QUARTERLY_TURNOVER_DATA["2025-09-30"]**
   - All turnover metrics updated
   - Comments added explaining corrections

2. **QUARTERLY_WORKFORCE_DATA["2025-09-30"]**
   - Staff counts reduced by 12
   - Temporary counts increased by 12
   - Location breakdowns corrected

3. **EXIT_SURVEY_DATA["2025-09-30"]**
   - Response rate: 20.5% → 25.9%
   - Total exits: 73 → 58
   - Department exit counts corrected

4. **QUARTERLY_TURNOVER_TRENDS**
   - Q1 FY26 overall: staff 69 → 54
   - Q1 FY26 early: staff 17 → 13

**Dashboard Components**:
- `ExitSurveyQ1FY26Dashboard.jsx` - Hardcoded values updated, status changed from "PENDING" to "UPDATED"

---

## Validation & Testing

### Automated Test Suite
Created `scripts/test_grade_r_exclusion.py` with 5 tests:

✅ **TEST 1**: Terminations Grade R excluded (58 = 73 - 15)
✅ **TEST 2**: Workforce Grade R excluded (1,419 = 1,431 - 12)
✅ **TEST 3**: 100% of Grade R are Residents/Fellows
✅ **TEST 4**: Faculty + Staff = Total (58 = 4 + 54)
✅ **TEST 5**: All workforce categories sum correctly

**Result**: 🎉 ALL TESTS PASSED

---

## Data Quality Notes

### Grade R Employee Characteristics

**Q1 FY26 Active (625 total)**:
- House Staff Physicians (HSR): 613 (98.1%)
- Residents/Fellows (F12): 12 (1.9%)
  - 100% match residency/fellowship job titles

**Job Titles**:
- Physical Therapy Resident
- Occupational Therapy Fellow
- Pharmacy Resident
- Pharmacy Fellow
- House Staff Physician

**Common Attributes**:
- Person Type: STAFF
- Assignment: F12 or HSR
- Grade: R
- Hourly/Salaried: Salaried
- Duration: Typically 1-2 year programs

---

## Files Modified

### Documentation:
- `WORKFORCE_METHODOLOGY.md`
- `source-metrics/terminations/TERMINATION_METHODOLOGY.md`
- `GRADE_R_EXCLUSION_SUMMARY.md` (this file)

### Scripts:
- `scripts/extract_q1_fy26_details.py`
- `scripts/extract_q1_fy26_workforce.js`
- `scripts/analyze_grade_r_workforce.py` (new)
- `scripts/test_grade_r_exclusion.py` (new)

### Data:
- `src/data/staticData.js` - 4 data structures corrected

### Components:
- `src/components/dashboards/ExitSurveyQ1FY26Dashboard.jsx`

---

## Verification Steps

Run these commands to validate the changes:

```bash
# 1. Run Grade R analysis
python3 scripts/analyze_grade_r_workforce.py

# 2. Run automated tests
python3 scripts/test_grade_r_exclusion.py

# 3. Reprocess turnover data
python3 scripts/extract_q1_fy26_details.py

# 4. Reprocess workforce data
node scripts/extract_q1_fy26_workforce.js

# 5. Build application
npm run build
```

---

## Future Considerations

### Historical Data
The Grade R exclusion rule should be applied retroactively to all historical quarters (Q1 FY23 - Q4 FY25) to ensure consistency across trend analysis.

### Ongoing Validation
- Run `test_grade_r_exclusion.py` after each quarterly data update
- Monitor for new grade codes that might need exclusion
- Validate that Grade R employees remain classified as Residents/Fellows

### Documentation
- Update any presentations or reports that reference the old 73/20.5% numbers
- Note the methodology change in quarterly reports
- Communicate to stakeholders that Q1 FY26 baseline was corrected

---

## Summary Statistics

### Before Grade R Exclusion:
- Q1 FY26 Benefit-Eligible Terminations: 73
- Q1 FY26 Benefit-Eligible Staff: 1,431
- Exit Survey Response Rate: 20.5%

### After Grade R Exclusion:
- Q1 FY26 Benefit-Eligible Terminations: **58** ✅
- Q1 FY26 Benefit-Eligible Staff: **1,419** ✅
- Exit Survey Response Rate: **25.9%** ✅

### Data Quality Improvement:
- **More accurate** benefit-eligible counts
- **Higher** response rate (more favorable metric)
- **Clearer** distinction between training programs and regular employees
- **Automated** validation to prevent future errors

---

## Conclusion

The Grade R exclusion correction improves data accuracy by properly categorizing Residents/Fellows as non-benefit-eligible training program participants. This aligns with HR policy and provides more accurate metrics for executive reporting.

All automated tests pass, and the change has been thoroughly documented and validated.
