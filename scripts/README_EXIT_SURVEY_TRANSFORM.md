# Exit Survey Data Transformation Workflow

## Overview
This document describes the manual workflow for transforming quarterly exit survey data from cleaned CSV format to the JSON structure required by the HR Reports dashboard application.

---

## Workflow: Manual Upload → Cleaned Data → JSON

### Step 1: Manual Upload (Original Workspace)
**Location**: `/Users/pernelltoney/My Projects/02-development/hr-reports-workspace/source-metrics/exit-surveys/`

1. Receive raw exit survey PDF from survey platform
2. Save PDF to appropriate quarter folder:
   ```
   fy26/Employee Exit FY26_Q1.pdf
   fy26/Employee Exit FY26_Q2.pdf
   (etc.)
   ```

3. Extract qualitative comments (if needed):
   ```bash
   # Manual extraction or automated script
   python scripts/extract_survey_comments.py --quarter FY26_Q1
   ```

### Step 2: Create Cleaned Data (Original Workspace)
**Location**: `source-metrics/exit-surveys/cleaned_data/FY26_Q1/`

**Process**:
1. Review PDF aggregate data (charts, tables, percentages)
2. Create data dictionary mapping aggregate data to individual fields
3. Run processing script to generate synthetic individual responses:
   ```bash
   python scripts/process_exit_survey_pdfs.py --quarter FY26_Q1
   ```

**Output**: `exit_survey_cleaned.csv` (individual response records)

**CSV Schema** (33 columns):
- Response_ID
- Fiscal_Year, Fiscal_Quarter, Quarter_Label
- Demographics: Gender, Age_Group, Ethnicity
- Organizational: School_Department, Employee_Type, Work_Location, Tenure_Band
- Exit Reasons: Primary_Reason, Other_Reasons
- Tools & Resources: Tools_Resources
- Satisfaction Ratings (8 columns): Career_Dev_Rating, Recognition_Rating, etc.
- Benefits (8 columns): Benefit_Tuition_Dependent, Benefit_EAP, etc.
- Next Role: Next_Position_Scope, New_Salary_Comparison
- Overall: Would_Recommend, Caring_Culture, Submit_Date

### Step 3: Transform to JSON (This Repo)
**Location**: `/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data/`

**Run Transformation Script**:
```bash
cd "/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data"
node scripts/transform-exit-survey-fy26-q1.js
```

**Output**:
- Console output with formatted JSON for staticData.js
- Validation report showing data quality checks
- Summary metrics for review

### Step 4: Manual Review & Copy
1. **Review transformation output**:
   - Check validation report (all checks should pass ✅)
   - Verify metrics make sense (percentages, counts, satisfaction scores)
   - Compare to PDF source for spot-check accuracy

2. **Copy JSON to staticData.js**:
   - Open `src/data/staticData.js`
   - Find `EXIT_SURVEY_DATA` object
   - Add new quarter entry with the date key (e.g., `"2025-09-30"`)
   - Paste the JSON output from the transformation script
   - Save file

3. **Update AVAILABLE_DATES**:
   - Add new quarter to the `AVAILABLE_DATES` array
   - Format: `{ value: "2025-09-30", label: "9/30/25 (Q1 FY26)", status: "complete" }`

### Step 5: Update Dashboard (if needed)
**File**: `src/components/dashboards/ExitSurveyQ1Dashboard.jsx` (or create new component)

1. Update `getExitSurveyData()` call with new date:
   ```javascript
   const surveyData = getExitSurveyData("2025-09-30"); // Q1 FY26
   ```

2. Update header text and labels to reflect the correct quarter

3. Ensure charts and visualizations display the new data

### Step 6: Run Validation Tests
**Run automated validation**:
```bash
CI=true npm test -- src/data/__tests__/exitSurveyFY26Q1.test.js
```

**Expected Result**: All 34 tests should pass ✅

**Tests Validate**:
- Data structure completeness
- Response metrics calculations
- Satisfaction score ranges (1-5)
- Percentage ranges (0-100%)
- Internal consistency (counts, sums, etc.)
- Key insights structure

### Step 7: Visual Verification
1. Start development server:
   ```bash
   npm start
   ```

2. Navigate to: http://localhost:3000/dashboards/exit-survey-q1

