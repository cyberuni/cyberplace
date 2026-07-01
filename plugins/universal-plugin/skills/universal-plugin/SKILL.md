---
name: universal-plugin
description: Use this skill when creating, inspecting, updating, or deleting a universal agent plugin that targets multiple AI coding agent runtimes.
---

# Universal Plugin

## When to use

When the user wants to create, inspect, update, or delete a plugin targeting Claude Code, Cursor, Codex, and/or GitHub Copilot CLI from a single source of truth.

## Prerequisites

Load governance before starting:

```bash
npx universal-plugin governance show plugin-design
```

Until the CLI is available, read `governances/plugin-design.md` from this plugin's installation directory. It is the authoritative source for component selection rules and anti-patterns.

---

## Create

### Step 1 — Gather plugin identity

Ask if not provided. All fields map to the canonical `.plugin/plugin.json`.

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | kebab-case, 1–64 chars, `a-z 0-9 - .` only |
| `description` | Recommended | one sentence; Codex requires this |
| `version` | If publishing | semver; Codex requires this |
| `author.name` | Recommended | person or org name |
| `homepage` | Optional | docs or landing page URL |
| `repository` | Optional | source repo URL |
| `license` | Optional | SPDX identifier e.g. `MIT` |
| `keywords` | Optional | discovery tags; array of strings |

### Step 2 — Choose vendor targets

Ask the user which runtimes to support. Each chosen vendor becomes a key in `vendorExtensions` — that is what drives the `build` output; no separate `vendors` declaration is required.

| Vendor ID | Output manifest path | Hook event case | Required fields beyond `name` |
|-----------|---------------------|-----------------|-------------------------------|
| `claude-code` | `.claude-plugin/plugin.json` | PascalCase | none |
| `cursor` | `.cursor-plugin/plugin.json` | camelCase | none |
| `codex` | `.codex-plugin/plugin.json` | PascalCase | `version`, `description` |
| `copilot-cli` | `plugin.json` at plugin root | camelCase | none |

Universal minimum (no vendor manifest needed): `skills/<name>/SKILL.md` + `.mcp.json`.

Default to all four if the user is unsure.

### Step 3 — Choose components

Infer from context; ask only if ambiguous. Apply rules from the `plugin-design` governance loaded in Prerequisites.

| Component | Field | Directory | Cross-vendor? |
|-----------|-------|-----------|--------------|
| Skills | `skills` | `skills/<name>/SKILL.md` | Yes — all |
| Commands | `commands` | `commands/<name>.md` | Claude Code, Cursor, Copilot CLI |
| Agents | `agents` | `agents/<name>.md` | Claude Code, Cursor, Copilot CLI |
| MCP servers | `mcpServers` | `.mcp.json` | Yes — all |
| Hooks | `hooks` | `hooks/hooks.json` | Partial — event names translated on build |
| Rules | `rules` | `rules/<name>.mdc` | Cursor-only |
| LSP servers | `lspServers` | `.lsp.json` | Claude Code, Cursor |
| Output styles | `outputStyles` | `output-styles/` | Claude Code only |

### Step 4 — Scaffold files

Read the templates from `assets/templates/` and fill in the placeholders:

| File to create | Template |
|----------------|----------|
| `.plugin/plugin.json` | `assets/templates/plugin.json` |
| `skills/<name>/SKILL.md` | `assets/templates/skill.md` |
| `commands/<name>.md` | `assets/templates/command.md` |
| `agents/<name>.md` | `assets/templates/agent.md` |
| `hooks/hooks.json` | `assets/templates/hooks.json` |
| `commands/setup.md` (when `rules/` included) | `assets/templates/setup-command.md` |

Directory layout:

```
<plugin-name>/
├── .plugin/
│   └── plugin.json         ← canonical definition (source of truth)
├── skills/<name>/SKILL.md
├── commands/
├── agents/
├── rules/                  (only if always-on Cursor guidance requested)
├── hooks/hooks.json
├── .mcp.json
└── README.md
```

### Step 5 — Populate vendorExtensions

In `.plugin/plugin.json`, add a `vendorExtensions` key with one entry per chosen vendor. An empty `{}` opts into that vendor's output with no vendor-specific fields.

