# doctrine/ — the process outer loop

The **Doctrine loop** (metaphor) / **Process loop** (descriptive) — the step-5 outer loop that
evolves **how we work**: strategy, workflow, conventions. Actor: the **Strategist**. Run by its
delegate the **Scanner in the Bunker** (`sdd-scanner`), parallel to the Operator that runs the
inner mission loop. It fires at **lifecycle granularity, never per-gate**.

Standing subject: **the process — `design/`** (the methodology and its rules), and the broader
corpus of skills, governances, and conventions that doctrine is the principles slice of. The
Scanner watches every spec reach a terminal state, drafts **strategy** (forward recommendations
to revise governances, conventions, skills), and surfaces it to the human **Council** for
keep-or-cut.

## Detect-and-draft vs keep-or-cut

| Half | Holder | Cost | Effect |
|---|---|---|---|
| **Detect and draft** | the Scanner delegate | cheap, continuous, non-blocking | drafts **unratified** strategy |
| **Keep or cut** | the human Council | accountable, high-blast-radius | ratify → strategy re-enters as a CR; cut → it stays out |

The Scanner is the **sole writer** of `strategy` entries; the operator (`report` / `correction`)
and the producers (nothing) never write them. **No strategy enters the corpus without the
Council's ratification.**

## Output — emits new CRs

The Scanner drafts strategy to the combat log and **accumulates** it, surfacing it
**episodically** — at a retro, on demand, or when a threshold piles up — never synchronously
blocking a mission. The `gateway/` surfaces the **count of pending (unratified)
strategy** when the Council re-enters; that is the entry point to keep-or-cut. On **ratify**,
the strategy re-enters as a **new CR** (`intake/README.md`) that re-tunes the
**doctrine** (`design/`) and grows the corpus; on **cut**, it stays unratified and absent.

The Scanner **observes** the terminal transitions; it **never writes** spec `status`.

## Triggers — the six use cases

A single gate passing is **not** a trigger. The loop fires only at the lifecycle granularity
below:

| Use case | Trigger | Input | Drafts |
|---|---|---|---|
| **Ship** | `→ implemented` (the impl gate writes it) | the finished spec's combat log (**PRIMARY**) + *[opt]* transcripts | strategy from a successful mission |
| **Kill** | `→ deprecated` (the deprecation path writes it) | the dead spec's combat log — why it failed (**PRIMARY**) + *[opt]* transcripts | strategy from the failure |
| **Milestone retro** | a human-held retro | the milestone's specs' combat logs | strategy across the milestone |
| **Recurring pattern** | the same correction recurs across missions | corrections-with-cause across N specs' combat logs, **grouped + counted by `cause`** | strategy to codify the pattern |
| **Drift / staleness** | a now-false convention or governance contradiction | the corpus (conventions, governances) | a **PRUNE** strategy |
| **Token-waste** | mission/session token cost over a **configurable bound**, **or** on-demand retro | the mission's raw `.jsonl` transcripts — **not** the combat log | efficiency strategy |

## Inputs — combat log (contract) vs transcripts (enrichment)

The Scanner reads **persisted artifacts post-hoc** — never live subagent context.

- **Combat log** — PRIMARY input, the contract. Strategy is draftable from it **alone**; raw
  transcripts are additive, never required.
- **Raw `.jsonl` transcripts** — optional enrichment, harness-specific. The **sole exception**
  is the token-waste dimension, which is transcript-backed (the token-usage breakdown lives only
  in transcripts) and **threshold-gated** — it runs the heavy analysis only over the configurable
  bound or on demand, never under the bound without an on-demand request. No numeric threshold is
  baked in; **no token-cost field is added** to the combat log.

## Where each strategy entry lands

In the combat log of the spec the strategy is **about**, so every entry has one unambiguous
home: ship / kill / pattern-from-one-spec → that spec's log; milestone retro → the milestone's
anchoring spec; recurring pattern across N specs → the spec where the pattern most strongly
recurs; drift → the spec carrying the now-false convention. Every entry is **unratified** and
carries its **driving evidence** (the corrections-with-cause that drove it); the ledger is
append-only — the next `seq`, never an edit. The entry **shape** is owned by
`design/provenance-model.md` and is not restated here.

## Strategy → doctrine → corpus

Three distinct things, by time-direction: **strategy** is the Scanner's *forward* output
(situational, transient until ratified); **doctrine** is the *principles* layer (`design/`,
re-tuned by ratified strategy); the **corpus** is the *full durable body* every other delegate
reads from (skills, governances, conventions, templates), which ratified strategy grows.

## Boundaries — Doctrine owns the process only

It routes out-of-loop requests: a build-or-deprecate request → `campaign/`; a structure
observation → `formation/`; a harness pain point → `forge/`. Doctrine grows *how we work* and
nothing else.

## Scenarios

Unit scenarios for the loop colocate in this folder; cross-capability outcome scenarios (a
ratified strategy re-tuning doctrine end-to-end) live in `acceptance/`.
