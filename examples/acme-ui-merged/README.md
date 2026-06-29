# Example — `acme-ui-merged`: the merged-faces governance model (compare with `../acme-ui`)

The **same** React component library and the **same** criteria as [`../acme-ui`](../acme-ui/), built
the other way so we can diff the two granularity models directly.

- **Model A — `../acme-ui/`** — per-role: `<actor>-<gate>-<face>-governance`. **10 skills.**
- **Model B — here** — per-`(actor, gate)`, faces merged: `<actor>-<gate>-governance`, each loaded by
  both the producer agent (self-align) and judge agent (grade). **5 skills + 1 judge-only rubric.**

## The 6 skills here

```
skills/
  oracle-spec-governance/        (spec gate only)
  builder-spec-governance/         builder-impl-governance/
  architect-spec-governance/       architect-impl-governance/
  designer-coherence-rubric-governance/   (judge-only — the one subjective slice)
```

## A vs B, side by side

| | Model A (per-role, 10) | Model B (per-(actor,gate), 5+1) |
|---|---|---|
| `spec | impl` split | yes | **yes** (kept — coverage vs conformance is real) |
| `producer | judge` split | yes (separate files) | **merged** — one bar, both agents load it |
| objective criteria | written **twice** (do / is-it-done) | written **once** |
| subjective slice (designer coherence) | buried in `*-judge` files | **split out** as a judge-only `@rubric` |
| `producer ≠ judge` | preserved (separate files) | preserved (**separate agents**, one shared bar) |
| skills to maintain | 10 | 6 |
| where a criterion lives | 2 places per gate → edit both | 1 place → edit once |

## What building both showed

1. **The producer/judge duplication in A is real and pure overhead** for objective bars: compare
   A's `builder-impl-producer` ("use `aria-label`") with `builder-impl-judge` ("grep is zero") — the
   same five sections, `do X` ↔ `is X done?`. B states it once and notes the two faces in a short
   "How each face uses it" footer. **Maintenance: A edits two files per criterion; B edits one.**

2. **The subjective slice is the only thing that genuinely wants a separate judge file** — and B
   makes that explicit (`designer-coherence-rubric-governance`, `face: judge`) instead of hiding it
   inside a per-role judge skill. This is the real reason `producer ≠ judge` exists at the *file*
   level, and it's a tiny minority of the surface.

3. **One honest wrinkle for B:** `architect-spec` has **asymmetric inputs** — the producer is the
   solution-producer (writes the solution), the cold spec-judge reads spec + suite only. B handles it
   with a one-paragraph note + a per-face footer; it's the same *bar* on different *surfaces*, so it
   still merges. If more bars had asymmetric inputs, A's separation would start to pay off.

## Recommendation

For SDD's **generic** actor bars and for objective discipline bars, **Model B** wins: one source per
`(actor, gate)`, faces are distinct agents loading the shared bar, subjective rubrics split out where
they actually exist. Reach for A's per-face files **only** where a bar's two faces genuinely diverge
(a judge-only rubric, or asymmetric inputs) — and even then, B expresses that as a targeted split
rather than doubling every skill.
