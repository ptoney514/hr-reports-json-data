# Quick Start: Data Pipeline

**5-Minute Guide to Importing HR Data**

---

## TL;DR

```bash
# Receive Excel file from HR → Run one command → Data updated ✅

npm run data:import workforce ~/Downloads/workforce_Q2.xlsx
```

That's it! Script handles everything:
- Cleans data
- Removes PII
- Generates audit trail
- Prompts to merge into staticData.js

---

## Step-by-Step Workflow

### 1️⃣ Receive Data from HR

You'll get an Excel file via email or OneDrive:
- **Workforce:** "New Emp List since FY20 to Q1FY25.xlsx"
- **Terminations:** "Terms Since 2017 Detail PT.xlsx"
- **Exit Surveys:** "Exit Survey Q2 FY25.csv"

### 2️⃣ Save to OneDrive (Archive)

Keep a permanent backup in OneDrive (NOT in git):

```
~/OneDrive/HR-Reports-Raw-Data/
├── workforce/
│   ├── FY25_Q1_workforce.xlsx
│   ├── FY25_Q2_workforce.xlsx
│   └── FY25_Q3_workforce.xlsx
├── terminations/
│   ├── FY25_Q1_terms.xlsx
│   └── FY25_Q2_terms.xlsx
└── exit-surveys/
    ├── FY25_Q1_exit_surveys.csv
    └── FY25_Q2_exit_surveys.csv
```

### 3️⃣ Run Import Command

```bash
# Navigate to project
cd ~/My\ Projects/01\ -production/hr-reports-json-data

# Import data (script auto-detects quarter from filename or prompts)
npm run data:import workforce ~/OneDrive/HR-Reports-Raw-Data/workforce/FY25_Q2_workforce.xlsx

# Or specify quarter manually
npm run data:import workforce ./workforce.xlsx --quarter FY25_Q2
```

**What happens:**
1. Script copies file to `source-metrics/workforce/raw/` (temporary)
2. Reads Excel file
3. Removes PII (names, SSN, email, etc.)
4. Transforms to JSON format matching staticData.js structure
5. Saves to `source-metrics/workforce/cleaned/FY25_Q2/workforce_cleaned.json`
6. Generates audit report: `DATA_CLEANING_AUDIT.md`
7. Prompts: "Merge into staticData.js? (Y/n)"

### 4️⃣ Review Output

**Check audit file:**
```bash
cat source-metrics/workforce/cleaned/FY25_Q2/DATA_CLEANING_AUDIT.md
```

**Verify totals:**
- Total employees match HR slides? ✅
- Faculty/Staff counts correct? ✅
- No validation errors? ✅

### 5️⃣ Merge to staticData.js (if prompted "Y")

Script automatically updates `src/data/staticData.js`:

```javascript
export const WORKFORCE_DATA = {
  "2024-09-30": { ... }, // Q1 data
  "2024-12-31": { ... }, // Q2 data (NEW!)
  // ...
};
```

**Or merge manually later:**
```bash
npm run merge:workforce FY25_Q2
```

### 6️⃣ Test Dashboard

```bash
# Start dev server
npm start

# Open browser: http://localhost:3000
# Navigate to Workforce Dashboard
# Verify Q2 data displays correctly
```

### 7️⃣ Commit to Git

```bash
# Check what changed
git status

# Review diff
git diff src/data/staticData.js

# Commit cleaned data (NOT raw Excel!)
git add source-metrics/workforce/cleaned/FY25_Q2/
git add src/data/staticData.js
git commit -m "feat: Add FY25 Q2 workforce data"

# Push to GitHub
git push origin main
```

---

## Available Commands

### Import Commands (Recommended)

```bash
# Workforce
npm run data:import workforce <file-path> [--quarter FY25_Q2]

# Terminations
npm run data:import terminations <file-path> [--quarter FY25_Q2]

# Exit Surveys
npm run data:import exit-surveys <file-path> [--quarter FY25_Q2]

# Interactive wizard (prompts for everything)
npm run data:wizard
```

### Manual Workflow (Advanced)

```bash
# Clean data only (no merge)
npm run clean:workforce FY25_Q2
npm run clean:terminations FY25_Q2
npm run clean:exit-surveys FY25_Q2

# Merge to staticData.js
npm run merge:workforce FY25_Q2
npm run merge:terminations FY25_Q2

# Validate all data sources
npm run validate:all
```

### Legacy Commands (Already Exist)

```bash
# Current workflow (being replaced)
npm run data:process        # Process turnover data
npm run data:sync           # Sync to staticData.js
npm run data:validate       # Validate consistency
npm run data:update         # All three steps

# Workforce workflow (being replaced)
npm run workforce:process
npm run workforce:sync
npm run workforce:validate
npm run workforce:update
```

---

## Common Scenarios

### Scenario 1: New Quarter Data

**Situation:** HR sends Q3 workforce data

