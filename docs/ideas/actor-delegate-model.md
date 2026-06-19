# The Actor–Delegate Model

A general framework for orchestrating human–agent teams that build a product — any product — seen fresh from the change AI introduces.

## Premise

For as long as products have been built by teams, a *position* described a *contribution*: "Engineer" meant the person who produced the code, "Designer" the one who produced the design, "QA" the one who produced the checks. Position equaled contribution because **production was scarce**, and a human had the focus and capacity to be good at producing exactly one kind of thing.

AI breaks that equation. When generation becomes abundant, producing the artifact stops being the scarce, defining act — and the limit that confined a person to a single contribution dissolves. A human in any position can now span several kinds of contribution, because delegates extend their reach past their own focus and capability.

So the unit of a team is no longer the *title*. It is the **role** — the kind of contribution a person makes right now — and the **delegate** they direct to make it on their behalf.

## Two kinds of thing: Actors and Delegates

**Actors are humans, defined by motive.** An actor wants something — to solve the right problem, to make the thing work, to let only good work through. The motive is intrinsic; it is *theirs*. Accountability lives with the actor and never leaves: an actor is answerable for the outcome of their role whether they did the work themselves or delegated it.

**Delegates are agents that act on an actor's behalf.** A delegate has no intrinsic motive. It is *given* one — through artifacts the actor authors — and it executes that intent, filling the gap when the human is unavailable. Given good artifacts, a delegate often works faster and more thoroughly than the actor would alone. But it is never accountable; it is *capacity*, not a *party*.

This is the load-bearing distinction. An agent is not a teammate in the way a person is. It is a faithful extension of a person. The whole framework is about how humans-in-roles extend themselves through delegates, and how those extended roles compose into building a product.

## The five actors

Around abundant generation sit five roles, forming a control loop: someone decides what's worth making, someone makes candidates, someone selects what passes, someone keeps the whole coherent, someone makes the learning compound.

| Actor | Motive | What they own |
|---|---|---|
| **Framer** | **Intend** — what's worth doing | The problem worth solving and what success means; the authority to decide *not* to build |
| **Builder** | **Generate** — make the thing | A working contribution from one angle of expertise |
| **Gatekeeper** | **Select** — let only good through | The judgment of what passes and what doesn't |
| **Architect** | **Structure** — shape the whole so it stays legible and evolvable | The organizing principles, boundaries, and conventions that keep the product comprehensible and maintainable as it grows |
| **Curator** | **Accumulate** — make knowledge compound | The durable, reusable knowledge every other role draws on |

The motive is what makes each a real actor: each motive generates use cases the others don't. The Framer's signature output is a *kill decision* — nothing else produces it. The Gatekeeper's is a *pass/fail*. The Curator's is *reuse*. Distinct motives, distinct use cases, distinct interfaces.

Architect's motive is deliberately constructive, not just defensive. An architect does more than forbid — they decide that structure should *shout the domain*, choose boundaries that make intent obvious, and shape the system so it survives change. Constraints are the half that protects those decisions; the organizing act is the half that creates them.

### Curator is the foundation tier — and still an actor

The four roles above operate on the *product*. Curator does not — and that raises a fair objection: if its output simply underlies everyone else's, is it a separate actor at all, or just the maintenance each actor owes its own surface over time?

It is a separate actor, because there is work no individual actor does for their own surface:

- **Cross-surface coherence** — making the brief, shape, and bar read as *one* body of knowledge, not five maintained in isolation.
- **Pruning** — deciding what is stale or contradictory and removing it. Each actor is biased to *keep* their own surface, so subtraction needs a separate owner.
- **Cross-instance distillation** — turning fifty concrete contracts into one reusable pattern. Producing one and generalizing across many are different acts.

Distinct motive, Curator-only use cases — it passes the actor test. The reason it *feels* like a layer is that its output is the substrate every other actor's delegate reads from. But that is precisely the position of a **platform or infrastructure team**: a role whose *product* is a layer. Nobody says platform engineering "isn't a role, it's a layer." Curator is the team's **infrastructure actor**.

