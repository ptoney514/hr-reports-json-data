# Data Pipeline Documentation Index

**Complete Guide to Excel → JSON Data Ingestion Pipeline**

---

## 📚 Documentation Suite

### Quick Access

| Document | Purpose | Audience | Read Time |
|----------|---------|----------|-----------|
| **[Quick Start Guide](QUICK_START_DATA_PIPELINE.md)** | 5-minute workflow tutorial | End Users (HR Staff) | 5 min |
| **[Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md)** | Visual system architecture | Developers, Architects | 15 min |
| **[Technical Design](DATA_INGESTION_PIPELINE.md)** | Comprehensive technical spec | Developers, Technical Leads | 45 min |
| **[Implementation Roadmap](DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md)** | Step-by-step build plan | Developers, Project Managers | 20 min |
| **[Database README](../database/README.md)** | Neon PostgreSQL integration | Developers | 10 min |

---

## 🗄️ Data Pipeline Options

This project supports **two data pipeline approaches**:

### Option 1: Local JSON Pipeline (Original)
Excel → Node.js Scripts → JSON files → staticData.js → React Dashboard

**Best for:** Simple deployments, offline use, no database dependency
**Commands:** `npm run data:import`, `npm run clean:workforce`

### Option 2: Neon PostgreSQL Pipeline (Recommended for Production)
Excel → ETL Scripts → Neon PostgreSQL → REST API → React Dashboard

**Best for:** Production deployments, data validation, API access, multi-user
**Commands:** `npm run etl:workforce`, `npm run etl:demographics`, `npm run etl:terminations`

| Feature | Local JSON | Neon PostgreSQL |
|---------|------------|-----------------|
| Setup complexity | Low | Medium |
| Real-time validation | No | Yes |
| API endpoints | No | Yes |
| Multi-user access | No | Yes |
| Offline capability | Yes | No |
| Data portability | JSON export | JSON export + SQL |

**See:** [Database README](../database/README.md) for Neon PostgreSQL setup

---

## 🚀 Getting Started

### I'm an HR Staff Member...

**You want to:** Import new quarterly data from Workday

**Start here:** [Quick Start Guide](QUICK_START_DATA_PIPELINE.md)

**Key commands:**
```bash
# Import workforce data
npm run data:import workforce ~/OneDrive/workforce_Q2.xlsx

# Import terminations data
npm run data:import terminations ~/OneDrive/terms_Q2.xlsx

# Import exit surveys
npm run data:import exit-surveys ~/OneDrive/surveys_Q2.csv
```

**Workflow:**
1. Receive Excel from HR system
2. Save to OneDrive (archive)
3. Run import command
4. Review audit file
5. Commit to git
6. Dashboard auto-updates ✅

---

### I'm a Developer...

**You want to:** Understand the pipeline architecture

**Start here:** [Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md)

**Key concepts:**
- Three-layer security model (OneDrive → Staging → Git)
- Node.js cleaning scripts (Excel → JSON)
- Automated PII removal
- Merge to staticData.js
- Comprehensive validation

**Then read:** [Technical Design](DATA_INGESTION_PIPELINE.md)

**Next step:** [Implementation Roadmap](DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md)

---

### I want to use Neon PostgreSQL...

**You want to:** Load data into Neon database with API access

**Start here:** [Database README](../database/README.md)

**Key commands:**
```bash
# Set up database
npm run db:migrate

# Load demographics (gender, ethnicity, age bands)
npm run etl:demographics -- --date 2025-06-30

# Export demographics to JSON
npm run etl:demographics:export -- --date 2025-06-30

# Load workforce headcount
npm run etl:workforce -- --input source-metrics/workforce/raw/file.xlsx --quarter FY25_Q2

# Load terminations
npm run etl:terminations -- --input source-metrics/terminations/raw/file.xlsx --fiscal-year 2025
```

**Workflow:**
1. Set DATABASE_URL in .env
2. Run migrations (`npm run db:migrate`)
3. Load data with ETL scripts
4. Access via REST API (`/api/demographics/:date`)
5. Optionally export to JSON for local backup

---

### I'm a Project Manager...

**You want to:** Understand scope and timeline

**Start here:** [Implementation Roadmap](DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md)

**Key milestones:**
- **Week 1-2:** Core workforce pipeline (P0)
- **Week 3:** Terminations & exit surveys (P1)
- **Week 4:** Migration & documentation (P1)
- **Week 5:** Polish & testing (P2)

**Total timeline:** 4-5 weeks

**Success criteria:**
- One-command data import
- <5 minutes from Excel to dashboard
- 100% PII removal
- HR staff can run independently

---

## 📖 Document Details

### 1. Quick Start Guide (QUICK_START_DATA_PIPELINE.md)

