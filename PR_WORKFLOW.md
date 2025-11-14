# Pull Request Workflow

## Overview

This document defines the standard pull request process for the HR Reports JSON Data project. Following this workflow ensures high-quality code, prevents CI failures, and maintains consistency across the codebase.

---

## Branching Strategy

We use **GitHub Flow**:

- `main` is always deployable and production-ready
- Create feature branches from `main`
- Open PRs early (use draft mode for work-in-progress)
- Merge to `main` after all checks pass
- Delete branch after merge (automatic)

### Branch Naming Conventions

```
feature/description          # New features
feature/issue-123-description  # With issue number
fix/description              # Bug fixes
fix/issue-456-description    # With issue number
docs/description             # Documentation updates
refactor/description         # Code refactoring
chore/description            # Maintenance tasks
```

**Examples:**
- `feature/add-turnover-metrics`
- `feature/issue-45-employee-import`
- `fix/dashboard-loading-error`
- `docs/update-workflow-guide`
- `refactor/optimize-chart-rendering`

---

## Pull Request Process

### 1. Prepare Branch

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Develop & Commit Often

**Commit Message Format:**
```
<type>: <description>

[optional body]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring (no functional changes)
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements
- `style:` Code style/formatting changes
- `a11y:` Accessibility improvements

**Examples:**
```bash
git commit -m "feat: Add quarterly turnover metrics to dashboard"
git commit -m "fix: Resolve chart rendering issue on mobile devices"
git commit -m "docs: Update WORKFLOW_GUIDE with new data processes"
```

### 3. Keep Branch Current

**Before creating PR, sync with main:**
```bash
git fetch origin
git merge origin/main  # Or: git rebase origin/main
```

**Resolve any conflicts before proceeding.**

---

## Pre-PR Quality Checklist

### ⭐ CRITICAL: Run pr-prep Agent

**ALWAYS run pr-prep before creating ANY pull request:**

```
User: "Run pr-prep to verify I'm ready for a PR"
```

The pr-prep agent will check:
1. ✅ Branch status (up-to-date with main)
2. ✅ TypeScript compilation (if applicable)
3. ✅ ESLint (no errors)
4. ✅ Prettier formatting
5. ✅ Build success
6. ✅ No merge conflicts

**DO NOT CREATE PR until pr-prep gives ✅ ALL CHECKS PASSED**

### Manual Quality Checks

#### Code Quality
- [ ] Code follows project conventions (see [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md))
- [ ] No console.logs or debugging code left in
- [ ] Complex logic has inline comments
- [ ] Functions are properly documented
- [ ] No unused imports or variables

#### Testing
- [ ] All existing tests pass: `npm test`
- [ ] New features have tests (if applicable)
- [ ] Accessibility tests pass (WCAG 2.1 AA)
- [ ] Manual testing completed

#### Data & Business Logic
- [ ] Data validation passes: `npm run data:validate`
- [ ] HR metrics accuracy verified (if data changes)
- [ ] Excel imports work correctly (if data processing changed)
- [ ] Dashboard calculations verified

#### Documentation
- [ ] PROJECT_STATUS.md updated with progress
- [ ] CLAUDE.md updated (if architecture changed)
- [ ] Inline code comments for complex logic
- [ ] README.md updated (if user-facing changes)

#### Security & Compliance
- [ ] No PII or sensitive data committed
- [ ] No .env files or secrets committed
- [ ] WCAG 2.1 AA accessibility maintained
- [ ] Creighton University branding preserved

---

## Creating the Pull Request

### 1. Push Branch to Remote

```bash
git push -u origin feature/your-feature-name
```

### 2. Create PR (After pr-prep passes ✅)

**Option A: Using gh CLI (Recommended)**
```bash
gh pr create --title "feat: Your feature description" --body "Detailed description"
```

**Option B: Via GitHub Web UI**
- Navigate to repository
- Click "Compare & pull request"
- Fill in PR template

### 3. PR Title & Description

**Title Format:**
```
<type>: <concise description>
```

**Description Template:**
```markdown
## Summary
[Brief description of changes - 2-3 sentences]

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Manual testing completed
- [ ] All tests pass
- [ ] Accessibility verified
- [ ] Data validation passed

## Screenshots (if UI changes)
[Add screenshots or GIFs]

## Related Issues
Closes #123
Related to #456

## Checklist
- [x] pr-prep agent passed all checks
- [x] Branch up-to-date with main
- [x] PROJECT_STATUS.md updated
- [x] No PII or sensitive data committed
```

---

## PR Review Process

### What Reviewers Look For

1. **Code Quality**
   - Follows project conventions
   - Readable and maintainable
   - Properly documented

2. **Functionality**
   - Meets requirements
   - No regressions introduced
   - Edge cases handled

3. **Testing**
   - Adequate test coverage
   - Tests are meaningful
   - All tests pass

4. **Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support

5. **Performance**
   - No unnecessary re-renders
   - Optimized data processing
   - Bundle size impact minimal

### Addressing Review Feedback

1. Make requested changes
2. Commit changes with descriptive messages
3. Push to same branch (PR updates automatically)
4. Re-run pr-prep if code changes made
5. Respond to reviewer comments
6. Request re-review when ready

---

## Merging Pull Requests

### Requirements for Merge

- ✅ pr-prep checks passed
- ✅ All CI/CD checks green
- ✅ At least one approval (if team review required)
- ✅ No merge conflicts with main
- ✅ All review comments addressed

### Merge Strategy

**Use Squash Merge (Default):**
- Keeps main branch history clean
- Combines all commits into one
- Preserves original commits in PR

```bash
# Via gh CLI (with auto-merge)
gh pr merge <number> --squash --auto

