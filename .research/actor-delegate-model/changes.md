# Changes — The Actor–Delegate Model

## 2026-06-19 — Variants span both faces; drop the two-axis overreach

- **Variant redefined: specialization of an actor, *either* face.** Corrected the prior "variants live on the forward face" claim. A variant is a specialization sharing its actor's motive, differentiated by required *training*, and it can anchor to forward (Explorer/Scout/Conductor) **or** backward.
- **QA added as the confirmed backward-face Builder variant** — deep training in evaluating the product (test design, coverage, regression). Grounds why *generic* gatekeeping is a face (universal, not a role) while *QA* is a trained specialization (a role): the capacity gate is the separator. Symmetry: Explorer and QA are both Builder variants, one per face.
- **Removed the two-axis "variant generator" claim** (divergent/convergent · design-time/runtime) that a prior edit wrongly marked **(original)**. It manufactured a taxonomy from n=3 and inflated the original-claim count past the "two" promised in the framing note. Back to two original claims (no-motive delegate; stub→rework trade-off) — consistent with `conclusion.md`.
- **Conclusion changed materially?** No verdict change; the two-original-claims count is restored, and the variant definition is corrected (faces, not forward-only).
- **Still pending:** the Positions table overhaul (Gatekeeper-as-role still present in that table; QA's default is now cleanly "backward-face Builder").


## 2026-06-19 — Resolve the open questions

- **Variant taxonomy (Q1) → Resolved.** The membership gates *are* the bound; the count is discovered, not fixed. Verdicts: Explorer (Builder) confirmed; Conductor (Architect) forming; **Scout (Framer)** added as forming — the Framer's divergent/discovery variant, by the Explorer parallel; **Curator has no variant** (its three acts share one cognitive profile → sub-roles, not variants). Named the generative pattern (original): variants come off two axes — divergent/convergent and design-time/runtime. Updated the variants table, Variant glossary row, and downstream-artifacts row.
- **Human-to-human delegation surface (Q2) → Resolved.** The surface is medium-agnostic (any availability gap: delegate now / teammate / future self). A strength, not a thin claim — AI's weight sits in *abundance* (economics) and *fidelity* (a new delegate class), not in the surface itself.
- **Delegate fidelity shape (Q4) → Resolved.** Not a fifth actor (no motive) and not a third face (points at the worker, not the work): a delegate-directed check riding every delegation surface — the mirror of the bar — and the home of human–agent interface design. Updated the Delegate-fidelity body section and glossary row.
- **Abundance breadth (Q3) → structurally resolved, empirically open.** Abundance is a dial, not a switch; the framework is abundance-relative and degrades gracefully to the decoupled scenario where generation stays expensive. The decoupled↔compressed axis *is* the dial. The residual empirical question (how far/fast abundance reaches novel-hard generation) stays in Open questions, plus a watch on whether the *forming* variants harden.
- **Conclusion changed materially?** No verdict change. Resolves three of four dossier open questions into the Resolved section; one empirical watch item remains. Adds one new original claim (the two-axis variant generator) and one new forming variant (Scout).


## 2026-06-19 — De-overload the Framer; fix gate outcomes; clean the loop section

- **Framer is product intent, not general scheduling.** Deferred work re-enters as its *owning* actor's object (feature → Framer, refactor → Architect); sequencing it is a **decision rule** (product priority vs rework-cost), not a Framer call. Fixed the control-loop diagram (deferred → backlog, re-prioritized), the scheduling subsection, the three-loops bullet, the glossary "Scheduling decision," and the How-it-composes chain.
- **`block + none` is not universally a Framer kill.** It is a kill *by whichever face* rejected the attempt: Framer kills the intent (abandon), Architect/Builder kill the approach/artifact (restart, goal stands). Fixed prose and the gate diagram.
- **`within-PR` change is an iteration, not a terminal merge.** The gate's true terminal states are merge / merge+deferred / kill; any "change needed now" loops back through the inner loop to re-gate. Rewired the gate-branches diagram.
- **Cleaned up "Curator and the loop":** led with the three distinct loops (cadence / object / owner), folded the single-/double-loop mapping in, dropped the confusing DevEx outer-loop digression, simplified the diagram.
- **Conclusion changed materially?** No verdict change; corrects role attribution and diagram wiring.


## 2026-06-19 — Reframe recursion as overlapping sets (not levels)

- **What changed:** Dropped the "axis / levels / elevator / stack" framing for product/process/toolchain. They are **overlapping sets** that intersect, union, and mutually influence — *not* a vertical hierarchy (process and toolchain interpenetrate; a discipline-as-a-hook is both). What survives: the framework is *self-applying* (recursion), and **product is the concrete, substantive outcome** the other two serve and are refined by. Codification recast from "elevator between levels" to "the Curator carrying knowledge across the seams between sets." Replaced the stacked-levels diagram with an overlap/mutual-influence diagram. Renamed the section to "Recursion: the framework turns on itself"; glossary "Level" → "Recursion"; fixed the Tier cross-reference and the Resolved/How-it-composes pointers.
- **Why:** User correction — process→toolchain has no up/down relationship; the relationship is set-theoretic, not leveled.
- **Conclusion changed materially?** No verdict change; corrects the *topology* of the recursion (sets, not stack).


## 2026-06-19 — The recursion axis (levels); diagrams

- **What changed:** Added "The recursion axis" — the four actors are invariant; only the *object* changes, giving three canonical **levels** (product / process / toolchain). Resolved the past-Architect breadth (codebase + process + harness = Architect at three levels). Named the unifying pattern: *the foundation supplies the surface*, holding both **within** a level (Curator → other actors) and **across** levels (toolchain/process → product) — so Curator-foundation, codification, agent configuration, and recursion are one pattern at two scales, with **codification as the elevator** and **Curator as the bridge**. Disambiguated *level* (recursion) from *tier* (delivery vs foundation). Began a Mermaid diagram layer (recursion stack first; control loop, gate, ladder, loops, actor/delegate backfilled).
- **Why:** A concrete picture that makes the framework one object rather than a set of separate insights; diagrams to illustrate.
- **Conclusion changed materially?** No new verdict; this is the synthesis layer.


## 2026-06-19 — Membership gates, codification law, Conductor demoted to "forming"

- **What changed:** Added three **membership gates** that bound the taxonomy (distinct motive · capacity differentiation · persistence) — this answers the former open question on variant sprawl. Added the **codification law**: a role is worth naming only where capacity is substantial AND not-yet-codifiable; the codifiable slice crosses the actor/delegate line and becomes **agent configuration** (a delegation surface materialized for an AI), itself a toolchain-tier product built by a Builder. Demoted **Conductor** from confirmed variant to **forming** (its core is already a delegate — the orchestrator-worker pattern; its residual decomposes into Framer + Architect; it strengthens at fleet scale — air-traffic-control threshold). Retightened the scheduling and scenario text to "the human directs an orchestrator-delegate" (human conducts, machine orchestrates). Added glossary rows: Membership gates, Codifiability/actor–delegate line, Agent configuration.
- **Why:** Boundary-testing the Conductor surfaced two missing criteria (capacity, duration) and the "builder-of-agent-configuration" framing — the codified Conductor is a Builder of an agent-config product (e.g., ACES's "agent orchestration" feature), used as a marked example to keep the body agnostic.
- **Conclusion changed materially?** No new verdict; sharpens the variant boundary and lands the recursion (codified roles → agent configuration → toolchain-tier products).


## 2026-06-19 — Per-actor sections; sharpen Architect/Curator boundary

- **What changed:** Restructured "The four actors" into a dedicated subsection per actor (Framer/Builder/Architect/Curator), each with motive, object, signature output, variant, and an explicit boundary line to its neighbor. Added a **generalization ladder** (within-feature → Builder/design; across-features → Architect/architecture; across-products → Curator/curation) keyed on *scope of reuse* and *where the result lives*, with the mechanism distinction (behavior-directly / behavior-through-structure / capability-through-knowledge). Made the Architect **active/governance-setting** (draws the lines ahead of time), not passive. Replaced the three weak Curator bullets (which described architecture-of-the-corpus) with three accumulate-only acts: selection-for-durability, generalization-across-products, pruning-for-truth. Named the recursion explicitly (organizing the corpus is an Architect sub-act the Curator also performs).
- **Why:** A boundary review found the Curator was justified with architectural examples, and "generalization across features" needed a verdict (it is Architect, not Curator — the abstraction lives in and dies with the product).
- **Conclusion changed materially?** No — Curator stays a distinct actor; the distinction is now carried by *what the output outlives* rather than by shared pattern-recognition skill.
- **Spun out:** "Cross-project knowledge sharing" to its own topic (`.research/cross-project-knowledge-sharing/`).

## 2026-06-19 — Initial research dossier

- **What changed:** Created the research workspace (topic, evidence, conclusion) and grounded the framework's non-obvious claims against authoritative sources via three parallel research forks.
- **Why:** Convert the essay draft at `docs/ideas/actor-delegate-model.md` into a research-centric single source of truth with sourced citations, per the deep-research process.
- **Conclusion material?** Yes — established the verdict that the spine is well-grounded with two clearly-marked original claims (no-motive delegate; stub→rework trade-off).
- **Triggering evidence:** Agency theory, Argyris & Schön, Team Topologies, Conway's Law, screaming architecture, MECE, separation of duties, walking skeleton/test doubles, dev inner/outer loop, AI augmentation (Gartner), multi-agent orchestration (Anthropic). See `evidence.md`.
- **Session verdicts captured:** Architect distinct by object-not-scope; two-axis gate; deferred branch as scheduling decision over a dependency tree; Conductor fan-out as abundance instance.

## 2026-06-19 — Term-vs-source alignment review

- **What changed:** Compared every borrowed term against its source; fixed places where usage drifted. Outer-loop citation restricted to the inner-loop analogy; double-loop claim softened (Curator spans both modes); `producer ≠ judge` reframed as an echo of four-eyes plus a time-split of judgment; walking-skeleton recast as contrast not sibling; "stub" generalized to "placeholder"; Curator confirmed as platform (not enabling) with an enabling echo; Gartner reframed as outcome-vs-capability; Conductor/orchestrator kept distinct (actor vs delegate pattern); added an "Actor" glossary note for the UML/actor-model collision.
- **Why:** Prevent misalignments and contradictions from propagating into the downstream artifacts.
- **Conclusion changed materially?** No — the spine held; these are precision fixes. Conclusion's "two original claims" verdict unchanged.
- **Triggering evidence:** Team Topologies enabling-vs-platform definitions ([teamtopologies.com/key-concepts](https://teamtopologies.com/key-concepts)); Argyris single/double-loop boundary; four-eyes two-party requirement; GOOS walking-skeleton (real-but-thin); Anthropic multi-agent interdependency caveat.
