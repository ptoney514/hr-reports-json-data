---
allowed-tools: Bash(git *), Bash(gh *), Bash(npm run build), Bash(CI=true npm test *), Bash(npm audit *), Read, Edit, Grep
argument-hint: [optional: commit message or PR title]
description: Commit, push, and create a PR after pre-commit checks pass
---

# Commit, Push, Create PR, Verify CI, and Merge

Fully automated workflow — no confirmation prompts. Stops only on blocking failures.

## Phase 1: Gather Context

Run these in parallel:

```bash
git branch --show-current
```
```bash
git fetch origin main --quiet 2>/dev/null; git rev-list --count HEAD..origin/main 2>/dev/null || echo "0"
```
```bash
git status --short
```
```bash
git log origin/main..HEAD --oneline 2>/dev/null || git log -3 --oneline
```

**If branch is behind main**: STOP and warn — user may need to rebase first.

## Phase 2: Stage and Verify

1. If nothing is staged, stage all modified/untracked files with `git add -A`
2. Run `git diff --cached --stat` to show what will be committed
3. Run `npm run build` — **BLOCKING** on failure
4. Run `CI=true npm test -- --watchAll=false --forceExit` — **BLOCKING** on failure (ignore known DemographicsQ1FY26Dashboard.test.js failures)
5. Run `npm audit --audit-level=high` — **WARNING only**, do not block

## Phase 3: Commit and Push

1. Write a conventional commit message from the diff:
   - Format: `type: description` (feat/fix/docs/refactor/test/chore)
   - Subject under 72 chars, add body for complex changes
   - If `$ARGUMENTS` is provided, use it as the commit message
2. Commit immediately (no confirmation) with co-author attribution
3. Push to origin with `-u` flag

## Phase 4: Create PR

Create PR targeting `main` immediately (no confirmation):
- Title matches commit subject line
- Body includes Summary bullets, Test plan checklist, and Claude Code footer
- Use HEREDOC for body formatting

## Phase 5: Monitor CI and Fix Issues

1. Wait 15 seconds, then check CI status: `gh run list --branch <branch> --limit 1`
2. If CI is still running, check again with `gh run watch` (timeout 5 minutes)
3. If CI fails:
   - Get failure details: `gh run view <run-id> --log-failed`
   - Fix the issues (lint, build, test failures) using Edit/Read tools
   - Commit the fix, push, and loop back to check CI again
   - Max 3 fix attempts before stopping
4. If CI passes, proceed to merge

## Phase 6: Merge to Main

1. Run `gh pr merge <pr-number> --squash --delete-branch`
2. Confirm merge succeeded with `gh pr view <pr-number> --json state`
3. Output the merged PR URL

## Output Format

At completion, output a single summary:

| Phase | Status |
|-------|--------|
| Build | PASS/FAIL |
| Tests | PASS/FAIL |
| Push | DONE |
| PR | #N url |
| CI | PASS/FAIL |
| Merge | DONE/SKIPPED |

$ARGUMENTS
