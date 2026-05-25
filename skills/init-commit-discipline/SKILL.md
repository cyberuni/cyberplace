---
name: init-commit-discipline
description: "Use this skill when initializing commit discipline — AGENTS.md rules and SessionStart hooks where agents support them."
---

# Init Commit Discipline

Inject always-on commit discipline into the repo: an AGENTS.md section for every agent, plus SessionStart hooks on agents that support them.

## Prerequisites

- `AGENTS.md` should exist (run the `init` skill first if missing).
- AGENTS.md should include the **Skill Augmentations** section (run the `init` skill — agents read `SKILL.local.md` when loading a skill).
- The `cyber-skills` npm package must be accessible via npx or local install (see below).

## Commit helper skill

Commit discipline references a **commit helper skill** for staging, splitting, and message writing. Resolve one before injecting AGENTS.md.

Run from the repo root:

```bash
npx cyber-skills@<version> commit resolve-skill --check
```

If none are detected, ask the user to choose:

| Option | Action |
|--------|--------|
| **A — Recommended** | Install [`softaworks/agent-toolkit@commit-work`](https://github.com/softaworks/agent-toolkit): `npx skills add softaworks/agent-toolkit --skill commit-work -g` |
| **B — User override** | User names another commit skill to install or reference |
| **C — Bundled fallback** | Install cyber-skills' minimal `commit` skill project-scoped: `npx skills add cyberuni/cyber-skills --skill commit` |

Do not proceed until a commit helper skill name is chosen.

## Ensure cyber-skills package

Check in order:

1. **Pinned npx (default)** — resolve `npm view cyber-skills version`, then `npx cyber-skills@<exact> <subcommand>` (never `@latest`, never a literal `<version>` placeholder). No `package.json` change.
2. **Existing devDependency** — if `cyber-skills` is already in `package.json`, use `pnpm exec cyber-skills` or the local bin.
3. **Optional devDependency** — when the user needs offline CLI access and the AI agent runs locally against that repo: `pnpm add -D cyber-skills`.
4. If neither npx nor a local install works, ask the user to confirm an exact pinned version or opt in to the devDependency above.

## Workflow

1. Resolve commit helper skill (above).
2. Inject AGENTS.md section (substitute the exact version from `npm view cyber-skills version`):

```bash
npx cyber-skills@<version> commit inject --commit-skill <name>
```

3. Register SessionStart hook:

```bash
npx cyber-skills@<version> hook register \
  --name commit-discipline \
  --event SessionStart \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

Pass `--verbose` on either command for a human-readable summary. Pass `--dry-run` to preview without writing.

> **Stale hook caveat:** `hook register` skips hooks it considers equivalent to what's already registered (including old shell-script, old `run-hook`, and old named `hook run` commands). If the SessionStart hook command in the agent settings file is stale and not being updated, edit it manually or re-run register with the flags above.

4. Create a repo-local `SKILL.local.md` augmentation for the commit helper skill:

```bash
mkdir -p .agents/skills/<commit-skill-name>
```

Then write `.agents/skills/<commit-skill-name>/SKILL.local.md`:

```markdown
# <commit-skill-name> local augmentation

## Auto-commit rule

In this repo, commit each unit of work immediately when it is complete
and verified — do not wait for the user to ask.

A unit is complete when:
- All files for that concern are written/edited
- Tests pass (pre-commit hook or manual verify)

Commit, then continue to the next unit. Never finish multiple units
before committing.
```

**Global vs project install:** The Skill Augmentations rule applies augmentations from the same directory as the loaded `SKILL.md`. When the helper is installed globally (`-g`), always-on rules come from the AGENTS.md **Commit Discipline** section and the SessionStart hook. Repo-local `SKILL.local.md` reinforces commit workflows when the agent loads the skill from `.agents/skills/<name>/` — use project-scoped install (option C, or option A/B without `-g`) when you need that reinforcement on every commit-skill invocation.

## What gets applied

**AGENTS.md** (all agents): `## Commit Discipline` section with an **auto-commit rule** (commit each unit immediately — do not wait for the user to ask), a **unit of work** definition (one coherent, independently revertable change — not "everything touched this session"), agent-compatible staging (`git add <files>` plus `git diff --cached`; never `git add .`, `git add -A`, or interactive `git add -p`), and a pointer to the chosen commit helper skill.

**Runtime hook** (Claude Code, Cursor, Codex): SessionStart injection of the commit discipline context so the agent is reminded of the rules at the start of every session.

**SKILL.local.md** (when the commit skill loads from the repo): Per-repo augmentation with the explicit auto-commit rule. For globally installed helpers, AGENTS.md and the SessionStart hook carry always-on discipline.

For agents without hook support, AGENTS.md alone applies the rules.

## Related skills

- **`init`** — create AGENTS.md (Skill Augmentations first) and symlink CLAUDE.md
- **`commit`** — bundled minimal commit helper (cyber-asana-style)
- **`commit-work`** — full staging/splitting workflow from softaworks/agent-toolkit (recommended)
