---
allowed-tools: Bash(npm *), Bash(git *), Read
description: Simulate CI pipeline locally to catch issues before pushing
---

# CI Check - Local CI Simulation

Simulates the GitHub Actions CI pipeline locally to catch issues before pushing.

## Step 1: Check Git Status

```bash
git status
git log --oneline -3
```

Review what will be pushed.

## Step 2: Clean Install (Matches CI's npm ci)

```bash
rm -rf node_modules
npm ci
```

**BLOCKING**: This must succeed. CI uses `npm ci` which is stricter than `npm install`.

## Step 3: Build Verification

```bash
npm run build
```

**BLOCKING**: Build must complete without errors.

## Step 4: Full Test Suite with Coverage

```bash
npm test -- --coverage --watchAll=false
```

**BLOCKING**: All tests must pass. Coverage collection also validates syntax.

## Step 5: Security Audit

```bash
npm audit --audit-level=high
```

**WARNING**: Flag high/critical vulnerabilities. Note: Trivy scan in CI may find additional issues.

## Step 6: Validate Workflow Files Exist

```bash
ls -la .github/workflows/
```

Verify CI/CD workflow files are present and properly named.

## Step 7: Check for Common CI Issues

Review for:
- [ ] No `console.log` debugging statements left in code
- [ ] All imports resolve correctly
- [ ] No TypeScript/ESLint errors that would fail in CI
- [ ] Package-lock.json is up to date with package.json

## Output Format

**CI CHECK PASSED** ✅ - Ready to push

or

**CI CHECK FAILED** ❌:
1. [Step N] - Description of failure
2. ...

## Comparison: /ci-check vs /pre-commit

| Aspect | /pre-commit | /ci-check |
|--------|-------------|-----------|
| Speed | Fast (~30s) | Slower (~2-5min) |
| Fidelity | Good | Matches CI closely |
| When to use | Before every commit | Before pushing/PR |
| npm install | Uses existing | Fresh `npm ci` |
| Coverage | Optional | Always runs |

## Note: CI-Only Checks

These cannot be simulated locally:
- Trivy vulnerability scanner (SARIF upload)
- Accessibility audit with axe-core CLI (requires headless browser)
- Lighthouse performance audit
- GitHub Actions permissions

If CI fails on these after /ci-check passes, it's likely a workflow config issue.
