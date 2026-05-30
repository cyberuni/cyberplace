---
title: Introduction
description: What cyber-skills is and why it exists.
---

**cyber-skills** is an opinionated collection of skills, hooks, and workflows for AI agents — Claude Code, Cursor, Codex, and others. It is published as the [`cyber-skills`](https://www.npmjs.com/package/cyber-skills) npm package; skills install via the [Skills CLI](https://github.com/vercel-labs/skills).

## What is a skill?

A skill is a `SKILL.md` file that an AI agent loads on demand. It encodes a workflow — steps, decisions, and tool use — so the agent behaves consistently across sessions and teammates. Skills are plain Markdown; no framework, no runtime.

## What cyber-skills provides

| Layer | Purpose |
| ----- | ------- |
| **Skills** | Public agent skills under `skills/` — the primary interface |
| **Hooks** | SessionStart instruction hooks for commit discipline (`hook register` / `hook run`) |
| **CLI** | `cyber-skills` binary used by skills and available for direct use when needed |
| **Governances** | Version-pinned agent-tool contracts (`governance list` / `governance show`) |

## Two surfaces, one release

Skills install from **GitHub**; the CLI installs from **npm**. These are independent surfaces — see [Supply Chain](/getting-started/supply-chain/) for how to pin and trust each one.

## Quick orientation

- **New to the repo?** Start with [Installation](/getting-started/installation/) then run the [`init` skill](/skills/init/).
- **Want disciplined commits?** Follow up with [`init-commit-discipline`](/skills/init-commit-discipline/).
- **Authoring skills?** Read the [Skill Design governance](/governances/skill-design/).
- **Advanced scripting?** See the [CLI Reference](/cli/overview/).
