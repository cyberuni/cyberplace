---
"cyber-skills": minor
---

Add `sdd-orchestrator` lifecycle orchestrator to the `sdd` plugin. The orchestrator owns the full SDD state machine (exploration → approval → implementation), letting users fully delegate spec work with a single invocation. `create-spec` and `validate-spec` skills are now thin entry points that invoke `sdd-orchestrator` and relay its output.

Also aligns the `sdd` plugin with the updated SDD process spec: open-questions markup (`<!-- open: needs <role> input on <topic> -->`), a fixed section-to-role mapping (Why→PM, What→Designer, Command surface→Engineer), explicit approval-gate criteria requiring all required reviewers to acknowledge, and `init-sdd` AGENTS.md injection now includes open-questions and author-responsibility rules.
