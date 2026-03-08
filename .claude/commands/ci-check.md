---
allowed-tools: Bash(npm *), Bash(CI=true npm test *), Bash(git *), Bash(ls *), Read, Grep
description: Simulate CI pipeline locally to catch issues before pushing
---

# CI Check - Local CI Simulation

Simulates the GitHub Actions CI pipeline locally. Run all steps sequentially.

## Step 1: Check Git Status

```bash
git status --short
git log --oneline -3
```

## Step 2: Build Verification

```bash
npm run build
```

**BLOCKING**: Must succeed.

## Step 3: Full Test Suite

```bash
CI=true npm test -- --coverage --watchAll=false --forceExit
```

**BLOCKING**: All tests must pass. Ignore known DemographicsQ1FY26Dashboard.test.js failures.

## Step 4: Security Audit

```bash
npm audit --audit-level=high
```

**WARNING only**: Flag high/critical vulnerabilities.

## Step 5: Quick Lint Check

Use Grep to scan `src/` for:
- `console.log` debugging statements (ignore test files)
- Unresolved merge conflicts (`<<<<<<<` or `>>>>>>>`)

Flag any found as warnings.

## Output

| Check | Status |
|-------|--------|
| Build | PASS/FAIL |
| Tests | PASS/FAIL (coverage %) |
| Security | PASS/WARN |
| Lint | PASS/WARN |

Then: **CI CHECK PASSED** or **CI CHECK FAILED** with specific items.
