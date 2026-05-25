# Skill Design

Rules for authoring SKILL.md files that agents load on demand. Apply when creating, generalizing, or auditing a skill — before adding scripts or CLI instructions.

## Structure

SKILL.md must be agent-first: dense normative rules the agent executes without opening linked files first.

- Do not include `## Why`, `## Rationale`, `## Background`, or `## Context` sections.
- Do not include causal explanation ("because…") or rationale prose in the body.
- One-line scope ("Apply when…") is allowed at the top.
- Put optional depth in `## References` at the end — `governance show` commands, external HTTPS URLs, sibling files in the same skill folder only.

**SKILL.md structure:**

```markdown
# Skill Title
## When to use / Prerequisites   # short scope
## Workflow                      # numbered steps, decision logic
## Anti-patterns                 # optional
## References                    # on-demand standards, external URLs, reference.md — no repo file paths
```

Do not embed References content or links to sibling files mid-workflow.

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

Where a skill file lives depends on who consumes it. Whole-repo layout (manifests, CI, archetypes) is covered in **skill-repo-structure** — load from References when scaffolding a library repo.

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

- Put detailed reference material in sibling files (`reference.md`, `examples.md`) in the same skill folder.
- Link sibling files **only from References**; agent reads them when stuck, not by default.
- Link references **one level deep** from SKILL.md; avoid chains of nested files.
- Aim to keep SKILL.md under ~500 lines; split when a skill grows beyond that.

## Extract deterministic logic

When a step produces the same output given the same input and needs no judgment, move it out of prose:

- Prefer an **existing project CLI** or a small **script** in the skill's `scripts/` directory.
- The skill retains **when** to invoke the tool; the tool retains **how**.
- Candidates: text manipulation, file I/O, structured data transforms, validation with fixed rules.

Do not re-derive deterministic steps in natural language each run.

When a skill includes `scripts/` or documents CLI commands agents run, load **agent-tool-output** from References for stdout, JSON, non-interactive, and stderr rules.

## Description and structure

### Frontmatter

- `name` must match the parent directory name exactly.
- `description` must contain `"Use this skill when"` or `"When to use"` trigger language.
- Keep `description` ≤120 characters — long descriptions are truncated in the agent context window.

### Body

- Include actionable steps, numbered instructions, or decision logic — not just a restatement of the description.
- Do not instruct generic behavior the model already follows ("write clean code", "be helpful").

## Anti-patterns

- Rationale or "because…" prose in the body
- `## Why`, `## Rationale`, `## Background`, or `## Context` sections
- Links to other repository files mid-workflow
- Mid-body links to sibling skill files (use References at end)

## References

Related governances (load on demand; read stdout as authoritative):

```bash
npx cyber-skills@<version> governance show skill-repo-structure
npx cyber-skills@<version> governance show agent-tool-output
```
