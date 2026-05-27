---
"cyber-skills": minor
---

Add `--format agent` to all dual-audience CLI commands for LLM-optimized output. Agent format produces terse, structured text output — lower token cost and better reasoning than JSON. Use `--format agent` in skills; use `--format json` for non-LLM machine consumers (scripts, pipelines). `isAutomatedOutput()` is also exported to suppress interactive prompts for both `agent` and `json` formats.
