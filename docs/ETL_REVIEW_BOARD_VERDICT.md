# ETL Review Board Verdict

**Date:** 2026-03-07
**Verdict: CONDITIONAL-GO**

Execute Phase 1 + Phase 2 with the required modifications below. Defer Phase 3 indefinitely.

---

## Review Board

| Reviewer | Role | Verdict |
|----------|------|---------|
| Technical Architect | Architecture, phasing, abstractions | Conditional GO (adjust targets, defer Phase 3) |
| Data Analytics Engineer | HR domain correctness, edge cases | Conditional GO (protect complex logic from config-ification) |
| Code Reviewer | Duplication audit, module boundaries | GO (duplication confirmed, 2 missing scripts found) |
| ETL Config Reviewer | Config completeness, coverage gaps | Conditional GO (config covers only 13% of values, needs expansion) |

---

## Required Plan Modifications (Must-Do Before Implementation)

### M1. Expand scope to 9 scripts (not 7)

The audit found 2 additional ETL scripts not in the plan:
- `turnover-rates-to-postgres.js` (466 lines)
- `state-residence-to-postgres.js` (290 lines)

**Total: 9 scripts, 5,216 lines** (not 7 scripts, ~4,500 lines).

### M2. Differentiate line-count targets

The blanket "each script under 200 lines" target is unrealistic for multi-table orchestrators.

| Script Type | Target |
|-------------|--------|
| Single-table scripts (mobility, exit-surveys, state-residence) | <=200 lines |
| Multi-field scripts (workforce, terminations, demographics) | <=250 lines |
| Multi-table orchestrators (recruiting-metrics, turnover-metrics, turnover-rates) | <=400 lines |

### M3. Correct the upsert count

Actual INSERT...ON CONFLICT count is **32x** across 9 scripts (not 50+). The plan overstated this. Update the issue doc.

### M4. Correct the turnover-metrics line count

Plan says ~500 lines; actual is **1,000 lines**. This affects effort estimates for Phase 2.

### M5. Protect complex logic from config externalization

Three functions must stay in code — they are NOT representable as declarative config:

1. **`categorizeEmployee()`** — 5-level cascading priority with Grade R synthetic code, person type resolution
2. **`categorizeTerminationType()`** — keyword priority ordering, default-to-voluntary fallback
3. **`normalizeScore()`** — implicit range detection (1-5 vs 0-100)

Add explicit note to the plan: "These functions are out of scope for config externalization."

### M6. Expand etl-config.json from 13% to full coverage

The plan's config example covers only ~12 of 95+ externalizable values. The implementation must include:
- **All 34 column mapping fields** with 130+ aliases (plan showed 3)
- **Tenure buckets** with boundaries and labels
- **Mobility action keywords** (5 entries)
- **All expected sheet lists** (15 turnover + 12 recruiting = 27)
- **Deviation defaults** (staff 13.6%, faculty 6.3%)
- **Explicit defaults section** (location, employee_type, termination_type, reason_code, ethnicity)
- **Validation thresholds** scoped by fiscal period (separate from business rules)

### M7. Split config into 2-3 files

Per architect recommendation:
- `etl-config.json` — business rules, categories, keywords, defaults
- `column-mappings.json` — all 34 fields with aliases
- `etl-validation.json` — per-period expected counts (fiscally scoped, separate lifecycle)

### M8. Eliminate EXCEL_DATE_MAP (don't just externalize it)

The demographics script's `EXCEL_DATE_MAP` should be replaced with algorithmic date comparison using the existing `excelDateToJSDate()` helper. Maintaining a manual lookup table per quarter is the #1 maintenance burden and a correctness risk (missing entries silently load wrong data).

### M9. Fix the alias collision bug

`'date'` is used as an alias for both `survey_date` (exit-surveys) and `effective_date` (mobility). The column-resolver must detect and reject duplicate aliases across fields within the same script context. Config validation should catch this.

### M10. Add `columnMap` parameter to generic upsert

The architect identified that `upsertPipelineStaff` maps `row.apps_per_req` to column `apps_per_requisition`. The generic `upsert()` signature must support explicit column aliasing:

```javascript
async function upsert(table, data, conflictKeys, options = {})
// options.columnMap: { 'apps_per_req': 'apps_per_requisition' }
```

### M11. Canonicalize BENEFIT_ELIGIBLE_CATEGORIES

Two divergent definitions exist (workforce vs demographics) with different element ordering. The config must have ONE canonical definition. Additionally, clarify that HSP/HSR are benefit-eligible (isBenefitEligible: true) despite being in a separate category — the plan's example config grouped them under "special" which would break demographics filtering.

### M12. Change missing Excel date from WARNING to FATAL

