# The Motive Model

*A mental model for building with AI — where motive, not job title, says who you are on a team.*

A framework for building any product with AI, organized around **motive** rather than job title. Production used to be scarce, so a *title* fixed a person to one contribution; AI makes production abundant and dissolves that limit — so the unit of a team becomes the **motive** a person holds and extends through an AI **delegate**. Seen fresh from the change AI introduces.

> **What this document is.** A research-centric **single source of truth**. It is neither of the two artifacts it exists to generate — it *feeds* both: a **machine artifact** (agent configuration: actors, motives, decision rules, interfaces) and a **human artifact** (an essay: variants, scenarios, narrative). Claims that lean on established theory carry inline citation keys like `[conway]`, resolved in **References**. Two claims are the framework's *own* and are marked **(original)** where they appear. The `## Downstream artifacts` map near the end says which parts feed which artifact.

## Premise

For as long as products have been built by teams, a *position* described a *contribution*: "Engineer" meant the person who produced the code, "Designer" the one who produced the design, "QA" the one who produced the checks. Position equaled contribution because **production was scarce**, and a human had the focus and capacity to be good at producing exactly one kind of thing.

AI breaks that equation. When generation becomes abundant, producing the artifact stops being the scarce, defining act — and the limit that confined a person to a single contribution dissolves. The shift is observable already: as AI automates portions of coding and testing, the work moves toward collaborating, translating intent, and shaping how systems are built, and analysts expect it to *spawn new roles* rather than simply delete old ones [ai-roles]. A human in any position can now span several kinds of contribution, because delegates extend their reach past their own focus and capability.

So the unit of a team is no longer the *title*. It is the **role** — the kind of contribution a person makes right now — fulfilled by an **actor** (the person, defined next) wielding a **delegate** (an agent) they direct to make it on their behalf.

## Two kinds of thing: Actors and Delegates

**Actors are humans, defined by motive.** An actor wants something — to solve the right problem, to make the thing work, to keep the whole coherent. The motive is intrinsic; it is *theirs*. Accountability lives with the actor and never leaves: an actor is answerable for the outcome of their role whether they did the work themselves or delegated it.

**Delegates are agents that act on an actor's behalf.** A delegate has no intrinsic motive. It is *given* one — through artifacts the actor authors — and it executes that intent, filling the gap when the human is unavailable. Given good artifacts, a delegate often works faster and more thoroughly than the actor would alone. But it is never accountable; it is *capacity*, not a *party*.

**Substrate vs party — two words each, on purpose.** Each side is a substrate that *becomes* a party by entering the relationship:

| Substrate    | Becomes…        | by…                                                  |
| ------------ | --------------- | ---------------------------------------------------- |
| a **human**  | an **actor**    | taking on a motive and the accountability for it     |
| an **agent** | a **delegate**  | being given that intent through a delegation surface |

So **agent** names the raw capacity — an AI system, apart from any task — while **delegate** names that same agent once an actor has wielded it; the distinction mirrors the one **actor** draws over a *human*. This is why **delegate** is first a *verb*: to *delegate* is the act an actor performs — authoring the governance and criteria (the **delegation surface** and its **bar**) that transmit its responsibility to an agent, turning that agent into a delegate. The noun is just the agent caught mid-relation.

**Concretely, for an AI delegate.** The abstraction lands on familiar artifacts. A **delegation surface** materialized for an agent *is* an **agent definition** — a skill, an `AGENTS.md` section, a slash command, or a `.claude/agents/*.md` **subagent definition**: static configuration authored ahead of time that carries the brief, contract, shape, and corpus in machine-readable form. The **delegate** is the running **agent or subagent** that definition configures — the agent caught mid-task, acting on the actor's behalf. So *agent definition* stands to *subagent* as a **contract** stands to the **worker** who fills it: one is the authored surface, the other the running capacity. To *delegate*, concretely, is to **author that definition and its acceptance criteria, then run the agent under it** — which is why **agent configuration is itself a product**, built by a Builder at the toolchain tier (see *Codification* and *Recursion*).

**Actor vs role.** *Role* is the wider word — the kind of contribution a person makes, the unit that replaced the title. An **actor** is the narrow case: one of the four motive-distinct base roles, and the human end of the actor/delegate pair. **Variants** and **sub-roles** are roles too, but not actors — every actor is a role, not every role an actor. The machine reasons in actors; humans grow along the wider field of roles (see *Two resolutions*).

This is the load-bearing distinction, and it adapts a known idea. **Agency theory** describes exactly this shape — "one party (the principal) delegates work to another (the agent), who performs that work on behalf of the principal" [agency] — and it is the backbone of how we reason about delegation. But the classic theory assumes the agent is *self-interested*: it has its own goals, withholds information, and may shirk — the "agency problem." **Our delegate is the opposite, and deliberately so (original):** it has no goals of its own, so the agency problem dissolves by construction. An agent is not a teammate in the way a person is. It is a faithful extension of a person. The whole framework is about how humans-in-roles extend themselves through delegates, and how those extended roles compose into building a product.

```mermaid
flowchart LR
    A["Actor — human<br/>motive · accountability"] -->|authors| S["Delegation surface<br/>brief · contract · shape · corpus"]
    S -->|configures| D["Delegate — agent<br/>capacity · no motive"]
    D -->|returns work| A
    A -.->|checks fidelity| D
```

## The four actors

Around abundant generation sit four actors, forming a control loop: someone decides what's worth making, someone makes candidates, someone keeps the whole coherent, someone makes the learning compound. The set is held to **MECE** — mutually exclusive (motives don't overlap), collectively exhaustive (nothing essential falls outside) [mece]. And each of them also *judges* — turns its expertise backward to evaluate — so there is no separate "judge" role; judging is a face every actor has, described below.

| Actor         | Motive                                                            | What they own                                                                                                            |
| ------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Framer**    | **Intend** — what's worth doing                                   | The problem worth solving and what success means; the authority to decide *not* to build                                 |
| **Builder**   | **Generate** — make the thing                                     | A working contribution from one angle of expertise                                                                       |
| **Architect** | **Structure** — shape the whole so it stays legible and evolvable | The organizing principles, boundaries, and conventions that keep the product comprehensible and maintainable as it grows |
| **Curator**   | **Accumulate** — make knowledge compound                          | The durable, reusable knowledge every other role draws on                                                                |

The motive is what makes each a real actor: each motive generates use cases the others don't. The Framer's signature output is a *kill decision*; the Builder's is a *working artifact*; the Architect's is a *boundary or convention*; the Curator's is *reuse*. Distinct motives, distinct use cases, distinct interfaces.

One scale runs through three of them and is worth stating up front, because it is where the roles are most often confused. **Generalization is just abstraction; what differs is the scope of reuse and where the result lives** — a ladder that also captures the classic *design vs architecture* distinction:

| Generalize across…              | Result lives in…                       | Actor         | Concern                                          |
| ------------------------------- | -------------------------------------- | ------------- | ------------------------------------------------ |
| parts **within one feature**    | the feature                            | **Builder**   | *design* — how it works                          |
| **features within one product** | the product (a shared abstraction)     | **Architect** | *architecture* — how it's organized              |
| **products, over time**         | the corpus (template, skill, plugin)   | **Curator**   | *curation* — knowledge that outlives the product |

