---
name: manage-model-runners
cr: manage-model-runners
target-spec: .agents/specs/aced
ledger-shard: .agents/specs/aced/ledger/manage-model-runners.3e2d9d.jsonl
status: active
todos:
  - id: intake
    status: done
    content: branch + plan brief + run-start leash to ledger shard
  - id: explore
    status: done
    content: authored both node READMEs (Use Cases + Fit) + .feature; cold spec-judge PASS after Fit + 2 advisories fixed
  - id: spec-gate
    status: done
    content: froze both .feature, root spec->approved, spec gate line in ledger shard
  - id: deliver
    status: done
    content: built both SKILL.md + README + eval suites (24 golden cases, 1:1 with frozen scenarios); audit validate green
  - id: impl-gate
    status: done
    content: cold impl-judge — all 24 frozen scenarios PASS, no code gaps; root spec->implemented, impl gate line in ledger; pnpm verify green
  - id: handoff
    status: in_progress
    content: commits per unit, PR, file eval-run measurement follow-up CR
---

# Mission: ACED `manage` gateway + `manage-model-runners` engine

Add a manage-level front door to ACED (thin dispatcher, modeled on `plugins/sdd/skills/manage`) and
its first engine `manage-model-runners`: an internal, non-invokable skill that manages a per-model
runner agent-def family (`~/.agents/agents/model-runner-<model>.md`) used to run skills under a real
model for cost/quality benchmarking.

**Locked decisions:** one def per model (not model×effort); additive CRUD — add-missing + list +
remove-only-on-explicit-request (never auto-remove); engine non-invokable, reached via `manage`;
lives in ACED `config-authoring/`; gateway node placement (top-level `manage/` vs under
`config-authoring/`) finalized by Warden at handoff.

Full plan: `~/.claude/plans/zany-hatching-blossom.md`.

## NEXT

Handoff: both gates passed, pnpm verify green. Commit in units (spec nodes, impl+evals, provenance),
open PR to `next`/`main`, then file the follow-up CR: the eval-run measurement layer that actually
runs a skill under each runner def and captures token/cost + a model recommendation. Retire this plan
once merged + doctrine-distilled.
