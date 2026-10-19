# Commit message examples

The subject has three parts: `Prefix Verb What`. Square brackets in the formula name parts; they are not literal punctuation in the subject.

| Branch | Subject |
| --- | --- |
| `UI-1` | `UI-1 Add settings panel` |
| `UI-123-settings` | `UI-123 Fix settings save` |
| `docs-cleanup` | `docs-cleanup Update setup instructions` |

Follow the subject with a blank line and a body that explains the reason for the change. Use facts from the issue, request, or diff. Include the effect on users or maintainers when known. A list of files or a restatement of the subject does not explain why.

```text
UI-123 Fix settings save

Settings edits were lost when users left the page before the save request
completed. Persisting the edit before navigation prevents that data loss.
```

If the reason cannot be established from the available context, ask for it before creating the commit. Do not guess at a user impact or claim validation that was not performed.
