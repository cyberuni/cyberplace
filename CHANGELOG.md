# cyber-skills

## 0.2.0

### Minor Changes

- ffeb753: Add `skill list` command with `--grep` glob filter to discover installed skills from repo, global, and package locations.

## 0.1.0

### Minor Changes

- 0904c18: Complete the CLI migration and remove legacy artifacts.

  **Breaking CLI changes** (flat commands removed):

  - `run-hook <name>` → `hook run <name>`
  - `register-hooks --set <set>` → `hook register --set <set>`
  - `inject-commit-discipline --commit-skill <name>` → `commit inject --commit-skill <name>`
  - `skill-source <name>` → `skill source <name>`

  **Removed shipped skill scripts** — use CLI subcommands instead:

  - `skills/*/scripts/*.mjs` (audit, awesome, commit helpers)
  - Local bash hooks under `.agents/hooks/` (replaced by bundled TypeScript hooks via `hook run`)

  **New commands:** `audit validate`, `awesome find|inspect|render`, `awesome sources list|add|remove|disable|enable`, `commit resolve-skill`.

- c4e808d: Replace named hook sets and specialized runtimes with instruction-based CLI.

  **Breaking CLI changes:**

  - `hook register --set init|commit-discipline` removed — use explicit flags:
    - `hook register --name <name> --event SessionStart --glob '<pattern>'`
    - `hook register --name <name> --event SessionStart --extract <file> --heading "<heading>"`
    - `hook register --name <name> --event SessionStart --file <path>`
  - `hook run <name>` removed — use `hook run --file|--glob|--extract` with optional `--name`

  **Removed specialized hooks:** `mark-internal`, `inject-local-augmentations`, and `commit-discipline` runtimes. Mark internal skills via the `init` skill instruction; commit discipline uses generic instruction injection. Skill augmentations (`SKILL.local.md`) live in AGENTS.md and apply when a skill loads.

  **Migration:**

  ```sh
  # commit discipline (after commit inject)
  hook register --name commit-discipline --event SessionStart \
    --extract AGENTS.md --heading "Commit Discipline"
  ```

## 0.0.2

### Patch Changes

- a250638: Fix `npx cyber-skills` by building CLI and hook scripts before npm publish.

## 0.0.1

### Patch Changes

- 96c2ecc: Fix `npx cyber-skills` execution by publishing built `.mjs` CLI and hook scripts.
- 8f32baa: Replace `git add -p` with agent-compatible staging in commit discipline guidance and define unit-of-work boundaries.
