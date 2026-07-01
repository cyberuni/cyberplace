# ADR-0007: Universal Agent Plugin — Single-Source Spec with Vendor Derivation

## Status

Accepted

## Context

Two governance files covered overlapping concerns with inconsistent field definitions:

- `universal-plugin.md` — operational cross-vendor format spec (layout, symlinks, hooks)
- `plugin-design.md` — normative authoring rules (field definitions, path constraints, env vars)

Both described the same plugin system. No formal acceptance criteria existed for plugin tooling. The exact transformation rules from canonical source-of-truth to each vendor-specific manifest were undocumented as machine-verifiable rules.

Key research findings (`.research/plugin-schema/`, `docs/research/2026-05-universal-plugin-cursor-claude.md`):

1. No vendor treats `.plugin/plugin.json` as its primary manifest path today; each uses a vendor-specific directory (`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`)
2. The true cross-vendor portable surface is component content (`skills/`, `.mcp.json`, `commands/`, `agents/`) — not the manifest
3. Hook schemas are irreconcilably incompatible: Claude Code uses PascalCase events without a version field; Cursor uses camelCase with `"version":1`; Codex uses camelCase without a version field
4. Codex requires `version` and `description` as mandatory fields; Claude Code and Cursor do not
5. Claude Code auto-discovers components without any manifest; Cursor and Codex require a vendor manifest

## Decision Drivers

- Single authoritative governance eliminates drift between two files
- Derivation rules must be precise enough to generate conformant vendor manifests programmatically
- Acceptance criteria must be machine-verifiable, not prose-only
- `governance show universal-plugin` is the existing stable reference surface

## Considered Options

### Option A: Keep both files with cross-references

- **Pros**: No disruption; gradual convergence
- **Cons**: Drift continues; agents must read two files; contradiction risk stays

### Option B: Merge into `universal-plugin.md`, remove `plugin-design.md`

- **Pros**: Single reference; `governance show universal-plugin` unchanged; web docs unaffected; `create-universal-plugin` skill unchanged
- **Cons**: File grows larger; `plugin-design` reference in `skill-design.md` must be updated

### Option C: Merge into a new `plugin-spec.md`, deprecate both

- **Pros**: Clean break; no legacy name ambiguity
- **Cons**: Breaks all existing references; three files during transition period

## Decision

Option B. `universal-plugin.md` becomes the comprehensive, spec-complete governance absorbing all content from `plugin-design.md`. `plugin-design.md` is removed. The reference in `skill-design.md` is updated from `plugin-design` to `universal-plugin`.

Gherkin acceptance feature files are created in `docs/specs/universal-plugin/`, following the Uncle Bob Acceptance-Pipeline-Specification pattern. These define acceptance criteria for any conformant plugin validator and generator tool.

Adopt `.plugin/plugin.json` as the **canonical source of truth**. All vendor manifests are **derived** from it — either programmatically generated or symlinked where field sets are identical.

## Rationale

`.plugin/plugin.json` is the vendor-neutral convergence target (open-plugin-spec v1.0.0). Authoring the canonical manifest in this neutral location and deriving vendor manifests from it produces a stable pattern regardless of future vendor alignment. The derivation rules are deterministic field mappings expressible as Gherkin scenarios.

Merging into `universal-plugin.md` minimizes disruption: web docs, skill references, and `governance show` commands continue working unchanged.

Hook incompatibilities are explicitly modeled with separate hook files per vendor (`hooks/hooks.json` for Claude Code, `hooks/codex-hooks.json` for Codex), both referencing a shared implementation script. Cursor hooks must be registered at the project root by the user and cannot be automated from inside the plugin.

## Tools and Skills Required

To manage and consume universal plugins across runtimes, the following tooling is specified:

| Tool / Skill | Purpose |
| --- | --- |
| `cyber-skills plugin validate <path>` | Validates canonical manifest and all component files against this spec |
| `cyber-skills plugin generate <path>` | Derives vendor manifests from `.plugin/plugin.json` |
| `cyber-skills plugin install <path>` | Installs to local path for testing (symlinks) |
| `create-universal-plugin` skill | Scaffolds a new cross-vendor plugin from scratch |
| `validate-plugin` sub-skill (internal) | Runs structural checks; called by `audit-skill` |

Acceptance criteria for each tool are defined in `docs/specs/universal-plugin/*.feature`.

## Consequences

### Positive

- One file to read for all plugin authoring rules
- Field-by-field transformation rules for all three vendors are formally specified
- Hook event name mapping table eliminates guesswork
- Gherkin scenarios provide acceptance criteria for future CLI implementation
- Web docs, `governance show`, and skill references remain stable

### Negative

- `skill-design.md` References section requires a one-line update
- `universal-plugin.md` is larger than either predecessor file
- `create-universal-plugin` skill may reference outdated content; requires review

### Risks

- Codex docs are incomplete for some edge cases (hook env vars, `apps` schema details); rules are inferred from community sources — confidence: medium
- open-plugin-spec claims Claude Code as a conformant host for `.plugin/plugin.json`, but Claude Code's own docs do not confirm this — treat as aspirational
- Cursor env vars available to hook scripts are undocumented in official Cursor docs

## Implementation Notes

1. Replace `governances/universal-plugin.md` with merged, spec-complete content
2. Delete `governances/plugin-design.md`
3. Update `governances/skill-design.md` References: `plugin-design` → `universal-plugin`
4. Create `docs/specs/universal-plugin/*.feature` Gherkin acceptance specs
5. Update `apps/web/src/content/docs/governances/universal-plugin.md` to mirror new content
6. Add changeset

## Related Decisions

- [ADR-0006](0006-agent-extension-terminology.md) — plugin vs skill vs extension terminology
- [ADR-0005](0005-skill-taxonomy.md) — skill classification within a plugin
- [ADR-0003](0003-agent-first-authoring.md) — agent-first authoring principles
