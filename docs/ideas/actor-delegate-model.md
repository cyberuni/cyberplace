# The Actor–Delegate Model

A general framework for orchestrating human–agent teams that build a product — any product — seen fresh from the change AI introduces.

## Premise

For as long as products have been built by teams, a *position* described a *contribution*: "Engineer" meant the person who produced the code, "Designer" the one who produced the design, "QA" the one who produced the checks. Position equaled contribution because **production was scarce**, and a human had the focus and capacity to be good at producing exactly one kind of thing.

AI breaks that equation. When generation becomes abundant, producing the artifact stops being the scarce, defining act — and the limit that confined a person to a single contribution dissolves. A human in any position can now span several kinds of contribution, because delegates extend their reach past their own focus and capability.

So the unit of a team is no longer the *title*. It is the **role** — the kind of contribution a person makes right now — and the **delegate** they direct to make it on their behalf.

## Two kinds of thing: Actors and Delegates

**Actors are humans, defined by motive.** An actor wants something — to solve the right problem, to make the thing work, to keep the whole coherent. The motive is intrinsic; it is *theirs*. Accountability lives with the actor and never leaves: an actor is answerable for the outcome of their role whether they did the work themselves or delegated it.

**Delegates are agents that act on an actor's behalf.** A delegate has no intrinsic motive. It is *given* one — through artifacts the actor authors — and it executes that intent, filling the gap when the human is unavailable. Given good artifacts, a delegate often works faster and more thoroughly than the actor would alone. But it is never accountable; it is *capacity*, not a *party*.

This is the load-bearing distinction. An agent is not a teammate in the way a person is. It is a faithful extension of a person. The whole framework is about how humans-in-roles extend themselves through delegates, and how those extended roles compose into building a product.

## The four actors

Around abundant generation sit four roles, forming a control loop: someone decides what's worth making, someone makes candidates, someone keeps the whole coherent, someone makes the learning compound. And each of them also *judges* — turns its expertise backward to evaluate — so there is no separate "judge" role; judging is a face every actor has, described below.

| Actor | Motive | What they own |
|---|---|---|
| **Framer** | **Intend** — what's worth doing | The problem worth solving and what success means; the authority to decide *not* to build |
| **Builder** | **Generate** — make the thing | A working contribution from one angle of expertise |
| **Architect** | **Structure** — shape the whole so it stays legible and evolvable | The organizing principles, boundaries, and conventions that keep the product comprehensible and maintainable as it grows |
| **Curator** | **Accumulate** — make knowledge compound | The durable, reusable knowledge every other role draws on |

The motive is what makes each a real actor: each motive generates use cases the others don't. The Framer's signature output is a *kill decision*; the Builder's is a *working artifact*; the Curator's is *reuse*. Distinct motives, distinct use cases, distinct interfaces.

Architect's motive is deliberately constructive, not just defensive. An architect does more than forbid — they decide that structure should *shout the domain*, choose boundaries that make intent obvious, and shape the system so it survives change. Constraints are the half that protects those decisions; the organizing act is the half that creates them.

### Curator is the foundation tier — and still an actor

The three roles above operate on the *product*. Curator does not — and that raises a fair objection: if its output simply underlies everyone else's, is it a separate actor at all, or just the maintenance each actor owes its own surface over time?

It is a separate actor, because there is work no individual actor does for their own surface:

- **Cross-surface coherence** — making the brief, the shape, and the bar read as *one* body of knowledge, not several maintained in isolation.
- **Pruning** — deciding what is stale or contradictory and removing it. Each actor is biased to *keep* their own surface, so subtraction needs a separate owner.
- **Cross-instance distillation** — turning fifty concrete contracts into one reusable pattern. Producing one and generalizing across many are different acts.

Distinct motive, Curator-only use cases — it passes the actor test. The reason it *feels* like a layer is that its output is the substrate every other actor's delegate reads from. But that is precisely the position of a **platform or infrastructure team**: a role whose *product* is a layer. Nobody says platform engineering "isn't a role, it's a layer." Curator is the team's **infrastructure actor**.

So the model has two tiers:

- **Delivery actors** — Framer, Builder, Architect — operate on the *product*.
- **Foundation actor** — Curator — operates on the team's *capacity to deliver*: the corpus the other three's delegates draw from.

