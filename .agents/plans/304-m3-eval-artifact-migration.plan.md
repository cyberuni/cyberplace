---
cr-ref: 304-m3-eval-artifact-migration
source: https://github.com/cyberuni/cyberplace/issues/304
status: draft
todos:
  - content: "DESIGN DECISION (owner): which project-spec behavioral-leaf nodes are runnable ACED eval targets and so get a colocated eval.md? All ACED skill nodes (self-dogfood)? Only real external subjects? Decide the population before creating any eval.md."
    status: pending
  - content: "Gap A — colocate eval.md per eval-target node: create .agents/specs/<project>/…/<node>/eval.md (subject = the target config's path; run policy = eval.layers / judge.model / judge.default_threshold / trigger.{activation_threshold,runs}). Default run-policy template from the two legacy targets: layers [trigger, behavior], judge sonnet, default_threshold 4, trigger.runs 3 — confirm per node."
    status: pending
  - content: "Gap B — migrate the 2 legacy eval targets out of artifacts/specs into project-spec nodes: aced-create-spec (subject plugins/aced/skills/create-spec/SKILL.md) and sdd-orchestrator (subject plugins/sdd/agents/sdd-orchestrator.md). Move eval.md into the node dir, port/retire golden-set/ + trigger/ into the frozen .feature (@rubric inline + @trigger Examples), retire the artifacts/specs dir."
    status: pending
  - content: "Vocabulary/glossary cleanup: .agents/specs/aced/glossary.md still defines 'eval suite' as eval.md + golden-set/ (rewrite to the .feature model). Frozen suites carrying golden-set near-miss vocab (define-agent:36, define-skill:52/58, define-governance:31, scenario-writer:29/91, skillify:27/37, contribute-skill:29/48, workflows/eval-loop:8) — each a Clearance-bound re-open."
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

## NEXT — resume here

**Do not start until the DESIGN DECISION (todo 1) is answered by the owner:** which nodes are runnable
eval targets. That population determines Gap A's scope. Until then, M3 stays `status: draft`.

Sequence once unblocked: design decision → Gap A (colocate eval.md on the chosen targets) → Gap B
(migrate the 2 legacy targets, retire their golden-set) → vocab/glossary + docs cleanup → retire
`artifacts/specs/`. Gap-B target migration and the frozen-suite vocab rewrites are Clearance-bound
re-opens; surface each to the owner.

Leash: unset (inherits `auto-spec` from the CR umbrella when started). No ledger shard yet — create
`.agents/specs/aced/ledger/304-m3-eval-artifact-migration.<hash>.jsonl` at mission start.
