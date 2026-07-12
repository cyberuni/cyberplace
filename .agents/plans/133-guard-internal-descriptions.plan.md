---
name: 133-guard-internal-descriptions
status: active
todos:
  - content: "explore: grill new mechanical check for internal-skill description drift (validate.mts)"
    status: completed
  - content: "fix parseFrontmatter to detect top-level user-invocable:false (misses 24/43 internal skills)"
    status: completed
  - content: "spec gate: freeze improve-skill.feature (additive scenario + re-open of enumeration scenario)"
    status: completed
  - content: "deliver: implement check + verification against frozen scenarios"
    status: completed
  - content: "impl gate: cold SDD impl-judge per frozen scenario"
    status: completed
  - content: "handoff: branch + PR, closes #133"
    status: completed
---

# CR #133 — Guard internal skill descriptions against operational-detail drift

CR: https://github.com/cyberuni/cyberplace/issues/133 (doctrine strategy `strategy.132d9e`)

Target project spec: `aced` (`.agents/specs/aced/`, implemented). Node:
`config-authoring/improve-skill` (mechanical validate engine half).
Touched file: `plugins/aced/skills/improve-skill/scripts/validate.mts` — deterministic
engine, SDD-default production chain.

## NEXT — DONE (corrected design shipped to PR #144)

Both gates re-passed on the corrected by-name-callee model: cold SDD spec-judge ALIGNED, cold SDD
impl-judge APPROVE (54/54 tests; 41-skill migration verified clean repo-wide), `pnpm verify` 19/19,
`status: implemented`. PR #144 updated. Await review/merge → doctrine-distill → retire plan.
Deferred follow-up: reconcile `skill-design.md` governance (still frames internal via
`metadata: internal: true`) + document the "agent-invoked-by-name callee" category + note
`disable-model-invocation` is unusable here (breaks by-name loading). Note: the default engine scan
covers `skills`/`.agents/skills`, not `plugins/*/skills/` — the 41 plugin skills aren't CI-gated by
it today (a separate scan-scope question).

## History — RE-OPENED (design corrected)

User review caught a real flaw: v1 keyed "description is not a trigger" on `user-invocable:false OR
metadata.internal`, but per Claude Code docs neither suppresses model auto-invocation
(`disable-model-invocation:true` does — and it would break the by-name loading these skills require).
Corrected category model: **agent-invoked-by-name callee** (resolved via registry + artifact-type;
must stay `disable-model-invocation:false` so the orchestrator can call it).

**Corrected design (re-froze spec, status→draft):**
- Detection = `user-invocable:false` only (drop metadata.internal; verified 0-FP vs gateways, 41 skills)
- Q3 sharpened → require `"Internal skill: by name only"` prefix
- NEW **Q18** → flag user-facing trigger language on a by-name callee (spurious-match risk)
- Q17 op-detail guard → keep; Q1/Q2-words public-only → keep
- Prose justification rewritten (README + .feature header comment)

**Deliver (this pass, ONE combined PR #144):**
1. validate.mts: re-key detection to user-invocable:false; drop metadata.internal from internal-class;
   sharpen Q3 to require "by name only" prefix; add Q18; update enumeration (Q17,Q18) + summary/help.
2. **Migrate 41 shipped descriptions** → `"Internal skill: by name only — <identity>. <callers>."`
   (delegate by plugin to Sonnet agents, like sweep 1812364d). So the sharpened Q3 passes green.
3. Re-run spec gate (cold judge) → impl gate (cold judge) → pnpm verify → push to #144.

Deferred follow-up: skill-design.md governance still says internal = `metadata: internal: true`
(mis-frames the category) — reconcile in a governance CR.

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
