# cyberplace

## 0.2.0

### Minor Changes

- 39ec1cf: Build the `cyberplace tavern` AXI output surface and fail loud on a malformed marketplace manifest.

  `cyberplace tavern` now emits TOON by default (name/description/recruit rows plus a pre-computed
  `N crews` aggregate) instead of human prose. Long rosters truncate with a `… +N lines — rerun with
--full` hint (`--full` prints the whole roster; `--format json` is never truncated), an empty roster
  is the definitive `0 crews found`, the bare command shows the roster rather than help, every run ends
  with a `→ cyberplace add <name>` next-step on stderr, and an unknown flag fails loud. A present-but-
  corrupt `.claude-plugin/marketplace.json` now fails loud with a clear "Could not parse marketplace
  manifest" error (exit 1) rather than throwing a raw `SyntaxError` or yielding a silently empty roster.

### Patch Changes

- b3c4cc3: Fix `readMarketplacePlugins` crashing on plugins whose marketplace `source` is an npm descriptor object instead of a local-directory string. npm-sourced plugins now render with a `npm:<package>` source label and an npmjs.com link.

## 0.1.0

### Minor Changes

- c34022d: Add `aced:define-agent` skill for creating and improving agent definitions. Guides users through three modes — **Delegated** (subagent only), **Invokable** (dual-mode: subagent + in-context persona via a companion command), and **In-context only** — and asks upfront about placement (user-global, project, or plugin). Scaffolds the canonical file under `.agents/agents/`, creates runtime symlinks, and for Invokable mode generates a thin companion command file.
- c34022d: Add `aced:define-governance` skill for creating and improving governance files — reference-only skills that encode criteria, standards, or workflow rules for other skills and agents to load on demand. Guides users through placement (user-global, project, or plugin), gathers topic, consumers, content type (rubric, constraint set, checklist, decision table), and rules, then drafts the file with the required `Internal skill:` description prefix and `user-invocable: false` frontmatter to suppress auto-triggering across all harnesses.
- c34022d: Add `aced:define-skill` skill for authoring and improving workflow skills — process, tool-based, or standard SKILL.md files — the ACED-native successor to the legacy `create-skill`. Routes the request (deferring agents/personas to `define-agent`, rule sets to `define-governance`, session extraction to `skillify`), settles scope via the five design questions, picks the pattern and placement, scaffolds the SKILL.md (plus a README for a project-public skill) with a trigger-bearing description, runs the structural audit, and hands off to the ACED eval loop (`start-mission` / `add-scenario` / `run`) to spec and score it instead of embedding a legacy trigger-query test. Ships with a frozen `.feature` (fit: strong) and a scenario→rubric eval suite.
- c34022d: The `aced-spec-designer` agent now owns its quality loop internally. After writing eval artifacts, the designer invokes `aced-spec-validator`, revises only the affected files on failure, and repeats up to three times — surfacing questions to the user only when genuinely needed. The `aced create-spec` skill is now a thin entry point that invokes the designer and relays its `QUALITY_GATE` and `ITERATIONS` summary.
- a50a89a: Add `sdd` plugin with `create-spec` and `validate-spec` skills for spec-driven development. Includes `sdd-spec-designer` and `sdd-spec-validator` agent definitions that back the skills with a quality-loop pattern.
- 18e13dd: The `sdd` plugin's `manage-spec-anchors` config now supports `**` in an anchor pattern, matching zero or more directory levels (any depth). This lets a custom anchor name a root whose specs sit at varying depth beneath it, e.g. `archive/**`.
- e020b7f: Auto-select the skill when a source repository exposes exactly one skill, skipping the selection prompt and proceeding directly to the install-scope prompt.
- 6068301: Replace the `sdd` plugin's implementation with the conductor/`sdd-automaton` design (previously staged at `plugins/sdd-new`). The plugin still installs as `sdd`, but its skill set has changed: `start-mission`, `spec-gate`, `discover-specs`, `discover-plans`, `pause-mission`, `resume-mission`, `manage`, `manage-spec-anchors`, `concept-index`, `place-node`, `plan-retirement`, `resolve-governances`, and `resolve-tracking` replace the old `create-spec`, `validate-spec`, `revise-spec`, `split-spec`, `dedupe-specs`, `spec-digest`, `spec-governance`, `render-spec-graph`, and `plan-producer-governance` skills. Reinstall the plugin to pick up the new skill set.
- 0745efa: The `init` skill now checks for missing vendor skill symlinks after writing `AGENTS.md`. For each skill in `.agents/skills/`, it ensures a corresponding symlink exists in every vendor skill directory present in the repo (`.claude/skills/`, `.cursor/skills/`, `.opencode/skills/`), creating missing directories and symlinks as needed.
- 9dfba4d: SDD's `manage` skill regroups its top-level menu: `manage-spec-anchors` now lives under a new **Setup & discovery** group (alongside `scaffold-project-spec`) instead of **Housekeeping**, since anchor config is a prerequisite for a project being discoverable at all. The `sdd` gateway also now offers `manage-spec-anchors` alongside `scaffold-project-spec` when it finds no spec for a target project, rather than assuming the project was never scaffolded.
- 0058aa5: Merge `plugin-design` governance into `universal-plugin` with a comprehensive cross-vendor spec.

  `governance show universal-plugin` now includes the full plugin authoring spec: exact field definitions for the canonical `.plugin/plugin.json` source of truth, field-by-field vendor manifest derivation tables for Claude Code / Cursor / Codex, hook event name mapping (canonical kebab-case → PascalCase/camelCase per vendor), MCP symlink rules, component authoring rules, distribution scopes, and cross-platform portability constraints.

  Adds `docs/specs/universal-plugin/*.feature` — Gherkin acceptance criteria for conformant plugin validators and generators, following the Uncle Bob Acceptance-Pipeline-Specification pattern.

  **Migration:** Replace `governance show plugin-design` with `governance show universal-plugin`. All `plugin-design` content is now present in `universal-plugin`.

