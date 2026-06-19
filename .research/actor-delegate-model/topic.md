# The Actor–Delegate Model (June 2026)

## Question

Is the Actor–Delegate Model — a general framework for orchestrating human–agent teams that build any product under abundant AI generation — grounded in established theory, and what are its load-bearing claims and the verdicts reached while developing it?

## Scope

**In scope:** sourcing the framework's non-obvious claims against authoritative theory; recording the design verdicts reached in session; identifying which claims are original adaptations vs grounded borrowings.

**Out of scope:** building the two downstream artifacts (machine/agent-configuration spec; human essay). Those are generated *from* the dossier once the framework stabilizes. The dossier (`docs/ideas/actor-delegate-model.md`) is the single source of truth.

## Source angles

- Organizational economics (principal–agent / agency theory)
- Organizational learning (single-/double-loop)
- Team / org design (Team Topologies, Conway's Law)
- Software architecture (screaming/clean architecture)
- Structured reasoning (MECE / Minto)
- Controls (separation of duties / four-eyes)
- TDD practice (walking skeleton, test doubles)
- Developer experience (inner/outer loop)
- AI's effect on software roles (augmentation vs automation)
- Multi-agent orchestration (orchestrator-worker)

## Findings

### The decomposition borrows broadly and adapts at one joint

Most of the framework's spine is grounded: the Actor/Delegate split mirrors **agency theory**; the Curator's outer loop is **double-loop learning**; Curator-as-infrastructure-actor is the **platform team** of Team Topologies; the Architect's object is **Conway's** relations-between-parts with a **screaming-architecture** constructive motive; `producer ≠ judge` is **separation of duties**; the actor set is held to **MECE**. See `evidence.md` for rows and quotes.

### Two claims are original, and are flagged as such

1. **Delegate has no intrinsic motive.** Agency theory's agent is self-interested (the agency problem). The framework's delegate is "capacity, not a party," which *removes* the agency problem by design. This is the model's core adaptation, not a borrowed claim.
2. **Stub → rework / dependency-ordering trade-off.** Stubs-stand-in-for-absent-dependencies is sourced; the *scheduling cost trade-off* built on it is the framework's own inference.

### Session verdicts folded into the dossier

- **Architect is distinct by OBJECT, not scope.** "Builder at system scope" is a category error: a Builder zoomed out still makes a *part*; the Architect makes *relations between parts*. Resolves former open question #1.
- **The gate is a two-axis decision:** verdict (accept/block) × change-request (none/yes, timing within-PR/deferred). `block+none` = Framer's kill at the gate; `accept+deferred` = the feedback edge. Timing is free only under `accept` (block forces within-PR).
- **The deferred branch is a scheduling decision over a dependency tree**, owned by the Framer (Architect detects/estimates). Two flavors: defer new work (stub now, rework later) vs defer current work (build prerequisite first). Determined by rework-cost vs switch-cost.
- **The Conductor's signature move** is fanning the dependency out to a parallel delegate, so "build prerequisite first" stops meaning "stop everything" — a direct instance of the abundance premise, grounded in the orchestrator-worker pattern.

## Contradictions

- Anthropic notes multi-agent orchestration is weaker for "tightly interdependent tasks such as coding" — tension with leaning on it for the Conductor; kept as a caveat near that claim.

## Open questions

Carried in the dossier's own "Open questions" section (variant taxonomy bounds; human-to-human delegation surfaces; breadth of the abundance premise; formal shape of delegate fidelity).

## Sources consulted

See `evidence.md` for the full list with quotes, types, and confidence.
