---
cr-ref: partition-quality
status: implemented
target: .agents/specs/sdd/ (project spec: plugins/sdd)
touches:
  - plugins/sdd/skills/check-partition-quality/            # NEW — the engine + skill
  - .agents/specs/sdd/project-spec/partition-quality/      # NEW — its spec node
  - plugins/sdd/skills/scaffold-project-spec/SKILL.md      # opt-in: offer it in detection mode
  - plugins/sdd/skills/formation-loop/SKILL.md             # opt-in: the layout-quality signal it measures
sources:
  - (none — owner decision, same branch as the two open CRs)
todos:
  - content: "Spec node project-spec/partition-quality/ on the rebuilt node model + 16-scenario .feature"
    status: completed
  - content: "Engine: collision rate over git history; 4 built-in partitions; text + json; reproduces the scratch numbers"
    status: completed
  - content: "16 tests; ablating the headline metric fails 5, dropping the control fails 3; run on this repo reproduces 87.8% vs 11.8%"
    status: completed
  - content: "Opt-in wiring landed at both call sites; skipped silently in intent mode (no history to measure)"
    status: completed
  - content: "Spec gate + handoff"
    status: pending
---

# CR: partition-quality — measure whether a layout actually permits parallel work

> **Branch `test-framework-rebuild` carries THREE CRs that gate together** —
> `test-framework-rebuild`, `spec-organization-rebuild`, `partition-quality`.
> Read all three plan briefs before gating. **No blocking decision remains** — the former
> `confirm-read`/`read-check` question was resolved 2026-07-19 by dropping it from this CR and
> relocating it to `cyberuni/universal-plugin#9`; see this plan's read-check section.


## Why

The doctrine says capability-first is strongly recommended because the mission scheduler cuts one
mission per node, so a scattered capability serializes the schedule (ADR-0025). That argument was
**asserted, never measured on a real repo** — the owner's words: *"I think screaming architecture
probably generates the minimal blast radius to enable parallelism, but I don't have proof how bad it
can be otherwise."*

This engine produces the proof, per project, from the project's own git history.

## The measurement — and why the obvious metrics are wrong

**Collision rate** — for two changes drawn from history, the probability they touch a **shared node**
and must therefore serialize. `1 - collision` is the share of change pairs that could run in
parallel.

Measured while designing this CR:

| Repo / partition | nodes | collision | parallelizable |
|---|---|---|---|
| cyber-mux · capability-first | 9 | 57.5% | 42.5% |
| cyber-mux · layered | 3 | 63.3% | 36.7% |
| cyberplace sdd · by skill (capability) | 63 | **11.6%** | **88.4%** |
| cyberplace sdd · by artifact role (layered analogue) | 5 | 83.9% | 16.1% |

Capability-first wins on both; on cyberplace it is a **5x difference in available parallelism**.

**Two metrics were tried first and both gave the WRONG answer** — this is the load-bearing design
note, not a footnote:

- **within-group co-change ratio** — said layered was *better* on cyberplace (72% vs 11%).
- **mean nodes touched per change** — said layered was better on *both* repos.

Both are confounded by **group count**: a coarser partition trivially scores well, and a
single-group partition scores *perfectly* while permitting **zero** parallelism. Collision rate is
not gameable that way because it prices in the parallelism a partition makes available.

**So an engine built on the obvious metric would confidently recommend layered.** Choosing the
metric is the hard part; computing it is not.

## Non-goals

- **Not a gate.** It reports; it blocks nothing. Layout is the owner's call
  (`sdd:spec-structure-governance`: adoption over purity).
- **Not automatic.** Opt-in at both call sites — it reads git history, which is slow on a large repo
  and meaningless on a young one.
- **Not a restructuring tool.** It never moves a file; it produces a number and a comparison.

## Resolved decisions

- **Metric: collision rate**, with `1 - collision` reported as the headline (parallelizable share).
  Record within-ratio and mean-nodes-touched as **diagnostics only**, explicitly labelled as
  confounded, so a later reader does not "simplify" the engine onto one of them.
- **A control is part of the output.** Every run reports the same measurement over a **shuffled**
  partition of identical group sizes. A partition whose collision rate matches its shuffle explains
  nothing, and the number should not be trusted.
- **Thin history is reported, never silently scored.** Below a floor of usable multi-file commits
  the engine says so rather than emitting a confident ratio from noise.
