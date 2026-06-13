# Agent Extension Nomenclature Survey (May 2026)

Background research for [ADR-0006](../adr/0006-agent-extension-terminology.md). Surveyed terminology used across major AI agent platforms for add-ons that extend agent behavior.

---

## Findings by platform

### agentskills.io / Agent Skills project

**Term: "skills"** (with "plugins" as distribution wrapper)

Skills are defined as a folder containing a `SKILL.md` file with metadata and instructions that tell an agent how to perform a specific task. Progressive disclosure: agents load name + description at startup, pull full SKILL.md on match. Adopted by 35+ platforms as of May 2026 (Claude Code, Codex, Cursor, Gemini CLI, Copilot, VS Code, LangChain, Spring AI, Databricks, Snowflake, and others). Governed by the Agentic AI Foundation under the Linux Foundation.

### vercel-labs/open-plugin-spec

**Term: "plugins"** (distribution unit), **"components"** (subtypes)

Describes itself as "a minimal standard for packaging agent extensions into distributable plugins" — uses "agent extensions" in descriptive prose but not as a spec-level term. Hierarchy: plugin → components (skills, MCP servers, commands, agents, rules, hooks). Delegates skill format definition to the Agent Skills specification. Issue #5 debates treating skill-only packages as plugins.

### Claude Code / Anthropic

**Terms: "skills"** (portable instructions), **"plugins"** (distribution bundles)

Two-tier vocabulary. Skills are task-specific instruction packages (SKILL.md). Plugins are distribution bundles containing skills, MCP servers, slash commands, hooks, and agents. Cross-platform context uses "Agent Skills."

### Cursor

**Terms: "skills"** (Agent Skills spec), **"rules"** (declarative config), **"plugins"** (distribution)

Adopted Agent Skills. Distinguishes always-on rules (`.cursorrules`), on-demand skills (SKILL.md), and plugins (distribution). "Extensions" refers to VS Code IDE tooling, not agent behavior.

### LangChain / LangGraph

**Terms: "tools"** (callable functions), **"skills"** (SKILL.md instructions), **"agents"** (orchestration)

Explicit public distinction: "skills tell the agent how to think; tools tell the agent what it can do." Adopted Agent Skills standard in March 2026.

### CrewAI

**Term: "capabilities"** (umbrella), with five subtypes: tools, MCPs, apps, skills, knowledge

Clearest two-axis framing in the ecosystem: tools make agents *do*; skills make agents *think*. "Capabilities" is the umbrella. Adopted Agent Skills spec in v1.12.

### AutoGen / AG2 / Microsoft Agent Framework

**Term: "tools"** (primary)

AG2 uses "tools" consistently. Microsoft Agent Framework (merging AutoGen + Semantic Kernel) uses `@ai_function` / "tools" vocabulary. Neither uses "skills" as a native architecture term, though both support loading Agent Skills packages.

### Model Context Protocol (MCP)

**Terms: "tools"** (model-executable functions), **"resources"** (read-only context), **"prompts"** (templates), **"capabilities"** (server/client feature negotiation)

"Capabilities" in MCP means the protocol negotiation layer (what a server or client advertises it supports), not a user-facing add-on concept. Does not use "skills" or "plugins" as spec-level terms.

### Microsoft Semantic Kernel (historical)

Renamed its add-ons from **"skills"** to **"plugins"** in January 2024 (v1.0.0) to align with OpenAI's ChatGPT plugin specification. First major industry pivot away from "skills." Placed in maintenance mode in 2025 in favor of the Microsoft Agent Framework.

---

## Candidate umbrella terms assessed

| Term | Assessment |
|---|---|
| **skill** | Cross-platform standard for instruction-based add-ons; does not cover code-based tools |
| **tool** | Runtime callable functions; does not cover instruction-based skills |
| **plugin** | Distribution bundle; conflates packaging with capability |
| **capability** | CrewAI umbrella, but MCP and Anthropic use it for different concepts |
| **extension** | Firmly owned by VS Code IDE tooling; collision risk |
| **agent extension** | Descriptive prose only (open-plugin-spec subtitle); not a formal term anywhere; no collision |

---

## Consensus read

The community has converged on a **three-layer hierarchy** rather than a single umbrella:

```
plugin        ← distribution unit
├── skill     ← instruction-based add-on
└── tool      ← code-based callable function
```

No single term unifies skill and tool at the same level. "Agent extension" is the least encumbered candidate for a coined umbrella term.
