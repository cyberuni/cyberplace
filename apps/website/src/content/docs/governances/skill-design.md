---
title: Skill Design
description: Rules for authoring SKILL.md files that agents load on demand.
---

**Load:** `npx cyberplace@<version> governance show skill-design`

Rules for authoring `SKILL.md` files that agents load on demand. Apply when creating, generalizing, or auditing a skill.

## Core principles

### Decisions over documentation

Encode what to decide and how. Do not repeat generic best practices or facts the model can derive without the skill.

### Narrow and composable

One workflow per skill. User-facing skills match a situation; sub-skills are called explicitly by other skills.

- Sub-skills prefix the `description` with `"Internal skill:"` to avoid accidental activation.
- Neither type should be loaded as ambient context.

### No baked-in opinions

Detect the user's setup (package manager, monorepo shape, editor, OS paths) at runtime. If the skill only applies to one stack, say so explicitly in the description.

## Structure

`SKILL.md` must be agent-first — dense normative rules the agent executes without opening linked files first.

```markdown
# Skill Title
## When to use / Prerequisites   # short scope
## Workflow                      # numbered steps, decision logic
## Anti-patterns                 # optional
## References                    # on-demand standards, external URLs — no repo file paths
```

- No `## Why`, `## Rationale`, `## Background`, or `## Context` sections
- No causal explanation ("because…") in the body
- Optional depth goes in `## References` at the end only

## Frontmatter

```yaml
---
name: my-skill
activation: per-situation
description: "Use this skill when <trigger>. <One-line summary.>"
---
```

- `name` must match the parent directory name exactly
- `description` must contain `"Use this skill when"` or `"When to use"` trigger language
- Keep `description` ≤ 120 characters — long descriptions are truncated in agent context

## Activation

| `activation` | Claude Code | Cursor | Codex |
| ------------ | ----------- | ------ | ----- |
| `per-situation` | — | — | — |
| `session-start` | `SessionStart` | `sessionStart` | `SessionStart` |
| `post-tool-use` | `PostToolUse` | `postToolUse` | `PostToolUse` |
| `stop` | `Stop` | `stop` | `Stop` |

Default: omit or `per-situation` — no hook; activated via description match or explicit invoke.

Register hook-backed skills with `npx cyberplace@<version> hook register --event SessionStart`.

## Placement

| Placement | Location | Use case |
| --------- | -------- | -------- |
| **User** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Project private** | `.agents/skills/<name>/` | Contributor tooling; must include `metadata: internal: true` |
| **Project public** | `skills/<name>/` | Shipped with a package via `npx skills add` |

## Progressive disclosure

Keep `SKILL.md` under ~500 lines. Move detailed reference material to sibling files (`reference.md`, `examples.md`) in the same skill folder. Link sibling files **only from References** — agents read them when stuck, not by default.

## Extract deterministic logic

When a step produces the same output given the same input and needs no judgment, move it to a script in `scripts/` or an existing project CLI. The skill retains **when** to invoke; the tool retains **how**.

When the skill includes `scripts/` or documents CLI commands, load the **agent-tool-output** governance before authoring them.

## `skill.json` (optional)

Install-time metadata sidecar — not loaded into agent context. Use `distribution.install_via: "package_manager"` when the skill requires a released npm binary.

## Anti-patterns

- Rationale or "because…" prose in the body
- `## Why`, `## Rationale`, `## Background` sections
- Links to repository files mid-workflow
- Mid-body links to sibling skill files
