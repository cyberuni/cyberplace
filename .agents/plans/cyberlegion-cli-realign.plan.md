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
  - content: "CLI change: identity->unit, session folded into unit, owner->register --standing, bind-main/main->attach/--clear, admin doctor/mode->mux doctor/mode, admin install folds into init. Keep hot-path aliases (who/send/inbox/spawn) + bare-status. Spec+build via SDD, verify green. DONE: committed ddb14587 (feat!, changeset minor+BREAKING); 328 tests green, root verify green; impl gate PASS (cold sdd-impl-judge 167/167). GATE RATIFIED by:unional (ledger seq:3)"
    status: completed
  - content: "delete the result-slot: drop dispatch prep/collect + the Store.result domain (resultPath/writeResult/readResult); move verdict-schema validation onto mail read/await; dispatch (routing) moves to the Legate plugin. DONE (CR-4): dispatch dissolved entirely — spec gate seq:4 + impl gate seq:5 both RATIFIED by:unional; deliver b863089d + surface-sweep 6f476d26; status implemented; verdict-schema deferred to a mail --verdict-schema CR"
    status: completed
  - content: "update docs: website cyberlegion/architecture page (added) + refresh cyberlegion/overview.md once the CLI change lands; note deferred attach --follow and mail --verdict-schema. DONE (37ce1cbd): overview capabilities table realigned; architecture migration table already current. Downstream-consumer sweep also DONE (996ce22e): plugin skills/agents/readmes + cyberfleet + other-project spec READMEs + 3 frozen .feature reference-renames (freeze-preserving)"
    status: completed
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

**MISSION COMPLETE.** All 6 todos done. `cyberlegion-cli-realign` (CR-0 ADR-0024, CR-2 CLI realign,
CR-4 dispatch dissolution) has landed on branch `cyberlegion-cli-realign` — **not pushed**. Root spec
`packages/cyberlegion/.agents/spec/spec.md` is `status: implemented`. Ledger
`cyberlegion-cli-realign.5f028d.jsonl` holds all 5 provenance entries (leash + CR-2 spec/impl +
CR-4 spec/impl gates, all by:unional).

**Remaining, not blocking the mission:**
- **Push + PR:** branch is ~25 commits ahead of origin/main, unpushed. Two changesets pending
  (`cyberlegion-cli-realign.md`, `cyberlegion-cr4-dissolve-dispatch.md`).
- **Retire superseded brief:** `cyberlegion-identity-presence-split.plan.md` was superseded by this
  mission (§Supersedes) — retire it once this lands/merges (plan-retirement gates on merged+distilled).
- **Scenario-bridge rebind** (judge advisory, carried from CR-2): `verify-scenarios` binds 0/167 —
  rewrap test `describe`s to `spec:cyberlegion/<node>` for the 9-node tree.
- **CR-5** `legion-gateway-legate`: the routing brain / wake-matrix driver. Retired dispatch contract
  is preserved in `migration-map.md` §"CR-4 — retired dispatch contract" for it.
- **Deferred features** (written down): `attach --follow` (tmux focus-events); `mail --verdict-schema`
  (re-homes the dropped verdict validation onto the mail receive path).

---

### (historical) prior frontier — resume notes below are superseded by MISSION COMPLETE above

**CR-2 impl gate RATIFIED** (by:unional, in-session) — ledger shard
`cyberlegion-cli-realign.5f028d.jsonl` seq:3 (`kind:gate gate:impl verdict:approve cause:dimension`;
cold `sdd:sdd-impl-judge` 167/167 PASS, no structural blocker). The CLI package spec has no
impl-status frontmatter field — the deliver **is** the committed code (`ddb14587`, feat!,
`.changeset/cyberlegion-cli-realign.md` minor+BREAKING). Branch `cyberlegion-cli-realign`,
**not pushed**. Also landed since: mux backend-select → Scenario Outline (`27fa8c4c`,
freeze-preserving reconcile, ADR-0021).

**LIVE FRONTIER → CR-4** (the one pending todo). **Design resolved with the human (2 forks
answered + charter-reasoned coupling):**

- **Dissolve `dispatch` CLI group entirely** (not a slimmed prep). Delete `src/dispatch/{prep,collect,
  channel,verdict}.ts`, the `dispatch` command group in `cli.ts` (L494–610 + imports L10–12), and the
  dispatch re-exports in `index.ts` (L20–25). The `session spawn` noun-fix is MOOT — the whole
  `dispatch/` node retires, so its stale refs die with it (no freeze-preserving reconcile needed).
- **Delete `Store.result`** — `resultPath`/`writeResult`/`readResult` (store.ts L87–93 +
  file-store.ts L130–141) + `paths.resultFile` (paths.ts L96). `writeResult` has no src caller;
  `resultPath`/`readResult` only called from prep/collect (both deleted).
- **Delete `validateVerdict` + verdict-schema scenarios** now (verdict.ts; agent-visible in
  dispatch.feature L81–101 which retires with the node). Verdict validation returns with the deferred
  `mail --verdict-schema` CR.
- **Subagent return = Task-result** (the caller's harness returns the subagent's final message);
  warm-peer/channel return = **mail** (`mail await`). This is why the result-slot is dominated.
- **Delete `realizeSubagentInstruction`** (agentdef/realize.ts L54 + index.ts L9 export). Its sole
  caller was `dispatch prep`. Keeping it = a renamed slim-prep (rejected). RE-OPENS the frozen `agent`
  node: drop the `realizeSubagentInstruction` scenario group (agent.feature L108–123) + the "or a
  subagent instruction" clause (agent README L4/L8). Keep `realizeLaunch` (channel, still used by
  `unit spawn`) + `agent resolve`.
