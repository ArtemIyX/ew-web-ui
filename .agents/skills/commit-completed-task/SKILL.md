---
name: commit-completed-task
description: Inspect, stage, and create a clean Git commit automatically after a completed ScpRiftborn implementation, documentation, configuration, test, or skill-authoring task. Use after changes and validation are complete, including small focused changes. Do not use for read-only requests, unfinished work, diagnostics without edits, or when the user explicitly says not to commit.
---

# Commit Completed Task

Create one clean commit when the assigned task is complete and has intended changes. Do not ask for a separate commit instruction unless authority is unclear or the task includes unrelated changes.

## Workflow

1. Read `AGENTS.MD`, current branch, status, staged diff, unstaged diff, and recent history.
2. Separate current-task files and hunks from pre-existing or unrelated work.
3. Run proportionate validation. Do not compile this project.
4. Stage only completed task changes. Do not force-add ignored files without explicit instruction.
5. Review the staged diff. Confirm it contains no secrets, generated files, unrelated formatting, temporary files, or incomplete code.
6. Commit the staged task with a message following `references/message-policy.md`.
7. Report the commit hash, subject, files, and validation.

## Commit boundaries

- Commit a small coherent change alone. Examples: one bug fix, one asset rule, one editor control, one documentation correction, one test adjustment, or one completed skill.
- Split changes when they have independent purpose, risk, review path, or rollback needs.
- Keep implementation and its required tests or documentation in the same commit.
- Do not mix refactoring with behavior changes unless the refactor is strictly required for that behavior.
- Do not commit broken, partial, experimental, or unvalidated work as a completed task.

## Safety

- Preserve unrelated user changes. Never stage, commit, discard, reset, stash, amend, rebase, force-push, or rewrite them without explicit authorization.
- Never include secrets or credentials.
- Do not push unless requested.
- If no intended files changed, do not create an empty commit.
- If unrelated changes cannot be separated safely, stop before staging and report the blocker.