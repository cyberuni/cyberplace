---
status: draft
blocked-by: []
---

# define-skill

`define-skill` is the ACES plugin's structured skill-authoring workflow. It guides an agent through the decisions needed to produce a well-formed, quality-checked `SKILL.md` and wire it into the right runtimes.

---

## What

`define-skill` handles two cases: **create** (scaffold a new skill from requirements) and **improve** (read an existing skill and address gaps). Both paths converge at the same checkpoint: quality checks pass, symlinks are wired, and `aces:create-spec` is the suggested next step.

### Content type guard

Before gathering requirements, determine whether the user's intent is actually a skill:

- If the requirements describe **rules or criteria an agent evaluates against** (a rubric, constraint set, or standards agents check compliance with) — that is governance, not a skill. Redirect to `aces:define-governance`.
- If the requirements describe **a named, reusable autonomous role** (a persona with responsibilities, output format, and tool access) — that is an agent definition, not a skill. Redirect to `aces:define-agent`.

### Placement

Ask the user which scope applies when it is not clear from context:

| Placement | Canonical path |
|-----------|----------------|
| User-global | `~/.agents/skills/<name>/` |
| Project-private | `.agents/skills/<name>/` |
| Project-public | `skills/<name>/` (or `packages/<pkg>/skills/<name>/`) |

Runtime folders (`.claude/skills/`, `.cursor/skills/`, `.codex/skills/`) hold symlinks to the canonical path — never the source.

### Pattern

Ask the user which pattern fits when it is not clear:

| Pattern | When to use |
|---------|-------------|
| Process | Ordered multi-step workflow with decision points |
| Tool-based | Consistent interaction with tools, systems, or connectors |
| Standard | Tone, format, structure, or quality enforcement |
| Persona | Expert stance loaded opt-in; adds `metadata.persona: "true"` |

### Requirements gathering

For a **new skill**, ask before drafting:

1. **Name** — kebab-case slug
2. **Trigger** — when should the agent invoke this skill? (the situation, not just phrases)
3. **What it does** — 2–4 sentences describing the workflow or behavior
4. **Activation** — per-situation (default) or hook-backed (`SessionStart`, `PostToolUse`)
5. **Sub-skill?** — called by other skills, not directly by users?

For **improving an existing skill**: read the file first. Ask only about gaps or issues found.

### Draft

Write (or update) `SKILL.md` at the canonical path:

```markdown
---
name: <name>
description: [Use this skill when | Internal skill:] <trigger and summary>
[metadata:]
  [internal: true]
  [persona: "true"]
  [activation: SessionStart | PostToolUse]
---

# <Title>

<body>
```

Frontmatter rules:
- `description` is a plain single-line string — never use YAML block scalars (`|` or `>`) as they break markdown parsing
- `description` starts with `"Use this skill when"` for user-facing skills; `"Internal skill:"` for sub-skills
- `metadata.internal: true` for project-private skills (`.agents/skills/`)
- `metadata.persona: "true"` for Persona pattern
- `metadata.activation` only for hook-backed skills; omit otherwise

Body rules (from skill-design governance):
- Agent-first: dense, self-contained; no links to other repo files
- No `## Why` or rationale sections
- Encode decisions and constraints, not background explanation
- Load depth via `governance show`, not inline prose

### Quality checks

After drafting, run:

```bash
npx cyber-skills@<version> audit validate --path <canonical-path>
```

Report all findings. Fix CRITICAL and HIGH before presenting the final file.

### Symlinks

Create symlinks from each selected runtime location to the canonical file. Use relative paths:

```bash
ln -sf <relative-path-to-canonical> .claude/skills/<name>
```

Verify each symlink resolves correctly.

### README

Write `README.md` beside every `SKILL.md`:

- **Title** — skill name
- **When to use** — trigger phrases
- **What it does** — brief human overview (not the full agent body)
- **Install** — `npx skills add owner/repo --skill <name>` (project-public only)

### Report

- Canonical file path written
- Runtime symlinks created (list each)
- Quality check outcome: pass / findings-fixed / open-findings
- Suggested next step: run `aces:create-spec` to build an eval suite for this skill

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/define-skill/spec.md` |
| ACES eval | `artifacts/specs/define-skill/eval.md` |
| Implementation | `plugins/aces/skills/define-skill/SKILL.md` |
