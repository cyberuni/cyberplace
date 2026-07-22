---
cr-ref: 304-m3-eval-artifact-migration
source: https://github.com/cyberuni/cyberplace/issues/304
status: draft
todos:
  - content: "[SETTLED by owner] DESIGN DECISION (todo 1). (1) Population = external subjects + self-dogfood ACED skill nodes, delivered ONE NODE AT A TIME (304-M2 cadence). (2) Run output at .agents/aced/results/<target>/ — OUT of the spec tree, git-ignored, ignore rule written idempotently by init-aced (issue #356 a). (3) Discovery reuses SDD spec-location conventions (ADR-0019 anchors) + eval.md marker; no ACED-specific path constant (issue #356 b). Recorded in ledger 304-m3-eval-artifact-migration.7935ff.jsonl."
    status: completed
  - content: "Gap A — colocate eval.md per eval-target node: create .agents/specs/<project>/…/<node>/eval.md (subject = the target config's path; run policy = eval.layers / judge.model / judge.default_threshold / trigger.{activation_threshold,runs}). Default run-policy template from the two legacy targets: layers [trigger, behavior], judge sonnet, default_threshold 4, trigger.runs 3 — confirm per node."
    status: pending
  - content: "Gap B — migrate the 2 legacy eval targets out of artifacts/specs into project-spec nodes: aced-create-spec (subject plugins/aced/skills/create-spec/SKILL.md) and sdd-orchestrator (subject plugins/sdd/agents/sdd-orchestrator.md). Move eval.md into the node dir, port/retire golden-set/ + trigger/ into the frozen .feature (@rubric inline + @trigger Examples), retire the artifacts/specs dir."
    status: pending
  - content: "Vocabulary/glossary cleanup: .agents/specs/aced/glossary.md still defines 'eval suite' as eval.md + golden-set/ (rewrite to the .feature model). Frozen suites carrying golden-set near-miss vocab (define-agent:36, define-skill:52/58, define-governance:31, scenario-writer:29/91, skillify:27/37, contribute-skill:29/48, improve:22, workflows/eval-loop:8) — each a Clearance-bound re-open."
    status: pending
  - content: "Docs + fixtures (Quill domain): ~140 golden-set/*.md fixtures + website/docs advertising the retired 1-5 scalar contract (apps/website .../aced/{run,report,overview,add-scenario}.md, docs/specs/aced/design.md, artifacts/specs/aced-plugin/spec.md) — tracked in github-263-op6-m3; likely a Quill node."
    status: pending
  - content: "Retire artifacts/specs/: once every target's eval.md + .feature live in project-spec nodes, remove the artifacts/specs/*/ dirs (legacy golden-set/, trigger/, eval.md). Confirm nothing in the ACED runtime still reads that tree."
    status: pending
---

# CR 304-M3 — ACED eval-artifact migration to the project-spec model

Sibling track to 304-M2 under the same CR (#304). M2 re-derives each ACED behavioral-leaf node's
frozen `.feature` + README from its CFG. **M3 makes the "everything in the project spec" artifact
model physically real** — the model the owner decided during M2 (see the M2 ledger `correction` entry,
`304-m2-eval-suite-sweep.c38aa5.jsonl`).

## The decided model (target end state)

A target's ACED eval lives entirely in its project-spec node, `.agents/specs/<project>/…/<node>/`:

- `README.md` — the 4-section node spec (M2 delivers this)
- `<node>.feature` — the frozen suite = the single eval source (boolean + `@rubric` inline + `@trigger`
  Examples), frozen at the spec gate (M2 delivers this)
- `eval.md` — colocated eval binding: **subject + run policy only** (M3 creates this)
- `results/` — timestamped run records (created at first `run`)

`artifacts/specs/` is retired. ACED discovers a node through the SDD spec tree (the node's `eval.md`
names the subject). The ACED skills already point at this model (M2 commit `9894d33c` swept the
location wording across `run` / `compare` / `report` / `improve` / `add-scenario` / `aced-impl-producer`).

## Why this is a SEPARATE mission from M2 (not folded in)

Owner call: continue the M2 sweep as-is (README + `.feature` per node) and track the eval-artifact
work here. The two are disjoint populations today:

- **M2 nodes** = ACED's own skill SDD specs (`.agents/specs/aced/…`) — README + `.feature`, **never had
  an `eval.md`**.
- **The eval targets** = the 2 dirs under `artifacts/specs/` that carry an `eval.md`
  (`aced-create-spec`, `sdd-orchestrator`) — **not in the project-spec tree at all**.

So `eval.md` is not created "along the way" by M2; M3 owns it.

## Unit sequence (each its own explore → spec gate → deliver → impl gate; ONE at a time)

1. **results-location infra** — `run` node (`.agents/specs/aced/eval-run/run`) revise output path from
   `results/<ts>.json` in the node dir → `.agents/aced/results/<target>/`; `init-aced` gains the
   idempotent `.gitignore` write. NOTE: `init-aced` has NO spec node yet — explore decides scaffold vs
   not-behaviorally-spec'd.
2. **Gap B: migrate `aced-create-spec`** — eval.md colocated in project-spec node; golden-set/ + trigger/
   → frozen `.feature` (@rubric inline + @trigger Examples); retire `artifacts/specs/aced-create-spec/`.
3. **Gap B: migrate `sdd-orchestrator`** — same shape.
4. **Gap A: colocate eval.md** on the chosen self-dogfood ACED skill nodes (population per decision).
5. **vocab/glossary cleanup** → retire `artifacts/specs/`.

Gap-B migrations and frozen-suite vocab rewrites are Clearance-bound re-opens; surface each to the owner.

## NEXT — resume here

**Unit 1 (results-location infra) — SPEC GATE PASSED (both units), now DELIVER.**

Spec gate done: `setup/ignore-run-output/` frozen (9 scenarios), `run` additive scenario frozen (self-clears).
Cold aced-spec-validator ALIGNED round 2. Gate lines + judge-iteration correction recorded. ADR-0030 landed;
init-aced multi-facet doctrine settled (registry/ = role-map, setup/ = ignore-setup, each 1:1 subject).

Deliver (build-to-keep against the frozen suites):
1. Write `plugins/aced/skills/init-aced/scripts/ensure-results-ignored.mts` — append `.agents/aced/results/`
   as the LAST line of root `.gitignore` (create if absent; no-op if already effectively ignored via
   `git check-ignore`; fail-closed pre-write on no-repo / unwritable). Last-match-wins guarantees the ignore.
2. Write its colocated deterministic test `.agents/specs/aced/setup/ignore-run-output/ignore-run-output.test.mts`
   (one verification per frozen scenario + mutation controls).
3. `init-aced/SKILL.md` — add one glue step invoking the engine.
4. `run/SKILL.md:89` — change output path from the node's `results/` to `.agents/aced/results/<target>/`.
5. Rebase onto latest main, then IMPL GATE — leash is `auto-spec`, so STOP and surface the impl gate to the
   owner for ratification (unless owner raises the leash to auto-all, as in M2).

Leash: `auto-spec`, by user (ledger `304-m3-eval-artifact-migration.7935ff.jsonl`).
Then units 2-5 per the sequence above (Gap B migrations, Gap A eval.md colocation, vocab cleanup, retire artifacts/specs/).
