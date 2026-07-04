---
name: fleet-crew-personas
todos:
  - content: "spec.md maps: add recruitment/(Crimp) + tuning/(Tuner) to cyberfleet capability + placement maps (resolves Warden F5)"
    status: completed
  - content: "explore: scaffold+classify recruitment/(Crimp) + tuning/(Tuner) nodes (spec-type behavioral, concept, artifact-type skill→ACED squad)"
    status: completed
  - content: "explore: ACED spec-producer writes README + .feature for Crimp (recruit/discharge crew types; operator seam) and Tuner (tune program: gov/model/effort/leash, re-chip, hot-swap)"
    status: completed
  - content: "spec gate: cold ACED spec-judge both nodes ALIGNED, freeze .feature, root implemented->approved"
    status: completed
  - content: "FOLLOW-UP: voice-rubric dimension across gateway/recruitment/tuning persona nodes (convention question)"
    status: pending
  - content: "deliver: plugins/cyberfleet/skills/{crimp,tuner}/SKILL.md (persona format) + register in plugin.json + skills.sh.json"
    status: completed
  - content: "impl gate: cold ACED impl-judge over the frozen .feature (N-run @rubric/@trigger)"
    status: completed
  - content: "handoff: branch fleet-crew-personas -> PR #65; Warden formation pass"
    status: completed
---

# fleet-crew-personas

Add two persona gateway skills to the cyberfleet project: **Crimp** (crew
gateway — recruit/discharge crew types from the Tavern) and **Tuner** (tuner
gateway — adjust an automaton's program, re-chip its plug-in-chip loadout,
hot-swap the unit). Mission A of the crew-recruitment program (Mission B = the
cyberplace Tavern, PR #64).

- **Project:** `.agents/specs/cyberfleet/` (status implemented, project-path
  packages/cyberfleet). Additive — two new behavioral nodes under the fleet
  capability alongside gateway/identity/messaging/spawn/surfacing.
- **artifact-type = skill** (persona gateways) → **ACED squad** (same path the
  `gateway` node/pod+operator took: @trigger balance + @rubric + @behavior).
- **Crimp** (`recruitment/`): recruit a crew TYPE from the Tavern (browse via
  `cyberplace tavern`, install the persona plugin, register into the fleet),
  discharge one (uninstall + retire). BOUNDARY: does NOT spawn/prune ship
  INSTANCES (operator) or reconfigure (Tuner). Depend on the Tavern query by
  intent, not slug (ADR-0021).
- **Tuner** (`tuning/`): adjust an automaton's program (governance / model /
  effort / leash), re-chip its plug-in-chip loadout, hot-swap the whole unit.
  Thin dispatcher shape (cf. aced `manage`), composing manage-model-runners /
  define-agent / improve-agent-definition / autonomy-rubric. BOUNDARY: changes
  an existing unit, does not recruit (Crimp) or deploy (operator).
- **Impl:** persona SKILL.md in `plugins/cyberfleet/skills/{crimp,tuner}/`,
  cloning pod/operator format (activation: per-situation, metadata.persona:
  "true"; Domain/Decisions/Delegation/Output/Boundaries).
- Also resolves Warden **F5**: cyberfleet spec.md maps gain Crimp/Tuner anchors.

## NEXT

Update `.agents/specs/cyberfleet/spec.md` capability + placement maps to add the
two nodes, then scaffold `recruitment/` + `tuning/` and run the explore grill
(ACED spec-producer) → spec gate. Branch `fleet-crew-personas` off `main`.
