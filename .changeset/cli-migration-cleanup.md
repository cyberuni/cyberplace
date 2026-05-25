---
"cyber-skills": minor
---

Complete the CLI migration and remove legacy artifacts.

**Breaking CLI changes** (flat commands removed):

- `run-hook <name>` → `hook run <name>`
- `register-hooks --set <set>` → `hook register --set <set>`
- `inject-commit-discipline --commit-skill <name>` → `commit inject --commit-skill <name>`
- `skill-source <name>` → `skill source <name>`

**Removed shipped skill scripts** — use CLI subcommands instead:

- `skills/*/scripts/*.mjs` (audit, awesome, commit helpers)
- Local bash hooks under `.agents/hooks/` (replaced by bundled TypeScript hooks via `hook run`)

**New commands:** `audit validate`, `awesome find|inspect|render`, `awesome sources list|add|remove|disable|enable`, `commit resolve-skill`.
