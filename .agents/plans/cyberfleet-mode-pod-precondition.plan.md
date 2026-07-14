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
    status: completed
  - content: "spec gate: HITL-ratified by unional across BOTH specs, gate lines written, status: approved"
    status: completed
  - content: "deliver: operator/pod SKILL.md + READMEs, ADR-0022 amendment, marketplace readme, website docs"
    status: completed
  - content: "impl gate: cold judge FAIL x2 (pod description could not discriminate the spawn row; 3 files outside touch set still asserted Pod fan-out) — both fixed, re-judge in flight"
    status: in_progress
  - content: "handoff: rebase main, PR (Closes #225), report operator by mail, file the 5 follow-ups"
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

## Edit classes — SUPERSEDED by the pivot

> The pre-pivot numbers (`added 16 / modified 8 / removed 11`) and the marker-drift sweep below are
> **historical**. There is no marker to correct — it is deleted. Final edit class vs `a414b9cd`:
> **17 added / 5 modified / 14 removed**; the ratified Clearance scope is recorded in the two `gate`
> ledger lines, which are the durable record. Read those, not this section.

## Grill log (8 cold ACED rounds + the pivot)

Every round found real defects. Design settled after R3 (spawn ruling); R4-R6 were my drafting.
**R7/R8 and the owner's question are the important entries — read those first.**

- **R7** — B15/B16 verified good *inside* the nodes, but the defects had moved **up**: the project
  `spec.md` placement map still routed `commission a ship` → Operator while `pod.feature` froze Pod
  doing it (jointly unsatisfiable); the index claimed both personas "offload all mechanics to the
  `cyberfleet` CLI" (unscoped **and** the wrong CLI — `operator.feature` freezes cyberlegion); the
  Operator index entry omitted **spawn**, the CR's headline ruling. Also: my `--at workspace`
  rationale ("the cyberlegion primitive stays neutral") was **false against source** —
  `session.ts:149` already defaults a new-worktree spawn to `workspace`. **Lesson: I swept the nodes
  and never re-swept the index above them.**
- **R8** — both judges independently flagged that ADR-0022 d8 was **unamended** while four sites
  cited it "as amended". Plus `spec.md`/index attributed cyberlegion's whole verb set
  (register/send/spawn/inbox) to the `cyberfleet` CLI — live drift I introduced by half-fixing the
  adjacent paragraph. Plus four spec nodes named in both narratives (`messaging`, `identity`,
  `spawn`, `surfacing`) **do not exist** — stale since the cyberlegion extraction.
- **★ THE PIVOT** — owner asked the question 6 rounds of judges never did: *what reads the marker?*
  Nothing. See the PIVOT section. **Lesson: every judge graded the loop's internal consistency;
  none asked what the loop was for.** A spec can be perfectly self-consistent and still specify
  nothing.
- **Impl gate** — cold judge failed 2: Pod's `description` never said "spawn", so the frozen
  `start a worktree … | no` row was underivable (the rule was in 5 places and missing from the one
  line a router reads); and 3 files **outside the touch set** (`agents/headless-operator.md`,
  `merge-backstop-governance/{SKILL,README}.md`) still asserted Pod's intra-mission fan-out.

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

## Commits so far (branch `cyberlegion/unit-73f3980d45c4d29f`)

- `a414b9cd` — unwrap step continuations so both suites parse at all (pre-existing breakage).
- `53cc5abd` — **delete mode/init**: `src/{mode,init}.ts` + tests + 2 CLI verbs; the `@frozen` `init/`
  + `mode/` nodes; ADR-0022 amendment. `BREAKING CHANGE` (both v0, no consumers).
- `27adefcb` — retire the mode guards from Pod and Operator; both descriptions; marketplace readme +
  website docs.
- `f06c7af7` — **spec gate**, HITL-ratified by unional across both specs; both → `status: approved`.

## NEXT

1. **Impl-gate re-judge in flight.** Cold judge returned `IMPLEMENTATION_PASS false` on two:
   - **D1** Pod's `description` never said "spawn", so the frozen `@trigger` row `start a worktree …
     | no` was not derivable — a harness scoring Pod reads only Pod's description and never sees
     Operator claim the spawn. Fixed: `… not spawning ships or worktrees, fleet-wide oversight, or
     cross-ship routing.` **Lesson: "Pod never spawns" was in 5 places and missing from the only line
     a router reads.**
   - **D2** `agents/headless-operator.md` + `merge-backstop-governance/{SKILL,README}.md` still
     asserted Pod's *intra-mission fan-out* — the scenario this CR deleted. They sat outside the
     touch set (which was scoped to the two persona skills). Fixed by re-anchoring the boundary on
     the Operator seat. **Lesson: grep the whole plugin, not the node under edit.**
   - Judge's open advisory: `just refactor this file in the current session | no` is weakly held
     ("bridge work on a project" ⊃ "any work on a project"). Asked the judge to rule FAIL vs
     advisory — do NOT widen the CR on it; file as follow-up if advisory.
2. On PASS: write the `impl` gate line to both shards, both specs → `status: implemented`, commit.
3. Rebase onto `main`, PR (**Closes #225**), report Operator by mail.
4. File the follow-ups below.

## Follow-ups to file (do NOT fold in)

1. `B14` — operator.feature retirement-on-red-CI contradiction (pre-existing F3).
2. `@rubric` titles claim "in voice" with no voice dimension — corpus-wide (`operator.feature`,
   `pod.feature`); fix both together or neither.
3. Pod HAL scenario's `hal false` branch is unfalsifiable from a `hal true` Given.
4. Weak trigger discriminator: operator's `send a message from here …` vs pod's `send a note …`
   (cf. #211). Both judges independently flagged it; needs an explicit near-miss policy.
5. `resync-local-plugins` after this lands — the installed marketplace pin still serves the OLD
   descriptions ("when inside a ship (has .agents/cyberfleet/)"), i.e. the doctrine this CR deletes.
6. A primary-checkout Pod can never earn the HAL tell — `missions.ts` joins ship→CR on
   `worktree.branch`, and a primary registers with `branch: main`, matching no CR.
7. `plugins/cyberfleet/readme.md` credits the `cyberfleet` console with identity/messaging/spawning —
   all `cyberlegion`'s. Pre-existing drift on the marketplace front door.
8. `packages/cyberfleet/.agents/spec` now has ZERO behavioral nodes; `missions` is the highest-value
   backfill (it is the CLI's whole reason to exist and its `hal` field is load-bearing for Pod).