- 374755a: Remove bundled skills from the npm package.

  Skills previously shipped under `skills/` inside the `cyberplace` npm package are no longer included. They now live in plugin-specific directories in the source repository and must be installed via `npx cyberplace add` or the `skills` CLI.

  Migration: replace any direct file references to the bundled skills with `npx cyberplace add cyberuni/cyberplace:<skill-name>`.

- edb3b9f: Remove `create-persona-skill`. Its scope is fully covered by `aced:define-agent`, which handles personas as one of three agent-definition modes (Delegated, Invokable, In-context only) alongside subagents.

  Migration: use `aced:define-agent` and pick the "In-context only" or "Invokable" mode for a persona.

- d661853: Remove `create-skill`. Its scope is fully covered by `aced:define-skill`, which also handles
  already-escaped (ignored) requests via a dedicated scaffold-and-stop entry point.

  Migration: use `aced:define-skill`.

- c34022d: Rename the ACES plugin to **ACED** — Agent Config Evaluation & Development. The old expansion, "Agent Config Examination & Specification," undersold what the plugin does: it doesn't just examine and specify agent configs, it runs the full SDD production chain (spec-producer, spec-judge, impl-producer, impl-judge) that builds and evolves them.

  This is a breaking rename for existing installs. All `aces:*` skill and agent references (`aces:run`, `aces:add-scenario`, `aces:define-agent`, `aces:define-skill`, `aces:define-governance`, `aces:improve`, `aces:improve-skill`, `aces:compare`, `aces:report`, `aces:init-aces`, `aces-scenario-writer`, `aces-spec-validator`, `aces-impl-judge`, `aces-case-judge`) no longer resolve — use their `aced:*` / `aced-*` equivalents (e.g. `aced:init-aced`). The plugin directory moves from `plugins/aces` to `plugins/aced`, and its `.agents/universal-plugin.json` registration key changes from `aces` to `aced`. Consumers with an existing local `.agents/universal-plugin.json` entry pointing at `aces` must update it to `aced`, and re-run `npx skills add cyberuni/cyberplace --skill aced/<skill>` for any pinned install paths.

- 6e1651f: Add the `sdd-orchestrator` plugin-delegate model to the `sdd` plugin. The orchestrator is the lead delegate: it runs **one autonomous segment** — resolving the five production-chain roles (`spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`) from the `.agents/universal-plugin.json` registry, deriving the workflow cursor and MODE from artifact state, dispatching each role through one uniform I/O surface, and synthesizing layer-scoped `aligned`. It has no user channel — it returns `needs-input` with batched questions for the skill to surface.

  The skills own the user loop and the gates: `create-spec` runs the grill and drives exploration with a session-local iteration cap; `validate-spec` runs both gates, confirming reviewers and writing `status` / `approved-by` on the human verdict.

  Default delegates ship as agent definitions — `sdd-scenario-writer` (spec-producer), `sdd-planner` (plan-producer), `sdd-impl-judge` (impl-judge), and the dual-mode `sdd-spec-judge` (spec-judge). Reference content moves to harness-loaded `user-invocable: false` skills: `sdd:spec-governance` (the `.feature` format bar, scenario ordering, and `spec.md` enrichment) and the `framer` / `builder` / `architect` actor governances. The contract governances and the `governance show` call are retired (ADR-0013).

