# Non-Calculable Data Sources

This document tracks data that comes from external sources (PowerPoint slides, reports, etc.) and cannot be calculated programmatically from our raw data files.

## Faculty Turnover by Division (FY25)

**Source:** HR Department PowerPoint Slide  
**Location:** `/source-metrics/hr-slides/fy25/faculty-turnover-by-division-source.png`  
**Data Location:** `src/data/staticData.js` → `facultyTurnoverByDivision`

### Current Values (from HR slide):
- College of Nursing: 13.7%
- Pharmacy & Health Professions: 7.5%
- School of Dentistry: 6.9%
- Total Faculty Turnover: 6.3%
- School of Medicine: 5.6%
- Law School: 3.7%
- Heider College of Business: 1.6%
- College of Professional Studies and Continuing Education: 0.0%

**Note:** These rates differ from what we calculate using the termination data in `Terms Since 2017 Detail PT.xlsx` and faculty headcount data. The HR department's calculations may use different:
- Time periods
- Exclusion criteria
- Faculty categorizations
- Denominators (average headcount vs. point-in-time)

## Voluntary/Involuntary/Retiree Turnover (FY25)

**Source:** HR Department PowerPoint Slide  
**Location:** `/source-metrics/hr-slides/fy25/voluntary-involuntary-turnover-fy25.png`  
**Data Location:** Not currently stored in staticData.js

### FY25 Values (from HR slide):
#### Faculty
- Involuntary: 0.3%
- Voluntary: 3.3%
- Retire: 2.5%
- Total: 6.1%

#### Staff Exempt
- Involuntary: 0.8%
- Voluntary: 10.8%
- Retire: 1.0%
- Total: 12.6%

#### Staff Non-Exempt
- Involuntary: 1.5%
- Voluntary: 12.9%
- Retire: 0.9%
- Total: 15.3%

**Note:** Data represents benefit-eligible employees only, excluding Residents as of June 30, 2025.

## Faculty/Staff Turnover Demographic Review

**Source:** HR Department PowerPoint Slide  
**Location:** `/source-metrics/hr-slides/fy25/faculty-staff-demographic-review-fy25.png`  
**Data Location:** Not currently stored in staticData.js

### Multi-Year Comparison:
Shows Higher Education averages vs. Creighton's actual rates for:
- Faculty
- Staff Exempt
- Staff Non-Exempt
- Total

For fiscal years 2023, 2024, and 2025.

## Data Integration Notes

1. **When to Use External Data:** Use these values when exact alignment with official HR reports is required.

2. **When to Calculate:** Use calculated values from raw data when:
   - Doing custom analysis
   - Need different time periods
   - Require different categorizations

3. **Validation:** Periodically check if external slide data has been updated and needs to be refreshed in our system.

4. **Updates:** When receiving new PowerPoint slides:
   - Save images to `/source-metrics/hr-slides/[fiscal-year]/`
   - Update this document with new values
   - Update `staticData.js` if displaying in dashboards
   - Note the update date and source

## FY25 Turnover Demographics - Complete Slide Data

**Source:** HR Department PowerPoint Slide  
**Location:** `/source-metrics/hr-slides/fy25/turnover-demographics-fy25.md`  
**Data Location:** Multiple components in staticData.js

### Turnover by Length of Service (FY2025)
#### Faculty
- Less Than One: 13.8%
- 1 to 5 Years: 7.2%
- 5 to 10 Years: 5.5%
- 10 to 20 Years: 4.0%
- 20 Plus Years: 6.2%

#### Staff
- Less Than One: 29.8%
- 1 to 5 Years: 14.2%
- 5 to 10 Years: 11.6%
- 10 to 20 Years: 9.0%
- 20 Plus Years: 5.3%

### Turnover by Gender (FY 2025)
- Faculty: Female 5.0%, Male 7.4%, Total 6.1%
- Staff: Female 13.4%, Male 13.8%, Total 13.5%
- Total: Female 11.0%, Male 11.4%, Total 11.2%

### Turnover by Age Range (FY25)
- 20-30: Faculty 19.0%, Staff 28.5%
- 31-40: Faculty 5.7%, Staff 13.1%
- 41-50: Faculty 3.6%, Staff 6.8%
- 51-60: Faculty 4.9%, Staff 6.0%
- 60+: Faculty 8.5%, Staff 10.8%

### Turnover by Grade (FY25)
Full grade table available in `/source-metrics/hr-slides/fy25/turnover-demographics-fy25.md`

**Note:** Benefit eligible employees, excluding Residents as of June 30, 2025. Percentages reflect rates within each group.

## Last Updated
- **Date:** January 2025
- **Source:** HR Department FY25 Turnover Analysis PowerPoint
- **Updated By:** HR Reports Team
- **Latest Addition:** FY25 Turnover Demographics slide (January 2025)