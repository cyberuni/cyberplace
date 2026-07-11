---
name: bundle-emit-pins-map
status: active
todos:
  - content: "Intake: locate universal-plugin spec, plan + leash shard"
    status: completed
  - content: "Explore: additive scenarios on frozen bundle.feature (writes .plugin/pins.json; --dry-run skips; external excluded); sync README non-goal"
    status: pending
  - content: "Spec gate: additive self-clears (stays @frozen), gate line; cold spec-judge on the added scenarios"
    status: pending
  - content: "Deliver: cli.ts writes <root>/.plugin/pins.json {pkg: resolved} for workspace-resolved pins, skip under --dry-run; unit test"
    status: pending
  - content: "Impl gate (cold impl-judge) -> status stays approved/implemented; pnpm verify"
    status: pending
  - content: "Handoff: branch universal-plugin-bundle-pins, PR (feeds cyberlegion Part C)"
    status: pending
---

# bundle-emit-pins-map — bundle emits a package→version artifact

CR against `.agents/specs`/`packages/universal-plugin/.agents/spec` (status: approved). `plugin bundle`
today rewrites `npx <pkg>@<version>` in skill files and discards the workspace `Map<name,version>`
it computes. Add: bundle also writes `<pluginRoot>/.plugin/pins.json` — a flat
`{"<package>":"<resolvedVersion>"}` map of the workspace-resolved pins — so a bundled plugin's init
skill can read the concrete version (`${CLAUDE_PLUGIN_ROOT}/.plugin/pins.json`) instead of scraping
rewritten prose. Skip the write under `--dry-run`.

## Edit class
ADDITIVE — no frozen scenario asserts "no other file written" (the "only skill pins" line is README
non-goal prose, not a scenario). New scenarios self-clear, stay @frozen, no re-open. README is
in-sync prose (relax the non-goal to permit the generated sibling; `.plugin/plugin.json` manifest +
vendor outputs stay untouched).

## Impl
`packages/universal-plugin/src/bundle/cli.ts` — after `bundlePins`, when not `--dry-run`, write
`<root>/.plugin/pins.json` from `result.pins` where status is `pinned`/`unchanged` (workspace-
resolved); exclude `skipped` (external/unreadable — no authoritative workspace version). `.plugin/`
already exists (holds the manifest).

## NEXT
Explore: add the "Version-map artifact" scenarios to bundle.feature + README sync. Feeds cyberlegion
hook fix Part C (init skill reads pins.json).
