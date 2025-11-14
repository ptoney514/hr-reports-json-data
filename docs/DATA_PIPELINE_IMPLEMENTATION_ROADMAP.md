# Data Pipeline Implementation Roadmap

**Project:** HR Reports JSON Data - Excel to JSON Pipeline
**Created:** November 14, 2025
**Status:** Design Complete → Ready for Implementation

---

## Executive Summary

### What We're Building

A robust, secure Excel → JSON data pipeline that mirrors the Flask project's simplicity:

**Current Flask Workflow:**
```bash
python scripts/clean_workforce_data.py  # One command
# → Cleaned CSV ready for dashboard
```

**Target React Workflow:**
```bash
npm run data:import workforce file.xlsx  # One command
# → Cleaned JSON merged into staticData.js ✅
```

### Key Benefits

1. **Simplicity:** One command to import data (vs. manual Excel → CSV → JSON)
2. **Security:** Automated PII removal, raw files never committed
3. **Consistency:** Same business rules as Flask (validated totals)
4. **Auditability:** Comprehensive audit trails for compliance
5. **Speed:** 2-3 minutes vs. 20-30 minutes manual process

---

## Implementation Phases

### Phase 1: Foundation (Week 1) - CRITICAL

**Goal:** Core infrastructure and workforce script

#### Tasks:

1. **Create folder structure** (30 min)
   ```bash
   mkdir -p source-metrics/{workforce,terminations,exit-surveys,recruiting}/{raw,cleaned}
   mkdir -p source-metrics/templates
   mkdir -p scripts/{utils,__tests__/fixtures}
   ```

2. **Update .gitignore** (15 min)
   - Block raw Excel files
   - Allow cleaned JSON
   - Add PII indicators

3. **Install dependencies** (10 min)
   ```bash
   npm install xlsx papaparse csv-parse  # Already installed
   # No new deps needed!
   ```

4. **Create utility modules** (2 hours)
   - `scripts/utils/excel-helpers.js` - Excel date conversion, sheet reading
   - `scripts/utils/pii-removal.js` - PII detection and hashing
   - `scripts/utils/fiscal-calendar.js` - FY quarter calculations
   - `scripts/utils/validation.js` - Data validation rules
   - `scripts/utils/audit-generator.js` - Markdown audit generation

5. **Implement clean-workforce-data.js** (4 hours)
   - Port Flask `clean_workforce_data.py` logic to Node.js
   - Use example from DATA_INGESTION_PIPELINE.md
   - Add comprehensive error handling
   - Generate audit trail

6. **Write unit tests** (2 hours)
   - Test category assignment logic
   - Test PII removal
   - Test date conversions
   - Test aggregations

**Deliverables:**
- ✅ Folder structure created
- ✅ Utility modules working
- ✅ clean-workforce-data.js functional
- ✅ Unit tests passing
- ✅ Can process sample Excel → JSON

**Success Criteria:**
```bash
npm run clean:workforce -- --input test.xlsx --quarter FY25_Q2
# → Produces valid workforce_cleaned.json
# → Matches existing staticData.js structure
```

---

### Phase 2: Merge & CLI (Week 2) - HIGH PRIORITY

**Goal:** Auto-merge to staticData.js and unified CLI

#### Tasks:

1. **Create merge-to-static-data.js** (3 hours)
   - Read current staticData.js
   - Parse WORKFORCE_DATA object (handle JS module format)
   - Merge new JSON into correct date key
   - Validate structure before writing
   - Create backup before modifying

2. **Build data-import.js CLI** (4 hours)
   - Unified entry point for all data sources
   - Argument parsing (commander.js or yargs)
   - Auto-detect quarter from filename
   - Orchestrate: copy → clean → validate → merge
   - Interactive prompts for confirmation

3. **Create interactive wizard** (2 hours)
   - `scripts/data-wizard-interactive.js`
   - Prompts for data source, quarter, file path
   - User-friendly error messages
   - Preview changes before committing

4. **Update package.json scripts** (30 min)
   ```json
   {
     "scripts": {
       "data:import": "node scripts/data-import.js",
       "data:wizard": "node scripts/data-wizard-interactive.js",
       "clean:workforce": "node scripts/clean-workforce-data.js",
       "merge:workforce": "node scripts/merge-to-static-data.js workforce"
     }
   }
   ```

5. **Integration testing** (2 hours)
   - Test full workflow: Excel → JSON → staticData.js
   - Verify React app still works
   - Test rollback on error

