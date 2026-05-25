---
name: init-commit-discipline
description: "Use this skill when initializing commit discipline — AGENTS.md rules and SessionStart hooks where agents support them."
---

# Init Commit Discipline

Inject always-on commit discipline into the repo: an AGENTS.md section for every agent, plus SessionStart hooks on agents that support them.

## Prerequisites

- `AGENTS.md` should exist (run the `init` skill first if missing).
- The `inject-local-augmentations` SessionStart hook should be registered (run the `init` skill — this is what makes SKILL.local.md augmentations work).
- The `cyber-skills` npm package must be accessible via npx or local install (see below).

## Commit helper skill

Commit discipline references a **commit helper skill** for staging, splitting, and message writing. Resolve one before injecting AGENTS.md.

Run from the repo root:

```bash
node skills/init-commit-discipline/scripts/resolve-commit-skill.mjs --check
```

If none are detected, ask the user to choose:

| Option | Action |
|--------|--------|
| **A — Recommended** | Install [`softaworks/agent-toolkit@commit-work`](https://github.com/softaworks/agent-toolkit): `npx skills add softaworks/agent-toolkit --skill commit-work -g` |
| **B — User override** | User names another commit skill to install or reference |
| **C — Bundled fallback** | Install cyber-skills' minimal `commit` skill: `npx skills add cyberuni/cyber-skills --skill commit -g` |

Do not proceed until a commit helper skill name is chosen.

## Ensure cyber-skills package

Do **not** add `cyber-skills` as a devDependency by default — it is bin-only tooling and will trigger unused-dependency warnings (for example from knip) in repos that never import it.

Check in order:

1. **Pinned npx (default)** — resolve `npm view cyber-skills version`, then `npx cyber-skills@<exact> <subcommand>` (never `@latest`, never a literal `<version>` placeholder). No `package.json` change; use when init skills are installed globally.
2. **Existing devDependency** — if `cyber-skills` is already in `package.json`, use `pnpm exec cyber-skills` or the local bin.
3. **Optional devDependency** — only when the user needs offline CLI access *and* the AI agent runs locally against that repo: `pnpm add -D cyber-skills`.
4. If neither npx nor a local install works, ask the user to confirm an exact pinned version or opt in to the devDependency above.

## Workflow

1. Resolve commit helper skill (above).
2. Inject AGENTS.md section (substitute the exact version from `npm view cyber-skills version`):

```bash
npx cyber-skills@0.1.2 inject-commit-discipline --commit-skill <name>
```

3. Register SessionStart hook:

```bash
npx cyber-skills@0.1.2 register-hooks --set commit-discipline
```

Pass `--verbose` on either command for a human-readable summary. Pass `--dry-run` to preview without writing.

> **Stale hook caveat:** `register-hooks` skips hooks it considers equivalent to what's already registered (including old shell-script commands). If the SessionStart hook command in the agent settings file is stale and not being updated, edit it manually to match the expected format: `npx cyber-skills@<version> run-hook commit-discipline`.

4. Create a SKILL.local.md augmentation for the commit helper skill:

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

This file is injected at SessionStart by the `inject-local-augmentations` hook (registered by the `init` skill), giving the agent a repo-specific reinforcement whenever the commit skill is active. Without this, agents may read the AGENTS.md rule but still batch commits when working through multi-step tasks.

## What gets applied

**AGENTS.md** (all agents): `## Commit Discipline` section with an **auto-commit rule** (commit each unit immediately — do not wait for the user to ask), a **unit of work** definition (one coherent, independently revertable change — not "everything touched this session"), agent-compatible staging (`git add <files>` plus `git diff --cached`; never `git add .`, `git add -A`, or interactive `git add -p`), and a pointer to the chosen commit helper skill.

**Runtime hook** (Claude Code, Codex): SessionStart injection of the commit discipline context so the agent is reminded of the rules at the start of every session.

**SKILL.local.md** (all agents with `inject-local-augmentations` hook): Per-repo augmentation for the commit helper skill, injected at SessionStart, with the explicit auto-commit rule. This is the most reliable enforcement mechanism — it fires on every session and is scoped to the commit skill's activation context.

For agents without hook support, AGENTS.md alone applies the rules.

## Related skills

- **`init`** — create AGENTS.md and register skill-augmentation hooks
- **`commit`** — bundled minimal commit helper (cyber-asana-style)
- **`commit-work`** — full staging/splitting workflow from softaworks/agent-toolkit (recommended)
