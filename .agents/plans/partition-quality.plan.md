---
cr-ref: partition-quality
status: draft
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

## NEXT — resume here

**Next action:** spec gate — now the third CR on this branch awaiting the joint gate.

**Built and verified.** The engine reproduces the design-time measurement on this repo:
`second-folder` 87.8% parallelizable vs `role` 11.8%, and `role`'s own output demonstrates the
confound in the wild — 67.2% within-node co-change (looks good) against 11.8% parallelizable
(terrible). Both ablations bite: headlining the confounded metric fails 5 tests, dropping the control
fails 3.

**Branch hygiene — flagged, not resolved.** This lands on `test-framework-rebuild` alongside two
CRs already awaiting a joint gate, per the owner's standing "land it here" call. The branch now
carries three CRs and is not one revertable unit; a split before the gate would be cleaner.
