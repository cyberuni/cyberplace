# Vendor Requirements

## Claude Code

**Manifest path:** `.claude-plugin/plugin.json`
**Required fields:** `name`
**Hook casing:** PascalCase (`SessionStart`, `PreToolCall`, `PostToolCall`, `Stop`)
**Schema:** https://json.schemastore.org/claude-code-plugin-manifest.json

## Cursor

**Manifest path:** `.cursor-plugin/plugin.json`
**Required fields:** `name`
**Hook casing:** camelCase (`sessionStart`, `preToolCall`, `postToolCall`)
**Schema:** https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json

## Codex

**Manifest path:** `.codex-plugin/plugin.json`
**Required fields:** `name`, `version`, `description`
**Hook casing:** PascalCase (follows Claude Code convention)

## GitHub Copilot CLI

**Manifest path:** `plugin.json` (root of plugin directory)
**Required fields:** `name`
**Hook casing:** camelCase (follows Cursor convention)
**Notes:** Also searches `.plugin/plugin.json` as a fallback path

## Hook event name reference

| Canonical | Claude Code / Codex | Cursor / Copilot CLI |
|---|---|---|
| session start | `SessionStart` | `sessionStart` |
| session end | `SessionStop` | `sessionStop` |
| before tool | `PreToolCall` | `preToolCall` |
| after tool | `PostToolCall` | `postToolCall` |
| agent stop | `Stop` | `stop` |
