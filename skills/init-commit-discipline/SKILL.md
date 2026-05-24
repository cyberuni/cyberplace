---
name: init-commit-discipline
description: "Use this skill when initializing commit discipline — AGENTS.md rules and SessionStart hooks where agents support them."
---

# Init Commit Discipline

Inject always-on commit discipline into the repo: an AGENTS.md section for every agent, plus SessionStart hooks on agents that support them.

## Prerequisites

- `AGENTS.md` should exist (run the `init` skill first if missing).
- The `cyber-skills` npm package must be invokable (see below).

## Commit helper skill

Commit discipline references a **commit helper skill** for staging, splitting, and message writing. Resolve one before injecting AGENTS.md.

Run from the repo root:

```bash
npx tsx skills/init-commit-discipline/scripts/resolve-commit-skill.mts --check
```

If none are detected, ask the user to choose:

| Option | Action |
|--------|--------|
| **A — Recommended** | Install [`softaworks/agent-toolkit@commit-work`](https://github.com/softaworks/agent-toolkit): `npx skills add softaworks/agent-toolkit --skill commit-work -g` |
| **B — User override** | User names another commit skill to install or reference |
| **C — Bundled fallback** | Install cyber-skills' minimal `commit` skill: `npx skills add cyberuni/cyber-skills --skill commit -g` |

Do not proceed until a commit helper skill name is chosen.

## Ensure cyber-skills package

Check in order:

1. **devDependency** — `cyber-skills` in `package.json` and runnable via `pnpm exec cyber-skills` or `npx cyber-skills`
2. **Pinned npx** — `npx cyber-skills@<version> <subcommand>` with an explicit version (never `@latest`)
3. If unavailable, ask the user to run `pnpm add -D cyber-skills` (recommended) or confirm a pinned npx version

## Workflow

1. Resolve commit helper skill (above).
2. Inject AGENTS.md section:

```bash
npx cyber-skills inject-commit-discipline --commit-skill <name>
```

3. Register SessionStart hook:

```bash
npx cyber-skills register-hooks --set commit-discipline
```

Pass `--verbose` on either command for a human-readable summary. Pass `--dry-run` to preview without writing.

## What gets applied

**AGENTS.md** (all agents): `## Commit Discipline` with Conventional Commits rules and a pointer to the chosen commit helper skill.

**Runtime hook** (Claude Code, Codex): SessionStart injection of the same discipline so the agent commits each self-contained unit of work before moving on.

For agents without hook support, AGENTS.md alone applies the rules.

## Related skills

- **`init`** — create AGENTS.md and register skill-augmentation hooks
- **`commit`** — bundled minimal commit helper (cyber-asana-style)
- **`commit-work`** — full staging/splitting workflow from softaworks/agent-toolkit (recommended)
