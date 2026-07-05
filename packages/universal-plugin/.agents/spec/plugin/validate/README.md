---
spec-type: behavioral
concept: [canonical-manifest, axi]
---

# plugin validate — check the canonical manifest

Follows the AXI output contract ([../../axi/](../../axi/README.md)).

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

- **Valid manifest passes** — a well-formed canonical manifest exits 0 with a definitive `valid:
  true` TOON result (never blank output).
- **Default output is TOON** — with no `--format`, a result carries `valid` plus pre-computed
  `schemaViolations` / `vendorViolations` rows (`field, rule, message`) and their aggregate counts
  on stdout; `--format json` stays the structured escape hatch.
- **Schema violations are reported together** — a missing required field (e.g. `name`, `version`)
  fails and names every violation, not just the first.
- **Vendor rules are enforced** — vendor-specific requirements (codex requires `description` and
  `version`) are checked; `--vendor <id>` limits the vendor-rule check to one vendor; an unknown
  `--vendor` value fails.
- **Unknown vendor keys warn, `--strict` escalates** — an unknown `vendorExtensions` key warns
  (stderr) and exits 0; `--strict` promotes the warning to an error (exit 1) and to a violation row.
- **A large violation list truncates** — the default output truncates with a size hint (`… +N
  more — rerun with --full`); `--format json` and `--full` are never truncated.
- **`--format json`** — returns a structured result (`valid`, `schemaViolations[]`,
  `vendorViolations[]`) for CI consumption.
- **Missing manifest fails** — no `.plugin/plugin.json` exits 1 with a clear stderr message.
- **Next-step suggestions** — a passing run ends stderr with `→ universal-plugin plugin build`; a
  failing run ends stderr with a fix hint.
- **Content-first `plugin` group** — the bare `universal-plugin plugin` command (no subcommand)
  runs validate against the current project and reports live status plus the declared vendors.
- **Non-interactive** — validate never prompts; it reads the manifest and reports, agent-safe by
  default.
- **Fail-loud unknown flag** — an unrecognized flag (e.g. `--frobnicate`) exits 1 and stderr names it.
- **`--help`** — answers with a concise synopsis, flags, and one example, exit 0.

**Non-goals** — deriving vendor manifests (`plugin build`); scaffolding a project (`plugin init`);
fixing the manifest automatically (validate only reports).

Every scenario in [`validate.feature`](./validate.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **valid manifest passes** | well-formed manifest exits 0 with a definitive TOON `valid: true` result (text + json) |
| **default output is TOON** | schema/vendor violation rows + aggregate on stdout by default |
| **schema violations together** | missing name / version reported together on stdout |
| **vendor rules enforced** | codex description+version; `--vendor` scoping; unknown `--vendor` fails |
| **unknown keys warn / `--strict`** | unknown vendor key warns (stderr) exit 0; `--strict` → exit 1 + violation row |
| **truncation + `--full`** | large violation list truncates with a size hint; json/`--full` never truncate |
| **`--format json`** | structured `valid` / `schemaViolations` / `vendorViolations` output |
| **missing manifest fails** | no `.plugin/plugin.json` → exit 1, stderr message |
| **next-step suggestions** | passing → `plugin build` hint; failing → fix hint (stderr) |
| **content-first `plugin` group** | bare `plugin` runs validate, reports vendors |
| **non-interactive** | validate never prompts; agent-safe by default |
| **fail-loud unknown flag** | unrecognized flag → exit 1, stderr names it |
| **`--help`** | concise synopsis/flags/example, exit 0 |
