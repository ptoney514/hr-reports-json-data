# Termination Data

This directory contains employee termination data from Workday exports, organized by fiscal quarter for audit trail and data governance.

---

## 📁 Directory Structure

```
terminations/
├── README.md                      # This file
├── DATA_DICTIONARY.md             # Field definitions and codes
├── TERMINATION_METHODOLOGY.md     # Business rules and calculations
│
├── FY25_Q4/                       # Raw data archive (one folder per quarter)
│   ├── Terms Since 2017 Detail PT.xlsx  # Original file from Workday
│   └── RECEIVED_DATE.txt          # Date file was received
│
└── cleaned_data/                  # Cleaned data (mirrors raw structure)
    └── FY25_Q4/
        ├── terminations_cleaned.csv       # Cleaned data for this quarter
        └── DATA_CLEANING_AUDIT.md         # Transformation audit trail
```

---

## 📊 Current Data Status

### FY25 Q4 Data (Latest)
- **Raw File**: `Terms Since 2017 Detail PT.xlsx`
- **Received**: 2025-10-29
- **Original Records**: 11,418 terminations (2017-2025)
- **Cleaned Records**: 5,612 terminations (FY20-FY25 only)
- **Date Range**: 2020-07-01 to 2025-09-30

### Data Summary (FY20-FY25)
**By Employee Category:**
- Students: 2,486 (44.3%)
- Staff Non-Exempt: 1,045 (18.6%)
- House Staff: 828 (14.8%)
- Staff Exempt: 652 (11.6%)
- Faculty: 600 (10.7%)

**By Termination Type:**
- End of Assignment: 3,193 (56.9%) - Natural end for temp/student assignments
- Voluntary: 1,154 (20.6%) - Resignations, better opportunities
- Graduation: 855 (15.2%) - Students who graduated
- Retirement: 243 (4.3%)
- Involuntary: 88 (1.6%) - Discharges, performance issues
- Death: 20 (0.4%)
- Other: 59 (1.1%)

**By Campus:**
- OMA (Omaha): 4,817 (85.8%)
- PHX (Phoenix): 361 (6.4%)
- Unknown: 434 (7.7%)

---

## 🔄 Adding New Quarterly Data

### When You Receive New Termination Data:

**Step 1: Save to OneDrive Archive (Permanent Storage)**

Raw files are stored in **OneDrive**, not Git (see [RAW_DATA_STORAGE.md](../RAW_DATA_STORAGE.md))

```bash
# Save to OneDrive archive
cp ~/Downloads/Terms_Report_Q1.xlsx ~/OneDrive/HR-Reports-Raw-Data/terminations/FY26_Q1/

# Document receipt date in OneDrive
echo "2025-10-31" > ~/OneDrive/HR-Reports-Raw-Data/terminations/FY26_Q1/RECEIVED_DATE.txt
```

**Step 2: Create Temporary Local Copy for Cleaning**
```bash
# Create quarter folder in repo (for cleaning script)
mkdir -p source-metrics/terminations/FY26_Q1

# Copy from OneDrive to local (temporary)
cp ~/OneDrive/HR-Reports-Raw-Data/terminations/FY26_Q1/*.xlsx \
   source-metrics/terminations/FY26_Q1/

# .gitignore will prevent this from being committed
```

**Step 3: Document Receipt Date (Local Copy)**
```bash
echo "2025-10-31" > source-metrics/terminations/FY26_Q1/RECEIVED_DATE.txt
```

**Step 4: Run Cleaning Script**
```bash
cd workforce-dashboard-excel
python scripts/clean_termination_data.py --quarter FY26_Q1
```

**Step 5: Review Output**
Check generated files:
- `cleaned_data/FY26_Q1/terminations_cleaned.csv` (cleaned data)
- `cleaned_data/FY26_Q1/DATA_CLEANING_AUDIT.md` (audit trail)

**Step 6: Validate**
- Review audit file for data quality issues
- Check record counts match expectations
- Verify fiscal period calculations

**Step 7: Commit to Git**
```bash
git add source-metrics/terminations/FY26_Q1/
git add source-metrics/terminations/cleaned_data/FY26_Q1/
git commit -m "feat: add and clean FY26 Q1 termination data"
git push
```

---

## 📋 Data Cleaning Process

### What the Cleaning Script Does:

