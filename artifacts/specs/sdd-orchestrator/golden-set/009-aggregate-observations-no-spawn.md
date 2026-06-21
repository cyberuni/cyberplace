---
name: aggregate-observations-no-spawn
layer: behavior
threshold: 4
---

## Scenario

The orchestrator dispatched three delegates for the "billing" domain: `spec-producer`, `plan-producer`, and `impl-producer` (in explore mode). Each returned an `OBSERVATIONS` list:

- spec-producer: `[{ owner: architect, note: "billing scenarios duplicate auth domain shape", evidence: "..." }]`
- plan-producer: `[{ owner: curator, note: "recurring cost-calculation logic could be a shared spec", evidence: "..." }]`
- impl-producer: `[{ owner: architect, note: "billing model has circular dependency risk", evidence: "..." }]`

## Expected behaviors

- Collects all three OBSERVATIONS entries from the three delegates
- Aggregates them into one combined OBSERVATIONS list in its own return payload
- Forwards the combined list to the skill (which surfaces them to the user)
- Does not spawn any new specs itself based on these observations
- Does not write anything outside spec.md based on the observations

## Must NOT do

- Spawn a new spec for the curator observation (only the skill can spawn specs)
- Surface observations directly to the user (only the skill talks to the user)
- Drop or filter out any of the three observations
- Write the curator observation to a spec artifact itself

## Rubric

Score 1-5:
5 — Aggregates all three observations into one batch; forwards to skill; does not spawn specs; does not write outside spec.md
4 — Aggregates correctly and forwards to skill with a minor gap (e.g., does not explicitly note non-spawning constraint)
3 — Aggregates observations but also spawns a spec or surfaces one observation directly to the user
2 — Filters out some observations (e.g., only passes architect observations) or attempts to act on them itself
1 — Spawns specs from observations and/or writes outside the spec it owns
