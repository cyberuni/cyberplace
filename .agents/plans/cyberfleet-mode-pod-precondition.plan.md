---
cr: cyberfleet-mode-pod-precondition
status: active
target: main
todos:
  - content: "explore + draft: 6 cold grill rounds; both suites drafted, parse clean, cross-node agreed"
    status: completed
  - content: "R7/R8 cold re-judge: B15/B16 verified; fixed index/placement-map + ADR amendment defects"
    status: completed
  - content: "★ PIVOT (#225): delete mode/init entirely — code, both frozen spec nodes, Pod's precondition"
    status: in_progress
  - content: "re-judge cold post-pivot, then spec gate: HITL-ratify Clearance floor (2 specs now), freeze, ledger shard 440ca1"
    status: pending
  - content: "deliver: operator/pod SKILL.md + READMEs, ADR-0022 amendment, website docs"
    status: pending
  - content: "impl gate + handoff: pnpm verify, rebase main, commit units, PR (Closes #225), report operator by mail"
    status: pending
---

# CR cyberfleet-mode-pod-precondition — mode is deleted; it gated nothing

Source: owner directive, live in-session (unional). **Closing reference: #225** (filed mid-CR, carries
the finding). Title kept for ref/branch/ledger continuity; the CR is now *delete mode*, not *move it
to Pod*.

## ★ PIVOT — mode is a closed loop, delete it (owner-ratified, #225)

Owner asked the question six grill rounds never did: **what reads the marker?** Nothing.

- `cyberfleet init` writes `.agents/cyberfleet/ship.json` = `{"version": 1}`. No data.
- Only reader of that file: `detectMode`. Only caller of `detectMode` in `src/`: the `cyberfleet mode`
  command itself (`cli.ts:86`). Only callers of `cyberfleet mode`: the two SKILL.md mode guards. Only
  thing Pod does on `command-center`: offer to run `cyberfleet init`.
- Loop closed, gates nothing. `missions` / `jump` / `pause` / `gate` never consult mode (all four
  checked). No hook, no statusline, no other consumer.
- **Membership already exists elsewhere**: `cyberlegion unit register` → `AgentRecord` is what
  `missions` enumerates (joins ship→CR on `worktree.branch`, `missions.ts:57-72`), not markers. Pod
  already registers on entry. `ship.json` is a shadow registry with no readers.

**Rulings 1+2 of this CR caused it** — they removed mode from Operator and from routing, leaving a
check whose only job was maintaining its own precondition. The endpoint of the owner's own rulings.

**Resulting charter** (cleaner): `cyberfleet` = the SDD-derived mission view + gates (`missions`,
`jump`, `pause`, `gate`); `cyberlegion` = the sessions (identity, mail, spawn, mux). `mode`/`init`
were metaphor residue. `init` is **deleted, not stubbed** — add back when a ship genuinely needs
on-disk config (leash defaults, ship name).

**Pod gets NO precondition.** It does bridge work. Registration on entry is the real, idempotent
setup act and is already there. The refuse/commission/decline trio is deleted (additive this CR →
costs no freeze). Operator is unaffected by the pivot — it already never checked.

**Blast radius grew**: reverses decision 5 below ("no code change"). Now deletes
`packages/cyberfleet/src/{mode,init}.ts` + tests + 2 CLI verbs, and the `@frozen` `init/` + `mode/`
nodes from `packages/cyberfleet/.agents/spec/` — a **second** project spec at `status: implemented`,
so the **Clearance hard floor fires on two specs**, not one.

One touched project spec: `.agents/specs/cyberfleet-plugin/` (`status: implemented`, both
suites `@frozen`). Artifact-types: `skill` (ACED squad) for the two SKILL.md; `documentation`
for the website docs, carried inline per the `mechanic-rename-build-tune` precedent.

## Decisions (owner-ratified, live)

> **Read against the PIVOT above.** Decisions 1, 2 and 5 are superseded: there is no mode to detect,
> Pod checks nothing, and there *is* a code change. Decisions 0, 3 and 4 stand — ruling 3's
> "Operator never checks" is now trivially true (nothing checks), and the description rule (d0) and
> the all-spawning-is-Operator's rule survive the pivot untouched.

