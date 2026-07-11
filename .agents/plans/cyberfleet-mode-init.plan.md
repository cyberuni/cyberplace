---
name: cyberfleet-mode-init
status: active
todos:
  - content: "explore: draft mode/ + init/ behavioral nodes + .feature (marker re-base + cyberfleet init)"
    status: completed
  - content: "spec gate: froze both .feature, wrote approval.spec (by:unional) + gate:spec ledger line, root draft -> approved"
    status: completed
  - content: "deliver: re-base detectMode onto .agents/cyberfleet/ship.json; add `cyberfleet init` (write {version} marker); tests"
    status: completed
  - content: "deliver: plugin sweep — Operator/Pod ship-detection -> .agents/cyberfleet/; command-center = off-ship"
    status: completed
  - content: "impl gate: cold impl-judge PASS (8/8 frozen scenarios); root pnpm verify 19/19; approval.impl + gate:impl; status -> implemented"
    status: completed
  - content: "handoff: branch cyberfleet-mode-init -> PR; Warden placement pass"
    status: in_progress
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
  - New **`cyberfleet init`** command: creates the **minimal opt-in marker**
    `.agents/cyberfleet/ship.json` (`{version}` only — no harness/placement/space).
    Idempotent, git-independent.
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
- **Both `.feature` files carry no cyberlegion-negative content.** The decoupling is *rationale*,
  so it lives in the node READMEs / `spec.md`, never in the frozen suite. Dropped from `mode/`: the
  "never inspects cyberlegion's marker" scenario + the `fleetRoot`/`--root` scenarios (orthogonal
  pre-existing `mode` output, unchanged — a Non-goal, deferred to a fuller `mode` backfill). Dropped
  from `init/`: the "does not create the cyberlegion marker" scenario — a re-coupling regression
  guard belongs in an **impl unit test**, not a frozen scenario (add that unit test in deliver).
  Also trimmed the cyberlegion mention from both Feature description lines. (SDD methodology gap
  filed as #113 — codify this in suite-format-governance.)
- **No cross-node duplication in the suites.** Each node's `.feature` tests only its own contract.
  Dropped `init`'s "after init reports mode ship" scenario (and the "and mode reports ship" clause in
  the non-git scenario) — that composition is `init` writes the marker + `mode` reads it, both already
  covered in their own suites; the end-to-end init→mode check is an **impl integration test** (add in
  deliver). (SDD methodology gap filed as #114.)
- **`init` stripped to the minimal opt-in marker.** `ship.json` = `{version}` only. Dropped the
  invented commissioning defaults (harness / spawn placement / space) — `init` marks a ship, it does
  not configure one. `mode/` = 3 Use Cases / 4 scenarios; `init/` = 3 Use Cases / 4 scenarios.

## Follow-ups (out of scope — future CRs)

- **The ship's `blueprint`** — capture a ship's live layout (its sectors/panes + what runs in each)
  so re-entry rebuilds it on the bridge console. A Pod-driven action (save on request; restore on
  entry), likely a new cyberfleet CLI verb to read/write the blueprint. Naming settled: blueprint
  (artifact) / bridge console (live view) / sector (a pane). NOT init.
- **Persisted cyberlegion hub `space`** — configure the hub root globally / per-project (read by the
  cyberlegion CLI), not only ad-hoc `--space`. Filed as cyberlegion issue #115. cyberfleet does not
  own this; `ship.json` records no space.
- **SDD suite-authoring guidance** — negative-scenario placement (#113) and cross-node composition
  (#114).
- **Root spec.md reset `implemented → draft`.** Pre-existing illegal tuple (`implemented` with no
  approval block, stripped in `c2ca0dd2` referencing a deleted node). This CR's own gates re-earn the
  provenance: spec gate → `approved` + `approval.spec` + `gate:spec`; impl gate → `implemented`.
- Spec judged **ALIGNED** over 3 cold spec-judge rounds; mechanical state/suite/gherkin/structure all
  green. The leash ledger shard's free-text still says "fleet.json" (append-only, left as historical).

## NEXT — resume here

**Spec gate DONE** (`status: approved`, both `.feature` `@frozen`, `approval.spec` by:unional +
`gate: spec` ledger line; `check-spec-state` OK).

**Next action — deliver** (build-to-keep against the frozen suite):
1. Re-base `packages/cyberfleet/src/mode.ts` — `detectMode` keys on `.agents/cyberfleet/ship.json`
   presence (not `.agents/cyberlegion/config.json`); update `mode.test.ts`.
2. Add `cyberfleet init` to `packages/cyberfleet/src/cli.ts` (+ a new module) — writes `ship.json`
   (`version`/`harness`/`at`, optional `space`), idempotent, git-independent; tests.
3. Plugin persona sweep: `plugins/cyberfleet/skills/{operator,pod}` — reframe command-center as
   *off-ship*, not "the primary checkout."
4. Root `pnpm verify` green, then the **impl gate** (cold `sdd:sdd-impl-judge`) → `status: implemented`.

**Blocking decision:** none open. Design is settled (see Resolved decisions).
