---
title: build
description: Generate vendor manifests from .plugin/plugin.json.
---

Read `.plugin/plugin.json`, validate it, and write a spec-conformant vendor manifest for each vendor declared in `vendorExtensions`.

## Usage

```
universal-plugin plugin build [options]
```

## Options

| Flag | Description |
|---|---|
| `--vendor <id>` | Build only the named vendor |
| `--dry-run` | Print what would be written without writing |
| `--verbose` | Print field-by-field transformation decisions |
| `--clean` | Delete generated manifests before building |
| `--root <path>` | Plugin root directory (default: current directory) |
| `--format json` | Output as JSON |

## Vendor identifiers

| `--vendor` | Output path |
|---|---|
| `claude-code` | `.claude-plugin/plugin.json` |
| `cursor` | `.cursor-plugin/plugin.json` |
| `codex` | `.codex-plugin/plugin.json` |
| `copilot-cli` | `plugin.json` (repo root) |

## Build steps

For each vendor key in `vendorExtensions`:

1. Start with all canonical open-plugin-spec fields from `.plugin/plugin.json`
2. Merge `vendorExtensions.<vendor>` fields (vendor fields win on conflict)
3. Drop component fields unsupported by the vendor (emits a warning)
4. Translate hook event names to vendor casing
5. Translate `${PLUGIN_ROOT}` / `${PLUGIN_DATA}` env vars
6. Enforce required fields (fails build on missing)
7. Write to the vendor output path

## Validation

The build fails (exit 1) if:

- `name` is missing
- `version` or `description` is missing when targeting `codex`
- `.plugin/plugin.json` does not exist at the plugin root
- `--vendor` names a vendor not in `vendorExtensions`

Unrecognized vendor keys in `vendorExtensions` emit a warning and are skipped.

## Examples

```bash
# Build all declared vendors
universal-plugin plugin build

# Build only Cursor
universal-plugin plugin build --vendor cursor

# Preview without writing
universal-plugin plugin build --dry-run --verbose

# Clean rebuild
universal-plugin plugin build --clean
```
