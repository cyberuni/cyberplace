---
name: build-resolve-pins
status: active
todos:
  - content: "Intake: CR opened vs universal-plugin spec (revise plugin/build, additive); plan + ledger shard dbc99c"
    status: completed
  - content: "Explore: authored pin-resolution Use Cases in plugin/build/README + additive build.feature scenarios; cold spec-judge round 1 caught 3 builder + 1 architect gap, fixed, re-graded ALIGNED true"
    status: completed
  - content: "Spec gate: judged extended build.feature; re-froze @frozen (additive self-clears); gate line to shard dbc99c; root stays approved (8eb5224)"
    status: completed
  - content: "Deliver: built src/pin (pure pin.ts + registry.ts fetch adapter + fs.ts) + wired into build.ts/build/cli.ts; 171 unit tests + real e2e (c63c557, fix 72128c4)"
    status: completed
  - content: "Impl gate: cold impl-judge IN_SCOPE_IMPLEMENTATION_PASS true (26/26 logic scenarios); TOON pins deferred to impl-axi-contract; node stays approved"
    status: completed
  - content: "Handoff: push branch + open PR build-resolve-pins->main (awaiting user); note impl-axi-contract now also covers pins TOON; optional Warden formation pass"
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

**Isolation:** a dedicated git worktree (`../cyberplace-build-resolve-pins`) on branch
`build-resolve-pins` off `main`.

Ledger shard: `build-resolve-pins.dbc99c.jsonl`. Design: `~/.claude/plans/our-skill-will-use-abstract-simon.md`.

## NEXT

Mission delivered on branch `build-resolve-pins` (off `main`), 3 commits: spec gate `8eb5224`,
impl `c63c557`, downgrade-floor fix `72128c4`. Spec gate + impl gate both self-asserted at the
autonomy bar (ALIGNED true / IN_SCOPE_IMPLEMENTATION_PASS true); root `universal-plugin` stays
`approved` (not `implemented`) because the AXI **TOON pins rendering** is deferred to the
`impl-axi-contract` follow-up alongside build's own deferred TOON output.

Remaining (user-gated):
1. **Push + open PR** `build-resolve-pins` → `main` (outward-facing — awaiting user go-ahead; sequence
   against the still-open `axi-conformance` PR).
2. **Fold pins TOON into `impl-axi-contract`** — that already-documented follow-up (from the
   `axi-conformance` NEXT) must now also render the pins section (TOON rows `package/current/resolved/
   status`, `pinned N` aggregate, truncation + `--full`, `pinned 0` empty state). The data is already
   computed on the build result.
3. **Optional Warden formation pass** — single additive node, `check-spec-structure` 0/0; low risk.
4. Retire this plan once the PR merges + doctrine-distills.
