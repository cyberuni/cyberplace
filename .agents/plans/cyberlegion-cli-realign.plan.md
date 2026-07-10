---
name: cyberlegion-cli-realign
status: active
todos:
  - content: "settle sequencing: this is an ADR + spec-node realignment + real CLI change + dispatch-to-plugin + Store.result deletion. Decide the CR split (likely: ADR first, then spec realign, then CLI rename sweep, then dispatch extraction) and which land independently"
    status: completed
  - content: "write the ADR (ADR-0024) recording the node alignment: spec nodes = command groups + one node per real architectural layer (mux); surfacing/wake dissolve to concept: tags; APPLIES the concept-axis doctrine (does not reverse it), keeps dispatch in the Legate per ADR-0023"
    status: completed
  - content: "realign the cyberlegion spec tree: rename identity/->unit, dissolve session/ (spawn/close/list/focus/read/nudge -> unit), new mux/ node (from console/ behaviors: doctor/mode + pane abstraction), dissolve surfacing/->mail+init and wake/->mail+mux, add attach/ (from bind-main/main). Freeze-preserving where scenarios move verbatim. MIGRATION MAP DONE (migration-map.md); restructure NOT started"
    status: in_progress
  - content: "CLI change: identity->unit, session folded into unit, owner->register --standing, bind-main/main->attach/--clear, admin doctor/mode->mux doctor/mode, admin install folds into init. Keep hot-path aliases (who/send/inbox/spawn) + bare-status. Spec+build via SDD, verify green"
    status: pending
  - content: "delete the result-slot: drop dispatch prep/collect + the Store.result domain (resultPath/writeResult/readResult); move verdict-schema validation onto mail read/await; dispatch (routing) moves to the Legate plugin"
    status: pending
  - content: "update docs: website cyberlegion/architecture page (added) + refresh cyberlegion/overview.md once the CLI change lands; note deferred attach --follow and mail --verdict-schema"
    status: pending
---

# CR cyberlegion-cli-realign — realign the CLI to its real architecture

Target spec: `packages/cyberlegion/.agents/spec` (whole tree) + the cyberlegion plugin spec (for
`dispatch`). Full design: [`cyberlegion-cli-realign.design.md`](./cyberlegion-cli-realign.design.md).
Hosted eyeball reference: the published artifact.

## Supersedes

`cyberlegion-identity-presence-split` (a doc-only carve of `presence/` out of `identity/`). That CR
chased a symptom (oversized `identity/`); the real cause is the spec organized on an invented axis
(`surfacing`/`wake`) that matches no command. Retire that brief when this lands.

## Resolved decisions (settled in design; do not relitigate without new evidence)

- **Spine:** `agent` (definition) → `unit` (instance) → `pane` (location).
- **Two layers, one-way dep:** legion → `mux`; `mux` is unit-agnostic (the `console/` code).
- **Node rule:** one node per command group **plus** a node per genuine architectural layer (`mux`).
  `surfacing`/`wake` dissolve into `mail`/`mux`.
- **`owner` → `register --standing`; `bind-main`/`main` → `attach`/`--clear`; `nudge` is legion.**
- **Identity = mailbox** (register mints both); **receive needs registration, send is free**;
  **orchestrator needs a mailbox** (proven from the delivery path).
- **Prefer wake over wait**; `--wait`/`await` demoted to the no-hook fallback.
- **`dispatch` (routing) belongs to the Legate plugin**, not the CLI (pure-mechanism charter).
- **Result-slot dropped** (`prep`/`collect` + `Store.result`): dominated by Task-result (cost) and
  mail (uniformity). Verdict-schema check moves onto mail receive.
- **Deferred, written down:** `attach --follow` (tmux focus-events); `mail --verdict-schema`.

## NEXT

**CR-0 (ADR-0024) landed.** **CR-2 explore: the migration map is DONE**
(`cyberlegion-cli-realign.migration-map.md`) — the full scenario→target-node contract, counts,
cross-refs, coverage gaps, and 4 judgment calls. The tree restructure is **NOT started** — execution
paused deliberately: it's a whole-spec-tree change (high blast radius) whose spec gate needs human
ratification, the user went AFK, and 4 judgment calls (below) want a decision first.

**Resume CR-2 restructure** by: (1) settle the 4 judgment calls in the map (the `who`/`list` merge
shape; the `admin install`→`init` dedup; `selectWakePath` placement; accept-oversized-advisory vs
sub-split); (2) execute the moves — `git mv identity → unit`, fold `session` scenarios into `unit`,
carve `attach/` + `mux/`, dissolve `surfacing`/`wake` into `mail`/`mux`/`init` with `concept:` tags,
author the new `mux mode` + `admin migrate` scenarios; (3) update the 6 cross-references; (4) run the
spec gate (freeze-preserving reference-renames re-freeze under new paths; only the 2 real re-opens —
judgment #1, #2 — need ratified re-open). Delegate mechanical moves to sonnet, hold the gate here.
Then CR-3 (CLI rename sweep) and CR-4 (dispatch → plugin + `Store.result` deletion).

**Freeze note:** pure command-noun renames are freeze-*preserving* reconciles (ADR-0021), not
re-opens — do not over-ratify them.
