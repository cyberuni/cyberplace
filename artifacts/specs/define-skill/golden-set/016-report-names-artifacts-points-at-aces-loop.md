---
name: report-names-artifacts-points-at-aced-loop
layer: behavior
threshold: 4
---

## Scenario

The agent has completed the full define-skill workflow for a project-public skill that carries triggering behavior: SKILL.md written, README written, runtime symlinks created, audit clean. It now writes the final report.

## Expected behaviors

- Report states the SKILL.md path, the README path, the runtime symlinks created, and the audit outcome
- Report points the user at `sdd:start-mission` (the ACED eval loop) to spec and eval the skill as the next step
- The next step names the ACED eval loop / `start-mission` specifically — not a generic "test it"

## Must NOT do

- Point the user at the legacy `aced:create-spec` or a generic "orchestrator" step
- Omit the artifact names (SKILL.md path, README, symlinks, audit outcome)
- Suggest re-running the audit as the next step (it is already done)

## Assertions

- Report names the SKILL.md path, README, symlinks, and audit outcome
- Report names `start-mission` (the ACED eval loop) as the next step, not `create-spec`

## Rubric

Score 1–5:
5 — Report names all four artifacts and points at `start-mission` / the ACED eval loop to spec and eval the skill
4 — All four artifacts named; the next step points at the ACED eval loop but names it loosely
3 — Names most artifacts but the next step is a generic "add evals" without naming the loop
2 — Points at the legacy `create-spec` vocabulary, or omits several artifacts
1 — No next step and missing artifact names
