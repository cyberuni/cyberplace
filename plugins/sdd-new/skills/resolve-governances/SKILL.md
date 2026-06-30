---
name: resolve-governances
description: "Internal skill: the SDD governance-resolution engine. A self-contained .mts script that, for a touched file's artifact-type, resolves each production-chain role to its agent plus the resolved-actor bars it loads — matching governance candidates across the project's .agents/governances/ anchors, the matched plugin squad, and the sdd defaults. Run by the conductor (start-mission) and the cold spec/impl judges to load the right bars without hand-enumerating; not triggered by users directly."
user-invocable: false
metadata:
  internal: true
---

# Resolve Governances

The concrete engine for **SDD governance resolution** (`design/governance-resolution.md`). For a
touched file's **artifact-type** it resolves, per production-chain role, **which agent runs it** and
**which resolved-actor bars it loads** — matching governance candidates across the project's
`.agents/governances/` anchors, the matched plugin squad (from the project registry
`.agents/universal-plugin.json`), and the sdd defaults. The conductor and the cold judges run it so
they **never hand-enumerate** the bars. It carries a self-contained `.mts` script (the repo's
node-≥23.6 / no-deps convention).

## Run the resolution

```bash
node "<skill>/scripts/resolve-governances.mts" --root . --artifact-type <type>
```

- `--root` is the **project root** (default `.`) — the registry `.agents/universal-plugin.json` and
  the project governances `.agents/governances/` are derived from it.
- `--artifact-type <type>` emits the per-role **load plan** as JSON: each role carries its resolved
  `agent`, the `fixed` universal governances, and the resolved-actor `bars` (each a precedence-ordered
  candidate list, `direct-read` for project files / `harness-load` for `<plugin>:<name>` /
  `sdd:<name>` skills).
- `--path <file>` (no `--artifact-type`) consults the optional tiebreaker map
  `.agents/sdd/artifact-types.toml`; a no-match prints a classify-by-convention note.
- No `--artifact-type` and no `--path` → validates the registry is well-formed + unambiguous
  (`governance registry OK`, or per-line violations).

When `node` is absent, an agent performs the same resolution by hand: read the registry, match each
touched file's artifact-type to a squad, and resolve each role's agent + bars per the precedence in
`design/governance-resolution.md`.

## Boundaries

It owns no lifecycle state and writes nothing — it **names** what to load; the consuming agent loads
each ref (direct-read / harness-load) and composes per the precedence rule. Registry matching is
deterministic; **disambiguating** an artifact-type claimed by two plugins is the consumer's agentic
step, not the script's (the plan returns `status: needs-input` with the ambiguous plugins).
