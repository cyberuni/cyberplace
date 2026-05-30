# SDD: Agent Extension Augmentation System (AEAS)

**Status:** Draft  
**Authors:** unional  
**Date:** 2026-05-30  
**Scope:** cyber-skills repo + open spec proposal to agentskills / open-plugin-spec

---

## 1. Problem Statement

AI agent tools (Claude Code, Cursor, Codex) follow written instructions and execute code to perform tasks. The add-ons that extend this behavior — collectively called **agent extensions** ([ADR-0006](../adr/0006-agent-extension-terminology.md)) — currently have no standard model for layering across multiple sources of authority.

A basic pattern exists: a shared base file with a local override (e.g. `CLAUDE.md` + `CLAUDE.local.md`). This handles the simplest case but leaves two use cases unaddressed.

**Local augmentation.** A developer wants machine-local, gitignored tweaks to a shared agent extension — additions that apply only on their machine and never reach CI. The `SKILL.local.md` convention exists in some tools but is not standardized, and its interaction with other layers is unspecified.

**Team augmentation.** A project team wants to layer their conventions on top of a shared, published agent extension without forking it. This looks simple but carries a design tension:

- *Augment* — the team's layer sits on top of the shared extension; upstream updates propagate automatically.
- *Replace* — the team maintains their own copy; they own the full content but must manually track and merge upstream changes.

The augmentation path is lower maintenance but requires a clear merge model. The replacement path is simpler to reason about but creates a fork that drifts. A workable team augmentation story must specify the merge model precisely enough that authors know what they are opting into — and must acknowledge that some teams will still choose replacement deliberately.

---

## 2. Terminology

This spec uses the three-layer community vocabulary from [ADR-0006](../adr/0006-agent-extension-terminology.md):

| Term | Definition |
|---|---|
| **Agent extension** | Any add-on that extends an AI agent's behavior beyond the base model — umbrella term covering skills, tools, and plugins |
| **Skill** | An instruction-based agent extension: a `SKILL.md` file that tells an agent how to perform a task |
| **Tool** | A code-based agent extension: a callable function or MCP server the agent can invoke at runtime |
| **Plugin** | A distribution unit that bundles one or more skills, tools, and other components |
| **Base extension** | The agent extension file shipped with a package; the lowest-priority content source |
| **Augmentation** | A layer file that modifies a base extension or a lower-priority augmentation |
| **Layer** | One source of extension content at a defined scope |
| **Scope** | The deployment context a layer belongs to (user, org, project, etc.) |
| **Resolution** | The algorithm that merges all applicable layers into one effective extension |
| **Effective extension** | The fully merged result the agent reads |
| **Lock** | A declaration in a layer that prevents higher-scoped layers from overriding a section |
| **Heading** | A markdown `##` section; the unit of section-level merge |

> **v1 scope note:** This spec covers augmentation of instruction-based extensions (skills, `SKILL.md` format). Code-based extensions (tools, MCP servers) have different merge semantics and are deferred to v2.

---

## 3. Goals

- **G1** — Define a named, ordered set of augmentation layers covering all common deployment contexts.
- **G2** — Specify a file-discovery algorithm that any agent tool can implement without configuration.
- **G3** — Specify merge semantics for each kind of content (frontmatter fields, markdown sections).
- **G4** — Provide a lock mechanism so high-authority layers can prevent override.
- **G5** — Ship a governance document agents load on demand via `governance show`.
- **G6** — Ship `skill resolve` and `skill layers` CLI commands for developer debugging.
- **G7** — Publish an open spec proposal targeting agentskills and open-plugin-spec.

## 4. Non-Goals

- **NG1** — Augmentation of code-based extensions (tools, MCP servers). Deferred to v2.
- **NG2** — Cryptographic signing or tamper-detection for org layers (policy problem, not a spec problem).
- **NG3** — DAG `extends` chains between shared packages. Linear resolution only in v1.
- **NG4** — LLM-mediated merge for conflicting prose (too expensive, non-deterministic).
- **NG5** — Runtime hot-reload of augmentation changes during an agent session.
- **NG6** — Any layer other than the seven defined below.

---

## 5. Layer Model

### 5.1 Layer enumeration

Seven layers, ordered from lowest to highest priority. Higher priority wins on conflict unless locked.

| # | Scope | Authority | Example path |
|---|---|---|---|
| 1 | `built-in` | Tool vendor | shipped defaults, implicit |
| 2 | `user` | Machine owner | `~/.agents/skills/{name}/SKILL.md` |
| 3 | `shared` | Package author | installed package skill file |
| 4 | `org` | Administrator | env var or well-known path |
| 5 | `project` | Repo maintainers | `.agents/skills/{name}/SKILL.md` at repo root |
| 6 | `workspace` | Sub-package team | `.agents/skills/{name}/SKILL.md` at sub-package root |
| 7 | `local` | Individual dev | `SKILL.local.md` alongside effective layer file |

