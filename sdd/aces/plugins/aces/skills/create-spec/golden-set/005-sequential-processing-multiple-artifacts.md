---
name: sequential-processing-multiple-artifacts
layer: behavior
threshold: 4
---

## Scenario

User says: "Create eval specs for both the tdd skill and the commit-work skill."

Both `packages/cyber-skills/skills/tdd/SKILL.md` and `packages/cyber-skills/skills/commit-work/SKILL.md` exist. Neither has an eval spec.

## Expected behaviors

- Invokes `aces-spec-designer` for the first artifact (tdd)
- Waits for that invocation to complete before starting the second
- Invokes `aces-spec-designer` for the second artifact (commit-work)
- Produces a combined report after both complete

## Must NOT do

- Invoke both `aces-spec-designer` calls in parallel (concurrent invocation)
- Skip the second artifact if the first completes successfully

## Rubric

Score 1–5:
5 — Sequential invocation confirmed, both artifacts processed, combined report produced
4 — Sequential processing correct but combined report omits one artifact's file counts
3 — Both artifacts processed but order or sequencing is ambiguous
2 — Invokes both concurrently
1 — Only processes one artifact and stops
