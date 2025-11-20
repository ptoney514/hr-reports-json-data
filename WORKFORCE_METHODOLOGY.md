# Workforce Data Methodology

## Overview
This document describes the methodology for calculating and analyzing workforce headcount data from HR system exports for Creighton University's workforce dashboard.

## Data Source
- **Primary File**: `source-metrics/workforce-headcount/New Emp List since FY20 to Q1FY25 1031 PT.xlsx`
- **Current Implementation**: Manual data entry into `/src/data/staticData.js`
- **Date Range**: Fiscal year basis (July 1 - June 30) with quarterly snapshots
- **Reporting Periods**: 6/30/24 (FY24), 3/31/25 (FY25 Q3), 6/30/25 (FY25 Q4)

## Key Fields and Definitions

### Employee Identification
- **Employee ID**: Unique employee identifier
- **Note**: Count unique employee IDs to avoid duplicates

### Classification Fields

#### Employee Categories
Employee types are classified by assignment category codes:

**Faculty Categories (Benefit Eligible)**:
- **F12**: Full-time Faculty (12-month) *excluding Grade R*
- **F11**: Faculty (11-month) *excluding Grade R*
- **F10**: Faculty (10-month) *excluding Grade R*
- **F09**: Faculty (9-month) *excluding Grade R*

**Staff Categories (Benefit Eligible)**:
- **PT12**: Part-time Staff (12-month) *excluding Grade R*
- **PT11**: Part-time Staff (11-month) *excluding Grade R*
- **PT10**: Part-time Staff (10-month) *excluding Grade R*
- **PT9**: Part-time Staff (9-month) *excluding Grade R*

**⚠️ CRITICAL EXCLUSION: Grade R (Residents/Fellows)**:
- **Grade R** employees are **NOT benefit-eligible** even with F12/PT12 assignment
- Includes: Physical Therapy Residents, Occupational Therapy Fellows, Pharmacy Residents/Fellows
- Training programs with different compensation structure
- Must be filtered out AFTER assignment category check

**House Staff Physicians**:
- **HSR**: House Staff Residents/Physicians (mostly Grade R)

**Temporary/Non-Benefit Eligible**:
- **TEMP**: Temporary Workers
- **NBE**: Non-Benefit Eligible
- **PRN**: As-Needed/Per Diem Workers

**Student Workers (Non-Benefit Eligible)**:
- **SUE**: Student University Employees
- **CWS**: College Work Study (Federal Work Study)

### Location Fields
- **Campus Location**: Omaha Campus or Phoenix Campus
- Distribution tracked at both aggregate and category level

### Organizational Fields
- **School/Organization**: Top-level organizational unit (e.g., Medicine, Arts & Sciences)
- **Department**: Specific department within school/organization
- **Division**: Vice President area (e.g., VPSL, VPEM, VPFN)

## Calculation Methodology

### 1. Total Workforce Count
```
Total Workforce = COUNT(DISTINCT Employee ID)
  WHERE Reporting Date = [snapshot date]
```

**Current FY25 Total (6/30/25)**: 5,037 employees

### 2. Benefit-Eligible Employee Calculation

**CRITICAL: Two-Step Filter Process**

#### Step 1: Assignment Category Filter
```
Benefit_Eligible_Pool = WHERE Assignment_Category IN (
    'F12', 'F11', 'F10', 'F09',    # Full-time regular
    'PT12', 'PT11', 'PT10', 'PT9'  # Part-time regular
)
```

#### Step 2: Grade R Exclusion (ADDED 2025-11-19)
```
Benefit_Eligible_Final = Benefit_Eligible_Pool
    WHERE Grade Code NOT LIKE 'R%'
```

**⚠️ Grade R Exclusion Rule**:
- Even if employee has F12/PT12 assignment category
- Grade R = Residents/Fellows (NOT benefit-eligible)
- Includes: PT Residents, OT Fellows, Pharmacy Residents/Fellows
- Must be excluded from all benefit-eligible calculations

