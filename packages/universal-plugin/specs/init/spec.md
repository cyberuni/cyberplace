# Init Domain Spec

**Status:** Planned
**Commands:** `universal-plugin init`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The init domain scaffolds a new plugin project. It creates `.plugin/plugin.json` with sensible defaults and optionally creates the standard directory structure (`skills/`, `agents/`, `governances/`, `commands/`). In interactive mode it prompts for name, description, and target vendors; in non-interactive mode it uses provided flags or built-in defaults.

---

## Why

Starting a plugin from scratch requires knowing the canonical manifest schema, the vendor extension format, and the expected directory layout. `universal-plugin init` encodes that knowledge into a single command so authors skip the bootstrapping phase and start with a valid, buildable manifest.

---

## Design decisions

### Interactive by default

When running in a TTY without `--yes`, the command prompts for:
1. Plugin name (default: directory name)
2. Description
3. Target vendors (multi-select: `claude-code`, `cursor`, `codex`, `copilot-cli`)

Non-interactive mode (piped, `--yes`, or `--format json/agent`) uses flags and defaults without prompting.

### Safe by default — does not overwrite

If `.plugin/plugin.json` already exists, `init` exits with an error and a hint to use `--force`. This prevents accidental overwrites.

### `--force` overwrites existing manifest

With `--force`, the existing `.plugin/plugin.json` is replaced. No other files are touched.

### Directory scaffolding is opt-in

`--scaffold` creates the standard directory structure alongside the manifest:

```
.plugin/plugin.json
skills/
agents/
governances/
commands/
```

Without `--scaffold`, only `.plugin/plugin.json` is created.

### Vendor stubs in `vendorExtensions`

For each selected vendor, `init` writes a minimal stub under `vendorExtensions.<vendor>` so authors have a starting point for vendor-specific fields. Stubs contain only the fields required by that vendor's rules.

### Output

On success, lists the files created:

```
Created .plugin/plugin.json
Created skills/ agents/ governances/ commands/
```

With `--format json`:

```json
{
  "created": [".plugin/plugin.json", "skills/", "agents/", "governances/", "commands/"]
}
```

---

## Command surface

```
universal-plugin init [--name <name>] [--description <desc>] [--vendor <id>]...
               [--scaffold] [--force] [--yes]
               [--root <path>] [--format <format>]
```

**Exit codes:**
- `0` — scaffold created successfully
- `1` — `.plugin/plugin.json` already exists (without `--force`), or write error

**Gherkin scenarios:** `init.feature` (planned)
