---
"cyber-skills": minor
---

Remove `create-persona-skill`. Its scope is fully covered by `aces:define-agent`, which handles personas as one of three agent-definition modes (Delegated, Invokable, In-context only) alongside subagents.

Migration: use `aces:define-agent` and pick the "In-context only" or "Invokable" mode for a persona.
