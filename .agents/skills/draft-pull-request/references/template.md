# Pull request template

Use this exact section order in every generated draft. Replace the guidance with facts from the branch comparison and commit descriptions. The title is included in the file for copying into a pull request.

`# <Concise PR title>`

`## Summary`
One or two sentences describing the net result of merging this branch into the target.

`## Why`
The concrete problem or goal and why the change is needed.

`## Changes`
A short list of the important behavior, UI, documentation, or configuration changes visible in the final diff. Group related commits rather than listing every commit.

`## Validation`
Commands and checks actually run, with results. If none were run, say so and give the reason. Do not convert planned checks into completed checks.

`## Risks and review notes`
Relevant compatibility, migration, rollout, or review details supported by the diff. When none are identified, say `No specific risks or review steps identified.`

Keep all five headings, even when a section has a brief answer. Do not paste this guidance or unfilled placeholders into the saved PR draft.
