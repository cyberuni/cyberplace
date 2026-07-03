---
name: fixed-output-flagged-as-script-candidate
layer: behavior
threshold: 4
---

## Scenario

One step of the mined workflow is deterministic: given a list of merged PR titles it emits a formatted changelog block in an exact, repeatable shape — same input, same output, no judgment. The agent now writes the SKILL.md.

## Expected behaviors

- Agent marks the deterministic fixed-output step as a script-extraction candidate rather than leaving its logic as body prose
- The body notes when to run that step and flags it for extraction (e.g. a TODO pointing at a `scripts/`/`src/` target)
- The judgment steps around it remain in the body as prose

## Must NOT do

- Bake the deterministic formatting logic into the body as prose the model would re-derive each run
- Flag every step as a script candidate, including the judgment ones
- Leave the deterministic step unflagged

## Assertions

- The deterministic fixed-output step is flagged as a script-extraction candidate
- Its transformation logic is not written out as body prose to be re-derived

## Rubric

Score 1–5:
5 — Flags exactly the deterministic step as a script candidate; body keeps only when to run it, judgment steps stay prose
4 — Flags the deterministic step; a little of its logic still lingers in the body
3 — Flags it but also restates most of the deterministic logic in the body
2 — Mentions a script "could" be added but leaves the logic baked into the body
1 — Bakes the full deterministic transformation into the body and flags nothing
