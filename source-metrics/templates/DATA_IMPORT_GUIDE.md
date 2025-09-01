# Data Import Guide for Source Metrics

## Quick Start

1. **Choose your data type** (exit surveys, workforce, turnover, etc.)
2. **Use the appropriate template** from this folder
3. **Save with correct naming** convention
4. **Place in the right folder** (e.g., `exit-surveys/fy25/`)
5. **Validate your data** meets requirements

## Available Templates

### 📋 Exit Survey Template
**File:** `exit_survey_template.csv`

**Required Fields:**
- exit_date (YYYY-MM-DD)
- department
- would_recommend (Yes/No)
- Satisfaction ratings (1-5): job, management, career, work-life, compensation, benefits
- exit_reason
- conduct_concerns (Yes/No)

### 📊 Workforce Metrics Template
**File:** `workforce_template.csv` (coming soon)

**Required Fields:**
- reporting_date
- department
- headcount by category (faculty, staff, temp, HSP)
- location
- vacancy_count

### 📈 Turnover Metrics Template
**File:** `turnover_template.csv` (coming soon)

**Required Fields:**
- period_ending
- department
- terminations
- voluntary/involuntary
- turnover_rate

### 🎯 Recruiting Metrics Template
**File:** `recruiting_template.csv` (coming soon)

**Required Fields:**
- month
- requisitions_opened
- applications_received
- interviews_conducted
- offers_extended
- offers_accepted
- time_to_fill

## Data Format Requirements

### Dates
- Use ISO format: `YYYY-MM-DD` (e.g., 2025-06-30)
- For quarters: Use last day of quarter
- For months: Use last day of month

### Numeric Values
- Ratings: 1-5 scale (integers only)
- Percentages: As decimals (0.29 for 29%) or whole numbers (29)
- Counts: Whole numbers only

### Text Fields
- Department names: Use consistent naming
- Yes/No fields: Exact case matters
- Exit reasons: Use standard categories

### Missing Data
- Leave blank for no response
- Don't use "N/A", "null", or "0" for missing values
- Include row even if survey not completed

## Standard Department Names

Use these exact department names for consistency:

**Academic Units:**
- School of Medicine
- School of Dentistry  
- School of Nursing
- School of Pharmacy
- College of Arts & Sciences
- Heider College of Business
- School of Law

**Administrative Units:**
- Information Technology
- Human Resources
- Finance & Administration
- Student Life
- Athletics
- University Communications
- University Relations
- Provost's Office
- Student Success
- Library Services
- Center For Faculty Excellence

**Campus Locations:**
- Omaha Campus
- Phoenix Campus

## Exit Reason Categories

Use these standard reasons:

**Career Related:**
- Career advancement opportunities
- Lack of career advancement opportunities
- Pursue other career or education
- Return to school

**Work Environment:**
- Dissatisfied with direct supervisor
- Dissatisfied with University leadership
- Work-life balance
- Remote/Hybrid option not available
- Job responsibilities

**Compensation:**
- Compensation
- Benefits

**Life Changes:**
- Relocation
- Retirement
- Personal/family reasons
- Leaving the workforce

**Other:**
- Other (use sparingly)

## Validation Checklist

Before importing data:

- [ ] Correct file format (CSV or Excel)
- [ ] All required fields present
- [ ] Dates in YYYY-MM-DD format
- [ ] Ratings between 1-5
- [ ] Yes/No fields properly capitalized
- [ ] Department names match standards
- [ ] Exit reasons match categories
- [ ] No PII included
- [ ] File named correctly
- [ ] Placed in correct folder

## Common Errors to Avoid

❌ **Wrong:** "IT Department"  
✅ **Right:** "Information Technology"

❌ **Wrong:** "6/30/2025"  
✅ **Right:** "2025-06-30"

❌ **Wrong:** "yes" or "YES"  
✅ **Right:** "Yes"

❌ **Wrong:** Rating of 0 or 6  
✅ **Right:** Rating between 1-5

❌ **Wrong:** "N/A" for missing data  
✅ **Right:** Leave blank

## File Naming Examples

### Good Examples ✅
- `exit_survey_Q4_FY25.csv`
- `exit_survey_2025_06_30.csv`
- `workforce_June_2025.xlsx`
- `turnover_Q4_FY25_final.csv`

### Bad Examples ❌
- `data.csv` (not descriptive)
- `Exit Survey Data.xlsx` (spaces)
- `june-data.csv` (missing year)
- `FY25Q4.csv` (unclear type)

## Getting Help

If you need assistance:
1. Check the template files
2. Review the field definitions
3. Refer to the [Exit Survey Methodology](../../EXIT_SURVEY_METHODOLOGY.md)
4. Contact HR Analytics team

---
*Last Updated: September 2025*