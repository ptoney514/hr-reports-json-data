# HR Reports Dashboard - Quick Start Guide

**Complete guide to get started with the HR Reports Dashboard and Data Import Pipeline**

---

## 📋 Table of Contents

1. [First-Time Setup](#first-time-setup)
2. [Running the Dashboard](#running-the-dashboard)
3. [Importing Data (Interactive Wizard)](#importing-data-interactive-wizard)
4. [Common Workflows](#common-workflows)
5. [Troubleshooting](#troubleshooting)
6. [Next Steps](#next-steps)

---

## 🚀 First-Time Setup

### Prerequisites

- **Node.js** 18+ and **npm** (check: `node --version`)
- **Git** (check: `git --version`)

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone <repository-url>
cd hr-reports-json-data

# 2. Install dependencies
npm install

# 3. Verify installation
npm run build  # Should complete without errors

# 4. Start the dashboard
npm start
```

**✅ Success:** Your browser should open to http://localhost:3000

---

## 📊 Running the Dashboard

### Start Development Server

```bash
# From project root
npm start
```

**Dashboard URL:** http://localhost:3000

### Available Dashboards

| Dashboard | URL | Description |
|-----------|-----|-------------|
| **Dashboard Index** | `/dashboards` | Overview of all available dashboards |
| **Workforce** | `/dashboards/workforce` | Employee headcount and demographics |
| **Turnover** | `/dashboards/turnover` | Termination trends and analysis |
| **Exit Survey FY25** | `/dashboards/exit-survey-fy25` | Exit survey responses and insights |
| **Recruiting** | `/dashboards/recruiting` | Hiring metrics and pipeline |
| **Accomplishments** | `/dashboards/accomplishments` | Achievement tracking |
| **FY26 Priorities** | `/dashboards/fy26-priorities` | Strategic goals |
| **Learning & Development** | `/dashboards/learning-development` | Training and development |
| **Total Rewards** | `/dashboards/total-rewards` | Compensation and benefits |
| **Data Validation** | `/admin/data-validation` | Data quality monitoring |
| **Data Sources** | `/admin/data-sources` | Data source status |

### Quick Commands

```bash
npm start              # Start dashboard (http://localhost:3000)
npm test               # Run tests
npm run build          # Build for production
npm run analyze        # Analyze bundle size
```

---

## 🎯 Importing Data (Interactive Wizard)

**The fastest way to import HR data with zero setup!**

### Launch the Wizard

```bash
npm run import:wizard
```

### Wizard Walkthrough (2-3 minutes)

#### **Step 1: Select Data Type**

```
What type of data are you importing?
  1. Workforce (headcount, demographics)
  2. Terminations (turnover data)
  3. Exit Surveys (employee feedback)

Enter number (1-3): 1
```

**Choose based on your data:**
- **Workforce** - Oracle HCM employee export (headcount data)
- **Terminations** - Employee termination records
- **Exit Surveys** - Survey responses from exiting employees

---

#### **Step 2: Select File**

The wizard will auto-discover Excel files in your `source-metrics/` folder:

```
Found 3 files in source-metrics/workforce:
  1. workforce_fy25_q1.xlsx
  2. workforce_fy25_q2.xlsx
  3. Enter custom path

Choose a file: 1
```

**Or enter a custom path:**
```
Enter file path: /Users/you/Downloads/workforce_data.xlsx
```

**Supported formats:** `.xlsx`, `.xls`, `.csv`

---

#### **Step 3: Select Fiscal Period**

```
Use fiscal period (quarter)? [Y/n]: Y

Select fiscal period:
  1. Q1 FY25 (July-September 2024)
  2. Q2 FY25 (October-December 2024)
  3. Q3 FY25 (January-March 2025)
  4. Q4 FY25 (April-June 2025)

Enter number (1-4): 2
```

**Or use a custom date:**
```
Use fiscal period (quarter)? [Y/n]: n
Enter report date (YYYY-MM-DD): 2024-12-31
```

---

#### **Step 4: Preview (Recommended)**

```
Summary
────────────────────────────────────────
Data Type: workforce
File: workforce_fy25_q2.xlsx
Period: FY25_Q2
────────────────────────────────────────

Preview first (dry run)? [Y/n]: Y
Proceed with import? [Y/n]: Y
```

**✅ Dry run shows:**
- What will be processed
- Quality score preview
- No files saved (safe to test)

---

#### **Step 5: Review Results**

```
========================================
   Workforce Data Cleaner
========================================

Loading Excel file...
✓ Found 1 sheets: Sheet1
✓ Loaded 5,234 rows

Processing data...
✓ Processed 5,234 valid employees
✓ Skipped 0 empty rows

Category Breakdown:
  faculty: 1,892
  staff: 2,341
  students: 987
  temp: 14

Location Breakdown:
  Omaha: 4,821
  Phoenix: 413

========================================
✓ Processing Complete
========================================

Total Employees: 5,234
  Faculty: 1,892
  Staff: 2,341
  HSP: 0
  Temp: 14
  Students: 987
  Quality Score: 100/100

Files created:
  • source-metrics/workforce/cleaned/FY25_Q2/workforce_summary.json
  • source-metrics/workforce/cleaned/FY25_Q2/AUDIT_TRAIL.md
  • src/data/staticData.js.backup
```

---

#### **Step 6: Post-Import Actions**

```
View changes (git diff)? [y/N]: y
Start dashboard to test? [y/N]: y
```

**✅ Success!** Your data is now imported and ready to view in the dashboard.

---

### What Happens During Import?

1. **🔍 Load Excel** - Reads your Excel/CSV file
2. **🛡️ Remove PII** - Auto-removes 30+ sensitive fields (names, emails, SSNs, etc.)
3. **📊 Categorize** - Assigns employee categories (Faculty, Staff, Students, etc.)
4. **✅ Validate** - Checks data quality and completeness
5. **📝 Generate Audit** - Creates quality score and transformation log
6. **💾 Backup** - Creates `staticData.js.backup` before changes
7. **🔄 Merge** - Updates `staticData.js` with new data
8. **✨ Done!** - Dashboard automatically shows new data

---

### Safety Features

- ✅ **Automatic PII removal** - Names, emails, IDs, demographics
- ✅ **Dry-run mode** - Preview before committing
- ✅ **Automatic backups** - `staticData.js.backup` created
- ✅ **Quality scoring** - 0-100 quality score for every import
- ✅ **Audit trails** - Full documentation in `AUDIT_TRAIL.md`
- ✅ **Git protection** - Raw files never committed (contains PII)

---

## 📚 Common Workflows

### Workflow 1: Import New Quarter Data (Most Common)

**Time: 2-3 minutes**

```bash
# 1. Receive Excel file from Oracle HCM
# Save to: source-metrics/workforce/raw/workforce_q3.xlsx

# 2. Run the wizard
npm run import:wizard

# 3. Follow prompts:
#    - Select: Workforce
#    - Choose: workforce_q3.xlsx
#    - Period: FY25_Q3
#    - Preview: Yes (recommended)
#    - Proceed: Yes

# 4. Review audit trail
cat source-metrics/workforce/cleaned/FY25_Q3/AUDIT_TRAIL.md

# 5. Test dashboard
npm start
# Open: http://localhost:3000/dashboards/workforce

# 6. Commit changes
git add src/data/staticData.js source-metrics/workforce/cleaned/FY25_Q3/
git commit -m "data: add FY25 Q3 workforce data"
git push
```

---

### Workflow 2: Manual Import (Advanced Users)

**For users who prefer command-line control**

```bash
# Step 1: Clean data (remove PII, categorize)
npm run clean:workforce -- \
  --input source-metrics/workforce/raw/data.xlsx \
  --quarter FY25_Q2 \
  --dry-run  # Remove --dry-run to save files

# Step 2: Review audit trail
cat source-metrics/workforce/cleaned/FY25_Q2/AUDIT_TRAIL.md

# Step 3: Merge to staticData.js
node scripts/merge-to-static-data.js workforce \
  --date 2024-12-31 \
  --input source-metrics/workforce/cleaned/FY25_Q2/workforce_summary.json

# Step 4: Test dashboard
npm start

# Step 5: Commit
git add src/data/staticData.js source-metrics/workforce/cleaned/FY25_Q2/
git commit -m "data: import FY25 Q2 workforce data"
```

---

### Workflow 3: One-Command Import (Fastest)

**When you know exactly what you're doing**

```bash
node scripts/data-import.js workforce \
  source-metrics/workforce/raw/data.xlsx \
  --quarter FY25_Q2 \
  --yes  # Auto-confirm all prompts
```

---

### Workflow 4: Fix Bad Import (Rollback)

**If something went wrong with an import**

```bash
# Option 1: Restore from backup
cp src/data/staticData.js.backup src/data/staticData.js

# Option 2: Git revert
git checkout src/data/staticData.js

# Option 3: Git reset to previous commit
git log --oneline  # Find commit hash
git reset --hard <commit-hash>
```

---

### Workflow 5: Update Existing Quarter Data

**Re-import a quarter with corrected data**

```bash
# Import will overwrite existing data for that quarter
npm run import:wizard

# Select same quarter as before
# Example: FY25_Q2 data gets replaced with new import
```

---

## 🔧 Troubleshooting

### Issue: Dashboard won't start

```bash
# Solution 1: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start

# Solution 2: Kill existing process
lsof -ti:3000 | xargs kill -9
npm start

# Solution 3: Use different port
PORT=3001 npm start
```

---

### Issue: Import wizard can't find file

```bash
# Solution 1: Use absolute path
/Users/yourname/Downloads/workforce.xlsx

# Solution 2: Move file to expected location
mv ~/Downloads/workforce.xlsx source-metrics/workforce/raw/

# Solution 3: Use manual import with full path
node scripts/clean-workforce-data.js \
  --input /full/path/to/file.xlsx \
  --quarter FY25_Q2
```

---

### Issue: Quality score is low (< 70)

**What it means:**
- Missing required fields
- Invalid data formats
- High number of empty rows
- Duplicates detected

**Solution:**
```bash
# 1. Review audit trail for details
cat source-metrics/workforce/cleaned/FY25_Q2/AUDIT_TRAIL.md

# 2. Common issues:
#    - Wrong Excel sheet selected (wizard auto-selects sheet with most data)
#    - Missing columns (check column names match expected format)
#    - Date formatting issues (Excel dates should auto-convert)

# 3. Fix source data and re-import
npm run import:wizard
```

---

### Issue: PII warnings in audit trail

**Audit trail shows:** ⚠️ "Potential PII found in field: comments"

**Solution:**
```bash
# 1. Review the cleaned JSON manually
# Check: source-metrics/workforce/cleaned/FY25_Q2/workforce_cleaned.json

# 2. Search for sensitive data
grep -i "john doe" workforce_cleaned.json
grep -i "@creighton.edu" workforce_cleaned.json

# 3. If PII found, do NOT commit
# Contact data owner to get sanitized export

# 4. PII fields auto-removed (safe):
# - Last Name, First Name, Email, SSN, Phone, Address, etc.
# - Free-text fields (comments, notes) may need manual review
```

---

### Issue: Excel file has wrong format

**Error:** "Failed to read Excel file" or "No data found"

**Solution:**
```bash
# 1. Check file extension
file yourfile.xlsx  # Should show: Microsoft Excel 2007+

# 2. Try opening in Excel to verify it's valid
# If corrupt, re-export from Oracle HCM

# 3. Check if CSV instead of Excel
# Use .csv extension and wizard will handle it

# 4. Inspect file structure
node scripts/inspect-all-sheets.js yourfile.xlsx
```

---

### Issue: Merge failed - structure mismatch

**Error:** "Invalid data structure" or "Validation failed"

**Solution:**
```bash
# 1. Check summary JSON format
cat source-metrics/workforce/cleaned/FY25_Q2/workforce_summary.json

# 2. Compare to existing staticData.js format
# Summary should have: reportingDate, totalEmployees, faculty, staff, etc.

# 3. Re-run clean script (regenerates summary)
npm run clean:workforce -- \
  --input file.xlsx \
  --quarter FY25_Q2

# 4. If still failing, check for:
#    - Missing required fields
#    - Wrong data types (string instead of number)
#    - Invalid date formats
```

---

### Issue: Dashboard shows old data after import

**Solution:**
```bash
# 1. Hard refresh browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# 2. Restart dev server
# Stop: Ctrl + C
npm start

# 3. Clear browser cache
# Chrome: Dev Tools > Application > Clear Storage

# 4. Verify staticData.js was updated
git diff src/data/staticData.js
```

---

## 🎓 Next Steps

### 1. Explore Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Complete dashboard usage guide
- **[Data Pipeline Docs](docs/DATA_PIPELINE_INDEX.md)** - Deep dive into data import
- **[Workflow Tutorials](docs/WORKFLOW_TUTORIALS.md)** - Step-by-step tutorials
- **[Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)** - Comprehensive troubleshooting

### 2. Learn Advanced Features

```bash
# Data validation across sources
npm run validate:all

# Process terminations data
npm run clean:terminations -- \
  --input terminations.xlsx \
  --fiscal-year 2025

# Custom date ranges
node scripts/clean-workforce-data.js \
  --input file.xlsx \
  --date 2024-12-31
```

### 3. Customize for Your Needs

**Configure business rules:**
- Edit: `scripts/clean-workforce-data.js`
- Modify: `BENEFIT_ELIGIBLE_CATEGORIES`, `STUDENT_CATEGORIES`

**Add new data sources:**
- Create: `scripts/clean-exit-surveys-data.js` (template available)
- Follow: `clean-workforce-data.js` as example

**Customize dashboard:**
- Charts: `src/components/charts/`
- Dashboards: `src/components/dashboards/`

### 4. Set Up Automation

**Weekly data refresh:**
```bash
# Create cron job (Mac/Linux)
crontab -e

# Add line (runs every Monday at 8 AM):
0 8 * * 1 cd /path/to/hr-reports && npm run import:wizard
```

**Git hooks for validation:**
```bash
# Pre-commit hook (prevents committing PII)
# Already configured in .gitignore
# Raw files blocked: source-metrics/**/raw/**/*
```

---

## 📞 Support

### Getting Help

1. **Check docs first:**
   - [TROUBLESHOOTING_GUIDE.md](docs/TROUBLESHOOTING_GUIDE.md)
   - [WORKFLOW_TUTORIALS.md](docs/WORKFLOW_TUTORIALS.md)

2. **View audit trails:**
   ```bash
   # Every import creates an audit trail
   cat source-metrics/workforce/cleaned/FY25_Q2/AUDIT_TRAIL.md
   ```

3. **Enable verbose output:**
   ```bash
   # Run scripts with debug info
   DEBUG=* npm run import:wizard
   ```

4. **Check logs:**
   ```bash
   # View import history
   git log --oneline --grep="data:"
   ```

---

## ⚡ Quick Reference

### Essential Commands

| Command | Description | Time |
|---------|-------------|------|
| `npm start` | Start dashboard | 30 sec |
| `npm run import:wizard` | Import data (interactive) | 2-3 min |
| `npm test` | Run tests | 1-2 min |
| `npm run build` | Build for production | 2-3 min |

### File Locations

| What | Where |
|------|-------|
| **Raw data** (PII) | `source-metrics/*/raw/` (git-ignored) |
| **Cleaned data** | `source-metrics/*/cleaned/FY25_Q*/` |
| **Audit trails** | `source-metrics/*/cleaned/FY25_Q*/AUDIT_TRAIL.md` |
| **Dashboard data** | `src/data/staticData.js` |
| **Backups** | `src/data/staticData.js.backup` |

### Data Flow

```
Excel/CSV → Clean → Validate → Merge → Dashboard
   (PII)      (Safe)    (QA)    (Update)  (Display)
```

### Quality Scores

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | Excellent ✅ | Safe to merge |
| 70-89 | Good ✅ | Review warnings, then merge |
| 50-69 | Fair ⚠️ | Review errors, fix if needed |
| < 50 | Poor ❌ | Fix data issues before merging |

---

## 🎉 You're Ready!

**Quick test to verify everything works:**

```bash
# 1. Start dashboard
npm start

# 2. In another terminal, test data import (dry run)
npm run clean:workforce -- \
  --input source-metrics/workforce-headcount/*.xlsx \
  --quarter FY25_Q1 \
  --dry-run

# 3. View audit trail
cat source-metrics/workforce/cleaned/FY25_Q1/AUDIT_TRAIL.md
```

**If all 3 steps work, you're ready to import real data!** 🚀

---

**Last Updated:** November 15, 2025
**Version:** 2.0 (with Interactive Wizard)
**Maintenance:** This guide is updated with each major feature release
