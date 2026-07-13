---
cr: github-76
status: active
target: main
todos:
  - content: "explore + draft: additive @frozen malformed-manifest fail-loud scenario in tavern.feature (item 2)"
    status: completed
  - content: "spec gate: cold judge the additive scenario, freeze (self-clear), ledger line"
    status: completed
  - content: "deliver item 1 (impl-only): build AXI CLI surface for cyberplace tavern against the pre-frozen AXI scenarios (TOON default + aggregate, truncation + --full, json never truncated, definitive empty state, content-first, next-step stderr, non-interactive, fail-loud unknown flag, --help); reuse shared output.ts, add TOON renderer"
    status: completed
  - content: "deliver item 2 (impl): malformed-manifest guard in plugins.ts (clear fail-loud error, no raw SyntaxError / silent empty roster)"
    status: completed
  - content: "lift the 'Impl trails the contract' banner on tavern/README (AXI surface now built)"
    status: completed
  - content: "rebase onto origin/main; pnpm verify; impl gate (cold sdd-impl-judge grades item 1 pre-frozen AXI + item 2 new scenario)"
    status: completed
  - content: "handoff: coherent revertable commit(s), PR closing #76, report legate"
    status: completed
---

# CR github-76 — Tavern follow-ups: AXI CLI surface + malformed-manifest guard

Source: https://github.com/cyberuni/cyberplace/issues/76

Scope: ONLY items 1 and 2 of issue #76. Item 3 (shared crew reader export) is ALREADY DONE — untouched.

Target project spec: `.agents/specs/cyberplace/spec.md` (status `implemented`), node
`marketplace/tavern/tavern.feature`.

**Item 1 — AXI CLI surface (IMPL-ONLY, no spec change).** `tavern.feature` already carries the
frozen AXI contract scenarios (TOON default + `N crews` aggregate, long-roster truncation +
`--full`, `--format json` never truncated, definitive `0 crews found` empty state, bare
`cyberplace tavern` shows roster not help, next-step on stderr, never prompts, unknown flag fails
loud, concise `--help`). Today `cli.ts` renders prose via `output()` (default `--format text`,
empty state `No crews found in the tavern.`). Build the CLI to satisfy the already-frozen AXI
scenarios, reusing the repo's shared AXI/TOON output contract (canonical shape:
`packages/universal-plugin/src/bundle/cli.ts` + shared `output.ts`). No spec-gate / freeze change.

**Item 2 — Malformed-manifest guard (ADDITIVE).** `readMarketplacePlugins` does a bare `JSON.parse`
on `.claude-plugin/marketplace.json` with no guard — a present-but-corrupt manifest throws a raw
`SyntaxError`. ADD one @frozen scenario (present-but-malformed manifest fails loud with a clear
message; additive → self-clears, stays @frozen, no re-open) and add the guard so a corrupt manifest
fails loud rather than a raw throw or silent empty roster.

Ledger shard: `.agents/specs/cyberplace/ledger/github-76-tavern-followups.9a727b.jsonl`.

## NEXT

Spec gate first (additive scenario, self-clears). Then deliver both items in one coherent revertable
unit, rebase onto origin/main, `pnpm verify`, impl gate (grade item 1 pre-frozen AXI + item 2 new
scenario), open PR closing #76, report legate. Both gates run under the Pod's leash.
