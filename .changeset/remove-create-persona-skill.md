---
"cyberplace": minor
---

Remove `create-persona-skill`. Its scope is fully covered by `aced:define-agent`, which handles personas as one of three agent-definition modes (Delegated, Invokable, In-context only) alongside subagents.

Migration: use `aced:define-agent` and pick the "In-context only" or "Invokable" mode for a persona.