**Deliverables:**
- ✅ merge-to-static-data.js working
- ✅ data-import.js CLI functional
- ✅ Interactive wizard complete
- ✅ Integration tests passing

**Success Criteria:**
```bash
npm run data:import workforce test.xlsx
# → Cleans data
# → Merges into staticData.js
# → Creates backup
# → Dashboard displays new data correctly
```

---

### Phase 3: Terminations & Exit Surveys (Week 3) - HIGH PRIORITY

**Goal:** Complete all data sources

#### Tasks:

1. **Create clean-terminations-data.js** (3 hours)
   - Port Flask `clean_termination_data.py`
   - FY25 date filtering
   - Tenure calculations
   - Voluntary/Involuntary classification
   - Validate 222 total exits

2. **Create clean-exit-surveys-data.js** (3 hours)
   - CSV/Excel support
   - Response matching to terminations
   - Satisfaction aggregation
   - Comment redaction (manual review still required)

3. **Extend merge script** (2 hours)
   - Support TURNOVER_DATA merging
   - Support EXIT_SURVEY_DATA merging
   - Handle different JSON structures

4. **Cross-validation script** (2 hours)
   - `scripts/validate-all-sources.js`
   - Check terminations vs. exit surveys alignment
   - Check workforce vs. turnover headcount consistency
   - Generate validation report

**Deliverables:**
- ✅ clean-terminations-data.js working
- ✅ clean-exit-surveys-data.js working
- ✅ Merge script supports all sources
- ✅ Cross-validation script functional

**Success Criteria:**
```bash
npm run data:import terminations terms.xlsx
npm run data:import exit-surveys surveys.csv
npm run validate:all
# → All validation checks pass ✅
```

---

### Phase 4: Migration & Documentation (Week 4) - MEDIUM PRIORITY

**Goal:** Migrate existing FY25 data and complete docs

#### Tasks:

1. **Create migrate-flask-to-json.js** (3 hours)
   - Read Flask CSV files
   - Convert to React JSON format
   - Validate against existing staticData.js
   - Generate migration report

2. **Migrate FY25 Q1-Q4 data** (2 hours)
   - Run migration script
   - Review diffs
   - Validate totals match
   - Commit cleaned data

3. **Create templates** (1 hour)
   - `source-metrics/templates/workforce_template.xlsx`
   - `source-metrics/templates/terminations_template.xlsx`
   - `source-metrics/templates/exit_survey_template.xlsx`
   - Example files with anonymized data

4. **Complete documentation** (3 hours)
   - Update README.md with import instructions
   - Create video walkthrough (5-min Loom)
   - Update WORKFLOW_GUIDE.md
   - Add to CLAUDE.md

5. **Pre-commit hook** (1 hour)
   - Block raw Excel files from git
   - Check for PII patterns
   - Validate JSON structure

**Deliverables:**
- ✅ FY25 data migrated to JSON
- ✅ Templates created
- ✅ Documentation complete
- ✅ Pre-commit hook installed

**Success Criteria:**
```bash
git log --oneline | grep "feat: Add FY25"
# → FY25_Q1, Q2, Q3, Q4 all committed
# → No raw Excel files in history
# → Audit trails present for all quarters
```

---

### Phase 5: Polish & Testing (Week 5) - LOW PRIORITY

**Goal:** Production-ready pipeline

#### Tasks:

1. **Error handling improvements** (2 hours)
   - User-friendly error messages
   - Graceful degradation
   - Rollback on failure

2. **Performance optimization** (2 hours)
   - Stream large Excel files
   - Parallel processing
   - Progress indicators

3. **Comprehensive testing** (3 hours)
   - End-to-end tests
   - Edge case handling
   - Load testing (10K+ rows)

4. **CI/CD integration** (2 hours)
   - GitHub Actions workflow
   - Auto-validate PRs with new data
   - Prevent PII commits

5. **User training** (2 hours)
   - Train HR staff on workflow
   - Create troubleshooting guide
   - Schedule Q&A session

**Deliverables:**
- ✅ Production-grade error handling
- ✅ Performance optimized
- ✅ Full test coverage
- ✅ CI/CD pipeline
- ✅ HR staff trained

**Success Criteria:**
```bash
# HR staff can independently:
# 1. Receive Excel from Workday
# 2. Run npm command
# 3. Review audit file
# 4. Commit to git
# 5. Deploy updated dashboard
```

---

## Priority Matrix

### P0 - Critical (Must Have for MVP)
- ✅ Folder structure and .gitignore
- ✅ clean-workforce-data.js
- ✅ merge-to-static-data.js
- ✅ data-import.js CLI
- ✅ Basic validation

