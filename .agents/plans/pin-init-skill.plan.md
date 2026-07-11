---
name: pin-init-skill
status: active
todos:
  - content: "Intake: cyberlegion-plugin spec, plan + leash shard"
    status: completed
  - content: "Explore: add pins.json-read + --pin scenarios; re-open the two --agent 'plain init' scenarios to drop the pin-blind wording; sync SKILL.md prose; status->draft"
    status: completed
  - content: "Cold aced spec-judge over the changed scenarios; incorporate"
    status: completed
  - content: "Spec gate: re-freeze init-cyberlegion.feature, gate line"
    status: completed
  - content: "Deliver: rewrite SKILL.md version-pin flow to read pins.json + pass --pin; aced impl-judge"
    status: completed
  - content: "Impl gate; pnpm verify; handoff branch + PR (Part C of hook plan)"
    status: completed
---

# pin-init-skill — init-cyberlegion reads the bundled pin, passes `--pin`

CR against `.agents/specs/cyberlegion-plugin` (`init/` node). Part C of the cyberlegion surfacing-hook
plan. Makes the skill's `npx cyberlegion@<version>` placeholder concrete: read the bundle-emitted
version map, then thread it into Part B's `init --pin`.

Depends on A (`.plugin/pins.json` map — merged #105) and B (`init --pin` flag — merged #106).

## The change (skill = the implementation)
`init-cyberlegion/SKILL.md` version-pin note is a placeholder ("resolve from a workspace checkout or
whatever pinned version the project declared"). Replace with the data-map flow:
- read `${CLAUDE_PLUGIN_ROOT}/.plugin/pins.json` (the bundle-emitted `{ "<pkg>": "<version>" }` map),
  look up `cyberlegion` → `<version>`.
- use `<version>` for every `npx cyberlegion@<version> ...` call, and pass `cyberlegion init --pin
  <version>` so install.ts writes the pinned hook.
- fallback: no `pins.json` / no `cyberlegion` key (unbundled workspace checkout) → unpinned `npx
  cyberlegion ... init`; never invent a version.

## Re-open (ratified by user plan approval)
`init/init-cyberlegion.feature` — the two `@agent` scenarios assert the skill runs "**plain**
cyberlegion init"; `--pin` contradicts "plain". Generalize both to be about the `--agent` flag only
(drop the pin-blind "plain" wording). ADDITIVE: pins.json-read, --pin-threaded, and no-map-fallback
scenarios. Re-freeze at the gate.

## NEXT
Cold aced spec-judge over the changed scenarios, then spec gate (re-freeze). legion-publish dep: the
npx pin stays dormant until cyberlegion publishes (not a defect).
