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
2. Ask whether to enable **auto-commit** — commit each unit of work immediately when complete and verified, without waiting for the user to ask.
3. Inject AGENTS.md section (substitute the exact version from `npm view cyber-skills version`):

```bash
# With auto-commit (opt-in):
npx cyber-skills@<version> commit inject --commit-skill <name> --auto-commit

# Without auto-commit:
npx cyber-skills@<version> commit inject --commit-skill <name>
```

4. Register SessionStart hook:

```bash
npx cyber-skills@<version> hook register \
  --name commit-discipline \
  --event SessionStart \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

Pass `--verbose` on inject or register for a human-readable summary. Pass `--dry-run` to preview without writing.

> **Stale hook caveat:** `hook register` skips hooks it considers equivalent to what's already registered (including old shell-script, old `run-hook`, and old named `hook run` commands). If the SessionStart hook command in the agent settings file is stale and not being updated, edit it manually or re-run register with the flags above.

5. Optional repo-local `SKILL.local.md` augmentation — only when **both** are true:
   - the user opted in to auto-commit, and
   - the commit helper is or will be **project-scoped** under `.agents/skills/<commit-skill-name>/`

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

**Global vs project install:** When the helper is installed globally (`-g`), auto-commit in AGENTS.md and the SessionStart hook are the always-on path. Repo-local `SKILL.local.md` only applies when the agent loads the skill from `.agents/skills/<name>/` (project-scoped install). Skip step 5 for global helpers — AGENTS.md + hook are sufficient.

## What gets applied

**AGENTS.md** (all agents): `## Commit Discipline` with unit-of-work definition, agent-compatible staging (`git add <files>` plus `git diff --cached`; never `git add .`, `git add -A`, or interactive `git add -p`), Conventional Commits guidance, and a pointer to the chosen commit helper skill. When the user opts in to auto-commit, the inject step adds the **Auto-commit rule** block to this section.

**Runtime hook** (Claude Code, Cursor, Codex): SessionStart injection of the Commit Discipline section so agents are reminded of the rules at the start of every session.

**SKILL.local.md** (optional): Secondary auto-commit reinforcement when the commit helper loads from the repo. Skip for global installs.

For agents without hook support, AGENTS.md alone applies the rules.

## Related skills

- **`init`** — create AGENTS.md (Skill Augmentations first) and symlink CLAUDE.md
- **`commit`** — bundled minimal commit helper (cyber-asana-style)
- **`commit-work`** — full staging/splitting workflow from softaworks/agent-toolkit (recommended)