The *mechanism* each uses to add value keeps the rungs apart: **design changes behavior directly** (write better logic); **architecture changes behavior through structure** (extract the shared path, and every feature inherits the consistency); **curation changes future capability through knowledge** (the next project starts warmer). An app crammed into a single file *works* — design is satisfied — yet is unmaintainable, because the behavior was bought directly, without the structural leverage that lets the rest of the system inherit the quality. That gap is the Architect's reason to exist.

```mermaid
flowchart TB
    B["Builder — design<br/>generalize within a feature<br/>lives in: the feature"]
    AR["Architect — architecture<br/>generalize across features<br/>lives in: the product"]
    C["Curator — curation<br/>generalize across products<br/>lives in: the corpus · outlives the product"]
    B -->|"scope of reuse widens"| AR -->|"scope of reuse widens"| C
```

### Framer — intend

- **Motive:** decide what is worth doing, and what success means.
- **Object:** the problem and its definition of done — including the authority to decide *not* to build.
- **Signature output:** a **kill decision** — the cheapest, highest-leverage thing a team can produce.
- **Forward / backward:** forward, frames the problem and sets the bar for success; backward, makes the kill-or-ship call at the gate.
- **Boundary (vs Builder):** the Framer owns *whether and why*; the Builder owns *how*. A Builder who redefines the goal has stepped into the Framer role.

### Builder — generate

- **Motive:** make the thing work, from one angle of expertise.
- **Object:** a **part** — a working contribution (a feature, a fix, a UI, a control). This is *design*: how it works.
- **Signature output:** a working artifact, co-delivered with the contract (test or spec) that defines its behavior.
- **Variant:** *Explorer* — generates to *discard* (breadth, speed, low attachment), versus the default Builder who generates to *keep* (depth, craft, correctness).
- **Boundary (vs Architect):** the Builder makes a part; the moment the work is about the *relations between* parts, it is an Architect act — even when the same person does it in the same minute.

### Architect — structure

- **Motive:** keep the whole legible and evolvable as it grows — *architecture*: how things are organized, for maintainability.
- **Object:** the **relations between parts** — boundaries, conventions, the composition law over everything the Builders make. Not a bigger part; a different *kind* of thing — which is why "Builder at system scope" is a category error (see *Resolved*): scope was never the separator. **Conway's Law** is the backdrop — a system's structure mirrors the communication structure that built it [conway].
- **Active, and it *is* governance.** The Architect does not tidy what landed; it **draws the lines ahead of time** — chooses that structure should *scream the domain* [screaming], leans on SOLID or clean-architecture boundaries, decides which principle outranks which for *this* system, and authors the rules the Builders then build under. Constraints are the defensive half; choosing and imposing the organizing principles is the constructive half.
- **Generalizes across features, inside the product.** Noticing three features each roll their own auth and extracting one shared path is Architect work — and it pays a *behavioral* dividend (every feature now authenticates consistently and correctly). That dividend is the **fruit of organizing**, not a separate design act; it is *why* architecture earns its keep.
- **Signature output:** a boundary or convention. **Variant:** *Conductor* (forming) — structures at runtime, orchestrating delegates and people in parallel; much of it is codifiable into a delegate (see *Two resolutions*).
- **Boundary (vs Curator):** the Architect's abstraction lives in *this* product and dies with it. The moment the output is lifted out as knowledge meant to outlive the product, it is Curator work.

### Curator — accumulate (the foundation tier)

The three roles above operate on the *product*. Curator does not — its object is **knowledge designed to outlive any single product**. That raises the objection that recurs every time: isn't keeping the corpus organized just *architecture at another tier*?

**Partly — and worth saying plainly.** Organizing the corpus (keeping it coherent, DRY, legible) *is* architecture-of-the-corpus, and a Curator performs it constantly — the way every actor borrows skills across roles. But the role is named for the part architecture does **not** contain. Three acts are Curator-only, and none is "organize":

- **Selection for durability** — deciding which lessons are *durable enough to encode* versus transient noise. Architecture organizes the parts that exist; it never judges which *experiences* earn a permanent place.
- **Generalization across products and time** — lifting a specific solution into a transferable form for problems that *don't exist yet* (a template, a convention, an agent skill or plugin). In-product DRY stops at the product boundary; this crosses it.
- **Pruning for truth** — removing what is *no longer true*, not merely what is structurally incoherent. Truth-decay over time, not present fit.

These are *accumulate* — grow a compounding, reusable asset — not *structure*. That is the motive architecture lacks, and it is why a corpus-maintainer flipping into Architect-of-the-corpus no more makes Curator a sub-case of Architect than a Builder reviewing code makes review a sub-case of Building.

Its output *feels* like a layer because every other actor's delegate reads from it — precisely the position of a **platform or infrastructure team**: a role whose *product* is a layer, "made available via self-service capabilities… easy for the [other] teams to consume" [team-topologies]. (Its capability-raising has an *enabling-team* flavor; but unlike an enabling team — time-boxed, product-less — Curator is permanent and owns a product, the corpus, which is the **platform** pattern [team-topologies].) So the model has two tiers:

- **Delivery actors** — Framer, Builder, Architect — operate on the *product*.
- **Foundation actor** — Curator — operates on the team's *capacity to deliver*: the corpus the other three's delegates draw from.

The Curator's own practices live in the corpus too, so it is self-describing — a fixed point, not an infinite regress. And a prediction falls out of the tiering: infrastructure is the first thing a team neglects, and its neglect degrades *everyone* — a decaying corpus forces every delegate, in every role, to start cold.

### Every actor has two faces: produce and evaluate

The same expertise points two ways. Applied **forward**, it produces — a Builder writes code, an Architect designs structure, a Framer frames a problem. Applied **backward**, the same expertise *judges* — the Builder reviews code, the Architect runs a design review, the Framer makes a kill-or-ship call. Nothing about the person or their knowledge changes between the two; only the *direction* does. This is "verbs, not titles" at its sharpest.

So there is **no standalone Gatekeeper actor.** "Gatekeeping" is what any actor's expertise does when turned backward; a thing with no domain of its own is a direction, not a role. The word survives as the name of an *activity*, not a party.

One constraint governs the faces: **`producer ≠ judge`** — an *echo* of the **separation-of-duties / four-eyes principle** [sod], not the strict thing. Strict four-eyes needs two different parties; here a single actor can serve both faces, flipping forward to backward on the same artifact in split seconds. The boundary is genuinely weaker — but it is real, and humans run it constantly. What the model *adds* is a **split of judgment across time** that beats the limit of real-time review. Criteria authored *ahead of time*, under no time pressure, can be thorough — but only *generally*, not specifically; these live in the **bar** and fire automatically through the delegate. *In the loop*, where attention is scarce and the clock runs, the human is freed from re-deriving the general checks and spends that scarce attention on the **specific and important** — which is where judgment quality is actually won. Switching forward-to-backward on the *same* artifact still *spends* your standing as an arm's-length reviewer, which is why, when a reviewer pushes a fix, someone else approves.

*The control loop — forward production, backward faces converging at the gate, and the feedback edge:*

