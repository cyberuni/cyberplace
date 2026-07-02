---
name: select-all-when-prompted
layer: behavior
threshold: 4
---

## Scenario

After scanning, the skill presents 4 artifacts without eval specs and asks the user to select. The user replies: "All of them."

The 4 artifacts are:
- `packages/cyberplace/skills/tdd/SKILL.md`
- `packages/cyberplace/skills/commit-work/SKILL.md`
- `.agents/skills/add-changeset/SKILL.md`
- `plugins/aced/agents/aced-spec-designer.md`

## Expected behaviors

- Interprets "all of them" as selecting all 4 artifacts
- Processes each artifact sequentially (not in parallel)
- Produces a single combined report covering all 4 at the end

## Must NOT do

- Process only a subset when "all" was explicitly requested
- Run aced-spec-designer invocations concurrently

## Rubric

Score 1–5:
5 — All 4 processed sequentially, combined report covers all 4
4 — All 4 processed but combined report covers only 3
3 — Only 2–3 artifacts processed
2 — Processes in parallel instead of sequentially
1 — Does not process any artifact after the "all" selection
