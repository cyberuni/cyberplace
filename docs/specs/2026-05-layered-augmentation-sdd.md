# SDD: Layered Agent Instruction Augmentation (LAIA)

**Status:** Draft  
**Authors:** unional  
**Date:** 2026-05-30  
**Scope:** cyber-skills repo + open spec proposal to agentskills / open-plugin-spec

---

## 1. Problem Statement

Agent skill instructions today come from a single source: the `SKILL.md` file shipped with a package. Real deployments need multiple stakeholders to customize those instructions without modifying the shipped artifact:

- A user wants personal workflow tweaks applied everywhere.
- A project team wants shared conventions checked into the repo.
- An organization needs compliance rules that cannot be disabled.
- A developer needs local experiments that stay gitignored.
- A monorepo sub-package needs to specialize a root-level project override.

There is no specified model for how these sources combine, what order they apply in, or how conflicts are resolved. Each tool (Claude Code, Cursor, Codex) invents its own convention independently, creating fragmentation.

---

## 2. Goals

- **G1** — Define a named, ordered set of augmentation layers covering all common deployment contexts.
- **G2** — Specify a file-discovery algorithm that agents can implement without configuration.
- **G3** — Specify merge semantics for each kind of content (frontmatter fields, markdown sections).
- **G4** — Provide a lock mechanism so high-authority layers can prevent override.
- **G5** — Ship a governance document agents load on demand via `governance show`.
- **G6** — Ship a `skill resolve` CLI command for developer debugging.
- **G7** — Publish an open spec proposal targeting agentskills and open-plugin-spec.

## 3. Non-Goals

- **NG1** — Cryptographic signing or tamper-detection for org layers (out of scope; policy problem).
- **NG2** — DAG `extends` chains between shared packages. Linear resolution only in v1.
- **NG3** — LLM-mediated merge for conflicting prose (too expensive, non-deterministic).
- **NG4** — Runtime hot-reload of augmentation changes during an agent session.
- **NG5** — Any layer other than the seven defined below.

---

## 4. Terminology

| Term | Definition |
|---|---|
| **Base skill** | The `SKILL.md` file shipped with the package; lowest-priority content source |
| **Augmentation** | Any layer file that modifies the base skill or a lower-priority augmentation |
| **Layer** | One source of skill content at a defined scope |
| **Scope** | The deployment context a layer belongs to (user, org, project, etc.) |
| **Resolution** | The algorithm that merges all applicable layers into one effective skill |
| **Effective skill** | The fully merged result the agent reads |
| **Lock** | A declaration in a layer that prevents higher-scoped layers from overriding a section |
| **Heading** | A markdown `##` or `###` section; the unit of section-level merge |

---

## 5. Layer Model

### 5.1 Layer enumeration

Seven layers, ordered from lowest to highest priority. Higher priority wins on conflict unless locked.

| # | Name | Authority | Example path |
|---|---|---|---|
| 1 | `built-in` | Tool vendor | shipped defaults, implicit |
| 2 | `user` | Machine owner | `~/.agents/skills/{name}/SKILL.md` |
| 3 | `shared` | Package author | installed package skill file |
| 4 | `org` | Administrator | env var or well-known path |
| 5 | `project` | Repo maintainers | `.agents/skills/{name}/SKILL.md` at repo root |
| 6 | `workspace` | Sub-package team | `.agents/skills/{name}/SKILL.md` at sub-package root |
| 7 | `local` | Individual dev | `SKILL.local.md` alongside effective layer file |

> **Rationale for org below project (layers 4 < 5):** org sets baseline compliance requirements; project teams know domain-specific steps the org layer cannot anticipate. Org rules that must survive project override use the lock mechanism (§6.3).

### 5.2 File naming convention

Every layer except `local` uses `SKILL.md` as the filename, with scope determined by directory location.

The `local` scope uses the `.local.md` suffix alongside whichever layer is topmost in the discovery walk, so it can augment any scope without a separate directory.

