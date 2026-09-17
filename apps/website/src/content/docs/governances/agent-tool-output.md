---
title: Agent Tool Output
description: "Moved to cyber-aced: output rules for scripts, hooks, and CLIs that agents invoke."
---

:::caution[Moved]
`agent-tool-output` is no longer shipped by `cyberplace`. It now ships from **`cyber-aced`**, the package that owns agent-configuration authoring.
:::

Read it at [`plugins/aced/governances/agent-tool-output.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/agent-tool-output.md).

`npx cyberplace@<version> governance show agent-tool-output` prints a one-line notice naming the new owner and exits non-zero. That forwarder is kept for one release and removed once the pinned callers migrate.

## How a skill reads it now

A skill no longer calls a CLI at run time. `universal-plugin plugin build` copies the governance into `<skill>/references/governances/agent-tool-output.md` from the owning package, and the skill reads that committed copy — after checking `.agents/governances/agent-tool-output.md` for a project override. The lookup order is stated in [`skill-design`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-design.md).

See [repobuddy/buddy-agent-harness#122](https://github.com/repobuddy/buddy-agent-harness/issues/122) for the migration.
