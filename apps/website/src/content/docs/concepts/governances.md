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
npx cyber-skills@<version> governance show skill-design
npx cyber-skills@<version> governance show skill-design --format agent
```

Pinning the version ensures agents always get rules that match the installed tooling.

## Available governances

| Name | Purpose |
| ---- | ------- |
| [skill-design](/governances/skill-design/) | Rules for authoring `SKILL.md` files |
| [skill-repo-structure](/governances/skill-repo-structure/) | Rules for organizing a skill library repository |
| [agent-tool-output](/governances/agent-tool-output/) | Output rules for scripts, hooks, and CLIs that agents invoke |
| [cli-resolution](/governances/cli-resolution/) | Strategy for invoking a Node CLI that may be global, repo-local, or absent |
| [universal-plugin](/governances/universal-plugin/) | Format spec for plugins that work across multiple agent harnesses |

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
- [Discipline](/concepts/glossary/#discipline) — always-on behavioral habits
- [Governances overview](/governances/overview/) — CLI usage and authoring rules
- [Agent Configuration](/concepts/agent-configuration/) — where always-on rules live
