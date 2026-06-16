# Build Domain Spec

**Status:** Implemented
**Commands:** `universal-plugin build [--vendor <id>]`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The build domain compiles a canonical plugin manifest (`.plugin/plugin.json`) into one vendor-specific output file per target vendor. Each output file is written to the vendor's expected location and format, with vendor-specific fields merged in from `vendorExtensions`.

---

## Why

Each AI agent runtime expects its plugin manifest at a different path and with different fields. Maintaining one manifest file per vendor is error-prone: shared fields (name, description, skills) diverge over time, and updating one vendor requires remembering to update all others.

`universal-plugin build` solves this by treating `.plugin/plugin.json` as the single source of truth. Vendor-specific fields live under `vendorExtensions.<vendor>` in the canonical manifest and are merged at build time. Consumers only maintain one file; the CLI generates the rest.

---

## Design decisions

### Canonical manifest format

The canonical manifest at `.plugin/plugin.json` contains:
- Shared fields (`name`, `version`, `description`, `skills`, …)
- A `vendorExtensions` object mapping vendor IDs to vendor-specific fields
- An optional `$schema` field for editor support

At build time, `vendorExtensions` and `$schema` are stripped from the output. The vendor-specific fields from `vendorExtensions.<vendor>` are merged over the canonical fields (vendor wins on conflict).

### Vendor output paths

| Vendor | Output path |
|---|---|
| `claude-code` | `.claude-plugin/plugin.json` |
| `cursor` | `.cursor-plugin/plugin.json` |
| `codex` | `.codex-plugin/plugin.json` |
| `copilot-cli` | `plugin.json` |

### Validation is eager

Manifest validation runs before any files are written. If validation fails, nothing is written and the process exits with an error listing all violations. This prevents partial builds.

### Vendor-specific required fields

Some vendors impose additional requirements beyond the shared schema:
- **codex**: requires `description` and `version` (enforced at validation time)

### Unknown vendors are warned, not errored

An unknown vendor key in `vendorExtensions` emits a warning and is skipped rather than failing the build. This allows a manifest to carry future vendor extensions without breaking current builds.

### `--vendor` filters output

`--vendor <id>` restricts the build to a single vendor. The vendor must be declared in `vendorExtensions`; if not, the build fails with an error.

### `--dry-run` skips writes

With `--dry-run`, the build resolves vendors and validates but does not write any files. Useful for CI checks.

### `--clean` removes stale output

With `--clean`, any existing output file for a vendor is deleted before writing the new one. Without `--clean`, the file is overwritten in place.

---

## Command surface

```
universal-plugin build [--vendor <id>] [--dry-run] [--clean] [--verbose] [--root <path>] [--format <format>]
```

**Exit codes:**
- `0` — build succeeded (possibly with warnings)
- `1` — manifest not found, validation failed, or unknown `--vendor`

**Gherkin scenarios:** [build.feature](./build.feature)
