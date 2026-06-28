---
name: sdd
description: Use this skill when the user explicitly invokes SDD or wants to work on a creation artifact with Spec-Driven Development.
model: haiku
effort: low
---

# SDD

Gateway skill for Spec-Driven Development — the front door to the project. It **activates** SDD, gathers missing intent, classifies the requested action, and **routes** it to the handling capability, then hands the resolved work to the **conductor**. It is a **thin relay**: it holds **no production logic**, loads **no governance**, and writes no contract state. It does not edit project files, register hooks, install packages, or require a CLI command.

By default the gateway **spawns nothing** — it runs the conductor **in-session** (the operator role is the main session itself). It spawns the `sdd-operator` subagent **only** in the headless fallback (no live session). It carries the Council's answers down and the conductor's escalations up.

## Gateway intake

Treat `$sdd`, "use SDD", and "use Spec-Driven Development" as explicit activation. **Most** activating requests are CRs; classification decides which source carried it and which capability handles it. A task with **no suite-relevant behavior** is **not a CR** and escapes (below); recognition is the grill, so ambiguity routes *into* the lifecycle and is decided during explore.

### Surface pending strategy

When the Council re-enters, **surface the count of pending (unratified) strategy** — count the `strategy` lines with `"ratified": false` across the specs' sibling `*.log.jsonl` ledgers and state "N pending strategy" alongside the intake; if the Council picks it, route them to review those entries. The gateway only *surfaces* the count — it never **drafts** strategy (the Scanner's job) nor **ratifies** it (the Council's positional act). A zero count is not surfaced.

### Fast path — skip the menu

When the invocation already names **both** an artifact and an action — "implement the auth spec", "review X again", "dedupe these specs" — skip the menu and route directly through the Routing Table. A partially-specified request resolves what it can and asks only for the missing piece, within the four-option rule.

### Two-level menu — bare invocation

When `$sdd` is invoked with no work item, artifact, or action, do not guess. Conduct intake as a **two-level menu**, never a flat list. **Never ask more than four options** in a single `AskUserQuestion` (the tool rejects more than four). The top-level question presents **exactly four** options:

| # | Top-level option | Covers |
|---|---|---|
| 1 | **Create or backfill a spec** | start a new spec; detect new-vs-backfill by whether an implementation already exists for the named work |
| 2 | **Work on an existing spec** | route a CR against the project spec by what the user wants to do to it (grill / implement / revise) |
| 3 | **Manage the corpus** | dedupe overlapping specs, split a large spec, reconcile a contradiction, inspect the corpus |
| 4 | **Help me choose** | scan the spec + statuses, suggest the most-actionable few (≤ 4), let the user pick |

When a derived list would exceed four, present only the most-actionable few (≤ 4) or ask the user to name the target directly; never enumerate into an over-four question and never truncate silently.

## The routing table is the user-skill→capability index

Classification routes a request to the **capability** that handles it; the routing table doubles as the index of what a user can invoke (there is no separate `skills.md`).

| User intent | Capability (handler) |
|---|---|
| Raise / record a change | **intake** — open a CR through a source |
| Grill a CR into spec + suite deltas; review the diff at the spec gate | **authoring** (owns the spec gate) |
| Implement + verify against the acceptance suite, then land it | **mission** (owns the impl gate + handoff; the autonomous orchestrator) |
| Dedupe, split, reconcile, or inspect the corpus | **corpus** |
| Zoom into one inner-loop agent (live) / durably tune one | **inject** / **project** |
| A task with no suite-relevant behavior (not a CR) | **escape** — proceeds outside the lifecycle, leaves no SDD record |
| Product / structure / process retrospective, or field corrections | the **campaign / formation / doctrine / forge** loop — emits a new CR |

One project is one spec — routing classifies *what a user wants to do to the project*, never *which spec in a fleet*.

## Hand the work to the conductor

When the route resolves, hand the work to the **conductor** — the operator role run in the main session.

- **Default (a live session hosts the conductor): spawn nothing.** The authoring, validation, and mission stations are stations the conductor runs **in-session**; the cold judges + impl-producer builder are spawned later by the conductor itself (depth 1). The conductor holds the user channel directly — the grill and every escalation happen in-session, at the autonomy bar (a gate go/no-go, or a scrub kill).
- **Headless fallback (no live session — an unattended scheduler or a multi-CR fan-out): spawn the operator and relay.** Spawn `sdd-operator` as a subagent for the segment; relay each `STATUS: needs-input` (batched `QUESTIONS`) to the Council, re-spawn with the answers, and repeat until `complete` / `blocked`. The spawned operator has no user channel and never asks the Council directly.

**Write-ownership is preserved in both modes.** The gate station owns the `status` write and the human ratification of `approval` — the in-session conductor performs it directly by default; in the headless fallback the in-session relay position performs it on a returned verdict packet. The gateway-as-relay writes neither, and never writes `aligned`.

## Recognize the escape and the freeze

- **Escape.** A task that is **not a CR** — no suite-relevant behavior — escapes: state that the work is leaving the lifecycle, create no draft, invoke neither gate, and **write no record** (a non-CR is not SDD's to track; a spec-prose-only change is already in git). Recognition is the **grill + impact analysis**, not a gateway classifier; ambiguity defaults *into* the lifecycle and is decided during explore.
- **Freeze.** SDD freezes the `.feature` at approval. A request to change a frozen scenario is **not** edited in place; it re-enters as a CR routed back through **authoring**, which grills the spec open before scenarios may be revised.