#### Faculty Count
```
Faculty = COUNT(Employee WHERE
    Assignment_Category IN ('F12', 'F11', 'F10', 'F09') AND
    Grade NOT LIKE 'R%' AND
    Employee_Category = 'Faculty'
)
```
**FY25 Total**: 788 faculty members
- Comprised of: F12 (1,708 positions), F09 (286), F11 (53), F10 (12)
- **Note**: F12 category includes both faculty and staff positions; actual faculty split is calculated
- **Grade R excluded**: Removes any Residents/Fellows mistakenly in faculty categories

#### Staff Count
```
Staff = COUNT(Employee WHERE
    Assignment_Category IN ('F12', 'F11', 'F10', 'F09', 'PT12', 'PT11', 'PT10', 'PT9') AND
    Grade NOT LIKE 'R%' AND
    Employee_Category IN ('Staff Exempt', 'Staff Non-Exempt')
)
```
**FY25 Total**: 1,349 staff members
- Comprised of: PT12 (52), PT11 (1), PT10 (6), PT9 (19) + F12 staff portion
- **Grade R excluded**: Removes Residents/Fellows from benefit-eligible staff counts

#### Benefit-Eligible Total
```
Benefit Eligible = Faculty + Staff (both with Grade R excluded)
```
**FY25 Total**: 2,137 benefit-eligible employees

**Q1 FY26 Impact of Grade R Exclusion**:
- Previous count: 1,431 staff (included 12 Grade R)
- Corrected count: **1,419 staff** (Grade R excluded)

### 3. House Staff Physicians (HSP)
```
HSP = COUNT(Employee ID WHERE Category = 'HSR')
```
**FY25 Total**: 612 house staff physicians

### 4. Temporary/Non-Benefit Eligible Workers
```
Temporary Total = TEMP + NBE + PRN
```
**FY25 Breakdown**:
- TEMP: 457
- NBE: 7
- PRN: 110
- **Total**: 574 temporary workers

### 5. Student Workers
```
Student Workers = SUE + CWS
```
**FY25 Breakdown**:
- SUE (Student Workers): 1,607
- CWS (Federal Work Study): 107
- **Total**: 1,714 student workers
- **Federal Work Study Rate**: 6.2%

### 6. Special Populations
```
Jesuits = COUNT(WHERE Special Category = 'Jesuit')
```
**Constant**: 17 Jesuit community members (unchanged across all periods)

### 7. Campus Distribution

#### Total by Location
```
Omaha Campus = COUNT(WHERE Location = 'Omaha')
Phoenix Campus = COUNT(WHERE Location = 'Phoenix')
```

**FY25 Totals (6/30/25)**:
- **Omaha Campus**: 4,287 employees (85.1%)
- **Phoenix Campus**: 750 employees (14.9%)

#### Category Breakdown by Location
Each major category is tracked separately by campus:

**Faculty by Campus**:
- Omaha: 730 faculty (92.6%)
- Phoenix: 58 faculty (7.4%)

**Staff by Campus**:
- Omaha: Estimated ~75% allocation
- Phoenix: Estimated ~25% allocation

**HSP by Campus**:
- Omaha: 268 physicians (43.8%)
- Phoenix: 344 physicians (56.2%)

### 8. Year-over-Year Growth Calculations

```
YoY Change = (Current Value - Prior Year Value)
YoY Percentage = ((Current - Prior) / Prior) × 100
```

**FY24 to FY25 Growth Examples**:
- Total Workforce: +263 employees (+5.5%)
- Faculty: +2 (+0.3%)
- Staff: +26 (+2.0%)
- Student Workers: +223 (+14.9%)

### 9. Organizational Analysis

#### School/Organization Totals
```
School Total = SUM(Faculty + Staff + HSP)
  GROUP BY School/Organization
```

**Top 5 Schools/Organizations (FY25)**:
1. Medicine: 817 employees (16.2% of workforce)
2. Arts & Sciences: 601 employees (11.9%)
3. VPSL (Student Life): 573 employees (11.4%)
4. Pharmacy & Health Professions: 440 employees (8.7%)
5. Phoenix Alliance: 372 employees (7.4%)

