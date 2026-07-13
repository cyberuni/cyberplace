---
cr: align-spec-engine
project: sdd
status: active
todos:
  - content: "Scaffold plugins/sdd/skills/align-spec/ (SKILL.md + README.md), mirror check-spec-structure"
    status: completed
  - content: "Build scripts/align-spec.mts engine — mechanical checks only (validity, scenario-diff narrowing, node iteration, check-mode exit, write-boundary)"
    status: completed
  - content: "Build scripts/align-spec.test.mts node:test over exported pure functions"
    status: completed
  - content: "SKILL.md documents judge-orchestrated arms (coverage-gap, contradiction, reconcile direction) — engine ships no code for these"
    status: completed
  - content: "Wire test + --check into root verify:specs script"
    status: completed
  - content: "Impl gate — cold impl-judge over the 12 frozen scenarios; then handoff PR"
    status: completed
---

# CR: build the align-spec engine

Implement the align-spec tool against its already-frozen contract. Spec node:
`.agents/specs/sdd/project-spec/align-spec/` (README.md + align-spec.feature, `@frozen`).
Root sdd spec is `status: approved` — this is a deliver (build-to-keep), no spec re-open.

## Contract → artifact boundary
13 frozen scenarios split two ways, mirroring `check-spec-structure` (deterministic engine
+ judgment arms documented in prose, no engine code for the semantic parts):

- **Mechanical (engine .mts + node:test + actual run):** scenario-diff flags a narrowing of the
  frozen suite (reuse the `spec-gate/scripts/classify-edit-class.mts` gherkin-cli diff pattern);
  check mode exits non-zero on drift + writes nothing; check mode exits zero when aligned;
  detect runs over exactly the chosen node set (iteration); reconcile write-boundary (writes only
  prose/scenarios, never status/approval/freeze).
- **Judge-orchestrated (SKILL.md procedure prose, engine ships no code — semantic, "judge-only"
  per the spec README):** detect coverage-gap (Builder lens); detect contradiction; detect over an
  aligned spec → no drift; reconcile in-scope→add scenario / out-of-scope→trim prose /
  contradiction→align losing side (Oracle then Builder lens); a gap that would narrow a frozen
  scenario escalates a Clearance CR (never silent rewrite).

## Sibling to mirror
`plugins/sdd/skills/check-spec-structure/` — SKILL.md (internal, `user-invocable: false`,
`metadata: internal: true`), no-deps `.mts` with exported pure functions + `main(argv)`, TOON/json
output, `--check` CI mode. Note: align-spec IS user/CI-invocable (unlike its internal sibling) —
see the spec README's "one user-invocable project-spec tool" line; set frontmatter accordingly.

## NEXT
DONE — impl gate passed (cold impl-judge, all 12 frozen scenarios PASS, BLOCKER null).
Landing via PR. Retire this brief once merged + doctrine-distilled.

CR source: formation-loop follow-up (this session) — no external issue.
