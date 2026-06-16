# Governance Domain Spec

**Status:** Implemented
**Commands:** `universal-plugin governance show <name>`, `universal-plugin governance list`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The governance domain resolves and displays governance documents by name. A governance document is a Markdown file (`.md`) that contains cross-cutting guidance — principles, policies, templates, or constraints — intended to be loaded on demand by agents, skills, commands, hooks, or MCP servers.

`governance show <name>` finds the document with the given name across all configured scopes and prints its content to stdout. `governance list` enumerates all available governance names across all scopes, showing which scope each name resolves from.

---

## Why

Agents and skills that need governance content currently grep for files at runtime using filesystem paths. This is fragile: if the plugin structure changes, all consumers break. There is no stable name-to-location contract.

The governance domain provides that contract: consumers reference governance by name, and the CLI handles resolution. This survives plugin restructuring and supports layered overrides — a project team can override a package-level governance without touching user or package files.

### Why not `rules`

`rules` (e.g. Cursor `.mdc` files) is an always-on injection mechanism — every session gets every rule. In a multi-agent model, always-on context should be minimal: only constraints that truly apply to every agent in every role.

Governances are on-demand. An agent loads the governance it needs for its task, not everything. `universal-plugin governance` is the delivery mechanism for this demand-driven model. `rules` survives for backward compatibility and simple single-agent use cases; governances are a separate concept with separate delivery.

---

## Design decisions

### Scope resolution order

Modeled on Claude Code's settings precedence (highest to lowest):

| Scope | Path | Notes |
|---|---|---|
| Managed | OS system path (platform-specific) | MDM/org-deployed; cannot be overridden |
| Project | `<root>/governances/<name>.md` | Committed to git; team-shared |
| User | `~/.agents/governances/<name>.md` | Personal defaults across all projects |
| Package | `governances/` inside the npm package | Baseline defaults shipped with `universal-plugin` |

When the same name exists at multiple scopes, the highest scope wins. When a name exists only at a lower scope, it is returned normally.

### Managed scope is Claude Code-first

No other Tier 1 vendor (Cursor, Codex, Copilot CLI) has a documented managed/enterprise scope. Other vendors fall back to project → user → package resolution. The managed scope path mirrors Claude Code's managed-settings paths and requires OS-level write protection to be a meaningful security boundary.

### Platform-specific managed paths

| Platform | Path |
|---|---|
| macOS | `/Library/Application Support/UniPlugin/governances` |
| Windows | `C:\ProgramData\UniPlugin\governances` |
| Linux | `/etc/universal-plugin/governances` |

### `--format` output

Both `show` and `list` accept `--format <format>` (`text`, `json`, `agent`). `show --format json` returns `{ name, title, body, scope }`; `list --format json` returns an array of `{ name, scope }` entries. `--json` is a hidden backward-compat alias.

### `--root` option

Both commands accept `--root <path>` to override the project root (defaults to `process.cwd()`). This is primarily for testing and scripting.

---

## Command surface

```
universal-plugin governance show <name> [--root <path>] [--format <format>]
universal-plugin governance list [--root <path>] [--format <format>]
```

**Exit codes:**
- `0` — success
- `1` — governance not found (`show` only)

**Gherkin scenarios:** [governance.feature](./governance.feature)
