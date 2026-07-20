---
cr-ref: 304-m1-eval-suite-sweep
source: https://github.com/cyberuni/cyberplace/issues/304
status: in_progress
todos:
  - content: "define-governance: build up suite, draw CFG, both gates — DONE (18->26, #334-#338)"
    status: completed
  - content: "define-skill: build up suite, draw CFG, both gates — DONE (33->41, #340-#344)"
    status: completed
  - content: "contribute-skill: RE-DRIVE scenarios from CFG (first pass used wrong ordering — patched not re-derived; committed db1f24cc but impl gate NOT ratified)"
    status: in_progress
  - content: "manage, manage-model-runners, skillify: same, one at a time"
    status: pending
  - content: "Open PR(s) against main referencing #304 (do NOT close — issue stays open for later specs)"
    status: pending
---

# CR 304-M1 — ACED eval-suite corpus sweep

The M1 track of issue #304, run **one spec at a time** after a reset. The first attempt tried to spec
a corpus-wide scenario<->case mapping contract plus migrate every legacy corpus at once; it ran three
grill rounds without converging and was abandoned (its lessons are in the two shipped nodes and in
saved feedback memory). The reset instruction that replaced it: **build each live suite up using the
retired corpus as reference only** — nothing migrated.

## NEXT — resume here

**Next action:** re-drive `contribute-skill` under the CORE METHOD above (its first pass used the
wrong ordering — patched the suite instead of re-deriving from the CFG; impl gate NOT yet ratified),
then `manage`, then `manage-model-runners`, then `skillify` — **one at a time**. For each, follow the
CORE METHOD: update spec + draw CFG → re-derive the full scenario set from the CFG (each edge drives
its scenario) → reference `artifacts/specs/<node>/golden-set/` → reconcile against the frozen suite
(additive self-clears, narrowing needs Clearance) → rebuild the README to the four-section shape (What
/ Use Cases / Logic-with-mermaid-CFG / Scenario map, every edge bound 1:1) → run `pnpm --filter
@cyberplace/aced-plugin check:spec` → self-assert the spec gate within leash with a fresh COLD
spec-judge → run a focused COLD impl-judge on any changed/added scenarios → commit `feat(aced)` per
node → surface the impl gate to the owner for ratification.

Node paths: `.agents/specs/aced/manage/`, `.agents/specs/aced/config-authoring/manage-model-runners/`,
`.agents/specs/aced/config-authoring/skillify/`. NOTE: `skillify`'s check already shows "2 added"
(pre-existing snapshot drift, unrelated to this sweep) — expect its suite to already carry
uncommitted-vs-fingerprint delta; reconcile it as part of that node.

**No blocking decisions open.** Three nodes shipped and gated; nothing mid-flight.

**contribute-skill retro (proves method #2 again):** corpus was 16/16 covered, yet the re-read + CFG
found a missing fork positive-companion (an "always fork" mutant survived) and an uncovered multi-skill
loop. The cold spec-judge caught that the multi-skill scenario was mapped to the wrong CFG edge
(`COLLECT` self-loop, but its `When` is "pushes the contribution" → a `COMMIT` permutation) — fixed
in-pass. Its pre-existing `@rubric` Selection concern (does `scoped_to_skills_tree` duplicate the
write-scope boolean guard?) is frozen/out-of-scope → filed #345, not touched.

**⚠️ CORE METHOD (owner-directed 2026-07-20 — applies to EVERY node in this mission):**
The CFG is the source of truth, not the existing suite. Per node, in this order:
1. **Update the spec** (README) and **draw/finalize the CFG** first.
2. **Re-derive the whole scenario set FROM the CFG** — walk every edge and let it drive its scenario;
   do NOT read the current suite and merely patch gaps (that was the earlier mistake — it leaves stale
   scenarios in place and only catches what a diff notices).
3. **Use `artifacts/specs/<node>/golden-set/` as the REFERENCE** for each re-derived scenario's
   behavior/wording (reference only — a legacy case is still a claim to verify against the current
   impl, never migrated wholesale).
Reconcile the re-derived set against the frozen suite: additive scenarios self-clear; any
narrowing/rewrite of a frozen scenario is Clearance-bound (owner ratification recorded BEFORE the edit,
bounded to named scenarios).

**Supporting method — do not relearn (proven on two nodes):**
1. A legacy case is a **claim to verify against the current `SKILL.md`**, never evidence of current
   behavior — corpora are stale by default. On both nodes, cases asserted rules the implementation had
   reversed and would have penalized a correct agent.
2. **A well-mined corpus is not a healthy suite.** `define-skill`'s corpus was fully absorbed (17/19
   covered) yet the suite held a scenario that FAILED a correct implementation since July, an
   uncovered entry point, and a stale spec row. Every real defect came from re-reading the suite
   against the implementation and from drawing the CFG — not from the corpus.
3. **Prefer an additive companion to editing a frozen scenario.** Additive self-clears; a
   narrowing/rewrite is Clearance-bound (owner ratification, recorded BEFORE the edit, bounded to
   named scenarios — verify the gherkin-cli structural diff holds `removed`/`modified` to the granted
   count each round).
4. **Draw the CFG and bind every edge 1:1 to a scenario** in a `## Scenario map` (`| Edge | Path
   (Given) | Scenario |`, scenario cell backticked — `check-suite` lints scenario-side completeness;
   edge coverage is authored, so a cold judge over the graph is the check for it). Drawing the graph
   is what surfaced `define-governance`'s routing defect — forcing two blurred requests onto separate
   edges named the discriminator.
5. **Grill loop:** spec-producer inline/dispatched, a fresh COLD spec-judge each round (re-derive
   oracle), cap 3 (reset on user say-so). A defect traceable to the previous round's own fix is a
   regression → stop and re-plan, not another round.
6. **Descriptions are a trigger surface, not a spec.** Fix a routing collision by naming the OBJECT
   the skill owns, not the sibling's verb; shorter beats longer.

**Resolved run-level decisions:**
- Leash `auto-spec`: self-assert the spec gate within leash; the impl gate goes to the owner.
- Root `aced` project `status: implemented` and its human ratification stay UNTOUCHED — these suites
  are corrected to match an implementation that already moved; additive scenarios self-clear.
- **PR is batched** across nodes by owner decision — one PR for several specs, not one per node.
  Nothing pushed yet; 5 commits on branch `sdd/304-m1-trigger-instrument` ahead of `main`.

**Shipped, for reference (commits on this branch):**
- `define-governance` — 18->26 scenarios, CFG drawn, both gates, follow-ups #334-#338.
- `define-skill` — 33->41 scenarios under two clearances, CFG drawn, both gates, follow-ups #340-#344.
- `contribute-skill` — 21->23 scenarios (both additive, self-clear), README rebuilt + CFG drawn, both
  gates, follow-up #345. Commit `db1f24cc`.
- Step 1 of #304 (the outline-fingerprint fix + per-project wiring) already merged on `main` (#332).

**Remaining frontier:** `manage`, `manage-model-runners`, `skillify` — each has a near-1:1 corpus
(little new behavior expected), so the value there is the re-read plus the CFG rebuild. Then batch the
PR(s) against `main` referencing #304 (do NOT close #304 — issue stays open for later specs).

**Superseded, do not resurrect:** the corpus-wide scenario<->case mapping contract + bulk migration.
It bound tests to suites that were themselves wrong; the per-node re-read is what catches that.
