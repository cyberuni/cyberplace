---
title: CLI Resolution
description: "Moved to cyber-aced: how a skill runs its own scripts and resolves a released CLI."
---

:::caution[Moved]
`cli-resolution` is no longer shipped by `cyberplace`. It now ships from **`cyber-aced`**, the package that owns agent-configuration authoring.
:::

Read it at [`plugins/aced/governances/cli-resolution.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/cli-resolution.md).

`npx cyberplace@<version> governance show cli-resolution` prints a one-line notice naming the new owner and exits non-zero. That forwarder is kept for one release and removed once the pinned callers migrate.

## How a skill reads it now

A skill no longer calls a CLI at run time. `universal-plugin plugin build` copies the governance into `<skill>/references/governances/cli-resolution.md` from the owning package, and the skill reads that committed copy — after checking `.agents/governances/cli-resolution.md` for a project override. The lookup order is stated in [`skill-design`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-design.md).

See [repobuddy/buddy-agent-harness#122](https://github.com/repobuddy/buddy-agent-harness/issues/122) for the migration.