1. **Loads** Excel file from quarter folder
2. **Filters** to FY2020+ (aligns with workforce data)
3. **Anonymizes** by removing names (keeps Empl_Num for joining)
4. **Calculates** tenure and tenure bands
5. **Classifies** employee categories (Faculty, Staff Exempt/Non-Exempt, etc.)
6. **Categorizes** termination types (Voluntary, Involuntary, Retirement, etc.)
7. **Standardizes** campus locations (OMA/PHX)
8. **Adds** fiscal period fields (Year, Quarter, Period)
9. **Generates** audit trail documenting all transformations
10. **Outputs** cleaned CSV ready for analysis

### Fields in Cleaned Data:

**Employee Info:**
- Empl_Num (identifier for joining)
- Person_Date_of_Birth (for age calculations)
- Gender, Ethnicity, Disabled, Vet_Status (diversity metrics)

**Termination Event:**
- Hire_Date, Term_Date, Term_Qtr_End_Date
- Tenure, Tenure_Band (calculated)
- Term_Reason_1, Term_Reason_2
- Employee_Category, Termination_Type (calculated)

**Organizational:**
- Dept_Name, School, VP_Area
- Location, Campus (calculated)
- Job_Name, Grade, People_Group

**Fiscal Period:**
- Termination_Fiscal_Year, Termination_Fiscal_Quarter, Termination_Fiscal_Period

---

## 🎯 Use Cases

### Turnover Analytics
Join with workforce headcount data to calculate:
- Turnover rates by department, school, category
- Retention analysis by tenure band
- Demographic patterns in turnover

### Exit Analysis
- Most common termination reasons
- Voluntary vs involuntary rates
- Early turnover (<1 year) analysis

### Trend Analysis
- Termination counts over time
- Seasonal patterns
- Year-over-year comparisons

---

## 🔗 Joining with Workforce Data

### Join Key
**Field**: `Empl_Num`

### Turnover Rate Calculation Example:
```python
# For Q4 FY25:
workforce_q4 = workforce_data[workforce_data['Snapshot_Fiscal_Period'] == 'Q4 FY25']
terminations_q4 = termination_data[termination_data['Termination_Fiscal_Period'] == 'Q4 FY25']

headcount = workforce_q4['Empl_num'].nunique()
term_count = len(terminations_q4)
turnover_rate = (term_count / headcount) * 100

print(f"Q4 FY25 Turnover Rate: {turnover_rate:.1f}%")
print(f"  Terminations: {term_count}")
print(f"  Headcount: {headcount}")
```

---

## 📚 Documentation

- **[DATA_DICTIONARY.md](DATA_DICTIONARY.md)**: Field definitions and term reason codes
- **[TERMINATION_METHODOLOGY.md](TERMINATION_METHODOLOGY.md)**: Calculation logic and business rules
- **[DATA_GOVERNANCE_STANDARDS.md](../DATA_GOVERNANCE_STANDARDS.md)**: Quarterly archive standards

---

## ⚠️ Important Notes

### Data Privacy
- **Names removed** in cleaned data for privacy
- **Empl_Num kept** for analytical joins only
- **Date of birth kept** for age validation (anonymized ID, not PII)
- **DO NOT** commit raw Excel files to public repositories

### Data Quality
- Some records may have missing tenure (invalid hire/term dates)
- Some locations may not map to OMA/PHX (marked as "Unknown")
- Review DATA_CLEANING_AUDIT.md for each quarter's specific issues

### Fiscal Calendar
- **FY starts July 1** (same as workforce data)
- **Quarters**: Q1=Jul-Sep, Q2=Oct-Dec, Q3=Jan-Mar, Q4=Apr-Jun
- Must align with workforce data for accurate turnover rates

---

## 🔍 Data Quality Checks

Before using cleaned data:
- [ ] Review DATA_CLEANING_AUDIT.md for data quality issues
- [ ] Verify record counts match expectations
- [ ] Check for high percentage of "Other" classifications (should be <5%)
- [ ] Validate termination fiscal periods align with official reports
- [ ] Cross-reference with HR PowerPoint data for sanity checks

---

## 📞 Support

**Questions or Issues?**
1. Review [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for field definitions
2. Check [TERMINATION_METHODOLOGY.md](TERMINATION_METHODOLOGY.md) for calculation logic
3. Review audit file for quarter-specific data quality notes
4. Consult [DATA_GOVERNANCE_STANDARDS.md](../DATA_GOVERNANCE_STANDARDS.md) for process

---

**Last Updated**: 2025-10-29
**Current Quarter**: FY25 Q4
**Next Update**: When FY26 Q1 data received (expected: ~October 2025)
