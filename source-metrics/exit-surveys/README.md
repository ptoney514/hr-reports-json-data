# Exit Survey Data Directory

Place your exit survey data files here for analysis and processing.

## 📁 Organization

Organize files by fiscal year:
- `fy24/` - Fiscal Year 2024 (July 2023 - June 2024)
- `fy25/` - Fiscal Year 2025 (July 2024 - June 2025)
- `fy26/` - Fiscal Year 2026 (July 2025 - June 2026)

## 📋 Required Data Format

### Essential Fields (Required)
```csv
exit_date,department,would_recommend,job_satisfaction,management_support,career_development,work_life_balance,compensation,benefits,exit_reason,conduct_concerns
2025-06-15,IT,Yes,4,3,2,4,3,4,Career advancement,No
2025-06-20,HR,Yes,3,4,3,3,3,5,Relocation,No
2025-06-22,Finance,No,2,2,2,3,2,3,Dissatisfied with supervisor,Yes
```

### Field Definitions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| exit_date | Date | Employee's last day | 2025-06-30 |
| department | String | Department name | "Information Technology" |
| would_recommend | Yes/No | Would recommend employer | "Yes" or "No" |
| job_satisfaction | 1-5 | Job satisfaction rating | 4 |
| management_support | 1-5 | Management support rating | 3 |
| career_development | 1-5 | Career development rating | 2 |
| work_life_balance | 1-5 | Work-life balance rating | 4 |
| compensation | 1-5 | Compensation satisfaction | 3 |
| benefits | 1-5 | Benefits satisfaction | 4 |
| exit_reason | String | Primary reason for leaving | "Career advancement" |
| conduct_concerns | Yes/No | Reported improper conduct | "Yes" or "No" |

### Optional Fields
- employee_id (anonymized)
- tenure_years
- position_level
- location
- would_return (Yes/No)
- comments (text)

## 📝 File Naming Convention

Use this format: `exit_survey_[PERIOD]_[DATE].csv`

Examples:
- `exit_survey_Q4_FY25.csv` - Quarter 4 of Fiscal Year 2025
- `exit_survey_2025_06_30.csv` - Specific date
- `exit_survey_June_2025.xlsx` - Monthly data

## 🎯 Exit Reason Categories

Standard exit reasons to use:
- Career advancement opportunities
- Relocation
- Retirement
- Dissatisfied with direct supervisor
- Dissatisfied with University leadership
- Work-life balance
- Compensation
- Benefits
- Job responsibilities
- Personal/family reasons
- Return to school
- Remote/hybrid options
- Other

## 📊 Sample Data File

A sample template is available at: `../templates/exit_survey_template.csv`

## 🔄 Processing Instructions

1. **Add your file** to the appropriate fiscal year folder
2. **Ensure all required fields** are present
3. **Use standard exit reasons** from the list above
4. **Run validation** (if scripts are available)
5. **View results** in the Exit Survey Dashboard

## ✅ Data Quality Checklist

Before adding files, ensure:
- [ ] All required fields are present
- [ ] Dates are in YYYY-MM-DD format
- [ ] Ratings are between 1-5
- [ ] Yes/No fields use exact case
- [ ] No PII (names, SSNs) included
- [ ] Department names are consistent
- [ ] Exit reasons match standard categories

## 📈 Current Metrics

From existing data (Q4 FY25):
- Total Exits: 62
- Response Rate: 29%
- Would Recommend: 83.3%
- Concerns Reported: 22.2%

## 🚨 Important Notes

- **Anonymize all data** before uploading
- **Remove PII** (Personal Identifiable Information)
- **Use consistent department names**
- **Include all exits**, even without survey responses
- Mark non-responses appropriately

---
*Last Updated: September 2025*