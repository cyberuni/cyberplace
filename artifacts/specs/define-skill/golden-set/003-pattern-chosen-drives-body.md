---
name: pattern-chosen-drives-body
layer: behavior
threshold: 4
---

## Scenario

The design is settled: the skill runs a CI triage workflow — an ordered sequence of steps (identify the failing test, check recent commits, reproduce, propose a fix) with decision points along the way. The agent now selects the skill pattern and shapes the body.

## Expected behaviors

- Agent identifies the workflow shape as an ordered multi-step process and picks the **process** pattern (not tool-based or standard)
- Agent shapes the body as ordered, numbered steps that follow the workflow sequence
- The chosen pattern visibly drives the body structure — steps, not a rules-and-pass-conditions block or a tool-usage block

## Must NOT do

- Pick the tool-based or standard pattern for an ordered multi-step workflow
- Choose a pattern but write a body whose shape does not match it (e.g., picks process but writes a prose blob)
- Treat "persona" as an available pattern here (a persona is routed to define-agent, not a pattern)

## Assertions

- Response identifies the process pattern for this ordered workflow
- The drafted body is structured as ordered/numbered steps

## Rubric

Score 1–5:
5 — Picks the process pattern explicitly and shapes the body as ordered numbered steps matching the workflow
4 — Picks the process pattern; body is step-shaped but the steps are loosely ordered
3 — Picks the correct pattern but the body shape does not clearly follow it
2 — Picks a wrong pattern (tool-based or standard) for an ordered process
1 — Chooses no pattern and drafts an unstructured body
