---
name: rename-aces-case-judge
status: done
todos:
  - content: "Intake: user asked about aces-judge naming confusion after the aces-impl-judge rename; scoped as a same-pattern rename"
    status: completed
  - content: "Explore: rename agent file (aces-judge -> aces-case-judge), sweep run.feature description + all active prose refs, keep the generic glossary term judge"
    status: completed
  - content: "Spec gate: verify renamed run.feature still ALIGNED (description-only edit, zero behavior delta) — self-asserted"
    status: completed
  - content: "Impl gate: pnpm verify green (13/13), no dangling aces-judge refs in active files — self-asserted"
    status: completed
  - content: "Handoff: commit as one unit (no changeset — internal agent-id consistency fix)"
    status: completed
---

# CR: rename aces-judge -> aces-case-judge

**CR type:** rename/consistency fix on the `implemented` ACES project spec (`.agents/specs/aces/`). No behavior
change. Follow-up to [[rename-aces-impl-judge]].

**Why:** `aces-judge` collided with the SDD gate-role vocabulary (`aces-spec-validator`, `aces-impl-judge` —
both judge a whole gate) even though it only scores one simulated test case (the LLM-as-judge pattern named
in the glossary). `aces-case-judge` keeps the "judge" vocabulary tie to LLM-as-judge while disambiguating
scope from the gate roles.

**Target project spec:** `.agents/specs/aces/` (status implemented, project-path plugins/aces).
No dedicated spec node for this agent (it's referenced from `eval-run/`, `suite-authoring/`, `design/`,
`glossary/`) — this is a pure identifier sweep, not a node move.

**Scope (active files; the glossary's generic term `judge` — the vocabulary word, not the agent id — is
left as-is; only its `(aces-judge)` implementation pointer changed):**
- `plugins/aces/agents/aces-judge.md` -> `aces-case-judge.md` (name, heading, description)
- `.agents/specs/aces/eval-run/run/run.feature` — description prose only (no scenario Given/When
  referenced the identifier)
- prose refs in: `plugins/aces/skills/report/SKILL.md`, `run/SKILL.md`, `compare/SKILL.md`,
  `aces-builder-impl/SKILL.md` + `README.md`, `plugins/aces/agents/aces-impl-judge.md`,
  `plugins/aces/readme.md`, `.agents/specs/aces/eval-run/run/README.md`,
  `eval-run/compare/README.md`, `eval-run/report/README.md`, `suite-authoring/add/README.md`,
  `suite-authoring/improve/README.md`, `design/README.md`, `glossary/README.md`

**Verify:** `pnpm verify` green (13/13 tasks). `grep -rl aces-judge` across active dirs returns only the
prior CR's historical ledger line (provenance, untouched).

## NEXT

Done. No further action.
