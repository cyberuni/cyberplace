# Example — `acme-ui`: react-component governance squad (the `spec|impl × producer|judge` split)

> **Model A (per-role, 10 skills).** Compare with **[`../acme-ui-merged`](../acme-ui-merged/)** —
> Model B, faces merged (5 skills + 1 judge-only rubric).

A worked example to evaluate the **governance granularity** for `sub-governances`. The project is a
React component library; artifact-type **`react-component`**. The governances live in `skills/` as
`user-invocable: false` skills, named `<actor>-<gate>-<face>-governance`, each **one skill sectioned
by discipline** (engineer / designer / a11y / security / qa for builder; product / api-design / dx
for oracle; module-structure / dependency-hygiene / bundle for architect).

This is a **structure demo**, not a runnable library.

## The 10 skills as built

```
skills/
  oracle-spec-producer-governance/    oracle-spec-judge-governance/     (spec gate only)
  builder-spec-producer-governance/     builder-spec-judge-governance/
  builder-impl-producer-governance/     builder-impl-judge-governance/
  architect-spec-producer-governance/   architect-spec-judge-governance/
  architect-impl-producer-governance/   architect-impl-judge-governance/
```

`oracle` has **no impl face** (scope is settled at the spec gate) → 2, not 4. builder + architect
span both gates → 4 each. Total **10**.

## What building all 10 actually revealed

**1. `spec | impl` is a REAL content difference — not just a relabeled target.**
- **spec** side = **coverage**: does the `.feature` *test* each discipline's concern? (e.g. builder
  spec: "every visual state has a scenario"; "each untrusted-input path has a sanitization scenario").
- **impl** side = **conformance**: does the *code* satisfy each discipline? (e.g. builder impl:
  "`aria-label` not `ariaLabel`"; "`axe` reports zero violations").

These are different criteria, so the split earns its keep. My earlier "spec/impl only changes the
target" was wrong — coverage-of-a-concern and conformance-to-a-concern are genuinely distinct bars.

**2. `producer | judge` mostly MIRRORS — for objective bars.** Compare
`builder-impl-producer` ("use `aria-label`") with `builder-impl-judge` ("lint bans `ariaLabel`; grep
is zero"): same discipline sections, `do X` flipped to `is X done?`. For **objective** criteria the
two faces are a rephrase, so authoring both **duplicates the section list**. The only non-mirror part
is a **subjective** slice (e.g. designer "visual coherence" → a hand-judged `@rubric` the producer
shouldn't self-grade). `producer ≠ judge` is a constraint on **agents**, not on **files** — a single
bar can be loaded by both the (distinct) producer and judge agents without violating it.

**3. Disciplines-as-sections works.** One skill per `(actor, gate, face)` with discipline sections
reads cleanly and keeps each discipline's criteria in one place. The disciplines are **project
governances** (here) composed onto the **SDD generic core** via `compose: union` — so
`sub-governances` ships only the generic `oracle/builder/architect` core; squads like this one are
project/plugin-supplied at resolution.

## The granularity question, now grounded

| split | keep? | why |
|---|---|---|
| `spec | impl` | **keep** | coverage vs conformance — real, distinct criteria |
| `producer | judge` | **merge for objective bars** | mirror sections; `do X` ↔ `is X done?`; independence is per-agent, not per-file |
| subjective rubric slice | **split out** | the judge's rubric is the one thing the producer shouldn't self-grade |

So the as-built **10** compresses to **~5 per-`(actor,gate)`** bars (`oracle-spec`,
`builder-spec`, `builder-impl`, `architect-spec`, `architect-impl`), each sectioned by discipline and
loaded by both faces, **plus** a split-out `@rubric` only where a discipline has a subjective slice.

## General governance vs per-CR output (still holds)

The governances say *"use `aria-label`"*, *"every visual state has a scenario"* — standing rules.
The decision *"this `<Button>` excludes `IconButton`"* is the mission loop **applying** the bar to one
CR; it never appears in a governance.