```mermaid
flowchart LR
    F["Framer<br/>intend"] -->|brief| B["Builder<br/>generate"]
    B -->|artifact| AR["Architect<br/>structure"]
    AR -->|shape| B
    F -.->|backward face| G{{"the gate"}}
    B -.->|backward face| G
    AR -.->|backward face| G
    G -->|ship| OUT(["product"])
    G -.->|"deferred work"| BL["backlog<br/>re-prioritized · decision rule"]
    BL -.->|"re-enters as owning actor's work"| F
    C["Curator<br/>foundation · corpus"] -.-> F
    C -.-> B
    C -.-> AR
```

## The gate: a two-axis decision

> **Feeds:** machine artifact (decision rules, interface contracts) primarily.

**The gate** is the boundary — a pull request, a release — where backward faces converge on one change: correctness (Builder, backward), fit-to-structure (Architect, backward), and worth-shipping (Framer, backward) are judged together. What comes out is **not a single bit.** It is two decisions on two axes:

- **Verdict** — does this change pass *now*? `accept` / `block`.
- **Change request** — does the gate emit new work? `none` / `yes`, and if yes, with a **timing**: `within-PR` or `deferred`.

|             | no change request           | change request                                        |
| ----------- | --------------------------- | ----------------------------------------------------- |
| **accept**  | clean merge                 | merge **+ work** (within-PR nit, or deferred follow-up) |
| **block**   | **kill** — nothing fixes it | **request changes** (work is within-PR by necessity)  |

Two corners earn names. `block + none` is a **kill** — no incremental fix saves this attempt — but *what* dies depends on the rejecting face: a **Framer** kill abandons the goal (*this should not exist*), while an **Architect** or **Builder** kill rejects the approach or the artifact (*not like this*) with the goal still standing. How often it fires at all depends on how *editable* the upstream is: when the artifact is regenerated from a spec (spec-driven development), an Architect or Builder rejection usually becomes *revise the spec and retry* — an iteration, not a kill — leaving the **Framer** kill (a goal no spec edit saves) as the main residual. `accept + deferred` is the **feedback edge**: merge now, spin off work that re-enters the loop later (see *How it composes*).

```mermaid
flowchart TB
    G{{"backward faces converge"}} --> V{"verdict?"}
    V -->|"accept · no change"| M["clean merge"]
    V -->|"accept · deferred change"| MD["merge now<br/>+ new work to backlog"]
    V -->|"change needed now"| IT["iterate<br/>fix → bar → re-gate"]
    V -->|"reject the attempt"| K["kill<br/>intent / approach / artifact"]
    IT -.->|"re-gate"| G
    MD -.->|"re-enters as owning actor's work"| G
```

The first axis is governed by a **decision rule** — how the backward faces combine into one verdict, anywhere from an all-pass unanimous veto to a single senior decider (in practice, often a senior engineer weighting the Architect face, or a domain expert weighting the Framer face). The rule is *governance*, a policy choice, not an actor. The second axis is *generated output*, not a combination rule — so the two stay distinct.

One coupling, stated honestly: **`block` forces `within-PR`.** You cannot defer the thing that blocks — deferring it *means* it stopped blocking. So timing has freedom only under `accept`; a `block + deferred` cell would be dead. Timing is therefore a flavor of the change-request axis, not a third independent axis.

### The deferred branch is a scheduling decision over a dependency tree

`accept + deferred` is richer than "file a ticket." It emits **new work that re-enters as its owning actor's object** — a deferred *feature* is a Framer concern (product intent), a deferred *refactor* an Architect concern (structure). **Sequencing it against everything else is a decision rule** — governance weighing the Framer's product priority against the Architect's structural urgency, not one actor's call. The **Architect** detects a structural concern and estimates it (scope, complexity → rework cost); the rule weighs that estimate against product priority to set the order.

The decision runs over two trees that can diverge:

- **Dependency order** — A *needs* B. This is the Architect's object: relations between parts.
- **Work order** — the sequence we actually build in.