- 18aad7c: Add `plugin-design` governance and update `skill-design` governance.

  Both are loadable via `governance show <name>`.
  - **`plugin-design` (new)**: rules for authoring distributable agent plugins — `plugin.json` manifest schema (Open Plugin Spec), directory layout, component types (skills, MCP servers, commands, hooks, agents, rules, LSP), path/env variable rules (`${PLUGIN_ROOT}`, `${PLUGIN_DATA}`), namespacing, cross-platform portability table, and `plugin.json` vs `skill.json` disambiguation.
  - **`skill-design` (updated)**: adds `compatibility` and `allowed-tools` optional frontmatter fields; adds reference to `plugin-design`.

- 06c9259: Add the **Tavern** — a crew storefront for browsing and installing recruitable crews (catalog entries tagged `crew` that ship a persona gateway skill). New `cyberplace tavern [query]` command lists and filters crew entries with their install commands (`--format text|json`). Crews are marked by a reserved `crew` tag in an entry's `tags[]` — no catalog schema change.

  Also exposes the roster derivation as a library via the new `cyberplace/tavern` export (`readMarketplacePlugins`, `readCrewPlugins`) — a single source of truth for reading the marketplace manifest, crew-tag filtering, and per-plugin counts/version/source URL, consumed by both the CLI and the docs site so the two never drift.

### Patch Changes

- c34022d: Rename the ACED `add` skill (and its spec unit) to `add-scenario`, so the name says what it adds — a golden-set scenario — rather than a bare, generic `add` that read awkwardly next to `npx skills add`. The skill folder `plugins/aced/skills/add` is now `plugins/aced/skills/add-scenario`, its spec node `.agents/specs/aced/suite-authoring/add` moves with it (the frozen `add.feature` → `add-scenario.feature`, a pure rename that preserves the freeze), and the docs route `/aced/add/` is now `/aced/add-scenario/`. Install with `npx skills add cyberuni/cyberplace --skill aced/add-scenario`; the old `aced/add` path no longer resolves.
- 0a0b1a9: Fix `audit validate` Q5 check to enforce the correct 1024-character description limit instead of 120.
- c34022d: Retire the project-private `audit-skill` skill in favor of `improve-skill`, which already covered its full checklist plus fix-application (Q13–Q16 agentskills.io checks, `references/check-definitions.md`, apply-fixes step). `improve-skill` moves from `plugins/universal-plugin/skills/improve-skill` to `plugins/aced/skills/improve-skill`, installable as `npx skills add cyberuni/cyberplace --skill aced/improve-skill`. The CLI's `audit validate` follow-up message now points at `improve-skill`.
- 2f80e7a: Rename quill's production-chain agents to reflect their roles: `quill-implementer` → `quill-judge` (the impl-judge) and `quill-writer` → `quill-spec-writer` (disambiguated from the impl-producer `quill-doc-writer`). Projects that registered quill via `init-quill` should re-run it to refresh the role-map entry.
- 067751a: Remove redundant `SKILL.local.md` augmentation step from `init-commit-discipline`. Auto-commit rules are already injected into `AGENTS.md` and the SessionStart hook — no secondary reinforcement file is needed.
- 59a8874: Rename the SDD `validate-spec` skill (and its spec node) to `spec-gate`, reconciling the name with the "spec gate" concept the design already uses everywhere. The skill folder `plugins/sdd-new/skills/validate-spec` is now `plugins/sdd-new/skills/spec-gate`; its `check-spec-state.mts` / `check-feature.mts` engines move with it. The gate skill body now also documents `check-feature.mts` (the `.feature`-form authority run in `verify:specs-new`).
- 9eed8ba: `start-mission` now names the plan brief `<cr-ref>-<what>.plan.md` so the file states what the CR does even from external sources, with the source prefix (`github`) optional. Todo `content` is a short summary (<120 chars) and the plan body stays agent-concise.

## 0.7.0

### Minor Changes

