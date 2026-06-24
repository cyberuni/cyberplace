---
status: implemented
type: feature
aligned: true
priority: 1
blocked-by:
  - sdd-gate-autonomy
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
---

# SDD State Legality — the `draft + aligned: true` reconciliation

---

## What

A single, authoritative ruling on whether the frontmatter tuple **`status: draft` with `aligned: true`** is a **legal** spec state — and a contract that makes the enforcement script and the governance prose agree on that ruling.

Today they disagree:

- **The script** (`validate-spec/scripts/check-spec-state.mts:108-109`, the runtime source of truth) rejects `draft + aligned: true` as an **illegal** state: *"draft must have aligned:false (draft never means implemented)."*
- **The layer-scoping prose** (`gate-validation-governance/SKILL.md:38` and `sdd-gate-autonomy/spec.md:143`) calls `draft + aligned: true` a **legal** state meaning *"the contract layer (`spec.md` ↔ `.feature`) is in sync — ready for the spec gate."*

A third surface, `gate-validation-governance/SKILL.md:16`, sides with the script. So the gate-validation governance **contradicts itself**: line 16 bans the tuple, line 38 names it the legal "ready for spec gate" state. This spec resolves that.

## The decision (for the human to ratify)

**Is `draft + aligned: true` legal or illegal?**

- **LEGAL** — `aligned` is layer-scoped. At the spec gate `aligned: true` means *the contract layer is in sync*, which is exactly what a converged-but-not-yet-ratified draft looks like. The tuple is the legitimate pre-spec-gate resting state. → **Loosen the script** (drop the `draft + aligned === true` rejection) and **correct gov line 16** to match line 38.
- **ILLEGAL** — `aligned: true` is reserved for *post-approval* "implemented" meaning. A draft must always carry `aligned: false`. → **Keep the script**, **correct the layer-scoping prose** (lines 38 and 143) and the orchestrator cursor table to stop claiming the tuple is legal, and make producers/orchestrator never set `aligned: true` while `draft`.

### Recommendation: **LEGAL** — loosen the script, fix gov line 16

Reasons, weighted:

1. **The layer-scoping model is the more deeply reasoned surface.** `gate-validation-governance` defines `aligned` as *the current layer's artifacts are synced* and binds the meaning to the gate, not to `status`. Under that definition `draft + aligned: true` is **not** "implemented" — it is "contract synced, awaiting the spec gate." The script's parenthetical (*"draft never means implemented"*) attacks a meaning the layer model never assigns.

2. **The orchestrator's own cursor table already produces this state.** `sdd-orchestrator` sets `aligned: false` at segment start and only synthesis sets it back to `true` once the contract layer is in sync — *before* the human spec-gate verdict flips `status` to `approved`. There is a real, legitimate window where `draft + aligned: true` holds. Banning it forces either a lie (`aligned: false` on a synced contract) or a skipped step.

3. **The actual incident was a different error.** `sdd-gate-autonomy/spec.md:145` records that the incident's real fault was *committing an implementation against an unapproved, unfrozen `.feature` while reading `aligned` as "done."* That is caught by the **other** legal-state rules (e.g. `approved` requires a frozen `.feature`; `implemented` requires `approved-by.impl`), not by banning `draft + aligned: true`. The blanket ban over-corrects and kills the legitimate state.

4. **The script is named source of truth, but it is wrong here, not canonical-because-runtime.** Gov line 25 says "if `check-spec-state.mts` changes, this list follows it — the script is the source of truth." That makes the script *mechanically* authoritative, which is exactly why the bug bites at runtime — but "source of truth" is a sync convention, not a correctness proof. This spec corrects the script so the prose can faithfully mirror it.

### The contract this spec freezes

1. **Legality rule.** `draft + aligned: true` is **legal**. The remaining illegal tuples are unchanged.
2. **Layer-scoped meaning.** `aligned: true` always means *the current layer's artifacts are synced*; at `draft`/spec-gate that layer is the contract (`spec.md` ↔ `.feature`); at `approved`/impl-gate it is the implementation. `aligned: true` never on its own means "implemented."
3. **The genuine illegal states remain illegal** (these guard the real incident):
   - `approved` with no frozen `.feature`.
   - `implemented` with `aligned` not `true`.
   - `approved` or `implemented` with any open `<!-- open: -->` marker.
   - `approved`/`implemented` with no `approved-by.spec.by`; `implemented` with no `approved-by.impl.by`.
   - `approved-by` naming a gate other than `spec`|`impl`; a `by: agent` gate with no `why`.
4. **Single source of truth, mirrored prose.** The script and the three prose surfaces must state the **same** legality. After this spec: script loosened; `gate-validation-governance:16` removed/corrected; lines 38 & 143 retained as the canonical meaning.

## The state-tuple legality table (the frozen contract)

`L` = legal, `I` = illegal. Columns: `status`, `aligned`, open-marker count, frozen `.feature` present, `approved-by` adequacy.

| # | status | aligned | markers | .feature | approved-by | Verdict | Why |
|---|---|---|---|---|---|---|---|
| 1 | draft | false | ≥ 0 | optional | — | **L** | contract still evolving / WIP |
| 2 | draft | **true** | **0** | present | — | **L** | **contract synced, ready for the spec gate** (the reconciled case) |
| 3 | draft | true | > 0 | any | — | **L** | aligned claim with open markers is permitted at draft (markers only block the *gate*, not the draft state) |
| 4 | approved | any | any | **absent** | — | **I** | approved requires a frozen `.feature` |
| 5 | approved | any | **> 0** | present | — | **I** | open markers must be 0 before approved |
| 6 | approved | any | 0 | present | **no `spec.by`** | **I** | spec gate has no recorded approver |
| 7 | approved | any | 0 | present | `spec.by` set | **L** | legitimately past the spec gate |
| 8 | implemented | **not true** | 0 | present | — | **I** | implemented requires `aligned: true` |
| 9 | implemented | true | **> 0** | present | — | **I** | open markers must be 0 before implemented |
| 10 | implemented | true | 0 | present | **no `impl.by`** | **I** | impl gate has no recorded approver |
| 11 | implemented | true | 0 | present | `spec.by` + `impl.by` | **L** | legitimately past both gates |
| 12 | any | any | any | any | gate ∉ {spec, impl} | **I** | unknown gate key |
| 13 | any | any | any | any | `by: agent`, no `why` | **I** | a self-assertion must record its derivation |

Row **2** is the reconciliation: the script currently marks it `I`; this contract marks it `L`. Every other row matches the script's existing behavior.

## Surface changes this contract implies (out of scope to apply — drafting only)

1. `check-spec-state.mts:108-109` — remove the `status === 'draft' && aligned === true` rejection.
2. `gate-validation-governance/SKILL.md:16` — delete the "`status: draft` with `aligned: true` — draft never means implemented" bullet (it contradicts line 38).
3. Keep `gate-validation-governance:38` and `sdd-gate-autonomy/spec.md:143` as the canonical layer-scoped meaning.
4. No change to the orchestrator cursor table (it already permits the state).

*Implementation is deliberately deferred — a sibling spec shares these files and the edits must be serialized.*

## Out of scope

- Editing the script, the governance prose, or the orchestrator (a later, serialized implementation pass).
- Redefining `aligned`'s layer-scoping (unchanged — only enforced consistently).
- The leash / autonomy model (owned by `sdd-gate-autonomy`).