The Curator's own practices live in the corpus too, so it is self-describing — a fixed point, not an infinite regress. And a prediction falls out of the tiering: infrastructure is the first thing a team neglects, and its neglect degrades *everyone* — a decaying corpus forces every delegate, in every role, to start cold.

### Every actor has two faces: produce and evaluate

The same expertise points two ways. Applied **forward**, it produces — a Builder writes code, an Architect designs structure, a Framer frames a problem. Applied **backward**, the same expertise *judges* — the Builder reviews code, the Architect runs a design review, the Framer makes a kill-or-ship call. Nothing about the person or their knowledge changes between the two; only the *direction* does. This is "verbs, not titles" at its sharpest.

So there is **no standalone Gatekeeper actor.** "Gatekeeping" is what any actor's expertise does when turned backward; a thing with no domain of its own is a direction, not a role. The word survives as the name of an *activity*, not a party.

**The gate** is the boundary — a pull request, a release — where those backward faces converge on one change: correctness (Builder, backward), fit-to-structure (Architect, backward), and worth-shipping (Framer, backward) are judged together. The single ship-or-no-ship call that comes out is a **decision rule** over those faces — anywhere from an all-pass unanimous veto to a single senior decider (in practice, often a senior engineer weighting the Architect face, or a domain expert weighting the Framer face). The rule is *governance* — a policy choice — not an actor.

One constraint governs the faces: **producer ≠ judge**, applied per artifact across time. The instance that produced a change is not its independent judge. Switching from forward to backward on the *same* artifact is free in principle but *spends* your standing as its arm's-length reviewer — which is why, when a reviewer pushes a fix, someone else approves.

## Positions are not roles

The thesis, made concrete. A job title used to name a single contribution because production was scarce and focus was finite. With delegates supplying production, each position can now act across many roles — the title becomes a *default*, not a boundary. ("Gatekeeper" below names the evaluative activity — a backward face — not a separate actor.)

| Position | Default role (pre-AI) | Roles AI now opens |
|---|---|---|
| **PM** | Framer | Explorer (prototype directly with a delegate), Gatekeeper (own acceptance), Curator (encode product knowledge) |
| **Designer** | Builder + Explorer (of UX) | Framer (own the *why*), Gatekeeper (the taste and quality bar), Curator (the design system as a curated corpus) |
| **Engineer** | Builder | Architect, Gatekeeper (review), Conductor (orchestrate delegate fleets), Curator (write the conventions) |
| **QA** | Gatekeeper | Architect (of acceptance criteria), Curator (golden sets and the regression corpus), Explorer (adversarial probing) |

QA is the sharpest case: when delegates write the tests, QA stops being the one who *writes* checks and becomes the one who *owns the acceptance contract and curates the corpus it draws on* — gatekeeping plus Curator.

The table reads two ways. Across a row: how far one position can now stretch. Down the **Gatekeeper** column: why review is everyone's part-time role, not a department — every position turns its expertise backward at the gate.

## Two resolutions: actors for machines, modes for humans

The four actors are the right unit **for the machine** — for generating use cases, scenarios, and human-agent interfaces. At that resolution, finer distinctions are noise.

But humans need a finer resolution, because **roles that share a motive can still demand opposite preparation.** Each actor decomposes into *modes* — specializations that fold away for architecture but matter enormously for human capacity, training, and growth, since each mode is a different body of knowledge held at a different depth.

| Actor | Mode | Why the mode demands different preparation |
|---|---|---|
| **Builder** | *Producer* — generate to keep | Depth and craft in one domain; correctness; low tolerance for error |
| | *Explorer* — generate to discard | Breadth across many solutions; pattern recognition; low attachment; speed over polish |
| **Architect** | *Designer* — static structure | System-level depth; knows the whole artifact and its evolution |
| | *Conductor* — runtime orchestration | Delegation skill; context transfer; composing the work of many delegates and people into one whole |

Producer and Explorer are nearly opposite cognitive profiles — the same *motive* (generate), incompatible *training*. That is why a single framework needs both resolutions: collapse to actors to design the system, expand to modes to develop the people. Modes live on the forward face; the backward (evaluative) face is a separate axis again — an actor can be deep as a Producer yet still turn that depth backward to review.

## Delegation surfaces

Every actor extends itself through a **delegation surface** — the artifact by which it transmits intent across an availability gap: to a delegate now, to a teammate, or to its own future self.

