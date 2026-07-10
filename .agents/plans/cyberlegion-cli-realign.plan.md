---
name: cyberlegion-cli-realign
status: active
todos:
  - content: "settle sequencing: this is an ADR + spec-node realignment + real CLI change + dispatch-to-plugin + Store.result deletion. Decide the CR split (likely: ADR first, then spec realign, then CLI rename sweep, then dispatch extraction) and which land independently"
    status: pending
  - content: "write the ADR reversing the cyberlegion concept-axis placement: spec nodes = command groups + one node per real architectural layer (mux); surfacing/wake dissolve; supersede/partial-supersede the concept-axis ADR"
    status: pending
  - content: "realign the cyberlegion spec tree: rename identity/->unit, dissolve session/ (spawn/close/list/focus/read/nudge -> unit), new mux/ node (from console/ behaviors: doctor/mode + pane abstraction), dissolve surfacing/->mail+init and wake/->mail+mux, add attach/ (from bind-main/main). Move dispatch/ out to the plugin spec. Freeze-preserving where scenarios move verbatim"
    status: pending
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

Not yet started as an SDD mission. The design is settled and captured in the sibling `.design.md` +
the hosted artifact. First actionable step is **todo 1 — sequencing**: decide the CR split (lead with
the ADR, since it reverses a standing placement decision, then the spec realignment, then the CLI
rename sweep, then the dispatch extraction + Store.result deletion). Run `start-mission` against
`packages/cyberlegion/.agents/spec` for the first sub-CR once the sequence is set. Everything that
moves verbatim is freeze-preserving and self-clears at the spec gate; the node *existence/placement*
changes and the CLI rename are the ratified deltas.
