---
name: cyberlegion-cli-realign
status: active
todos:
  - content: "settle sequencing: this is an ADR + spec-node realignment + real CLI change + dispatch-to-plugin + Store.result deletion. Decide the CR split (likely: ADR first, then spec realign, then CLI rename sweep, then dispatch extraction) and which land independently"
    status: completed
  - content: "write the ADR (ADR-0024) recording the node alignment: spec nodes = command groups + one node per real architectural layer (mux); surfacing/wake dissolve to concept: tags; APPLIES the concept-axis doctrine (does not reverse it), keeps dispatch in the Legate per ADR-0023"
    status: completed
  - content: "realign the cyberlegion spec tree: rename identity/->unit, dissolve session/, new mux/, dissolve surfacing/->mail+init and wake/->mail+mux, add attach/. SPEC GATE RATIFIED (status:approved, by:unional; all 9 features frozen; ledger gate line written; judge oracle-PASS + change-fixed)"
    status: completed
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

## CR-2 resolutions (settled with the human)

1. **`who`/`list` merge** → one **`unit who`** (alias `who`): fields `id·handle·harness·status·pane`,
   aggregate `"N units"`, default non-exited + `--all`. Drop `unit list`. (`list` stays only for static
   catalogs, e.g. `agent list`.) A real re-open (Then-clauses change).
2. **`admin install`→`init` dedup** → reconcile into `init.feature` (extend PostToolUse to include
   codex), don't blind-append. A real re-open.
3. **`selectWakePath`** → park in `mux/` for CR-2 but **mark deprecated** (moves to the plugin in CR-4
   with dispatch/routing).
4. **Oversized `unit`/`mail`** → **sub-specs** (nested command-axis nodes), authored in CR-2:
   `unit/{registry,lifecycle}`, `mail/{core,wait,surface}`. This replaces the `concept: wake/surfacing`
   tagging — `mail/wait` (await/watch) and `mail/surface` (hook) are real mail sub-commands, correctly
   subordinate to `mail` instead of top-level siblings.

## NEXT — resume here

**Next action:** run CR-2 **deliver** — the CLI rename sweep in `packages/cyberlegion/src/` so the CLI
matches the now-frozen spec, then gate it. Delegate the mechanical rename to a sonnet subagent against
the 9 frozen `.feature`s; then spawn the cold `sdd:sdd-impl-judge` over them and hold the impl gate
here (human-ratified, by:unional). Rename map:
- `identity <verb>` → `unit <verb>`; `session <verb>` → `unit <verb>` (backend-select/placement →
  `mux`); `owner --handle` → `register --standing`; `bind-main`/`main` → `attach`/`--clear`/`--show`;
  `admin doctor`/`mode` → `mux doctor`/`mode`; `admin install` → `init` (folded).
- New behavior to build: `unit who` gains a `pane` field + `"N units"` aggregate (drop `session list`);
  `mux mode`; `admin migrate`. Keep hot-path aliases (`who`/`send`/`inbox`/`spawn`) + bare-status.
- **The BREAKING CLI change + the changeset land here** — run `add-changeset`. Update
  `cli.ts` + the ~200-test suite; `pnpm verify` green before the impl gate.
Then **CR-4**: dispatch → the Legate plugin + delete `Store.result` (prep/collect/resultPath).

**State — done, don't redo:** CR-0 (ADR-0024) landed. CR-2 **spec gate RATIFIED** — `spec.md
status: approved`, 9 `.feature`s frozen under the new tree, ledger
`cyberlegion-cli-realign.5f028d.jsonl`. Spec-judge: oracle PASS, architect/builder change→all
fixed→green. Scenario→impl contract: `cyberlegion-cli-realign.migration-map.md`. 8 commits on branch
`cyberlegion-cli-realign` (last `ffae1ad7`), **not pushed**.

**Working method — do not relitigate:** see `## Resolved decisions` + `## CR-2 resolutions` above.
Deferred (not this CR): `attach --follow`, `mail --verdict-schema`, and the `dispatch/` stale refs
(`session spawn`/`wake`) that go stale in CR-3/CR-4.
