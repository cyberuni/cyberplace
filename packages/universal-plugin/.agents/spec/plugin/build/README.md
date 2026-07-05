---
spec-type: behavioral
concept: [canonical-manifest, axi]
---

# plugin build — derive per-vendor manifests

> **Impl trails the AXI contract.** The shipped `plugin build` predates the AXI adoption (ADR-0003):
> it emits human prose + `--format json`, not the frozen TOON default / aggregate / next-step /
> fail-loud behavior. The derivation logic (merge, strip, vendor filtering, eager validation) is
> live and correct; only the AXI output surface is unbuilt. The impl gate withholds certification
> until a follow-up mission re-implements it against this frozen suite.

`universal-plugin plugin build` compiles the canonical `.plugin/plugin.json` into one vendor-specific
manifest per target vendor. Each vendor expects its manifest at a different path and shape;
maintaining one file per vendor lets shared fields drift. Build treats the canonical manifest as the
single source of truth and generates the rest, merging each vendor's `vendorExtensions.<vendor>`
fields over the shared fields (vendor wins on conflict) and stripping `vendorExtensions` + `$schema`
from the output.

Build also **resolves the shared-CLI version pins** the plugin's own skills reference: a skill that
invokes a shared tool with `npx <cli>@<version>` carries a pin that goes stale. Build detects those
pins, resolves each package's current version from the registry, and rewrites them in place — the same
derive-from-source-of-truth move applied to the tool versions the plugin depends on, not just the
manifest.

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

**Subject (pin resolution)** — refreshing the `npx <cli>@<version>` pins the plugin's skills carry, as
a build step:

- **Detect referenced CLIs** — build scans the plugin's skills for `npx <pkg>@<pin>` references and
  resolves every referenced package; `--package <name>` (repeatable) limits resolution to the named
  CLI(s), leaving the rest untouched.
- **Resolve within the current major** — for each package, build resolves the newest published version
  **within the current pin's major** from the registry (default `https://registry.npmjs.org`,
  overridden by `--registry <url>`); `--allow-major` lets it cross a major boundary; a placeholder pin
  (e.g. `@<version>`) resolves to the absolute latest.
- **Pin style** — the written pin defaults to an exact pin; `--range tilde` / `--range caret` write a
  `~`/`^`-prefixed range instead (`~`/`^` accepted as `--range` aliases).
- **Write in place, idempotent** — build rewrites the resolved pins in the skill files; a pin already
  at the resolved version is left unchanged. `--dry-run` resolves and reports without writing;
  `--skip-pins` skips pin resolution entirely (manifests only).
- **Best-effort, offline-safe** — pin resolution is resilient: an unreachable registry or an
  unresolvable package is a warning (stderr) that **skips that package**; the build still derives its
  manifests and exits 0. Only packages actually referenced are fetched.
- **AXI output** — a build with pins adds a TOON pins section to stdout, one row per package
  (`package, current, resolved, status` where status ∈ `updated | unchanged | skipped`), plus a
  pre-computed aggregate `pinned N, unchanged M, skipped K`; `--format json` adds a `pins` array; a
  large pins list truncates with a `--full` escape; no pins found is a definitive empty state
  (`pinned 0`). `--help` documents the pin flags.

**Non-goals** — checking a manifest without deriving output (`plugin validate`); scaffolding a new
project (`plugin init`); publishing or installing manifests (the `cyberplace` package); the shared
output-contract mechanics themselves ([`../../axi/`](../../axi/README.md) owns those). Pin resolution
here rewrites the **plugin's own skill pins** at build time; updating `universal-plugin`'s own version
pin across a project's **hook files** is a separate concern (`self-update`, part of the cross-vendor
sync engine destined to leave this package — root `spec.md` placement map), not this build step.

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
| **resolve referenced CLIs** | scans skills for `npx <pkg>@<pin>`; rewrites to the resolved version |
| **same-major bound / `--allow-major`** | newest in current major by default; `--allow-major` crosses; placeholder → absolute latest |
| **`--range` style** | exact (default), tilde, caret written pins |
| **`--registry` / `--package`** | registry override; limit resolution to named CLI(s) |
| **idempotent / `--skip-pins` / `--dry-run`** | already-pinned = unchanged; skip-pins skips; dry-run reports without writing |
| **best-effort, offline-safe** | registry failure warns + skips that package, build still exits 0 |
| **pins TOON + aggregate + json + truncation** | pins rows (`package, current, resolved, status`) + `pinned N` aggregate; `--format json` `pins` array; large list truncates with `--full`; `pinned 0` empty state |