> **Rationale for org below project (layers 4 < 5):** org sets baseline compliance requirements; project teams know domain-specific steps the org layer cannot anticipate. Org rules that must survive project override use the lock mechanism (§7).

### 5.2 File naming convention

Every layer except `local` uses `SKILL.md` as the filename, with scope inferred from directory location.

The `local` scope uses the `.local.md` suffix alongside whichever layer is topmost in the discovery walk, so it can augment any scope without a separate directory.

```
~/.agents/skills/commit-work/SKILL.md               # user
<repo-root>/.agents/skills/commit-work/SKILL.md     # project
<sub-pkg>/.agents/skills/commit-work/SKILL.md       # workspace
<any-dir>/.agents/skills/commit-work/SKILL.local.md # local (gitignored)
```

### 5.3 Backward compatibility

Existing `SKILL.project.md` and `SKILL.local.md` co-located with the base `SKILL.md` are treated as `project` and `local` scope respectively. Agents SHOULD support both forms; CLI tooling SHOULD prefer the directory-scoped form for new augmentations.

---

## 6. File Discovery

### 6.1 Algorithm (linear walk)

Given an extension name and a working directory:

1. Collect **base**: find the installed `SKILL.md` for the extension (npm package, `npx` cache, or `skills/` folder).
2. Collect **user**: check `~/.agents/skills/{name}/SKILL.md`.
3. Collect **shared**: the installed package file itself is the shared layer (same as base unless a shared augmentation package is installed — reserved for v2).
4. Collect **org**: read path from env var `AGENTS_ORG_PATH`; if absent, check `/etc/agents/skills/{name}/SKILL.md` (POSIX) or `%PROGRAMDATA%\agents\skills\{name}\SKILL.md` (Windows).
5. Collect **project**: starting from CWD, walk up to git root; at each level check `.agents/skills/{name}/SKILL.md`. Use the deepest match as project layer.
6. Collect **workspace**: if CWD is inside a monorepo sub-package (detected by presence of `package.json` or `pyproject.toml` below git root), check `.agents/skills/{name}/SKILL.md` in that sub-package root. Distinct from project only when sub-package root ≠ git root.
7. Collect **local**: check for `SKILL.local.md` alongside the highest-priority non-local layer found; also alongside the base.

Missing layers are silently skipped. Collected order: `[built-in, user, shared, org, project, workspace, local]`.

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

The `name` field is never merged — it is always taken from the base extension.

### 7.3 Markdown section merge

The unit of section merge is a `##` heading. Nested `###` headings are treated as part of their parent `##` section.

**Default:** a section present in the augmenting layer **replaces** the same-named section in the accumulated result.

**Append / prepend:** declared in the augmenting layer's frontmatter:

```yaml
sections:
  Steps:
    strategy: append   # or prepend
```

- `append` — augmenting content added after accumulated section content.
- `prepend` — added before.

**New sections:** a heading not present in the accumulated result is appended to the end of the effective extension body.

**Removed sections:** `remove: true` deletes the section from the accumulated result:

```yaml
sections:
  Troubleshooting:
    remove: true
```

### 7.4 Conflict semantics

Natural language sections can produce contradictory instructions when combined. The resolution algorithm makes no semantic judgement — contradiction avoidance is the augmentation author's responsibility. Tooling (§9, D2) surfaces provenance per section so humans can review conflicts; it does not resolve them automatically.

---

## 8. Lock Mechanism

A layer may declare a section locked. A locked section in layer N cannot be replaced, appended to, prepended to, or removed by any layer with priority > N.

```yaml
sections:
  Compliance:
    locked: true
```

Lock is NOT transitive — locking in the `user` layer prevents `project` from overriding it, but `org` (priority 4) can still override because `org` > `user` (priority 2). Direction: no layer with a *higher* index may modify a locked section.

**Org-enforced lock pattern:** org layer (priority 4) locks a section. Project (5), workspace (6), and local (7) cannot modify it.

---

## 9. Frontmatter Schema Extensions

New fields added to `SKILL.md` frontmatter (all optional):

