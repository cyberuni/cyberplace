# cyber-skills

## 0.6.0

### Minor Changes

- c1c8981: Add `bun` to the `PackageManager` type. `detectPackageManager` now detects `bun.lock` and `bun.lockb` lock files and returns `'bun'`. `installNpmPackage` installs with `bun add -d`.
- 54c1a50: Add `--format agent` to all dual-audience CLI commands for LLM-optimized output. Agent format produces terse, structured text output — lower token cost and better reasoning than JSON. Use `--format agent` in skills; use `--format json` for non-LLM machine consumers (scripts, pipelines). `isAutomatedOutput()` is also exported to suppress interactive prompts for both `agent` and `json` formats.
- b319c30: Add `--format json` flag to all dual-audience CLI commands as a more explicit alternative to `--json`. The `--json` flag is still accepted as a hidden backward-compat alias.
- 92a406c: Add support for full git URLs in `skills add` and `skills update`.

  Pass any HTTPS or SSH clone URL directly, including browser-copy branch URLs from GitHub (`/tree/`), GitLab (`/-/tree/`), and Gitea/Forgejo/Gogs (`/src/branch/`). Provider type is detected from the URL path structure so self-hosted instances work without extra configuration. The `update` command re-fetches from the stored URL automatically.

- 1935b7b: Add `add`, `remove`, `update`, `list`, `find`, `migrate`, and `config provider` commands for skill registry management.
  - `cyber-skills add <org/repo[:skill]>` installs skills from GitHub, GitLab, or custom providers.
  - `cyber-skills add <package>` installs skills from an npm package.
  - `cyber-skills remove <name>`, `update [name]`, and `list` manage installed skills.
  - `cyber-skills find [query]` searches [skills.sh](https://skills.sh) by default (no API key required); use `--in org/repo` to search a specific repo. Returns up to 10 results by default; use `--limit <n>` to override. Output is a compact table (name, source, installs, install command).
  - `cyber-skills migrate` imports existing `skills-lock.json` entries into the new `.agents/cyber-skills-lock.json` format.
  - `cyber-skills config provider add <url>` registers a custom skill source (GitHub, GitLab, custom, or `marketplace`).
  - Marketplace providers (`--type marketplace`) expose `GET /api/search?q=<query>` and are searched on every `find` alongside skills.sh.
  - Press `Esc` at any interactive `add` or `update` prompt to cancel.
  - `cyber-skills update` (interactive, no flags) asks whether to update project skills, global skills, or both (default: both).

  Config is stored in `.agents/cyber-skills.json`; the lock is stored in `.agents/cyber-skills-lock.json`.

- 5c21859: `add` and `update` now also look for skills in `agents/skills/` in addition to `skills/`. When a specific skill name is given, `skills/` is tried first and `agents/skills/` is the fallback. The GitHub API listing path merges both directories, deduplicating by name.
- 290dcf7: Move public skills to `agents/skills/` and governances to `agents/governances/`. The `skills/` and `governances/` top-level directories are removed; authored content now lives under `agents/`. The `cyber-skills update` command skips `.agents/skills/<name>` entries that are symlinks, so locally authored skills are never overwritten by remote fetch.
- 5cf14c9: Add interactive skill selection to the `remove` command.

  When run in a TTY without `--global`/`--project` or a skill name, `remove` now prompts for placement first (project/global/both) then shows a multi-select list of installed skills to remove.

- 484d53e: Replace text-input scope prompts with an arrow-key single-select TUI for `add` and `update` commands. Add `both` option to the install scope prompt so skills can be installed to project and global in one step.
- 0422f26: Upgrade the `add` interactive skill picker with keyboard navigation, fuzzy filtering, and group toggle.
  - Use arrow keys to navigate the skill list.
  - Press `Space` to toggle a single skill or an entire group (group rows show `[ ]` / `[-]` / `[x]` state).
  - Type any characters to fuzzy-filter by skill name; `Backspace` removes the last filter character.
  - Press `Ctrl+A` to select or deselect all currently visible skills.
  - Press `Enter` to confirm, `Esc` to cancel.
  - Non-TTY sessions fall back to the original numbered-list prompt.

- 895dd3a: Add `skill.json` sidecar support for distribution metadata. Skills can declare `distribution.install_via: package_manager` in a `skill.json` file alongside `SKILL.md` to prevent source-based installs via `skills add org/repo`. Skills flagged as package-managed are skipped with a hint to use `skills add <package-name>` instead. The `activation` field moves to top-level SKILL.md frontmatter (not `metadata.activation`) so all agents can see it. Exports `SkillManifest` type and `readSkillManifest`/`isPackageManaged` utilities.
- 903d906: Install all files in a skill directory (not just `SKILL.md`) when running `registry add` or `registry update`. Files matching `*.local.*` are excluded. Uses a sparse git clone so only the requested skill directories are fetched, keeping installs fast.
- 62394f7: Create a `skills/<name>` symlink when installing a skill at project scope. If `skills/<name>` is already a real directory (an authored public skill), the symlink is skipped and a warning is printed instead.

### Patch Changes

- e33dc92: Extend `audit-skill` Q8 and Q13 checks to catch token-bloat patterns: redundant intro paragraphs that restate the `description` frontmatter, and agent-passive sections (`## What Happens Next`, `## Next Steps`) that describe CI pipeline behavior the agent cannot act on.
- a69f794: Add optional `home` parameter to `getLockPath`, `readLock`, `writeLock`, `setLockEntry`, `removeLockEntry`, and `getLockEntry` to allow overriding the home directory, preventing global-scope lock writes from leaking into `~/.agents` during tests.
- fe343b6: Add optional `home` parameter to `AddOptions` and `getInstallDir` to allow overriding the home directory in tests, preventing the global-scope install path from leaking into the real `~/.agents/skills`.
- 74840a8: Fix `cyber-skills hook register` to use the repo's package manager exec wrapper (`pnpm exec`, `yarn exec`, `bunx`, or `npm exec`) instead of a hardcoded `node_modules/.bin` path. Falls back to pinned `npx` when no lock file is detected.
- 484d53e: Fix `list` and `config provider list` commands that failed at runtime due to a missing `printTable` import.
- 6864937: Fix skill selector indent: items use 2-space indent when there are no groups; ungrouped items in mixed lists appear under an "other" group with standard 4-space indent.
- d29e65c: Preserve local frontmatter `metadata` block when running `skills update`. Previously, updating an installed skill overwrote the file entirely, discarding any locally added metadata fields such as `metadata: internal: true`.

## 0.5.0

### Minor Changes

- 9c5063f: Document universal `metadata.activation` as normalized hook lifecycle events in skill-design governance, revise create-persona-skill and create-skill guidance, gloss ADR-0005, and add an upstream activation frontmatter proposal draft.

### Patch Changes

- e2cec0c: Fix `init-commit-discipline` to not prompt for `npx --yes` install consent; defer to `init` skill where consent is obtained.

## 0.4.3

### Patch Changes

- eaab23c: Fix security issues in `audit-skill`: cap evidence excerpts to prevent credential echo (W007), add sandboxing reminder at the clone step for third-party content (W011), and require pinned versions for `governance show` commands (W012).
- 9f04340: Fix `hook register` crash when agent settings contain hook entries with missing or null commands.
- 483cdef: Add repo-private skill repair and validation commands for `metadata.internal` drift and public-skill symlinks.

## 0.4.2

### Patch Changes

- 4fcba5b: Clarify skill placement and pattern terminology across docs and awesome CLI output.

## 0.4.1

### Patch Changes

- 718e20c: Detect hidden Unicode control characters in `SKILL.md` files and bundled scripts during audit validation.
- b513c31: Warn when public shipped skills reference repository-local files outside their own skill directory.

## 0.4.0

### Minor Changes

- 75e3769: Add `skill-design` governance for SKILL.md authoring and `skill-repo-structure` governance for skill library repo layout. Normalize governance name input in `governance show`.

  BREAKING CHANGE: Rename `discipline` CLI to `governance` and ship standards under `governances/`. Use `governance list` and `governance show <name>`. Session commit discipline is unchanged.

### Patch Changes

- f82bf4e: Add ADR-0003 agent-first authoring doctrine. Remove ## Why sections from governances; align ADR-0001 content boundaries. Refactor governances and commit discipline injection: self-contained normative bodies with no repository file links or rationale prose; references at end via governance show only. Add audit-skill Q13 and governance load tests.
- 64aa3db: Upgrade SessionStart hooks to the current CLI semver when `hook register` finds a matching hook with an older pin. Document supply-chain install profiles and add a threat model for skill vs npm CLI trust boundaries.
- f82bf4e: Split agent-tool-output governance from cyber-skills CLI specifics. Trim governance to general agent tool output rules; add ADR-0004 for CLI output archetypes and subcommand inventory.

## 0.3.0

### Minor Changes

- 5493c00: Add `discipline list` and `discipline show` commands to load version-pinned agent-tool output rules. Extend `audit validate` with mechanical checks for stdout-as-data and script output hygiene.

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