#### Department Breakdown
```
Department Total = COUNT(Employee ID)
  GROUP BY Department
  ORDER BY Total DESC
```

**Largest Departments (FY25)**:
1. Phoenix Alliance Admin: 345 employees
2. Medical Dean - House Staff: 278 employees
3. Pharmacy Health Professions - Dean's Office: 246 employees

### 10. Assignment Type Distribution

Major employment type categories and their percentages:

**FY25 Distribution**:
- Full-Time (F12): 33.9%
- Student Workers (SUE + CWS): 34.0%
- House Staff Physicians (HSR): 12.2%
- Temporary (TEMP + NBE + PRN): 11.4%
- Part-Time/Other: 8.5%

## Key Metrics and Business Rules

### 1. Benefit Eligibility
- **Included**: F12, F11, F10, F09, PT12, PT11, PT10, PT9
- **Excluded**: HSR, TEMP, NBE, PRN, SUE, CWS
- **Rationale**: Align with benefits administration definitions

### 2. Grant/Donor Funded Positions
Certain positions are funded through grants or donor contributions:
- **Staff**: 144 positions
- **Faculty**: 85 positions
- **Temporary**: 48 positions
- **Total**: 277 grant/donor-funded positions (5.5% of workforce)

**Note**: These are included in headcount totals but flagged for budget planning purposes.

### 3. Jesuit Community Members
- Fixed at 17 members across all reporting periods
- Included in total workforce count
- Tracked separately for mission and ministry reporting

### 4. Student Worker Seasonality
Student worker counts vary significantly by academic calendar:
- **Peak**: Q2/Q3 during academic year (1,969 in 3/31/25)
- **Lower**: Q4 summer period (1,714 in 6/30/25)
- **Typical Variance**: 15-20% between academic year and summer

### 5. Location Allocation Rules

When granular location data is unavailable, use these allocation percentages:

**Default Omaha/Phoenix Split**:
- Faculty: 75% Omaha / 25% Phoenix
- Staff: 75% Omaha / 25% Phoenix
- Temporary: 85% Omaha / 15% Phoenix
- Student Workers: 75% Omaha / 25% Phoenix
- HSP: Based on actual program locations (variable)

**Note**: Use actual location data when available in `locationDetails` field.

## Data Quality and Validation

### 1. Validation Rules

**Headcount Reconciliation**:
```
Total Employees = Faculty + Staff + HSP + Temp + Students + Jesuits + Other
```

**Category Sum Check**:
```
Total = SUM(F12, F11, F10, F09, PT12, PT11, PT10, PT9, HSR, TEMP, NBE, PRN, SUE, CWS)
```

**Location Balance**:
```
Total Employees = Omaha Campus + Phoenix Campus
```

**School/Organization Balance**:
```
Total Employees = SUM(All School/Org Totals)
```

### 2. Data Quality Checks

1. **No Duplicate Employees**: Verify unique employee IDs within reporting period
2. **Category Completeness**: Every employee must have an assignment category
3. **Location Assignment**: Every employee must have a campus location
4. **School/Org Assignment**: Every employee must belong to a school/organization
5. **Date Accuracy**: Reporting date must match fiscal quarter end
6. **Year-over-Year Consistency**: Check for unusual variances (>20% change flags for review)

### 3. Known Data Anomalies

**Q3 FY25 (3/31/25) Staff Count**:
- Reported: 4,444 staff
- Note: Appears to include temporary workers in aggregate reporting
- Resolution: Use more granular category data for accurate classification

**Phoenix Campus Growth**:
- FY24 to FY25: +236 employees (+45.9%)
- Primarily driven by HSP program expansion
- Verified as accurate; reflects strategic campus development

## Reporting Periods and Timing

### Fiscal Year Structure
- **FY Start**: July 1
- **FY End**: June 30
- **Quarters**:
  - Q1: July 1 - September 30
  - Q2: October 1 - December 31
  - Q3: January 1 - March 31
  - Q4: April 1 - June 30

### Standard Reporting Dates
- **Year-End**: June 30 (Q4 close)
- **Mid-Year**: December 31 (Q2 close) or March 31 (Q3 close)
- **Quarterly**: Each quarter end

