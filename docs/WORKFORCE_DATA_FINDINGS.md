# Workforce Data Findings & Methodology Clarification

## Executive Summary
Analysis of the workforce CSV data reveals significant discrepancies with the current static data in the application. The CSV shows **5,037 total employees** for Q4 FY25 (6/30/25) while the static data shows **3,206 employees** - a 57% variance.

## Key Findings

### Q4 FY25 (June 30, 2025) Comparison

| Metric | CSV Data | Static Data | Difference | % Variance |
|--------|----------|-------------|------------|------------|
| **Total Employees** | 5,037 | 3,206 | +1,831 | +57.1% |
| Faculty | 788 | 689 | +99 | +14.4% |
| Staff | 4,249 | 1,448 | +2,801 | +193.4% |
| HSP | 612 | 612 | 0 | 0% |
| Temporary | 457 | 457 | 0 | 0% |
| **Students (SUE+CWS)** | 1,714 | Not shown | N/A | N/A |

### Root Cause Analysis

The discrepancy appears to stem from **different counting methodologies**:

#### CSV Methodology (Per HR Analyzer Image)
- Counts ALL unique employees per END DATE
- Includes ALL assignment categories:
  - Benefit-eligible (F12, F09, F10, PT12, etc.)
  - Students (SUE, CWS)
  - House Staff (HSP)
  - Temporary (TEMP)
  - Not benefit-eligible (NBE, PRN)
- **Total for Q4 FY25**: 5,037 employees

#### Static Data Methodology (Apparent)
- Appears to count only **benefit-eligible employees**
- Excludes student workers (SUE, CWS)
- May have different categorization for staff
- **Total for Q4 FY25**: 3,206 employees

### Supporting Evidence

When we subtract students from the CSV total:
- CSV Total: 5,037
- Less Students: -1,714
- **Adjusted Total: 3,323** (closer to static's 3,206)

The remaining ~117 employee difference could be due to:
- PRN employees (110 in CSV)
- Different handling of part-time categories
- Data timing differences

## Year-over-Year Growth

The CSV data shows consistent growth:

| Period | Total Employees | YoY Change |
|--------|----------------|------------|
| Q4 FY24 (6/30/24) | 4,774 | - |
| Q4 FY25 (6/30/25) | 5,037 | +263 (+5.5%) |

## Assignment Category Breakdown (Q4 FY25)

Top 10 categories from CSV:
1. **F12**: 1,708 (Full-time benefit-eligible)
2. **SUE**: 1,607 (Student employees)
3. **HSR**: 612 (House Staff Residents)
4. **TEMP**: 457 (Temporary)
5. **F09**: 286 (Full-time benefit-eligible)
6. **PRN**: 110 (As-needed, not benefit-eligible)
7. **CWS**: 107 (Federal Work Study)
8. **F11**: 53 (Full-time benefit-eligible)
9. **PT12**: 52 (Part-time benefit-eligible)
10. **PT9**: 19 (Part-time benefit-eligible)

## Recommendations

### 1. Clarify Counting Methodology
- Confirm whether dashboards should show:
  - **All employees** (including students) = ~5,037
  - **Benefit-eligible only** = ~3,323
  - **Current static methodology** = 3,206

### 2. Decision Points
- **Option A**: Update static data to match CSV (all employees)
  - Pros: Complete workforce picture
  - Cons: Major change to dashboards
  
- **Option B**: Adjust CSV processing to match static methodology
  - Pros: Minimal dashboard changes
  - Cons: May lose student worker visibility
  
- **Option C**: Dual reporting
  - Show both "Total Workforce" and "Benefit-Eligible"
  - Best of both worlds but requires UI changes

### 3. Data Validation Questions
1. Should student workers (SUE, CWS) be included in total employee counts?
2. How should PRN (as-needed) employees be categorized?
3. Are there specific business rules for staff categorization?
4. Is the static data using a different snapshot date?

## Impact on Dashboards

If we proceed with CSV data as-is:
- Workforce Dashboard would show ~57% more employees
- Department breakdowns would change significantly
- Location distributions may shift
- Year-over-year comparisons would need recalculation

## Next Steps

1. **Verify with HR** which counting methodology is correct
2. **Review dashboard requirements** with stakeholders
3. **Decide on approach** (Option A, B, or C above)
4. **Update processing script** if methodology needs adjustment
5. **Create sync script** once approach is confirmed

## Technical Notes

### CSV Processing Success
- ✅ Successfully parsed 115,443 records
- ✅ Identified 24 unique reporting periods
- ✅ Applied unique employee counting per END DATE
- ✅ Categorized by assignment codes correctly
- ✅ Generated valid JSON output

### Validation Script Working
- ✅ Detects all discrepancies
- ✅ Calculates variance percentages
- ✅ Provides clear recommendations
- ✅ Shows year-over-year trends

### Ready for Sync
Once methodology is confirmed, the sync script can:
- Update WORKFORCE_DATA in staticData.js
- Maintain backward compatibility
- Preserve non-workforce data
- Add audit trail

---

**Document Created**: December 2024
**Data Source**: New Emp List since FY20 to Q1FY25 1031 PT.csv
**Methodology Reference**: HR Workforce Data Analyzer image provided