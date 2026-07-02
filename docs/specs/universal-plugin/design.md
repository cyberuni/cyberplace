# Design: Universal Plugin

**Status:** Draft  
**Authors:** unional  
**Date:** 2026-05-31  
**Scope:** canonical plugin format + vendor derivation + distribution

---

## 1. Problem Statement

AI coding agents (Claude Code, Cursor, Codex) each support plugin-like extensions, but use incompatible formats: different manifest schemas, hook event naming conventions, component discovery paths, and distribution mechanisms. A developer extending more than one agent must author and maintain separate, diverging plugin definitions — one per vendor.

Two failure modes result:

**Drift.** Changes to shared logic (skills, hook scripts) must be applied to each vendor copy separately. Copies diverge silently. No single file is the authoritative source of truth.

**Barrier to adoption.** A plugin author targeting all three agents faces three separate authoring and publishing workflows with no shared vocabulary or tooling.

A canonical format with automated vendor derivation eliminates drift by keeping one source of truth and generating vendor manifests on demand. It lowers the authoring barrier by providing a single schema, a single validator, and a single set of distribution paths.

---

## 2. Goals

- **G1** — Define a canonical manifest (`.plugin/plugin.json`) that is the single source of truth for plugin identity and component paths.
- **G2** — Specify transform rules for deriving each vendor manifest from the canonical manifest.
- **G3** — Specify component authoring rules (skills, commands, agents, rules, hooks) with per-vendor behavior.
- **G4** — Specify distribution scopes (personal, team, public) with vendor-specific installation paths.
- **G5** — Specify a validator that checks canonical and vendor manifests before derivation or installation.
- **G6** — Specify portability constraints (Windsurf character limits, path formats, namespace isolation).
- **G7** — Provide acceptance criteria as Gherkin feature files in this directory.

## 3. Non-Goals

- **NG1** — Automated conversion to runtimes without a native SKILL.md path (Windsurf, Zed, Continue.dev). These require manual adaptation and are documented as warnings, not handled automatically.
- **NG2** — Unifying vendor-specific component types. `rules/` (Cursor), `.app.json` (Codex), `lspServers` remain vendor-specific; other vendors silently ignore them.
- **NG3** — Cryptographic signing or tamper detection.
- **NG4** — Plugin dependency resolution or DAG `extends` chains.
- **NG5** — Runtime hot-reload of plugin changes during an agent session.

---

## 4. Key Design Decisions

### 4.1 Canonical manifest, vendor manifests derived

The canonical manifest lives at `.plugin/plugin.json`. Vendor manifests (`.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json`) are generated from it via `cyberplace plugin generate` and committed alongside the canonical file.

**Tradeoff:** Derivation requires a build step; the alternative (editing vendor manifests directly) is simpler but causes drift. Drift is the primary problem this spec exists to solve, so derivation is the correct choice.

### 4.2 Shared component directories, vendor-specific behavior

Skills, commands, agents, hooks, and MCP servers live in component directories shared across vendors. Each vendor's plugin system decides what to load:

| Component | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `skills/` | native | native | native |
| `commands/` | native | native | silently ignored |
| `agents/` | native | native | silently ignored |
| `rules/` | silently ignored | native | silently ignored |
| `hooks/` | `hooks.json` | `.cursor/hooks.json` (project root) | `codex-hooks.json` |

**Tradeoff:** Silent ignore keeps plugins loadable across agents without errors. It can mask authoring mistakes (e.g., placing a rule in `commands/`). The validator catches misplaced files; silence at runtime is the right default for forward compatibility.

### 4.3 Separate hook files per vendor

Hook event schemas are incompatible: Claude Code uses PascalCase events nested under `"hooks"`, Codex uses camelCase events at top level, Cursor uses camelCase with a `"version": 1` field and lives at the project root. A single file cannot satisfy all three schemas.

Resolution: `hooks/hooks.json` (Claude Code), `hooks/codex-hooks.json` (Codex), `.cursor/hooks.json` (project root, not inside the plugin). All reference the same implementation script (`hooks/impl.sh`).

### 4.4 `.mcp.json` as source of truth, `mcp.json` as symlink

Cursor reads `mcp.json` (no dot prefix); Claude Code and Codex read `.mcp.json`. Instead of duplicating the file, `mcp.json` is a symbolic link to `.mcp.json`. Edits to `.mcp.json` propagate automatically.

**Tradeoff:** Symlinks require elevated permissions on Windows by default. Authors targeting Windows must either enable Developer Mode or document a fallback. This is a known limitation; the alternative (duplicating the file) causes drift and is worse.

### 4.5 Namespace isolation

Two installed plugins may provide skills or MCP tools with the same name. Names are prefixed by plugin name at runtime: `alpha:deploy`, `mcp__plugin_alpha_srv__run`. This prevents collision without requiring global name uniqueness during authoring.

### 4.6 Distribution scopes

Three scopes with distinct installation paths:

| Scope | Mechanism | Default |
| --- | --- | --- |
| Personal | symlink to plugin directory | — |
| Team | npm package | yes |
| Public | vendor marketplace submission | — |

Team scope is the default because it covers the widest practical case (project teams sharing tooling via npm) without requiring marketplace approval.

---

## 5. Open Questions

| # | Question | Needed by |
| --- | --- | --- |
| OQ1 | Should `cyberplace plugin generate` commit derived manifests, or leave that to CI? | G2, G5 |
| OQ2 | Should Amp be a first-class vendor (requires `skills/` → `.agents/skills/` mapping at install time)? | G4 |
| OQ3 | Should the `.app.json` Codex connector format be specified here or deferred to a Codex-specific extension of this spec? | G3 |
| OQ4 | Should the `lspServers` field be normalized in the canonical manifest or left as a pass-through? | G2 |