| Actor | Delegation surface | What it carries |
|---|---|---|
| **Framer** | **The brief** | The problem, the *why*, the definition of success |
| **Builder** | **The contract + exemplars** | A behavioral spec for one angle, plus reference patterns to imitate |
| **Architect** | **The shape** | Organizing principles, boundaries, conventions, and the constraints that protect them |
| **Curator** | **The corpus** | Distilled, reusable knowledge every other delegate reads from |

Each surface has a backward face too — its **bar**, the acceptance criteria the same expertise applies when judging. The bar is not a separate surface; it is the *criteria face* of every surface: the brief's definition of success, the shape's fitness rules, the contract's behavioral checks. Stated as instruction it guides production; stated as criteria it gates acceptance — two faces of one artifact.

*Brief, contract, shape, corpus* (each with its criteria face). These are categories, not products. A given team instantiates them in whatever form fits — a one-page brief or a chartered intent doc; convention files or decision records; checklists or executable acceptance tests. The framework names the surface; the team chooses the medium.

The Curator's surface is special: its output *is* the substrate every other delegate reads from. A team that invests in its corpus makes every other delegate faster and more faithful at once. A team that neglects it forces every delegate to start cold.

## Curator and the loop

Agentic "loop engineering" has an inner and an outer loop, and the actors split across them.

- **Inner loop** (within a task): generate → test → correct. Builder produces, the **bar** — an actor's backward face made executable — fires as the signal, Builder corrects, Architect reshapes under green. Fast, delivery tier. Curator does not fire here.
- **Outer loop** (across tasks): harvest the durable lessons, distill, prune, and encode them into the corpus, so the next inner loop starts warmer. This is the Curator's loop.

This is single- versus double-loop learning (Argyris & Schön): the inner loop corrects *actions* under fixed assumptions; the outer loop revises the *knowledge and assumptions* themselves. Curator owns double-loop learning.

Firing Curator every iteration is **premature codification** — you encode transient noise and thrash the corpus before you know which lessons are durable. So the human Curator is episodic, triggered at boundaries: a pattern solved three times, the same correction repeated across loops, a contradiction or staleness that needs pruning, a milestone retro.

The interface this produces is the model's first concrete one: the **Curator's delegate watches continuously** — flagging candidates, drafting conventions, detecting corpus contradictions, all cheap — while the **human Curator holds the accept/prune decision**, because that call is accountable and high-blast-radius. *Detection and drafting by the delegate; keep-or-cut by the human.* It is a template for every other actor's interface.

## Delegate fidelity: the orthogonal axis

Delegating is only half the relationship. The other half is **verifying the delegate is faithful** — that it does what the actor would have done, and intended. This concern is orthogonal to the four actors: every actor delegates *and* must check its delegate.

Fidelity is distinct from evaluation. A backward face judges *the product*; fidelity judges *the delegate*. They are different objects at different levels — judging the work versus judging the worker. A great deal of human-agent *interface* design lives on this axis: how an actor inspects, calibrates, and trusts the capacity it is wielding.

> Building a robust fidelity system for one class of delegate — agent configurations — is itself a product, with its own Framer, Builder, Architect, and Curator. The framework describes how such a product gets built; it does not contain it.

## Scenarios: how the actors actually show up

Actor involvement has a topology. Who plays which actor, and when, runs along an axis from **fully decoupled** — roles spread across people, gated by asynchronous boundaries — to **fully compressed** — one human spans every role while delegates supply the production. Real work sits between.

### Decoupled: a bug fix in an open-source project

- **Framer** — the contributor decides this bug is worth their time, usually self-framed from their own pain; the issue thread is the brief. A maintainer framed it earlier by accepting and labeling it.
- **Explorer** (Builder, divergent) — the contributor reproduces it, reads unfamiliar code, tries a couple of approaches, discards the dead ends.
- **Builder** (producer) — writes the fix and a regression test; the test is the contract, co-delivered.
- *— boundary: the pull request —*
- **The gate** — the maintainer enters *only now*, turning expertise backward against the change: correctness (Builder face) against the bar, fit-to-structure (Architect face), and worth-merging (Framer face). Note the asymmetry — the contributor produced for days with no evaluation present; the gate is async and late.
- **Curator** — if the bug is one of a recurring class, the maintainer encodes a lint rule, a test pattern, or a CONTRIBUTING note so the next contributor avoids it. Frequently deferred or skipped — infrastructure neglect in the wild.

