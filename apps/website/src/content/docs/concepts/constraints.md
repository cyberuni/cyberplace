---
title: Constraints
description: What constraints are — hard behavioral limits that override agent judgment, distinct from governance standards and tool permissions.
---

**Constraints** are hard behavioral limits that override agent judgment. They are not normative standards (that is [governance](/concepts/governances/)) and not tool fences (that is [permissions](/concepts/permissions/)). A constraint says: regardless of what the agent decides is correct, this ceiling or boundary applies.

**Tagline:** Governance defines what is correct. Constraints define what is bounded.

## What constraints encode

Constraints operate across three dimensions:

- **Resource limits** — maximum turns, effort level, token budget; the agent stops when it hits the ceiling regardless of task completion
- **Behavioral guardrails** — operations that must never happen (delete production data, push without tests); enforced via PermissionRequest or PermissionDenied hooks
- **Escalation triggers** — conditions under which the agent must stop and ask rather than act autonomously

## How constraints reach the agent

| Mechanism | What it controls |
|-----------|-----------------|
| **Agent frontmatter `maxTurns`** | Hard turn ceiling for the subagent |
| **Agent frontmatter `effort`** | Reasoning effort cap (low / medium / high / xhigh / max) |
| **Hook: `PermissionRequest`** | Intercept and block or modify tool calls before they run |
| **Hook: `PermissionDenied`** | React when a tool call is blocked — log, escalate, or abort |
| **Discipline** | Always-on behavioral guardrails written into `AGENTS.md` |

The first two are structural — the harness enforces them. The last three are behavioral — the agent must follow them, and compliance is verified by observation.

## Constraints vs Governance vs Permissions

| | Constraints | Governance | Permissions |
|---|---|---|---|
| **What it limits** | Behavior ceilings and guardrails | Normative correctness | Tool invocation |
| **Who enforces** | Harness (structural) or discipline (behavioral) | Agent judgment guided by rules | Harness (always) |
| **Can be overridden by agent?** | Structural: no. Behavioral: only if discipline compliance fails | Agent must follow; failure is a quality defect | No |

## Escalation as a constraint

Escalation is a special class of constraint: instead of stopping the agent, it routes control back to a human or an external verifier. Common patterns:

- **PermissionRequest hook** — intercepts a tool call and returns a custom allow/deny decision
- **`agent` hook type** — spawns an agentic verifier to approve or reject the action
- **Discipline rule** — "if the action affects shared infrastructure, pause and confirm"

Escalation constraints define the boundary of agent autonomy. They are the mechanism behind "check with the user before proceeding on risky actions."

## Plugin distribution

Structural constraints (`maxTurns`, `effort`) are bundled in the agent definition and travel with the plugin. Hook-based constraints are registered when the plugin is installed. Discipline-based guardrails are injected via SessionStart hooks.

**In the plugin schema:**

| Schema | Field |
|--------|-------|
| Claude Code agent frontmatter | `maxTurns`, `effort` |
| Claude Code hooks | `PermissionRequest`, `PermissionDenied`, `agent` hook type |
| Open Plugin Spec agent frontmatter | same pattern |
| *(no top-level plugin field)* | — |

## Related

- [Permissions](/concepts/permissions/) — tool-level capability boundaries
- [Disciplines](/concepts/disciplines/) — always-on behavioral habits that encode soft guardrails
- [Governances](/concepts/governances/) — normative standards for specific domains
- [Agent Configuration](/concepts/agent-configuration/) — full picture of what shapes agent behavior
