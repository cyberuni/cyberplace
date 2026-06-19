# Changes — The Actor–Delegate Model

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
