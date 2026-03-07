# GitHub Issue: ETL Pipeline Refactoring

> **Instructions**: Create this as a GitHub issue using the gh CLI or GitHub web UI.
> **Title**: `ETL Pipeline Refactoring: Reduce Complexity & Improve Maintainability`
> **Labels**: `technical-debt`, `enhancement`, `p1`

---

## Problem Statement

The current ETL pipeline (`scripts/etl/`) is tightly coupled to specific Excel formats with hardcoded business logic spread across 9 scripts. It works today but won't scale well if business rules change — a column rename, new location, or updated categorization rule requires editing code in multiple files.

**Key metrics (verified by review board 2026-03-07):**
- ~40% code duplication across 9 ETL scripts (5,216 total lines)
- 32 inline SQL upsert patterns repeated across scripts
- 95+ hardcoded business rules, only ~13% covered by initial config proposal
- 34 fields with 130+ column aliases across scripts
- No header/schema validation before processing

---

## Assessment: Current Pain Points

### 1. Massive Code Duplication (~40%)
- `parseArgs()` duplicated 9x across all ETL scripts (~360 lines; NOT identical — each has different options)
- ANSI color definitions repeated 9x (12x across all scripts in directory)
- `main()` boilerplate (connection check, audit log, banners) duplicated 9x (~405 lines)
- `main().catch()` error handler duplicated 9x (45 lines)
- `printHelp()` duplicated 9x with same color structure
- School lookup function duplicated 3x (`workforce`, `terminations`, `mobility`)
- `findDefaultInputFile()` duplicated 4x (`demographics`, `turnover-metrics`, `recruiting-metrics`, `turnover-rates`)
- Same upsert pattern (INSERT...ON CONFLICT...RETURNING) repeated **32 times**
- Excel workbook loading/sheet detection duplicated 6x
- Auto-detect largest sheet duplicated 3x
- Location detection duplicated 3x
- `BENEFIT_ELIGIBLE_CATEGORIES` duplicated 2x (with different ordering)

### 2. Hardcoded Business Logic Everywhere
- **Employee categorization**: `BENEFIT_ELIGIBLE_CATEGORIES`, `STUDENT_CATEGORIES`, `SPECIAL_CATEGORIES` are inline array literals
- **Location detection**: Brittle string check — `locationRaw.toLowerCase().includes('phoenix') ? 'phoenix' : 'omaha'`
- **Termination reason codes**: 16 keyword-to-reason mappings hardcoded as object literal (`terminations-to-postgres.js:208-226`)
- **Excel date serial numbers**: Manually maintained per quarter in `demographics-to-postgres.js:47-55`
- **Ethnicity normalization**: Single hardcoded mapping (`'i am hispanic or latino.' → 'Hispanic or Latino'`)
- **Expected validation values**: Hardcoded counts (697 faculty, 222 terminations) used for validation checks
- **Chart colors**: Hardcoded in recruiting ETL (`#10B981`, `#3B82F6`, etc.) — presentation logic in data pipeline

### 3. Excel Format Brittleness
- Column names handled via chains of 5-6 fallback names:
  ```javascript
  const assignmentCategory = (
    row['Assignment Category Code'] ||
    row['Assignment Category'] ||
    row.assignment_category ||
    row.assignment_category_code ||
    row.assignmentCategoryCode || ''
  ).toString().trim().toUpperCase();
  ```
- No header validation — wrong sheet gets processed silently
- Sheet names assumed with no fuzzy matching or existence check
- No column mapping configuration file

### 4. Weak Error Handling
- Errors counted but execution always continues (no transient vs fatal distinction)
- No retry logic on database failures
- Generic error messages with no row context for debugging
- Silent failures: missing Excel date mappings produce warnings but still load data
- No schema validation before insert (garbage in, garbage out)

### 5. No Database Abstraction
- Each script hardcodes exact table names, column lists, and ON CONFLICT clauses
- Schema changes require updating multiple scripts
- No generic upsert/insert helper

---

## Proposed Improvements (Prioritized)

### Phase 1: Quick Wins (Low effort, high impact)

#### 1.1 Extract Shared Utilities
Create reusable modules to eliminate duplication:
- [ ] `scripts/utils/etl-runner.js` — shared main() boilerplate: connection check, audit log lifecycle, banner printing, error handler, endPool (eliminate 9x duplication, ~405 lines)
- [ ] `scripts/utils/cli-parser.js` — shared argument parsing with common flags + script-specific extensions (eliminate 9x, ~360 lines)
- [ ] `scripts/utils/formatting.js` — ANSI colors, banners, checkmarks, dry-run prefixes (eliminate 9x)
- [ ] `scripts/utils/school-lookup.js` — `loadSchoolLookup()` + `findSchoolId()` (eliminate 3x)
- [ ] `scripts/utils/workbook-loader.js` — Excel loading + auto sheet detection + explicit sheet validation + `findDefaultInputFile()` (eliminate 6x)