**Timeline:** Week 1-2 (10 days)

### P1 - High Priority (Needed for Full Functionality)
- ✅ clean-terminations-data.js
- ✅ clean-exit-surveys-data.js
- ✅ Cross-validation
- ✅ Interactive wizard
- ✅ FY25 migration

**Timeline:** Week 3-4 (10 days)

### P2 - Medium Priority (Nice to Have)
- ⏸ Recruiting data pipeline
- ⏸ Advanced validation rules
- ⏸ Data quality dashboards
- ⏸ Automated tests in CI/CD

**Timeline:** Week 5+ (ongoing)

### P3 - Low Priority (Future Enhancements)
- ⏸ Real-time Workday API integration
- ⏸ Automated quarterly data pulls
- ⏸ Machine learning data quality checks
- ⏸ Data lineage tracking

**Timeline:** Q2 2025

---

## Technical Decisions

### 1. Why Node.js Instead of Python?

**Decision:** Use Node.js for cleaning scripts (not Python)

**Rationale:**
- Entire project is JavaScript/React ecosystem
- No need to switch languages
- `xlsx` npm package is mature and well-supported
- Easier for React developers to maintain
- Can reuse utility functions between scripts and React components

**Trade-off:**
- Python has better data science libraries (pandas)
- But we're doing simple transformations, not ML

### 2. Automated Merge vs. Manual Copy/Paste?

**Decision:** Automated merge with backup and rollback

**Rationale:**
- Flask uses automated CSV → database import
- Reduces manual errors
- Faster workflow
- Git provides version control safety net

**Safety Measures:**
- Always create backup: `staticData.js.backup`
- Validate before writing
- Prompt for confirmation
- Show git diff before commit

### 3. Separate JSON Files vs. staticData.js Monolith?

**Decision:** Keep staticData.js monolith (current structure)

**Rationale:**
- Matches existing architecture
- No code changes needed in React components
- Simpler deployment (single file)
- Easier to audit (one git diff)

**Trade-off:**
- Large file (1,960 lines)
- But acceptable for data size (<1 MB)

### 4. CSV Intermediate Format vs. Direct Excel → JSON?

**Decision:** Direct Excel → JSON (skip CSV)

**Rationale:**
- One less step in workflow
- No CSV parsing errors
- `xlsx` package handles Excel natively
- Cleaner pipeline

**Trade-off:**
- Can't easily inspect intermediate CSV
- But audit trail serves same purpose

---

## Risk Assessment

### High Risk

**Risk:** Committing PII to git
**Mitigation:**
- .gitignore blocks raw files
- Pre-commit hook checks for PII
- Automated PII removal in scripts
- Manual review required for comments

**Risk:** Breaking existing staticData.js
**Mitigation:**
- Always create backup before merge
- Validation before writing
- Integration tests verify app still works
- Git rollback if issues

### Medium Risk

**Risk:** Data quality issues (wrong totals, duplicates)
**Mitigation:**
- Comprehensive validation rules
- Compare to HR slide deck totals
- Audit trail for every import
- Manual review required

**Risk:** Script errors on malformed Excel
**Mitigation:**
- Robust error handling
- Try/catch blocks
- User-friendly error messages
- Graceful degradation

### Low Risk

**Risk:** Performance issues on large files
**Mitigation:**
- Stream processing for 10K+ rows
- Progress indicators
- Optimize aggregations

---

## Success Metrics

### Developer Productivity
- **Target:** <5 minutes to import new quarter data (vs. 20-30 min manual)
- **Measure:** Time from receiving Excel to committing cleaned JSON

### Data Quality
- **Target:** 100% validation pass rate
- **Measure:** Validation errors per import

### User Adoption
- **Target:** HR staff can independently run imports
- **Measure:** % of imports done without developer help

### Security
- **Target:** 0 PII leaks to git
- **Measure:** Pre-commit hook blocks + manual audits

---

## Implementation Team

### Roles

**Developer (Primary):**
- Implement Phase 1-3 scripts
- Write unit tests
- Code review

**QA Tester:**
- Test Phase 4-5 workflows
- Create edge case test data
- Verify validation rules

**HR Stakeholder:**
- Provide sample data
- Review audit trails
- Validate totals match source systems
- Test user workflow

**DevOps (Optional):**
- Setup CI/CD pipeline
- Configure pre-commit hooks
- Deploy to production

---

## Getting Started

### Immediate Next Steps (This Week)

