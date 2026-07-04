---
spec-type: behavioral
concept: [governance, axi]
---

# governance — resolve governance documents by name

`universal-plugin governance show <name>` and `governance list` let an agent reference a governance
document by **name** rather than a fragile filesystem path. Names resolve across a fixed scope
precedence, so the same reference works whether the document ships in the package, is installed at the
user or project level, or is pinned by an OS-managed policy.

Follows the AXI output contract ([../../axi/](../../axi/README.md)).

## Use Cases

**Subject** — resolving and listing governance documents by name across scopes, output per the AXI
contract:

- **Scope precedence (plain name)** — `governance show <name>` searches, in order,
  `managed` → `project` (`<root>/governances/`) → `local` (`<root>/.agents/governances/`) → `user`
  (`~/.agents/governances/`) → `package` (the dir shipped in `universal-plugin`); the
  highest-precedence match wins and prints its content.
- **Namespaced lookup adds the store scope** — `governance show <plugin>/<asset>` checks the
  override scopes (`managed` → `project` → `user`), then the local **asset-store** (`store` scope) for
  the named plugin's installed asset.
- **Not found is a clean failure** — a name absent at every scope exits 1 with
  `Governance "<name>" not found`.
- **`list` enumerates by name and scope** — `governance list` lists every resolvable governance with
  its winning scope, de-duplicated by name (highest scope wins), sorted alphabetically; with no
  project/user governances it falls back to the package defaults.
- **TOON by default, `--format json` escape hatch** — `list` prints a TOON result to stdout, one row
  per governance (`name, scope`), plus a pre-computed aggregate (`N governances across C scopes`);
  `show` prints the document body; `--format json` returns the same structured shape (`show` →
  `{scope, content}`; `list` → an array of `{name, scope}`), never truncated.
- **Truncation + `--full`** — `show` truncates a large document body on stdout with a size hint
  (`… +N lines — rerun with --full`); `--full` suppresses truncation; small documents print in full
  either way.
- **Definitive empty state** — `list` with nothing resolvable at any scope, including package,
  prints `0 governances found` on stdout with exit 0.
- **Content-first** — bare `governance` with no subcommand runs `list`.
- **Next-step suggestions** — `show`'s stderr ends with `→ universal-plugin governance list`;
  `list`'s stderr ends with `→ universal-plugin governance show <name>`.
- **Fail-loud, no prompts, help** — an unknown flag exits 1 naming the flag; neither verb prompts
  interactively; `--help` exits 0 with a concise synopsis, flags, and one example.

**Non-goals** — authoring or editing governance documents; installing governance into a scope (the
`cyberplace` package / the asset-store sync engine); the `plugin` manifest verbs; the shared
output-contract mechanics themselves ([`../../axi/`](../../axi/README.md) owns those).

Every scenario in [`governance.feature`](./governance.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **scope precedence (plain name)** | project / local / user / package resolution; project > local > user precedence |
| **namespaced store scope** | `<plugin>/<asset>` resolves from the asset-store when no override scope has it |
| **not found** | absent name → exit 1 with the not-found message |
| **list by name and scope** | list enumerates; dedup highest-scope-wins; alphabetical; package defaults fallback |
| **`--format json`** | structured `show` object and `list` array |
| **TOON default + aggregate (#1,#2,#4)** | `list` stdout TOON, one row per governance (`name, scope`), pre-computed `N governances across C scopes` |
| **truncation + `--full` (#3)** | `show` truncates a large body with a size hint; `--full` untruncated; small docs and `--format json` never truncated |
| **definitive empty state (#5)** | `list` with nothing resolvable anywhere → exit 0, `0 governances found` |
| **content-first (#8)** | bare `governance` with no subcommand runs `list` |
| **next-step suggestion (#9)** | `show` → `→ universal-plugin governance list`; `list` → `→ universal-plugin governance show <name>` |
| **fail-loud unknown flag (#6)** | unknown flag exits 1, stderr names it |
| **`--help` (#10)** | exits 0, concise synopsis + flags + one example |
