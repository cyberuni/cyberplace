---
name: reshard-ledger
status: active
todos:
  - content: "Intake: scope (only durable ledger.jsonl; combat log already per-plan), scaffold brief"
    status: completed
  - content: "Explore/spec: re-open+revise scanner.feature strategy-append (own shard, drop global next-seq) + add anti-collision scenario; prose sync provenance-model/cr-concurrency/combat-log README+governance/ownership/gate-validation/scanner+gateway READMEs; ADR-0020; cold sdd-spec-judge ALIGNED 3/3"
    status: completed
  - content: "Spec gate: judge ALIGNED, re-froze scanner+spec-gate features, ledger spec gate line seq 55 (legacy file pre-migration)"
    status: completed
  - content: "Deliver: check-spec-state.mts dir-glob read + tests; writer procedures in start-mission/doctrine-loop/sdd SKILLs (hash-per-session shard write); git mv ledgers into ledger/ dir; grep other ledger.jsonl refs"
    status: pending
  - content: "Impl gate: cold sdd-implementer per frozen scenario + concurrency smoke; pnpm verify + verify:specs-new green; impl gate line (new shard)"
    status: pending
  - content: "Handoff: distill, follow-up CR for machine-invariant effort metric (stranded line 179)"
    status: pending
---

# CR: reshard-ledger — kill ledger merge conflicts by sharding, not a merge driver

**CR type:** revise the `implemented` SDD project spec (`.agents/specs/sdd/`). Root stays `implemented`;
one behavioral node (`doctrine/scanner`) re-opens for a ratified revise. Storage-shape change to the
durable ledger + prose sync + one engine + writer-procedure skills + migration.

**Problem:** shared append-only `.agents/specs/<project>/ledger.jsonl` → EOF-append **merge conflict**
on every concurrent mission; worse, two fork-right sessions in **one working tree** clobber it with no git
merge. Designed fix (`provenance-model.md:164` merge=union + CR-scoped seq) was never wired and does
nothing for the shared-tree case.

**Approach — sharded dir, conflicts structurally impossible:**
```
.agents/specs/<project>/ledger/
  <cr-ref>.<hash>.jsonl    # one file per CR per writer; hash = 6 random hex, minted once per writer-session
  strategy.<hash>.jsonl    # Scanner strategy lines (often no cr)
  0000-legacy.jsonl        # current ledger.jsonl git mv'd in (history preserved, glob-read)
```
One writer = one file = single-process append → no shared path, no merge driver. Reader globs
`ledger/*.jsonl` + legacy `ledger.jsonl` if present, feeds the unchanged `parseLedgerGates`.

**Decisions (with user):** keep CR-scoped `seq` (free per-file handle); **drop wall-clock `ts`** (privacy —
leaks activity timing/timezone; git carries the timeline; nothing reads it). Duration/effort metric =
**non-goal**, deferred (picks up stranded `provenance-model.md:179`).

**Frozen-scenario impact:** only `doctrine/scanner/scanner.feature:121` ("the one project ledger with the
next seq") needs a **ratified re-open + revise** (Clearance pre-authorized in plan approval). All other
ledger mentions (spec-gate:47, gateway:51/57, dispatch:71, plan-retirement, conductor:132/135) say "in the
ledger"/"its own ledger lines" — still true for a shard dir → **self-clear, stay @frozen**.

**Resolution:** SDD-default squad (corpus is boolean/conductor-authored, ledger seq 43). spec-producer
inline (sdd:spec-producer), spec-judge cold `sdd:sdd-spec-judge`, impl-judge cold `sdd:sdd-implementer`.

**Files:** `.agents/specs/sdd/doctrine/scanner/scanner.feature` (gated revise);
`design/provenance-model.md` (rewrite storage, del merge=union L164, reconcile L179),
`design/cr-concurrency.md`, `common-governances/combat-log/README.md`,
`plugins/sdd-new/skills/combat-log-governance/SKILL.md`, `sdd:ownership-governance` (prose sync);
`artifacts/adr/0020-sharded-ledger.md` (new); `spec-gate/scripts/check-spec-state.mts`(+test);
`start-mission`/`doctrine-loop`/`sdd` SKILL.md writer procedures; `git mv` sdd+aces ledgers.

**Verify:** vitest check-spec-state (dir-glob == old single-file gates); `pnpm verify`; `verify:specs-new`;
two-branch merge smoke = no conflict; self-host check-spec-state exits clean over globbed shards.

## NEXT
Deliver. Spec gate passed (seq 55, both features re-frozen). Now: (1) `check-spec-state.mts` — replace the
single `ledger.jsonl` read (lines 296-297) with a glob of `ledger/*.jsonl` + legacy `ledger.jsonl`,
concat, feed unchanged `parseLedgerGates`; add tests. (2) Writer-procedure SKILLs — start-mission,
doctrine-loop, sdd (gateway), spec-gate: mint a 6-hex session hash once, write/glob the shard dir instead
of `ledger.jsonl`. (3) Migration: `git mv` sdd + aces `ledger.jsonl` → `ledger/0000-legacy.jsonl`.
(4) Grep for other `ledger.jsonl` path literals. Then cold sdd-implementer at the impl gate + concurrency
smoke test; `pnpm verify` + `verify:specs-new` green; impl gate line to a NEW shard (no ts, dogfood).
