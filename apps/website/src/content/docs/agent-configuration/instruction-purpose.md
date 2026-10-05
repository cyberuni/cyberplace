---
title: Purpose
description: What a block of instruction is for — procedure, criteria, policy, reference, menu, tone, or structure — and why separating them makes instructions composable.
---

**Agent Instruction purpose** answers what a block of instruction is _for_: steps to execute, conditions to be measured against, rules to conform to, material to consult, options to choose among, a way to sound, or a shape to respond in.

By identifying them, we can separate them cleanly to create composable and reusable instructions. Each purpose licenses a different verb — if a candidate section doesn't need a new verb, it isn't a new purpose:

| Purpose       | Gives the reader                       | Typical section headings                                    | Verb       |
| ------------- | -------------------------------------- | ------------------------------------------------------------ | ---------- |
| **Procedure** | ordered steps to execute               | Steps, Workflow, Usage, Instructions                        | act        |
| **Criteria**  | conditions to be measured against      | The Bar, What It Requires, Verification                     | evaluate   |
| **Policy**    | rules that must / must not be followed | Boundaries, What Not To Do, Anti-patterns, Non-goals        | comply     |
| **Reference** | facts about the world being worked in  | Architecture, Key Directories, Tech Stack, Domain, Glossary | know       |
| **Menu**      | a closed option set, and help choosing | Operations, Route The Request First                         | choose     |
| **Tone**      | a way of sounding                      | Tone, Persona Voice                                          | sound      |
| **Structure** | a shape the response must take         | Output Shape, Response Format, Length Limits                | format     |

## Reference is material, not citations

**Reference** is the ground truth an agent needs to work here at all: what the project contains, how directories are laid out, which stack it runs on, what the domain terms mean. `AGENTS.md`'s Architecture and Key Directories sections are the clearest case — they assert nothing normative, they just tell you where you are.

A list of links is not a purpose of its own. A pointer inherits the purpose of whatever it points at: a link to a governance is delivering policy, a link to a rubric is delivering criteria. Classify the destination, not the hyperlink.

## Criteria and Policy are not the same

Both are normative, and they get conflated constantly.

- A **policy** is something you _comply with_. Violating it means you did the job wrong.
- **Criteria** are something you are _measured against_. Failing them means you scored low.

A judge conforms to a governance (policy) while grading a submission against a rubric (criteria) — both at once, in the same run. If a section tells the reader how to behave, it is a policy. If it tells them how someone else's output will be scored, it is criteria.

## Menu is routing, not scoring

**Menu** and **Criteria** can look alike — both match a situation against a set of conditions — but they run at different times toward different ends.

- **Menu** picks a path forward, before any work happens: a closed set of options, plus what disambiguates one from another. Nothing gets scored; a choice just gets made.
- **Criteria** validates a finished output, after the work is done: a list of acceptance conditions the result either satisfies or doesn't.

A gateway's operation menu ("create, backfill, validate, implement, or manage?") is Menu. A rubric a judge grades a submission against is Criteria. Same shape — conditions matched against a situation — but one routes and the other verifies.

## Tone and Structure are the swappable pair

A section is **Tone** or **Structure** if you could replace it with a different one and change only how the agent sounds or how its response is laid out — never what it does or concludes.

`caveman` passes this test for both at once: switch it on and every decision the agent makes is identical, but the wording changes (Tone) and so does the layout — fragments instead of full sentences, no preamble (Structure). They're two different questions that happen to share one test, not one purpose:

- **Tone** answers *how does it sound* — register, word choice, degree of formality.
- **Structure** answers *how is the response shaped* — length limits, ordering, prose vs. list, headers.

That separability is the point — it is what lets a tone or a response format ship as a standalone, user-chosen set of instructions rather than being welded into the workflow that uses it.

A section titled _Voice_ is the usual place these two get conflated. "Voice" names the pair, not one half of it: register and word choice are Tone, while "tables over paragraphs" and "bold the key term, then define it" are Structure. Classify each rule by what it governs, not by the heading it sits under.

Note that Tone and Structure sections often _read_ like policy ("cap lists at five items", "no preamble"). Genre is set by what the rules govern, not their grammar. Rules governing manner or shape are Tone/Structure; rules governing what counts as correct work are Policy.

A persona is usually **not** pure Tone or Structure. Its Domain, Decisions, and Boundaries sections change what the agent concludes, not just how it sounds or how it's laid out — those are Reference and Policy. Only the delivery layer — Tone and Structure — is what a caller can delegate.

Any purpose here can also carry a different value depending on who consumes it — the axis is called Target, and it's independent of Purpose. See [Target](/agent-configuration/instruction-target/) for the full set of consumers and a worked example of combining purposes.

## Example is a delivery mode, not a purpose

An example — a worked instance, a few-shot demonstration, a sample passing/failing case — is tempting to add as its own purpose. It isn't one: an example always illustrates one of the purposes above, and inherits that purpose rather than having its own. An example of the steps to follow is Procedure; an example of a passing and a failing case is Criteria; an example of forbidden output is Policy. Classify what the example is an instance *of*, the same way a pointer inherits the purpose of whatever it links to.

## What about disciplines?

A discipline's content is a **policy**. What makes it a discipline is _when it loads_ — always on, selected by an event — which is a question for the Selection axis, not this one.

Strip the loading behavior from commit discipline and its body reads like any governance: one complete, independently revertable change per commit. Same genre, different scope.

## Related

- [Target](/agent-configuration/instruction-target/) — who consumes any purpose's output: the user, a subagent, a peer agent, or an artifact
- [Skills](/agent-configuration/skills/overview/) — the per-artifact Selection / Visibility / Effect axes
- [Governances](/agent-configuration/skills/governances/) — artifacts that are almost entirely Policy
- [Persona](/agent-configuration/skills/persona/) — where Tone and Structure separate from expertise
- [Gateway Skill](/agent-configuration/skills/gateway-skill/) — the clearest Menu example
- [Agent Configuration](/agent-configuration/overview/) — which file kinds carry these