So the model has two tiers:

- **Delivery actors** — Framer, Builder, Gatekeeper, Architect — operate on the *product*.
- **Foundation actor** — Curator — operates on the team's *capacity to deliver*: the corpus the other four's delegates draw from.

The Curator's own practices live in the corpus too, so it is self-describing — a fixed point, not an infinite regress. And a prediction falls out of the tiering: infrastructure is the first thing a team neglects, and its neglect degrades *everyone* — a decaying corpus forces every delegate, in every role, to start cold.

### Builder and Gatekeeper: one expertise, two applications

The bar has two faces — instruction and criteria. So does the actor who holds it. The same engineer is a **Builder** when contributing a change and a **Gatekeeper** when reviewing someone else's; the domain expertise is identical, only its *direction* changes — applied forward to produce, applied back to judge. This is "verbs, not titles" at its sharpest: nothing about the person changes between authoring and reviewing except the verb.

Yet Gatekeeper does **not** fold into Builder the way Explorer does. Explorer is the same *motive* (generate) at a different setting; Gatekeeper is a *different motive* (select) drawing on the same expertise. And the separation must hold even when one person could do both, because the integrity of the loop depends on **producer ≠ judge** — the instance that made a thing is not the sole authority that it is good. So: shared expertise, distinct actors, deliberately kept apart.

## Positions are not roles

The thesis, made concrete. A job title used to name a single contribution because production was scarce and focus was finite. With delegates supplying production, each position can now act across many roles — the title becomes a *default*, not a boundary.

| Position | Default role (pre-AI) | Roles AI now opens |
|---|---|---|
| **PM** | Framer | Explorer (prototype directly with a delegate), Gatekeeper (own acceptance), Curator (encode product knowledge) |
| **Designer** | Builder + Explorer (of UX) | Framer (own the *why*), Gatekeeper (the taste and quality bar), Curator (the design system as a curated corpus) |
| **Engineer** | Builder | Architect, Gatekeeper (review), Conductor (orchestrate delegate fleets), Curator (write the conventions) |
| **QA** | Gatekeeper | Architect (of acceptance criteria), Curator (golden sets and the regression corpus), Explorer (adversarial probing) |

QA is the sharpest case: when delegates write the tests, QA stops being the one who *writes* checks and becomes the one who *owns the acceptance contract and curates the corpus it draws on* — Gatekeeper plus Curator.

The table reads two ways. Across a row: how far one position can now stretch. Down the **Gatekeeper** column: why review is everyone's part-time role, not a department — every position turns its expertise backward at the gate.

## Two resolutions: actors for machines, modes for humans

The five actors are the right unit **for the machine** — for generating use cases, scenarios, and human-agent interfaces. At that resolution, finer distinctions are noise.

But humans need a finer resolution, because **roles that share a motive can still demand opposite preparation.** Each actor decomposes into *modes* — specializations that fold away for architecture but matter enormously for human capacity, training, and growth, since each mode is a different body of knowledge held at a different depth.

| Actor | Mode | Why the mode demands different preparation |
|---|---|---|
| **Builder** | *Producer* — generate to keep | Depth and craft in one domain; correctness; low tolerance for error |
| | *Explorer* — generate to discard | Breadth across many solutions; pattern recognition; low attachment; speed over polish |
| **Architect** | *Designer* — static structure | System-level depth; knows the whole artifact and its evolution |
| | *Conductor* — runtime orchestration | Delegation skill; context transfer; composing the work of many delegates and people into one whole |

Producer and Explorer are nearly opposite cognitive profiles — the same *motive* (generate), incompatible *training*. That is why a single framework needs both resolutions: collapse to actors to design the system, expand to modes to develop the people.

## Delegation surfaces

Every actor extends itself through a **delegation surface** — the artifact by which it transmits intent across an availability gap: to a delegate now, to a teammate, or to its own future self.

