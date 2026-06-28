# Research — "process" vs "workflow", and SDD vs Anthropic's agentic workflow

> Background survey behind [ADR-0011](../../../../artifacts/adr/0011-sdd-process-vs-agentic-workflow.md)
> and the `## What SDD is` positioning in `.agents/specs/sdd/spec.md`. Not loaded via the CLI.

## Question

Two questions, one decision:

1. The per-project "how we work this project" slice (conventions, gate tuning, CI, commit
   discipline, layout strategy) needs a name. Candidate words: **process** vs **workflow**. Are
   they interchangeable? Which does academia prefer, which does the industry/agentic ecosystem
   prefer?
2. SDD's runtime looks a lot like Anthropic's **agentic workflow**. Are we the same thing? If so,
   what (if anything) makes SDD distinct, and how should the spec state it?

## Findings

### "process" and "workflow" are not interchangeable — they differ by altitude and by domain-claim

**Academic / standards — `process` is the umbrella, `workflow` is a subset.** In the Business
Process Management literature (van der Aalst, the field's anchor), **Workflow Management (WFM)** is
the older, narrower thing — *automation of a process* — and **Business Process Management (BPM)** is
the superset: automation *plus* analysis, operations, and the organization of work. Software-
engineering standards line up the same way: CMMI, ISO 9001, ISO/IEC 90003 all speak in terms of
**"software process," "process improvement," "process maturity."** `process` is the high-altitude
word for *how work is done*; `workflow` is the automated slice of it. (One survey notes the field
uses process, workflow, *and* practices inconsistently — but `process` is the umbrella every time.)

**Industry / agentic — `workflow` is hot, but already claimed.** This is the sharp one. In the
agentic ecosystem, **"workflow" is a term of art**: Anthropic's *Building Effective Agents*
canonically splits **workflows** (LLMs + tools on *predefined code paths* — deterministic) from
**agents** (the LLM *dynamically directs its own process*). "Agentic workflow" is the buzzphrase,
and it names *the orchestration pattern*. In an agents/skills repo, naming a methodology file
`workflow.md` collides head-on with that distinction. The same sources use **"process" loosely and
safely** ("agents direct their own *processes*", "the *process* of coordinating agents").

So the two camps diverge differently, and both point the same way for naming a methodology slice:
`process` is the umbrella (academia) and the unclaimed word (agentic industry).

### SDD vs Anthropic's agentic workflow — same domain, one altitude up

Anthropic's workflow catalog is prompt-chaining, routing, parallelization, **orchestrator-workers**,
and **evaluator-optimizer**. SDD's runtime *is* those patterns:

- **orchestrator-workers** = the conductor spawning cold judges + the impl-producer builder.
- **evaluator-optimizer** = the producer ↔ cold-judge grill loop (iterate until the judge passes).
- **routing** = the gateway classifying a request and loading the matching skill.

So on the workflow-vs-agent axis, SDD's *macro* structure sits on the **workflow** side — with
agentic workers reasoning dynamically at the leaves (the grill, building impl). SDD chose structure
on purpose: that is where freeze, provenance, and auditability come from.

**But SDD is more than an agentic workflow.** Anthropic's workflows are ephemeral single-task
automations: run the chain, get output, done. SDD wraps that runtime in a durable **spec corpus**, a
**lifecycle** (draft → approved → implemented + freeze), **human gates and ratification**, and
**governance**. That governing layer is a *methodology* — the BPM / software-process altitude.

### The reconciliation — two altitudes, not two rival words

`process` (academia) and `workflow` (Anthropic) were never competitors. They name two layers:

| Layer | Word | In SDD |
|---|---|---|
| Governing methodology — *what SDD is* | **process** | the lifecycle, gates, governance, the doctrine ("Process") loop, the per-project methodology slice |
| Runtime orchestration — *how SDD runs* | **workflow** | the Mission Loop engine: orchestrator-workers + evaluator-optimizer |

One-line positioning:

> **SDD is a spec-governed *process* (methodology) whose *runtime* is an agentic *workflow*
> (orchestrator-workers + evaluator-optimizer).**

This is why `process` names the doctrine loop and the per-project methodology slice, while
`workflow` is reserved for the engine — and why naming a per-project policy file `workflow.md` would
be an altitude mismatch in the one repo where the distinction is load-bearing.

## Decision (recorded in ADR-0011)

- The per-project "how we work" slice is named **process** (`## Process`, extracted to a sibling
  `process.md` only when it grows — same optionality rule as `<unit>.solution.md`). Not `workflow`.
- `workflow` stays available to describe the **runtime engine** (the Mission Loop).
- The spec's `## What SDD is` states the positioning: a governed process whose runtime is an agentic
  workflow, distinct from Anthropic's ephemeral agentic workflow by the durable spec corpus +
  lifecycle + gates + governance.

## Sources

- [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Orkes — Agentic AI: Agents vs Workflows](https://orkes.io/blog/agentic-ai-explained-agents-vs-workflows/)
- [van der Aalst — Business Process Management: A Comprehensive Survey (Wiley, 2013)](https://onlinelibrary.wiley.com/doi/10.1155/2013/507984)
- [Capability Maturity Model Integration (CMMI) — Wikipedia](https://en.wikipedia.org/wiki/Capability_Maturity_Model_Integration)
