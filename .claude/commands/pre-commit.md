---
allowed-tools: Bash(git *), Bash(CI=true npm test *), Bash(npm run build), Bash(npm audit *), Read, Grep
description: Run quality checks before committing changes
---

# Pre-commit Quality Check

Run these checks sequentially. Stop at the first BLOCKING failure.

## Step 1: Review staged changes

Run `git diff --cached --stat` to see what's staged. If nothing is staged, run `git status` and tell the user to stage files first — do NOT run `git add .`.

## Step 2: Build verification

Run `npm run build`. **BLOCKING** — must succeed.

## Step 3: Unit tests

Run `CI=true npm test -- --watchAll=false --forceExit`. **BLOCKING** — all tests must pass. Ignore known failures in DemographicsQ1FY26Dashboard.test.js.

## Step 4: Security quick check

Run `npm audit --audit-level=high`. **WARNING only** — flag high/critical vulnerabilities but do not block.

Also use Grep to check staged files for `.env`, credentials, API keys, or console.log with sensitive data. Flag any found.

## Step 5: Report results

Output a summary table:

| Check | Status |
|-------|--------|
| Build | PASS/FAIL |
| Tests | PASS/FAIL |
| Security audit | PASS/WARN |
| Secrets scan | PASS/WARN |

Then output **READY TO COMMIT** or **ISSUES TO ADDRESS** with specific items.
