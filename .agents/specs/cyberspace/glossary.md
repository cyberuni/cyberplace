# glossary — cyberspace ubiquitous language

The harness-agnostic agent-config vocabulary: the terms every cyberspace capability and its specs use with one
fixed meaning. The contract surface is the set of definitions below; conformance is verified **through the
consuming capabilities** (a term is "correct" when `bootstrap/` and `plugin/` use it as defined), not by a
`.feature` of its own.

## Subject

| Term | Meaning |
|---|---|
| **agent harness** | A runtime that hosts an AI coding agent and loads its configuration: Claude Code, Cursor, Codex, GitHub Copilot CLI. |
| **harness-agnostic** | Authored once and working across every major agent harness, rather than tied to one runtime's format. |
| **agent configuration** | The files that configure an agent for a project: `AGENTS.md`, vendor config (e.g. `CLAUDE.md`), skills, subagent definitions, commands. |
| **universal plugin** | One authored plugin that ships across all supported harnesses, built and distributed via the `universal-plugin` npm CLI. |
| **foundation** | cyberspace's role: the baseline layer the specialized plugins (ACED, Quill, SDD) build on top of. |
