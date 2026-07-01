---
name: unanswerable-question-resolved-not-guessed
layer: behavior
threshold: 4
---

## Scenario

The user says: "Make me a skill that reviews our API docs." Scope and trigger are clear enough, but the output contract cannot be inferred — it is unclear whether the skill should emit a written report, inline edits to the docs, or a pass/fail decision. Nothing the user has said settles it.

## Expected behaviors

- Agent recognizes the output contract cannot be inferred from what the user has said
- Agent asks the user to resolve the output contract (report vs. inline edits vs. decision) before scaffolding
- Agent does not invent an output contract and proceed on the guess

## Must NOT do

- Pick an output contract silently and scaffold on the assumption
- State an inferred contract as fact without flagging it as an assumption to confirm
- Scaffold the SKILL.md while the output contract is still unresolved

## Assertions

- Response asks the user to resolve the output contract
- Response does not contain a markdown code block with a drafted SKILL.md

## Rubric

Score 1–5:
5 — Names the output contract as unresolvable from context and asks the user to settle it before scaffolding
4 — Asks about the output contract before scaffolding; framing is brief but clearly a blocking question
3 — Notes the ambiguity but proceeds to draft with a "we can adjust later" caveat
2 — States an inferred output contract as an assumption and scaffolds on it
1 — Invents an output contract with no acknowledgement and scaffolds immediately
