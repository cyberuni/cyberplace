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

### Skill placement

Use **placement** for where a skill lives; do not call this axis "type".

| Placement | Location | Use case |
| --- | --- | --- |
| **User** | `~/.agents/skills/<name>/` | Personal skills across all projects |
| **Project private** | `.agents/skills/<name>/` | Contributor tooling scoped to one repo |
| **Project public** | `skills/<name>/` | Shipped with a package or installed via `npx skills add` |

### Skill patterns

Use **pattern** for the workflow shape; do not overload "kind" or "type" here.

| Pattern | Use case |
| --- | --- |
| **Process** | Multi-step workflows where sequence and decision logic matter |
| **Tool-based** | Workflows centered on consistent use of tools, systems, or connectors |
| **Standard** | Workflows that enforce tone, structure, formatting, or quality bars |
| **Persona** | Loads an expert stance, decision style, and working behavior into the session |

Repo-internal skills must include `metadata: internal: true` in frontmatter.
Persona skills must include `metadata.persona: "true"`.

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
- `compatibility` — optional; declare environment constraints (required tools, network access, OS, runtime version). Include only when the skill has requirements the agent cannot assume.
- `allowed-tools` — optional, experimental; space-separated list of pre-approved tools the skill may invoke (e.g. `Bash(git:*) Read`). Support varies by platform.

### skill.json — install-time metadata

`skill.json` is an optional sidecar file in the same directory as `SKILL.md`. It holds install-time metadata that the `skills add` / `skills update` installer reads. It is **not** loaded into agent context, so it costs zero tokens at runtime.

Do not put install-time metadata in SKILL.md frontmatter — agents load it unnecessarily.

**Supported fields:**

```json
{
  "distribution": {
    "install_via": "package_manager",
    "package": {
      "name": "cyber-asana",
      "bin": "cyber-asana"
    }
  }
}
```

**`distribution`** — declare the required install channel.

| Field | Required | Description |
| --- | --- | --- |
| `install_via` | yes | `"package_manager"` — must be installed via npm, not source control |
| `package.name` | when `install_via: package_manager` | npm package that ships the skill binary |
| `package.bin` | no | binary name; defaults to `package.name` |

Use `install_via: package_manager` when the skill depends on a released binary from the same repo. Source-based `skills add org/repo` will skip such skills and print an `npm install` hint.

### Activation

The `activation` field belongs in **SKILL.md frontmatter** as a **top-level field** (not nested under `metadata:`). Agents need this information to know whether a hook is involved; not all agents support hooks, so it must travel with the skill file.

```yaml
---
name: my-skill
activation: per-situation
description: "Use this skill when..."
---
```

| `activation` | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `per-situation` | — | — | — |
| `session-start` | `SessionStart` | `sessionStart` | `SessionStart` |
| `session-end` | `SessionEnd` | `sessionEnd` | — |
| `pre-tool-use` | `PreToolUse` | `preToolUse` | — |
| `post-tool-use` | `PostToolUse` | `postToolUse` | `PostToolUse` |
| `post-tool-use-failure` | — | `postToolUseFailure` | — |
| `before-submit-prompt` | `UserPromptSubmit` | `beforeSubmitPrompt` | — |
| `before-shell-execution` | — | `beforeShellExecution` | — |
| `after-shell-execution` | — | `afterShellExecution` | — |
| `before-mcp-execution` | — | `beforeMCPExecution` | — |
| `after-mcp-execution` | — | `afterMCPExecution` | — |
| `before-read-file` | — | `beforeReadFile` | — |
| `after-file-edit` | — | `afterFileEdit` | — |
| `subagent-start` | — | `subagentStart` | — |
| `subagent-stop` | — | `subagentStop` | `SubagentStop` |
| `pre-compact` | `PreCompact` | `preCompact` | — |
| `stop` | `Stop` | `stop` | `Stop` |
| `after-agent-response` | — | `afterAgentResponse` | — |
| `after-agent-thought` | — | `afterAgentThought` | — |
| `before-tab-file-read` | — | `beforeTabFileRead` | — |
| `after-tab-file-edit` | — | `afterTabFileEdit` | — |

— = no documented equivalent on that host.

**Default:** omit or set `per-situation` — no hook; load via `description` or explicit invoke.

**Hook-backed skills:** set `activation` to the normalized event, then register with `hook register --event …` (cyber-skills CLI maps `session-start` → `SessionStart` / `sessionStart`, `post-tool-use` → `PostToolUse` / `postToolUse`). CLI today supports `SessionStart` and `PostToolUse` only; other values are portable declarations until hosts implement them.

**Defaults by pattern:** persona → `per-situation` (opt-in via `description`); discipline / always-on injection → `session-start`; process / tool-based / standard → `per-situation` or omit.

Deprecated: `metadata.activation` in SKILL.md frontmatter. Use top-level `activation:` instead.

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
npx cyber-skills@<version> governance show plugin-design
```
