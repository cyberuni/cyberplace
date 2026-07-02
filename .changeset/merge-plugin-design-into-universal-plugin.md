---
"cyberplace": minor
---

Merge `plugin-design` governance into `universal-plugin` with a comprehensive cross-vendor spec.

`governance show universal-plugin` now includes the full plugin authoring spec: exact field definitions for the canonical `.plugin/plugin.json` source of truth, field-by-field vendor manifest derivation tables for Claude Code / Cursor / Codex, hook event name mapping (canonical kebab-case → PascalCase/camelCase per vendor), MCP symlink rules, component authoring rules, distribution scopes, and cross-platform portability constraints.

Adds `docs/specs/universal-plugin/*.feature` — Gherkin acceptance criteria for conformant plugin validators and generators, following the Uncle Bob Acceptance-Pipeline-Specification pattern.

**Migration:** Replace `governance show plugin-design` with `governance show universal-plugin`. All `plugin-design` content is now present in `universal-plugin`.
