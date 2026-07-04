---
title: Introduction
description: What universal-plugin is and why it exists.
---

**universal-plugin** is a build tool for universal AI agent plugins. You write one canonical definition in `.plugin/plugin.json`, and `universal-plugin plugin build` generates a spec-conformant vendor manifest for each runtime you target.

## The problem

Every major AI coding agent runtime — Claude Code, Cursor, Codex, GitHub Copilot CLI — uses its own `plugin.json` format at a vendor-specific path. Targeting multiple runtimes means maintaining multiple manifest files that share ~60% of their content, hand-writing vendor-specific transformations (hook event casing, env var names, component fields), and re-syncing on every change.

## The solution

A single source of truth in `.plugin/plugin.json` following the [open-plugin-spec](https://github.com/vercel-labs/open-plugin-spec), extended with a `vendorExtensions` field for vendor-specific additions. Running `universal-plugin plugin build` produces each vendor's manifest as a build artifact.

```json
{
  "name": "my-plugin",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "hooks": "./hooks/hooks.json",
  "vendorExtensions": {
    "claude-code": { "monitors": "./monitors/monitors.json" },
    "cursor": { "publisher": "my-org", "logo": "./assets/logo.png" },
    "codex": { "version": "1.0.0", "description": "My plugin." },
    "copilot-cli": {}
  }
}
```

Running `universal-plugin plugin build` from the plugin root generates:

| Vendor | Output |
|---|---|
| `claude-code` | `.claude-plugin/plugin.json` |
| `cursor` | `.cursor-plugin/plugin.json` |
| `codex` | `.codex-plugin/plugin.json` |
| `copilot-cli` | `plugin.json` |

## What gets transformed

- **Hook event names** — canonical PascalCase (`SessionStart`) is translated to each vendor's casing (camelCase for Cursor, PascalCase for Claude Code and Codex).
- **Env vars** — canonical `${PLUGIN_ROOT}` is translated to vendor-native names in hook commands and MCP configs.
- **Vendor-specific fields** — fields in `vendorExtensions.<vendor>` are merged into the generated manifest; fields the vendor doesn't support are dropped with a warning.
- **Required field enforcement** — Codex requires `version` and `description`; build fails with a clear error if they're missing.

## Generated files are build artifacts

The generated vendor manifests should be treated like compiled output — either gitignored (build on install) or committed (pre-built for distribution). The choice is yours; `universal-plugin` enforces neither.
