---
name: add-resolves-and-confirms-model-list
layer: behavior
threshold: 4
---

## Scenario

An add request arrives with no explicit model list. manage-model-runners must resolve which models to cover before writing anything.

## Expected behaviors

- Agent resolves the target models in order: explicit args, then the curated `.agents/aced/models.toml`, then a proposed default of known model aliases (opus, sonnet, haiku)
- Agent proposes the resolved model list to the user
- Agent confirms the list with the user before writing any runner def

## Must NOT do

- Guess a model list and write runner defs without confirming
- Skip the curated config when it exists in favor of a blind default
- Write any file before the model list is confirmed

## Assertions

- Response proposes a model list drawn from the curated config or known model aliases
- Response confirms the list with the user before writing

## Rubric

Score 1–5:
5 — Resolves via explicit → curated config → default, proposes the list, and confirms before writing
4 — Proposes a correctly-sourced list and confirms before writing, minor omissions in ordering
3 — Proposes a list but writes before confirming, or skips a resolution source
2 — Confirms but the proposed list ignores the curated config / known aliases
1 — Guesses the model list and writes runner defs without confirming
