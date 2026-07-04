---
name: pod-hal-flash
status: active
todos:
  - content: "Read ADR-0022 decision 6, gateway spec node + .feature, hal.ts, missions.ts row shape"
    status: completed
  - content: "Additive @behavior scenario in gateway.feature: Pod surfaces the HAL tell once on its own above-leash self-assertion"
    status: completed
  - content: "Pod SKILL.md: add HAL-tell decision (missions --json → own row → hal:true → speak once) + Boundaries note on rarity"
    status: completed
  - content: "Update pod README.md if it summarizes behaviors"
    status: completed
  - content: "Verify: audit validate pod, check-spec-structure + concept-index --check, cyberfleet tests green"
    status: completed
---

# pod-hal-flash — wire the HAL tell into the Pod gateway skill

CR against `.agents/specs/cyberfleet-plugin/gateway/` (node stays `@frozen`; this is an ADDITIVE scenario,
not a re-open). Per ADR-0022 decision 6, HAL is a rare, earned tell — never a mascot, never
routine — shown when a Pod's own ship self-asserted a gate above its run-level leash (SDD's leash
concept). Detection already exists and is committed: `cyberfleet missions --json` emits a per-ship
`hal: boolean` field (`packages/cyberfleet/src/missions.ts`), derived by
`packages/cyberfleet/src/sdd/hal.ts`'s `inferHal`/`renderHalTell`. What was missing: the Pod persona
actually surfacing it. This CR closes that gap with a spec-first change (additive scenario) plus a
Pod `SKILL.md` decision step — no new cyberfleet code, detection already ships.

## NEXT

Verify step: run `audit validate` on `plugins/cyberfleet/skills/pod`, `check-spec-structure` +
`concept-index --check` over `.agents/specs/cyberfleet-plugin`, and `pnpm --filter=cyberfleet test`. Then
hand off for review — do not commit (reviewer commits).
