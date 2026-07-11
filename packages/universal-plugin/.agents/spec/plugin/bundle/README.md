---
spec-type: behavioral
concept: [release, axi]
---

# plugin bundle — materialize the release form

`universal-plugin plugin bundle` produces the **release form** of a plugin's skills: it rewrites the
`npx <cli>@<version>` references a skill carries so each **workspace** CLI is pinned to the version in
its own local `packages/<pkg>/package.json`. It is the release-time counterpart to
[`plugin build`](../build/README.md) — where `build` derives the dev-consumable form (vendor
manifests) and runs constantly in dev, `bundle` runs at release (`changeset version` / publish), when
the version being shipped is finally decided.

Resolving from the **workspace**, not a registry, is the crux. At `changeset version` time the new
version has been bumped locally but not yet published, so a registry lookup pins to the *old*
published version — off by one, every release. The just-bumped local `package.json` is the single
source of truth for the version being shipped, so `bundle` reads it directly and pins to exactly that
version (no same-major reasoning, no `--allow-major` — the workspace version is authoritative, not a
newest-in-range guess).

Two references are deliberately left alone: a skill whose version strings are **documentation** (the
`upgrade-universal-plugin` meta-skill uses `@<version>` / `@1.2.3` as *illustration*) is marked
**pin-exempt** and never rewritten; a pin for an **external** package with no workspace entry
(`gherkin-cli`, a separate repo) has no local version to resolve and is skipped. Both distinctions are
mechanical, so a documented example can never be flattened into a concrete pin and a foreign package is
never guessed at.

Follows the AXI output contract ([../../axi/](../../axi/README.md)).

## Use Cases

**Subject** — rewriting the plugin's own skill pins to the shipping workspace versions at release,
output per the AXI contract:

- **Rooted at a plugin project** — `bundle` operates on a plugin project rooted at `.plugin/plugin.json`;
  a missing manifest fails loud (exit 1), like `build`.
- **Pin from workspace** — `bundle` scans the plugin's skills for `npx <pkg>@<pin>` references and, for
  each package that exists in the workspace, rewrites the pin to that package's local
  `packages/<pkg>/package.json` version. A placeholder pin (`@<version>`) on a workspace CLI resolves
  the same way. Resolution is from the workspace only — **no network** — so the pin matches the version
  being shipped, not whatever the registry last published.
- **Idempotent** — a pin already at the workspace version is left unchanged (status `unchanged`).
- **Best-effort on a broken workspace entry** — a referenced workspace package whose local
  `package.json` version is missing or unreadable is a warning (stderr) that **skips that package**;
  `bundle` still exits 0.
- **Doc-example ignore** — a skill declared **pin-exempt** (its version strings are illustration, not
  real invocations) is never rewritten, even when the referenced package is a workspace CLI and even
  for concrete-looking pins; no pins row is emitted for a package inside a pin-exempt skill.
- **External pins skipped** — a pin for a package with **no workspace entry** is left untouched with
  status `skipped`; there is no local version to resolve and `bundle` never falls back to guessing.
- **Version-map artifact** — alongside the skill rewrites, `bundle` writes `<root>/.plugin/pins.json`,
  a flat `{ "<package>": "<resolvedVersion>" }` map of the workspace-resolved pins (`pinned` +
  `unchanged`), so a bundled plugin's skills can read the shipped version programmatically — e.g. an
  init skill via `${CLAUDE_PLUGIN_ROOT}/.plugin/pins.json` — instead of scraping rewritten prose.
  External/`skipped` packages are excluded (no authoritative workspace version).
- **`--dry-run`** — resolves and reports the pins without writing them (neither the skill files nor
  `.plugin/pins.json`).
- **AXI output** — `bundle` prints a TOON pins section to stdout, one row per package
  (`package, current, resolved, status` where status ∈ `pinned | unchanged | skipped`), plus a
  pre-computed aggregate `pinned N, unchanged M, skipped K`; `--format json` returns a `pins` array;
  `--format toon` names the default; a large pins list truncates with a `--full` escape; no pins found
  is a definitive empty state (`pinned 0`, stderr "nothing to bundle"). A successful run ends with a
  next-step suggestion; `bundle` never prompts; an unknown flag fails loud; `--help` documents the
  flags with a synopsis and one example.

**Non-goals** — deriving vendor manifests ([`plugin build`](../build/README.md) owns that; `bundle`
does not rewrite the `.plugin/plugin.json` manifest or the vendor outputs — its only writes are the
skill pins plus the generated `.plugin/pins.json` sibling); resolving pins against a
**registry** (that was `build`'s old model — off by one at release — and is retired, not moved here);
crossing a major boundary or styling ranges (the workspace version is taken verbatim); the **builder
automation** that runs `build` on edit and guards the committed form (a separate concern); the root
`package.json` `version`-script wiring that *invokes* `bundle` at `changeset version` (release-flow
glue, not this command's behavior); updating `universal-plugin`'s own pin across a project's hook files
(`self-update`, part of the sync engine destined to leave this package). Refreshing **stale prose** in
other plugins' skills is a content change, not a `bundle` behavior.

Every scenario in [`bundle.feature`](./bundle.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **rooted at a plugin project** | missing `.plugin/plugin.json` fails loud (exit 1) |
| **pin from workspace** | workspace CLI pinned to local `package.json` version; placeholder resolves; workspace wins over a newer registry; no network |
| **idempotent** | pin already at the workspace version → `unchanged` |
| **best-effort broken entry** | unreadable workspace `package.json` warns + skips, exit 0 |
| **doc-example ignore** | pin-exempt skill never rewritten (concrete or placeholder, workspace or not); no pins row |
| **external pins skipped** | no workspace entry → left untouched, status `skipped` |
| **version-map artifact** | writes `.plugin/pins.json` (workspace-resolved `{pkg: version}`); excludes external/`skipped`; `--dry-run` skips it |
| **`--dry-run`** | reports resolved pins without writing (skill files or `.plugin/pins.json`) |
| **TOON pins + aggregate (#1,#2,#4)** | pins rows (`package, current, resolved, status`) + `pinned N` aggregate |
| **`--format json` / `--format toon`** | JSON `pins` array; `--format toon` names the default |
| **truncation / `--full`** | large list truncates with a hint; `--full` shows all |
| **definitive empty state (#5)** | no pins → exit 0, `pinned 0`, stderr "nothing to bundle" |
| **next-step / no-prompt / fail-loud / help (#9,#6,#10)** | `→` next-step; never prompts; unknown flag exits 1; `--help` synopsis + flags + example |