```bash
# 1. Save to OneDrive
# 2. Import
npm run data:import workforce ~/OneDrive/HR-Reports-Raw-Data/workforce/FY25_Q3_workforce.xlsx

# 3. Review audit file
# 4. Merge to staticData.js (prompted)
# 5. Test dashboard
npm start

# 6. Commit
git add source-metrics/workforce/cleaned/FY25_Q3/ src/data/staticData.js
git commit -m "feat: Add FY25 Q3 workforce data"
git push
```

### Scenario 2: Fix Bad Import

**Situation:** Imported wrong file or data looks incorrect

```bash
# 1. Remove bad data
rm -rf source-metrics/workforce/cleaned/FY25_Q2/

# 2. Restore staticData.js from git
git checkout src/data/staticData.js

# 3. Re-import correct file
npm run data:import workforce ~/correct_file.xlsx --quarter FY25_Q2
```

### Scenario 3: Re-process Old Quarter

**Situation:** HR sends updated FY25 Q1 data (corrections)

```bash
# 1. Import with same quarter (overwrites)
npm run data:import workforce ~/new_Q1_file.xlsx --quarter FY25_Q1

# 2. Review changes
git diff source-metrics/workforce/cleaned/FY25_Q1/

# 3. Merge and commit
npm run merge:workforce FY25_Q1
git add -u
git commit -m "fix: Update FY25 Q1 workforce data with HR corrections"
```

---

## Troubleshooting

### Error: "File not found"

**Problem:** File path incorrect

**Solution:**
```bash
# Use absolute path
npm run data:import workforce ~/OneDrive/file.xlsx

# Or copy to project root first
cp ~/OneDrive/file.xlsx ./
npm run data:import workforce ./file.xlsx
```

### Error: "Validation failed: Total mismatch"

**Problem:** Excel data doesn't match expected totals

**Solution:**
1. Review audit file: `source-metrics/workforce/cleaned/FY25_Q2/DATA_CLEANING_AUDIT.md`
2. Check excluded categories (HSR, SUE, etc.)
3. Compare to HR slide deck totals
4. Contact HR if data doesn't match

### Warning: "PII may be present in file"

**Problem:** Script detected possible PII in cleaned data

**Solution:**
1. Review cleaned JSON manually
2. Check PII removal logic in script
3. DO NOT commit if PII found
4. Report bug to developer

### Error: "Quarter not recognized"

**Problem:** Invalid quarter format

**Solution:**
```bash
# Use correct format
npm run data:import workforce file.xlsx --quarter FY25_Q2

# Valid formats:
# - FY25_Q1, FY25_Q2, FY25_Q3, FY25_Q4
# - Q1, Q2, Q3, Q4 (assumes current fiscal year)
```

---

## Data Sources Quick Reference

| Source | Excel File | Frequency | Key Fields |
|--------|-----------|-----------|------------|
| **Workforce** | New Emp List since FY20.xlsx | Quarterly | Person Type, Assignment Category, Location, Department |
| **Terminations** | Terms Since 2017 Detail.xlsx | Quarterly | Term Date, Hire Date, Department, Reason |
| **Exit Surveys** | Exit Survey Q# FY##.csv | Quarterly | Exit Date, Would Recommend, Satisfaction Rating |
| **Recruiting** | Recruiting Activity.xlsx | Monthly | Req ID, Position, Days to Fill, Source |

---

## File Structure After Import

```
hr-reports-json-data/
└── source-metrics/
    └── workforce/
        ├── raw/ (gitignored)
        │   └── FY25_Q2_workforce.xlsx (temporary)
        └── cleaned/ (committed to git)
            └── FY25_Q2/
                ├── workforce_cleaned.json ✅
                └── DATA_CLEANING_AUDIT.md ✅
```

**What gets committed:**
- ✅ Cleaned JSON files (`*_cleaned.json`)
- ✅ Audit reports (`DATA_CLEANING_AUDIT.md`)
- ✅ Updated staticData.js

**What stays local:**
- ❌ Raw Excel files (contain PII)
- ❌ Temporary files (.tmp, .bak)

---

## Security Checklist

Before committing, verify:

- [ ] Raw Excel file is in OneDrive (archive)
- [ ] Raw Excel file is NOT in git (check `git status`)
- [ ] Cleaned JSON has NO employee names
- [ ] Cleaned JSON has NO SSN or employee IDs
- [ ] Cleaned JSON has NO email addresses
- [ ] Audit file shows "PII Removal" step completed
- [ ] Pre-commit hook passed (blocks PII)

---

## Need Help?

**Common Issues:**
- Check ERROR_LOG.md for known errors and solutions
- Review DATA_INGESTION_PIPELINE.md for detailed technical docs

**Questions:**
- Contact: HR Analytics Team
- Documentation: `/docs/DATA_INGESTION_PIPELINE.md`
- Technical: See TECHNICAL_DEBT.md

---

**Last Updated:** November 14, 2025
**Version:** 1.0.0
