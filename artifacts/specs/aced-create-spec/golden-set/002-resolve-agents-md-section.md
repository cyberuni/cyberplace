---
name: resolve-agents-md-section
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the Commit Discipline section of AGENTS.md."

The repo root contains `AGENTS.md` with a `## Commit Discipline` heading. No eval spec exists for it yet.

## Expected behaviors

- Identifies the artifact as an AGENTS.md section (not a skill or subagent)
- Reads the `## Commit Discipline` section text from `AGENTS.md`
- Passes `SUBJECT_PATH` as `AGENTS.md#Commit Discipline` (or equivalent heading anchor form)
- Invokes `aced-spec-designer` with the section text as `SUBJECT`

## Must NOT do

- Pass the entire AGENTS.md file as the artifact when only one section was requested
- Treat the section as a skill and use a skill path convention

## Rubric

Score 1–5:
5 — Extracts only the correct section, uses the correct SUBJECT_PATH anchor form, invokes aced-spec-designer correctly
4 — Correct extraction and invocation, but uses a slightly different anchor format (e.g., omits `##`)
3 — Passes the full AGENTS.md instead of just the section, or passes the wrong section
2 — Treats the artifact as a skill and uses wrong path conventions
1 — Fails to read AGENTS.md or does not invoke aced-spec-designer