- 0b7c55e: Add `SKILL.project.md` as a project-level augmentation layer between `SKILL.md` (base) and `SKILL.local.md` (local). Precedence order: `SKILL.local.md` > `SKILL.project.md` > `SKILL.md`. Both `SKILL.project.md` and `SKILL.local.md` are excluded from `skills add` installation.
- 7ae1b89: Revert `agents/` directory consolidation — skills ship under `skills/` and governances under `governances/` again.
  - `UpdateResult.skipped` field removed; update consumers that check `result.skipped`.
  - `skills add` no longer falls back to `agents/skills/` when fetching from a remote repo.
  - Project-scope symlinks are created in `skills/<name>` instead of `agents/skills/<name>`.
  - npm packages must expose skills under `skills/` (not `agents/skills/`) to be discovered.

## 0.6.0

### Minor Changes

- c1c8981: Add `bun` to the `PackageManager` type. `detectPackageManager` now detects `bun.lock` and `bun.lockb` lock files and returns `'bun'`. `installNpmPackage` installs with `bun add -d`.
- 54c1a50: Add `--format agent` to all dual-audience CLI commands for LLM-optimized output. Agent format produces terse, structured text output — lower token cost and better reasoning than JSON. Use `--format agent` in skills; use `--format json` for non-LLM machine consumers (scripts, pipelines). `isAutomatedOutput()` is also exported to suppress interactive prompts for both `agent` and `json` formats.
- b319c30: Add `--format json` flag to all dual-audience CLI commands as a more explicit alternative to `--json`. The `--json` flag is still accepted as a hidden backward-compat alias.
- 92a406c: Add support for full git URLs in `skills add` and `skills update`.

  Pass any HTTPS or SSH clone URL directly, including browser-copy branch URLs from GitHub (`/tree/`), GitLab (`/-/tree/`), and Gitea/Forgejo/Gogs (`/src/branch/`). Provider type is detected from the URL path structure so self-hosted instances work without extra configuration. The `update` command re-fetches from the stored URL automatically.

- 1935b7b: Add `add`, `remove`, `update`, `list`, `find`, `migrate`, and `config provider` commands for skill registry management.
  - `cyberplace add <org/repo[:skill]>` installs skills from GitHub, GitLab, or custom providers.
  - `cyberplace add <package>` installs skills from an npm package.
  - `cyberplace remove <name>`, `update [name]`, and `list` manage installed skills.
  - `cyberplace find [query]` searches [skills.sh](https://skills.sh) by default (no API key required); use `--in org/repo` to search a specific repo. Returns up to 10 results by default; use `--limit <n>` to override. Output is a compact table (name, source, installs, install command).
  - `cyberplace migrate` imports existing `skills-lock.json` entries into the new `.agents/cyberplace-lock.json` format.
  - `cyberplace config provider add <url>` registers a custom skill source (GitHub, GitLab, custom, or `marketplace`).
  - Marketplace providers (`--type marketplace`) expose `GET /api/search?q=<query>` and are searched on every `find` alongside skills.sh.
  - Press `Esc` at any interactive `add` or `update` prompt to cancel.
  - `cyberplace update` (interactive, no flags) asks whether to update project skills, global skills, or both (default: both).

  Config is stored in `.agents/cyberplace.json`; the lock is stored in `.agents/cyberplace-lock.json`.

- 5c21859: `add` and `update` now also look for skills in `agents/skills/` in addition to `skills/`. When a specific skill name is given, `skills/` is tried first and `agents/skills/` is the fallback. The GitHub API listing path merges both directories, deduplicating by name.
- 290dcf7: Move public skills to `agents/skills/` and governances to `agents/governances/`. The `skills/` and `governances/` top-level directories are removed; authored content now lives under `agents/`. The `cyberplace update` command skips `.agents/skills/<name>` entries that are symlinks, so locally authored skills are never overwritten by remote fetch.
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
- 74840a8: Fix `cyberplace hook register` to use the repo's package manager exec wrapper (`pnpm exec`, `yarn exec`, `bunx`, or `npm exec`) instead of a hardcoded `node_modules/.bin` path. Falls back to pinned `npx` when no lock file is detected.
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
- f82bf4e: Split agent-tool-output governance from cyberplace CLI specifics. Trim governance to general agent tool output rules; add ADR-0004 for CLI output archetypes and subcommand inventory.

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

- a250638: Fix `npx cyberplace` by building CLI and hook scripts before npm publish.

## 0.0.1

### Patch Changes

- 96c2ecc: Fix `npx cyberplace` execution by publishing built `.mjs` CLI and hook scripts.
- 8f32baa: Replace `git add -p` with agent-compatible staging in commit discipline guidance and define unit-of-work boundaries.
