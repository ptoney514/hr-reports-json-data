# GitHub Issue: ETL Pipeline Refactoring

> **Instructions**: Create this as a GitHub issue using the gh CLI or GitHub web UI.
> **Title**: `ETL Pipeline Refactoring: Reduce Complexity & Improve Maintainability`
> **Labels**: `technical-debt`, `enhancement`, `p1`

---

## Problem Statement

The current ETL pipeline (`scripts/etl/`) is tightly coupled to specific Excel formats with hardcoded business logic spread across 7 scripts. It works today but won't scale well if business rules change — a column rename, new location, or updated categorization rule requires editing code in multiple files.

**Key metrics:**
- ~40% code duplication across 7 ETL scripts
- 50+ inline SQL upsert patterns repeated
- Business rules hardcoded in code, not config
- No header/schema validation before processing

---

## Assessment: Current Pain Points

### 1. Massive Code Duplication (~40%)
- `parseArgs()` copied identically across all 7 scripts (~700 lines total)
- ANSI color definitions repeated 7x
- School lookup function duplicated 3x (`workforce`, `terminations`, `mobility`)
- Same upsert pattern (INSERT...ON CONFLICT...RETURNING) repeated **50+ times**
- Excel workbook loading/sheet detection duplicated 5x

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
- [ ] `scripts/utils/cli-parser.js` — shared argument parsing (eliminate 7x duplication)
- [ ] `scripts/utils/formatting.js` — ANSI colors, console helpers (eliminate 7x duplication)
- [ ] `scripts/utils/school-lookup.js` — `loadSchoolLookup()` + `findSchoolId()` (eliminate 3x duplication)
- [ ] `scripts/utils/workbook-loader.js` — Excel loading + auto sheet detection (eliminate 5x duplication)

**Estimated reduction**: ~700-1000 lines of duplicated code

#### 1.2 Create `etl-config.json`
Centralize business rules so HR changes don't require code edits:
```json
{
  "categories": {
    "benefit_eligible": ["F12", "F11", "F10", "F09", "PT12", "PT11", "PT10", "PT9"],
    "student": ["SUE", "CWS"],
    "special": ["HSR"],
    "temp": ["TEMP", "NBE", "PRN"]
  },
  "locations": {
    "phoenix": ["phoenix"],
    "omaha": ["default"]
  },
  "termination_reasons": { "..." : "..." },
  "ethnicity_normalization": { "..." : "..." }
}
```

#### 1.3 Add Column Mapping Config
Replace inline fallback chains with a declarative mapping:
```json
{
  "assignment_category": ["Assignment Category Code", "Assignment Category", "assignment_category"],
  "hire_date": ["Hire Date", "hire_date", "hireDate"],
  "employee_id": ["Employee ID", "Empl ID", "Empl Num"]
}
```
With a resolver utility: `resolveColumn(row, 'assignment_category')`

### Phase 2: Medium-term Improvements

#### 2.1 Generic Upsert Helper
Add to `neon-client.js`:
```javascript
async function upsert(table, data, conflictKeys, options = {}) {
  // Build INSERT...ON CONFLICT dynamically
  // Support different conflict resolution strategies
  // Return { inserted, updated, errored } counts
}
```
**Impact**: Replace 50+ inline SQL templates with ~50 one-liners

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

### Phase 3: Longer-term (if ETL grows)

#### 3.1 Pipeline Pattern
Refactor each ETL as composable steps:
```
extract(source) → validate(schema) → transform(rules) → load(target)
```
Each step is a pure function, testable independently.

#### 3.2 Schema-Driven Validation
Define expected field types/constraints per ETL:
```json
{
  "workforce": {
    "fields": {
      "headcount": { "type": "integer", "min": 0 },
      "location": { "type": "enum", "values": ["omaha", "phoenix"] },
      "period_date": { "type": "date", "format": "YYYY-MM-DD" }
    }
  }
}
```
Validate every row before insert.

#### 3.3 Remove Presentation Logic from ETL
- Move chart colors out of `recruiting-metrics-to-postgres.js` into frontend config
- ETL should only handle data, not UI concerns

---

## Files Affected

| File | Lines | Key Issues |
|------|-------|------------|
| `scripts/etl/workforce-to-postgres.js` | ~600 | Duplicated parseArgs, colors, school lookup, hardcoded categories |
| `scripts/etl/terminations-to-postgres.js` | ~550 | Duplicated parseArgs, colors, school lookup, hardcoded reason codes |
| `scripts/etl/demographics-to-postgres.js` | ~580 | Hardcoded Excel dates, duplicated parseArgs, colors |
| `scripts/etl/exit-surveys-to-postgres.js` | ~400 | Column name fallback chains, no schema validation |
| `scripts/etl/turnover-metrics-to-postgres.js` | ~500 | Sheet name assumptions, duplicated patterns |
| `scripts/etl/recruiting-metrics-to-postgres.js` | ~900 | Chart colors in ETL, 12 hardcoded sheet names |
| `scripts/etl/mobility-to-postgres.js` | ~350 | Duplicated school lookup, brittle grade parsing |

**Existing utilities (good foundation to build on):**
- `scripts/utils/excel-helpers.js` (191 lines)
- `scripts/utils/fiscal-calendar.js` (250 lines)
- `scripts/utils/pii-removal.js` (336 lines)
- `scripts/utils/validation.js` (402 lines)
- `scripts/utils/neon-client.js` (241 lines)

---

## Success Criteria

- [ ] Zero duplicated utility code across ETL scripts
- [ ] Business rules changes require only config file edits (no code changes)
- [ ] New Excel column names can be added via config, not code
- [ ] ETL fails fast with clear error messages on format mismatches
- [ ] Each ETL script is under 200 lines (down from 350-900)

---

## Related

- Complements the `staticData.js → Neon API migration` (feature flag `REACT_APP_DATA_SOURCE` already exists)
- Neon paid plan now active — can leverage connection pooling and branching for ETL testing
- See also: `database/README.md` for current ETL commands