3. **Manual Checks**:
   - [ ] Header shows correct quarter (Q1 FY26)
   - [ ] Key metrics cards display correct values
   - [ ] Charts render properly
   - [ ] Exit reasons chart shows top 3-5 reasons
   - [ ] Department analysis displays all departments
   - [ ] No console errors
   - [ ] Responsive design works on mobile/tablet/desktop

4. **Cross-Reference with PDF**:
   - [ ] Would Recommend % matches PDF
   - [ ] Top 3 exit reasons match PDF
   - [ ] Satisfaction scores align with PDF charts
   - [ ] Department counts are reasonable

---

## Troubleshooting

### Issue: Transformation script shows wrong number of responses
**Cause**: CSV parsing issue with quoted fields
**Fix**: Ensure `csv-parse` library is installed: `npm install csv-parse`

### Issue: Validation tests fail
**Cause**: Data doesn't match expected structure
**Fix**:
1. Review transformation script output
2. Check CSV file format
3. Verify date key matches in staticData.js

### Issue: Dashboard shows old data
**Cause**: Dashboard not updated to new date
**Fix**: Update `getExitSurveyData()` call with correct date string

### Issue: Percentages don't sum to 100%
**Cause**: Rounding or missing data
**Fix**: Review CSV for completeness, check transformation calculations

---

## Quarterly Cadence

### FY26 Timeline
- **Q1**: July - September 2025 → Report date: 9/30/25 ✅ Complete
- **Q2**: October - December 2025 → Report date: 12/31/25 (pending)
- **Q3**: January - March 2026 → Report date: 3/31/26 (pending)
- **Q4**: April - June 2026 → Report date: 6/30/26 (pending)

### For Each New Quarter:
1. Receive raw PDF
2. Process to cleaned CSV (original workspace)
3. Run transformation script (this repo)
4. Review & copy JSON
5. Run validation tests
6. Visual verification
7. Document migration

---

## File Locations Reference

### Original Workspace
```
/Users/pernelltoney/My Projects/02-development/hr-reports-workspace/
└── source-metrics/
    └── exit-surveys/
        ├── fy26/
        │   ├── Employee Exit FY26_Q1.pdf
        │   └── extracted_comments.json
        └── cleaned_data/
            └── FY26_Q1/
                └── exit_survey_cleaned.csv
```

### This Repo (JSON App)
```
/Users/pernelltoney/My Projects/01 -production/hr-reports-json-data/
├── scripts/
│   ├── transform-exit-survey-fy26-q1.js       # Transformation script
│   └── README_EXIT_SURVEY_TRANSFORM.md         # This file
├── src/
│   ├── data/
│   │   ├── staticData.js                       # JSON data store
│   │   └── __tests__/
│   │       └── exitSurveyFY26Q1.test.js       # Validation tests
│   └── components/
│       └── dashboards/
│           └── ExitSurveyQ1Dashboard.jsx       # Q1 dashboard
└── docs/
    └── data-migrations/
        └── FY26_Q1_EXIT_SURVEY_MIGRATION.md    # Migration audit
```

---

## Data Governance Compliance

✅ **Auditability**: All source files archived and transformation documented
✅ **Reproducibility**: Script can be rerun to verify calculations
✅ **Data Lineage**: Clear path from PDF → CSV → JSON → Dashboard
✅ **Quality Assurance**: Automated tests validate calculations
✅ **Version Control**: All scripts and data committed to Git

---

## Support & Questions

### Rerun Transformation
```bash
node scripts/transform-exit-survey-fy26-q1.js
```

### Verify Calculations Match Original App
1. Compare dashboard output to PDF charts visually
2. Run automated validation tests
3. Spot-check random values from CSV to JSON

### Update for New Quarter
1. Copy `transform-exit-survey-fy26-q1.js` to new script (e.g., `transform-exit-survey-fy26-q2.js`)
2. Update configuration constants (date, quarter label)
3. Point to new CSV file path
4. Run script and follow workflow steps

---

## Metrics Summary (Q1 FY26)

| Metric | Value | Source |
|--------|-------|--------|
| Total Responses | 15 | CSV row count |
| Would Recommend | 80% | 12 of 15 "Yes" |
| Overall Satisfaction | 3.3/5.0 | Average of 8 rating columns |
| Concerns Reported | 20% | 3 of 15 "Caring_Culture = No" |
| Top Exit Reason | "Other" (20%) | Primary_Reason frequency |
| Departments | 8 | Unique School_Department values |
| Response Rate | TBD | Pending termination data |