**Estimated reduction**: ~1,000-1,100 lines of duplicated code

#### 1.2 Create Config Files (split into 3 files per review board)

**`scripts/config/etl-config.json`** — Business rules, categories, keywords, defaults:
```json
{
  "version": "1.0.0",
  "categories": {
    "benefit_eligible": ["F12", "F11", "F10", "F09", "PT12", "PT11", "PT10", "PT9"],
    "student": ["SUE", "CWS"],
    "house_staff": ["HSR", "HSP"],
    "temp": ["TEMP", "NBE", "PRN"]
  },
  "person_types": {
    "faculty": ["FACULTY"],
    "staff": ["STAFF", "EMPLOYEE"]
  },
  "locations": {
    "phoenix": { "keywords": ["phoenix", "phx"] },
    "omaha": { "keywords": ["omaha"], "is_default": true }
  },
  "termination_reasons": {
    "keyword_to_code": { "RESIGN": ["resign", "resignation"], "...all 16 entries..." : "..." },
    "category_keywords": {
      "voluntary": ["resign", "voluntary", "better opportunity", "personal", "career change", "end assignment", "relocation"],
      "involuntary": ["termination", "involuntary", "performance", "policy", "layoff", "reduction", "conduct", "probation"],
      "retirement": ["retire"]
    }
  },
  "tenure_buckets": [
    { "max_years": 1, "label": "<1yr" },
    { "max_years": 3, "label": "1-3yr" },
    { "max_years": 5, "label": "3-5yr" },
    { "max_years": 10, "label": "5-10yr" },
    { "max_years": null, "label": "10+yr" }
  ],
  "mobility_actions": {
    "promotion": ["promot"], "demotion": ["demot"], "transfer": ["transfer"],
    "reclassification": ["reclass"], "lateral": ["lateral"]
  },
  "ethnicity_normalization": { "i am hispanic or latino.": "Hispanic or Latino" },
  "expected_sheets": {
    "turnover": ["Summary_Rates", "...15 total..."],
    "recruiting": ["Metadata", "...12 total..."]
  },
  "deviation_defaults": { "staff_avg": 13.6, "faculty_avg": 6.3 },
  "defaults": {
    "location": "omaha", "employee_type": "STAFF", "termination_type": "voluntary",
    "reason_code": "OTHER", "ethnicity": "Not Disclosed"
  }
}
```

**`scripts/config/column-mappings.json`** — All 34 fields with 130+ aliases:
```json
{
  "assignment_category": ["Assignment Category Code", "Assignment Category", "assignment_category", "assignment_category_code", "assignmentCategoryCode"],
  "employee_id": ["Employee ID", "Empl ID", "Empl Num", "employee_id", "employeeId"],
  "hire_date": ["Hire Date", "hire_date", "hireDate"],
  "...all 34 fields...": "..."
}
```

**`scripts/config/etl-validation.json`** — Per-period expected counts (fiscally scoped):
```json
{
  "FY25": { "terminations": 222, "period_date": "2025-06-30" },
  "FY26_Q1": { "faculty": 697, "staff": 1419, "total": 5528 }
}
```

With utilities: `scripts/utils/config-loader.js` and `scripts/utils/column-resolver.js`

**IMPORTANT — Out of scope for config externalization (must stay in code):**
- `categorizeEmployee()` — 5-level cascading priority with Grade R synthetic code
- `categorizeTerminationType()` — keyword priority ordering, default-to-voluntary fallback
- `normalizeScore()` — implicit range detection (1-5 vs 0-100)

#### 1.3 Eliminate EXCEL_DATE_MAP
Replace the manually-maintained `EXCEL_DATE_MAP` in demographics with algorithmic date comparison using existing `excelDateToJSDate()` helper. This is the #1 maintenance burden (requires code change every quarter).

#### 1.4 Remove Chart Colors from ETL
Move `ageColors` and `demoColors` maps from `recruiting-metrics-to-postgres.js` to frontend config. Zero dependencies, zero risk.

### Phase 2: Medium-term Improvements

#### 2.1 Generic Upsert Helper
Add to `neon-client.js`:
```javascript
async function upsert(table, data, conflictKeys, options = {}) {
  // options.columnMap: { 'apps_per_req': 'apps_per_requisition' } — for asymmetric field names
  // Build INSERT...ON CONFLICT dynamically
  // Preserve (xmax = 0) AS inserted pattern for insert/update detection
  // Support different conflict resolution strategies
  // Return { inserted, updated } counts
}
```
**Impact**: Replace 32 inline SQL templates with one-liners
**Prerequisite**: `column-resolver.js` must be integration-tested against 2+ scripts first