### Data Availability Timeline
1. **HR System Export**: Within 5 business days of period end
2. **Data Validation**: 2-3 business days
3. **Dashboard Update**: Within 10 business days of period end

## Helper Functions and Data Access

### Primary Data Functions

#### `getWorkforceData(date)`
Returns complete workforce data for a specific reporting date.
```javascript
const currentData = getWorkforceData("2025-06-30");
// Returns: { totalEmployees, faculty, staff, hsp, temp, locations, demographics, ... }
```

#### `getTempTotal(date)`
Calculates total temporary workers (TEMP + NBE + PRN).
```javascript
const tempTotal = getTempTotal("2025-06-30");
// Returns: 574 (457 TEMP + 7 NBE + 110 PRN)
```

#### `getAllSchoolOrgData(date)`
Returns complete school/organization breakdown sorted by total headcount.
```javascript
const schoolData = getAllSchoolOrgData("2025-06-30");
// Returns: Array of { name, faculty, staff, hsp, total }
```

#### `getBenefitEligibleBreakdown(date)`
Returns benefit-eligible employee counts by category.
```javascript
const beData = getBenefitEligibleBreakdown("2025-06-30");
// Returns: { faculty: 788, staff: 1349, total: 2137 }
```

### Fallback Behavior
All data functions include fallback logic:
1. If requested date not found, use most recent available date
2. If `locationDetails` unavailable, use allocation percentages
3. If category data missing, fall back to aggregate totals

## Integration with Other Dashboards

### 1. Turnover Dashboard
- Uses workforce totals as denominator for turnover rate calculations
- Compares terminations to average headcount
- Analyzes turnover by school/organization

### 2. Exit Survey Dashboard
- Workforce counts provide context for survey participation
- Faculty/staff split aligns with survey respondent classification
- Location data used for geographic analysis

### 3. Benefits & Well-being Dashboard
- Benefit-eligible counts drive benefits participation metrics
- Used for benefits coverage rate calculations
- HSP counted separately for specialized benefits programs

### 4. Recruiting Dashboard
- Current headcount provides baseline for net hiring calculations
- Location growth trends inform recruiting strategy
- School/organization distribution guides recruiting priorities

## Key Insights and Analysis

### Year-over-Year Key Insights (FY24 to FY25)

**1. Benefit-Eligible Workforce Expansion**
- Staff increased by 26 positions (2.0%)
- Faculty increased by 2 positions (0.3%)
- Reflects controlled growth in permanent workforce

**2. Omaha Campus Growth**
- Staff increased by 17 positions (1.3%)
- Faculty increased by 11 positions (1.7%)
- Steady organic growth in primary campus

**3. Phoenix Campus Stability**
- Benefit-eligible staff and faculty unchanged
- HSP program continues as primary Phoenix driver
- Strategic focus on medical education mission

**4. Student Workforce Expansion**
- Student workers increased by 223 (14.9%)
- Reflects increased campus employment opportunities
- Supports student financial aid and campus operations

### Workforce Composition Insights

**1. Employment Type Distribution**
- 42.4% Benefit-eligible employees (Faculty + Staff)
- 34.0% Student workers
- 12.2% House staff physicians
- 11.4% Temporary/contingent workers

**2. Geographic Concentration**
- 85.1% Omaha-based
- 14.9% Phoenix-based
- Phoenix growing faster but from smaller base

**3. Organizational Concentration**
- Medicine is largest unit (16.2% of workforce)
- Top 15 schools represent 84.8% of workforce
- Long tail of smaller departments and programs

## Update Frequency and Maintenance

### Regular Updates
- **Quarterly**: Update workforce data within 10 days of quarter close
- **Annual**: Comprehensive year-end analysis and validation
- **Ad-Hoc**: As needed for board presentations or strategic planning

### Maintenance Tasks
1. **Data Validation**: Verify totals and cross-checks after each update
2. **Category Review**: Confirm assignment category definitions remain current
3. **Location Updates**: Verify campus assignments, especially for new hires
4. **Organizational Changes**: Update school/department names for reorganizations
5. **Documentation**: Update this methodology for any calculation changes

