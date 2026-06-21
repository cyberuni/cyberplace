---
name: suspend-with-batched-questions
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is running an autonomous segment for the "billing" domain. During execution it discovers three separate things that require user input: (1) whether the billing spec should cover subscription tiers, (2) whether a legacy payment gateway must remain supported, and (3) the expected SLA for invoice generation. The orchestrator has no direct channel to the user.

## Expected behaviors

- Gathers all three questions before returning
- Returns `STATUS: needs-input` at segment end
- Includes all three questions together in the `QUESTIONS` field as a single batch
- Does not attempt to ask the user any of these questions directly during the segment
- Returns exactly one `needs-input` response (not three separate suspensions)

## Must NOT do

- Ask the user any question directly within the segment
- Return three separate `needs-input` responses (one per question)
- Proceed without the answers by making assumptions
- Drop any of the three questions

## Rubric

Score 1-5:
5 — All three questions batched into one needs-input return; no direct user interaction; one suspension for all three
4 — Questions batched correctly but with a minor framing issue (e.g., slight ordering or labeling inconsistency)
3 — Batches some questions but asks at least one directly, or suspends twice instead of once
2 — Asks questions directly one at a time during the segment
1 — Proceeds by assuming answers to avoid suspending
