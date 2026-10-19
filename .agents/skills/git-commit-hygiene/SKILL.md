---
name: git-commit-hygiene
description: Review Git changes and create scoped commits with a branch-derived subject and a required rationale. Use for Git inspection, staging, commits, history, branches, merges, reverts, and cleanup.
---

# Git Commit Hygiene

Use this workflow to keep Git actions scoped and commit messages useful for pull requests.

## Inspect first

1. Read repository guidance (`AGENTS.md`, `CONTRIBUTING.md`, commit history) when present.
2. Check the current branch, worktree status, and both staged and unstaged diffs.
3. Separate the requested changes from unrelated pre-existing changes. Never alter, stage, discard, or commit unrelated work.

## Commit workflow

Only create a commit when the user asks to commit or clearly authorizes it.

1. Stage only the files and hunks belonging to the requested change.
2. Review the staged diff and run relevant, proportionate validation when feasible.
3. Write the subject as `Prefix Verb What`:
   - Derive `Prefix` from the current branch. Use the leading issue key through its number, dropping any descriptive suffix: `UI-1` → `UI-1`; `UI-123-settings` → `UI-123`. If there is no issue key, use the branch name; clarify if the intended prefix is ambiguous.
   - Start `Verb` with a present-simple action such as `Add`, `Remove`, `Rename`, `Move`, `Update`, `Fix`, or `Tune`.
   - Make `What` short and specific. Keep the full subject concise, ideally within 72 characters.
4. Always add a body explaining **why** the change is needed, with concrete context useful for a pull request. Include the problem or goal and relevant impact or tradeoff. Do not invent a rationale.
5. Report the commit hash, subject, affected files, and validation result.

Read [message examples](references/message-examples.md) when drafting a commit message or resolving a branch-prefix edge case.

## Safety

- Do not commit secrets, generated artifacts, lockfile churn, or unrelated formatting changes without explicit authorization.
- Do not rewrite published history, force-push, discard changes, or use destructive Git commands unless the user explicitly requests it.
- For a request that only asks to inspect, explain, or draft a message, make no repository changes.
