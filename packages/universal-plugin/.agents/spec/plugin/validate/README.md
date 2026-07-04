---
spec-type: behavioral
concept: [canonical-manifest]
---

# plugin validate — check the canonical manifest

`universal-plugin plugin validate` checks the canonical `.plugin/plugin.json` against the shared
schema and each declared vendor's extra rules, without deriving any output. It reports **all**
violations at once so an author fixes them in one pass, and it is the check `plugin build` runs
eagerly before writing.

> **Spec-first / impl-deferred.** No `validate` command ships yet (`src/cli.ts` registers no
> `validate`, there is no `src/validate/` domain). This node is a frozen contract; the impl gate
> withholds certification until it is built. Its rules mirror the vendor-rule and schema checks
> `plugin build` already enforces at build time.

## Use Cases

**Subject** — checking the canonical manifest without deriving output:

- **Valid manifest passes** — a well-formed canonical manifest exits 0.
- **Schema violations are reported together** — a missing required field (e.g. `name`, `version`)
  fails and names every violation, not just the first.
- **Vendor rules are enforced** — vendor-specific requirements (codex requires `description` and
  `version`) are checked; `--vendor <id>` limits the vendor-rule check to one vendor; an unknown
  `--vendor` value fails.
- **Unknown vendor keys warn, `--strict` escalates** — an unknown `vendorExtensions` key warns and
  exits 0; `--strict` promotes the warning to an error (exit 1).
- **`--format json`** — returns a structured result (`valid`, `schemaViolations[]`,
  `vendorViolations[]`) for CI consumption.
- **Missing manifest fails** — no `.plugin/plugin.json` exits 1 with a clear message.

**Non-goals** — deriving vendor manifests (`plugin build`); scaffolding a project (`plugin init`);
fixing the manifest automatically (validate only reports).

Every scenario in [`validate.feature`](./validate.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **valid manifest passes** | well-formed manifest exits 0 (text + json) |
| **schema violations together** | missing name / version reported together; missing field messages |
| **vendor rules enforced** | codex description+version; `--vendor` scoping; unknown `--vendor` fails |
| **unknown keys warn / `--strict`** | unknown vendor key warns exit 0; `--strict` → exit 1 |
| **`--format json`** | structured `valid` / `schemaViolations` / `vendorViolations` output |
| **missing manifest fails** | no `.plugin/plugin.json` → exit 1 |
