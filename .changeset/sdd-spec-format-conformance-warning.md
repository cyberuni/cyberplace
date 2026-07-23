---
"cyber-sdd": minor
---

The SDD spec-judge now emits a non-blocking spec-format conformance warning when a behavioral
`spec.md` is missing a required section — especially `## Use Cases`, `## Control Flow` (CFG), or
`## Scenario map`. The warning is surfaced in the spec-gate report and never blocks the gate, sets
`ALIGNED: false`, or short-circuits the lenses on its own. Reference and descriptive nodes raise no
warning.
