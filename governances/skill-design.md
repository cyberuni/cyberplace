# Skill Design

Rules for authoring SKILL.md files that agents load on demand. Apply when creating, generalizing, or auditing a skill — before adding scripts or CLI instructions.

## Why

Skills encode **decisions** — what to choose and how — not reference material the model already knows. A good skill is narrow, composable, and detects the user's setup at runtime instead of assuming a stack.

## Core principles

### Decisions over documentation

Encode what to decide and how. Do not repeat generic best practices, API docs, or facts the model can derive without the skill.

### Narrow and composable

One workflow per skill. User-facing skills match a situation; sub-skills are called explicitly by other skills.

- Sub-skills have no situational trigger — prefix the `description` with `"Internal skill:"` and name the caller (e.g. `"Internal skill: called by audit-skill."`) to avoid accidental activation.
- Neither type should be loaded as ambient context.

### No baked-in opinions

Detect the user's setup (package manager, monorepo shape, editor, OS paths) at runtime rather than assuming a specific stack. If the skill only applies to one stack, say so explicitly in the description.

## Placement and scope

Where a skill file lives depends on who consumes it. For whole-repo layout (manifests, CI, archetypes), load **skill-repo-structure**:

```bash
npx cyber-skills@<version> governance show skill-repo-structure
```

### Skill kinds

| Kind | Location | Use case |
| --- | --- | --- |
| **Global** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Repo internal** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo |
| **Repo public** | `skills/<name>/` | Shipped with a package or installed via `npx skills add` |

Repo-internal skills must include `metadata: internal: true` in frontmatter.

### Patch and local rules

- Upstream contributions from a local install map to `skills/<name>/…` in the source repo — never `.agents/skills/` upstream.
- **`SKILL.local.md`** extends a skill locally; never commit or push it upstream.
- Include every changed file under the skill folder when patching (not only `SKILL.md`).

## Progressive disclosure

Keep SKILL.md concise — essential workflow and decision logic only.

- Put detailed reference material in sibling files (`reference.md`, `examples.md`) that the agent reads only when needed.
- Link references **one level deep** from SKILL.md; avoid chains of nested files.
- Aim to keep SKILL.md under ~500 lines; split when a skill grows beyond that.

## Extract deterministic logic

When a step produces the same output given the same input and needs no judgment, move it out of prose:

- Prefer an **existing project CLI** or a small **script** in the skill's `scripts/` directory.
- The skill retains **when** and **why**; the tool retains **how**.
- Candidates: text manipulation, file I/O, structured data transforms, validation with fixed rules.

Do not re-derive deterministic steps in natural language each run.

## Description and structure

### Frontmatter

- `name` must match the parent directory name exactly.
- `description` must contain `"Use this skill when"` or `"When to use"` trigger language.
- Keep `description` ≤120 characters — long descriptions are truncated in the agent context window.

### Body

- Include actionable steps, numbered instructions, or decision logic — not just a restatement of the description.
- Do not instruct generic behavior the model already follows ("write clean code", "be helpful").

## When to add scripts

If the skill includes a `scripts/` directory or documents CLI commands agents run, also load the **agent-tool-output** governance for stdout, JSON, non-interactive, and stderr rules:

```bash
npx cyber-skills@<version> governance show agent-tool-output
```

Read stdout as the authoritative rules for executable tooling.