Reading: one human (contributor) plays Framer + Explorer + Builder forward; another (maintainer) judges at the gate — the Builder, Architect, and Framer faces turned backward — and curates. Roles cluster by *position in the contribution flow*, not by job. And the same maintainer who judges here is a Builder on their own commits — the verb, not the person.

### Compressed: a solo developer and their delegates ship a feature

- **Framer** — the developer fixes the feature's *why* and what success looks like, sometimes as a written brief, sometimes only in their head.
- **Explorer** (Builder mode) — a delegate spikes three approaches in parallel; the developer, applying expertise *backward*, keeps one and kills two. (That pick is the Builder's own backward face — evaluation inside the Builder phase.)
- **Builder** (producer) — a delegate implements the chosen approach; the inner loop runs against tests.
- *— boundary: the developer reads the diff —*
- **The gate** — the same human, now turning their expertise backward on the delegate's output. Producer ≠ judge still holds, because the *delegate* produced and the *human* judges.
- **Architect** — the developer notices it should follow an existing convention and directs a refactor under green.
- **Curator** — at the end, the developer encodes the new convention so the next feature starts warmer — or, more often, a Curator-delegate flags "you've done this three times" and the human approves the entry.

Reading: one human spans all four actors, forward and backward, in an afternoon — impossible before AI, when production consumed all their focus. Delegates supply the production capacity, freeing the human to move through the roles while holding motive and accountability throughout. This is the thesis in miniature: abundance does not replace the human; it lets one human *be* the team.

## How it composes

The chain the framework is meant to drive:

```
Actors (humans + motives)
   └─ generate Use cases (what each motive needs to accomplish)
        └─ generate Scenarios (how it plays out, who delegates what)
             └─ shape Human–agent interfaces (the surfaces + fidelity checks)
```

Get the actors and motives right and the rest is downstream. Get them wrong — by treating agents as actors, or by organizing on a timeline instead of by motive — and the use cases overlap, the scenarios blur, and the interfaces inherit the confusion.

## Resolved

- **Is Curator a peer actor or a layer?** Both — the question was a false choice. *Actor* asks whether a distinct motive generates distinct use cases (it does); *layer* asks where the output sits in the dependency graph (foundational). Curator is the team's **infrastructure actor**: a full actor whose product is a layer, like a platform team. The model is two-tiered — three delivery actors over one foundation actor — not actors plus a non-actor substrate.

- **Is Gatekeeper a standalone actor?** No. Judging is expertise turned backward, so *every* actor has an evaluative face — there is no role with judging as its own domain. **The gate** is the boundary where those backward faces converge on a change; the single ship-or-no-ship call is a **decision rule** over them (unanimous veto → single senior decider), i.e. governance, not a party. "Gatekeeper" survives as the name of the *activity*. `producer ≠ judge` holds per artifact across time. Net: **four actors** (Framer, Builder, Architect + Curator foundation), each with a forward and a backward face.

## Open questions

1. **Is Architect a distinct actor or Builder at system scope?** Architect survived the motive test only at cross-feature scale; at feature scale a Builder co-delivering a spec is already doing architecture. If scope alone separates them, the delivery set may be two, with Architect as Builder-zoomed-out.

2. **How many modes, and for which actors?** Producer/Explorer and Designer/Conductor are confirmed. Framer and Curator presumably decompose too — but enumerating modes risks an open-ended taxonomy. What stops the mode list from sprawling? (Note: forward/backward *faces* are a separate axis from modes — both multiply the surface area.)

3. **Does the delegation surface serve human-to-human as well as human-to-agent?** A brief hands intent to a teammate as readily as to an agent. If the surface is medium-agnostic, the framework describes *all* delegation, not just delegation to AI — which is either a strength (generality) or a sign the AI-specific part is thinner than claimed.

4. **How broad is the abundance premise?** AI makes *common* generation cheap; *novel or hard* generation stays expensive, and there the old title-equals-contribution model partly survives. The framework's reach is exactly as wide as abundance actually is.

5. **What is the formal shape of delegate fidelity?** It is named here as an orthogonal axis but not modeled. Is it a fifth concern, a property of every delegation surface, or the true home of the human-agent interface?
