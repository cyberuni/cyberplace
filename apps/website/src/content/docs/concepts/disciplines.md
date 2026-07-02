---
title: Disciplines
description: What disciplines are — always-on behavioral habits for any agent or subagent, distinct from on-demand governance standards.
---

**Disciplines** are always-on behavioral rules that shape how any agent (main or sub) operates. They are not loaded on demand for a specific workflow — they are ambient, active in every session and in every subagent that carries them.

**Tagline:** Governance defines what is correct. Discipline defines what is habitual.

## What disciplines encode

Disciplines encode cross-cutting habits — behaviors the agent should follow everywhere, not just in one workflow:

- **When to act** — commit after each unit of work, not at the end of a session
- **How to behave** — always brief subagents with full context before delegating
- **What to avoid** — never batch unrelated changes into one commit

They are not standards for a specific domain. A discipline does not say "here is what a valid skill looks like" — that is governance. A discipline says "here is how you work, always."

## How disciplines reach the agent

Disciplines are ambient — they reach the agent through any always-on channel:

| Channel | How it works |
|---------|-------------|
| **`AGENTS.md` section** | Written into the repo's `AGENTS.md`; loaded by the harness at session start |
| **SessionStart hook** | Shell command registered to fire at session start; injects rules from `AGENTS.md` or a pinned CLI |
| **Agent definition** | Written into a subagent's instruction block; active whenever that subagent is spawned |

A single discipline rule can be delivered through more than one channel — for example, commit discipline is both written in `AGENTS.md` and reinforced by a SessionStart hook that re-injects it even if `AGENTS.md` is absent.

## Disciplines vs Governances

Both are verified the same way: give the agent a scenario, observe what it does, check the outcome. The distinction is not how you test them.

| | Discipline | Governance |
|---|---|---|
| **When active** | Always-on, any agent or sub | On demand, per workflow |
| **Content shape** | Cross-cutting behavioral habits | Normative rules for a specific domain |
| **Delivery channel** | Hooks, `AGENTS.md`, agent definitions | `governance show` via CLI |
| **Static analysis** | Not applicable — habits require behavioral observation | Yes — tools like `audit-skill` check artifacts against governance rules |

## Verifying discipline compliance

Discipline compliance is verified by behavioral testing: give the agent a scenario with the discipline active, observe what the agent does, and check the outcome. There is no document to diff — only behavior to observe.

This is the same mechanism used to verify governance compliance. The difference is content, not test method.

[ACED](/aced/overview/) provides the evaluation framework for both.

## Example: Commit Discipline

[Commit Discipline](/disciplines/commit-discipline/) is the canonical example. It encodes:

- Commit after each unit of work — do not batch
- One concern per commit, never two unrelated changes
- Stage explicitly by file, verify with `git diff --cached`
- Use Conventional Commits

It is registered as a SessionStart hook and written into `AGENTS.md`. Neither requires the agent to load anything — the rules are always present.

## Creating a discipline

A discipline is a section in `AGENTS.md` (or a subagent definition), optionally reinforced by a SessionStart hook. There is no special file format — the rule text itself is the discipline.

To register a SessionStart hook that injects a section:

```bash
node packages/cyberplace/bin/cyberplace.mjs hook register \
  --name my-discipline --event SessionStart \
  --extract AGENTS.md --heading "My Discipline"
```

The hook re-injects the named section from `AGENTS.md` at the start of every session, so the rules stay active even when `AGENTS.md` is not otherwise loaded.

## Related

- [Commit Discipline](/disciplines/commit-discipline/) — the canonical example
- [init-commit-discipline skill](/skills/init-commit-discipline/) — sets up commit discipline in a repo
- [Governances](/concepts/governances/) — on-demand domain standards; the complementary concept
- [Agent Configuration](/concepts/agent-configuration/) — full picture of what shapes agent behavior
- [ADR-0001](/concepts/adrs/) — the decision that split governance and discipline into separate terms
