---
name: init
description: Use this skill when the user wants to initialize or improve an AGENTS.md file with codebase documentation. Creates AGENTS.md and symlinks CLAUDE.md to it, or suggests improvements if AGENTS.md already exists.
---

Analyze this codebase and create or improve an AGENTS.md file, then symlink CLAUDE.md to it.

What to include:
1. Commands commonly used for building, linting, and running tests — including how to run a single test.
2. High-level architecture and code structure that requires reading multiple files to understand. Focus on the big picture, not file listings.
3. A "Skill Augmentations" section with this exact content:

```markdown
## Skill Augmentations

When reading any `SKILL.md` file, always check whether a `SKILL.local.md` exists in the same directory. If it does, treat its contents as additional instructions that extend the base skill. Local augmentations take precedence over the base skill where they conflict.
```

Usage notes:
- If there's already an AGENTS.md, suggest improvements to it.
- Avoid listing every component or file structure that can be easily discovered.
- Do not make up sections like "Common Development Tasks" or "Tips for Development" unless that content appears in existing project files.
- If there are Cursor rules (in `.cursor/rules/` or `.cursorrules`) or Copilot rules (in `.github/copilot-instructions.md`), include the important parts.
- If there is a README.md, include the important parts.
- Prefix the file with:

```
# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.
```

After writing AGENTS.md, scan for repo-internal skills and mark them. For each `SKILL.md` found under `.agents/skills/`, ensure the frontmatter includes:

```yaml
metadata:
  internal: true
```

Add it if missing. This prevents these skills from being accidentally surfaced as public or globally available.

Then register hooks so these behaviors apply automatically going forward, not just at init time.

### Hook registration

`npx skills` handles agent detection for file placement but has no hook management — hook formats are agent-specific. Detect which agents are present and register for each:

**Claude Code** (`.claude/settings.json`):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .agents/hooks/mark-internal.sh" }]
      }
    ],
    "SessionStart": [
      {
        "hooks": [{ "type": "command", "command": "bash .agents/hooks/inject-local-augmentations.sh" }]
      }
    ]
  }
}
```

Use the `update-config` skill to merge these into the existing `.claude/settings.json` without overwriting other settings.

The two hook scripts live in `.agents/hooks/`:

- **`mark-internal.sh`** — reads tool JSON from stdin, checks if the written file path matches `.agents/skills/*/SKILL.md`, and patches in `metadata: internal: true` if missing.
- **`inject-local-augmentations.sh`** — scans `.agents/skills/*/SKILL.local.md` and emits their contents as `hookSpecificOutput` so the agent sees local augmentations at the start of every session (a safety net on top of the AGENTS.md instruction).

**Codex** — hooks are registered via a plugin's `hooks.json` using the identical format. If a `.codex-plugin/` exists in the repo, add or merge into `.codex-plugin/hooks.json`. Otherwise, create a minimal plugin (see the Codex `plugin-creator` skill) or document the hook manually.

**Cursor** (`.cursor/hooks.json`):

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [
      {
        "command": "bash .agents/hooks/mark-internal.sh"
      }
    ]
  }
}
```

Use the `update-config` skill to merge this into `.cursor/hooks.json` without overwriting other hooks.

Cursor's project hooks are the right place to enforce `metadata.internal` after edits. For `SKILL.local.md` augmentation visibility, keep relying on AGENTS.md and Cursor rules (`.cursor/rules/` or `.cursorrules`). Do not depend on a Cursor `sessionStart` hook for prompt injection here: Cursor supports hook files in `.cursor/hooks.json`, but the session-start context injection path has been unreliable in recent releases, so the durable mechanism is still checked-in rules plus AGENTS.md.

**Other agents** (OpenCode, etc.): if they expose a documented repo-level hook system, register the equivalent hooks. Otherwise skip hook registration and rely on AGENTS.md for the `SKILL.local.md` behaviour.

> Note: `npx skills` does not yet manage runtime hook registration automatically. Follow https://github.com/vercel-labs/skills/issues/1231 — once resolved, the manual steps above should become `npx skills add` side-effects.

Then create the CLAUDE.md symlink. Detect the platform first:

**Unix / macOS / Linux:**
```bash
[ -f CLAUDE.md ] && ! [ -L CLAUDE.md ] && rm CLAUDE.md
ln -sf AGENTS.md CLAUDE.md
```

**Windows (PowerShell):**
```powershell
if (Test-Path CLAUDE.md -PathType Leaf) { Remove-Item CLAUDE.md }
New-Item -ItemType SymbolicLink -Name CLAUDE.md -Target AGENTS.md
```
