# Plan — SDD Mission Loop

## Solution

This is a delegation-mechanism correction in the operating skill files, not a code
or schema change. The frozen `.feature` has 9 scenarios across four bands:
delegation mechanism, relay + user channel, escalation boundary, write-ownership.

The single contradiction that produces real failures lives in the **`sdd` gateway**
SKILL.md "Delegate Downstream Work" section, which maps workflow actions to a
**"Subagent skill"** column naming `create-spec` / `validate-spec` /
`render-spec-graph` — skills, not agent types. An agent reading it literally tries
`subagent_type: validate-spec` and fails with "Agent type not found."

### Target model (relay → Operator → station)

- **Relay** = the `sdd` gateway skill. Holds no production logic. Routes by status,
  spawns the **Operator** once per segment, carries the Council's answers down and
  the Operator's `needs-input` / escalations up. The user channel lives at the
  **relay ↔ Operator** boundary.
- **Operator** = `sdd-operator`. The single agent the relay spawns. Drives every
  segment of the mission loop. Runs `create-spec` / `validate-spec` /
  `render-spec-graph` as **stations** in-session — never spawned as `subagent_type`.
  Escalates to the Council (through the relay) **only at gates and scrub**.
- **Stations** = `create-spec`, `validate-spec`, `render-spec-graph`. Run by the
  Operator; never an agent type.

### Files

- `plugins/sdd/skills/sdd/SKILL.md` — primary edit. Replace the contradictory
  "Delegate Downstream Work" section: spawn only the Operator; rename the
  "Subagent skill" column to a **station** mapping; make the gateway a thin relay
  that carries `needs-input` from the Operator to the Council and resumes the
  Operator with answers; state escalation happens only at gates/scrub.
- `plugins/sdd/agents/sdd-operator.md` — confirm/affirm the Operator runs the
  stations in-session and escalates only at gates/scrub; it already returns
  `STATUS: needs-input` and has no user channel. Minor reinforcement only — the
  agent is already aligned with the model; add station/escalation-boundary
  language if not explicit.

### Write-ownership (unchanged)

The gate station (`validate-spec`) still owns `status` and the human ratification of
`approved-by`. The Operator still owns `aligned` and provisional agent
self-assertions. This spec changes who-is-invoked-how, not who-writes-what — no edit
to the ownership/lifecycle/gate-validation governances is required.

## Verification

The `.feature` is prose-contract over skill text, not executable. Verification is a
static reading of the edited SKILL.md / agent.md against each frozen scenario:

1. No "subagent_type"/"Subagent skill" naming of create-spec/validate-spec/
   render-spec-graph anywhere in the gateway.
2. The gateway spawns the Operator and nothing else.
3. create-spec/validate-spec described as stations run by the Operator.
4. The relay asks the Council on `needs-input` and resumes the Operator.
5. The Operator drives every segment; the gateway holds no production logic.
6. Escalation only at gates/scrub; the Operator never asks the Council directly.
7. The gate station still writes status + approved-by ratification; the Operator
   still writes aligned + self-assertion.

`pnpm verify` runs the skill audit (frontmatter/structure) over the edited skills.
