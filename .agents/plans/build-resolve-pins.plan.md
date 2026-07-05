---
name: build-resolve-pins
status: active
todos:
  - content: "Intake: CR opened vs universal-plugin spec (revise plugin/build, additive); plan + ledger shard dbc99c"
    status: completed
  - content: "Explore: author pin-resolution Use Cases in plugin/build/README + additive build.feature scenarios; cold spec-judge; build-to-learn spike of src/pin"
    status: pending
  - content: "Spec gate: judge extended build.feature; re-freeze @frozen (additive self-clears); gate line to shard; root stays approved"
    status: pending
  - content: "Deliver: build src/pin (pure pin.ts + registry.ts fetch adapter + fs.ts) + wire into build.ts/build/cli.ts; verification per frozen scenario"
    status: pending
  - content: "Impl gate + handoff: cold impl-judge; pnpm verify; commit by unit; PR from worktree; detached Warden"
    status: pending
---

# CR: build-resolve-pins — resolve + pin `npx <cli>@<version>` as a step inside `plugin build`

Target spec: `packages/universal-plugin/.agents/spec/` (status `approved`). Node: `plugin/build/` — a **revise**, all-additive.

**What:** `plugin build` gains a build-time pin-resolution step — detect `npx <pkg>@<pin>` in the
plugin's source skills, resolve each package's version from `--registry` (default npmjs), rewrite the
pins in place. Same-major default (`--allow-major` crosses); `--range exact|tilde|caret` (default
exact); `--package` filter; `--skip-pins` opt-out; `--dry-run` reports without writing. Best-effort /
offline-safe: registry failure warns + skips, build still exits 0. AXI output: TOON pins rows +
`pinned N` aggregate; `--format json` adds a `pins` array; truncation + `--full`.

**Decisions (with user):** universal-plugin, not cyberplace (more universal than the marketplace CLI);
a step **inside** `plugin build` (not init-time, not a standalone verb); same-major by default. The
original `--apply` maps onto build's existing write-by-default + `--dry-run` (no `--apply` flag).

**Freeze handling:** all-additive to the frozen `build.feature` → **self-clears, stays `@frozen`, no
re-open** (no scenario narrowed).

**Impl (from frozen suite):** new `src/pin/` domain — pure `pin.ts` (extractPins regex, same-major
`pickTarget`, `styleRange`), `registry.ts` (native-`fetch` adapter), `fs.ts` (glob/read/write skills);
wired into `src/build/build.ts` + `src/build/cli.ts`. No new dep (fetch native; hand-rolled semver).

**Isolation:** worktree `/home/unional/code/cyberuni/cyberplace-build-resolve-pins`, branch
`build-resolve-pins` off `main`.

Ledger shard: `build-resolve-pins.dbc99c.jsonl`. Design: `/home/unional/.claude/plans/our-skill-will-use-abstract-simon.md`.

## NEXT

Explore: author the additive pin-resolution behavior into `plugin/build/README.md` (Use Cases + a
non-goal boundary vs `self-update` / hook-file rewriting) and `build.feature` (new scenarios), spawn
the cold spec-judge, and run a build-to-learn spike of `src/pin/`. Then spec gate (re-freeze),
deliver, impl gate, handoff.
