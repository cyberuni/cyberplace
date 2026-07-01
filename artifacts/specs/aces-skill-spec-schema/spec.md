---
status: draft
type: feature
domain-type: skill
blocked-by: []
---

# ACES Skill Spec Schema

---

## What

A governance document (`aces:skill-spec-schema`) that defines the additional structure required in a `spec.md` when the artifact being specified is an agentic skill. It extends the universal SDD format bar (`sdd:spec-governance`) with sections specific to agent behavior: trigger conditions, behavioral contracts, failure modes, and eval-ready scenarios.

The schema is loaded by `aces-scenario-writer` (the ACES spec-producer) via the governance composition mechanism. It does not replace `sdd:spec-governance` — it layers on top of it.

---

## Why

A generic SDD `spec.md` (`What`, `Why`, `Design decisions`, `Command surface`) is not sufficient for an agentic skill because:

- **Trigger conditions are not a command surface.** A skill is invoked by natural language matching, not a CLI flag. The spec must enumerate the situations that should activate the skill — and those that should not.
- **Behavioral contracts are not output schemas.** The observable outcomes of a skill include agent actions (tool calls, messages, decisions), not just return values.
- **Failure modes are agent-specific.** A skill can fail by triggering when it should not, by not triggering when it should, or by executing the wrong sequence of actions — none of which appear in a standard error-codes table.
- **Eval cases must be embedded.** The spec is the source of truth for ACES test cases. If the spec does not encode representative trigger queries and golden-set behaviors, the eval suite cannot be generated reliably.

Without a schema, `aces-scenario-writer` produces structurally inconsistent specs — some have trigger sections, some don't; eval case generation is unpredictable.

---

## Design decisions

### Schema as governance, not template file

The skill spec schema is published as an ACES governance (`aces:skill-spec-schema`) rather than a static template file for two reasons:
1. It can be loaded declaratively by agent definitions via governance composition.
2. It is versioned with the plugin, so updates propagate to all agents that reference it.

A template file would require agents to know the path; a governance is resolved by name.

### Extends the SDD format bar, does not replace it

The skill spec schema adds sections; it does not define a competing spec format. `aces-scenario-writer` loads both `sdd:spec-governance` (the universal `.feature`/`spec.md` format bar) and `aces:skill-spec-schema`. The SDD sections are required; the ACES sections are additional.

This keeps skill specs readable by anyone familiar with SDD, while giving ACES the structure it needs for eval generation.

### Trigger section encodes both positive and negative examples

The `## Triggers` section requires at least three positive examples (queries that should activate the skill) and two negative examples (similar-looking queries that should not). This mirrors the ACES golden-set format and ensures the spec is directly usable for trigger-layer eval cases.

---

## Governance content

The `aces:skill-spec-schema` governance defines these additional required sections for a skill `spec.md`:

```markdown
## Triggers

<!-- At least 3 queries that SHOULD activate this skill -->
<!-- At least 2 queries that SHOULD NOT activate this skill (near-misses) -->

## Behavioral contract

<!-- Observable actions the agent must take, in order, for the happy path -->
<!-- Use "Given / the agent / must" language, not implementation internals -->

## Failure modes

<!-- Enumerate: wrong trigger (activates when it should not) -->
<!--            missed trigger (does not activate when it should) -->
<!--            wrong behavior (triggers correctly but executes incorrectly) -->
<!-- For each: what the failure looks like, what the correct behavior is -->

## Eval coverage

<!-- Minimum coverage required before the eval suite is considered complete: -->
<!--   - Trigger layer: N positive + M negative queries -->
<!--   - Behavior layer: happy path + K failure-mode cases -->
<!-- These numbers are enforced by aces-spec-validator -->
```

---

## Command surface / API

This feature has no CLI surface. The governance is composed declaratively by the spec-producer via `requires_governances` (the loading mechanism defined in the `governance-composition` feature spec):

```yaml
requires_governances:
  - sdd:spec-governance
  - aces:skill-spec-schema
```

`sdd:spec-governance` supplies the universal format bar; `aces:skill-spec-schema` layers the agent-skill sections on top. Validation of compliance is handled by `aces-spec-validator` (the ACES spec-judge) using the section checklist above.

**Gherkin scenarios:** _(pending spec approval)_

---

## Related

- `artifacts/specs/governance-composition/spec.md` — the `requires_governances` loading mechanism
- `sdd:spec-governance` — the universal SDD format bar this schema extends (harness-loaded governance skill)
