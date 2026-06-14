# ADR-0008: Drop SKILL.project.md and Skill Augmentation Layers

## Status

Accepted

## Context

The Agentic File Augmentation System (AFAS) SDD (`docs/specs/2026-05-layered-augmentation-sdd.md`) proposed a 7-layer merge model — built-in, user, shared, org, project, workspace, local — with frontmatter-driven merge semantics, a lock mechanism, and CLI tooling (`skill resolve`, `skill layers`). The two primary file conventions were `SKILL.project.md` (team overrides, checked in) and `SKILL.local.md` (machine-local, gitignored).

In practice the project layer created confusion:

- **Team augmentation via `SKILL.project.md`** — teams were sometimes committing it to share with the team (defeating the "local override" mental model) or leaving it gitignored (defeating team-sharing). The convention offered no clear answer on which was correct.
- **The merge algorithm** — complex to specify, implement, and debug; solves a layering problem most teams will never encounter.

`SKILL.local.md` (machine-local, gitignored) is a different case: it maps cleanly to Claude Code's `settings.local.json` / `CLAUDE.local.md` pattern and is useful as a personal escape hatch. It is retained.

Claude Code's own model is simpler: `CLAUDE.md` files at directory levels are concatenated; enterprise settings are the hard ceiling. No merge algorithm, no lock mechanism.

## Decision Drivers

- `SKILL.project.md` had no clear canonical usage (team-shared vs. gitignored)
- The 7-layer merge algorithm far exceeded the value it delivered
- Git already provides history and diff for direct edits to `.agents/skills/`
- Aligning with Claude Code's scope model (enterprise > user > project > local) reduces cognitive load
- `SKILL.local.md` retains value as a machine-local escape hatch, matching the `*.local.*` convention in Claude Code

## Considered Options

### Option 1: Implement AFAS full 7-layer model

- **Pros**: Handles all augmentation scenarios; lock mechanism prevents org override
- **Cons**: High complexity; solves problems that don't exist in practice; diverges from Claude Code model

### Option 2: Simplified 3-layer model (shared, project, local)

- **Pros**: Smaller spec; drops workspace and org layers
- **Cons**: Still requires a merge algorithm and `SKILL.project.md` convention with the same ambiguity

### Option 3: Drop `SKILL.project.md` and the merge layer model; keep `SKILL.local.md`

- **Pros**: Zero complexity; git handles history; aligns with Claude Code; `*.local.*` pattern is consistent
- **Cons**: Teams lose declarative project-level layering — they must edit `.agents/skills/` directly

## Decision

Drop `SKILL.project.md` and the skill augmentation layer model. Remove the AFAS SDD and specs.

**Team customization:** edit `.agents/skills/<name>/SKILL.md` directly. Git tracks what changed and when.

**Personal customization:** `SKILL.local.md` alongside any installed skill, gitignored — never committed or patched upstream.

**Personal across all repos:** install to `~/.agents/skills/<name>/` (user scope).

## Rationale

The core confusion was `SKILL.project.md` having no clear answer on whether teams should commit it. Dropping it entirely and replacing with direct edits is unambiguous. `SKILL.local.md` is retained because it has a clear semantics — machine-local, gitignored — and matches the existing `*.local.*` convention teams already understand from Claude Code.

## Consequences

### Positive

- Removes a large spec and planned CLI commands (D2–D5 from AFAS SDD)
- Eliminates the `SKILL.project.md` commit-or-not ambiguity
- Aligns team-edit workflow with how Claude Code handles project-level config
- No merge algorithm to implement, test, or debug

### Negative

- Teams that relied on `SKILL.project.md` must migrate to direct edits to `.agents/skills/`

### Risks

- Teams may want declarative layering as skill ecosystems grow — revisit in a future ADR if the pattern recurs

## Implementation Notes

- Remove `## Skill Augmentations` section from `CLAUDE.md` / `AGENTS.md` and from the `init` skill (it documented both conventions; the remaining `SKILL.local.md` behavior needs no special section)
- Remove all `SKILL.project.md` references from governances, skills, and docs
- Retain `SKILL.local.md` references in patch-skill (excluded from upstream contributions) and in governances (never commit upstream)
- Delete `docs/specs/2026-05-layered-augmentation-sdd.md` and `docs/specs/layered-augmentation/`
- Delete any checked-in `SKILL.local.md` files from this repo (they should be gitignored, not committed)

## Related Decisions

- [ADR-0003](0003-agent-first-authoring.md) — agent-first authoring principles that skills follow
- [ADR-0005](0005-skill-taxonomy.md) — placement and pattern axes for skills
