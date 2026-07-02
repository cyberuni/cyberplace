---
"cyberplace": minor
---

Add `aced:define-skill` skill for authoring and improving workflow skills — process, tool-based, or standard SKILL.md files — the ACED-native successor to the legacy `create-skill`. Routes the request (deferring agents/personas to `define-agent`, rule sets to `define-governance`, session extraction to `skillify`), settles scope via the five design questions, picks the pattern and placement, scaffolds the SKILL.md (plus a README for a project-public skill) with a trigger-bearing description, runs the structural audit, and hands off to the ACED eval loop (`start-mission` / `add-scenario` / `run`) to spec and score it instead of embedding a legacy trigger-query test. Ships with a frozen `.feature` (fit: strong) and a scenario→rubric eval suite.
