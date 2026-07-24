---
cr-ref: github-371
status: in_progress
floor: clearance
todos:
  - content: "Re-cut catches-misalignment Given to a buildable-but-off-direction CR + update rubric comment"
    status: in_progress
  - content: "Ablation-validate: dimension DROPS with direction-fit rule deleted, PASSES intact"
    status: pending
  - content: "Record #371 re-cut + new ablation result in README (preserve #308 history)"
    status: pending
  - content: "Clearance ratification (frozen re-open) + pnpm verify + one commit/PR"
    status: pending
---

# github-371 — re-cut catches-misalignment's Given (fixture too blatant)

CR: https://github.com/cyberuni/cyberplace/issues/371

## Problem
`catches-misalignment` (ssa-lowering Oracle gate, `.agents/specs/sdd/ssa-lowering/ssa-lowering.feature:63`)
grades catching a CR that contradicts the product **direction** (direction-fit, not supersession).
Old fixture — autofix rewriting files vs a read-only tool with no write credentials — is **unbuildable**,
so common sense catches it regardless of doctrine. Ablation deleting the direction-fit rule caught it
5/5 (Δ≈0). Fixture-limited loseability (#308 finding, [[feedback_blatant_fixtures_resist_ablation]]).

## Fix (frozen Given edit → Clearance)
Re-cut to a **buildable-but-off-direction** CR: add a mode that fetches the latest ruleset from a hosted
registry at each run, against a tool positioned as a **self-contained / hermetic / no-external-runtime-dependency**
binary (bundles ruleset at build time, vendorable, runs unchanged anywhere). Fetching is buildable,
nothing supersedes it, but it adds exactly the external dependency the direction rules out — visible only
by reading how the tool ships.

Domain chosen to avoid absorption: NOT telemetry (the doctrine's own direction-fit example, SKILL.md:67)
and NOT stateless/deterministic (the sibling `cursor-part-on-direction-fit`, feature:98).

## Validation (required)
Ablation: delete the Misaligned/direction-fit bullet from the doctrine (SKILL.md:66-69) + scrub its
vocabulary; N producers each arm, blind judges. New Given is done only if the dimension DROPS ablated
(a real miss — producers partition the fetch mode as filed) AND passes clean intact.

## NEXT
Edit the Given + rubric comment on branch `sdd/371-recut-misalignment-given`, then run the ablation.
