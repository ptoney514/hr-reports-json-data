# Source Metrics Data Directory

This directory contains all source data files for HR metrics analysis. Place your raw data files here for processing and analysis.

## 📁 Folder Structure

```
source-metrics/
├── exit-surveys/          # Exit survey data files
│   ├── fy24/             # Fiscal Year 2024 surveys
│   ├── fy25/             # Fiscal Year 2025 surveys
│   └── fy26/             # Fiscal Year 2026 surveys
│
├── workforce/            # Workforce headcount and demographics
│   ├── fy24/
│   ├── fy25/
│   └── fy26/
│
├── turnover/             # Turnover and retention metrics
│   ├── fy24/
│   ├── fy25/
│   └── fy26/
│
├── recruiting/           # Recruiting and hiring data
│   ├── fy24/
│   ├── fy25/
│   └── fy26/
│
├── compliance/           # I-9 and compliance data
│   ├── fy24/
│   ├── fy25/
│   └── fy26/
│
├── raw-exports/          # Raw system exports (HRIS, ATS, etc.)
│   ├── fy24/
│   ├── fy25/
│   └── fy26/
│
├── templates/            # Data templates and formats
├── processed-data/       # Cleaned and processed datasets
└── documentation/        # Data dictionaries and guides
```

## 📊 How to Add Your Data

### Exit Surveys
Place exit survey files in `exit-surveys/fyXX/` folders:
- **Accepted formats:** CSV, Excel (.xlsx), JSON
- **Naming convention:** `exit_survey_YYYY_MM_DD.csv` or `exit_survey_Q#_FY##.xlsx`
- **Example:** `exit_survey_2025_06_30.csv` or `exit_survey_Q4_FY25.xlsx`

### Required Exit Survey Fields:
- Employee ID (anonymized)
- Exit Date
- Department
- Would Recommend (Yes/No)
- Satisfaction Ratings (1-5 scale)
- Exit Reason(s)
- Comments (optional)

### Other Metrics
Follow similar patterns for other data types:
- **Workforce:** `workforce_YYYY_MM_DD.csv`
- **Turnover:** `turnover_Q#_FY##.xlsx`
- **Recruiting:** `recruiting_monthly_YYYY_MM.csv`
- **Compliance:** `i9_compliance_YYYY_MM_DD.xlsx`

## 🔄 Processing Workflow

1. **Add raw files** to appropriate fiscal year folder
2. **Run processing scripts** (if available) to standardize data
3. **Processed data** will be saved to `processed-data/`
4. **Review output** in the application dashboards

## 📝 File Naming Best Practices

- Use underscores, not spaces: `exit_survey_data.csv` ✅
- Include dates in YYYY_MM_DD format: `2025_06_30` ✅
- Include period indicators: `Q4_FY25` or `June_2025` ✅
- Be descriptive: `exit_survey_engineering_dept_2025_Q4.csv` ✅

## 🔒 Data Security Notes

- **Never commit** files containing personally identifiable information (PII)
- **Anonymize** employee IDs before adding files
- **Remove** names, SSNs, and contact information
- **Use** `.gitignore` to exclude sensitive data files

## 📋 Quick Reference

### Current Data Periods Available:
- **Q1 FY25:** July-Sept 2024 (Baseline)
- **Q2 FY25:** Oct-Dec 2024
- **Q3 FY25:** Jan-Mar 2025
- **Q4 FY25:** Apr-Jun 2025
- **Q1 FY26:** July-Sept 2025 (Current)

### Key Metrics We Track:
- Exit volume and reasons
- Survey response rates
- Satisfaction scores (1-5 scale)
- Would recommend percentage
- Department-level analysis
- Period-over-period trends

## 🚀 Getting Started

1. Create your data file following the naming convention
2. Place it in the appropriate folder
3. The application will detect and process new files
4. View results in the dashboard at http://localhost:3000

## 📧 Questions?

Contact the HR Analytics team or refer to the [Exit Survey Methodology Guide](../EXIT_SURVEY_METHODOLOGY.md)

---
*Last Updated: September 2025*