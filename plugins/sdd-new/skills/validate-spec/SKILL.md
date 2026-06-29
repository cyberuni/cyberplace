---
name: validate-spec
description: "Internal skill: the SDD spec gate (Draft → Approved) — the verdict on a CR's spec + suite diff, freezing each touched .feature on approve. Run by the conductor (start-mission) inside the mission loop; not triggered by users directly."
user-invocable: false
---

# validate-spec

Run the SDD **spec gate**: the verdict on a CR's spec + suite **diff** before it becomes the
contract. This is an **internal step the conductor runs inside the mission loop** (loaded by
`start-mission` at the end of explore), **not** a user-invocable skill. It **spawns a distinct
cold spec-judge**, derives the **leash**, takes the verdict (the in-session conductor holds the user
channel, so it is the positional ratifier), and on approval **freezes** each touched `.feature` file
and records a durable per-CR `gate` line. The impl gate (Approved → Implemented) is **not** here — it
is the mission's. This skill never collapses producing and judging into one voice.

Load `sdd:lifecycle-governance` (status enum, transitions, the freeze state-transition),
`sdd:ownership-governance` (who may write `status` / `aligned` / `approval`),
`sdd:gate-validation-governance` (legal-state tuples, `aligned` layer-scoping, `approval`
attribution). The `produced-by` and `ledger.jsonl` shapes the gate checks are in
`../../design/provenance-model.md`; the freeze model in `../../design/lifecycle-model.md`; the
self-clear-vs-escalate bar and the four-C floor in `../../design/autonomy-rubric.md`.

## 1. Structural checks (deterministic, run first)

Run before any verdict work; structural validity **fails closed**, availability only **flags**:

```bash
node "<skill>/scripts/check-spec-state.mts" [--root <specs-dir>]
```

Exit `0` = legal; exit `1` prints each violation as `✗ <slug>: <reason>` — fix before continuing.
It checks the root lifecycle tuple **and** the per-node `spec-type` reconcile: a `reference` node
carrying a `.feature` or missing its `## Subject`, and a `behavioral` node missing `## Use Cases`,
**fail closed**; a descriptive node (no marker) raises no violation. If `node` is unavailable,
perform the same checks by reading each README's frontmatter yourself.

**Provenance structural checks** (`../../design/provenance-model.md`). Read the touched files'
`produced-by` frontmatter and the root's `ledger.jsonl`:

- **Malformed `produced-by` entry** — a value that is not a well-formed plugin-qualified name
  (`<plugin>:<agent>`) → **flag and fail closed**.
- **Uninstalled-but-valid recorded producer** — an entry whose plugin is not installed is valid
  history → **flag only** (annotate `[unavailable]`), do not block.
- **No resolvable producer** — a required production role that resolves to neither a plugin agent
  nor an SDD default → **fail closed**.

The gate stays verdict-only — it writes **no** setup frontmatter to resolve any of these.

## 2. Identify the CR's diff footprint

The gate decides a **CR**, not a single folder: resolve the set of files this CR **touched**
(the spec READMEs + `.feature` files in its delta). The digest and freeze both operate over this
footprint, never the whole tree and never one fleet-era folder.

## 3. Judge and derive the leash

Resolve the **spec-judge** for each `artifact-types` (a plugin judge or the SDD default
`sdd-spec-judge`) and **spawn it cold** over the touched node(s) — pass it `spec.md` + the
`.feature` only (the solution stays out of its view). It grades against the spec-gate lens set
**{oracle, builder, architect}**. Then synthesize `aligned` and **derive the leash** (the
assessment in `../../design/autonomy-rubric.md`) in-session. Collect the judge's `STATUS`,
`ALIGNED`, failing scenarios, remaining `<!-- open: -->` markers, `OBSERVATIONS`, and the gate
report. The judge is a **distinct cold actor** and never edits the artifact it grades.

