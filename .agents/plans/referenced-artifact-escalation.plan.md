---
name: referenced-artifact-escalation
status: active
todos:
  - content: "explore: re-open part-a referenced-artifact frozen scenarios (fail-closed -> diff-scoped scan + surface-for-judgment); ratified re-open"
    status: completed
  - content: "spec gate: cold sdd-spec-judge; freeze reworked scenarios on approve"
    status: completed
  - content: "deliver: diff-scope the ref check (gate only CR-introduced backtick paths) + emit unresolved-introduced refs as a judgment finding, not a hard block; verification per frozen scenario"
    status: completed
  - content: "impl gate: cold sdd-impl-judge; advance on all-pass"
    status: completed
  - content: "handoff: root pnpm verify, land; unblocks d2-correction-line-durability"
    status: completed
---

# referenced-artifact-escalation — the must/can fix for the ref pre-filter

Target spec: `sdd` (`plugins/sdd`). **Prerequisite for `d2-correction-line-durability`** (its spec gate is
false-blocked by the current check). Surfaced by D2+D3 dogfooding D1.

## The defect (Council-confirmed)
D1's referenced-artifact pre-filter (part a, shipped + frozen in `authoring/spec-gate/spec-gate.feature`)
fails the gate **closed** on any touched `spec.md`/`README.md` backtick path that does not resolve on disk.
But prose legitimately names **can-exist** paths — an opt-in config (`.agents/sdd/*` runtime-settings home,
confirmed canonical per `resolve-governances.mts` + `design/artifact-type.md`, created only on opt-in), an
example, a not-yet-built artifact. Non-existence there is correct, not a broken reference. The check conflates
**referenced** with **must-exist**. Concretely: touching `mission/conductor/README.md` for any reason pulls its
pre-existing, legitimate `.agents/sdd/artifact-types.toml` ref into scope and fails closed.

## Design (locked with the Council)
- **Rejected:** hardcoding an exemption for `.agents/sdd/*`. Does not generalize — user projects have their own
  optional paths; a baked-in exemption is the wrong shape.
- **Diff-scope:** gate only the backtick path refs a CR **introduces** (diff vs baseref), never the pre-existing
  refs in a file touched for unrelated reasons. Unifies with the spec-judge's scenario-step-diff follow-up
  (gate the delta, not the whole artifact).
- **Surface-for-judgment (not silent fail-closed):** an unresolved **introduced** ref can't be classified from
  the path alone (typo vs intended-optional), so it is **surfaced as a judgment finding**, not a deterministic
  hard block. Adjudication follows the existing floor: an obvious stale-mistake → conductor-served minor fix;
  plausibly-intended-optional → accept / escalate to the human. (The use-case-coverage check stays fail-closed —
  a Use Cases row naming a missing scenario is not a can-exist case.)

## Scope
- Re-open + rework the frozen part-a scenarios in `authoring/spec-gate/spec-gate.feature` ("fails the gate closed"
  → "diff-scoped; surfaces unresolved introduced refs for judgment"). Ratified re-open (Council-directed).
- Impl: `plugins/sdd/skills/spec-gate/scripts/check-spec-state.mts` — diff-scope the ref scan; change the
  unresolved-ref outcome from fail-closed to a surfaced finding.
- The sibling-prose sweep (D1) inherits the new behavior automatically.

## NEXT
LANDED (commits `1c338574` spec-gate transition, `75b32c49` impl). Both gates self-asserted within auto-all leash;
cold spec-judge ALIGNED, cold impl-judge IMPLEMENTATION_PASS (10/10). Root `pnpm verify` green. Ledger shard
`referenced-artifact-escalation.a87f60.jsonl` (seq1 leash / seq2 spec / seq3 impl). Mission complete — awaiting
doctrine-loop retirement. This unblocks **[[d2-correction-line-durability]]** (its spec gate was false-blocked by
the old fail-closed check, now fixed).
