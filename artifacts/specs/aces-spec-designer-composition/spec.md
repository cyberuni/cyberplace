# aces-spec-designer Governance-Aware Flow

**Status:** Draft

---

## What

`aces-spec-designer` — the internal subagent that generates eval suites and skill specs — is updated to declare a governance manifest. When invoked, it automatically loads `sdd:sdd-principles`, `sdd:spec-template`, and `aces:skill-spec-schema` before beginning work.

For skill spec creation specifically, the designer interleaves SDD process questions (What, Why, Design decisions) with ACES-specific questions (trigger conditions, behavioral contracts, failure modes) in a single pass, rather than doing SDD first and ACES second.

---

## Why

Without governance composition, `aces-spec-designer` either:
- Bakes SDD process knowledge inline (maintenance burden; diverges when SDD evolves), or
- Relies on the invoking skill to tell it to run `governance show` (fragile; breaks if the instruction is missing)

The designer must know both the SDD process and the ACES skill schema to produce a spec that satisfies both. With declarative governance loading, this knowledge is guaranteed at construction time with no runtime coordination required.

The interleaved question order matters: trigger conditions must be gathered alongside the `What` section because they ARE part of what the skill does — separating them causes the designer to miss edge cases in the behavioral contract.

---

## Design decisions

### Interleaved questions, not sequential phases

The designer could run in two phases: complete the SDD spec sections, then add ACES sections. This was rejected because:
- The `## Triggers` section informs the `## What` section — you cannot fully describe what a skill does without knowing which situations activate it.
- The `## Failure modes` section is entangled with `## Design decisions` — failure handling is often a design decision.
- Sequential phases produce specs where the ACES sections feel bolted on rather than integrated.

Interleaved order: `Triggers → What → Why → Behavioral contract → Design decisions → Failure modes → Eval coverage`.

### Designer asks for trigger examples, not the user

`aces-spec-designer` elicits trigger examples through structured questions rather than asking the user to provide them freeform. This produces more representative examples (the designer prompts for near-misses explicitly) and ensures minimum coverage thresholds are met before the spec is considered complete.

### `aces-spec-validator` unchanged

The validator already checks completeness and diversity of the generated eval suite. It does not need changes — the governance composition ensures the designer produces the right structure, and the validator continues to enforce it.

---

## Agent definition (after this feature)

```yaml
name: aces-spec-designer
description: "Internal subagent: generates trigger queries and golden-set cases for one agent configuration artifact."
requires_governances:
  - sdd:sdd-principles
  - sdd:spec-template
  - aces:skill-spec-schema
```

The skill that invokes it (`aces:create-spec`) does not change its invocation signature. Governance loading is transparent to callers.

---

## Flow: user creates a skill spec

```
User: "create an eval suite for the commit-work skill"
  → aces:create-spec skill triggered
  → resolves artifact: .agents/skills/commit-work/SKILL.md
  → invokes aces-spec-designer with artifact content
    → runtime loads sdd:sdd-principles into context
    → runtime loads sdd:spec-template into context
    → runtime loads aces:skill-spec-schema into context
    → designer runs interleaved question flow
    → produces spec.md + golden-set cases
  → aces-spec-validator checks completeness (existing loop)
  → writes artifacts/specs/<suite-name>/
```

---

## Command surface / API

No new user-facing commands. The change is internal to `aces-spec-designer`'s definition and invocation.

Observable change: the generated `spec.md` for a skill artifact will always contain `Triggers`, `Behavioral contract`, `Failure modes`, and `Eval coverage` sections — previously these were produced inconsistently.

**Gherkin scenarios:** _(pending spec approval)_

---

## Related

- `artifacts/specs/governance-composition/spec.md` — the loading mechanism this depends on
- `artifacts/specs/aces-skill-spec-schema/spec.md` — the schema loaded by this agent
- `artifacts/specs/aces-plugin/spec.md` — overall ACES plugin spec
