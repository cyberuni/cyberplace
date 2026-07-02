---
name: Fast-track tier for non-durable SDD work
overview: >
  Add a fast-track lane so non-durable work (internal tooling, POCs, private
  skills/agent definitions, ad hoc scripts) can skip the full spec-gate/ACED
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
    status: completed
isProject: false
---

## NEXT

Mission complete, landed in `4183717`. Follow-ups spun out to their own plans:

1. **Retire `plugins/skill-authoring/skills/create-skill`** — in progress, see
   `.agents/plans/local-retire-create-skill.plan.md`.
2. **Implement `.agents/sdd/durability.toml` resolution** — done, `local-resolve-durability`
   (`9e6d07f`).
3. **Promotion-path detector** — still open, still `<!-- open -->` in `intake/README.md`; no plan
   yet, pick it up as a fresh CR when ready.

Retirement-ready once doctrine distills this milestone.

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

Trigger: retiring `plugins/skill-authoring/skills/create-skill` in favor of `aced:define-skill`
surfaced that `define-skill`'s mandatory ACED eval handoff is too heavy a default for quick,
non-durable scaffolds. User's added concern: the same problem generalizes past skills/agents to
POC work and repo-internal tools/scripts, and deferring the decision to spec-producer is
too late — the work is already inside mission machinery by then. Resolved by extending the
existing escape hatch (`intake/README.md`) rather than inventing a new tier/squad axis.

## Gate record

Spec gate: approve (self-asserted, `auto-all` leash, `ledger/local-fast-track-durability-tier.317f46.jsonl` seq 2).
Impl gate: approve (self-asserted, same shard, seq 3) — no code artifact to build; the spec
delta is the deliverable itself (a project-behavior doc), consistent with prior rubric-Gherkin
by-hand precedent for agent-behavior nodes.
