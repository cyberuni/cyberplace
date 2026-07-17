---
spec-type: behavioral
concept: [canonical-manifest, axi]
---

# plugin build — derive per-vendor manifests

`universal-plugin plugin build` compiles the canonical `.plugin/plugin.json` into one vendor-specific
manifest per target vendor. Each vendor expects its manifest at a different path and shape;
maintaining one file per vendor lets shared fields drift. Build treats the canonical manifest as the
single source of truth and generates the rest, merging each vendor's `vendorExtensions.<vendor>`
fields over the shared fields (vendor wins on conflict) and stripping `vendorExtensions` + `$schema`
from the output.

Build is the **dev-consumable** derivation — it runs constantly while authoring a plugin, is
deterministic, and needs no network. Managing the `npx <pkg>[@<spec>]` package dependencies a
plugin's skills invoke — resolving them and writing the versions being shipped — is a separate concern
that lives in [`plugin deps`](../deps/README.md), not here (root `spec.md` placement map). Build does
not touch those references.

Follows the AXI output contract ([../../axi/](../../axi/README.md)).

## Use Cases

**Subject** — deriving vendor manifests from one canonical manifest, output per the AXI contract:

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
  skipped; no `vendorExtensions` at all is a definitive empty state — exit 0, zero built rows.
- **`--dry-run` / `--clean`** — `--dry-run` resolves and validates but writes nothing; `--clean`
  removes an existing output file before rewriting it.
- **TOON by default, `--format json` escape hatch** — a successful build prints a TOON result to
  stdout, one row per vendor (`vendor, path, status`), plus a pre-computed aggregate summary
  (`built N, skipped M, failed K`); `--format json` returns the same shape as structured JSON;
  `--format toon` names the default explicitly.
- **Definitive empty state** — no `vendorExtensions` at all still emits a TOON result on stdout
  (zero built rows, aggregate `built 0`) with exit 0, plus "nothing to build" on stderr.
- **Next-step suggestion** — a successful build's stderr ends with
  `→ universal-plugin plugin validate`.
- **Fail-loud, no prompts, help** — an unknown flag exits 1 naming the flag; the command never
  prompts interactively; `--help` exits 0 with a concise synopsis, flags, and one example.

**Non-goals** — checking a manifest without deriving output (`plugin validate`); scaffolding a new
project (`plugin init`); publishing or installing manifests (the `cyberplace` package); the shared
output-contract mechanics themselves ([`../../axi/`](../../axi/README.md) owns those); **resolving or
rewriting the `npx <pkg>[@<spec>]` references a plugin's skills invoke** — that is the
[`plugin deps`](../deps/README.md) group's job, not a build step. Build derives manifests only.

Every scenario in [`build.feature`](./build.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **derive all declared vendors** | builds all declared vendors; correct per-vendor output paths |
| **merge then strip** | vendor fields merged; `vendorExtensions` + `$schema` stripped |
| **`--vendor` filters** | filter to one vendor; undeclared `--vendor` fails |
| **eager validation** | missing manifest fails; codex requires description + version |
| **unknown vendors warn** | unknown vendor key skipped with warning |
| **`--dry-run` / `--clean`** | dry-run writes nothing; clean removes stale output before rewrite |
| **TOON default + aggregate (#1,#2,#4)** | stdout TOON, one row per vendor (`vendor, path, status`), pre-computed `built/skipped/failed` summary |
| **`--format json` / `--format toon`** | JSON escape hatch with `built` array + counts; `--format toon` names the default |
| **definitive empty state (#5)** | no vendorExtensions → exit 0, TOON zero built rows + aggregate `built 0`, stderr "nothing to build" |
| **next-step suggestion (#9)** | successful build's stderr ends with `→ universal-plugin plugin validate` |
| **fail-loud unknown flag (#6)** | unknown flag exits 1, stderr names it |
| **`--help` (#10)** | exits 0, concise synopsis + flags + one example |
