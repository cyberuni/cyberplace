---
name: suite-token-opt
status: active
todos:
  - content: "Explore+spec: shared Gherkin parser → plugin-root lib (authoring/suite-format); compatibility marker + fail-loud guard"
    status: pending
  - content: "Explore+spec: resolve-governances --compose mode (mission/resolution) — emit ordered, replace-applied load-list"
    status: pending
  - content: "Explore+spec: mechanical additive-detection engine (git-diff scenario classifier: added vs touched)"
    status: pending
  - content: "Explore+spec: check-suite manifest output (--format toon: names, @frozen/@rubric tags, counts)"
    status: pending
  - content: "Explore+spec: wire judges/conductor — lazy-load discipline into judge defs; consume composed set + manifest"
    status: pending
  - content: "Spec gate (freeze touched .feature) → deliver each engine → impl gate → handoff"
    status: pending
---

# CR-B — SDD suite token reduction

Reduce token usage defining/consuming `.feature` suites by delegating mechanical work to scripts. Project spec: `.agents/specs/sdd` (approved). Design: `suite-token-opt.design.md` (sibling).

Independent of CR-A (relax S4). B does not need A — S4 scans SKILL.md refs, not `.mts` imports, so the plugin-root shared parser never trips it.

## NEXT
Begin explore on todo 1 — the shared Gherkin parser. Locate/confirm the current tokenizer in `plugins/sdd/skills/spec-gate/scripts/check-suite.mts`, decide the plugin-root neutral home, and grill the `authoring/suite-format` node for the parser + manifest contract. Emit the run-start `kind: leash` block to the ledger shard before self-asserting any gate.
