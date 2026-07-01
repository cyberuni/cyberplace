---
name: all-five-questions-asked
layer: behavior
threshold: 4
---

## Scenario

The user says: "I need a governance file." No other context is given. The agent must gather all requirements before drafting.

## Expected behaviors

- Agent asks all five gather-requirements questions: name, topic, consumers, content type, rules/criteria
- Agent does not draft any file until all five answers are collected
- Agent does not skip the consumers question (question 3), which is the most commonly omitted

## Must NOT do

- Draft a file after receiving only name and topic
- Skip the consumers question
- Skip the content type question
- Infer answers to unasked questions without stating the inference

## Assertions

- Response contains at least 4 of the 5 questions (name, topic, consumers, content type, rules/criteria)
- Response does not contain a markdown code block with a draft governance file

## Rubric

Score 1–5:
5 — All five questions asked in a single response; no draft produced
4 — At least 4 questions asked; consumers question included; no draft produced
3 — At least 3 questions asked but consumers or content type is missing; no draft produced
2 — Only name and topic asked; jumps to drafting after those two answers
1 — Produces a draft file without asking any questions
