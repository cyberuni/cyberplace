---
name: validate-pin
status: active
todos:
  - content: "Intake: cyberlegion spec, plan + leash shard"
    status: completed
  - content: "Explore: add malformed-pin-rejection scenario to init.feature (additive, self-clears); cold sdd spec-judge"
    status: pending
  - content: "Spec gate: re-freeze, gate line"
    status: pending
  - content: "Deliver: validatePin() in install.ts + cli fail() wrap; install.test.ts; sdd impl-judge"
    status: pending
  - content: "Impl gate; pnpm verify; handoff branch + PR (closes #109)"
    status: pending
---

# validate-pin — reject a malformed `init --pin` before registering a broken hook

Closes #109. CR against `packages/cyberlegion/.agents/spec` (`init/` node). `init --pin <version>`
threads the value straight into `npx cyberlegion@<pin> mail hook …` with no validation — a malformed
pin (empty, whitespace, `@`/space/shell-injection, a range) registers a broken hook. Low risk on the
shipped path (bundle-stamped version only), but `--pin` is a public flag.

## The fix (deterministic engine — SDD-default squad, vitest)
- `install.ts`: add `validatePin(pin)` — accept a single npm version-or-dist-tag token
  (`/^[0-9A-Za-z][0-9A-Za-z._+-]*$/` — allows `1.2.3`, `1.2.3-rc.1+build`, `latest`; rejects empty,
  whitespace, ranges, `@`, and shell metacharacters). Call it at the top of `install()` when a pin is
  given, before building any hook command → throws, nothing written.
- `cli.ts` init: wrap the `install(...)` call so the throw surfaces via `fail()` (clean non-zero),
  matching the existing `--agent`-rejection shape.
- `install.test.ts`: valid pins accepted (semver, prerelease, dist-tag); malformed pins throw and
  write no config.

## Spec (additive — self-clears, stays @frozen)
`init/init.feature`, under the pinned-form section: a malformed `--pin` is rejected naming --pin as
invalid, and no hook is registered.

## NEXT
Add scenario, cold sdd spec-judge, spec gate (re-freeze), then deliver the guard + tests.
