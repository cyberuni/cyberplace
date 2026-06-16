# Validate Domain Spec

**Status:** Planned
**Commands:** `universal-plugin validate [--vendor <id>]`
**Governance:** [cli-command](../../governances/cli-command.md)

---

## What

The validate domain checks a canonical plugin manifest (`.plugin/plugin.json`) for correctness. It validates the manifest against the shared JSON schema and, optionally, against vendor-specific rules for one or all declared vendors. All violations are reported before exit — validation never short-circuits on the first error.

---

## Why

`universal-plugin build` validates before writing, but authors need a way to check their manifest without triggering a build. Running validate in CI catches manifest drift early, before any output files are generated or deployed.

---

## Design decisions

### Validation is exhaustive

All violations are collected and reported together. The author sees the full picture in one pass — not one error at a time.

### Two validation layers

1. **Schema validation** — checks the canonical manifest against the shared JSON schema (`$schema` field or bundled schema). Catches missing required fields, wrong types, unknown top-level keys.
2. **Vendor rule validation** — checks vendor-specific requirements for each declared vendor in `vendorExtensions`. For example, `codex` requires `description` and `version`. Vendor rules run only when the vendor is declared in `vendorExtensions`.

### `--vendor` scopes vendor rules only

`--vendor <id>` limits vendor rule validation to that single vendor. Schema validation always runs regardless of `--vendor`. An unknown `--vendor` value is an error (exit 1).

### `--strict` promotes warnings to errors

Without `--strict`, unknown `vendorExtensions` keys and deprecated fields emit warnings (exit 0). With `--strict`, any warning becomes a violation and the process exits 1.

### Output format

Human-readable output lists violations grouped by layer:

```
Schema violations:
  [error] /name: required field missing

Vendor violations (codex):
  [error] /version: required by codex but not present
  [warning] /vendorExtensions/codex/foo: unknown field
```

With `--format json`, output is:

```json
{
  "valid": false,
  "schemaViolations": [
    { "severity": "error", "path": "/name", "message": "required field missing" }
  ],
  "vendorViolations": {
    "codex": [
      { "severity": "error", "path": "/version", "message": "required by codex but not present" }
    ]
  }
}
```

---

## Command surface

```
universal-plugin validate [--vendor <id>] [--strict] [--root <path>] [--format <format>]
```

**Exit codes:**
- `0` — manifest is valid (possibly with warnings)
- `1` — manifest not found, schema violation, or vendor rule violation; also when `--strict` and any warning present

**Gherkin scenarios:** `validate.feature` (planned)
