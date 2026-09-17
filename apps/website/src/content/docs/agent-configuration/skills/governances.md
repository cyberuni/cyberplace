---
title: Governances
description: What governances are — versioned, agent-readable rule sets that tell agents what to do.
---

**Governances** are versioned, agent-readable rule sets that encode *what* to do — imperative rules, conventions, and standards that agents load on demand to complete a workflow correctly.

They answer the question the agent has right now: "what are the rules for this?" [ADRs](/concepts/adrs/) answer a different question: "why did we decide this?" Agents read governances. Humans read ADRs.

## Structure

A governance is a dense, self-contained document:

- **Imperative rules** — must, should, do not; no tutorials or background
- **No rationale sections** — no `## Why` or `## Background`; that belongs in ADRs
- **Self-contained** — agent completes the workflow from the governance alone
- **References at end** — only links to other governances or external docs

## Loading governances

Agents load governances via CLI, not by reading files directly:

```bash
npx cyberplace@<version> governance show universal-plugin
npx cyberplace@<version> governance show universal-plugin --format agent
```

Pinning the version ensures agents always get rules that match the installed tooling.

A governance that has moved to the package owning its subject is read from that package instead — see [Moved governances](#moved-governances).

## Available governances

| Name | Purpose |
| ---- | ------- |
| [universal-plugin](/governances/universal-plugin/) | Format spec for plugins that work across multiple agent harnesses |

## Moved governances

These now ship from the package that owns their subject ([repobuddy/buddy-agent-harness#122](https://github.com/repobuddy/buddy-agent-harness/issues/122)). `npx cyberplace governance show <name>` names the new owner and exits non-zero.

| Name | Now owned by | Purpose |
| ---- | ------------ | ------- |
| [skill-design](/governances/skill-design/) | `cyber-aced` | Rules for authoring `SKILL.md` files |
| [skill-repo-structure](/governances/skill-repo-structure/) | `cyber-aced` | Rules for organizing a skill library repository |
| [agent-tool-output](/governances/agent-tool-output/) | `cyber-aced` | Output rules for scripts, hooks, and CLIs that agents invoke |
| [cli-resolution](/governances/cli-resolution/) | `cyber-aced` | How a skill runs its own scripts and resolves a released CLI it does not ship |

## Governance vs Discipline

Both governance and discipline are verified the same way: give the agent a scenario, observe what it does, check the outcome. The distinction is not how you test compliance — it is:

| | Governance | Discipline |
|---|---|---|
| **When active** | On demand, per workflow | Always-on, any agent or sub |
| **Content shape** | Normative rules for a specific domain | Cross-cutting behavioral habits |
| **Static analysis** | Yes — tools like `audit-skill` check artifacts against governance rules | No — only verifiable by observing behavior |

**Tagline:** Governance defines what is correct. Discipline defines what is habitual.

## Related

- [ADRs](/concepts/adrs/) — why the rules are what they are
- [Discipline](/glossary/#discipline) — always-on behavioral habits
- [Governances overview](/governances/overview/) — CLI usage and authoring rules
- [Agent Configuration](/agent-configuration/overview/) — where always-on rules live
