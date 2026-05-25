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
- If there's already an AGENTS.md, compare each section you would add (Commands, Architecture, Skill Augmentations, etc.) against what is already there. When content differs — not just missing, but substantively different — ask the user whether to update that section before changing it. Do not overwrite existing sections silently.
- If sections are missing entirely, add them without asking.
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

**Ongoing rule (replaces a PostToolUse hook):** When writing or editing any `SKILL.md` under `.agents/skills/`, always include `metadata: internal: true` in the frontmatter.

## Ensure cyber-skills package

Do **not** add `cyber-skills` as a devDependency by default — it is bin-only tooling and will trigger unused-dependency warnings (for example from knip) in repos that never import it.

Check in order:

1. **Pinned npx (default)** — resolve `npm view cyber-skills version`, then `npx cyber-skills@<exact> <subcommand>` (never `@latest`, never a literal `<version>` placeholder). No `package.json` change; use when init skills are installed globally.
2. **Existing devDependency** — if `cyber-skills` is already in `package.json`, use `pnpm exec cyber-skills` or the local bin.
3. **Optional devDependency** — only when the user needs offline CLI access *and* the AI agent runs locally against that repo: `pnpm add -D cyber-skills`.
4. If neither npx nor a local install works, ask the user to confirm an exact pinned version or opt in to the devDependency above.

### Skill augmentations

Include the **Skill Augmentations** section in AGENTS.md (see above). When an agent reads any `SKILL.md`, it checks for `SKILL.local.md` in the same directory and applies it — keeping augmentations scoped to the skill being used.

For **commit discipline** (AGENTS.md section + SessionStart hook), invoke the `init-commit-discipline` skill after init.

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
