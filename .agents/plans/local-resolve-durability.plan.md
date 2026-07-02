---
name: resolve-durability — the durability resolution engine
overview: >
  Implement the durability resolution algorithm intake/README.md has specified since the
  local-fast-track-durability-tier / local-durability-toml-override CRs, but never built. New
  behavioral node .agents/specs/sdd/intake/resolve-durability/ (mirrors plan-discovery/'s
  shape) + concrete-engine skill plugins/sdd-new/skills/resolve-durability/.
cr: local-resolve-durability
cr-url:
status: active
todos:
  - id: scaffold-spec-node
    content: Scaffold intake/resolve-durability/ spec node (README + .feature), mirroring plan-discovery/
    status: completed
  - id: build-script
    content: Build resolve-durability.mts (4-step resolution) + unit tests
    status: completed
  - id: wire-verify
    content: Wire test file + CLI smoke check into pnpm verify:specs-new; regenerate concept-index
    status: completed
  - id: judge
    content: Spawn cold spec-judge over spec+impl together; fix findings
    status: completed
  - id: handoff
    content: Commit
    status: in_progress
isProject: false
---

## NEXT

Commit as one unit of work. Remaining open items from the durability line of work:

1. **Retire `plugins/skill-authoring/skills/create-skill`** in favor of `aces:define-skill` —
   still open, now that a real resolver exists to check the durability signal against.
2. **Promotion-path detector** (private→public) — still an open marker in intake/README.md.
3. resolve-durability is not yet **wired into any caller** (the conductor/intake doesn't invoke
   it yet) — it exists as a standalone, tested engine, same bootstrapping stage `discover-specs`
   and `resolve-governances` were at before the conductor started calling them. Wiring it into
   the actual intake flow is a separate follow-up.

## Gate record

Spec gate: approve (self-asserted, `auto-all` leash, `ledger/local-resolve-durability.2909a9.jsonl` seq 2).
Impl gate: approve (same shard, seq 3).

sdd:sdd-spec-judge caught one real blocker on first pass: the "malformed durability.toml"
outcome promised in the Use Cases table had no scenario/test even though the implementation's
branch was live and reachable. Added the scenario + test, re-verified (17/17 tests). Also
flagged an ungrounded claim (`packages/*/agents/**` / `packages/*/commands/**` asserted to
mirror define-agent's placement table, but that table has no `packages/*` row for either and no
such directory exists in the repo) — trimmed to only the grounded globs
(`plugins/*/agents/**`, `plugins/*/commands/**`).

## Context

Follow-up to `local-fast-track-durability-tier` (4183717) and `local-durability-toml-override`
(7a5b826), both of which specified but never implemented durability resolution.
