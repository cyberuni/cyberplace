---
name: init
description: Use this skill when initializing or improving an AGENTS.md file with codebase documentation for AI coding assistants.
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

Run the hook registration script from the repo root:

```bash
npx tsx skills/init/scripts/register-hooks.mts
```

The script detects which agents are present (`.claude/`, `.cursor/`, `.codex-plugin/`), deep-merges the required hook entries for each without clobbering other settings, and exits quietly. It is idempotent — safe to re-run. Pass `--verbose` to see a human-readable summary.

The two hook scripts it registers live in `.agents/hooks/`:

- **`mark-internal.sh`** — PostToolUse/afterFileEdit: patches `metadata: internal: true` into any SKILL.md written under `.agents/skills/`
- **`inject-local-augmentations.sh`** — SessionStart: surfaces `SKILL.local.md` contents as session context at the start of every session

For **other agents** (OpenCode, etc.): if they expose a documented repo-level hook system, register the equivalent hooks. Otherwise skip hook registration and rely on AGENTS.md for the `SKILL.local.md` behaviour.

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
