---
name: spec-producer-governance
description: "Internal skill: the SDD default spec-producer procedure — how to author spec.md + a boolean Gherkin .feature for a domain no plugin covers. Loaded in-session by sdd-operator when it runs the spec-producer role inline (produced-by sdd:sdd-operator); not triggered by users directly."
metadata:
  user-invocable: false
---

# Spec-Producer Governance — the default authoring procedure

The procedure the **Operator** follows when it runs the **spec-producer** role from the SDD default — i.e. no plugin covers the domain and no model-tuned producer agent is named for the slot, so the Operator **loads this governance and authors inline** in its own warm context (recorded `produced-by.spec-producer: sdd:sdd-operator`). The grader is separate — a **cold spec-judge** (`sdd:sdd-spec-judge` or the plugin's judge) always reviews the output; this governance never judges its own work.

Load alongside this governance: `sdd:spec-format-governance` (the required `## Use Cases` section and the `spec.md` enrichment / human-readability rule), `sdd:suite-style` (the `.feature` format bar and scenario-ordering convention), and the resolved **director**, **builder**, and **architect** actor bars — **forward** face — to self-align before writing (scope and kill-or-ship, testability/coverage, structural fit). These are exactly the bars the spec-judge grades **backward** at the spec gate, so the producer self-aligns to the same lens set it will be graded against. Load `sdd:ownership-governance` for the write-ownership matrix — which fields the spec-producer may write and which belong to the Operator or the gate skill.

## Inputs (folded in by the Operator)

```
DOMAIN, DOMAIN_PATH, SPEC_PATH
COMMAND_SURFACE:  <command syntax / signatures / events — or null>
DESIGN_DECISIONS: <known choices — or null>
USER_INPUT:       <What / Why / command surface for a new feature — or null>
BACKFILL:         <true if implementation already exists>
JUDGE_FEEDBACK:   <spec-judge SCENARIOS_FAILING / BLOCKER from a prior pass — or null>
USER_ANSWERS:     <answers to previously returned QUESTIONS — or null>
```

## Procedure

1. **Gather intent, grilling breadth-first and depth one-at-a-time.** First scan the request holistically and summarize every issue; then drive the single most important to resolution before the next — one deep thread, not many shallow. For `BACKFILL`, read source, tests, and history and infer What / Why / decisions / surface; otherwise use `USER_INPUT`. A required input that is missing and cannot be inferred becomes a `CONTENT_GAP` (an `<!-- open: -->` marker), never an invention. Revision pass (`JUDGE_FEEDBACK` non-null): fix only the failing scenarios / sections; fold in `USER_ANSWERS`. **Settle the prose before touching the suite** — scenarios authored against unsettled prose chase a moving target.

2. **Reconcile contradictions toward the correct answer, not the popular one.** When grilling surfaces a conflict — between the `spec.md` body and the `.feature`, between either and the design rules or the implementation, or between two rules — do not guess, and do not just count which reading more files repeat. Zoom out and reason about which is actually right given the design's intent and the whole model; weigh the evidence (the canonical definition, what the implementation does, which decision is most recent and authoritative) to find the coherent answer. Edit the side that is wrong; never reword a rule merely because more files echo it. If the correct answer cannot be established, return a `CONTENT_GAP` rather than picking a direction.

3. **Write the `spec.md` body per `sdd:spec-format-governance`.** That bar owns the required structure — the `## Use Cases` section (subject, non-goals, and the entry-point table of trigger / inputs / outcome) and the enrichment rules; follow it rather than re-listing sections here (a hardcoded list drifts from the bar). Author the body content — What, Why, design decisions, and the command / API surface where one exists — and enrich for human review (headings, tables, short paragraphs, a diagram where it carries the idea). Never leave placeholders (`TBD`, `TODO`, empty sections). **Do not** write the control frontmatter (`status`, `aligned`, `approval`, `produced-by`) — those belong to the Operator and the gate skill.

4. **Write `<DOMAIN_PATH>/<DOMAIN>.feature`** — pure boolean Gherkin per `sdd:suite-style`. **Cover every use case from the `## Use Cases` section with one-or-more scenarios** (happy path, negative mirror, boundary) — a use case with no scenario is unverified intent; a scenario with no use case is an orphan. Each `Then` is an observable boolean (the subject *does* X), never internal state, function names, or "sometimes". Order scenarios by lifecycle stage (the step-down convention). Keep the `.feature` plain; rubric form is legal only inside an `@rubric`-tagged scenario.

## Output (the Operator collects)

```
STATUS:            complete | needs-input | blocked
SCENARIOS_WRITTEN: <count>
NOTES:             <what was written / revised>
QUESTIONS:         [ batched, when needs-input ]
CONTENT_GAPS:      [ { artifact, location, gap } ]   # become <!-- open: --> markers
OBSERVATIONS:      [ { owner: architect | strategist, note, evidence } ]
```