0. **Scope grew mid-explore (owner-ratified).** Two further rulings landed after intake, both
   amending ADR-0022 decision 8 alongside the mode reversal — kept as one CR because they are one
   amendment to one decision over the same two personas and suites:
   - **Descriptions name the work, never the location.** A harness cannot evaluate "outside a ship";
     such a clause is inert at best and invites a marker probe before invoking at worst. For Pod it
     is load-bearing: a location condition would strand the off-ship refuse path entirely.
   - **All spawning is Operator's; Pod does not spawn.** Reverses d8's "Pod ... may spawn further
     worktree-ships for parallel work — spawning is a ship capability" clause. A spawn ask routes to
     Operator by description; no explicit in-ship logic anywhere. Pod loses fan-out.

1. **Mode = presence of `.agents/cyberfleet/ship.json`.** Matches `packages/cyberfleet/src/mode.ts`
   already. **No code change** — the code was always right; the corpus drifted.
2. **Only Pod checks.** Not a ship → Pod refuses the work immediately, asks the Council whether to
   commission, and **on yes runs `cyberfleet init` then proceeds** with the original request.
   Pod no longer defers to Operator.
3. **Operator never checks.** Loading the skill asserts the command-center seat by definition.
   Operator still routes in-ship mission/crew work to Pod **by topic, not by probe** — that
   boundary survives (rubric dim renamed `defers_*` → `routes_in_ship_mission_work_to_pod`,
   threshold 7 intact). The asymmetry is deliberate: Pod never hands off to Operator; Operator
   does route to Pod.
4. **ADR-0022 amended in place** (`## Amendment`), naming + query-first decisions stand.
5. Scope: specs + skills + ADR + website. `packages/cyberfleet/.agents/spec/**` is already correct
   and stays untouched — `cyberfleet mode` the command is unchanged; only *who calls it* changes.

## Edit classes (drives the gate) — final, vs HEAD

`added 16 / modified 8 / removed 11 / unchanged 22`. The gherkin diff is **title-keyed**, so every
retitle reads remove+add; the genuine deletions are fewer than `removed` suggests.

**Genuine deletions → Clearance hard floor** (owner-authorized, still needs the ratifying write):
- `operator.feature`: `Operator activates when there is no ship marker at this project root`,
  `Operator defers to Pod when it is inside a ship` (ruling 1).
- `pod.feature`: `Pod defers to Operator when it is not in a ship` (rewritten → refuse+commission).
- `operator.feature`: `Operator does not fan out worktree-ships once inside a ship`,
  `the loop's spawns are inter-mission, distinct from Pod's intra-mission fan-out`;
  `pod.feature`: `concurrent work is spawned as a worktree-ship with a self-contained brief`
  (all four moot under ruling 3).

**Re-opens** (rewrites/retitles/factual corrections, none weakening a criterion): marker-name
corrections (`.cyberfleet/config.json` → `.agents/cyberfleet/ship.json` — a path that was never
implemented); `missions --json` → `--format json` (a flag that does not exist — R6 ran the CLI);
`mail read` → `mail read --ack` in the pod README (bare read only peeks); the `@trigger` outline
framings; both Feature narratives. Same justification shape as the github-173 stale-mechanic re-open.

**Additive → self-clears, stays `@frozen`**: the refuse / commission-on-yes / decline-on-no trio,
the two description scenarios, the seat scenarios, the worktree-before-commit gap scenario.

## Marker drift to correct (sweep complete)

`.cyberfleet/` + `.cyberfleet/config.json` (never implemented) and `.agents/cyberlegion/config.json`
(ADR-0022 decision 8 is the source of this error) → all `.agents/cyberfleet/ship.json`.
Also fix: `artifacts/adr/README.md` index says 0022 is `Proposed`; the file says `Accepted`.

## Grill log (6 cold ACED rounds, both nodes each round)

Every round found real defects. Design settled after R3 (spawn ruling); R4-R6 were my drafting.

- **R1** — both nodes: I had changed the `.feature` and left the node `README.md` (which IS the
  spec.md — it carries `**Fit:**` + `## Use Cases`) declaring the deleted design. Also: illegal gate
  state (no `draft` transition, no ledger shard); unbounded negative "or any other check".