**Purpose:** 5-minute tutorial for end users

**Contents:**
- TL;DR one-command workflow
- Step-by-step import process
- Common scenarios (new quarter, fix bad import, re-process)
- Troubleshooting guide
- Security checklist

**Best for:**
- HR staff importing data
- Quick reference during imports
- Onboarding new users

**Length:** 5 pages, 5 min read

---

### 2. Architecture Overview (DATA_PIPELINE_ARCHITECTURE.md)

**Purpose:** Visual system architecture and data flow

**Contents:**
- System architecture diagram (ASCII art)
- Data flow sequence
- Security architecture (three-layer model)
- Technology stack
- Performance characteristics
- Error handling strategy
- Audit trail examples
- Comparison: Flask vs. React

**Best for:**
- Understanding how the system works
- Architecture reviews
- Onboarding developers
- Technical presentations

**Length:** 12 pages, 15 min read

---

### 3. Technical Design (DATA_INGESTION_PIPELINE.md)

**Purpose:** Comprehensive technical specification

**Contents:**
- **Folder Structure:** Proposed directory layout, .gitignore rules
- **Data Sources:** Workforce, terminations, exit surveys, recruiting
- **Script Architecture:** Modular Node.js cleaning scripts
- **User Workflow:** Step-by-step process, command options
- **Transformation Rules:** PII removal, category derivation, fiscal periods
- **Validation & Audit:** Data quality checks, audit trail format
- **staticData.js Integration:** Automated merge strategy
- **Migration Guide:** Converting Flask CSV to JSON
- **Example Implementation:** Complete workforce cleaning script (200+ lines)
- **Testing Strategy:** Unit tests, integration tests, E2E tests
- **Security & Compliance:** PII protection, pre-commit hooks, WCAG

**Best for:**
- Implementing the pipeline
- Understanding business rules
- Writing cleaning scripts
- Security reviews
- Compliance audits

**Length:** 45 pages, 45 min read (reference document)

---

### 4. Implementation Roadmap (DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md)

**Purpose:** Step-by-step build plan with timeline

**Contents:**
- **Executive Summary:** What we're building, key benefits
- **Implementation Phases:**
  - Phase 1: Foundation (Week 1) - Core infrastructure
  - Phase 2: Merge & CLI (Week 2) - Auto-merge, unified CLI
  - Phase 3: Data Sources (Week 3) - Terminations, exit surveys
  - Phase 4: Migration (Week 4) - FY25 data migration, docs
  - Phase 5: Polish (Week 5) - Testing, CI/CD, training
- **Priority Matrix:** P0-P3 tasks with timelines
- **Technical Decisions:** Node.js vs. Python, merge strategies
- **Risk Assessment:** High/medium/low risks with mitigations
- **Success Metrics:** Speed, quality, security, usability
- **Getting Started:** Immediate next steps

**Best for:**
- Planning implementation
- Tracking progress
- Resource allocation
- Sprint planning

**Length:** 20 pages, 20 min read

---

## 🎯 Use Cases

### Use Case 1: New Quarter Data Import

**Scenario:** HR sends Q3 workforce data

**Documents to reference:**
1. [Quick Start Guide](QUICK_START_DATA_PIPELINE.md) - Workflow steps
2. [Technical Design](DATA_INGESTION_PIPELINE.md) - Troubleshooting if errors

**Process:**
```bash
npm run data:import workforce ~/OneDrive/FY25_Q3_workforce.xlsx
# Review audit file
# Merge to staticData.js
# Test dashboard
# Commit to git
```

---

### Use Case 2: Building the Pipeline (Developer)

**Scenario:** Implementing Phase 1 (Foundation)

**Documents to reference:**
1. [Implementation Roadmap](DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md) - Phase 1 tasks
2. [Technical Design](DATA_INGESTION_PIPELINE.md) - Script examples
3. [Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md) - System design

**Process:**
1. Create folder structure
2. Implement utility modules (excel-helpers.js, pii-removal.js)
3. Build clean-workforce-data.js
4. Write unit tests
5. Test with sample data

---

### Use Case 3: Troubleshooting Import Errors

**Scenario:** Validation failed during import

**Documents to reference:**
1. [Quick Start Guide](QUICK_START_DATA_PIPELINE.md) - Troubleshooting section
2. [Technical Design](DATA_INGESTION_PIPELINE.md) - Validation rules
3. [Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md) - Error handling

**Process:**
1. Review audit file: `source-metrics/*/cleaned/*/DATA_CLEANING_AUDIT.md`
2. Check validation error message
3. Compare to expected totals (HR slides)
4. Contact HR if data issue
5. Re-run import after fix

---

### Use Case 4: Loading Demographics to Neon