- **Plugin relocation (routing brain).** Rewrite `plugins/cyberlegion/skills/dispatch-governance` and
  `subagent-backend-governance`: channel path composes `unit spawn` + `mail await` directly (no
  `dispatch channel`); subagent path builds the Task instruction from `agent resolve` fields + brief,
  subagent returns via Task-result (no `dispatch prep`/`collect`, no result file). Update the plugin
  SDD spec `.agents/specs/cyberlegion-plugin/dispatch/` to match.

**Package-spec ripple (spec gate, spec-first):** retire `dispatch/` node; edit root `spec.md`
(title, intro, hub, capabilities row, note); re-open `agent/` (drop realizeSubagentInstruction group)
+ re-open `mux/` (drop `selectWakePath` group — CR-2 res#3 relocation, folded in here). **THREE
frozen re-opens** (dispatch retire = removal; agent + mux = narrowing) → human-ratified spec gate.
Also relocate `src/wake/wake-path.ts` (`selectWakePath`, no internal caller) to the plugin routing
governance at deliver, and drop the index.ts:63 export.

**Execution order:** (1) spec change → spec gate + human ratify ✅ **DONE** (ledger seq:4,
`status: approved` by:unional; agent+mux re-frozen; dispatch node retired; retired contract carried
into migration-map §"CR-4 — retired dispatch contract"); (2) **← DELIVER NEXT** = code deletion +
plugin routing relocation → impl gate.

**DELIVER checklist (CR-4 code, delegate mechanical deletion to sonnet):**
- Delete `src/dispatch/{prep,collect,channel,verdict}.ts` + `src/dispatch/` dir.
- Delete `src/wake/wake-path.ts` (`selectWakePath`) + its tests.
- `store/store.ts` L87–93 + `file-store.ts` L130–141: remove `resultPath`/`writeResult`/`readResult`;
  `paths.ts` L96: remove `resultFile`.
- `agentdef/realize.ts`: remove `realizeSubagentInstruction` + `RealizeSubagentOptions` (keep
  `realizeLaunch`). `index.ts`: drop exports L9 (realizeSubagentInstruction), L20–25 (dispatch),
  L62–63 (WakePath/selectWakePath).
- `cli.ts`: remove the `dispatch` command group (L494–610) + imports L10–12. Keep `unit spawn`,
  `mail`, `agent`.
- Delete the dispatch/wake-path/verdict TEST files.
- Plugin: rewrite `dispatch-governance` + `subagent-backend-governance` (channel → `unit spawn` +
  `mail await`; subagent → build instruction from `agent resolve` + brief, return via Task-result;
  fold `selectWakePath`'s wake-matrix decision into the routing table). Update plugin SDD spec
  `.agents/specs/cyberlegion-plugin/dispatch/` prose if it names the retired CLI verbs.
- Changeset: BREAKING (major/minor per 0.x) — removes public `dispatch` surface + `Store.result` +
  `selectWakePath`/`realizeSubagentInstruction` exports.
- Root `pnpm verify` green; impl gate (cold sdd-impl-judge over the surviving frozen features).

**DOWNSTREAM CONSUMER SWEEP — DONE** (`996ce22e`, human-authorized "sweep everything"). Updated all
live callers to the new surface: cyberlegion plugin skills (legate/manage-inbox/init-cyberlegion/
relay-governance/dispatch-governance) + `agents/headless-legate.md`; cyberfleet plugin skills
(pod/operator/crimp); cyberfleet package spec; the cyberlegion-plugin + cyberfleet-plugin SDD spec
READMEs; and 3 frozen `.feature`s (operator/pod/recruitment + init-cyberlegion) as freeze-preserving
command-noun reconciles (ADR-0021). `artifacts/adr/0024-*.md` + architecture.md migration table left
naming old commands intentionally (pre-change motivation). Root verify green.

**Follow-ups (recorded, not lost):**
- **Scenario-bridge rebind (judge advisory):** the `describe('spec:cyberlegion/identity'|'…/unit')`
  wrappers are stale vs the 9-node tree — `verify-scenarios` now binds 0/167. Rewrap test describes to
  `spec:cyberlegion/<node>` (unit/registry, unit/lifecycle, mux, mail/core, mail/wait, mail/surface,
  attach, admin, init) to restore the bridge (from [[project_sdd_scenario_test_bridge]]).
- **Cosmetic (judge advisory):** `identity.ts`/`session.ts` filenames are pre-rename residue (they now
  back the `unit` group); optional rename, not a contract issue.

Then **CR-4**: dispatch → the Legate plugin + delete `Store.result` (prep/collect/resultPath).
**Fold into CR-4** the `dispatch/` spec's stale `session spawn` → `unit spawn` noun (README.md
L45/50/56/74/77 + dispatch.feature L9/117/118) — deliberately left untouched now so the whole node
(relocation + noun-rename + Store.result deletion) lands as one coherent change, not a piecemeal
frozen-feature edit. Everything else in the repo is swept; `packages/cyberlegion/.agents/spec/`'s
"old `admin install`" / "folded `session list`" / "`admin doctor` moved to `mux/`" mentions are
intentional migration history, correct as-is.

**State — done, don't redo:** CR-0 (ADR-0024) landed. CR-2 **spec gate RATIFIED** (`spec.md
status: approved`, 9 frozen features, ledger `cyberlegion-cli-realign.5f028d.jsonl`). **CR-2 deliver
DONE + impl-gate PASS** (commit `ddb14587`). Scenario→impl contract:
`cyberlegion-cli-realign.migration-map.md`.

**Working method — do not relitigate:** see `## Resolved decisions` + `## CR-2 resolutions` above.
Deferred (not this CR): `attach --follow`, `mail --verdict-schema`.