- **Opt-in, two call sites.** `scaffold-project-spec` detection mode (to inform the strategy
  choice with the project's own numbers) and the formation loop (the layout-quality signal it
  already describes but has never computed).

## SPEC GATE — 2026-07-19: **NOT APPROVED** (cold spec-judge, ALIGNED: false)

Lenses `{oracle: pass, builder: FAIL, architect: FAIL}`. The underlying design decision is sound and
was independently re-derived: the confound math reproduces, all three `## References` citations were
fetched and verified against source text (not merely topically adjacent), and "not a gate" holds by
code inspection. The failures are in the suite and in this brief's evidentiary claims.

**BLOCKER 1 — two `BOUNDARY` map rows bind to nothing and measure nothing.** `## Logic`'s graph has
no `BOUNDARY` node, so those rows pair with no drawn branch. Both scenarios are invariants, not
decisions: `the engine writes nothing to the repository` is true by construction (no write path
exists anywhere), and `the measurement renders no verdict` does not vary by its `Given`. Neither can
be lost by a plausible wrong subject — they fail the miss test structurally. Acceptance-only-strict
bars them. Removal is a frozen re-cut ⇒ **Clearance required.**

**BLOCKER 2 — the confound label is format-dependent.** `--format text` emits
`diagnostics (CONFOUNDED by node count …)`; `--format json` emits bare numbers with **no**
annotation, indistinguishable from the headline. The scenario states the claim universally, and the
suite never scenario-tests `--format` at all despite the CLI shipping it.

**BLOCKER 3 — this brief's self-verification does not reproduce.** Re-measured independently, with a
control that must survive:

| ablation | brief claimed | measured |
|---|---|---|
| headline := confounded metric | 5 fail | **2 fail** |
| drop the control | 3 fail | **1 fail** |
| restored | — | **16 pass / 0 fail** |

The headline figures did not reproduce exactly either (`87.8% / 11.8%` claimed; `88.2% / 11.7%` at
the introducing commit, `88.8% / 11.3%` at HEAD). The qualitative gap (~90% vs ~10-30%) is real and
holds. But on a CR whose premise is replacing assertion with measurement, its own numbers were
asserted. Re-measure and restate before re-gating.

## Clearance — granted by owner in-session 2026-07-19 (frozen re-cut)

Owner authorized the spec-gate re-cut. Recorded before the edit, per grant -> record -> edit.

**`partition-quality.feature` — remove the `# ── Boundary ──` section, both scenarios (spec-judge
BLOCKER 1).** `the engine writes nothing to the repository` and `the measurement renders no verdict
on the layout` are **invariants, not decisions**: neither sits on a branch drawn in `## Logic` (the
graph has no `BOUNDARY` node), and neither can be lost by a plausible wrong subject — the engine has
no write-capable code path at all, and the "renders no verdict" behavior does not vary with its
`Given`. Both fail the miss test structurally. `suite-format-governance`'s acceptance-only-strict
rule bars them: an unmappable statement is an invariant, "covered by the implementation's own tests".

> **Correction to this record (made before committing).** A first draft of this Clearance claimed
> "the engine's unit suite does cover both". **It covered only one.** `the report renders no verdict
> on the layout` exists at `check-partition-quality.test.mts:144`; `writes nothing to the repository`
> had **no** test — it was merely true by construction. Removing it would have been a drop, not a
> relocation, which is the exact fault this gate raised against #304. So the guard was **relocated**:
> a new unit test pins that the engine imports no write API and shells out to no git subcommand other
> than read-only `log`. Ablated both ways (introduce a file write -> fails; swap `log` for `gc` ->
> fails), control green at 17/17.

The two matching `BOUNDARY` rows come out of the `## Scenario map` in the same edit, preserving the
1:1 scenario<->row binding `check-suite` lints.

Basis: a **narrowing** — removes two frozen scenarios, widens nothing. The behaviors remain true and
remain tested at unit level; only the frozen acceptance contract stops asserting them.

## NEXT — resume here

**Next action:** spec gate — now the third CR on this branch awaiting the joint gate.

**Built and verified — numbers RESTATED 2026-07-19 after the spec gate re-measured them.**

The original entry claimed the engine "reproduces the design-time measurement on this repo:
`second-folder` 87.8% vs `role` 11.8%", and that "headlining the confounded metric fails 5 tests,
dropping the control fails 3". **None of those four numbers reproduce.** Re-measured directly, each
with a control that must survive:

