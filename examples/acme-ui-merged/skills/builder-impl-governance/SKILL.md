---
name: builder-impl-governance
description: "Internal governance (not user-invocable): the Builder bar for react-component at the impl gate. Code-conformance criteria by discipline, loaded by both the impl-producer (self-align) and impl-judge (grade)."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: impl
  face: both
  compose: union
---

# builder · impl — the code-conformance bar, by discipline

The Builder bar at the **impl gate**: the conventions the component's **code** must satisfy. Stated
**once** as criteria; the **impl-producer** builds to them, the **impl-judge** verifies them against
the frozen suite. `producer ≠ judge` holds at the **agent** level — both are distinct agents loading
this one bar. (No subjective slice at this gate; if one arose it would split into a judge-only
`@rubric`.)

## engineer
- TypeScript, no `any`; React 18 (`createRoot`, side-effect-free render).
- `exactOptionalPropertyTypes` honored (optional = absent, never widen to `| undefined`).
- DOM attribute names — `aria-label` not `ariaLabel`; `aria-*`/`data-*` pass through; `forwardRef`.
- `className`/`style` accept the function form (`react-aria-components` convention).

## designer
- Tokens not literals; every visual state styled (default/hover/focus/active/disabled/loading);
  responsive + RTL.

## a11y
- Correct role/semantics; keyboard operable; visible + managed focus; accessible name + state;
  `axe` zero violations per state.

## security
- No unsanitized `dangerouslySetInnerHTML`; no untrusted prop → DOM/URL sink.

## qa
- Empty / error / boundary states handled.

## How each face uses it
- **impl-producer** — build so every criterion holds; coverage derives from the frozen `.feature`.
- **impl-judge** — `tsc` clean, lint bans `ariaLabel`, `axe` clean, scenarios pass, no tampering.