**Never advance** — by self-assertion or human verdict — with judge failures, any remaining open
markers, or a misaligned suite. They fail the confidence dimension, so they forbid self-assertion
too; report the blockers for the user to fix (surface `OBSERVATIONS`; on accept they become a new
node, never a marker grown into this spec).

## 4. Take the verdict — self-assert within leash, else the human

- **In leash** (every dimension reads safe): the conductor **self-asserts** — writes
  `approval.spec: { verdict: approve, by: agent, why }` and `aligned`. The diff lands
  **provisionally** into the asynchronous review queue. Still emit the digest + gate report,
  flagged **"agent-asserted — ratify or kick back."**
- **Gated** (the leash stops, or the hard floor fires): present the **digest** above the gate
  report so the human sees what they are deciding, then take the human verdict
  (`approve` / `change` / `reject`).

**Hard-floor escalations at this gate** (`../../design/autonomy-rubric.md`): **Clearance** — a
narrowing (weakening or deleting an e2e scenario), escalated unless the CR pre-authorized it; and
**Compatibility** — the change's semver class exceeds the authorized change-class ceiling.
**Conflict resolution** cases (a contradiction inside the suite) are surfaced here but formally
fire at the impl gate; **Consent** never fires at authoring. Everything additive / internal / minor
self-clears.

## 5. Apply the verb + freeze

| Verb | Action |
|---|---|
| **approve** | land the diff; **freeze** each touched `.feature` (set its own `@frozen` tag); append a per-CR `gate` line to `ledger.jsonl` (`verdict: approve`, `frozen[]`, keyed by `cr`); write `status: approved` |
| **change** | revise the diff; **nothing freezes**; stays `draft` |
| **reject** | scope-kill — drop the delta; nothing freezes |

**Freeze is per `.feature` file.** Each touched file hard-freezes via its `@frozen` tag; untouched
files keep their state. An **additive** scenario folds into a frozen file without unfreezing it
(self-clears); a **narrowing/rewriting** edit unfreezes its file and fires **Clearance**. `spec.md`
/ the node READMEs are **kept aligned, never frozen** — editable, but may not contradict a frozen
scenario (enforced by the alignment check and the judge, not a flat freeze). Vocabulary is
**freeze/unfreeze**; "lock" is the concurrency layer.

**Attribution.** A **human verdict** writes `approval.spec: { verdict: approve, by: <name> }` (no
`why`) — only the in-session position may write this. A **self-assertion** already wrote
`by: agent, why`; this skill only writes the matching `status`. **Ratifying** a queued
self-assertion rewrites `by: agent` → `by: <name>` and drops it from the queue. Re-run the state
check after any write to confirm the tuple is legal.

## The gate digest (folded in-session)

Assemble the **digest** inline (no spawned skill) — a read-only, decision-free summary so a
ratifier sees *what* they are approving. It covers **only the CR's touched files**, aggregated;
a touched area with **no** `.feature` reports **zero scenarios, not an error**. It **writes
nothing, advances no status, renders no verdict**. Fixed sections:

| Section | Source |
|---|---|
| **CR** | the `cr` id + its what/why |
| **What** | the `## What` line of each touched capability's README |
| **Status** | the spec's `status` |
| **Scenarios** | added / modified / **narrowed** `Scenario:` names across the touched `.feature` files; a narrowing is flagged |
| **Key decisions** | the `### ` headings under `## Design decisions` in the touched prose |
| **Open items** | every `<!-- open: ... -->` marker in the touched files |

## Report

- PASS / FAIL per lens, relayed from the judge
- `ALIGNED: true | false`; if false, which artifacts are out of sync
- Open markers / failing scenarios still blocking, if any
- The leash derivation and the effective leash for this gate
- On success: the new `status`, the approver (`agent` = provisional, in the review queue; `<name>` =
  ratified), and which `.feature` files were frozen

Do not fix issues automatically — report them for the user to address or confirm intent.
