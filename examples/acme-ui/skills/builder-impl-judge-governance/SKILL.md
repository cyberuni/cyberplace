---
name: builder-impl-judge-governance
description: "Internal governance (not user-invocable): the Builder bar for react-component, impl-judge face. How to verify the CODE conforms, by discipline, against the frozen suite. Loaded at the impl gate."
user-invocable: false
metadata:
  artifact-type: react-component
  actor: builder
  gate: impl
  face: judge
  compose: union
---

# builder · impl · judge — verify the code conforms, by discipline

The **Builder** bar at the **impl gate**, **backward** face: run each frozen scenario → boolean, and
confirm conformance per discipline. Coverage is derived from the frozen `.feature`, never re-authored;
no green-by-tampering. Same discipline sections as the producer, read as **checks**, not how-to.

## engineer

- `tsc --noEmit` clean under `exactOptionalPropertyTypes`; lint rule **bans** `ariaLabel`-style
  aliases (grep is zero); `className` prop type is `string | (RenderProps) => string`; ref forwards.

## designer

- A rendered snapshot per visual state exists and uses tokens (no literal hex/px); RTL renders.

## a11y

- `axe` reports **zero** violations for each scenario state; keyboard-interaction tests pass; the
  accessible name is present **and meaningful** (the judgment part — flag, don't auto-pass).

## security

- No unsanitized `dangerouslySetInnerHTML`; no untrusted-prop → sink path (static check + scenario).

## qa

- Edge/empty/error scenarios pass; coverage matches the frozen suite (no dropped scenario).
