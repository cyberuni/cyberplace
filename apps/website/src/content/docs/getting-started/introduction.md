---
title: Introduction
description: What cyberplace is and why it exists.
---

**cyberplace** is a universal toolbox for the Cyber Era — a skill library, CLI, and plugin marketplace for AI coding agents (Claude Code, Cursor, Codex, GitHub Copilot CLI). It is a pnpm + turbo monorepo: the [`cyberplace`](https://www.npmjs.com/package/cyberplace) npm package ships the CLI, and the repo doubles as a [plugin marketplace](/marketplace/).

## What is a skill?

A skill is a `SKILL.md` file that an AI agent loads on demand. It encodes a workflow — steps, decisions, and tool use — so the agent behaves consistently across sessions and teammates. Skills are plain Markdown; no framework, no runtime. See [Skills](/concepts/skills/) for the concept.

## What cyberplace provides

| Layer | Purpose |
| ----- | ------- |
| **CLI** | The `cyberplace` binary — install and manage skills (`add` / `find` / `list` / `update`), register hooks, and show governances |
| **Plugins** | Bundles of skills, hooks, and governances shipped under [`plugins/`](https://github.com/cyberuni/cyberplace/tree/main/plugins) and listed in the [Marketplace](/marketplace/) — `sdd`, `aced`, `quill`, `cyberspace`, `cyberfleet`, `cyberlegion`, `commit-discipline`, and more |
| **Hooks** | SessionStart instruction hooks (e.g. commit discipline) — `hook register` / `hook run` |
| **Governances** | Version-pinned agent-tool contracts (`governance list` / `governance show`) |

## Two surfaces, one release

Plugins and skills install from **GitHub**; the CLI installs from **npm**. These are independent surfaces — see [Supply Chain](/getting-started/supply-chain/) for how to pin and trust each one.

## Quick orientation

- **New here?** Start with [Installation](/getting-started/installation/), then browse the [Marketplace](/marketplace/).
- **Want disciplined commits?** Install the `commit-discipline` plugin and see [Commit Discipline](/disciplines/commit-discipline/).
- **Authoring skills?** Read the [Skill Design governance](/governances/skill-design/).
- **Advanced scripting?** See the [CLI Reference](/cli/overview/).