Demographics currently logs a warning when the date isn't in EXCEL_DATE_MAP but proceeds to load ALL employees — silently producing incorrect demographic counts. After M8 (algorithmic dates) this is moot, but until then it must be FATAL.

---

## Recommended Bug Fixes (Do During Refactor)

| Bug | Location | Fix |
|-----|----------|-----|
| Dead ternary: `errored > 0 ? 'completed' : 'completed'` | workforce:584, terminations:527, demographics:575 | Change to `'completed_with_errors' : 'completed'` |
| Anonymous hash duplication on re-runs | terminations, exit-surveys, mobility | Skip rows without employee ID with warning counter |
| Negative tenure stored in DB | terminations:163-181 | Guard: if diffMs < 0, return null |
| Timezone inconsistency in date parsing | demographics:435 | Use `formatDate()` instead of `toISOString().split('T')[0]` |
| isCrossSchool false when school names unrecognized | mobility:181 | Log warning for unmatched schools |

---

## Risk Matrix (Unified)

| Risk | Likelihood | Impact | Phase | Mitigation |
|------|-----------|--------|-------|------------|
| Generic upsert breaks asymmetric column mappings | High | High | 2 | Require columnMap param; test against pipeline_staff first |
| categorizeEmployee() incorrectly config-ified | Medium | Critical | 1 | Explicit exclusion in plan; code review gate |
| Column-resolver ships incomplete, Phase 2 stalls | Medium | High | 1->2 | Phase gate: tested against 2+ scripts |
| Config covers only subset of hardcoded values | High | Medium | 1 | Use config-reviewer's full inventory as checklist |
| BENEFIT_ELIGIBLE inconsistency between scripts | High | High | 1 | Canonicalize immediately in config |
| Validation thresholds go stale | Medium | Medium | 1 | Separate file, fiscally scoped |
| 2 missed scripts not refactored | High | Low | 1 | Add to scope now |
| EXCEL_DATE_MAP missing future quarter | Certain | High | 1 | Eliminate map, use algorithmic dates |
| Anonymous hash duplication on re-runs | Medium | Medium | 1 | Fix during utility extraction |

---

## Phase Gate Criteria

### Phase 1 -> Phase 2 Gate
- [ ] All utility modules extracted and used by >=2 scripts each
- [ ] `column-resolver.js` integration-tested against terminations + workforce (byte-identical output)
- [ ] `etl-config.json` contains all 70+ externalizable business rules (per config-reviewer inventory)
- [ ] `column-mappings.json` contains all 34 fields with 130+ aliases
- [ ] BENEFIT_ELIGIBLE_CATEGORIES canonicalized to single definition
- [ ] EXCEL_DATE_MAP eliminated (algorithmic comparison)
- [ ] All 9 scripts run successfully with `--dry-run`
- [ ] Dead ternary bug fixed in 3 scripts
- [ ] Complex logic functions explicitly excluded from config (documented)

### Phase 2 -> Done Gate (Phase 3 Deferred)
- [ ] Generic `upsert()` tested across all 9 scripts with `--dry-run`
- [ ] Header validation active with `--validate-only` flag
- [ ] Error classification (SKIP/RETRY/FATAL) implemented and documented
- [ ] Retry logic scoped to transient DB errors only
- [ ] Audit log entries verified accurate after full run
- [ ] All known bugs from review fixed

### Phase 3 Prerequisites (If Ever)
- [ ] At least one unit test exists for a transform function
- [ ] At least one ETL script is scheduled in CI/CD
- [ ] Team decision to invest in pipeline abstraction

---

## Consensus Points (All 4 Reviewers Agree)

1. Phase 1 is low risk — pure extraction of duplicated code
2. Phase 2 is medium risk — generic SQL generation needs careful contract design
3. Phase 3 should be deferred — over-engineering for a local-run, manual-trigger ETL
4. Chart colors must move to frontend, not ETL config
5. PII handling is safe as long as hashing step isn't moved/deferred
6. Fiscal calendar logic in `fiscal-calendar.js` is correct and doesn't need changes
7. The `loadSchoolLookup()` + `findSchoolId()` extraction is clean and well-scoped

## Conflicting Recommendations (Resolved)

| Topic | Architect | Domain Expert | Resolution |
|-------|-----------|---------------|------------|
| categorizeEmployee() in config? | "Keep priority chain in code" | "RISKY — must NOT be config-driven" | **Keep in code** (both agree) |
| Validation thresholds location | "Separate file or code constants" | "Document and make explicit" | **Separate etl-validation.json, fiscally scoped** |
| Chart color removal timing | "Move to Phase 1" | Not addressed | **Phase 1 item 1.4** |
| EXCEL_DATE_MAP | Not addressed | "FATAL on missing entries" | **Eliminate entirely per config-reviewer** (supersedes) |
