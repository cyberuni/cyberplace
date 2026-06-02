---
title: init
description: Initialize or improve AGENTS.md with codebase documentation, then symlink CLAUDE.md to it.
---

**Trigger:** "initialize AGENTS.md", "set up this repo for AI agents", "run the init skill"

Analyzes the codebase and creates or improves an `AGENTS.md` file, then symlinks `CLAUDE.md → AGENTS.md`.

## What it does

1. **Creates or improves `AGENTS.md`** — starts with Discipline sections (if present), then grounded sections derived from actual project files
2. **Symlinks `CLAUDE.md` → `AGENTS.md`** — if `CLAUDE.md` is a regular file, merges it into `AGENTS.md` first
3. **Repairs repo-internal skills** — runs `npx cyber-skills@<exact> skill repair-private` to set `metadata: internal: true` on `.agents/skills/` entries
4. **Lists companion `init-*` skills** — discovers and offers to run any available follow-up init skills (e.g. `init-commit-discipline`)

## AGENTS.md structure

Sections are added in this order:

1. **Discipline sections** (e.g. `## Commit Discipline`) — when already present in the repo
2. **Commands** — grounded in the repo's `package.json` scripts, `Makefile`, etc.
3. **Architecture** — only what can be derived from actual project files

If `AGENTS.md` already exists, the skill compares sections and asks before overwriting substantive content.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill init -g
```

## Related

- [init-commit-discipline](/skills/init-commit-discipline/) — follow up to inject commit rules
- [init-commit-discipline](/skills/init-commit-discipline/) — follow up to inject commit discipline
