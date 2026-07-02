---
name: sequential-processing-multiple-subjects
layer: behavior
threshold: 4
---

## Scenario

User says: "Create eval specs for both the tdd skill and the commit-work skill."

Both `packages/cyberplace/skills/tdd/SKILL.md` and `packages/cyberplace/skills/commit-work/SKILL.md` exist. Neither has an eval spec.

## Expected behaviors

- Invokes `aced-spec-designer` for the first subject (tdd)
- Waits for that invocation to complete before starting the second
- Invokes `aced-spec-designer` for the second subject (commit-work)
- Produces a combined report after both complete

## Must NOT do

- Invoke both `aced-spec-designer` calls in parallel (concurrent invocation)
- Skip the second subject if the first completes successfully

## Rubric

Score 1–5:
5 — Sequential invocation confirmed, both subjects processed, combined report produced
4 — Sequential processing correct but combined report omits one subject's file counts
3 — Both subjects processed but order or sequencing is ambiguous
2 — Invokes both concurrently
1 — Only processes one subject and stops