**Scenario:** Load FY25 Q4 demographics into Neon PostgreSQL

**Documents to reference:**
1. [Database README](../database/README.md) - ETL commands and schema

**Process:**
```bash
# Ensure DATABASE_URL is set
export DATABASE_URL=postgresql://...

# Run demographics ETL
npm run etl:demographics -- --date 2025-06-30

# Verify data loaded
# SELECT COUNT(*) FROM fact_workforce_demographics WHERE period_date = '2025-06-30';
# Expected: 93 records (33 combined location metrics)

# Export to JSON for local backup
npm run etl:demographics:export -- --date 2025-06-30
```

**Validation:**
- Gender totals: Faculty=689 (321M, 368F), Staff=1448 (534M, 914F)
- View dashboard at `/dashboards/workforce-test` - Demographics tab shows "Passed"

---

### Use Case 5: Security Audit

**Scenario:** Ensuring no PII in git

**Documents to reference:**
1. [Technical Design](DATA_INGESTION_PIPELINE.md) - Security section
2. [Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md) - Security architecture
3. [Quick Start Guide](QUICK_START_DATA_PIPELINE.md) - Security checklist

**Verification:**
1. Check .gitignore blocks raw files
2. Review pre-commit hook
3. Audit cleaned JSON for PII
4. Verify hash functions (one-way)
5. Check git history for leaks

---

## 🔑 Key Concepts

### Three-Layer Security Model

```
Layer 1: OneDrive (Full PII)      → Permanent archive
Layer 2: Local Staging (Temp PII) → Processing only, gitignored
Layer 3: Git Committed (No PII)   → Public, safe to share
```

