---
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git status:*)
argument-hint: [commit message]
description: Commit all changes and push to remote
---

Commit all changes on the current branch and push to the remote repository.

Steps:
1. Run `git status` to see what will be committed
2. Add all changes with `git add .`
3. Create a commit with the message: "$ARGUMENTS"
   - If no message provided, use a descriptive default message
   - Follow the commit message format with Claude Code attribution
4. Push to the remote repository using `git push`
5. Confirm the push was successful

Make sure to include the Claude Code attribution in the commit message as per the project standards.