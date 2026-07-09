---
name: provenance-model-durability-sync
status: active
todos:
  - content: "sync design/provenance-model.md: add the correction-line durability record model (gate-iteration line before the why + finalize backstop), consistent with the frozen conductor.feature + combat-log-governance"
    status: pending
  - content: "spec gate: design doc has no .feature — run the mechanical checks (referenced-artifact --base HEAD + structure) + a judge pass only if a behavioral node is touched; keep it a prose sync"
    status: pending
  - content: "formation pass: run sdd:manage 'audit the corpus structure' (referenced-artifact-escalation + d2 both touched the spec tree); file/self-clear findings"
    status: pending
  - content: "handoff: root pnpm verify, land"
    status: pending
---

# provenance-model-durability-sync — two follow-ups from the d2 + ref-escalation missions

Target spec: `sdd` (`plugins/sdd`). Both source missions LANDED on `main`; these are their unfiled
follow-ups, surfaced by the cold judges.

## Scope
1. **Doc sync (the CR-shaped one).** `.agents/specs/sdd/design/provenance-model.md` is the doc that
   `common-governances/combat-log/README.md`'s Boundary bullet names as owning the **record + entry-shape
   model + rationale**. The d2 mission added the **correction-line durability** discipline (a
   judge-reject→fix→pass self-assert appends a discrete combat-log `correction` line — `correction-kind:
   judge-iteration` + matchable `cause` — *before* the gate `why`; a finalize backstop writes an unflushed
   correction at mission end, **creating the combat log if absent**; the forced line stays a combat-log
   `correction`, never a ledger line — tier split invariant; no enum edit). That discipline is currently
   invisible in `provenance-model.md`. Sync it there, consistent with the already-landed frozen material.
2. **Formation pass (on-demand chore, not a CR).** Two CRs touched the spec tree this cycle
   (`referenced-artifact-escalation`, `d2-correction-line-durability`) — a corpus-wide formation pass is due.

## Resolved decisions (do not relitigate)
- The no-log minimum-footprint line is a **combat-log `correction` created on demand at finalize**, NOT a
  ledger line: the frozen six-kind tier split (`correction`→combat-log only) + the leash's "no enum edit"
  outrank the original plan brief's "durable ledger line" wording. Durability = the Scanner distilling the
  committed log into `strategy` before retro. Landed in `5f69f2f2`; this sync only *documents* that model,
  it does not re-decide it.
- `provenance-model.md` is a **design/rules doc** (no `.feature`, no lifecycle `status`) — the sync is a
  prose edit kept consistent with frozen scenarios, not a full gate cycle. Referenced-artifact check now
  diff-scopes to introduced refs (`--base HEAD`), so touching it won't false-block on pre-existing refs.

## NEXT — resume here
- **Next action:** revise `.agents/specs/sdd/design/provenance-model.md` — add the correction-line durability
  record model to its record/entry-shape section, mirroring the landed `combat-log-governance` `### correction`
  "Durability discipline" bullet and the 5 frozen `conductor.feature` scenarios (section "Correction-line
  durability"). Drive it via `sdd:start-mission` (a `revise` of the design node); the conductor decides whether
  a judge pass is warranted (design doc, no `.feature` → likely mechanical checks only).
- **Then:** run the on-demand formation pass via `sdd:manage` ("audit the corpus structure" → `formation-loop`),
  scoped corpus-wide; self-clear or file its findings as new CRs.
- **Reference (source, not to relitigate):** commits `154aff3b`/`5f69f2f2` (d2), `75b32c49` (ref-escalation);
  both judges' OBSERVATIONS named `provenance-model.md` as the untouched owning doc. The d2 + ref-escalation
  briefs are complete/retirement-ready — do not reopen them.
