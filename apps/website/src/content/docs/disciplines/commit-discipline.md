---
title: Commit Discipline
description: Rules for disciplined commits in AI-agent workflows — unit of work, Conventional Commits, and session hooks.
---

Commit discipline is a session-scoped layer injected into `AGENTS.md` and reinforced by SessionStart hooks. It differs from [governances](/governances/overview/) — disciplines are always-on rules the agent follows every session, not reference standards loaded on demand.

## What it is

Commit discipline encodes:

- **When to commit** — after each unit of work, not at the end
- **What counts as a unit** — one coherent, independently revertable change
- **How to stage** — `git add <files>`, verify with `git diff --cached`
- **Message format** — Conventional Commits

## Rules

**Unit of work:** one coherent, independently revertable change — one feature, one bugfix, one refactor in one domain, one config change. Never two unrelated concerns in one commit. A TDD red-green-refactor cycle alone is not a commit boundary; commit when the full intended change is complete and tests pass.

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: `git add <files>`, then verify with `git diff --cached`
- Never use `git add .`, `git add -A`, or `git add -p` (interactive — agents cannot run it)
- Never commit with red tests; run the repo's validation command first

## Auto-commit

When opted in, the auto-commit rule adds:

> When a unit of work is complete and verified, commit it immediately — do not wait for the user to ask. Batching multiple units into one commit, or finishing all work before committing, are both violations of this rule.

Auto-commit is opt-in — `/repobuddy:repo enhance` asks before adding this rule.

## Conventional Commits reference

| Type | When to use |
| ---- | ----------- |
| `feat:` | New feature or behavior |
| `fix:` | Bug fix |
| `refactor:` | Code change with no behavior change |
| `test:` | Adding or updating tests |
| `docs:` | Documentation only |
| `chore:` | Tooling, config, dependencies |

Scopes are optional: `feat(auth):`, `fix(cli):`. Subject line: imperative mood, ≤72 characters.

## Setting it up

:::note[Moved to repobuddy]
The `commit-discipline` plugin's `init-commit-discipline` and `commit` skills are retired. Install the [`repobuddy`](https://github.com/repobuddy/repobuddy) plugin (4.6.0+) instead.
:::

Run `/repobuddy:repo enhance` in your agent. It offers the `## Commit Discipline` section for the repo's `AGENTS.md`, or hands it to you for the global `~/.agents/AGENTS.md`. Use `repobuddy:commit` as the commit helper.

To reinject the section at every session start, register a SessionStart hook yourself:

```bash
npx cyberplace@<exact> hook register \
  --name commit-discipline --event SessionStart \
  --extract AGENTS.md --heading "Commit Discipline"
```

## How it works at runtime

On Claude Code, Cursor, and Codex, a SessionStart hook runs:

```bash
npx cyberplace@<version> hook run \
  --extract AGENTS.md \
  --heading "Commit Discipline"
```

This injects the `## Commit Discipline` section from `AGENTS.md` into the agent's context at the start of every session — so the rules are active without the agent having to load them manually.

For agents without hook support, the `AGENTS.md` section alone carries the rules.

## Upgrading

After upgrading `cyberplace`, re-run `hook register` with the new exact version to bump the pin in the SessionStart hook command.

## Related

- `/repobuddy:repo enhance` ([repobuddy](https://github.com/repobuddy/repobuddy)) — adds the Commit Discipline section to `AGENTS.md`
- `repobuddy:commit` ([repobuddy](https://github.com/repobuddy/repobuddy)) — commit helper
- [hook CLI](/cli/hook/) — `hook register` and `hook run` commands