```
~/.agents/skills/commit-work/SKILL.md          # user
<repo-root>/.agents/skills/commit-work/SKILL.md      # project
<sub-pkg>/.agents/skills/commit-work/SKILL.md        # workspace
<any-dir>/.agents/skills/commit-work/SKILL.local.md  # local (gitignored)
```

### 5.3 Backward compatibility

Existing `SKILL.project.md` and `SKILL.local.md` co-located with the base `SKILL.md` are treated as `project` and `local` scope respectively. This preserves the current convention used by cyber-skills. Agents SHOULD support both forms; CLI tooling SHOULD prefer the directory-scoped form for new augmentations.

---

## 6. File Discovery

### 6.1 Algorithm (linear walk)

Given a skill name and a working directory:

1. Collect **base**: find the installed `SKILL.md` for the skill (npm package, `npx` cache, or `skills/` folder).
2. Collect **user**: check `~/.agents/skills/{name}/SKILL.md`.
3. Collect **shared**: the installed package file itself is the shared layer (same as base unless a shared augmentation package is installed — reserved for v2).
4. Collect **org**: read path from env var `AGENTS_ORG_PATH`; if absent, check `/etc/agents/skills/{name}/SKILL.md` (POSIX) or `%PROGRAMDATA%\agents\skills\{name}\SKILL.md` (Windows).
5. Collect **project**: starting from CWD, walk up to git root; at each level check `.agents/skills/{name}/SKILL.md`. Use the deepest match as project layer.
6. Collect **workspace**: if CWD is inside a monorepo sub-package (detected by presence of `package.json` or `pyproject.toml` below git root), check `.agents/skills/{name}/SKILL.md` in that sub-package root. This is distinct from project only when sub-package root ≠ git root.
7. Collect **local**: check for `SKILL.local.md` alongside the highest-priority non-local layer found so far; also check `SKILL.local.md` alongside the base.

Missing layers are silently skipped. Order of collected layers: `[built-in, user, shared, org, project, workspace, local]` with absent layers removed.

### 6.2 Remote org layer

When `AGENTS_ORG_PATH` is a URL (`https://`):

- Fetch with a 5-second timeout; cache locally with a 24-hour TTL.
- On fetch failure, use cached copy. On cache miss + failure, skip the org layer and emit a warning.
- Cache path: `~/.cache/agents/org-skills/{name}/SKILL.md`.

---

## 7. Resolution Algorithm

### 7.1 Overview

Apply layers in order (1 → 7). Each layer is applied as a diff against the accumulated result of all prior layers.

```
effective = base
for each layer in [user, shared, org, project, workspace, local]:
    effective = merge(effective, layer)
return effective
```

### 7.2 Frontmatter field merge

| Field type | Default strategy | Override with |
|---|---|---|
| `string` (`name`, `description`) | Replace | `fields.{key}.strategy: append` |
| `array` (`triggers`, `tags`) | Union (deduplicate) | `fields.{key}.strategy: replace` |
| `boolean` | Last-wins | — |
| `object` (nested map) | Deep merge | `fields.{key}.strategy: replace` |

The `name` field is never merged — it is always taken from the base skill.

### 7.3 Markdown section merge

The unit of section merge is a top-level `##` heading. Nested `###` headings are treated as part of their parent `##` section.

**Default:** a section present in the augmenting layer **replaces** the same-named section in the accumulated result.

**Append / prepend:** declared in the augmenting layer's frontmatter:

```yaml
sections:
  Steps:
    strategy: append   # or prepend
```

- `append` — augmenting layer's section content added after accumulated content.
- `prepend` — added before.

**New sections:** if the augmenting layer introduces a heading not present in the accumulated result, it is appended to the end of the effective skill body.

**Removed sections:** if the augmenting layer includes `remove: true` under a section entry, the section is deleted from the accumulated result:

```yaml
sections:
  Troubleshooting:
    remove: true
```

### 7.4 Conflict semantics

Natural language sections can produce contradictory instructions when combined. The resolution algorithm makes no semantic judgement — it is the augmentation author's responsibility to avoid contradictions. Tooling (§10.4) surfaces conflicts for human review; it does not resolve them automatically.

