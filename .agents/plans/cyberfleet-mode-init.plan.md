---
name: cyberfleet-mode-init
status: active
todos:
  - content: "explore: draft mode/ + init/ behavioral nodes + .feature (marker re-base + cyberfleet init)"
    status: completed
  - content: "spec gate: freeze both .feature, write approval.spec + gate:spec ledger line, root draft -> approved (awaiting human ratification)"
    status: in_progress
  - content: "deliver: re-base detectMode onto .agents/cyberfleet/ship.json; add `cyberfleet init` (create marker+ship.json); tests"
    status: pending
  - content: "deliver: plugin sweep — Operator/Pod boundary framing (command-center = off-ship, not primary)"
    status: pending
  - content: "impl gate: cold impl-judge per frozen scenario; root pnpm verify green"
    status: pending
  - content: "handoff: branch cyberfleet-mode-init -> PR; Warden placement pass"
    status: pending
---

# cyberfleet-mode-init

cyberfleet owns the **fleet/ship** concept via its **own** `.agents/cyberfleet/`
namespace — stop reaching into cyberlegion's private `.agents/cyberlegion/config.json`
marker. First behavioral nodes for the descriptive-only cyberfleet CLI spec.

- **Project:** `packages/cyberfleet/.agents/spec` (status `implemented`, project-path
  `packages/cyberfleet`). artifact-type = deterministic CLI/TS → SDD defaults (not ACED).
- **Design (settled with user):**
  - `cyberfleet mode` stays a two-value enum `ship | command-center`. Re-base the
    signal: **`.agents/cyberfleet/` present → ship; absent → command-center.** Git
    primary, git worktree, and plain non-git folder with the marker are all **ship**
    (equal). No dependency on `.agents/cyberlegion/`.
  - New **`cyberfleet init`** command: creates `.agents/cyberfleet/ship.json` (the
    opt-in marker + config: `version`, default `harness`, spawn placement `--at`,
    optional `--space` binding). Idempotent, git-independent.
  - Marker is **tracked/committed**, so it travels to the primary + every worktree —
    the primary checkout becomes a **ship** too; a spawned worktree is a ship for free.
  - **command-center = anywhere without the marker** (a neutral/off-ship spot), NOT
    "the primary checkout" as before. Shifts the Operator seat framing.
  - **fleet** = a grouping concept (multiple ships); **deferred** — no command-center
    operation acts on a particular fleet yet, so the grouping definition waits for the
    first fleet-level verb.
- **Downstream sweep:** Pod/Operator persona docs (`plugins/cyberfleet/skills/{pod,operator}`)
  frame command-center as the primary checkout — reframe to "off-ship."
- **Ledger:** run-level leash in `packages/cyberfleet/.agents/spec/ledger/cyberfleet-mode-init.27f706.jsonl`.

## Resolved decisions (do not relitigate)

- **Marker file is `ship.json`** (not `fleet.json`) — the marker marks a *ship*; `fleet.json` is
  reserved for the deferred fleet-grouping concept. `.agents/cyberfleet/ship.json` presence = ship.
- **`mode` scope trimmed to the classification only.** Dropped the "never inspects cyberlegion's
  marker" scenario (redundant with "no cyberfleet marker → command-center"; decoupling is rationale,
  not a behavior) and the `fleetRoot`/`--root` scenarios (orthogonal pre-existing `mode` output,
  unchanged by this CR — noted as a Non-goal, deferred to a fuller `mode` backfill). `mode/` = 3 Use
  Cases / 4 scenarios; `init/` = 6 Use Cases / 10 scenarios (kept init's "doesn't touch cyberlegion"
  scenario — a genuine write-scope boundary).
- **Root spec.md reset `implemented → draft`.** Pre-existing illegal tuple (`implemented` with no
  approval block, stripped in `c2ca0dd2` referencing a deleted node). This CR's own gates re-earn the
  provenance: spec gate → `approved` + `approval.spec` + `gate:spec`; impl gate → `implemented`.
- Spec judged **ALIGNED** over 3 cold spec-judge rounds; mechanical state/suite/gherkin/structure all
  green. The leash ledger shard's free-text still says "fleet.json" (append-only, left as historical).

## NEXT — resume here

**Next action:** ratify the **spec gate** (human act). Freeze `mode/mode.feature` +
`init/init.feature` (`@frozen`), write `approval.spec` (`by: unional`, verdict approve) to
`packages/cyberfleet/.agents/spec/spec.md`, append a `gate: spec` line to the ledger shard
`packages/cyberfleet/.agents/spec/ledger/cyberfleet-mode-init.27f706.jsonl`, and set root
`status: draft → approved`. Re-run `check-spec-state` to confirm the legal tuple.

**Then deliver** (build-to-keep against the frozen suite):
1. Re-base `packages/cyberfleet/src/mode.ts` — `detectMode` keys on `.agents/cyberfleet/ship.json`
   presence (not `.agents/cyberlegion/config.json`); update `mode.test.ts`.
2. Add `cyberfleet init` to `packages/cyberfleet/src/cli.ts` (+ a new module) — writes `ship.json`
   (`version`/`harness`/`at`, optional `space`), idempotent, git-independent; tests.
3. Plugin persona sweep: `plugins/cyberfleet/skills/{operator,pod}` — reframe command-center as
   *off-ship*, not "the primary checkout."
4. Root `pnpm verify` green, then the **impl gate** (cold `sdd:sdd-impl-judge`) → `status: implemented`.

**Blocking decision:** none open. Design is settled (see Resolved decisions).
