---
name: Fast-track tier for non-durable SDD work
overview: >
  Add a fast-track lane so non-durable work (internal tooling, POCs, private
  skills/agent definitions, ad hoc scripts) can skip the full spec-gate/ACES
  eval loop, while durable/public-surface work still goes through full SDD.
  Resolve who decides fast-track-vs-full and when — upstream of
  spec-producer, generalized beyond skills/agents to any artifact type.
cr: local-fast-track-durability-tier
cr-url:
status: active
todos:
  - id: ground-existing-mechanisms
    content: Read self-clear/leash/escape-hatch/artifact-type/squad-resolution design docs
    status: completed
  - id: grill-durability-signal
    content: Grill with user - what signal marks durable vs fast-track, who sets it, when
    status: completed
  - id: grill-generalization
    content: Grill how the signal generalizes across artifact types, not just skill/agent placement
    status: completed
  - id: draft-spec-delta
    content: Draft spec.md + .feature delta for the resolved node(s)
    status: completed
  - id: spec-gate
    content: Run the spec gate (judge + freeze)
    status: completed
  - id: deliver
    content: Build to keep against the frozen suite, impl gate
    status: completed
  - id: handoff
    content: Placement pass, land, file follow-up CRs (retire skill-authoring/create-skill; durability.toml resolver; promotion-path detector)
    status: in_progress
isProject: false
---

## NEXT

Commit and land (no placement move needed — both touched files already live at their
established homes). Then file follow-up CRs:

1. **Retire `plugins/skill-authoring/skills/create-skill`** in favor of `aces:define-skill`,
   now that `define-skill` can check the durability signal at intake and take the escape path
   (fast scaffold, no ACES) for non-durable requests instead of always handing off to the eval
   loop.
2. **Implement `.agents/sdd/durability.toml` resolution** — the code-artifact-type durability
   convention is specified (intake/README.md) but no reader/writer exists yet.
3. **Promotion-path detector** (still `<!-- open -->` in intake/README.md, Q5 was "not sure") —
   decide whether formation's `shot-before-aim` flow covers a private→public placement change,
   or whether placement changes must carry the backfill obligation themselves.

## Resolution reached

Durability resolves per-artifact, convention first, explicit request override always wins:
agent-config types (skill/subagent/command/agents-section) use a **fixed** location convention
(user-global/project-private = non-durable, project-public = durable); code artifact-types use
a **project-declared** convention (`.agents/sdd/durability.toml`, not yet implemented). No
resolvable signal fails closed to **durable**. A non-durable resolution **escapes SDD
outright** (no CR, no draft, no gate, no record) — a second, independent escape trigger
alongside "no suite-relevant behavior," distinct from the existing risk-based trivial-CR
self-clear.

## Context

Trigger: retiring `plugins/skill-authoring/skills/create-skill` in favor of `aces:define-skill`
surfaced that `define-skill`'s mandatory ACES eval handoff is too heavy a default for quick,
non-durable scaffolds. User's added concern: the same problem generalizes past skills/agents to
POC work and repo-internal tools/scripts, and deferring the decision to spec-producer is
too late — the work is already inside mission machinery by then. Resolved by extending the
existing escape hatch (`intake/README.md`) rather than inventing a new tier/squad axis.

## Gate record

Spec gate: approve (self-asserted, `auto-all` leash, `ledger/local-fast-track-durability-tier.317f46.jsonl` seq 2).
Impl gate: approve (self-asserted, same shard, seq 3) — no code artifact to build; the spec
delta is the deliverable itself (a project-behavior doc), consistent with prior rubric-Gherkin
by-hand precedent for agent-behavior nodes.