---

## 8. Lock Mechanism

A layer may declare a section locked. A locked section in layer N cannot be replaced, appended to, prepended to, or removed by any layer with priority > N.

```yaml
sections:
  Compliance:
    locked: true
```

Lock is NOT transitive — locking in the `user` layer prevents `project` from overriding it, but `org` (priority 4) can still override it because `org` > `user` (priority 2). Lock direction is: no layer with *higher* index may modify it.

**Org-enforced lock pattern:** org layer (priority 4) locks a section. Project (5), workspace (6), and local (7) cannot modify it. User (2) is below org and also cannot override an org section regardless of lock — priority alone handles that.

---

## 9. Frontmatter Schema Extensions

New fields added to `SKILL.md` frontmatter (all optional):

```yaml
# Explicit scope declaration (informational; overrides inferred scope in tooling display)
scope: project

# Per-field merge strategy overrides
fields:
  triggers:
    strategy: replace   # override array default of union

# Per-section configuration
sections:
  Steps:
    strategy: append    # append | prepend | replace (default)
    locked: true        # prevent higher-scope layers from modifying
  Troubleshooting:
    remove: true        # remove this section from accumulated result
```

These fields are only meaningful in augmentation layer files. A base `SKILL.md` may declare `sections.{name}.locked: true` to lock a section against any augmentation.

---

## 10. Deliverables

### D1 — Governance: `skill-augmentation-layers`

**Type:** Governance document  
**Location:** `governances/skill-augmentation-layers.md`  
**Loaded via:** `cyber-skills governance show skill-augmentation-layers`

Normative, agent-facing version of §§5–8. Dense, no rationale prose. Sections: Layer Model, File Discovery, Resolution Algorithm, Frontmatter Schema. Cross-references `skill-design` governance.

---

### D2 — CLI: `skill resolve`

**Type:** Code + CLI command  
**Location:** `src/skill/resolve.ts`, registered in `src/cli.ts`  
**Command:** `cyber-skills skill resolve <skill-name> [--dir <path>] [--json]`

Outputs the effective skill with provenance annotations. Each section is annotated with which layer it came from.

**Text output (default):**
```
## Steps                [source: project (.agents/skills/commit-work/SKILL.md)]
...section content...

## Compliance          [source: org (/etc/agents/skills/commit-work/SKILL.md) 🔒]
...section content...
```

**JSON output (`--json`):**
```json
{
  "name": "commit-work",
  "layers": ["base", "org", "project", "local"],
  "sections": [
    { "heading": "Steps", "source": "project", "locked": false, "content": "..." },
    { "heading": "Compliance", "source": "org", "locked": true, "content": "..." }
  ]
}
```

---

### D3 — CLI: `skill layers`

**Type:** Code + CLI command  
**Location:** `src/skill/layers.ts`  
**Command:** `cyber-skills skill layers <skill-name> [--dir <path>]`

Lists all discovered layer files without merging. Useful for diagnosing which files are being found.

```
commit-work  layers discovered:
  1 built-in   (none)
  2 user        ~/.agents/skills/commit-work/SKILL.md
  3 shared      ~/.npm/_npx/.../skills/commit-work/SKILL.md
  4 org         (none — AGENTS_ORG_PATH not set)
  5 project     /repo/.agents/skills/commit-work/SKILL.md
  6 workspace   (none — not in a sub-package)
  7 local       /repo/.agents/skills/commit-work/SKILL.local.md
```

---

### D4 — Resolution library

**Type:** Code  
**Location:** `src/skill/augment.ts` (new), used by D2, D3, and D5

Implements:
- `discoverLayers(skillName, cwd)` → ordered `Layer[]`
- `resolveSkill(layers)` → `EffectiveSkill`
- `parseSections(markdown)` → `Section[]`
- `mergeSections(base, augment, config)` → `Section[]`

Pure functions; no I/O. Discovery I/O lives in `src/skill/resolve.ts`.

---

### D5 — Audit validation: augmentation cross-check

**Type:** Code  
**Location:** `src/audit/validate.ts` (update existing)

