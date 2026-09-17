---
title: Skill Design
description: "Moved to cyber-aced: rules for authoring SKILL.md files that agents load on demand."
---

:::caution[Moved]
`skill-design` is no longer shipped by `cyberplace`. It now ships from **`cyber-aced`**, the package that owns agent-configuration authoring.
:::

Read it at [`plugins/aced/governances/skill-design.md`](https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-design.md).

`npx cyberplace@<version> governance show skill-design` prints a one-line notice naming the new owner and exits non-zero. That forwarder is kept for one release and removed once the pinned callers migrate.

## How a skill reads it now

A skill no longer calls a CLI at run time. `universal-plugin plugin build` copies the governance into `<skill>/references/governances/skill-design.md` from the owning package, and the skill reads that committed copy — after checking `.agents/governances/skill-design.md` for a project override. The lookup order is stated in the document itself.

See [repobuddy/buddy-agent-harness#122](https://github.com/repobuddy/buddy-agent-harness/issues/122) for the migration.