**See:** [Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md#security-architecture)

---

### One-Command Workflow

```bash
npm run data:import <source> <file-path> [options]

# Examples:
npm run data:import workforce ./file.xlsx
npm run data:import terminations ./terms.xlsx --quarter FY25_Q2
npm run data:import exit-surveys ./surveys.csv --auto-merge
```

**See:** [Quick Start Guide](QUICK_START_DATA_PIPELINE.md#available-commands)

---

### Data Transformation Pipeline

```
Excel → Load → Remove PII → Transform → Aggregate → Validate → JSON
```

**Steps:**
1. Load Excel using xlsx package
2. Remove PII (hash IDs, delete names/SSN/email)
3. Transform (assign categories, standardize locations)
4. Aggregate (calculate totals, group by dept/location)
5. Validate (check required fields, verify totals)
6. Export JSON (save to source-metrics/*/cleaned/)

**See:** [Technical Design](DATA_INGESTION_PIPELINE.md#data-transformation-rules)

---

### Automated Merge Strategy

```
Cleaned JSON → Merge Script → staticData.js (backup created)
```

**Options:**
- **Option A:** Automated merge (recommended)
- **Option B:** Manual copy/paste
- **Option C:** Separate JSON files with dynamic import

**See:** [Technical Design](DATA_INGESTION_PIPELINE.md#staticdatajs-integration-strategy)

---

## 🛠️ Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Create folder structure (`source-metrics/{workforce,terminations}/raw/cleaned/`)
- [ ] Update .gitignore (block raw files, allow cleaned JSON)
- [ ] Create utility modules (excel-helpers, pii-removal, fiscal-calendar)
- [ ] Implement clean-workforce-data.js (port Flask logic)
- [ ] Write unit tests (category assignment, PII removal, validation)
- [ ] Test with sample Excel file

**Success:** Can run `npm run clean:workforce` and get valid JSON

---

### Phase 2: Merge & CLI (Week 2)

- [ ] Create merge-to-static-data.js (auto-update staticData.js)
- [ ] Build data-import.js CLI (unified entry point)
- [ ] Create interactive wizard (data-wizard-interactive.js)
- [ ] Update package.json scripts (data:import, merge:workforce)
- [ ] Integration tests (Excel → JSON → staticData.js → dashboard)

**Success:** Can run `npm run data:import workforce file.xlsx` end-to-end

---

### Phase 3: Data Sources (Week 3)

- [ ] Create clean-terminations-data.js (FY25 filtering, tenure calc)
- [ ] Create clean-exit-surveys-data.js (response matching, satisfaction)
- [ ] Extend merge script (support TURNOVER_DATA, EXIT_SURVEY_DATA)
- [ ] Create validate-all-sources.js (cross-validation)

**Success:** All data sources can be imported via CLI

---

### Phase 4: Migration & Docs (Week 4)

- [ ] Create migrate-flask-to-json.js (convert CSV to JSON)
- [ ] Migrate FY25 Q1-Q4 data (run migration, validate, commit)
- [ ] Create templates (workforce_template.xlsx, etc.)
- [ ] Complete documentation (update README, WORKFLOW_GUIDE)
- [ ] Install pre-commit hook (block PII from git)

**Success:** All FY25 data migrated, documented, secured

---

### Phase 5: Polish & Testing (Week 5)

- [ ] Improve error handling (user-friendly messages)
- [ ] Optimize performance (stream large files, progress indicators)
- [ ] Comprehensive testing (E2E, edge cases, load testing)
- [ ] CI/CD integration (GitHub Actions, auto-validate PRs)
- [ ] User training (train HR staff, create troubleshooting guide)

**Success:** Production-ready, HR staff can use independently

---

## 📊 Metrics & KPIs

### Developer Productivity

| Metric | Current (Manual) | Target (Automated) | Improvement |
|--------|------------------|---------------------|-------------|
| Time to import quarter data | 20-30 min | <5 min | 80% faster |
| Error rate (manual entry) | 10-15% | <1% | 90% reduction |
| PII removal | Manual, error-prone | Automated, 100% | Risk eliminated |

---

### Data Quality

| Metric | Target | Measurement |
|--------|--------|-------------|
| Validation pass rate | 100% | Errors per import |
| Data completeness | >95% | Required fields present |
| Duplicate records | 0% | Duplicate detection |
| Total accuracy | 100% | Match HR slide deck |

---

### Security

| Metric | Target | Measurement |
|--------|--------|-------------|
| PII leaks to git | 0 | Pre-commit blocks + audits |
| Encryption at rest | 100% | OneDrive, local disk |
| Access control | HR staff only | Role-based permissions |

---

## 🔗 Related Documentation

### Project Documentation

- **PROJECT_STATUS.md** - Current project state
- **WORKFLOW_GUIDE.md** - Development procedures
- **PR_WORKFLOW.md** - Pull request process
- **TECHNICAL_DEBT.md** - Known issues
- **ERROR_LOG.md** - Common errors and solutions

### Existing Methodology Guides

- **WORKFORCE_METHODOLOGY.md** - Workforce data definitions
- **TURNOVER_METHODOLOGY.md** - Turnover calculation rules
- **EXIT_SURVEY_METHODOLOGY.md** - Exit survey analysis

### Technical Architecture

- **docs/assessments/TECHNICAL_ARCHITECTURE_REVIEW.md** - Architecture assessment

---

## 💡 Pro Tips

### For HR Staff

1. **Always save to OneDrive first** - Permanent backup before processing
2. **Review audit file** - Catch issues before committing
3. **Test dashboard locally** - Verify data before pushing to production
4. **Use descriptive commit messages** - "feat: Add FY25 Q2 workforce data"

### For Developers

1. **Start with workforce** - Simplest data source, build foundation
2. **Port Flask logic** - Don't reinvent, translate Python → JavaScript
3. **Test with real data** - Sample files catch edge cases
4. **Validate early, validate often** - Catch errors before merge

### For Project Managers

1. **Phase 1-2 are critical** - Block 2 weeks for core pipeline
2. **Phase 3 adds value** - Additional data sources quickly
3. **Phase 4 is polish** - Migration and docs take time
4. **Phase 5 is optional** - Nice-to-haves, can defer

---

## 🆘 Getting Help

### Quick Questions

- **Check:** [Quick Start Guide](QUICK_START_DATA_PIPELINE.md) - Common scenarios
- **Check:** [Architecture Overview](DATA_PIPELINE_ARCHITECTURE.md) - Error handling

### Technical Issues

- **Check:** [Technical Design](DATA_INGESTION_PIPELINE.md) - Detailed specs
- **Check:** ERROR_LOG.md - Known errors and solutions
- **Check:** TECHNICAL_DEBT.md - Known limitations

### Implementation Questions

- **Check:** [Implementation Roadmap](DATA_PIPELINE_IMPLEMENTATION_ROADMAP.md) - Build plan
- **Contact:** Development team for clarification

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-30 | Added Neon PostgreSQL pipeline documentation |
| 1.0.0 | 2025-11-14 | Initial design and documentation suite |

---

## ✅ Document Checklist

Before implementation, ensure you've reviewed:

- [ ] Quick Start Guide (5 min) - Understand user workflow
- [ ] Architecture Overview (15 min) - Understand system design
- [ ] Technical Design (45 min) - Understand implementation details
- [ ] Implementation Roadmap (20 min) - Understand build plan

**Total prep time:** ~90 minutes

**ROI:** Save 15-25 min per data import × 12 imports/year = 3-5 hours/year

**Plus:** Eliminate manual errors, improve data quality, enhance security

---

**Documentation Suite Complete ✅**

**Next Action:** Review documents → Begin Phase 1 implementation

---

*Last Updated: January 30, 2026*
*Maintained by: Development Team*
