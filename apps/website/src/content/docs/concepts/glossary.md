---
title: Glossary
description: Common terms used in agentic systems — models, harnesses, runtimes, signals, and more.
---

A reference for terms used across agentic tooling and this documentation.

## Model

The large language model (LLM) that generates responses and decisions — for example, Claude Sonnet or GPT-4. The model reads context (prompt + history + tools) and produces text or tool calls. It has no persistent memory between sessions on its own.

## Agent

A model augmented with tools and instructions that can take actions — read files, run commands, call APIs. The model alone is passive; the agent acts.

## Agent harness

The application or CLI that wraps the model and makes it an agent — Claude Code, Cursor, Codex CLI, Windsurf. The harness provides the tool set, loads [agent configuration](/concepts/agent-configuration/), manages the session, and surfaces the interface to the user.

Different harnesses support different features. A skill that works in Claude Code may behave differently in Cursor. See [Commands](/concepts/commands/) for a harness compatibility example.

## Agent runtime

The execution environment the harness operates in during a session — the process, the working directory, the environment variables, the user's shell. Skills and hooks run inside the agent runtime.

## Session

One continuous conversation between a user and an agent harness. Sessions start fresh — the model has no memory of prior sessions unless context is explicitly injected (via `AGENTS.md`, hooks, or memory files). A session ends when the conversation is closed or reset.

## Context window

The total amount of text (measured in tokens) the model can see at once — the conversation history, loaded instructions, tool results, and current message. When the window fills, older content is summarized or dropped. Keeping [agent configuration](/concepts/agent-configuration/) concise preserves space for actual work.

## Token

The unit the model uses to process text. Roughly one word or one punctuation mark, but varies by model. Relevant for understanding context window limits and cost.

## Tool

A function the agent can call during a session — read a file, run a bash command, search the web, write to disk. The harness defines which tools are available. Agent behavior is shaped heavily by what tools are exposed.

## Signal

An observable event or output that indicates something happened — a hook firing, a tool call completing, a test passing or failing, a CLI exit code. Skills and disciplines often describe what signals to watch for and how to respond.

## Hook

A shell command registered to fire when a specific agent event occurs — session start, before a tool call, after a response. Hooks inject always-on behavior without requiring the model to remember to do it. See [Commit Discipline](/disciplines/commit-discipline/) for a concrete example.

## Skill

A reusable, on-demand workflow the agent loads when it matches a situation. Defined in a `SKILL.md` file. Auto-invoked by the model when the description matches, or explicitly invoked by the user via `/name`. See [Skills overview](/skills/overview/).

## Discipline

A class of always-on behavioral rules that shape how any agent (main or sub) operates — not loaded on demand, always active via any channel (hooks, `AGENTS.md`, or agent definitions). [Commit Discipline](/disciplines/commit-discipline/) is an example: rules about when and how to commit that apply in every session.

Discipline and [Governance](#governance) are verified the same way: give the agent a scenario and observe what it does. The distinction is not how you test them — it is *when* the rule is active (always vs on demand) and *what kind of content* it encodes (cross-cutting habits vs domain-specific normative rules). See [Disciplines](/concepts/disciplines/).

## Subagent

A specialized agent spawned by the main agent to handle a sub-task — a code reviewer, a judge, a researcher. The main agent delegates, collects the result, and continues. Subagents start fresh with no memory of the parent session unless explicitly briefed.

## Prompt

The text input sent to the model at each turn — the user's message combined with system instructions, loaded skills, tool results, and conversation history. Everything the model sees is part of the prompt.

## Governance

A versioned, agent-readable rule set that tells agents *what* to do for a specific domain. Loaded on demand via CLI. Dense and imperative — no rationale, no background.

Governance and [Discipline](#discipline) are verified the same way: give the agent a scenario and observe what it does. The distinction is *when* the rule is active (on demand vs always-on) and *what kind of content* it encodes (domain-specific normative rules vs cross-cutting habits). Governance's crisp rule text additionally enables static artifact analysis — tools like `audit-skill` can check documents against governance rules without running an agent. See [Governances](/concepts/governances/).

## ADR

Architecture Decision Record. A frozen document that records *why* a decision was made — context, trade-offs, rejected options. Written for humans, not agents. See [ADRs](/concepts/adrs/).
