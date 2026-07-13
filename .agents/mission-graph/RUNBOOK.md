# Mission-graph dogfood runbook

How to drive this project's own work through the **mission-graph** kernel (cyberfleet-batch Op1).
You are the *lifecycle loop by hand* — consult `ready`, work what it surfaces, retire, re-derive —
until Op3 ([#190](https://github.com/cyberuni/cyberplace/issues/190)) builds the headless operator that
automates it. Self-contained: a fresh session can follow these steps.

## Setup (once)

```bash
git checkout main && git pull
mg() { node plugins/sdd/skills/mission-graph/scripts/mission-graph.mts "$@"; }
```

The store is `.agents/mission-graph/events.jsonl` (git-tracked, append-only). Each `mg append` is a
tracked change — commit it (with the mission, or as a small `chore(mission-graph): …` commit).

> If you drive via the marketplace-installed SDD skills rather than the loop below, first run the
> `resync-local-plugins` skill so they reflect merged HEAD. Not needed to run the engine directly.

## The loop — once per mission

**1. Retire what just landed.** After a mission's PR merges, mark its node retired (M2 = `op1-m2` is
the first to close):

```bash
mg append node --id op1-m2 --status retired
```

**2. Ask what can start now:**

```bash
mg ready     # → the frontier: op2-m1 op3-m1 op4-m1 op5-m1
mg cycles    # sanity: should be empty
```

**3. Pick one + claim it.** (Recommended first: `op2-m1` = [#189](https://github.com/cyberuni/cyberplace/issues/189)
— it automates the touch-set/hazard work that is hand-done today, so every later Operation gets cheaper
to lower.)

```bash
mg append node --id op2-m1 --status claimed
```

**4. Run the SDD mission** on that work, in a Claude Code session:

```
/sdd:start-mission     → then: "work Op2's git-diff touch-set correction tool (#189)"
```

This runs the full loop (spec → spec gate → build → impl gate → handoff → PR), exactly as Op1.M1 did.

**5. On that PR's merge:** back to step 1 with the finished mission's id
(`mg append node --id op2-m1 --status retired`), then `mg ready` for the next. Repeat until `ready` is
empty.

## Notes

- **Op2/Op3/Op5 are Operations, not single missions** — each holds several. Auto-lowering is deferred
  (it is what Op2 builds), so hand-author extra missions as you decompose:

  ```bash
  mg append node --id op2-m2 --kind mission --status open --touch-set <nodes> --blast medium
  mg append edge --kind parent-child --from op2 --to op2-m2
  mg append edge --kind RAW --from op2-m1 --to op2-m2
  ```

  For the *first* mission you don't need to — `op2-m1` is ready to work as-is.
- **Op4** ([#191](https://github.com/cyberuni/cyberplace/issues/191)) is parallel-safe (no dependency on
  the engine) — start it any time for independent progress.
- **Op3** ([#190](https://github.com/cyberuni/cyberplace/issues/190)) is the critical path to full
  autonomy (F3 headless dispatch) but HIGH blast — sequence it after Op2 sharpens the graph.

## Deferred backlog (already in the store, surfaced by `ready`)

| Node | Issue | What |
|---|---|---|
| `op2-m1` | [#189](https://github.com/cyberuni/cyberplace/issues/189) | Op2 — touch-set automation (correction tool → finer ladder → SSA lowering) |
| `op3-m1` | [#190](https://github.com/cyberuni/cyberplace/issues/190) | Op3 — autonomous dispatch (F3): headless-operator + lifecycle loop + orphan-ref store |
| `op4-m1` | [#191](https://github.com/cyberuni/cyberplace/issues/191) | Op4 — corpus prerequisites (F1 capability-first + F2 cross-node scenario dedup) |
| `op5-m1` | [#192](https://github.com/cyberuni/cyberplace/issues/192) | Op5 — risk & barriers: barrier-mission handling + blast auto-compute |
| — | [#193](https://github.com/cyberuni/cyberplace/issues/193) | SQ-F4 — codify transient CR-planning artifacts + retire-sweep |
| — | [#194](https://github.com/cyberuni/cyberplace/issues/194) | SQ-F5 — decision-evidence emit |
| — | [#195](https://github.com/cyberuni/cyberplace/issues/195) | SQ-name — finalize the engine/capability name |
| — | [#196](https://github.com/cyberuni/cyberplace/issues/196) | SQ-intake — automate the Oracle/Architect intake vet |

Design of record: `artifacts/adr/0025-mission-graph-compiler-scheduler-model.md` (model) ·
`artifacts/adr/0026-mission-graph-store.md` (store) · the spec node
`.agents/specs/sdd/mission-graph/README.md` · the engine `plugins/sdd/skills/mission-graph/`.
