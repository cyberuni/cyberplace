---
name: 133-guard-internal-descriptions
status: active
todos:
  - content: "explore: grill new mechanical check for internal-skill description drift (validate.mts)"
    status: completed
  - content: "fix parseFrontmatter to detect top-level user-invocable:false (misses 24/43 internal skills)"
    status: pending
  - content: "spec gate: freeze improve-skill.feature (additive scenario + re-open of enumeration scenario)"
    status: pending
  - content: "deliver: implement check + verification against frozen scenarios"
    status: pending
  - content: "impl gate: cold SDD impl-judge per frozen scenario"
    status: pending
  - content: "handoff: branch + PR, closes #133"
    status: pending
---

# CR #133 — Guard internal skill descriptions against operational-detail drift

CR: https://github.com/cyberuni/cyberplace/issues/133 (doctrine strategy `strategy.132d9e`)

Target project spec: `aced` (`.agents/specs/aced/`, implemented). Node:
`config-authoring/improve-skill` (mechanical validate engine half).
Touched file: `plugins/aced/skills/improve-skill/scripts/validate.mts` — deterministic
engine, SDD-default production chain.

## NEXT

Spec authored + graded (cold spec-judge). Decisions locked: mechanical objective markers only
(paths, `.agents/`/`scripts/` dirs, check-IDs, named artifact files), WARN/MEDIUM severity, new
check **Q17**; Q1 + Q2-words gated public-only; internal = `user-invocable:false` OR
`metadata.internal:true`. Enumeration scenario widened (Q17) — ratified re-open. Judge Builder-fix
(metadata.internal arm scenario) applied; awaiting judge re-confirm → then spec gate freeze.

Then DELIVER against frozen `.feature`: edit `plugins/aced/skills/improve-skill/scripts/validate.mts`
— (a) `parseFrontmatter` returns internal via top-level `user-invocable:false` OR `metadata.internal`;
(b) gate Q1 + Q2-words to `isPublicShippedSkill`; (c) add Q17 mechanical check; (d) add engine tests
per frozen scenario. Marker regexes validated in scratchpad spike4 (0 FP on 43 shipped, 10 drift
caught). Then impl gate (cold SDD impl-judge), then handoff branch + PR closes #133.

## Original two coupled changes:

1. **Fix internal detection.** `parseFrontmatter` reads only `metadata.internal: true` but 43
   shipped plugin internal skills use top-level `user-invocable: false` (24 have ONLY the
   top-level marker → currently mis-classified as public). Detect the top-level marker.
2. **New mechanical check (internal-description guard).** For an internal skill, flag a
   description carrying **operational-detail markers** (file paths, enum/predicate lists) — NOT
   a raw length cap (swept identity+caller descriptions run 180–240 chars; a >120 check would
   false-positive on all 39). Must produce zero false positives on the current shipped set.

## Open design questions (grill)

- Operational-detail-markers only, or also a soft length ceiling? (length alone is a FP trap)
- New check ID (mechanical Q-series) — adding to the exhaustive "engine runs only S1-S6,
  Q1-Q5, Q10-Q11, E1-E2, E6, E9" enumeration scenario is a **re-open** of a frozen scenario
  (widening, not narrowing) → needs live ratification.
- Severity: WARN (matches other description checks) vs CRITICAL.

## Notes

- skill-design bound is ≤120 (issue guessed ~140); but that bound is a trigger-truncation rule
  for PUBLIC descriptions — internal identity+caller prose intentionally exceeds it.
- governance drift aside: skill-design.md line 68 still says internal skills use
  `metadata: internal: true` — contradicts `user-invocable-is-top-level`. Note, don't fix here
  unless it blocks (out of scope for this CR).
