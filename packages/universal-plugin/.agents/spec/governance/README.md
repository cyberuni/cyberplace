---
spec-type: behavioral
concept: [governance]
---

# governance — resolve governance documents by name

`universal-plugin governance show <name>` and `governance list` let an agent reference a governance
document by **name** rather than a fragile filesystem path. Names resolve across a fixed scope
precedence, so the same reference works whether the document ships in the package, is installed at the
user or project level, or is pinned by an OS-managed policy.

## Use Cases

**Subject** — resolving and listing governance documents by name across scopes:

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
- **`--format json`** — both verbs emit structured output (`show` → `{scope, content}`; `list` → an
  array of `{name, scope}`).

**Non-goals** — authoring or editing governance documents; installing governance into a scope (the
`cyberplace` package / the asset-store sync engine); the `plugin` manifest verbs.

Every scenario in [`governance.feature`](./governance.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **scope precedence (plain name)** | project / local / user / package resolution; project > local > user precedence |
| **namespaced store scope** | `<plugin>/<asset>` resolves from the asset-store when no override scope has it |
| **not found** | absent name → exit 1 with the not-found message |
| **list by name and scope** | list enumerates; dedup highest-scope-wins; alphabetical; package defaults fallback |
| **`--format json`** | structured `show` object and `list` array |