- **R2** — ★ the skill **descriptions** were themselves the mode-switch, so the contract never
  required them to change → owner ruling 2. Also: rubric dim `defers_*` contradicted "defers to
  nothing" → renamed `routes_*`.
- **R3** — my grounding of the seat ask collided head-on with the fan-out scenario → surfaced the
  spawn boundary → owner ruling 3 (all spawning is Operator's).
- **R4** — ruling-3 knock-on missed: `pod.feature` offload `When` still had Pod spawning. Operator's
  rubric never exercised the dimension it scored (ceiling == threshold).
- **R5** — ★ `missions` is a **cyberfleet** verb, not cyberlegion → Pod's offload scenario was
  jointly unsatisfiable with the HAL scenario. Plus my own README self-contradiction on who routes.
- **R6** — ★ judge **built and ran the CLI**: `cyberfleet missions --json` does not exist
  (`cli.ts:63` defines only `--format <format>`; `--json` errors). Pod's frozen HAL scenario has
  **never** been satisfiable — same bug class as #89. Fixed corpus-wide (6 files incl. ADR-0022).
  Also: bare `cyberlegion mail read` only peeks, does not ack (stale since #173) — README fixed.

## Status at checkpoint

Suites parse (28 + 18 scenarios, 0 errors). Final edit class vs HEAD:
`added 16 / modified 8 / removed 11 / unchanged 22`. Cross-node agreement verified by cold judges
(the `start a worktree ...` row is byte-identical, yes in operator / no in pod). All code claims
re-verified against source by the judges.

**R6 returned ALIGNED false on both** — remaining:
- `B14` (operator, **pre-existing F3 content, not mine**): the retirement conjunct fires
  unconditionally on "mission reports done", but the backstop says a red stacked batch is held
  *without* retiring. Same facts, opposite verdicts. → **follow-up CR**, do not fold in.
- My `B15`/`B16` fixes (unscoped "every mechanic" now false for gh/git/CI; rubric dim
  `first_brief_*` → `every_brief_*`; narrative/section still said "first") are **applied but
  unverified** — they landed after R6 judged.

## Follow-ups to file (do NOT fold into this CR)

1. `B14` — operator.feature retirement-on-red-CI contradiction (pre-existing F3).
2. `@rubric` titles claim "in voice" with no voice dimension — corpus-wide
   (`operator.feature`, `pod.feature`); fix both together or neither.
3. Pod HAL scenario's `never surfacing it when hal is false` branch is unfalsifiable from a
   `hal true` Given.
4. Weak trigger discriminator: operator's `send a message from here ...` vs pod's `send a note ...`
   — thinnest near-miss pair in either suite (cf. #211 weak-discriminator hardening).
5. `packages/cyberfleet/src/{init,mode}.ts` comments still call the marker "tracked"; `init.ts` never
   `git add`s it. The spec-the-truth ruling makes those comments wrong.

## NEXT

1. Re-judge both nodes cold (verifies the unverified B15/B16 fixes). If clean → spec gate.
2. **Spec gate needs HITL ratification from unional** — leash is `auto-none`: the CR deletes
   acceptance scenarios from two `@frozen` suites (**Clearance hard floor**, not self-assertable)
   and re-opens more. On approve: freeze both, write the `gate` line to shard
   `ledger/cyberfleet-mode-pod-precondition.440ca1.jsonl`, set `status: approved`.
3. Deliver (none of this is started): rewrite `plugins/cyberfleet/skills/{operator,pod}/SKILL.md`
   (both still carry `Mode guard: run cyberfleet mode`, the location-conditioned `description`, and
   pod's reversed fan-out rule) + their READMEs; `## Amendment` on `artifacts/adr/0022` covering all
   three rulings; fix `artifacts/adr/README.md` index (says 0022 is `Proposed`, file says
   `Accepted`); `apps/website/src/content/docs/cyberfleet/{overview,pod,operator}.md`.
4. `pnpm verify` at the repo root, rebase onto main, impl gate, PR, report Operator by mail.

Prior commit `a414b9cd` unwrapped step continuations so both suites parse at all — pre-existing
breakage filed twice in the ledger, landed separately.
