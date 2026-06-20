---
title: Glossary
description: The Motive Model's load-bearing terms, in dependency order — earlier terms ground later ones. Each word means exactly one thing.
---

Every load-bearing term, in dependency order — earlier terms ground later ones. Each word means exactly one thing; collisions are called out where they were tempting.

| Term | Definition |
| --- | --- |
| **Role** | The genus — *a kind of contribution a person makes*, defined by **motive**. Spans **actors** (the four base roles), their **variants**, and **sub-roles**. Every actor is a role; not every role is an actor. The unit of a team that replaced the *title*. |
| **Actor** | The narrow case of a **role**: one of the four motive-distinct base roles — Framer, Builder, Architect, Curator — and the human party in the **actor/delegate** pair. Holds accountability, which never delegates. *Collision: unlike a UML use-case "actor" (which may be a non-human system), our actor is **always human** — agents are delegates.* |
| **Agent** | The *substrate* of a delegate: an AI system apart from any task. An agent **becomes a delegate** when an actor gives it intent through a **delegation surface** — the mirror of how a human becomes an **actor** by taking on a motive. |
| **Delegate** | *(noun)* An **agent** acting on an actor's behalf — no motive of its own; *capacity*, not a *party*; never accountable. *(verb)* To **delegate** is the act an actor performs: authoring the governance and criteria — the **delegation surface** and its **bar** — that transmit responsibility to an agent. |
| **Motive** | The intrinsic want that defines an actor: intend (Framer), generate (Builder), structure (Architect), accumulate (Curator). |
| **Object** | *What an actor's output is.* A Builder's object is a **part**; the Architect's, the **relations between parts**; the Curator's, **knowledge that outlives the product**. Object — not scope — separates them. |
| **Face** | The *direction* an actor's expertise points — **forward** (produce) or **backward** (evaluate). Every actor has both. Switching motive is switching actor, not face. |
| **Variant** | A specialization of an actor — same **motive**, differentiated by required *training* — that clears the **membership gates**. Anchors to *either face*: forward (**Explorer** of Builder, confirmed; **Scout** of Framer, forming; **Conductor** of Architect, forming) or backward (**QA**, the Builder variant that evaluates the product, confirmed). **Curator** has none. |
| **Membership gates** | What a candidate role must clear to be named: **distinct motive** (for actors), **capacity differentiation** (a substantial distinct body of knowledge, else codify), **persistence** (a recurring, aggregated need, else a sub-role). Bounds the taxonomy. |
| **Codifiability / actor–delegate line** | A role is worth naming only where human capacity is substantial *and* not-yet-codifiable. The codifiable slice crosses into a delegate as **agent configuration**; the boundary moves as codification advances. |
| **Agent configuration** | A delegation surface materialized for an AI delegate — skills, agent/subagent definitions, specs, conventions, orchestration config. The static *definition*; the running **delegate** is the agent or subagent it configures. Itself a toolchain-tier product. |
| **Angle** (domain) | The subject-matter expertise an actor works in — security, UX, performance, process, quality, AI/harness. An actor always acts *from an angle*; angle is orthogonal to actor. |
| **Gate** | A boundary (pull request, release) where several actors' **backward faces** converge on one change. An activity, not an actor — "Gatekeeper" names this activity, never a role. |
| **Verdict** | The gate's first axis: `accept` / `block`. Governed by the decision rule. |
| **Change request** | The gate's second axis: `none` / `yes`, with a **timing** (`within-PR` or `deferred`). Generated output, not a combination rule. `block` forces `within-PR`. |
| **Decision rule** | The governance policy that combines backward-face judgments into the verdict — from unanimous veto to a single decider. |
| **`producer ≠ judge`** | The constraint that the instance which produced an artifact is not its independent judge. An *echo* of separation of duties / four-eyes — not strict (one actor may serve both faces); the model's contribution is splitting judgment across time. |
| **Dependency order vs work order** | *Dependency order*: A needs B (the Architect's object). *Work order*: the sequence you actually build in. A **placeholder** (stub, workaround, or rougher MVP) lets work-order diverge from dependency-order, at the cost of **rework**. |
| **Scheduling decision** | On the deferred branch: *defer new work* (placeholder now, rework later) vs *defer current work* (build prerequisite first). A **decision rule** — product priority vs rework-cost — not a single actor's call. |
| **Delegation surface** | The artifact an actor transmits intent through: **brief** (Framer), **contract + exemplars** (Builder), **shape** (Architect), **corpus** (Curator). Categories, not products — a team picks the medium. |
| **Bar** | The *criteria face* of a delegation surface — the same artifact stated as acceptance criteria rather than instruction. Not a separate surface. |
| **Tier** | The *dependency* split among the four actors *within one build*: **delivery** actors (Framer/Builder/Architect, act on the object) versus the **foundation** actor (Curator, acts on the capacity to deliver). Distinct from the product/process/toolchain sets. |
| **Recursion** | The model is self-applying: the same four actors build not just the **product** but the **process** and **toolchain** that build it. Three *overlapping sets*, not stacked levels. |
| **Delegate fidelity** | Verifying a delegate did what its actor intended — judging the worker, not the work. Not an actor (no motive) and not a **face** (it points at the delegate, not the work): a delegate-directed check riding *every* delegation surface, the mirror of the **bar**, and the home of human–agent interface design. |

## Sources

The model grounds its claims in established theory where it can, and marks where it departs.

| Idea | Source |
| --- | --- |
| Principal–agent delegation (the actor/delegate shape) | Agency theory — Eisenhardt (1989); Jensen & Meckling (1976). *The model's delegate has no self-interest, removing the agency problem.* |
| Single-/double-loop learning (the Curator's two modes) | Argyris & Schön, *Organizational Learning* (1978). |
| The platform team as a self-service product (the Curator tier) | Skelton & Pais, *Team Topologies*. |
| Structure mirrors communication (the Architect's backdrop) | Conway, "How Do Committees Invent?" (1968). |
| Structure should scream the domain | Robert C. Martin, "Screaming Architecture" (2011); *Clean Architecture* (2017). |
| Mutually exclusive, collectively exhaustive | Barbara Minto, MECE / the Pyramid Principle. |
| Separation of duties / four-eyes (`producer ≠ judge`) | ISO 27001 Annex A 5.3. |
| Walking skeleton vs placeholder | Freeman & Pryce, *Growing Object-Oriented Software, Guided by Tests*. |
| Stubs / test doubles (generalized to a production placeholder) | Martin Fowler, *TestDouble*. |
| Developer inner/outer loop (the inner-loop analogy) | Red Hat Developer; Speedscale. |
| New AI roles, augmentation vs automation | Gartner (2024). |
| Orchestrator-worker pattern (the Conductor's fan-out) | Anthropic, *Building Effective Agents* and *Multi-agent research system*. *The orchestrator is a delegate pattern, distinct from the Conductor actor.* |

---

*Back to [The Motive Model overview](/motive-model/overview/).*
