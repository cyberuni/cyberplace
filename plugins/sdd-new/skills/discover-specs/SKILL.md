---
name: discover-specs
description: "Internal skill: corpus/discovery's concrete frontmatter engine. A self-contained .mts script that scans the three SDD spec locations (.agents/spec, .agents/specs/<project>, <project-path>/.agents/spec), filters candidates by the lifecycle status shape, parses each spec.md's frontmatter ONLY, and emits a TOON list of the specs with their project name + name-source, status, project-path, and approvals; --resolve <name> filters to the exact name matches. Used by the sdd gateway to scan statuses and by start-mission to locate the project spec; not triggered by users directly."
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
node "<skill>/scripts/discover-specs.mts" [--root .] [--format toon|json] [--resolve <name>]
```

- Default `--root` is the current directory; default `--format` is **TOON** (the token-efficient
  tabular form the gateway scans).
- Emits one row per spec, sorted by folder slug, with columns
  `path,name,nameSource,status,projectPath,approvals` — `path` is the spec's root-relative folder
  slug; `name` is the project name and `nameSource` is `declared | derived | guessed` (below);
  `approvals` is the gate verdicts as `<gate>:<verdict>` pairs joined by `;`.
- `--resolve <name>` filters to the **exact (case-insensitive) name matches** — 0 rows = none,
  1 = resolved, >1 = ambiguous (the consumer disambiguates with the user).
- `--format json` emits the same records as a flat JSON array for non-LLM consumers.

Example (TOON):

```
specs[2]{path,name,nameSource,status,projectPath,approvals}:
  .agents/specs/aces,aces,derived,implemented,plugins/aces,spec:approve;impl:approve
  .agents/specs/sdd,sdd,derived,approved,plugins/sdd-new,spec:approve
```

**`name-source`** flags how trustworthy the name is: **`declared`** (frontmatter `name`,
authoritative), **`derived`** (repo-root single-project → `repo`; a `.agents/specs/<project>` folder
names itself), **`guessed`** (a nested project's folder basename — confirm with the user before
relying on it).

When `node` is absent, an agent performs the same derivation by hand: scan the three spec locations,
keep each `spec.md` whose frontmatter `status` is in the enum, read its frontmatter only, and derive
the name per the rules above.

## Boundaries

Frontmatter only — the script reads the whole file but its **output** carries no body content, so a
consuming agent never spends tokens on a body (`digest` reads bodies; this never does). It owns no
lifecycle state and writes nothing. The script resolves a name **deterministically** (exact match →
spec, or the candidate set); **disambiguating with the user** is the consumer's agentic step, not the
script's.
