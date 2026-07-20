---
cr-ref: 304-m1-eval-suite-sweep
source: https://github.com/cyberuni/cyberplace/issues/304
status: in_progress
todos:
  - content: "define-governance: build up suite, draw CFG, both gates — DONE (18->26, #334-#338)"
    status: completed
  - content: "define-skill: build up suite, draw CFG, both gates — DONE (33->41, #340-#344)"
    status: completed
  - content: "contribute-skill: re-read suite vs impl, draw CFG, gates"
    status: pending
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

**Next action:** start the third node, `contribute-skill`. Run its mission via `start-mission` on
`.agents/specs/aced/contribute/contribute-skill/` — assess the 16 legacy cases at
`artifacts/specs/contribute-skill/golden-set/` for CURRENT relevance (not migration), add only
real-and-uncovered behavior as scenarios, then rebuild the node README to the four-section shape and
draw its control-flow graph. Run `pnpm verify:specs` (or the per-project spec check) after suite
edits.

**No blocking decisions open.** The two shipped nodes are gated and committed; nothing is mid-flight.

**Method — do not relearn (proven on two nodes):**
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
- Step 1 of #304 (the outline-fingerprint fix + per-project wiring) already merged on `main` (#332).

**Remaining frontier after contribute-skill:** `manage`, `manage-model-runners`, `skillify` — each
has a near-1:1 corpus (little new behavior expected), so the value there is the re-read plus the CFG
rebuild. Then batch the PR(s).

**Superseded, do not resurrect:** the corpus-wide scenario<->case mapping contract + bulk migration.
It bound tests to suites that were themselves wrong; the per-node re-read is what catches that.
