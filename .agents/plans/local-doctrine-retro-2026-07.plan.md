---
name: local-doctrine-retro-2026-07
status: active
todos:
  - content: "distill doctrine strategy from the 8 combat-logged missions (Scanner pass)"
    status: completed
  - content: "retire the concluded/merged mission plans (tracked deletion)"
    status: completed
  - content: "review the pending strategy corpus (keep-or-cut), cluster the reinforcements"
    status: completed
  - content: "Council decision: A (extend pre-judge engine) + B (durable combat-log footprint) KEPT; H + I recommended cut"
    status: completed
  - content: "open CR A — RE-SCOPED: scenario-step-level structural diff (d1 follow-up #1); brief sdd-scenario-step-diff. use-case-row check already landed in d1 (f1a1eda0)"
    status: in_progress
  - content: "open CR for B — require a durable combat-log line (matchable cause) for in-session missions"
    status: pending
  - content: "Council decision on the still-pending clusters C, D, E, F, G"
    status: pending
  - content: "push branch chore/doctrine-distill-retire-plans + open PR (distill + retirement commits)"
    status: pending
---

# Doctrine retro — distill + retire + strategy review (2026-07)

A doctrine-loop processing session, not a single-CR mission. Ran the outer-loop retro over the SDD
corpus: distilled strategy from concluded missions, retired the landed plan briefs, and took the
Council through keep-or-cut on the pending strategy. Two clusters ratified; the rest still open.

Branch `chore/doctrine-distill-retire-plans` (off `main`, **unpushed**), two commits landed.

## NEXT — resume here

1. **CR A — RE-SCOPED (Council-approved 2026-07): scenario-step-level structural diff only.** Brief:
   `.agents/plans/sdd-scenario-step-diff.plan.md`. Target `.agents/specs/sdd` (spec-gate authoring node)
   + impl `plugins/sdd/skills/spec-gate/scripts/`.
   - **Reconciliation (corrects this brief's earlier stale-cache premise):** d1 (`f1a1eda0`, on `main`)
     ALREADY landed `referenced-artifact-exists`, the **use-case-row→scenario** coverage check, and the
     **sibling-prose sweep** in `plugins/sdd/skills/spec-gate/scripts/check-spec-state.mts` (+147 lines).
     The earlier reading came from a stale plugin *cache*; the repo source is ahead. Those checks are DONE.
   - **Real remaining work = d1's routed follow-up #1**, which `strategy.dae416` seq1 independently
     rediscovered (same root cause): the additive-self-clear **freeze classifier** and the pre-judge
     check both key on **raw git line-diff**, which a context-line reassignment fools — a trailing step
     orphaned onto a new/adjacent scenario shows no `-` line, so a frozen scenario silently loses an
     assertion (d1's own round-1 bug). Fix: diff at the **per-named-Scenario step level** in the
     `gherkin-cli diff` consumers (the freeze/additive machinery). Follow-up #2 stays a SEPARATE CR.

2. **Open CR B** via `start-mission` against `.agents/specs/sdd`: **durable combat-log footprint** —
   in-session / self-asserted missions currently write no `*.log.jsonl`; judge-iteration corrections
   get folded into the gate `why` prose instead of a discrete `correction` line with a matchable
   `cause`, starving the doctrine loop's stated PRIMARY input. Evidence: this retro found only 8 of 34
   briefs kept a log. Ledger reinforcements: `.agents/specs/sdd/ledger/` shards `strategy.317dd8` seq2,
   `strategy.7668d1` seq1, `strategy.acaa41` seq2, `strategy.ba6a39` seq2. Decide the minimum footprint
   (a discrete correction line per in-session mission, cause enum enforced).

3. **Council decision on the still-pending clusters** (undecided this session — see
   `## Strategy review verdicts`):
   - **C — PRUNE stale `plugins/sdd-new` paths.** Confirmed a **real functional break**, not just
     prose: the `pause-mission` skill's `checkGateFloor` step points at the old
     `plugins/sdd-new/.../check-spec-state.mts`; the live script is under `plugins/sdd/...`. Also in
     `discover-specs` example rows. Quick, high-value PRUNE CR. Source: `strategy.ba6a39` seq4.
   - **D — cause-enum growth** (add "operating-doc / sibling prose contradicts shipped impl"):
     `strategy.364c83` seq2.
   - **E — gate-role naming convention** at authoring time (name judges by role+scope, not verbs):
     `strategy.7668d1` seq2.
   - **F — resolve-governances for SDD's own nodes** (SDD skill nodes resolve to the ACES squad,
     forcing a manual per-mission override): `strategy.0000-legacy` seq43.
   - **G — cyberlegion Warden cross-node reconcile nudge** for shared cross-cutting primitives:
     `packages/cyberlegion/.agents/spec/ledger/strategy.dae416.jsonl` seq1 (different corpus — a
     cyberlegion CR, not sdd).

4. **Push `chore/doctrine-distill-retire-plans` + open PR** — the distill + retirement commits.

## Resolved decisions — do not relitigate

- **Distill (commit `dfc6bac8`).** Scanner read all 8 combat-logged missions, de-duped against the
  existing pending chains, wrote **2 genuinely new** unratified strategy lines (the sdd assertion-diff
  and the cyberlegion Warden nudge). The other 6 logs carried no new signal (clean ships or already
  captured). No ledger flags were flipped — ratification's vehicle is the CR, not a flag edit
  (append-only ledger; recording-mechanism is an open governance question).
- **Retirement (commit `400fe72b`).** 20 merged missions retired, 33 files (24 plan/log via
  `retire-plans.mts` + 9 orphan `.design.md`/`.migration-map.md` companions). Set = briefs whose
  source PR is merged to `main`. **Excluded** `add-fleet-comms` + the two dead cyberfleet PoC plans —
  owned by open PR #110 (avoid collision).
- **Kept 14 briefs**: not-started (`cyberplace-registry-node-split`, `sdd-conductor-node-split`,
  `cyberfleet-stations`), superseded (`cyberlegion-identity-presence-split`,
  `cyberfleet-verdict-roundtrip`), unmerged-on-branch (`axi-conformance`, `bundle-emit-pins-map`,
  `legate-rename`, `spawn-cwd`, `tavern-plugin-storefront`, `plan-retirement-distill-gate`), and the
  3 PR #110 owns.
- **A ratified as an *extension*, not a new phase** (see NEXT step 1) — checking the code showed the
  pre-judge phase already exists and already enforces `referenced-artifact-exists`.

## Strategy review verdicts

18 pending lines collapsed to 8 clusters. **A, B → KEPT** (become CRs, steps 1–2). **H → cut** (the
`kind:strategy` overload is already fixed — `start-mission` emits `kind:leash` for the run-start
block). **I → cut** (a non-actionable milestone note; fold into B's evidence). **C, D, E, F, G →
still pending** the Council's call (step 3).

## Do not touch

An unrelated pre-existing `M .agents/specs/cyberfleet-plugin/README.md` sits modified in the working
tree from another session — leave it unstaged, it is not part of this work.
