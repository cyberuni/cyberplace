---
"cyber-skills": minor
---

Replace named hook sets and specialized runtimes with instruction-based CLI.

**Breaking CLI changes:**

- `hook register --set init|commit-discipline` removed — use explicit flags:
  - `hook register --name <name> --event SessionStart --glob '<pattern>'`
  - `hook register --name <name> --event SessionStart --extract <file> --heading "<heading>"`
  - `hook register --name <name> --event SessionStart --file <path>`
- `hook run <name>` removed — use `hook run --file|--glob|--extract` with optional `--name`

**Removed specialized hooks:** `mark-internal`, `inject-local-augmentations`, and `commit-discipline` runtimes. Mark internal skills via the `init` skill instruction; augmentations and commit discipline use generic instruction injection.

**Migration:**

```sh
# local augmentations
hook register --name local-augmentations --event SessionStart \
  --glob '.agents/skills/**/SKILL.local.md'

# commit discipline (after commit inject)
hook register --name commit-discipline --event SessionStart \
  --extract AGENTS.md --heading "Commit Discipline"
```
