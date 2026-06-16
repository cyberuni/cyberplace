# Prepare Domain Spec

**Status:** Planned
**Commands:** `universal-plugin prepare`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The prepare domain runs post-install setup for a plugin package. It copies or links runtime artifacts — governances, agent definitions, and other files — into the locations that agent runtimes expect. It is designed to be called from a package manager lifecycle hook (`postinstall`, `postpack`) and is safe to run multiple times (idempotent).

---

## Why

When a plugin is installed via a package manager, only the npm package files land on disk. Agent runtimes expect governances and other artifacts at specific paths that may differ from the package layout. Without a prepare step, plugin consumers must manually copy files or maintain fragile path references.

`universal-plugin prepare` automates this: it reads the plugin manifest, resolves the runtime artifacts declared there, and installs them to the correct locations.

See also: [project memory — plugin init/prepare mechanism](../../../memory/project_plugin_init_mechanism.md).

---

## Design decisions

### Idempotent by design

Running prepare multiple times produces the same result as running it once. Files are overwritten in place; no state is accumulated across runs.

### Manifest-driven

Prepare reads `.plugin/plugin.json` (or the vendor output if already built) to determine what to copy and where. It does not hard-code artifact paths.

### Artifact types

| Artifact | Source | Destination |
|---|---|---|
| Governances | `governances/<name>.md` in package | Project `governances/` or user `~/.agents/governances/` |
| Agent definitions | `agents/<name>.md` | Runtime-specific path |
| Skills | `skills/<name>/SKILL.md` | Runtime-specific path |

The destination scope defaults to `project`. Pass `--global` to install to user scope.

### `--vendor` limits setup to one runtime

Without `--vendor`, prepare sets up artifacts for all declared vendors. With `--vendor <id>`, only that vendor's expected paths are written.

### `--dry-run` previews without writing

Lists files that would be created or updated, with source → destination paths. Exits 0.

### Failure is partial — errors are collected

If one artifact fails to copy, prepare continues with the remaining artifacts and exits 1 after reporting all failures. Partial installation is better than no installation.

### Output

```
Copying governances/clean-architecture.md → .agents/governances/clean-architecture.md
Copying governances/screaming-architecture.md → .agents/governances/screaming-architecture.md
Done. 2 artifact(s) installed.
```

With `--format json`:

```json
{
  "installed": [
    { "src": "governances/clean-architecture.md", "dest": ".agents/governances/clean-architecture.md" }
  ],
  "failed": []
}
```

---

## Command surface

```
universal-plugin prepare [--vendor <id>] [--global] [--dry-run] [--verbose]
                   [--root <path>] [--format <format>]
```

**Exit codes:**
- `0` — all artifacts installed (or dry-run completed)
- `1` — manifest not found, or one or more artifacts failed to install

**Gherkin scenarios:** `prepare.feature` (planned)
