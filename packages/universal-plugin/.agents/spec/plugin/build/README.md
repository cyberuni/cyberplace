---
spec-type: behavioral
concept: [canonical-manifest]
---

# plugin build — derive per-vendor manifests

`universal-plugin plugin build` compiles the canonical `.plugin/plugin.json` into one vendor-specific
manifest per target vendor. Each vendor expects its manifest at a different path and shape;
maintaining one file per vendor lets shared fields drift. Build treats the canonical manifest as the
single source of truth and generates the rest, merging each vendor's `vendorExtensions.<vendor>`
fields over the shared fields (vendor wins on conflict) and stripping `vendorExtensions` + `$schema`
from the output.

## Use Cases

**Subject** — deriving vendor manifests from one canonical manifest:

- **Derive all declared vendors** — with no filter, `plugin build` writes one manifest per vendor
  declared in `vendorExtensions` (`claude-code` → `.claude-plugin/plugin.json`, `cursor` →
  `.cursor-plugin/plugin.json`, `codex` → `.codex-plugin/plugin.json`, `copilot-cli` → `plugin.json`).
- **Merge then strip** — vendor-specific fields from `vendorExtensions.<vendor>` are merged over the
  shared fields; `vendorExtensions` and `$schema` never appear in output.
- **`--vendor` filters** — restricts the build to one declared vendor; a vendor not in
  `vendorExtensions` fails.
- **Validation is eager** — the manifest is validated before any file is written; codex requires
  `description` and `version`; a failure writes nothing and exits non-zero. A missing
  `.plugin/plugin.json` fails.
- **Unknown vendors warn, not error** — an unknown vendor key in `vendorExtensions` is warned and
  skipped; no `vendorExtensions` at all warns "nothing to build" and writes nothing, exit 0.
- **`--dry-run` / `--clean`** — `--dry-run` resolves and validates but writes nothing; `--clean`
  removes an existing output file before rewriting it.

**Non-goals** — checking a manifest without deriving output (`plugin validate`); scaffolding a new
project (`plugin init`); publishing or installing manifests (the `cyberplace` package).

Every scenario in [`build.feature`](./build.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **derive all declared vendors** | builds all declared vendors; correct per-vendor output paths |
| **merge then strip** | vendor fields merged; `vendorExtensions` + `$schema` stripped |
| **`--vendor` filters** | filter to one vendor; undeclared `--vendor` fails |
| **eager validation** | missing manifest fails; codex requires description + version |
| **unknown vendors warn** | unknown vendor key skipped with warning; no vendorExtensions → nothing to build |
| **`--dry-run` / `--clean`** | dry-run writes nothing; clean removes stale output before rewrite |
