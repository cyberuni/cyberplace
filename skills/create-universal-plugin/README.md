# create-universal-plugin

Scaffold a plugin that works in both Cursor and Claude Code from a single directory.

## When to use

- "Create a plugin for Cursor and Claude Code"
- "I want to build a universal agent plugin"
- "How do I make a plugin that works in both agents?"
- "Create a plugin for my team"

## What it does

Scaffolds a plugin directory with dual manifests (`.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json`), shared components (skills, commands, agents), and handles incompatibilities automatically:

- MCP: `.mcp.json` as source of truth, `mcp.json` as a symlink (Cursor reads it without drift)
- Hooks: Claude Code format in `hooks/hooks.json`, Cursor format documented separately
- Rules: always-on Cursor guidance with a bundled `setup` command that merges content into `AGENTS.md` for cross-agent coverage

## Install

```bash
npx skills add cyberuni/cyber-skills --skill create-universal-plugin
```
