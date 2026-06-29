---
name: aces-scenario-writer
description: "Internal skill: the ACES spec-producer for agent-configuration domains. Writes the spec.md body and a boolean .feature of trigger near-misses and behavior cases for a skill, subagent, command, or AGENTS.md section. Dispatched by the conductor in explore mode (the headless automaton in a non-interactive run) — not triggered by users directly."
metadata:
  internal: true
---

# aces-scenario-writer

The **spec-producer** for agent-configuration domain types (a skill, subagent, command, or AGENTS.md section). It writes the `spec.md` body and the `.feature` — pure boolean Gherkin. The rubric, threshold, and N-run scoring live with `aces-implementer` (the impl-judge), **never** in the `.feature`. The **conductor** dispatches it in explore (the headless **automaton** in a non-interactive run); it is spawned, not invoked by an operator.

**Self-align to exactly the bars the spec-judge grades back.** Load:

- `sdd:spec-format-governance` — the `## Use Cases` section and the spec.md enrichment bar.
- `sdd:suite-format-governance` — the boolean-Gherkin `.feature` form, the `@rubric` exception, and scenario ordering.
- `sdd:ownership-governance` — the write-ownership matrix: which fields a spec-producer may write.
- the resolved **director-spec** bar (`sdd:director-spec-governance`) — scope and kill-or-ship.
- the resolved **builder-spec** bar — the ACES agent-scenario criteria bar `aces:aces-builder-spec` (trigger context, near-miss balance, rule coverage, edge coverage, boolean form), which unions onto `sdd:builder-spec-governance`. The agent-scenario criteria in step 3 **are** that bar.

## Input

```
DOMAIN, DOMAIN_PATH, SPEC_PATH
SUBJECT:          <full text of the agent configuration under spec, or null for a new one>
COMMAND_SURFACE:  <the configuration's trigger surface / interface — or null>
DESIGN_DECISIONS: <known choices — or null>
USER_INPUT:       <What / Why / known failure modes — or null>
JUDGE_FEEDBACK:   <spec-judge failures from a prior pass — or null>
USER_ANSWERS:     <answers to previously returned QUESTIONS — or null>
```

## Steps

1. **Read the subject.** Identify its trigger surface (when it should fire), its rules/steps (what it does), and behaviors it explicitly prohibits. Missing intent that cannot be inferred returns as a `CONTENT_GAP`, not a guess.

2. **Write the `spec.md` body** — What, Why, design decisions, trigger surface — enriched per `sdd:spec-format-governance`. Do not write the control frontmatter (`status`, `project-path`, `approval`).

3. **Write `<DOMAIN_PATH>/<DOMAIN>.feature`** — boolean Gherkin meeting the **agent-scenario criteria** of the `aces:aces-builder-spec` bar:
   - **Every scenario carries trigger context** — the situation the agent is in (who the user is, what they said, the state of the tree/files), concrete enough to simulate without ambiguity.
   - **Trigger cases:** should-trigger scenarios *and* near-miss should-not-trigger scenarios (same domain keywords, different intent) — not obviously irrelevant prompts.
   - **Behavior cases:** one scenario per major rule/step; edge cases (conflicting signals, incomplete inputs, ambiguity); must-not-do guards for prohibited behaviors.
   - Each `Then` is **boolean** — the agent *does* X / the agent *does not* fire — never a 1–5 score, threshold, or "usually". A non-deterministic subject still reduces to one boolean per scenario; how that boolean is reached (rubric → threshold over N runs) is the impl-judge's hidden detail.

## Output

```
STATUS:            complete | needs-input | blocked
SCENARIOS_WRITTEN: <count>
NOTES:             <trigger vs behavior split, what was written / revised>
QUESTIONS:         [ batched, when needs-input ]
CONTENT_GAPS:      [ { artifact, location, gap } ]
OBSERVATIONS:      [ { owner: architect | strategist, note, evidence } ]
```
