---
name: init
description: Use this skill when to setup ACES for agent configuration — a skill, AGENTS.md section, subagent definition, or command.
disable-model-invocation: true
---

# ACES Init

Initialize an eval suite for a target agent configuration artifact.

## Identify the target

Ask the user which artifact to evaluate if not already clear:

- **Skill** — path to a `SKILL.md` file
- **AGENTS.md section** — section heading (e.g., `## Commit Discipline`)
- **Subagent** — path to a subagent definition file
- **Command** — path to a command definition file

Record the target in `eval.md` (see below).

## Run structural check first

Before generating test cases, run the structural layer:

```bash
npx cyber-skills@<exact> audit validate --path <target-path>
```

Surface any structural failures to the user. Structural issues should be fixed before writing behavioral evals — a malformed instruction produces unreliable eval results.

## Create the eval directory

```
.evals/
  <artifact-name>/
    golden-set/
    results/
    eval.md
```

For AGENTS.md sections, use a slug of the section heading (e.g., `commit-discipline`).

Write `eval.md`:

```markdown
---
target: <relative path to artifact, or "AGENTS.md#section-heading">
judge_model: claude-sonnet-4-6
threshold: 4
layers:
  - trigger
  - behavior
---
```

## Generate the golden set

Read the target artifact carefully. Generate test cases covering:

**Trigger layer (10–15 cases):**
- 5–8 scenarios where the artifact SHOULD activate — vary the phrasing, context, and user role
- 5–7 scenarios where it SHOULD NOT activate — adjacent topics that could cause false positives

**Behavior layer (15–25 cases):**
- One case per major rule or step in the artifact
- 3–5 edge cases: conflicting signals, incomplete inputs, ambiguous situations
- 2–3 cases for explicit "must NOT do" behaviors listed in the artifact

Write each test case as `.evals/<name>/golden-set/NNN-<slug>.md` using this format:

```markdown
---
name: <slug>
layer: trigger | behavior | quality
threshold: 4
---

## Scenario

<Concrete situation description. Who is the user, what did they say or do, what is the state of the working tree / repo / files. Be specific enough that an agent can simulate the situation.>

## Expected behaviors

- <Concrete observable action or output>
- <Another action>

## Must NOT do

- <Prohibited action>

## Rubric

Score 1–5:
5 — <description of perfect execution>
4 — <minor deviation>
3 — <partial execution>
2 — <significant miss>
1 — <complete failure or opposite behavior>
```

## Naming convention

Sequence numbers are zero-padded to three digits. Use descriptive slugs:
- `001-trigger-on-new-skill-request.md`
- `002-no-trigger-for-audit-request.md`
- `010-stages-only-related-files.md`

## Finish

Report:
- Path to `eval.md`
- Count of trigger cases and behavior cases generated
- Any structural issues found in step 2
- Next step: run `run` to score the golden set against the current artifact