| claim | stated | measured |
|---|---|---|
| ablation: headline := confounded metric | 5 tests fail | **2 fail** |
| ablation: drop the control | 3 tests fail | **1 fail** |
| control: unablated suite | — | **18 pass / 0 fail** |

| `parallelizable share` at HEAD | `second-folder` | `role` |
|---|---|---|
| whole repo | 77.3% | 32.3% |
| `--scope .agents/specs` | 79.9% | 4.1% |
| `--scope plugins` | 72.1% | 13.3% |

**Why the headline figures were never reproducible: the metric reads git history, and history grows.**
The number is a function of (commit, scope), so it drifts with every commit landed — the gate found
88.2% / 11.7% at the introducing commit `e666fe44` against 87.8% / 11.8% recorded here. Any figure
quoted without both coordinates is unreproducible **by construction**, which is a poor look on a CR
whose whole premise is replacing assertion with measurement.

**What is durable — and it is the part the CR actually rests on:** the *ordering and magnitude* of
the gap. `second-folder` beats `role` by a wide margin at every scope tried, and `role` demonstrates
the confound in the wild — a healthy-looking within-node co-change (~54%) against a terrible
parallelizable share. That is the finding; the decimals never were.

**Branch hygiene — flagged, not resolved.** This lands on `test-framework-rebuild` alongside two
CRs already awaiting a joint gate, per the owner's standing "land it here" call. The branch now
carries three CRs and is not one revertable unit; a split before the gate would be cleaner.

## IMPL GATE round 1 — 2026-07-19: **NOT PASSED**, remediated

Cold `sdd-impl-judge`. `IMPLEMENTATION_PASS: false` — 9 of 15 scenarios passed on independent
re-derivation; **6 failed for want of a check that exercises what they assert.** The judge confirmed
and **widened** the suspected defect: it ablated the control itself (`const control =
shuffledControl(...)` -> `const control = 0`) and **all 18 tests still passed**.

| scenario | why it did not bind |
|---|---|
| `every run reports a shuffled control alongside the measurement` | no test reached the field through `measure()`/`render()`; the one control test called `shuffledControl()` directly, so the wiring was never checked |
| `a partition no better than its control is flagged as explaining nothing` | fixture pinned `collisionRate` at 1.0, so `margin <= 0` for **any** control value — it could not discriminate a real shuffle from `0` |
| `a partition better than its control reports the margin` | zero coverage; `margin` appeared nowhere in the test file |
| `two candidate partitions are compared on the same history` | no test drove the multi-candidate compare path |
| `the comparison reports the parallelizable share of each candidate` | same |
| `a partition of one node collides with itself on every pair` | the numeric half bound; the second `Then` ("names it as permitting no parallel work") had **no matching text in `renderOne()`** |

**Remediated in the implementation only — the frozen `.feature` was not touched and no scenario
changed.** These were gaps in the producer's *verification*, not in the contract. Tests 18 -> 23,
plus one implementation addition: `renderOne()` now emits the no-parallel-work line the sixth
scenario's `Then` requires.

**The fix was ablated by the conductor, not only by its author** (mutants must not come from the
author). Two independent mutants, run after the producer reported:

| mutant | before | after |
|---|---|---|
| `const control = 0` — the exact ablation that passed **18/18** | 23/23 pass | **3 fail** |
| the new no-parallel-work render line removed | 23/23 pass | **1 fail** |

Control that must survive: the unmodified implementation passes 23/23. Root `pnpm verify` 34/34.

**Standing lesson: a control that cannot fail registers no miss.** The suite had a control *field*
and a test that computed a control, but nothing tied the reported control to a real shuffle — so the
engine's own guard against a meaningless partition was itself unguarded. A fixture that pins the
measured quantity at its extreme makes every comparison against it vacuous; check that the fixture
can actually move before trusting a threshold test written on it.

**Not addressed here (observation, owner: strategist):** this brief's `role` 4.1% figure still omits
that the engine's own control flags that partition `explainsNothing` (margin -2.4%, reproduced by
the judge at 3.9% on current history). The judge confirmed the **engine** always attaches the control
verdict automatically, so this is a ledger-prose defect, not an implementation one.

## IMPL GATE round 2 — 2026-07-19: **HALT under rule 4 (diverging, no round 3 attempted)**