1. **Review design documents** (30 min)
   - Read DATA_INGESTION_PIPELINE.md
   - Read QUICK_START_DATA_PIPELINE.md
   - Understand folder structure

2. **Create Phase 1 folder structure** (15 min)
   ```bash
   cd ~/My\ Projects/01\ -production/hr-reports-json-data
   mkdir -p source-metrics/{workforce,terminations,exit-surveys}/{raw,cleaned}
   mkdir -p scripts/{utils,__tests__/fixtures}
   ```

3. **Update .gitignore** (15 min)
   - Copy from DATA_INGESTION_PIPELINE.md
   - Test with `git check-ignore -v source-metrics/workforce/raw/test.xlsx`

4. **Implement excel-helpers.js utility** (1 hour)
   - excelDateToJSDate function
   - loadExcelFile function
   - Test with existing Excel file

5. **Start clean-workforce-data.js** (2 hours)
   - Copy template from DATA_INGESTION_PIPELINE.md
   - Implement loadExcelFile
   - Implement removePII
   - Test with sample data

### This Month's Goal

**Complete Phase 1-2:** Functional workforce import pipeline

```bash
# By end of month, this should work:
npm run data:import workforce test.xlsx
# ✅ Cleans data
# ✅ Merges into staticData.js
# ✅ Dashboard displays correctly
```

---

## Questions & Answers

### Q: Do I need to build all 4 data sources at once?
**A:** No! Start with workforce only (Phase 1-2). Add terminations and exit surveys in Phase 3.

### Q: Can I use the existing scripts (processTurnoverData.js)?
**A:** Yes! Refactor existing scripts to follow new architecture. They already have good logic.

### Q: What if HR sends a different Excel format?
**A:** Scripts should handle column name variations. Add mapping logic if needed.

### Q: How do I test without breaking production data?
**A:** Use `--dry-run` flag and test fixtures. Never test with production staticData.js directly.

### Q: Should I migrate all historical data (FY20-FY24)?
**A:** Start with FY25 only. Migrate older data only if needed for reporting.

---

## Resources

### Documentation
- **Design Spec:** `/docs/DATA_INGESTION_PIPELINE.md`
- **Quick Start:** `/docs/QUICK_START_DATA_PIPELINE.md`
- **Roadmap:** `/docs/DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md` (this file)

### Reference Code
- **Flask Cleaning Scripts:** `~/02-development/hr-reports-workspace/scripts/`
- **Existing React Scripts:** `/scripts/processTurnoverData.js`, `/scripts/processWorkforceData.js`

### Dependencies
- **xlsx:** https://www.npmjs.com/package/xlsx
- **papaparse:** https://www.npmjs.com/package/papaparse
- **csv-parse:** https://www.npmjs.com/package/csv-parse

---

## Appendix: File Checklist

After full implementation, you should have:

### Scripts Directory
```
scripts/
├── data-import.js (CLI entry point)
├── data-wizard-interactive.js (Interactive wizard)
├── clean-workforce-data.js (Workforce cleaning)
├── clean-terminations-data.js (Terminations cleaning)
├── clean-exit-surveys-data.js (Exit surveys cleaning)
├── merge-to-static-data.js (Merge to staticData.js)
├── validate-all-sources.js (Cross-validation)
├── migrate-flask-to-json.js (One-time migration)
├── utils/
│   ├── excel-helpers.js
│   ├── pii-removal.js
│   ├── fiscal-calendar.js
│   ├── validation.js
│   └── audit-generator.js
└── __tests__/
    ├── clean-workforce-data.test.js
    ├── integration.test.js
    └── fixtures/
        └── test_workforce.xlsx
```

### Source Metrics Directory
```
source-metrics/
├── .gitignore
├── README.md
├── workforce/
│   ├── raw/ (gitignored)
│   └── cleaned/
│       ├── FY25_Q1/
│       ├── FY25_Q2/
│       ├── FY25_Q3/
│       └── FY25_Q4/
├── terminations/
│   ├── raw/ (gitignored)
│   └── cleaned/
│       ├── FY25_Q1/
│       ├── FY25_Q2/
│       ├── FY25_Q3/
│       └── FY25_Q4/
└── templates/
    ├── workforce_template.xlsx
    ├── terminations_template.xlsx
    └── exit_survey_template.xlsx
```

---

**Status:** Design Complete ✅
**Next Action:** Begin Phase 1 Implementation
**Owner:** Development Team
**Target Completion:** 4-5 weeks from start

---

*Last Updated: November 14, 2025*