| Actor | Delegation surface | What it carries |
|---|---|---|
| **Framer** | **The brief** | The problem, the *why*, the definition of success |
| **Builder** | **The contract + exemplars** | A behavioral spec for one angle, plus reference patterns to imitate |
| **Architect** | **The shape** | Organizing principles, boundaries, conventions, and the constraints that protect them |
| **Gatekeeper** | **The bar** | Acceptance criteria and standards — expressible as *instruction* ("do this") or as *criteria* ("must satisfy this"), two faces of one artifact |
| **Curator** | **The corpus** | Distilled, reusable knowledge every other delegate reads from |

*Brief, contract, shape, bar, corpus.* These are categories, not products. A given team instantiates them in whatever form fits — a one-page brief or a chartered intent doc; convention files or decision records; checklists or executable acceptance tests. The framework names the surface; the team chooses the medium.

The Curator's surface is special: its output *is* the substrate every other delegate reads from. A team that invests in its corpus makes every other delegate faster and more faithful at once. A team that neglects it forces every delegate to start cold.

## Curator and the loop

Agentic "loop engineering" has an inner and an outer loop, and the actors split across them.

- **Inner loop** (within a task): generate → test → correct. Builder produces, the Gatekeeper's bar fires as an executable signal, Builder corrects, Architect reshapes under green. Fast, delivery tier. Curator does not fire here.
- **Outer loop** (across tasks): harvest the durable lessons, distill, prune, and encode them into the corpus, so the next inner loop starts warmer. This is the Curator's loop.

This is single- versus double-loop learning (Argyris & Schön): the inner loop corrects *actions* under fixed assumptions; the outer loop revises the *knowledge and assumptions* themselves. Curator owns double-loop learning.

Firing Curator every iteration is **premature codification** — you encode transient noise and thrash the corpus before you know which lessons are durable. So the human Curator is episodic, triggered at boundaries: a pattern solved three times, the same correction repeated across loops, a contradiction or staleness that needs pruning, a milestone retro.

The interface this produces is the model's first concrete one: the **Curator's delegate watches continuously** — flagging candidates, drafting conventions, detecting corpus contradictions, all cheap — while the **human Curator holds the accept/prune decision**, because that call is accountable and high-blast-radius. *Detection and drafting by the delegate; keep-or-cut by the human.* It is a template for every other actor's interface.

## Delegate fidelity: the orthogonal axis

Delegating is only half the relationship. The other half is **verifying the delegate is faithful** — that it does what the actor would have done, and intended. This concern is orthogonal to the five actors: every actor delegates *and* must check its delegate.

Fidelity is not the Gatekeeper's job specifically. The Gatekeeper judges *the product*; fidelity judges *the delegate*. They are different objects at different levels — judging the work versus judging the worker. A great deal of human-agent *interface* design lives on this axis: how an actor inspects, calibrates, and trusts the capacity it is wielding.

> Building a robust fidelity system for one class of delegate — agent configurations — is itself a product, with its own Framer, Builder, Gatekeeper, Architect, and Curator. The framework describes how such a product gets built; it does not contain it.

## Scenarios: how the actors actually show up

Actor involvement has a topology. Who plays which actor, and when, runs along an axis from **fully decoupled** — roles spread across people, gated by asynchronous boundaries — to **fully compressed** — one human spans every role while delegates supply the production. Real work sits between.

### Decoupled: a bug fix in an open-source project

- **Framer** — the contributor decides this bug is worth their time, usually self-framed from their own pain; the issue thread is the brief. A maintainer framed it earlier by accepting and labeling it.
- **Explorer** (Builder, divergent) — the contributor reproduces it, reads unfamiliar code, tries a couple of approaches, discards the dead ends.
- **Builder** (producer) — writes the fix and a regression test; the test is the contract, co-delivered.
- *— boundary: the pull request —*
- **Gatekeeper** — the maintainer enters *only now*, judging the change against the bar: contributing guidelines (instruction face) plus review judgment (criteria face). Note the asymmetry — the Builder worked for days with no Gatekeeper present; the gate is async and late.
- **Architect** — latent until the change threatens structure. If the fix cuts across a boundary, the maintainer raises "this doesn't belong here," and architecture surfaces at review.
- **Curator** — if the bug is one of a recurring class, the maintainer encodes a lint rule, a test pattern, or a CONTRIBUTING note so the next contributor avoids it. Frequently deferred or skipped — infrastructure neglect in the wild.

