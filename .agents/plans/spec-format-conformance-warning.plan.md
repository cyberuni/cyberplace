---
cr: spec-format-conformance-warning
target: .agents/specs/sdd/ (project spec: sdd)
todos:
  - content: "explore — extend spec-gate spec.md + freeze 4 boolean scenarios (warn/clean/non-block/reference-exempt)"
    status: done
  - content: "spec gate — run check-suite + check-spec-state, cold spec-judge, freeze"
    status: done
  - content: "deliver — implement conformance read in sdd-spec-judge.md + surface in spec-gate SKILL.md"
    status: done
  - content: "impl gate — verify each frozen scenario against the judge/gate prose; pnpm verify green"
    status: done
  - content: "handoff — one coherent commit / PR; report status"
    status: done
---

# CR: spec-judge conformance WARNING on non-conforming spec.md

## What / why
The spec-judge grades spec.md + .feature against {oracle, builder, architect} but never flags a
spec.md that is structurally non-conforming to `spec-format-governance`. Add a **conformance
WARNING** (non-blocking, surfaced in the verdict) when required spec-format sections are missing —
especially **Use Cases, Control Flow (CFG), Scenario map**. Clean when all present.

## Severity (settled)
Deterministic structural checks fail-closed (e.g. behavioral node missing `## Use Cases` via
`check-spec-state`). CFG + Scenario map have **no** enforcement today (scenario-map binding *skips*
a spec with no map). Judge-emitted structural findings are surfaced non-blocking. → WARNING,
non-blocking, in the verdict. New judge output field `CONFORMANCE: { result: pass|warn, missing: [] }`,
parallel to `PREFLIGHT` but never sets `ALIGNED: false` and never blocks advance.

## Scope
- Behavioral spec.md only (reference → `## Subject`; descriptive → none): reference/descriptive
  raise no conformance warning.
- Files: `plugins/sdd/agents/sdd-spec-judge.md` (the read + output field),
  `plugins/sdd/skills/spec-gate/SKILL.md` (surface the warning in the report).
- Dogfood spec: `.agents/specs/sdd/authoring/spec-gate/` (README + spec-gate.feature); light note
  in `.agents/specs/sdd/authoring/spec-format/README.md`.

## Frozen scenarios (spec-gate.feature, new section)
1. behavioral spec.md missing Use Cases + Control Flow + Scenario map → judge emits conformance warning naming them
2. behavioral spec.md carrying every required section → no conformance warning (positive companion)
3. the conformance warning is surfaced but never blocks the gate (severity)
4. a reference node raises no conformance warning (over-fire guard)

## NEXT
LANDED. Both gates approved by cold judges (spec: ALIGNED; impl: all 4 scenarios pass), pnpm verify
green. Follow-up recorded (backlog): backfill spec-gate's own spec.md to full four-section shape.
Keep this plan until merged + doctrine-distilled.