## Data Processing Scripts

### Current Process (Manual)
Data is manually entered into `/src/data/staticData.js` with structure:
```javascript
WORKFORCE_DATA = {
  "YYYY-MM-DD": {
    totalEmployees, faculty, staff, hsp, temp,
    locations, locationDetails, categories,
    departments, schoolOrgData, assignmentTypes,
    demographics, ...
  }
}
```

### Future Automation (Planned)
**Script Location**: `scripts/processWorkforceData.js` (to be created)

**Process**:
1. Read Excel file from `source-metrics/workforce-headcount/`
2. Parse employee records by reporting date
3. Calculate all metrics (faculty/staff split, locations, categories)
4. Generate school/org and department breakdowns
5. Validate totals and cross-checks
6. Output to `src/data/workforceData.json`
7. Sync to `staticData.js` for backwards compatibility

**Validation Checks**:
- Total equals sum of all categories
- Location totals match overall total
- School/org totals match overall total
- No duplicate employee IDs
- All required fields populated

## Common Issues and Troubleshooting

### Issue 1: Totals Don't Match
**Symptoms**: Dashboard totals don't equal sum of categories
**Causes**:
- Missing category assignments
- Duplicate employee records
- Incorrect date filtering
**Resolution**: Run validation checks, verify unique employee IDs, check date ranges

### Issue 2: Location Imbalance
**Symptoms**: Omaha + Phoenix ≠ Total
**Causes**:
- Employees with no location assignment
- Remote employees not assigned to campus
**Resolution**: Review location assignment rules, assign remote workers to primary campus

### Issue 3: Year-over-Year Spikes
**Symptoms**: >20% change in any category
**Causes**:
- Organizational restructuring
- Program expansion/closure
- Data collection methodology change
**Resolution**: Verify with HR, document explanation in data notes

### Issue 4: Student Worker Variance
**Symptoms**: Significant quarter-to-quarter changes in student counts
**Causes**: Academic calendar seasonality
**Resolution**: Normal and expected; track trends year-over-year instead

## Business Context and Notes

### Note on Employee Counts
The standard workforce dashboard note states:
> "Employee counts include Jesuits (17) as well as positions that are all or partially grant/donor funded (144 staff, 85 faculty and 48 temp). Student Employees are not benefit eligible. Please reference the additional slides which provide a breakdown of employees by state."

This note provides important context for:
- Budget planning (identifying grant-funded positions)
- Benefits administration (clarifying benefit eligibility)
- Mission alignment (highlighting Jesuit community presence)

### Excluded from Standard Workforce Reports
While tracked in data, these categories may be reported separately:
- **Adjunct Faculty**: Typically part-time, non-benefit eligible
- **Graduate Assistants**: May be separate from student workers
- **Post-Doctoral Researchers**: May be classified differently
- **Visiting Scholars**: Temporary, non-employee status

Consult with HR for specific reporting requirements.

## Version History and Changes

### Current Version
- **Version**: 1.0
- **Last Updated**: January 2025
- **Data Through**: June 30, 2025 (FY25 Q4)

### Change Log
- **September 2025**: Added NBE and PRN to temporary worker calculation (previously separate)
- **June 2025**: Expanded Phoenix campus location detail tracking
- **March 2025**: Added grant/donor funded position counts
- **January 2025**: Initial methodology documentation created

## References and Related Documentation

- **TURNOVER_METHODOLOGY.md**: Employee termination data methodology
- **EXIT_SURVEY_METHODOLOGY.md**: Exit survey data collection and analysis
- **WORKFORCE_DATA_INVENTORY.md**: Technical inventory of data structures
- **WORKFORCE_AUDIT_REPORT.html**: Comprehensive data validation and audit report
- **PROJECT_STATUS.md**: Overall project status and priorities
- **WORKFLOW_GUIDE.md**: Development procedures and standards

---

**Last Updated**: January 2025
**Next Review**: June 2025 (after FY26 Q4 data available)