#### 2.2 Header Validation
Before processing any sheet, verify required columns exist:
```javascript
const required = getRequiredColumns('workforce');
const missing = required.filter(col => !resolveColumn(headers, col));
if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`);
```
**Impact**: Fail fast with clear messages instead of silent data corruption

#### 2.3 Structured Error Handling
- Classify errors: `SKIP` (bad row), `RETRY` (transient DB), `FATAL` (schema mismatch)
- Log failing row number + data context
- Add retry with exponential backoff for DB operations
- Generate error summary report at end of ETL run

### Phase 3: DEFERRED (per review board recommendation)

> **Review board verdict**: Phase 3 adds architectural complexity for a local-run, manual-trigger ETL
> that does not yet benefit from it. Phase 1 + Phase 2 deliver all 5 success criteria.
> Revisit only if: (a) ETL scripts are scheduled in CI/CD, (b) unit tests are written for
> transform logic, or (c) multiple data sources share pipeline infrastructure.

#### 3.1 Pipeline Pattern (deferred)
`extract(source) -> validate(schema) -> transform(rules) -> load(target)`

#### 3.2 Schema-Driven Validation (deferred)

#### 3.3 Remove Presentation Logic from ETL
- **MOVED to Phase 1.4** — chart colors removal is zero-risk and should not wait

---

## Files Affected (verified counts, 2026-03-07)

| File | Lines | Key Issues |
|------|-------|------------|
| `scripts/etl/workforce-to-postgres.js` | 607 | Duplicated parseArgs, colors, school lookup, hardcoded categories |
| `scripts/etl/terminations-to-postgres.js` | 549 | Duplicated parseArgs, colors, school lookup, hardcoded reason codes |
| `scripts/etl/demographics-to-postgres.js` | 600 | Hardcoded Excel dates, duplicated parseArgs, colors, divergent BENEFIT_ELIGIBLE list |
| `scripts/etl/exit-surveys-to-postgres.js` | 330 | Column name fallback chains, no schema validation |
| `scripts/etl/turnover-metrics-to-postgres.js` | 1,000 | Sheet name assumptions, 14 upsert functions, duplicated patterns |
| `scripts/etl/recruiting-metrics-to-postgres.js` | 1,011 | Chart colors in ETL, 12 hardcoded sheet names, 11 upsert functions |
| `scripts/etl/mobility-to-postgres.js` | 363 | Duplicated school lookup, brittle grade parsing |
| `scripts/etl/turnover-rates-to-postgres.js` | 466 | **Previously missed** — same duplication patterns |
| `scripts/etl/state-residence-to-postgres.js` | 290 | **Previously missed** — same duplication patterns |
| **TOTAL** | **5,216** | |

**Existing utilities (good foundation to build on):**
- `scripts/utils/excel-helpers.js` (191 lines)
- `scripts/utils/fiscal-calendar.js` (250 lines)
- `scripts/utils/pii-removal.js` (336 lines)
- `scripts/utils/validation.js` (402 lines)
- `scripts/utils/neon-client.js` (241 lines)

---

## Success Criteria (updated per review board)

- [ ] Zero duplicated utility code across ETL scripts
- [ ] Business rules changes require only config file edits (no code changes)
- [ ] New Excel column names can be added via config, not code
- [ ] ETL fails fast with clear error messages on format mismatches
- [ ] Single-table scripts under 200 lines; multi-table orchestrators under 400 lines
- [ ] All 34 column mapping fields with 130+ aliases externalized
- [ ] EXCEL_DATE_MAP eliminated (algorithmic dates)
- [ ] Known bugs fixed: dead ternary, anonymous hash duplication, negative tenure

## Known Bugs to Fix During Refactor

| Bug | Location | Fix |
|-----|----------|-----|
| Dead ternary: `errored > 0 ? 'completed' : 'completed'` | workforce:584, terminations:527, demographics:575 | Use `'completed_with_errors'` |
| Anonymous hash duplication on re-runs | terminations, exit-surveys, mobility | Skip rows without employee ID |
| Negative tenure stored in DB | terminations:163-181 | Guard: if diffMs < 0, return null |
| Timezone inconsistency | demographics:435 | Use `formatDate()` not `toISOString()` |
| `'date'` alias collision | exit-surveys + mobility | Disambiguate in column-mappings.json |

## Review Board Verdict

**CONDITIONAL-GO** (2026-03-07) — See `docs/ETL_REVIEW_BOARD_VERDICT.md` for full details.
- Execute Phase 1 + Phase 2 with required modifications
- Phase 3 deferred indefinitely
- 12 required modifications incorporated into this plan

---

## Related

- Complements the `staticData.js → Neon API migration` (feature flag `REACT_APP_DATA_SOURCE` already exists)
- Neon paid plan now active — can leverage connection pooling and branching for ETL testing
- See also: `database/README.md` for current ETL commands