A **placeholder** — a stub (in the test-double sense [test-double], generalized to production), a workaround, or a rougher MVP — is what lets work-order diverge from dependency-order: you build A against a stand-in for B, and pay **rework** when the real B lands. (Contrast the *walking skeleton*, which dodges that tax by building a thin slice of **real** end-to-end functionality rather than a fake [walking-skeleton] — real-but-thin instead of full-but-faked.) That gives the two flavors of defer **(original — the trade-off is the framework's own inference, not a sourced result):**

- **Defer the new work** — workaround/stub now, build the dependency later, accept the rework.
- **Defer the current work** — stop, build the prerequisite first, no rework, at the cost of interrupting the current thread.

The determining factor is a cost comparison: **rework cost** (stub now, redo later) versus **switch/blocking cost** (stop current, build prerequisite first). Scope and complexity drive both sides — a large, high-blast-radius concern makes a rushed inline fix dangerous *and* makes rework expensive, which is why big architectural debt is deferred to a deliberate effort rather than either ignored or forced in-line.

**Capacity used to decide this — and abundance is exactly what changes it.** Pre-AI, "build the prerequisite first" meant *stop everything*, because no hands were spare; so teams defaulted to workaround-now and accumulated debt. With delegates, the human — conducting, in the Architect's runtime mode — **directs an orchestrator-delegate to fan the dependency out** while the current thread keeps moving (the orchestrator-worker pattern, where a lead "dynamically breaks down tasks, delegates them to worker [agents]… and synthesizes their results" [multi-agent]). "Build the dependency first" stops meaning "stop everything" and becomes "parallelize." This is the **conducting** move, and a direct instance of the abundance premise: abundance does not remove the dependency tree; it lets you walk it without serializing. The boundary condition is real, and it bites right here: fan-out works when the dependency is *separable behind a stable interface* (loose coupling at the seam), and works worst when the dependency is tightly interwoven with the current thread — exactly the *tightly interdependent* case orchestration handles least well [multi-agent]. So the move is available precisely when the seam is clean; when it is not, the scheduling choice tightens toward *defer current work*.

A naming distinction the metaphor invites: the **Conductor is the *actor*** — the human, holding motive and accountability — while the **orchestrator is the *delegate pattern*** it wields (a lead delegate that breaks down and directs workers [multi-agent]). They do not merge. Collapsing them would fold an actor back into a delegate — the one move the model forbids.

## Positions are not roles

> **Feeds:** human artifact (essay) primarily.

The thesis, made concrete. A position used to be one **bundle** — one actor working one **object** through one **angle** — because production was scarce and focus finite: PM *framed* the product, Engineer *built* the code, Designer *built* the UX, QA *evaluated* quality. With delegates supplying production, the bundle comes apart: each position can act as more actors, and reach past its default object into process and toolchain (see *Recursion*). The title becomes a *default*, not a boundary.

| Position     | Object · angle (default bundle) | Default actor · face   | Actors AI now opens                                                                                          |
| ------------ | ------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **PM**       | product · intent                | Framer · forward       | Builder (prototype with a delegate), Curator (encode product knowledge)                                      |
| **Designer** | product · UX                    | Builder · forward      | Framer (own the *why*), Architect (the design system), Curator (the design corpus)                          |
| **Engineer** | product · code                  | Builder · forward      | Architect (structure), Curator (conventions); reaches process & toolchain                                    |
| **QA**       | product · quality               | Builder · **backward** | Architect (acceptance criteria), Curator (golden sets & regression corpus), Explorer (adversarial probing)   |

QA is the sharpest case: its default is the **backward-face Builder** — the trained quality specialist. When delegates write the checks, QA stops being the one who *writes* them and becomes the one who *owns the acceptance contract and curates the corpus it draws on* — backward Builder plus Architect and Curator.

Two things the table no longer says. There is **no Gatekeeper column**: the backward face is *universal* — every position turns its expertise backward on whatever it touches, so review is everyone's part-time act, not a role one position owns. And the default actor now carries a **face**, which is how QA enters as a Builder turned backward rather than as a phantom "Gatekeeper actor."

## Two resolutions: actors for machines, variants for humans

The four actors are the right unit **for the machine** — for generating use cases, scenarios, and human-agent interfaces. At that resolution, finer distinctions are noise.

But humans need a finer resolution, because **roles that share a motive can still demand opposite preparation.** Each actor has a default form plus named **variants** — specializations that fold away for the machine but matter enormously for human capacity, training, and growth.

Not every specialization earns a name. A candidate — actor, variant, or sub-role — must clear three **membership gates**, and they are what keep the taxonomy from sprawling:

- **Distinct motive** — for an *actor*; a *variant* instead shares its actor's motive.
- **Capacity differentiation** — inhabiting it must require a *substantial, distinct* body of knowledge. If the preparation delta is small, it is not a role; it is a function to **codify**.
- **Persistence** — the need must *recur and aggregate* into a standing demand a human specializes toward. (Not continuous occupancy — a Framer's kill is a split-second act; the *need* is what must aggregate.) A momentary, absorbable need is a sub-role: a *janitor*, not a *cleaner-of-the-flush-handle*.

| Actor         | Variant                               | Status    | How it differs — and why preparation differs                                                                                          |
| ------------- | ------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Builder**   | *Explorer* — generates to *discard*   | confirmed | Breadth, pattern recognition, low attachment, speed over polish — versus the default Builder who generates to *keep* (depth, craft, correctness). Clears both gates: a near-opposite cognitive profile, and a recurring, aggregated need. (Forward face.) |
| **Builder**   | *QA* — *evaluates* the product        | confirmed | The Builder's *backward* variant: deep training in verifying the product — test design, coverage, edge-case and regression reasoning, judging against the **bar** — versus producing it. Same *motive* (the thing working), turned backward. The proof that variants are not forward-only. (Backward face.) |
| **Framer**    | *Scout* — discovers problems          | forming   | Problem *discovery* — divergent, exploratory, low-attachment user/market sensing — versus the default Framer's convergent value *judgment* (the kill-or-ship call). The Framer's Explorer: same *motive* (intend), near-opposite *training*. Clears the gates in principle; *forming* until AI-assisted discovery aggregates into a settled standing practice. |
| **Architect** | *Conductor* — structures at *runtime* | forming   | Orchestrates many delegates and people into one whole at runtime — versus the default Architect who structures the *artifact* at design time. **Borderline today:** much of it is codifiable (the orchestrator-worker pattern is already a *delegate*, not a human role), and the non-codifiable residual decomposes into Framer (reprioritize) and Architect (re-seam) acts. It strengthens as fleets grow — at large scale, coordinating many agents in real time may cross an *air-traffic-control* threshold into a distinct capacity. |

Explorer and the default Builder are nearly opposite cognitive profiles — the same *motive* (generate), incompatible *training*. That is why a single framework needs both resolutions: collapse to actors to design the system, expand to variants to develop the people. A variant can specialize on *either* face: most named ones live on the forward face (Explorer, Scout, Conductor — *produce* differently), but a variant can equally specialize the **backward** face — **QA** is a Builder variant whose distinct training is *evaluating* the product (test design, coverage, edge-case and regression reasoning), not producing it. The face stays universal — every actor has both — and a variant is simply the trained specialization anchored to one of them.

A variant is a *lateral* specialization, not an advancement of its actor: it can require **less** total capacity, differently geared — an Explorer needs no build environment or working code, only a delegate to prompt, where the default Builder must make the thing actually run. There is no leveling between an actor and its variants; the difference is *which* capacity, not *how much*.

### Codification moves the actor/delegate line

The capacity gate has a consequence worth stating on its own: **a role is worth naming only where the human capacity is substantial *and* not-yet-codifiable.** The moment a function becomes codifiable, its codifiable slice crosses the **actor/delegate line** and becomes **agent configuration** — the delegation surface, materialized for an AI delegate. (Codify a Curator and you get skills and conventions; a Builder, specs; a Conductor, orchestration config.) So codifiability is *where* the actor/delegate boundary sits, and it moves over time — the same engine as the abundance premise, now applied to coordination rather than production.

This is why "isn't a Conductor just someone who *builds* the orchestration?" is half-right. Building that agent configuration is a real job — but it is a **Builder at the toolchain tier**, whose object is a *part* (the orchestration feature), because **agent configuration is itself a product**, built by its own Framer, Builder, Architect, and Curator. *(Concretely in this repository: the "agent orchestration" feature of the ACES plugin is the codified Conductor, built by a Builder of ACES — a product the framework describes building, not a part of the framework.)*

## Delegation surfaces

Every actor extends itself through a **delegation surface** — the artifact by which it transmits intent across an availability gap: to a delegate now, to a teammate, or to its own future self.

| Actor         | Delegation surface           | What it carries                                                                       |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| **Framer**    | **The brief**                | The problem, the *why*, the definition of success                                     |
| **Builder**   | **The contract + exemplars** | A behavioral spec for one angle, plus reference patterns to imitate                   |
| **Architect** | **The shape**                | Organizing principles, boundaries, conventions, and the constraints that protect them |
| **Curator**   | **The corpus**               | Distilled, reusable knowledge every other delegate reads from                         |

Each surface has a backward face too — its **bar**, the acceptance criteria the same expertise applies when judging. The bar is not a separate surface; it is the *criteria face* of every surface: the brief's definition of success, the shape's fitness rules, the contract's behavioral checks. Stated as instruction it guides production; stated as criteria it gates acceptance — two faces of one artifact.

*Brief, contract, shape, corpus* (each with its criteria face). These are categories, not products. A given team instantiates them in whatever form fits — a one-page brief or a chartered intent doc; convention files or decision records; checklists or executable acceptance tests. The framework names the surface; the team chooses the medium.

The Curator's surface is special: its output *is* the substrate every other delegate reads from. A team that invests in its corpus makes every other delegate faster and more faithful at once. A team that neglects it forces every delegate to start cold.

## Curator and the loop

The model has **three distinct loops.** Keeping them separate is the point — they fire at different cadences, on different objects, owned by different actors:

- **Inner loop** — *within a task.* Builder produces, the **bar** (a backward face made executable) fires, Builder corrects, Architect reshapes under green. Fast; every iteration — the developer inner loop [dev-loop]. This is **single-loop** learning [argyris]: correcting *actions* under fixed assumptions. The Curator does not fire here.
- **Product feedback edge** — *across tasks, same product.* Work deferred at the gate re-enters as its owning actor's object (a refactor → Architect, a feature → Framer), sequenced by a decision rule. New work, same product.
- **Outer loop** — *across products.* The Curator distills durable lessons into the corpus so the next inner loop starts warmer. This is **double-loop** learning [argyris]: revising the *assumptions* themselves.

```mermaid
flowchart LR
    B["Builder produces"] --> BAR{"bar fires"}
    BAR -->|"correct · inner loop"| B
    BAR -->|"accept + deferred"| BL["backlog · this product<br/>re-prioritized"]
    BL -.-> B
    BAR -->|"durable lesson"| CUR["Curator distills → corpus<br/>outer loop · any product"]
    CUR -.->|"warmer start"| B
```

The middle and outer loops are easy to confuse but distinct: deferred work changes *this* product; the Curator changes the *capacity to build any product*. And the Curator spans both learning modes — routine **codification** (encode what works — a lint rule for a thrice-solved pattern) is single-loop; **revision** (prune a now-false convention, resolve a contradiction) is double-loop, its distinctive mode.

Firing Curator every iteration is **premature codification** — you encode transient noise and thrash the corpus before you know which lessons are durable. So the human Curator is episodic, triggered at boundaries: a pattern solved three times, the same correction repeated across loops, a contradiction or staleness that needs pruning, a milestone retro.

The interface this produces is the model's first concrete one: the **Curator's delegate watches continuously** — flagging candidates, drafting conventions, detecting corpus contradictions, all cheap — while the **human Curator holds the accept/prune decision**, because that call is accountable and high-blast-radius. *Detection and drafting by the delegate; keep-or-cut by the human.* It is a template for every other actor's interface.

## Delegate fidelity: the orthogonal axis

Delegating is only half the relationship. The other half is **verifying the delegate is faithful** — that it does what the actor would have done, and intended. This concern is orthogonal to the four actors: every actor delegates *and* must check its delegate.

Fidelity is distinct from evaluation. A backward face judges *the product*; fidelity judges *the delegate*. They are different objects at different levels — judging the work versus judging the worker. A great deal of human-agent *interface* design lives on this axis: how an actor inspects, calibrates, and trusts the capacity it is wielding.

Its formal shape resolves cleanly into the model's own vocabulary: it is **neither a fifth actor** (no motive — it fails the first membership gate; it is a *relation*, not a party) **nor a third face** (a face points at the work; fidelity points at the worker). It is a **delegate-directed check riding every delegation surface — the mirror of the bar.** The bar turns a surface's criteria on the *artifact*; fidelity turns the same surface's criteria on the *delegate that produced it*: given this brief, contract, shape, or corpus, does the delegate do what the actor would have done and intended? That is also why the human–agent interface lives here — the interface *is* the fidelity instrument.

> Building a robust fidelity system for one class of delegate — agent configurations — is itself a product, with its own Framer, Builder, Architect, and Curator. The framework describes how such a product gets built; it does not contain it.

## Scenarios: how the actors actually show up

> **Feeds:** human artifact (essay) primarily.

Actor involvement has a topology. Who plays which actor, and when, runs along an axis from **fully decoupled** — roles spread across people, gated by asynchronous boundaries — to **fully compressed** — one human spans every role while delegates supply the production. Real work sits between.

### Decoupled: a bug fix in an open-source project

- **Framer** — the contributor decides this bug is worth their time, usually self-framed from their own pain; the issue thread is the brief. A maintainer framed it earlier by accepting and labeling it.
- **Explorer** (Builder, divergent) — the contributor reproduces it, reads unfamiliar code, tries a couple of approaches, discards the dead ends.
- **Builder** (producer) — writes the fix and a regression test; the test is the contract, co-delivered.
- *— boundary: the pull request —*
- **The gate** — the maintainer enters *only now*, turning expertise backward against the change: correctness (Builder face) against the bar, fit-to-structure (Architect face), and worth-merging (Framer face). The two-axis verdict applies: accept-or-block, with or without change requests — and a recurring-class concern may be `accept + deferred`, filed as a follow-up. Note the asymmetry — the contributor produced for days with no evaluation present; the gate is async and late.
- **Curator** — if the bug is one of a recurring class, the maintainer encodes a lint rule, a test pattern, or a CONTRIBUTING note so the next contributor avoids it. Frequently deferred or skipped — infrastructure neglect in the wild.

Reading: one human (contributor) plays Framer + Explorer + Builder forward; another (maintainer) judges at the gate — the Builder, Architect, and Framer faces turned backward — and curates. Roles cluster by *position in the contribution flow*, not by job. And the same maintainer who judges here is a Builder on their own commits — the verb, not the person.

### Compressed: a solo developer and their delegates ship a feature

- **Framer** — the developer fixes the feature's *why* and what success looks like, sometimes as a written brief, sometimes only in their head.
- **Explorer** (Builder variant) — a delegate spikes three approaches in parallel; the developer, applying expertise *backward*, keeps one and kills two. (That pick is the Builder's own backward face — evaluation inside the Builder phase.)
- **Builder** (producer) — a delegate implements the chosen approach; the inner loop runs against tests.
- *— boundary: the developer reads the diff —*
- **The gate** — the same human, now turning their expertise backward on the delegate's output. `producer ≠ judge` still holds, because the *delegate* produced and the *human* judges.
- **Architect (conducting)** — the developer notices it should follow an existing convention and directs a refactor under green; if the convention requires a not-yet-built helper, they direct an orchestrator-delegate to build it in parallel rather than stalling the feature (the scheduling decision in miniature).
- **Curator** — at the end, the developer encodes the new convention so the next feature starts warmer — or, more often, a Curator-delegate flags "you've done this three times" and the human approves the entry.

Reading: one human spans all four actors, forward and backward, in an afternoon — impossible before AI, when production consumed all their focus. Delegates supply the production capacity, freeing the human to move through the roles while holding motive and accountability throughout. This is the thesis in miniature: abundance does not replace the human; it lets one human *be* the team.

## How it composes

The chain the framework is meant to drive — and the edge that closes it into the control loop named at the top:

```
Actors (humans + motives)
   └─ generate Use cases (what each motive needs to accomplish)
        └─ generate Scenarios (how it plays out, who delegates what)
             └─ shape Human–agent interfaces (the surfaces + fidelity checks)

   ▲ the loop closes: at the gate, evaluation emits new work —
   └──── deferred work → backlog (re-prioritized) → next round ────┘
```

Get the actors and motives right and the rest is downstream. Get them wrong — by treating agents as actors, or by organizing on a timeline instead of by motive — and the use cases overlap, the scenarios blur, and the interfaces inherit the confusion. The back-edge is what makes this a control loop and not a one-way pipeline: evaluation does not just gate, it *generates* the next round of intent. And this whole chain applies to each of product, process, and toolchain — overlapping sets, not the product alone (see *Recursion*).

## Recursion: the framework turns on itself

Everything above describes building *a product*. But the four actors, the two faces, the delegation surfaces, and the gate are **invariant** — point the same machine at a different *object* and it still runs. And the framework is **self-applying**: it builds not only the product but the **process** and the **toolchain** that build the product. Three objects matter:

| Object        | What it is                        | Framer decides   | Builder makes              | Architect structures   | Curator distills            |
| ------------- | --------------------------------- | ---------------- | -------------------------- | ---------------------- | --------------------------- |
| **Product**   | the concrete, substantive outcome | which product    | a feature                  | the codebase           | product & domain knowledge  |
| **Process**   | the way of working              | which practices  | a workflow or runbook      | how the practices fit  | process lessons             |
| **Toolchain** | tools & agent configuration     | which tooling    | a skill, plugin, or harness | the toolchain          | tooling patterns            |

The loop is identical in each; only its object differs. So a "senior" anyone is not a *bigger* role — it is the same role worked across more of them.

**They are overlapping sets, not stacked levels.** Process and toolchain interpenetrate — a commit discipline encoded as a hook is *process and toolchain at once*; the toolchain is often *how* the process is enacted. A domain pattern codified as a skill is *product knowledge and toolchain*. The three intersect, union, and influence one another, and the same artifact frequently lives in more than one.

```mermaid
flowchart TB
    PROC["PROCESS<br/>the way of working"]
    TOOL["TOOLCHAIN<br/>tools and agent configuration"]
    PROD["PRODUCT<br/>the concrete, substantive outcome"]
    PROC <-->|"overlap & co-evolve"| TOOL
    PROD -->|"experience distilled · Curator"| PROC
    PROD -->|"experience distilled · Curator"| TOOL
    PROC -->|"capability supplied"| PROD
    TOOL -->|"capability supplied"| PROD
```

The one asymmetry: **product is the concrete, substantive outcome — the thing that ships.** Process and toolchain are *means* that serve it and are refined by it. Influence runs every way at once: building the product teaches process and tooling (the Curator distills), while better process and tooling make the next product cheaper.

Three things this clears up:

**Your past Architect definition resolves.** "Own codebase health, *and* the process governing AI contributions, *and* the AI workflow/harness" was never one outsized role — it is the **Architect motive worked across all three sets.** One motive, three objects.

**Codification is how knowledge crosses between the sets** — not an elevator up a ladder. The Curator distills a product lesson into a process convention or a toolchain artifact — *agent configuration* — which lands in process, toolchain, or their overlap, and is *wielded* back in product-building. The codification law (above) is one instance of this crossing.

**Curator carries knowledge across boundaries — and that unifies the model.** "Accumulate" *is* lifting product experience into a reusable process or toolchain asset. So the **Curator foundation tier**, the **codification law**, **agent configuration**, and this **self-application** are one pattern: knowledge made reusable and carried across a seam — the seam between *actors* (Curator → the other three, within one build) and the seams between *sets* (product ↔ process ↔ toolchain). Same motive, two kinds of seam.

> **Term guard.** *Tier* is the delivery-vs-foundation split among the four actors, *within* one build. Product / process / toolchain are a different thing — three **overlapping sets** the framework is applied to, not a stack and not a tier.

## Resolved

- **Is Architect a distinct actor or Builder at system scope?** Distinct — and the original framing hid the real separator. *Scope* was a red herring: a Builder zoomed out still produces a **part**, just a bigger one. The Architect's **object** is different — *relations between parts* (boundaries, conventions, the composition law), not a slice of the product [conway]. That holds at every scope, so "Builder at system scope" is a category error. Operationally the Architect also differs on **deliverability** (realized only *through* others' work — a convention exists only when Builders follow it), **feedback latency** (slow and global — felt at the next change, not in a passing test), and **cadence** (per structural decision, not per contribution). Feature-scale fuzziness — "a Builder co-delivering a spec is already doing architecture" — is one *person* flipping roles, not the actors merging: switching motive is switching actor.

- **Is the Architect's breadth (codebase + process + harness) one big role?** No — it is the Architect motive worked across three **overlapping sets** (product, process, toolchain); see *Recursion*. That set split and *tier* (delivery vs foundation actor, within one build) are different things; they meet at the **Curator** — the foundation tier within a build and the actor that carries knowledge between the sets.

- **Is Curator a peer actor or a layer?** Both — the question was a false choice. *Actor* asks whether a distinct motive generates distinct use cases (it does); *layer* asks where the output sits in the dependency graph (foundational). Curator is the team's **infrastructure actor**: a full actor whose product is a layer, like a platform team [team-topologies]. The model is two-tiered — three delivery actors over one foundation actor — not actors plus a non-actor substrate.

- **Is Gatekeeper a standalone actor?** No. Judging is expertise turned backward, so *every* actor has an evaluative face — there is no role with judging as its own domain. **The gate** is the boundary where those backward faces converge; the verdict is a two-axis decision (accept/block × change-request) governed by a **decision rule** (unanimous veto → single senior decider), i.e. governance, not a party. "Gatekeeper" survives as the name of the *activity*. `producer ≠ judge` holds per artifact across time [sod]. Net: **four actors** (Framer, Builder, Architect + Curator foundation), each with a forward and a backward face.

- **How many variants, and for which actors — what bounds the list?** The **membership gates** are the answer: the count is not fixed, it is *discovered* per candidate. A candidate is a named variant only when it shares its actor's motive yet demands a *substantial, distinct* body of preparation (capacity gate) for a *recurring, aggregated* need (persistence gate); fail either and it is a sub-role or a function to **codify**, not a variant. Verdicts under the gates: **Builder → Explorer** confirmed (forward — generate-to-discard) and **QA** confirmed (backward — evaluate the product); **Architect → Conductor** forming (runtime structuring, much already codified into the orchestrator delegate); **Framer → Scout** forming — by the same logic that confirms Explorer, problem *discovery* (divergent, exploratory, low-attachment — user/market sensing) is a near-opposite cognitive profile from value *judgment* (convergent, economic — the kill-or-ship call), and the discovery need recurs and aggregates; it is the Framer's Explorer. **Curator → none clears the gates:** its three signature acts (selection-for-durability, generalization-across-products, pruning-for-truth) share one cognitive profile — judgment about what is *durably true* — so splitting them yields sub-roles with a small preparation delta, not variants (a janitor, not a cleaner-of-the-flush-handle). The gates, not a number, hold the line. (A variant can anchor to *either* face — most are forward, but **QA** is a backward-face Builder variant — so face and variant stay distinct axes.)

- **Does the delegation surface serve human-to-human as well as human-to-agent?** Yes — and it is a strength, not a tell. The surface transmits intent across an *availability gap*, and the gap is medium-agnostic: the same brief hands a problem to a delegate now, a teammate next week, or one's own future self. Delegation predates AI, and intent-transmission artifacts always served it. What AI changes is not the *surface* but two things around it — the **economics** (abundance makes delegation the default rather than the exception, so authoring surfaces stops being overhead and becomes the main act) and the **fidelity problem** (a new class of delegate whose faithfulness cannot be assumed from shared human context and must be checked explicitly; see *Delegate fidelity*). So the framework does describe *all* delegation; the AI-specific weight sits in abundance and fidelity, not in the surface. The thin-claim worry inverts: the surface's generality is load-bearing *because* one artifact serves human and agent delegates interchangeably — which is exactly what lets one human conduct a mixed team.

- **Is the abundance premise universal?** No, and it need not be — abundance is a **dial, not a switch**, and the framework is *abundance-relative* by construction. Where generation is cheap (common code, tests, boilerplate) one human spans many roles — the compressed scenario. Where it stays expensive (novel, hard, research-grade generation) the old *title = contribution* equation survives *locally*: a human is again confined to one contribution, and the framework degrades gracefully to the decoupled scenario (roles spread across people). Nothing breaks; the same actors and faces apply, only the *compression* changes. The decoupled ↔ compressed scenario axis just *is* this dial. So the framework does not assert universal abundance; its reach tracks abundance wherever it actually is. What remains open is empirical, not structural (see *Open questions*).

- **What is the formal shape of delegate fidelity?** Not a fifth actor — it has no motive, so it fails the first membership gate; it is a *relation*, not a party. Not a third **face** either — a face points at the *work* (forward produces it, backward judges it), while fidelity points at the *delegate* (the worker), the different object the glossary keeps reserved. The shape is **a delegate-directed check attached to every delegation surface — the mirror of the bar.** The bar is the surface's criteria turned on the *artifact*; fidelity is the same surface's criteria turned on the *delegate that produced it* — does this delegate, given this brief / contract / shape / corpus, do what the actor would have done and intended? Because it rides every surface, it also answers "where does the human–agent interface live": the interface *is* the fidelity instrument — how an actor inspects, calibrates, and trusts the capacity it wields. So: not a concern beside the four, and not a face, but a delegate-directed check on each of the four surfaces, and the true home of interface design.

## Open questions

1. **How far does abundance actually reach, and how fast?** AI makes *common* generation cheap; whether it reaches *novel or hard* generation — and how quickly — is empirical and unsettled. It does not threaten the framework's structure, which is abundance-relative and degrades gracefully where generation stays expensive (see *Resolved*), but it sets how often the compressed end of the scenario axis is reachable in practice. Recheck against newer evidence.

2. **Do the *forming* variants harden?** **Conductor** (of Architect) and **Scout** (of Framer) clear the membership gates in principle but are not yet settled standing roles — Conductor strengthens as agent fleets grow (an air-traffic-control threshold), Scout as AI-assisted problem discovery aggregates into a distinct practice. Watch whether each crosses from *forming* to *confirmed*, or whether its capacity stays codifiable (and so folds into a delegate rather than a human variant).

## Downstream artifacts

This dossier is the single source of truth. Two artifacts are generated from it; this map says which parts feed which.

| Dossier part | → Machine artifact (agent config) | → Human artifact (essay) |
| --- | --- | --- |
| Two kinds of thing (Actors/Delegates) | core type definitions; the delegate-has-no-motive rule | the framing chapter |
| The four actors + motives | the actor enum that seeds use cases | the conceptual spine |
| Two faces; `producer ≠ judge` | review/governance constraints | the "verbs not titles" argument |
| The gate (two-axis decision, decision rule) | **primary** — gating logic, branch handling, interfaces | illustrated via scenarios |
| Deferred branch / scheduling over dependency tree | orchestration + scheduling policy; Conductor fan-out | the dependency-tree narrative |
| Delegation surfaces + bar | the surface/criteria contracts | what each role hands off |
| Curator and the loop (three loops) | when each loop fires; Curator-delegate interface | the learning-compounds story |
| Variants (Explorer; Scout, Conductor — forming) | folds away (machine uses actors) | **primary** — capacity, training, growth |
| Positions are not roles | — | **primary** — the reader's on-ramp |
| Scenarios | trace-checks for the use cases | **primary** — concrete walk-throughs |
| Delegate fidelity | the fidelity-check axis of every interface | the open frontier |

## Glossary

The framework's load-bearing terms, in dependency order — earlier terms ground later ones. Each word means exactly one thing; collisions are called out where they were tempting.

| Term | Definition |
| --- | --- |
| **Role** | The genus — *a kind of contribution a person makes*, defined by **motive**. Spans **actors** (the four motive-distinct base roles), their **variants**, and **sub-roles**. Every actor is a role; not every role is an actor. The unit of a team that replaced the *title*. |
| **Actor** | The narrow case of a **role**: one of the four motive-distinct base roles — Framer, Builder, Architect, Curator — and the human party in the **actor/delegate** pair. Holds accountability, which never delegates. *Collision to note: unlike a UML use-case "actor" (which may be a non-human system) or the actor-model actor, our actor is **always human** — agents are delegates.* |
| **Agent** | The *substrate* of a delegate: an AI system apart from any task. An agent **becomes a delegate** when an actor gives it intent through a **delegation surface** — the mirror of how a human becomes an **actor** by taking on a motive. (**Agent configuration** is that materialized surface, not the agent itself.) |
| **Delegate** | *(noun)* An **agent** acting on an actor's behalf — the agent caught in-relation; no motive of its own, *capacity*, not a *party*, never accountable. Adapts agency theory's agent, minus the self-interest [agency]. *(verb)* To **delegate** is the act an actor performs: authoring the governance and criteria — the **delegation surface** and its **bar** — that transmit its responsibility to an agent. |
| **Motive** | The intrinsic want that defines an actor: intend (Framer), generate (Builder), structure (Architect), accumulate (Curator). |
| **Object** | *What an actor's output is.* A Builder's object is a **part**; the Architect's, the **relations between parts**; the Curator's, **knowledge that outlives the product**. Object — not scope — separates them. |
| **Face** | The *direction* an actor's expertise points — **forward** (produce) or **backward** (evaluate). Every actor has both. *Reserved: never used for anything else — switching motive is switching actor, not face.* |
| **Variant** | A specialization of an actor — same **motive**, differentiated by required *training* — that clears the **membership gates**. Anchors to *either face*: forward (**Explorer** of Builder, confirmed; **Scout** of Framer, forming; **Conductor** of Architect, forming) or backward (**QA**, the Builder variant that evaluates the product, confirmed). **Curator** has none (its acts share one cognitive profile). |
| **Membership gates** | What a candidate role must clear to be named: **distinct motive** (for actors), **capacity differentiation** (a substantial distinct body of knowledge, else codify), **persistence** (a recurring, aggregated need, else a sub-role). Bounds the taxonomy. |
| **Codifiability / actor–delegate line** | A role is worth naming only where human capacity is substantial *and* not-yet-codifiable. The codifiable slice crosses into a delegate as **agent configuration**; the boundary moves as codification advances. |
| **Agent configuration** | A delegation surface materialized for an AI delegate — skills, **agent/subagent definitions**, specs, conventions, orchestration config. The codified form of an actor's capacity; itself a toolchain-tier product built by a Builder. The static *definition*; the running **delegate** is the agent or subagent it configures. |
| **Angle** (domain) | The subject-matter expertise an actor works in — security, UX, performance, process, quality, AI/harness. An actor always acts *from an angle*; angle is orthogonal to actor. |
| **Gate** | A boundary (pull request, release) where several actors' **backward faces** converge on one change. An activity, not an actor — "Gatekeeper" names this activity, never a role. |
| **Verdict** | The gate's first axis: `accept` / `block`. Governed by the decision rule. |
| **Change request** | The gate's second axis: `none` / `yes`, with a **timing** (`within-PR` or `deferred`). Generated output, not a combination rule. `block` forces `within-PR`. |
| **Decision rule** | The governance policy that combines backward-face judgments into the verdict — from unanimous veto to a single decider. |
| **`producer ≠ judge`** | The constraint that the instance which produced an artifact is not its independent judge. An *echo* of separation of duties / four-eyes [sod] — not strict (one actor may serve both faces); the model's contribution is splitting judgment across time (thorough-but-general criteria ahead of time via the **bar**; focused human judgment in the loop). |
| **Dependency order vs work order** | *Dependency order*: A needs B (the Architect's object). *Work order*: the sequence we actually build in. A **placeholder** (stub, workaround, or rougher MVP) lets work-order diverge from dependency-order, at the cost of **rework**. |
| **Scheduling decision** | On the deferred branch: *defer new work* (placeholder now, rework later) vs *defer current work* (build prerequisite first). A **decision rule** — product priority vs rework-cost, informed by the Architect's estimate — not a single actor's call. |
| **Delegation surface** | The artifact an actor transmits intent through: **brief** (Framer), **contract + exemplars** (Builder), **shape** (Architect), **corpus** (Curator). Categories, not products — a team picks the medium. |
| **Bar** | The *criteria face* of a delegation surface — the same artifact stated as acceptance criteria rather than instruction. Not a separate surface. |
| **Tier** | The *dependency* split among the four actors *within one build*: **delivery** actors (Framer/Builder/Architect, act on the object) versus the **foundation** actor (Curator, acts on the capacity to deliver). Distinct from the product/process/toolchain sets. |
| **Recursion** | The framework is self-applying: the same four actors build not just the **product** but the **process** and **toolchain** that build it. These three are *overlapping sets* — they intersect and mutually influence — not stacked levels, with product the concrete outcome the others serve. |
| **Delegate fidelity** | Verifying a delegate did what its actor intended — judging the worker, not the work. Not an actor (no motive) and not a **face** (it points at the delegate, not the work): a delegate-directed check riding *every* **delegation surface**, the mirror of the **bar**, and the home of human–agent interface design. |

## References

| Key | Source |
| --- | --- |
| `[agency]` | Agency / principal–agent theory — Eisenhardt (1989); Jensen & Meckling (1976). [EBSCO Research Starters](https://www.ebsco.com/research-starters/economics/agency-theory-organizational-economics). *Adapted: the framework's delegate has no self-interest, removing the agency problem.* |
| `[argyris]` | Argyris & Schön, *Organizational Learning* (1978) — single-/double-loop learning. [infed.org](https://infed.org/dir/welcome/chris-argyris-theories-of-action-double-loop-learning-and-organizational-learning/). *Curator spans both; double-loop is its distinctive mode, not all curation.* |
| `[team-topologies]` | Skelton & Pais, *Team Topologies* — the platform team as self-service product. [IT Revolution](https://itrevolution.com/articles/four-team-types/). |
| `[conway]` | Conway, "How Do Committees Invent?" (1968); MIT/Harvard mirroring study. [Wikipedia: Conway's law](https://en.wikipedia.org/wiki/Conway%27s_law). |
| `[screaming]` | Robert C. Martin, "Screaming Architecture" (2011); *Clean Architecture* (2017) ch. 21. [cleancoder.com](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html). |
| `[mece]` | Barbara Minto, MECE / the Pyramid Principle (McKinsey, late 1960s). [Wikipedia: MECE principle](https://en.wikipedia.org/wiki/MECE_principle). |
| `[sod]` | Separation of duties / four-eyes principle; ISO 27001 Annex A 5.3. [Flagsmith](https://www.flagsmith.com/blog/what-is-the-four-eyes-principle). |
| `[walking-skeleton]` | Freeman & Pryce, *Growing Object-Oriented Software, Guided by Tests* (ch. 10). [O'Reilly](https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html). |
| `[test-double]` | Martin Fowler, *TestDouble* (stubs supply canned answers for absent dependencies). [martinfowler.com](https://martinfowler.com/bliki/TestDouble.html). *"Stub" is a test construct; we generalize it to a production placeholder (stub/workaround/MVP). The rework/ordering trade-off is the framework's own inference.* |
| `[dev-loop]` | Developer inner/outer loop. [Red Hat Developer](https://developers.redhat.com/articles/2024/09/05/platform-engineers-role-devsecops-inner-and-outer-loops); [Speedscale](https://docs.speedscale.com/concepts/inner-outer/). *Used only for the **inner-loop** analogy; the DevEx outer loop is CI/CD integration, not the Curator's distillation loop.* |
| `[ai-roles]` | Generative AI augmentation vs automation; new roles, ~80% upskilling through 2027. [Gartner (2024-10-03)](https://www.gartner.com/en/newsroom/press-releases/2024-10-03-gartner-says-generative-ai-will-require-80-percent-of-engineering-workforce-to-upskill-through-2027). *Gartner measures **outcome** (modest productivity); our premise is about **capability** (production capacity becomes abundant) — distinct claims.* |
| `[multi-agent]` | Orchestrator-worker pattern; parallel subagents. [Anthropic, *Building Effective Agents*](https://www.anthropic.com/research/building-effective-agents); [*Multi-agent research system*](https://www.anthropic.com/engineering/multi-agent-research-system). *Anthropic notes orchestration is weakest on tightly interdependent work — a real boundary on the Conductor's fan-out (needs a clean seam). The **orchestrator** is a delegate pattern, distinct from the **Conductor** actor.* |

*Research workspace (evidence log, confidence, caveats): `.research/actor-delegate-model/`.*

<!-- Citation link definitions: resolve the inline [key] shortcut references used throughout. -->

[agency]: https://www.ebsco.com/research-starters/economics/agency-theory-organizational-economics "Agency theory (Eisenhardt 1989; Jensen & Meckling 1976)"
[argyris]: https://infed.org/dir/welcome/chris-argyris-theories-of-action-double-loop-learning-and-organizational-learning/ "Argyris & Schön — single-/double-loop learning"
[team-topologies]: https://itrevolution.com/articles/four-team-types/ "Team Topologies — the four team types"
[conway]: https://en.wikipedia.org/wiki/Conway%27s_law "Conway's law"
[screaming]: https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html "Robert C. Martin — Screaming Architecture"
[mece]: https://en.wikipedia.org/wiki/MECE_principle "MECE principle (Minto)"
[sod]: https://www.flagsmith.com/blog/what-is-the-four-eyes-principle "Separation of duties / four-eyes principle"
[walking-skeleton]: https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html "Freeman & Pryce — the Walking Skeleton (GOOS, ch. 10)"
[test-double]: https://martinfowler.com/bliki/TestDouble.html "Martin Fowler — TestDouble"
[dev-loop]: https://developers.redhat.com/articles/2024/09/05/platform-engineers-role-devsecops-inner-and-outer-loops "Developer inner/outer loop"
[ai-roles]: https://www.gartner.com/en/newsroom/press-releases/2024-10-03-gartner-says-generative-ai-will-require-80-percent-of-engineering-workforce-to-upskill-through-2027 "Gartner — generative AI and engineering roles (2024-10-03)"
[multi-agent]: https://www.anthropic.com/research/building-effective-agents "Anthropic — Building Effective Agents"