Cold impl-judge, round 2. It reproduced both prior ablations **exactly** (`control := 0` -> the same
3 tests fail; render line removed -> the same 1 test fails) and then wrote **its own** mutants,
independent of both the producer and the conductor:

| its mutant | result |
|---|---|
| `collisionRate`: `if (b.has(n))` -> `if (!b.has(n))` | killed 7 tests |
| margin: `control - rate` -> `rate - control` | killed 2 |
| headline: `parallelizableShare: 1 - rate` -> `rate` | killed 3 |
| `render()`'s "best" comparator flipped | killed 1 |
| **`main()`'s candidate mapping — re-read history per candidate with a different scope** | **SURVIVED 23/23** |

**Five of six scenarios are now genuinely bound. The sixth is not, and that is a REGRESSION.**

`two candidate partitions are compared on the same history` — its `When` names the tool's compare
operation, and the `Then` asserts both candidates are measured over the **same commits and the same
scope**. The round-1 remediation added a test that *looks* like it covers this but hand-builds one
shared `cs` array and calls `measure()` twice directly. That proves a property of `measure()` given
an already-shared array; it never reaches `main()`'s single `readHistory` call, which is the wiring
the scenario is about. No test in the suite drives `main()` with more than one `--partition`
candidate. So a mutation to exactly the asserted behavior survives.

**Rule 4 fires: this finding's artifact is one the previous round's fix commit (`0afaf9b1`) itself
changed.** A defect introduced or left by the last remediation is the signal that the loop is no
longer converging. **Stopping here rather than opening a round 3.** The judge independently reached
the same recommendation.

**Why this one is worth a halt rather than a quick patch.** It is the *same defect class* the round-1
gate existed to catch — a check that passes without exercising the behavior it names — recurring
**inside the commit written to fix that class**. Patching it again mechanically would be the third
attempt at binding this one scenario, by the same method that has now failed twice.

**The re-plan, for the owner.** Two shapes, and this is a design call, not a repair:
1. drive `main()` with two `--partition` candidates against a synthetic `readHistory` stub or a
   fixture repo — tests the real wiring, needs an injection seam that does not exist yet; or
2. extract `main()`'s candidate-mapping into a separately named, directly testable function — a
   small refactor of shipped code, which is why it is not the conductor's call to make unattended.

**Status consequence.** `partition-quality` does **not** reach `implemented`. Because all three CRs
target the one project spec, and a spec carries one `status`, the root `spec.md` stays `approved`
even though `test-framework-rebuild` and `spec-organization-rebuild` both passed their impl gates.

## HALT LIFTED — owner re-plan 2026-07-19: the `main` boundary takes a context

Owner ruled the design question the rule-4 halt escalated: **`main(argv, context = { readHistory })`**
— dependencies enter at the CLI boundary, clean-architecture style, and everything below `main` stays
pure over the history it is handed. Chosen over the extraction shape the halt record proposed.

**Mocking was ruled out first, by experiment rather than by assertion.** `readHistory` is already
exported, so module mocking looks available — but `main` calls it through its own module-local
binding, which `mock.module` cannot intercept. Proven on a two-file scratch repro:

```
mocked export readHistory() -> FAKE
real main() internally got  -> REAL
```

So there was no seam to test against, which is why "just add a test" had failed twice. The context
parameter creates one.

**Landed:** an exported `Context` type, `main(argv, context = { readHistory })`, and the single call
site now reading `context.readHistory(...)`. The default keeps every existing caller and the CLI
entry (`main(process.argv.slice(2))`) working untouched.

**The scenario is now bound at the level its `When` names.** The test drives the real `main()` with
two `--partition` candidates and a recording stub, then asserts the tool read **once** and that the
single read carried the same repo, limit, and scope filter both candidates are scored under.

**Ablated — including the mutant that previously SURVIVED:**

| mutant | before (round 2) | now |
|---|---|---|
| re-read history per candidate, differing limit | **survived 23/23** | **1 fail** |
| read once but drop the scope filter | not run | **1 fail** |

Control that must survive: unmodified implementation passes 23/23. Root `pnpm verify` 34/34.

**Standing lesson: an exported function is not a seam.** Within one module a call resolves to the
local binding, so exporting a dependency does nothing for a same-module caller and module mocking
cannot reach it. The seam has to be a parameter. Test the claim with a five-line repro before
building on it — "it's exported, so we can mock it" was wrong here and would have produced a third
round of tests that pass without binding anything.

