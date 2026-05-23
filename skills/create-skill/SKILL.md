---
name: create-skill
description: Use this skill when the user asks to create a new agent skill. Determines the correct kind (global, repo internal, or repo public) and creates it in the right location.
---

# Create Skill

When the user asks to create a new skill, follow this convention.

## Skill kinds

There are three kinds of skills. Determine which one applies before creating anything:

| Kind | Location | Purpose |
|---|---|---|
| **Global** | `~/.agents/skills/<name>/` | Personal skills usable across all projects; linked into agent dirs |
| **Repo internal** | `<repo-root>/.agents/skills/<name>/` | Dev-workflow skills for contributors to this repo only (e.g. release helpers, SDK updaters) |
| **Repo public** | `<repo-root>/skills/<name>/` | Skills shipped with the package; users install via `npx skills add <owner>/<repo>` |

Ask or infer from context which kind the user wants. The kind determines placement and whether linking is needed.

## Steps

### 0. Determine the skill kind

- If the user is working inside a repo and the skill is meant for contributors to that repo only → **repo internal**
- If the user is working inside a publishable package and the skill is for end users of that package → **repo public**
- Otherwise → **global**

### 1. Create the skill

Check whether `npx skills` is available:

```bash
npx skills --version 2>/dev/null
```

#### Global skill

**If `npx skills` available:**

```bash
npx skills init <name> --dir ~/.agents/skills
```

**If not available**, create manually:

```bash
mkdir -p ~/.agents/skills/<name>
```

Write `~/.agents/skills/<name>/SKILL.md`.

#### Repo internal skill

Create inside the repo root:

```bash
mkdir -p .agents/skills/<name>
```

Write `.agents/skills/<name>/SKILL.md`. Contributors link it locally with `npx skills add .agents/skills/<name>` or a manual symlink.

#### Repo public skill

Create in the repo's public skills directory:

```bash
mkdir -p skills/<name>
```

Write `skills/<name>/SKILL.md`. No agent-dir linking is needed — users install it themselves via `npx skills add <owner>/<repo>`.

---

For all kinds, use this template:

```markdown
---
name: <name>
description: Use this skill when <trigger condition>. <One-line summary of what it does.>
---

# <Name>

## When to use

<Describe when this skill should be used.>

## Instructions

1. First step
2. Second step
```

### 2. Validate the skill

Invoke the `validate-skill` skill on the new file. Fix any CRITICAL findings before proceeding. Do not continue to step 3 if any CRITICAL findings remain.

### 3. Link to agents (global and repo internal only)

Skip this step for **repo public** skills.

**If `npx skills` is available:**

```bash
# Global:
npx skills add ~/.agents/skills/<name>

# Repo internal:
npx skills add .agents/skills/<name>
```

This detects all installed agents and prompts the user to choose which ones to link. It handles the correct path for each agent (Claude Code, Cursor, Codex, OpenCode, etc.).

**Known issue:** `npx skills` has a bug where it may not create `~/.claude/skills/` if the directory doesn't exist yet. After linking, verify:

```bash
ls ~/.claude/skills/<name>
```

If missing, fall back to the manual step below.

**If `npx skills` is not available, or the symlink is missing after the above:**

```bash
# Global:
ln -sf ~/.agents/skills/<name> ~/.claude/skills/<name>

# Repo internal (adjust path per contributor machine):
ln -sf "$(pwd)/.agents/skills/<name>" ~/.claude/skills/<name>
```

Adjust the target path for other agents as needed (e.g., `~/.cursor/skills/`, `~/.opencode/skills/`).

## What makes a good skill

- **Decisions over documentation.** Encode what to decide and how — don't repeat reference material the model already knows.
- **Narrow and composable.** One workflow per skill. Skills can be triggered by situation (user-facing) or called by other skills (sub-skills). Sub-skills have no situational trigger — their `description` should say "Internal skill: called by X" to avoid accidental activation. Neither type should be loaded as ambient context.
- **No baked-in opinions.** Detect the user's setup (package manager, monorepo shape, tooling) at runtime rather than assuming a specific stack.

## Notes

- **Global**: `~/.agents/skills/` is the source of truth — back up this directory.
- **Repo internal**: `.agents/skills/` lives in the repo and is committed; each contributor links it locally.
- **Repo public**: `skills/` lives in the repo and is committed; it is the installable artifact — do not symlink it into agent dirs.
- Agent skills directories (e.g. `~/.claude/skills/`) only contain symlinks; never edit files there directly.
- The `description` frontmatter field is what agents read to decide when to activate the skill — make it specific and include "Use this skill when" trigger language. For sub-skills, prefix with "Internal skill:" to prevent unintended activation.
