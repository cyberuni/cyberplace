# Universal Plugin Acceptance Specification

Gherkin acceptance criteria for any conformant universal plugin tool — validator, generator, or installer. Follows the Uncle Bob [Acceptance-Pipeline-Specification](https://github.com/unclebob/Acceptance-Pipeline-Specification) pattern.

See [design.md](./design.md) for the problem statement, goals, key design decisions, and tradeoffs.

## Scope

These feature files define the behavior that **any** conformant tool must exhibit. They are the acceptance criteria for future `cyberplace plugin` CLI commands and for third-party tools that want to claim compatibility with the universal plugin spec.

## Feature files

| File | Coverage |
| --- | --- |
| `plugin-manifest.feature` | Canonical `.plugin/plugin.json` field validation — name, version, description, path constraints, JSON structure |
| `plugin-transform.feature` | Vendor manifest derivation — field mapping per vendor, Codex required-field failures, hook event name transformation, MCP path adaptation |
| `plugin-hooks.feature` | Hook schema rules per vendor — file separation, PascalCase vs camelCase, version field presence, shared implementation script |
| `plugin-mcp.feature` | MCP symlink invariant — `.mcp.json` source of truth, `mcp.json` symlink, runtime resolution, path rules |
| `plugin-components.feature` | Component authoring — skills, commands, agents, rules, setup command |
| `plugin-distribution.feature` | Installation — personal/team/public scopes, npm package structure, Codex marketplace catalog |
| `plugin-portability.feature` | Cross-platform compatibility — Windsurf limits, path formats, vendor-specific syntax warnings, runtime support matrix |

## Normative reference

All scenarios derive from `governances/universal-plugin.md`. When a scenario conflicts with the governance, the governance wins; file a bug.

## Using these specs

Parse these feature files with any Gherkin parser (e.g., `gherkin-parser` from the Acceptance-Pipeline-Specification). Step handlers connect each Given/When/Then to the tool under test. The step vocabulary is abstract — implementations may be in any language.

Entry points once implemented:

```bash
cyberplace plugin validate <path>   # runs plugin-manifest + plugin-components + plugin-hooks + plugin-mcp
cyberplace plugin generate <path>   # runs plugin-transform
cyberplace plugin install <path>    # runs plugin-distribution
```