Reading: one human (contributor) plays Framer + Explorer + Builder; another (maintainer) plays Gatekeeper + Architect + Curator. Actors cluster by *position in the contribution flow*, not by job. And the same maintainer who is a Gatekeeper here is a Builder on their own commits — the verb, not the person.

### Compressed: a solo developer and their delegates ship a feature

- **Framer** — the developer fixes the feature's *why* and what success looks like, sometimes as a written brief, sometimes only in their head.
- **Explorer** (Builder mode) — a delegate spikes three approaches in parallel; the developer, applying expertise *backward*, keeps one and kills two. (That pick is a micro-Gatekeeper act — evaluation appearing inside the Builder phase.)
- **Builder** (producer) — a delegate implements the chosen approach; the inner loop runs against tests.
- *— boundary: the developer reads the diff —*
- **Gatekeeper** — the same human, now judging the delegate's output against the bar. Producer ≠ judge still holds, because the *delegate* produced and the *human* judges.
- **Architect** — the developer notices it should follow an existing convention and directs a refactor under green.
- **Curator** — at the end, the developer encodes the new convention so the next feature starts warmer — or, more often, a Curator-delegate flags "you've done this three times" and the human approves the entry.

Reading: one human spans all five actors in an afternoon — impossible before AI, when production consumed all their focus. Delegates supply the production capacity, freeing the human to move through the roles while holding motive and accountability throughout. This is the thesis in miniature: abundance does not replace the human; it lets one human *be* the team.

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

- **Is Curator a peer actor or a layer?** Both — the question was a false choice. *Actor* asks whether a distinct motive generates distinct use cases (it does); *layer* asks where the output sits in the dependency graph (foundational). Curator is the team's **infrastructure actor**: a full actor whose product is a layer, like a platform team. The model is two-tiered — four delivery actors over one foundation actor — not four actors plus a non-actor substrate.

## Open questions

1. **Is Architect a distinct actor or Builder at system scope?** Architect survived the motive test only at cross-feature scale; at feature scale a Builder co-delivering a spec is already doing architecture. If scope alone separates them, the delivery set may be three, with Architect as Builder-zoomed-out.

2. **Is Gatekeeper a standalone actor or the aggregated evaluative face of the others?** If judging is just expertise turned backward, every actor has an evaluative face — the Framer's kill decision, the Architect's design review, the Curator's accept/prune. "Gatekeeper" may then be the *gate decision* that aggregates those evaluative faces at a control boundary, not a fifth standalone role. What keeps it distinct is the boundary and the producer ≠ judge rule — but whether that is enough to make it its own actor is unresolved.

3. **How many modes, and for which actors?** Producer/Explorer and Designer/Conductor are confirmed. Framer, Gatekeeper, and Curator presumably decompose too — but enumerating modes risks an open-ended taxonomy. What stops the mode list from sprawling?

4. **Does the delegation surface serve human-to-human as well as human-to-agent?** A brief hands intent to a teammate as readily as to an agent. If the surface is medium-agnostic, the framework describes *all* delegation, not just delegation to AI — which is either a strength (generality) or a sign the AI-specific part is thinner than claimed.

5. **How broad is the abundance premise?** AI makes *common* generation cheap; *novel or hard* generation stays expensive, and there the old title-equals-contribution model partly survives. The framework's reach is exactly as wide as abundance actually is.

6. **What is the formal shape of delegate fidelity?** It is named here as an orthogonal axis but not modeled. Is it a sixth concern, a property of every delegation surface, or the true home of the human-agent interface?
