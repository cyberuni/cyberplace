---
name: hook-npx-pin
status: active
todos:
  - content: "Intake: cyberlegion spec, plan + leash shard"
    status: completed
  - content: "Explore/re-open: unfreeze surface.feature + init.feature; rewrite command-string scenarios to npx form; add --pin + legacy-migration scenarios; sync READMEs; status->draft"
    status: completed
  - content: "Cold spec-judge over the re-opened scenarios; incorporate"
    status: completed
  - content: "Spec gate: re-freeze both features, gate line, status draft->approved"
    status: completed
  - content: "Deliver: install.ts hookCommand(event,pin)+normalized migration matcher; init --pin flag; install.test.ts"
    status: completed
  - content: "Impl gate (cold impl-judge) -> status implemented; pnpm verify"
    status: completed
  - content: "Handoff: branch cyberlegion-hook-npx-pin, PR (Part B of hook plan; feeds Part C)"
    status: completed
---

# hook-npx-pin — cyberlegion registers an npx-pinned surfacing hook

CR against `packages/cyberlegion/.agents/spec` (was implemented -> draft for the re-open). Replaces
the bare `cyberlegion mail hook --event <event>` (needs a global install) with the npx form. The
pinned version is **injected by the init skill** via a new `--pin` flag (bundle-stamped, Part C), NOT
runtime-read from the binary.

## Re-open (ratified by user plan approval)
- `mail/surface/surface.feature` — rewrote "the configured command is exactly `cyberlegion mail hook
  --event SessionStart`" -> "runs the dedicated `mail hook --event SessionStart`, not a generic exec"
  (surface owns the command core, not the npx prefix).
- `init/init.feature` — rewrote 2 command-string scenarios to `npx cyberlegion mail hook --event …`;
  ADDED: `--pin` registers `npx cyberlegion@<version> …`; no-`--pin` unpinned; legacy-bare-migration
  (re-init rewrites the old bare entry in place, no duplicate).

## Impl (deliver)
- `install.ts`: `hookCommand(event, pin?)` -> `npx cyberlegion@${pin} mail hook…` | `npx cyberlegion
  mail hook…`; `install(harness, projectDir, pin?)`.
- normalized `upsertClaude`/`upsertCursor` matcher: strip a leading `npx cyberlegion@<semver> ` /
  `npx cyberlegion ` / bare `cyberlegion ` prefix, compare the `mail hook --event <event>` core →
  same-core-different-form rewrites in place; exact = already present; none = append.
- `cli.ts` init: add `--pin <version>`, thread to install.
- `install.test.ts`: pinned/unpinned/migration assertions.

## NEXT
Cold spec-judge over the re-opened scenarios, then spec gate (re-freeze). legion-publish dep: npx
pin dormant until cyberlegion publishes (not a defect). Feeds Part C (init skill reads
.plugin/pins.json to pass --pin).
