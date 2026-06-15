---
title: Architecture Decision Records (ADRs)
description: What ADRs are — frozen records of why a decision was made, separate from what the rules are.
---

**Architecture Decision Records (ADRs)** are frozen documents that capture *why* a significant decision was made — the context, the trade-offs considered, and the options rejected. They do not change after the decision is recorded.

## What belongs in an ADR

- The problem or constraint that forced a choice
- The options that were evaluated
- The reasoning behind the chosen option
- Rejected alternatives and why they were ruled out

ADRs do not contain rules for agents to follow. That belongs in [Governances](/concepts/governances/) or [`AGENTS.md`](/concepts/agent-configuration/).

## Why they are separate from governances

| | ADR | Governance |
|--|-----|------------|
| **Records** | Why a decision was made | What the rules are |
| **Changes** | Never (frozen at decision time) | When the standard evolves |
| **Read by** | Humans understanding history | Agents following rules |
| **Contains** | Context, trade-offs, rejected options | Imperative must/should/do-not rules |

A governance may reference an ADR for background, but agents do not need the ADR to do their work.

## Related

- [Governances](/concepts/governances/) — the rules that came out of decisions
- [Agent Configuration](/concepts/agent-configuration/) — where always-on rules live