```yaml
# Explicit scope declaration (informational; used in tooling display)
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

These fields are meaningful only in augmentation layer files. A base `SKILL.md` may declare `sections.{name}.locked: true` to lock a section against any augmentation.

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
**Command:** `cyber-skills skill resolve <name> [--dir <path>] [--json]`

Outputs the effective extension with provenance annotations showing which layer each section came from.

**Text output (default):**
```
## Steps        [source: project (.agents/skills/commit-work/SKILL.md)]
...content...

## Compliance   [source: org (/etc/agents/skills/commit-work/SKILL.md) 🔒]
...content...
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
**Command:** `cyber-skills skill layers <name> [--dir <path>]`

Lists all discovered layer files without merging.

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
**Location:** `src/skill/augment.ts` (new), consumed by D2, D3, and D5

Exports:
- `discoverLayers(name, cwd)` → ordered `Layer[]`
- `resolveExtension(layers)` → `EffectiveExtension`
- `parseSections(markdown)` → `Section[]`
- `mergeSections(base, augment, config)` → `Section[]`

Pure functions; no I/O. Discovery I/O lives in `src/skill/resolve.ts`.

---

### D5 — Audit: augmentation cross-check

**Type:** Code  
**Location:** `src/audit/validate.ts` (update existing)

Checks run when an augmentation file is detected:

| ID | Rule |
|---|---|
| A1 | Section heading in augmentation exists in base (warn if not — may be intentional addition) |
| A2 | `sections.{name}.remove: true` references a heading present in base |
| A3 | `fields.{key}.strategy` is a valid enum (`replace`, `union`, `append`) |
| A4 | `scope` field matches the scope inferred from file location |
| A5 | `locked: true` not set in a `local` scope file (lock from local is ineffective — it is already highest priority) |

Run via `pnpm test:audit` or `cyber-skills audit validate --path <dir>`.

---

### D6 — Web docs unit

**Type:** Documentation  
**Location:** `apps/web/src/content/` (unit number TBD — after Unit 6)

Sections: what augmentation layers are and why they exist; the seven scopes; file discovery; merge semantics; lock; CLI walkthrough; FAQ (local vs project, org lock pattern, backward compat).

---

### D7 — Open spec proposal

**Type:** Research / upstream proposal  
**Location:** `docs/research/2026-05-layered-augmentation-spec.md`

Draft targeting:
- **agentskills** — augmentation model as an extension to the SKILL.md spec
- **vercel-labs/open-plugin-spec** — plugin-manifest-level augmentation
- **Claude Code** — request to support `~/.agents/skills/` user-scope discovery

Proposes "agent extension" as a formal cross-layer term alongside the skill/tool/plugin hierarchy. Scoped to §§5–8 of this SDD, stripped of cyber-skills-specific details.

---

### D8 — AGENTS.md update

**Type:** Documentation  
**Location:** `CLAUDE.md` (this repo)

Replace the current "Skill Augmentations" section with a pointer to the governance:

```
Augmentation rules: `cyber-skills governance show skill-augmentation-layers`
```

Keep the backward-compat note about `SKILL.project.md` / `SKILL.local.md` until directory-scoped migration is complete.

---

## 11. Implementation Plan

### Phase 1 — Foundation

1. D4 (`src/skill/augment.ts`) — resolution library, pure functions, unit tests
2. D1 (governance) — normative text from §§5–8
3. D5 (audit) — A1–A5 checks

**Exit criteria:** `pnpm verify` green; governance loads via `governance show skill-augmentation-layers`.

### Phase 2 — Developer tooling

4. D3 (`skill layers`)
5. D2 (`skill resolve`, builds on D4)

**Exit criteria:** both commands produce correct output on cyber-skills' own skills.

### Phase 3 — Documentation

6. D6 (web docs unit)
7. D7 (open spec proposal draft)
8. D8 (AGENTS.md update)

### Phase 4 — Open proposal

9. Review D7 with stakeholders
10. Post to agentskills and open-plugin-spec; iterate

---

## 12. Open Questions

| # | Question | Needed by |
|---|---|---|
| OQ1 | Should `shared` scope be skipped in v1 (currently same as base)? | D1, D4 |
| OQ2 | Should `org` be split into `org-baseline` (4) and `org-ceiling` (8, above local) to handle both floor and ceiling compliance patterns? | D1 |
| OQ3 | Should the CLI auto-add `SKILL.local.md` to `.gitignore` when creating a local augmentation? | D2, D3 |
| OQ4 | Is `workspace` scope warranted in v1? Only materializes in monorepos. Could defer. | D1, D4 |
| OQ5 | Should `skill resolve --diff <layer>` be part of D2 or a separate subcommand? | D2 |
| OQ6 | Does D7 propose the full 7-layer model or a minimal 4-layer subset (user, shared, project, local) to maximize adoption? | D7 |
