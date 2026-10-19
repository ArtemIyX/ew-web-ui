# Illustrative pull request drafts

These are fictional examples of the required shape, not descriptions of this repository or its past pull requests.

## Example 1 — feature

# UI-42 Add inventory filters

## Summary
Adds category filters to the inventory view so players can narrow visible items.

## Why
The inventory view required scrolling through every item to find a category. Filtering makes that task faster without changing the stored inventory.

## Changes
- Add category controls and selected state.
- Filter the displayed list while retaining the existing item order.

## Validation
- Manual check: switching categories updates the visible list (illustrative result).

## Risks and review notes
- Review keyboard access to the filter controls.

## Example 2 — bug fix

# UI-43 Fix settings save after navigation

## Summary
Persists settings edits before navigation completes.

## Why
The prior flow could leave a page before its save request finished, losing the latest edit.

## Changes
- Await the save operation before leaving the settings page.
- Show a failure state when the request cannot complete.

## Validation
- Manual check: a successful save persists after returning to the page (illustrative result).
- Manual check: a failed save keeps the edit visible (illustrative result).

## Risks and review notes
- Review navigation behavior when the save request is slow.

## Example 3 — refactor

# UI-44 Move menu state into a shared store

## Summary
Moves menu selection state into one shared store while retaining the existing controls.

## Why
Separate components maintained their own selection state, allowing the menu and content view to disagree.

## Changes
- Centralize the selected menu item.
- Update both consumers to read and write the shared state.

## Validation
- Example test suite: passed (illustrative result).

## Risks and review notes
- Review state restoration when reopening the menu.

## Example 4 — documentation

# UI-45 Update local setup instructions

## Summary
Clarifies the steps for starting the UI in a local development environment.

## Why
The previous instructions omitted an environment setup step needed before the development command.

## Changes
- Add the missing setup step.
- Correct the command order in the getting-started guide.

## Validation
- Not run (documentation-only change in this illustrative example).

## Risks and review notes
- No specific risks or review steps identified.
