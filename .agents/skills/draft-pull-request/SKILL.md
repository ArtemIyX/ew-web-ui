---
name: draft-pull-request
description: Draft a pull request title and body from the current Git branch's committed changes, compare them with a target branch, and save the result as Markdown.
---

# Draft Pull Request

Create a Markdown draft for a pull request that will be squash-merged. Write the result to a file; do not create or submit a remote pull request unless separately asked.

## Choose the comparison

1. Find the repository root, current branch, and worktree status. Use a target branch supplied by the user. Otherwise use the remote default branch when it is `main` or `stable`; if that is unavailable, use the only locally available `main` or `stable` branch. Ask when both are plausible or no target ref exists.
2. Compare the committed `HEAD` tree with the target branch tip using `git diff <target> HEAD`. Inspect the changed-file summary and relevant diff. This two-tip comparison defines what the squash merge would change. Do not use a merge-base or triple-dot diff as the PR scope: earlier squash merges can leave old commits in the branch history.
3. Read the subjects and full bodies of commits in `<target>..HEAD`. Use them to understand intent and rationale, but include a change in the draft only if it remains in the two-tip diff. If there is no net diff, do not write a misleading PR draft.
4. Draft from evidence in the commit descriptions and final diff. Summarize the overall result, not one bullet per commit. Do not invent motivation, validation, or risk claims. Ask for essential missing context when the rationale cannot be established.

Use the selected target ref consistently and tell the user which ref was compared. Uncommitted changes are outside the draft; mention them if present.

## Write the draft

Follow [the PR template](references/template.md) for the title and every section. Read [illustrative examples](references/examples.md) when the change type makes the wording unclear. Keep the title concise and outcome-focused; include the branch issue key when one exists.

Save as `PULL_REQUEST.md` in the project root by default. If the user gives a folder, save `PULL_REQUEST.md` there; if they give a Markdown file path, use that exact path. Inspect an existing destination before replacing it, and preserve an unrelated draft. Do not stage or commit the draft unless asked.

Report the saved path, compared branches, and any evidence gaps or validation that was not run.