```json
{
  "$schema": "https://raw.githubusercontent.com/cyberuni/universal-plugin/refs/heads/main/schema/v1.json",
  "name": "<plugin-name>",
  "version": "1.0.0",
  "description": "<description>",
  "author": { "name": "<author>" },
  "skills": "./skills/",
  "vendorExtensions": {
    "claude-code": {},
    "cursor": {
      "publisher": "<org>",
      "category": "<category>",
      "tags": ["<tag>"]
    },
    "codex": {
      "interface": {
        "displayName": "<Human Name>",
        "category": "<category>"
      }
    },
    "copilot-cli": {
      "category": "<category>",
      "tags": ["<tag>"]
    }
  }
}
```

See spec §3.3 for the full list of vendor-specific fields:
https://github.com/cyberuni/universal-plugin/blob/main/spec/universal-plugin-system.md

### Step 6 — Audit skills

```bash
npx cyber-skills audit validate --path skills/<skill-name>
```

Fix any CRITICAL findings. Then invoke the **audit-skill** skill for full review.

### Step 7 — Build vendor manifests

> **Note:** The `build` CLI is not yet available. Use the manual steps below.

For each vendor in `vendorExtensions`:
1. Copy canonical fields from `.plugin/plugin.json`
2. Merge vendor-specific fields from `vendorExtensions.<vendor>`
3. Drop fields not supported by that vendor (see spec §6.1)
4. Translate hook event names (see spec §4.2)
5. Translate `${PLUGIN_ROOT}` and `${PLUGIN_DATA}` env vars (see spec §5)
6. Write to the vendor output path (see Step 2 table)

See spec §7 for full build rules:
https://github.com/cyberuni/universal-plugin/blob/main/spec/universal-plugin-system.md

### Step 8 — Install locally for testing

```bash
ln -sf "$(pwd)" ~/.claude/plugins/local/<plugin-name>   # Claude Code
ln -sf "$(pwd)" ~/.cursor/plugins/local/<plugin-name>   # Cursor → Developer: Reload Window
```

---

## Inspect

Show the current state of a plugin.

1. Read `.plugin/plugin.json` — show `name`, `version`, declared vendors (keys of `vendorExtensions`).
2. For each vendor, check whether the generated manifest exists at its output path.
3. Report status: which vendors are built, which are missing or stale.

Example output:

```
Plugin: my-plugin  v1.0.0
Vendors declared: claude-code, cursor, codex, copilot-cli
  claude-code   .claude-plugin/plugin.json   ✓ present
  cursor        .cursor-plugin/plugin.json   ✓ present
  codex         .codex-plugin/plugin.json    ✗ missing — run build
  copilot-cli   plugin.json                  ✗ missing — run build
```

---

## Update

### Add a vendor

1. Add the vendor key to `vendorExtensions` in `.plugin/plugin.json`.
2. Populate vendor-specific fields (see spec §3.3).
3. If vendor requires extra fields (`codex`: `version`, `description`), ensure they are in the canonical section.
4. Re-run Step 7 (build) for the new vendor.

### Remove a vendor

1. Remove the vendor key from `vendorExtensions`.
2. Delete the generated manifest at its output path.

### Add or remove a component

1. Add/remove the component field in `.plugin/plugin.json` (e.g. `"commands": "./commands/"`).
2. Scaffold or delete the corresponding files.
3. Re-run Step 7 (build) to regenerate all vendor manifests.

---

## Delete

### Remove generated manifests only (keep source)

Delete each vendor's output file. Generated manifests are build artifacts — safe to delete and regenerate.

```bash
rm -f .claude-plugin/plugin.json
rm -f .cursor-plugin/plugin.json
rm -f .codex-plugin/plugin.json
rm -f plugin.json          # copilot-cli; only if this file is the generated artifact
```

### Remove the whole plugin

Delete the plugin root directory. Confirm with the user before proceeding — this is irreversible.

---

## References

- Governance: `npx cyber-skills governance show plugin-design`
- Spec: https://github.com/cyberuni/universal-plugin/blob/main/spec/universal-plugin-system.md
- Schema: https://raw.githubusercontent.com/cyberuni/universal-plugin/refs/heads/main/schema/v1.json
- Examples: https://github.com/cyberuni/universal-plugin/tree/main/examples
