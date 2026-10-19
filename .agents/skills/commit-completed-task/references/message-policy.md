# Commit message policy

Use the established project style: a short imperative sentence without a Conventional Commit prefix.

## Subject

- Start with an imperative verb.
- Capitalize the first word.
- Keep it specific and under 72 characters.
- Do not end with punctuation.
- Name the affected subsystem when it improves searchability.

Examples:

- `Add zone preview validation`
- `Fix optional doorway placement`
- `Update RiftGen generation documentation`
- `Add prefab light settings asset`
- `Correct render chunk queue cleanup`
- `Create project commit workflow skill`

Avoid vague subjects such as `Updates`, `Fix stuff`, `Changes`, or `WIP`.

## Body

Omit the body for a small, self-evident change.

Add a short body only for a meaningful rationale, behavior change, compatibility impact, or migration. Use complete sentences and wrap near 72 characters.

## Selection

| Change | Preferred subject pattern |
|---|---|
| New isolated capability | `Add <capability>` |
| Correct behavior | `Fix <problem>` or `Correct <value>` |
| Required cleanup with no behavior change | `Refactor <area>` |
| Documentation only | `Update <topic> documentation` |
| Tests only | `Add <area> tests` or `Update <area> tests` |
| Build or project configuration | `Configure <area>` |
| Project skill | `Create <skill purpose> skill` or `Update <skill purpose> skill` |

Match existing project wording where practical. Prefer one subject that describes the user-visible outcome over a file name or implementation detail.