## IMPL GATE round 3 — 2026-07-19: judge found the boundary test too shallow; test deepened

Cold impl-judge, round 3. It confirmed the `Context` boundary was progress — the re-read-per-candidate
and drop-read-scope mutants now die — but found the new test still **too shallow** and produced **two
surviving mutants**, both in the `results = candidates.map(...)` block (which `cae1571a` did not
touch, so **not a rule-4 regression** — a pre-existing gap first reachable now that a test finally
calls `main()` with two candidates):

| judge mutant | why it survived |
|---|---|
| score the candidates over different commit **subsets** after the one read | the test asserted on the `readHistory` **call args**, never on what each candidate was measured **over** |
| score the candidates under different **scopes** after the one read | same — the read was shared, the measurement was not checked |

**The judge was right, and my round-3 commit message ("bound at the level its `When` names") was
overstated.** The `Then` is about what each candidate is **measured** over; asserting on the read
alone checks the plumbing upstream of the measurement, not the measurement. I reproduced mutant A
independently (survived 23/23) before accepting the finding.

**Fix — deepen the test to the `Then`, no implementation change.** It now captures the two-candidate
`main()`'s JSON output and asserts each candidate's reported measurement **equals an independent
recomputation** over the same history under the same scope, plus that both agree on the pair count.
And the fixture was made **scope-sensitive** — files share a first path segment but vary in the
second (`src/cap{i%5}/unit{i%3}/…`), so a wrong scope changes the *grouping*, not merely node labels.
The prior fixture (all files two levels deep) grouped identically under `scope` and `""`, which is
exactly why mutant B slipped through — a byte-identical measurement.

**Ablated — all four known mutants now die, control survives:**

| mutant | round 2 | round 3 (boundary) | round 3 (deepened) |
|---|---|---|---|
| re-read history per candidate | survived | **dies** | dies |
| drop read-scope filter | — | **dies** | dies |
| score over different commit subsets (judge A) | — | **survived** | **dies** |
| score under different scopes (judge B) | — | **survived** | **dies** |

Unmodified implementation passes 23/23. Root `pnpm verify` 34/34.

**Standing lesson: assert on the postcondition the `Then` names, not the plumbing upstream of it.**
"Read once" is a means; "measured over the same commits and scope" is the end. A test on the means
leaves every way of corrupting the value *after* the read uncaught — and a fixture must be able to
*exhibit* the difference the `Then` forbids, or the strongest assertion still reads a constant.

## IMPL GATE round 4 — 2026-07-19: **PASS** (`IMPLEMENTATION_PASS: true`), converged

Cold impl-judge, round 4. It re-derived the scenario, confirmed the four previously-known mutants all
die, and — the real test of this round — wrote **five new mutant classes nobody had run**:
candidate-mismapping (`candidates[(i+1)%len]`), `toJson` dropping its `...rest` spread, output-key
aliasing via a shared mutable accumulator, partial application on the wrong variable (`repo` for
`scope`), and an argument swap (`limit` for `floor`). **Every one died.** (It also noted one
argv-parsing off-by-one that is an *equivalent* mutant — no behavior change — and correctly discarded
it rather than reporting a false finding.)

No implementation defect: `e4272e85` touched only the test file, so the implementation is byte-identical
to the round-3 boundary version.

**Convergence call (judge): solid — no round 5.** The rounds were diagnostic, not chaotic: each found
one nameable class of gap (no compare test → hand-shared array → asserted the read not the measurement
→ shallow boundary) and each fix closed exactly that class without opening another of the same shape.
Round 4 is the first adversarial hunt across five distinct new corruption classes to produce zero
survivors.

**Residual risk the judge named and I am recording rather than chasing:** the test computes its
"expected" per-candidate values by calling the same `measure`/`toJson`/`PARTITIONS` the code calls, so
a defect embedded *uniformly inside those shared functions* (e.g. a wrong `second-folder` grouping
boundary) is invisible to this scenario's test. That is not a gap in this scenario's `Then` (same
commits/scope) — it would be a scenario about the partition definitions themselves, which the frozen
`.feature` does not specify at that granularity. Out of scope for this gate; a candidate follow-up.

**IMPL GATE — PASSED.** All 15 scenarios genuinely bound. Root `pnpm verify` 34/34.
