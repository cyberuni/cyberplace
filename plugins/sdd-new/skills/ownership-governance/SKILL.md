---
name: ownership-governance
description: "Internal skill: the SDD write-ownership contract — who may write each spec.md frontmatter field and artifact, plus the freeze write-constraint. Loaded by every SDD producer, judge, the conductor, and the start-mission/validate-spec skills. Not triggered by users directly."
user-invocable: false
---

# SDD Ownership Governance

Who may write what. Every act in the SDD workflow has a write leash; this skill is the canonical
matrix. The field definitions are in `sdd:lifecycle-governance`; the legality of the resulting state
is in `sdd:gate-validation-governance`; the plan/ledger write split is in `sdd:combat-log-governance`.

## Write-ownership matrix

| Field / artifact | Written by | Never written by |
|---|---|---|
| `status` | the gate skill (`validate-spec`) — on a human verdict, or to match a conductor self-assertion within leash | the conductor, any producer |
| `strategy` (run-level leash + approach) | the **conductor** (initial evaluation) | producers, the gate skill |
| `approval` **self-assertion** (`verdict: approve`/`pause` + `by: agent`/none + `why`) | the **conductor** (synthesis only) | producers, the gate skill |
| `approval` **human ratification** (`verdict: approve`/`reject` + `by: <name>`) | the gate skill (`validate-spec`), **in-session position only** | the conductor, any producer, any spawned delegate |
| `aligned` | the **conductor** (synthesis only) | producers, the gate skill |
| `artifact-types` | `start-mission` (classifies the artifact-types at scaffold; the resolution axis) | producers, judges, the conductor, the gate skill |
| `<!-- open: -->` markers | the **conductor** | producers (they *emit gaps*, not markers) |
| `produced-by` map | the **conductor** (records the resolved producer per role at production); `start-mission` (records the user's choice for a contested artifact-type) | producers, judges, the gate skill |
| `domain-plugin` map | the **conductor** (or `start-mission` for a contested artifact-type) | producers, judges, the gate skill |
| combat-log `report` / `correction` lines | the **conductor** (append-only, to the plan's `*.log.jsonl`) | producers, judges, the gate skill |
| ledger `gate` line — self-asserted (`by: agent`) | the **conductor** (append-only, to `ledger.jsonl`) | producers, judges |
| ledger `gate` line — human-ratified (`by: <name>`) | the gate skill (`validate-spec`), **in-session position only** | the conductor, producers, judges |
| ledger `strategy` lines | the doctrine-loop Scanner (append-only) | the conductor, producers, judges |
| `spec.md` body + the `.feature` | the **spec-producer** | the conductor, judges, solution/impl producers |
| `<unit>.solution.md` | the **solution-producer** | the spec-producer, judges |
| plan brief + `todos` | the **conductor** | producers, judges |
| implementation + its verification | the **impl-producer** | the impl-judge (it *runs*, never authors) |

## Producer write boundary

A **spec-producer** writes the `spec.md` body and the `.feature` only. It must **not** write the
control frontmatter (`status`, `aligned`, `artifact-types`, `domain-plugin`). A required input it
cannot supply or infer is returned as a `CONTENT_GAP` — the conductor turns it into an
`<!-- open: -->` marker. Producers do not write markers directly.

The **conductor** writes `<!-- open: -->` markers, `aligned`, the run-level `strategy` block, the
`produced-by` map, and — when it self-asserts a gate within the effective leash — the provisional
`approval.<gate>` entry (`verdict: approve` + `by: agent` with the `why` derivation; a halt is
`verdict: pause` with its `why` and no `by`). There is no `leash` field in the entry — the leash is
the run-level `strategy`. The **gate skill** writes `status` (on a human verdict or to match the
conductor's in-leash self-assertion) and the human ratification of `approval` (rewriting `by: agent`
→ `by: <name>`).

**Ratification authority is positional.** A human-attributed gate write — `status → approved |
implemented`, a verdict carrying `by: <name>`, the human-ratified ledger `gate` line, and the freeze
— belongs to the **in-session position** that holds the real user channel. By default this is
trivially satisfied: the **conductor is the main session**, so the position that grills *is* the
position that ratifies. The rule bites only in the **headless / fan-out fallback**, where the
automaton runs as a **spawned subagent** with no user channel: it then writes only `by: agent`
self-assertions and `pause` halts, and on a human gate emits a verdict packet and stops — it never
writes a human ratification, **even when a coordinator relays "the user approved"** (a relayed claim
is not user confirmation). This is positional, not definitional: the same conductor definition run
in-session may perform the write. A self-assertion is **provisional**: the act is delegable, the
accountability is not — the human ratifies the trail. No role writes outside the spec it owns or
spawns specs on its own.

## Freeze (write constraint)

**Never write a frozen `.feature`.** Once a `.feature` carries its `@frozen` tag, no role — producer,
judge, solution-producer, or conductor — may add, remove, or rewrite its scenarios. A discovered gap
that requires changing specified behavior is a `BLOCKER` returned upward (the file must unfreeze and
its layer revert to `draft` — the gate/skill decides), never an in-place edit. The matching lifecycle
rule (what freezing *means* as a state) is in `sdd:lifecycle-governance`.

The freeze binds the **contract only** (`spec.md` + the `.feature`). The combat log (the plan's
`*.log.jsonl`) and the durable `ledger.jsonl` are **exempt**: they are operational provenance, never
frozen, and the conductor and Scanner keep appending within their boundaries above even while a file
sits `@frozen`.

A judge — spec-judge or impl-judge — must not modify `spec.md` or the `.feature`: it reports, it does
not patch.