# Or wait for checks and merge manually via GitHub UI
```

### After Merge

1. ✅ Branch automatically deleted
2. ✅ Update PROJECT_STATUS.md to mark feature complete
3. ✅ Close related issues
4. ✅ Pull latest main: `git checkout main && git pull`

---

## Common PR Pitfalls (And How to Avoid Them)

### ❌ Pitfall #1: Stale Branch
**Problem:** PR created from outdated branch → merge conflicts

**Solution:**
```bash
git fetch origin
git merge origin/main  # Before creating PR
```

### ❌ Pitfall #2: Formatting Issues
**Problem:** Prettier not run → CI fails

**Solution:** Use pr-prep agent (checks formatting automatically)

### ❌ Pitfall #3: Uncommitted Changes
**Problem:** Working directory dirty when creating PR

**Solution:**
```bash
git status  # Check for uncommitted files
git add .
git commit -m "Description"
```

### ❌ Pitfall #4: Large PRs
**Problem:** PR with 1000+ lines → hard to review

**Solution:** Break into smaller, focused PRs (< 400 lines preferred)

### ❌ Pitfall #5: Missing Context
**Problem:** PR description says "Fixed bug"

**Solution:** Provide detailed description with:
- What was broken
- Root cause
- How it was fixed
- How to verify the fix

---

## PR Size Guidelines

### Ideal PR Sizes

- **Tiny** (1-50 lines): Documentation, config changes
- **Small** (51-200 lines): Bug fixes, small features
- **Medium** (201-400 lines): Standard features
- **Large** (401-800 lines): Complex features (try to split if possible)
- **Huge** (800+ lines): Avoid if possible, split into multiple PRs

### When Large PRs Are Acceptable

- Major refactoring (but document extensively)
- Data migrations (with rollback plan)
- Generated code (e.g., API clients)
- Framework upgrades

---

## Emergency Hotfix Process

For critical production bugs:

1. Create hotfix branch from main
   ```bash
   git checkout main
   git pull
   git checkout -b fix/critical-bug-description
   ```

2. Fix the bug (minimal changes only)

3. Run pr-prep agent (no shortcuts!)

4. Create PR with `[HOTFIX]` prefix
   ```
   [HOTFIX] fix: Resolve data validation crash
   ```

5. Request immediate review

6. Merge ASAP after approval

7. Monitor production after deployment

---

## PR Command Reference

### Common Commands

```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# Keep branch current
git fetch origin
git merge origin/main

# Push branch
git push -u origin feature/my-feature

# Create PR (after pr-prep ✅)
gh pr create --title "feat: Description" --body "Details"

# Check PR status
gh pr status

# View PR in browser
gh pr view --web

# Merge PR (squash)
gh pr merge <number> --squash --auto

# Delete local branch after merge
git checkout main
git pull
git branch -d feature/my-feature
```

---

## Troubleshooting PR Issues

### Issue: pr-prep Fails on TypeScript
**Solution:**
```bash
npm run typecheck  # See errors
# Fix errors in listed files
npm run typecheck  # Verify fixed
```

### Issue: pr-prep Fails on Formatting
**Solution:**
```bash
npm run format  # Auto-format all files
git add .
git commit -m "chore: Auto-format code"
```

### Issue: pr-prep Fails on ESLint
**Solution:**
```bash
npm run lint  # See errors
npm run lint --fix  # Auto-fix what's possible
# Manually fix remaining issues
```

### Issue: Merge Conflicts with Main
**Solution:**
```bash
git fetch origin
git merge origin/main
# Resolve conflicts in editor
git add .
git commit -m "chore: Resolve merge conflicts"
```

### Issue: CI Fails After PR Created
**Solution:**
1. Check CI logs for specific error
2. Fix issue locally
3. Run pr-prep again to verify
4. Push fix to same branch
5. CI will re-run automatically

---

## Best Practices

### Do's ✅

- ✅ Run pr-prep before EVERY PR
- ✅ Create PRs early (use draft mode)
- ✅ Write descriptive commit messages
- ✅ Keep PRs focused and small
- ✅ Update PROJECT_STATUS.md
- ✅ Add screenshots for UI changes
- ✅ Test manually before requesting review
- ✅ Respond promptly to review feedback
- ✅ Keep branch up-to-date with main

### Don'ts ❌

- ❌ Create PR without running pr-prep
- ❌ Commit sensitive data or PII
- ❌ Leave console.logs or debugging code
- ❌ Ignore ESLint or accessibility warnings
- ❌ Merge without approval (if required)
- ❌ Force push to main
- ❌ Skip documentation updates
- ❌ Create massive PRs (800+ lines)

---

## Success Metrics

Your PR process is successful when:

- ✅ PRs pass CI on first try (thanks to pr-prep)
- ✅ Reviews are quick (<24 hours)
- ✅ Merge conflicts are rare
- ✅ Code quality is consistently high
- ✅ Documentation stays current
- ✅ No production bugs from merged PRs

---

## Questions?

- Check [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) for development procedures
- Review [CLAUDE.md](CLAUDE.md) for project architecture
- See [ERROR_LOG.md](ERROR_LOG.md) for common issues
- Ask in team chat or during standup

---

*Last Updated: November 2024*
*Version: 1.0*

**Remember: ALWAYS use pr-prep agent before creating PRs!**