Add checks run when an augmentation file is found alongside or above a base skill:

| Check ID | Rule |
|---|---|
| A1 | Section heading in augmentation exists in base skill (warn if not — may be intentional addition) |
| A2 | `sections.{name}.remove: true` references a heading that exists in base |
| A3 | `fields.{key}.strategy` value is a valid enum (`replace`, `union`, `append`) |
| A4 | `scope` field value matches the inferred scope from file location |
| A5 | `locked: true` is not set in a `local` scope file (lock from local is ineffective; it's the highest priority layer) |

Run via `pnpm test:audit` or `cyber-skills audit validate --path <dir>`.

---

### D6 — Web docs unit

**Type:** Documentation  
**Location:** `apps/web/src/content/` (unit number TBD — after Unit 6)

Sections:
- What augmentation layers are and why they exist
- The seven scopes: quick reference table
- File discovery: where each layer file lives
- Merge semantics: section-level replace, append/prepend, remove
- Lock: use cases and syntax
- CLI: `skill resolve` and `skill layers` walkthrough
- FAQ: local vs project, org lock pattern, backward compat with `.project.md`

---

### D7 — Open spec proposal

**Type:** Research / upstream proposal  
**Location:** `docs/research/2026-05-layered-augmentation-spec.md`

Draft proposal targeting:
- **agentskills** — as an extension to the SKILL.md spec
- **vercel-labs/open-plugin-spec** — as a plugin-manifest-level augmentation model
- **Claude Code** — as a request to support `~/.agents/skills/` user-scope discovery

Scope of proposal: §§4–8 of this SDD, stripped of cyber-skills-specific details. Frames the seven-layer model as a convention any tool can implement without coordination.

---

### D8 — AGENTS.md update

**Type:** Documentation  
**Location:** `CLAUDE.md` (this repo)

Replace the current "Skill Augmentations" section with a pointer to the governance:

```
Skill augmentation rules: `cyber-skills governance show skill-augmentation-layers`
```

Keep the backward-compat note about `SKILL.project.md` / `SKILL.local.md` until the migration to directory-scoped convention is complete.

---

## 11. Implementation Plan

### Phase 1 — Foundation (prerequisite for all other phases)

1. Write D4 (`src/skill/augment.ts`) — resolution library, pure functions, unit tests
2. Write D1 (governance) — normative text derived from §§5–8 of this SDD
3. Update D5 (audit validation) — A1–A5 checks using D4

**Exit criteria:** `pnpm verify` green; governance loads cleanly via `governance show skill-augmentation-layers`.

### Phase 2 — Developer tooling

4. Write D3 (`skill layers` command)
5. Write D2 (`skill resolve` command, builds on D4)

**Exit criteria:** both commands produce correct output on the cyber-skills repo's own skills.

### Phase 3 — Documentation

6. Write D6 (web docs unit)
7. Write D7 (open spec proposal draft)
8. Apply D8 (AGENTS.md update)

### Phase 4 — Open proposal

9. Review D7 with stakeholders
10. Post to agentskills and open-plugin-spec; iterate

---

## 12. Open Questions

| # | Question | Needed by |
|---|---|---|
| OQ1 | Should `shared` scope be skipped in v1 (currently same as base)? | D1, D4 |
| OQ2 | Should `org` layer be above or below `project`? Current spec has org < project; some compliance scenarios require org > project. Possible answer: two org layers — `org-baseline` (4) and `org-ceiling` (above local, priority 8) | D1 |
| OQ3 | What is the gitignore pattern for `SKILL.local.md` in project `.gitignore`? Should the CLI auto-add it? | D5, D2 |
| OQ4 | Is `workspace` scope warranted in v1? Only materializes in monorepos. Could defer. | D1, D4 |
| OQ5 | Should `skill resolve --diff <layer>` be part of D2 or a separate subcommand? | D2 |
| OQ6 | Does the open spec (D7) propose the full 7-layer model, or a minimal 4-layer subset (user, shared, project, local) to maximize adoption? | D7 |
