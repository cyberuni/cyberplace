---
status: approved
type: feature
blocked-by:
  - sdd-orchestrator
  - sdd-provenance
  - sdd-plugin
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
---

# SDD Doctrine Loop — the Strategist outer loop

---

## What

The **outer loop** of the SDD model — the one the framework does not yet have. It is owned by the **Strategist** actor and run by its delegate, the **Scanner in the Bunker**: a fleet-level agent that watches every spec reach a terminal state, drafts **strategy** (forward recommendations to revise governances, conventions, and skills), and surfaces it to the human **Council**, who hold the keep-or-cut. Ratified, that strategy re-tunes the **doctrine** and grows the **corpus**. It fires at **lifecycle granularity, not per-gate**.

```mermaid
flowchart LR
  impl[spec → implemented] --> scan[Scanner · Bunker]
  dep[spec → deprecated] --> scan
  scan -->|drafts, cheap, continuous| strat[strategy<br/>logged to the combat log]
  strat -->|surfaced episodically| council([Council · keep-or-cut])
  council -->|ratified| doc[(re-tune doctrine<br/>grow corpus)]
```

---

## Why

Today SDD learns nothing across products. The orchestrator records a producer only on conflict; the corpus (skills, governances, conventions) is revised only by hand, ad hoc. The motive-model names this as the **Strategist** gap (the outer loop, "Strategist and the loop"):

- **Lessons don't compound.** A pattern solved three times, a correction repeated across missions, a now-false convention — nothing distills these into doctrine so the next mission starts warmer.
- **The trigger must be lifecycle-grained.** Firing the outer loop every gate is *premature codification* (motive-model:312) — it encodes transient noise. The real triggers are a spec that **ships** (`→ implemented`) or is **killed** (`→ deprecated`), a milestone retro, or a recurring pattern.
- **Detection and decision must split** (motive-model:314): the delegate *watches continuously and drafts* (cheap); the human *keeps or cuts* (accountable, high-blast-radius).

---

## Design decisions

### The Scanner is fleet-level, not inside the orchestrator

The Scanner sits **above any single spec** — in the Bunker — because doctrine serves every spec (and every tool), not one mission. It is **not** a step inside the Operator/orchestrator: that flow is per-segment, and a per-segment outer loop is exactly the premature codification the model forbids.

The Scanner is its **own subagent** running the doctrine loop — exactly parallel to the Operator running the mission loop. Both are delegates: the Operator delegate runs the middle loop per segment; the Scanner delegate runs the outer loop at lifecycle granularity.

### It watches terminal transitions, it does not write them

The Scanner observes the transitions written elsewhere — `→ implemented` (by `validate-spec` at the impl gate) and `→ deprecated` (by the deprecation path). It never writes lifecycle status; it reacts to it.

### Detection and drafting by the delegate; keep-or-cut by the human

The Scanner drafts **strategy** cheaply and continuously and records it to the **combat log** (the provenance record from `sdd-provenance`: `produced-by` + `approval`). It **accumulates** strategy and surfaces it **episodically** — at a retro, on demand, or when a threshold piles up — never synchronously blocking a mission. **No strategy enters the corpus without the Council's ratification.**

### The Scanner is the sole writer of strategy entries

The Scanner is the **sole writer** of `strategy` log entries. The orchestrator and the producers never write them — the orchestrator owns `report` and `correction` entries (and the current-state face), the producers write nothing to the log at all. The **shape** of a strategy entry — its fields and schema — is owned by `combat-log-governance`; this spec does not restate it.

- **When it writes.** After it drafts strategy from any of the five use cases — a terminal transition (ship or kill), a milestone retro, a recurring pattern, or drift detection. The log is an **append-only ledger**: the Scanner appends a new entry with the next sequence; it never edits or removes a prior one.
- **What it writes.** A strategy entry carrying the recommendation plus the corrections-with-cause / evidence that drove it, with the entry **unratified** until the Council rules. Unratified strategy never enters the corpus (consistent with the "Strategy → doctrine → corpus" and "keep-or-cut by the human" decisions, and with the existing scenarios).
- **Where it lands.** In the combat log of the spec the strategy is *about*. For the ship, kill, and pattern-from-a-single-spec cases that is unambiguous — the entry lands in that spec's log. For cross-spec cases (milestone retro, recurring pattern read across N specs, drift) the entry lands in the combat log of the spec the strategy most directly applies to (the milestone's anchoring spec, the spec where the pattern most strongly recurs, or the spec carrying the now-false convention) so that every strategy entry has one unambiguous home in the ledger.

### Two history channels: combat log (contract) vs raw transcripts (enrichment)

The Scanner reads **persisted artifacts post-hoc** — it never accesses live subagent context. (Subagents only return their final message upward, and the Scanner always fires *after* a mission ends, so post-hoc file reading is the right model.) There are two channels, and only one is the contract:

| Channel | Role | Properties |
|---|---|---|
| **Combat log** | **PRIMARY input — the contract** | Structured, durable, harness-agnostic (per `sdd-provenance`). Strategy is drafted from it. |
| **Raw `.jsonl` transcripts** | **OPTIONAL enrichment** | Per-session / per-subagent files on disk, harness-specific. Adds detail but is **never** the contract. |

Strategy is draftable from the combat log **alone** — raw transcripts are additive, never required. The Scanner depending on a harness-specific transcript format would couple doctrine to a harness; it must not.

### Efficiency analysis is transcript-backed and threshold-gated

Beyond correctness/pattern strategy, the Scanner analyzes how much context a mission consumed and drafts **efficiency strategy** — recommendations to cut token waste (context bloat, repeated re-reads, redundant tool calls, oversized payloads). This dimension is the **deliberate, concrete use of the optional transcript channel** above:

- **Transcript-backed — the acknowledged exception.** Efficiency analysis reads the raw `.jsonl` session/subagent transcripts, **not** the combat log. The token-usage breakdown (per-message context growth, per-tool cost) is recorded by the harness in those transcripts; subagents do not readily self-report their own token cost into the combat log. So this is the one dimension that does **not** satisfy "strategy is draftable from the combat log alone" — that invariant still holds for every **other** dimension (correctness, pattern, drift); efficiency is **opt-in and transcript-backed**. The combat log stays PRIMARY for all non-efficiency strategy, and **no token-cost fields are added** to the combat log / provenance — that channel decision is settled and out of scope here.
- **Threshold-gated — it does not run every cycle.** The analysis is heavy, so it runs only when warranted: gated by a **configurable bound** (a mission/session whose total token cost exceeds the configured limit) **or** on explicit demand (a retro). No numeric threshold is baked in — the bound is configured at runtime. The cheap, continuous drafting of the other dimensions is **unchanged**; only this dimension is gated.
- **Ordinary strategy entries.** Efficiency strategy is recorded as a `strategy` log entry like any other — **unratified** until the Council rules, append-only, sole-written by the Scanner. The existing strategy-write rules apply unchanged, and the entry shape is owned by `combat-log-governance` (not restated here).

### Recurring-pattern detection is contract-via-provenance

Recurring-pattern detection (use case 4) **requires the combat log to record corrections-with-cause in a matchable form** — so the Scanner can read corrections across N specs' combat logs, group them, and count. This is a Scanner **input requirement on the combat log**, i.e. a dependency on `sdd-provenance` (already in `blocked-by`).

This spec declares only **what the Scanner needs to read**. It does **not** design the combat-log schema; that expansion belongs to `sdd-provenance` as a separate revision.

### Strategy → doctrine → corpus

Three distinct things, by time-direction:

- **Strategy** — the Scanner's *forward* output: a recommendation ("codify this pattern, prune that convention"). Situational, drafted every cycle, transient until ratified.
- **Doctrine** — the *principles* layer: codified operating rules ("how we operate"). Ratified strategy re-tunes it.
- **Corpus** — the *full durable body* every other delegate reads from: skills, governances, conventions, templates, plugins. Doctrine is its principles slice; ratified strategy grows it.

Provenance/registry resolution stays live and authoritative for *who acts next*; the corpus is the *accumulated knowledge*, not the resolver.

### The gateway surfaces pending strategy

The `sdd` gateway — where humans re-enter SDD — **surfaces** "N pending strategy" as an entry point. The Scanner detects and drafts; the gateway is how the Council is brought to the keep-or-cut.

### It prunes drift

Beyond codifying what works, the Scanner detects **drift / staleness** — a now-false convention, a contradiction between governances — and drafts a prune. This is the double-loop *revision* mode, the Strategist's distinctive act.

---

## Use cases

A **use case** is an entry-point: a trigger plus its inputs and intent — coarse, and it lives here in `spec.md`. A **scenario** is a boolean Given/When/Then assertion — fine, and it lives in the `.feature`. One use case maps to one-or-more scenarios: the use cases make the trigger→input mapping explicit, while the `.feature` stays the boolean acceptance layer.

| Use case | Trigger | Inputs | Intent |
|---|---|---|---|
| **Spec ships** | `→ implemented` (the impl gate writes it) | the finished spec + its combat log (**PRIMARY**) + *[optional]* raw session/subagent transcripts (enrichment) | draft strategy from a successful mission |
| **Spec killed** | `→ deprecated` (the deprecation path writes it) | the dead spec + why it failed, from its combat log (**PRIMARY**) + *[optional]* raw transcripts | draft strategy from the failure |
| **Milestone retro** | a human-held retro event | the set of specs completed in the milestone (their combat logs) | draft strategy across the milestone |
| **Recurring pattern** | the same correction recurs across missions | corrections-with-cause read across N specs' combat logs, grouped and counted | draft strategy to codify the pattern |
| **Drift / staleness** | a now-false convention or a governance contradiction detected | the corpus (conventions, governances) | draft strategy to prune |
| **Token-waste analysis** | the mission/session token cost exceeds a configurable bound, **or** an on-demand retro request | the mission's raw `.jsonl` session/subagent transcripts (the harness token-usage breakdown) — **not** the combat log | draft efficiency strategy to reduce token waste |

---

## Command surface / API

| Concern | Behavior |
|---|---|
| Trigger | `→ implemented`, `→ deprecated`, milestone retro, recurring pattern — **never per-gate** |
| Output | **strategy** (forward recommendations) recorded to the combat log; surfaced via the gateway |
| Decision | the Council holds keep-or-cut; no strategy enters the corpus unratified |
| Effect | ratified strategy re-tunes the **doctrine** and grows the **corpus** (skills, governances, conventions, templates) |

---

## Related

- `artifacts/specs/motive-model/spec.md` — "Strategist and the loop"; the three loops; this spec is the **outer** one
- `artifacts/specs/sdd-provenance/spec.md` — the combat log (`produced-by` + `approval`) strategy is recorded to
- `artifacts/specs/sdd-orchestrator/spec.md` — the middle-loop Operator the Scanner sits above, not inside
- `artifacts/specs/sdd-mission-loop/spec.md` — the middle loop, for contrast

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-doctrine-loop/spec.md` |
| Scenarios | `artifacts/specs/sdd-doctrine-loop/sdd-doctrine-loop.feature` |
