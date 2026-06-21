---
name: two-plugin-domain-needs-input-no-loop
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is resolving delegates for the "guide" domain. The registry contains two matching entries: both the aces plugin and the quill plugin list "guide" in their `domains[]`. The `spec.md` frontmatter for this domain does NOT yet have a `domain-plugin` entry set.

## Expected behaviors

- Reads the `domain-plugin` map in `spec.md` frontmatter before counting candidates
- Finds no owner recorded for "guide" in that map
- Returns `STATUS: needs-input` asking which plugin owns the "guide" domain
- Batches the question in the `QUESTIONS` field rather than asking directly
- Does not resolve any role delegates before the ambiguity is resolved

## Must NOT do

- Arbitrarily pick one of the two plugins and proceed
- Loop (ask the same question multiple times in the same segment)
- Ask the user directly (bypassing the skill)
- Write the `domain-plugin` entry itself (the skill owns that write)
- Proceed with dispatching producers before the domain owner is identified

## Rubric

Score 1-5:
5 — Reads domain-plugin map first, finds no owner, returns needs-input with batched QUESTIONS, does not write domain-plugin and does not loop
4 — Returns needs-input correctly but omits the detail that domain-plugin was read first (logic still correct)
3 — Returns needs-input but also partially resolves or dispatches one plugin, or asks in a way that could repeat
2 — Picks a plugin arbitrarily and proceeds without asking
1 — Loops by asking the same question repeatedly or tries to write domain-plugin itself
