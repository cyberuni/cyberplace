---
name: sdd-retire-no-log-branch
status: active
todos:
  - content: "explore: RECONCILED — retirement gate keys solely on `distills` (never written by real strategy) and has no no-log branch, so the mechanical sweep is inoperative; scope = add the 'no combat log on disk ⇒ nothing to distill ⇒ retire' branch (DONE — see The reconcile)"
    status: in_progress
  - content: "author spec: additive scenario(s) on plan-retirement.feature (cleared + plan.md present + NO log.jsonl + no distills ⇒ retired) + README use-case row; stays @frozen (additive, self-clears)"
    status: pending
  - content: "spec gate: cold sdd-spec-judge over the touched plan-retirement node"
    status: pending
  - content: "deliver: retire-plans.mts predicate → planPresent && (distilled || !logPresent); one test per new frozen scenario"
    status: pending
  - content: "impl gate: cold sdd-impl-judge"
    status: pending
  - content: "handoff: root pnpm verify, land, keep combat log"
    status: pending
---

# CR B — retirement-gate no-log branch (re-scoped from "durable combat-log footprint")

Ratified doctrine strategy cluster B (Council, retro `local-doctrine-retro-2026-07`). Branch
`sdd-retire-no-log-branch` off `main`. Target spec: `.agents/specs/sdd/doctrine/plan-retirement`.

## Why this is NOT "add a combat-log footprint" (the deeper-dive conclusion)

Cluster B was drafted as "make in-session / non-gated missions write a minimum durable
combat-log footprint so the doctrine loop's PRIMARY input is never structurally absent"
(`strategy.317dd8` seq2, `strategy.7668d1` seq1, `strategy.ba6a39` seq2). A deeper dive into who
actually READS that trace showed a footprint is useless-to-counterproductive:

- **No reader loses anything by its absence.** The combat log is a **failure-pattern** instrument
  (the Scanner distills recurring `cause`s). A clean, non-gated mission has **no** correction, so an
  emitted `report` line distills to nothing. The gateway reads `spec.md` status only; Forge reads
  distilled corrections (none); campaign/formation read the public git trail (the work is in git
  regardless).
- **A forced line actively fights retirement.** `plan-retirement` deletes a plan gated on
  *distilled* — a `strategy` with `distills == <cr-ref>`. A non-gated mission with **no** log rides
  the "**no combat log to distill**" branch and is retirable. Emitting a conclusion line **creates**
  a combat log, moving the mission OUT of that branch INTO "must be distilled" — harder to retire.

## The real defect the same evidence exposes (disk-verified)

1. **No `strategy` line anywhere carries a `distills` field — zero across all ledgers.** In practice
   the Scanner drafts *reinforcement / recurring-pattern / milestone* strategy, which by spec
   **omits** `distills` (only Ship/Kill set it). So the machine-checkable hook the retirement gate
   keys on has essentially never been populated.
2. **`retire-plans.mts` deletes iff `distills == cr-ref` exists** (`decideRetirements`:
   `present.has(ref) && distilled.has(ref)`). With zero `distills`, the mechanical sweep would delete
   **nothing** — yet the retire commit (`400fe72b`) removed 20 plans. Its message states the real,
   by-hand criterion: *"distilled, **or no combat log to distill**."* That "or no log" branch **does
   not exist in the script.** The mechanical gate is misaligned with its own operating discipline.

## The reconcile — add the no-log branch (this CR)

Bring the mechanical gate up to the operating discipline, keeping the anti-data-loss invariant exact:

> Retire a cleared, present plan when **a distilling `strategy` exists (distilled)** OR **no
> `<cr-ref>.log.jsonl` exists on disk (nothing to distill).**

- Predicate: `planPresent && (distilled || !logPresent)` (today: `planPresent && distilled`).
- **Anti-data-loss invariant untouched.** The fail-closed protection exists to never delete an
  *undistilled combat log*. A log that does not exist cannot be lost. The **with-log** case
  (`both plan.md and log.jsonl exist`, `plan-retirement.feature:22`) stays fail-closed exactly as
  frozen — this CR does not weaken it.
- **The caller already judged source-done.** The sweep only acts on `<cr-ref>`s the caller cleared
  (source merged/done); the no-log branch does not add a novel judgment, it stops fail-closing on a
  distillation that is structurally impossible.

**Freeze is clean — purely additive.** `plan-retirement.feature:22` is scoped to "**both** plan.md
and log.jsonl exist," so the no-log case is a NEW scenario, not a narrowing of it. Additive ⇒
self-clears, stays `@frozen`, no re-open. (CR A's freeze-integrity work is why that precondition is
explicit enough to add against safely.)

## Out of scope — noted as follow-ups, NOT built here

- **`distills` is never written even for distilled missions that HAVE a log** (e.g.
  sdd-remove-formation-autorun was distilled via a reinforcement line with no `distills`, so the
  mechanical gate would still block it). That is a **doctrine-loop write-discipline** gap (does the
  Scanner reliably set `distills` on a Ship/Kill distillation?), distinct from this gate reconcile.
  Keeping the with-log gate fail-closed is CORRECT pressure toward setting the hook; do not loosen it
  here.
- **Plan-brief drift** (`strategy.ba6a39` seq2: local-manage-anchors-visibility landed work but its
  brief stayed `status:active` / todo `in_progress`). A hygiene/terminal-state concern on the tracked
  brief — a combat-log line would not fix it. Separate small CR.

## NEXT — resume here

1. Author additively against `.agents/specs/sdd/doctrine/plan-retirement/`:
   - `plan-retirement.feature`: a new scenario — *a cleared cr-ref whose plan.md exists but whose
     log.jsonl does NOT exist, with no distilling strategy, is still retired (nothing to distill) —
     its plan.md deleted.* Contrast it explicitly with the frozen `:22` (both files present ⇒
     fail-closed). Consider a second guard scenario if the judge wants the source-uncleared no-log
     case pinned (likely already covered by the frozen "did not clear" scenario at `:64`).
   - `README.md`: add a Use Cases row for the no-log branch; refine the "distilled-gate, mechanical"
     row + *The clearance boundary* prose to say the fail-closed applies **when a combat log exists**
     (align sibling prose to the new scenario — a d1-style check would want this).
2. Spec gate: cold `sdd-spec-judge`. `.feature` stays `@frozen` (additive self-clear).
3. Deliver: `plugins/sdd/skills/plan-retirement/scripts/retire-plans.mts` — thread a `logPresent`
   set (glob `*.log.jsonl` like `discoverPlans` globs `*.plan.md`) into `decideRetirements`, predicate
   `planPresent && (distilled || !logPresent)`; add one `retire-plans.test.mts` case per new frozen
   scenario. Update the `plan-retirement` + `doctrine-loop` SKILL prose if either restates the gate.
4. Impl gate: cold `sdd-impl-judge`. Then handoff: root `pnpm verify`, land, keep the combat log.

## Guardrails carried

- Reason to the correct answer; do NOT rebuild d2 or reconcile-forward-footprint. This CR is the
  retirement-gate reconcile ONLY.
- Contested working tree / shared branch: plain `git commit` only, never `--amend`; re-check
  `git log -1` before each commit; stage own files by path. See memory
  `feedback_concurrent_sessions_shared_tree`.
- Leave `M .agents/specs/cyberfleet-plugin/README.md` (another session's) untouched.
- Delegate the mechanical build (engine edit + tests) to a sonnet subagent; main loop
  orchestrates/reviews/commits.
