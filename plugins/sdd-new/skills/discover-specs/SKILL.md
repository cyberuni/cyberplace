---
name: discover-specs
description: "Internal skill: corpus/discovery's concrete frontmatter engine. A self-contained .mts script that scans the three SDD spec locations (.agents/spec, .agents/specs/<project>, <project-path>/.agents/spec), filters candidates by the lifecycle status shape, parses each spec.md's frontmatter ONLY, and emits a TOON list of the specs with their frontmatter. Used by the sdd gateway to scan statuses; not triggered by users directly."
user-invocable: false
metadata:
  internal: true
---

# Discover Specs

The concrete engine for **corpus/discovery** (`.agents/specs/sdd/corpus/discovery/`). It locates the
project specs in a repo and returns each one's frontmatter — **without reading any spec body** — so a
consumer (the **gateway**, corpus tooling) can route on `status` / `project-path` / `approval`
cheaply. It carries a self-contained `.mts` script (the repo's node-≥23.6 / no-deps convention).

## Recognition — location-bounded and shape-confirmed

A `spec.md` is a spec only when **both** hold (ADR-0017, narrowed — `sdd:lifecycle-governance`):

- **Location** — it sits at one of the three SDD spec locations:
  1. `.agents/spec/spec.md` — repo-root single-project
  2. `.agents/specs/<project>/spec.md` — repo-root multi-project
  3. `<project-path>/.agents/spec/spec.md` — a nested project (the `**` is the project-path, any depth)
- **Shape** — its frontmatter `status` is in the lifecycle enum (`draft | approved | implemented |
  deprecated`). A `spec.md` at a spec location with **no** lifecycle `status` is skipped (so the scan
  never grabs a stray file by accident); a status-bearing `spec.md` **outside** the three locations
  is not discovered.

## Run the scan

```bash
node "<skill>/scripts/discover-specs.mts" [--root .] [--format toon|json]
```

- Default `--root` is the current directory; default `--format` is **TOON** (the token-efficient
  tabular form the gateway scans).
- Emits one row per spec, sorted by folder slug, with columns
  `path,status,projectPath,approvals` — `path` is the spec's root-relative folder slug, `approvals`
  is the gate verdicts as `<gate>:<verdict>` pairs joined by `;`.
- `--format json` emits the same records as a flat JSON array for non-LLM consumers.

Example (TOON):

```
specs[2]{path,status,projectPath,approvals}:
  .agents/specs/aces,approved,plugins/aces,spec:approve
  .agents/specs/sdd,approved,plugins/sdd-new,spec:approve
```

When `node` is absent, an agent performs the same derivation by hand: scan the three spec locations,
keep each `spec.md` whose frontmatter `status` is in the enum, and read its frontmatter only.

## Boundaries

Frontmatter only — it never reads a spec body (that is `digest`), owns no lifecycle state, and writes
nothing. Name resolution over the returned list (matching a name to a folder slug, disambiguating)
is the **caller's** step, not the script's.
