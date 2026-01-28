---
allowed-tools: Bash(git *), Bash(npm run build), Bash(npm test *), Read
description: Run quality checks before committing changes
---

# Pre-commit Quality Check

Run these checks before committing staged changes.

## Step 1: Stage and Review Changes

```bash
git add .
git diff --cached --stat
git diff --cached
```

## Step 2: Build Verification

```bash
npm run build
```

**BLOCKING**: Build must succeed before committing.

## Step 3: Unit Tests

```bash
npm test -- --watchAll=false
```

**BLOCKING**: All tests must pass (ignore pre-existing failures in DemographicsQ1FY26Dashboard.test.js).

## Step 4: Pattern Checks (CLAUDE.md Compliance)

Review staged changes for:

- [ ] Functional components only (no class components)
- [ ] Files in correct directories (components/, data/, hooks/, services/)
- [ ] Error handling present for async operations
- [ ] Defensive checks for undefined/null data
- [ ] No PII or sensitive employee data
- [ ] WCAG 2.1 AA accessibility considered (aria-labels, semantic HTML)

## Step 5: Security Check

- [ ] No `.env` or credentials in staged files
- [ ] No console.log with sensitive data
- [ ] No hardcoded API keys or tokens

## Step 6: Data Consistency (if data files changed)

If files in `src/data/` were modified:
- [ ] Run `npm run data:validate` if applicable
- [ ] Verify data totals match expected values (FY25: 222 exits)

## Output Format

**READY TO COMMIT** - All checks passed

or

**ISSUES TO ADDRESS**:

1. [file:line] - Description of issue
2. ...

Keep feedback actionable and specific.
