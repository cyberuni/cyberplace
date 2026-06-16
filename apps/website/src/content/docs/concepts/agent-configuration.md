---
title: Agent Configuration
description: What agent configuration is — the collective term for all instructions an agent runtime loads to shape behavior.
---

**Agent configuration** is the collective term for all the instructions an agent runtime loads to shape how it behaves. A change to any of these artifacts changes how the agent responds, decides, and acts — making them the primary unit of quality control in agentic workflows.

## Artifacts

| Artifact | What it does |
| -------- | ------------ |
| **`AGENTS.md`** | Always-on rules injected at session start — commit discipline, conventions, project structure, commands to run |
| **Skills** (`SKILL.md`) | On-demand workflows loaded when the agent matches a situation — scaffolding, review, publishing |
| **Subagent definitions** | Instructions for a specialized agent invoked as a sub-task — a judge, a researcher, a code reviewer |
| **Commands** | Named slash-command entries that trigger a specific workflow in the agent IDE |

Together these artifacts define the *behavior surface* of an agentic system. Skills and commands are loaded on demand; `AGENTS.md` and session hooks are always active.

## Why it matters

Agent configuration has the same failure modes as LLM prompts:

- **Silent regression** — editing a skill changes behavior without any signal that something broke
- **Trigger mismatch** — a skill's `description:` doesn't match when agents actually invoke it
- **Ambiguous rules** — vague language in `AGENTS.md` causes inconsistent agent behavior
- **Coverage gaps** — instructions work for common cases but fail silently on edge cases

Unlike code, agent configuration has no type-checker, no linter, and no test runner built in. Correctness is measured by whether the agent does the right thing in real situations — which requires explicit evaluation.

## Evaluation

[ACES (Agent Config Evaluation System)](/aces/overview/) provides layered evaluation for agent configuration:

1. **Structural** — does the artifact have the required fields and format?
2. **Trigger** — does the agent correctly identify when to invoke this artifact?
3. **Behavior** — when invoked, does the agent follow the steps and rules?
4. **Quality** — is the output the agent produces actually good?

## Related

- [ACES Overview](/aces/overview/) — eval system for agent configuration
- [Skill Design governance](/governances/skill-design/) — authoring rules for `SKILL.md` files
- [Commit Discipline](/disciplines/commit-discipline/) — an example of always-on `AGENTS.md` configuration
- [init skill](/skills/init/) — sets up `AGENTS.md` for a repo
