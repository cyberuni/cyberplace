---
name: builder-impl-producer-governance
description: "Internal governance (not user-invocable): the Builder bar for react-component, impl-producer face. The conventions a component's CODE must conform to, by discipline. Loaded when building to the frozen suite."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: impl
  face: producer
  compose: union
---

# builder · impl · producer — make the code conform, by discipline

The **Builder** bar at the **impl gate**, **forward** face: the standing conventions the component's
**code** must satisfy. One skill, sectioned by discipline; the impl-producer self-aligns to all
sections while building. (Generic core: build to the frozen `.feature`, every scenario observably
satisfiable, no green-by-tampering.)

## engineer

- **TypeScript**, no `any` (use `unknown` + narrowing); public props/returns explicitly typed.
- **React 18** target; `createRoot`, no legacy lifecycles; render is side-effect free.
- **`exactOptionalPropertyTypes`** honored — optional = absent, never widen to `| undefined`.
- **DOM attribute names**, not React aliases — `aria-label` not `ariaLabel`; spread `aria-*`/`data-*`
  to the DOM node verbatim.
- **`className`/`style` accept the function form** — `string | ((s: RenderProps) => string)`,
  `react-aria-components` convention; `forwardRef` to the underlying element.

## designer

- Tokens, not literals (color/spacing/type/radius/motion from the token set).
- Every visual state styled: default/hover/focus/active/disabled/loading; responsive + RTL.

## a11y

- Correct role/semantics (prefer native elements); keyboard operable per the WAI-ARIA pattern.
- Visible focus; focus managed on open/close; accessible name + exposed state (`aria-*`).

## security

- No `dangerouslySetInnerHTML` without sanitize; no untrusted prop flowing to a DOM/URL sink.

## qa

- Empty / error / boundary states handled, not just the happy path.
