---
name: "github-38: ACES implementation overhaul to the target spec"
overview: "Run the ACES project spec (.agents/specs/aces) through the new SDD mission loop as a self-host of the sdd-new tooling. Explore one capability at a time: fill each behavioral unit's ## Use Cases and author its boolean .feature suite, dogfooding the real sdd-new explore loop (governance-resolution + inline spec-producer + cold sdd-spec-judge + the three .mts gates). Bind custom ACES governance bars. Freeze at the spec gate, then overhaul plugins/aces to the frozen contract and pass the impl gate. Meta-plan: ~/.claude/plans/read-agents-plans-github-34-plan-md-plan-humble-whistle.md."
todos:
  - id: intake
    content: "Step 1 — open CR #38, scaffold this plan brief. DONE."
    status: completed
  - id: phase-a-bars
    content: "Phase A — author custom ACES bars (aces-builder-spec, aces-builder-impl) as user-invocable:false governance skills under plugins/aces/skills/ with metadata{artifact-type,actor,gate,compose}; wire into .agents/universal-plugin.json ACES squad governances map; verify with governance-resolution.mts --root . --artifact-type skill. Provisional (build-to-learn); harden at the spec gate."
    status: pending
  - id: phase-b-eval-run
    content: "Phase B.1 — eval-run/: run, compare, report. Proof unit = eval-run/run (validate the full loop end-to-end first). artifact-type skill."
    status: pending
  - id: phase-b-sdd-roles
    content: "Phase B.2 — sdd-roles/: scenario-writer, spec-validator, implementer, judge (artifact-type subagent). Reconcile with the Phase-A bars (same criteria, two homes)."
    status: pending
  - id: phase-b-config-authoring
    content: "Phase B.3 — config-authoring/: define-agent, define-governance (skill)."
    status: pending
  - id: phase-b-suite-authoring
    content: "Phase B.4 — suite-authoring/: add, improve (skill)."
    status: pending
  - id: phase-b-registry
    content: "Phase B.5 — registry/: init-aces (skill) — idempotent squads[] upsert + fail-closed-on-corrupt-JSON."
    status: pending
  - id: phase-c-glossary-acceptance
    content: "Phase C — glossary/ ## Subject (reference, no .feature); acceptance/ e2e .feature (author→run→improve→compare loop + regression gate)."
    status: pending
  - id: phase-d-spec-gate
    content: "Phase D — spec gate: re-judge all suites; freeze each .feature; create .agents/specs/aces/ledger.jsonl with the spec gate line; set root status: approved + approval.spec. check-spec-state --root .agents/specs green (gate-line floor enforced)."
    status: pending
  - id: phase-e-deliver
    content: "Phase E — deliver: vocab sweep (sdd-operator→conductor/automaton, create-spec→start-mission, spec-governance→spec-format+suite-format, plan-producer→solution-producer, drop aligned/domain-plugin) + Model-B governance-load alignment per agent; verify via aces-implementer; impl gate → status: implemented + impl ledger line."
    status: pending
  - id: phase-f-handoff
    content: "Phase F — handoff: pnpm verify green; PR carries it (next → main); update this ## NEXT; update memory project_aces_spec / project_spec_layout."
    status: pending
isProject: false
---

# Plan — github-38: ACES implementation overhaul to the target spec

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: [github-38](https://github.com/cyberuni/cyber-skills/issues/38) — overhaul `plugins/aces/`
> to the **target** ACES spec at `.agents/specs/aces/`. Supersedes the ACES follow-up from the
> retired github-35 plan. Runs on branch `next` (depends on the sdd-new tooling that lives there).

## What we are doing

Dogfood the new SDD (`plugins/sdd-new`) by carrying the ACES project spec through its mission
loop. The ACES spec tree + registry entry are already on the new schema; what is missing is the
behavior — **no `.feature` suites exist** (12 behavioral units have `## Use Cases` placeholders),
the glossary has no `## Subject`, ACES binds **no custom bars**, and `plugins/aces/` still speaks
the retired SDD vocabulary. We author every suite via the real explore loop, bind custom ACES
bars, freeze at the spec gate, then rebuild the impl from the frozen contract.

The full operating model, phase detail, and verification live in the meta-plan:
`~/.claude/plans/read-agents-plans-github-34-plan-md-plan-humble-whistle.md`.

## NEXT — resume here

**▶ Phase A — bind the custom ACES bars.** Author `aces-builder-spec` (the agent-scenario
contract criteria from `plugins/aces/agents/aces-spec-validator.md`) and `aces-builder-impl` (the
eval-suite conformance criteria from `aces-implementer.md`) as `user-invocable:false` governance
skills under `plugins/aces/skills/`, each with `metadata: { artifact-type, actor, gate, compose:
union }`. Wire them into `.agents/universal-plugin.json` (ACES squad `governances`:
`builder-spec` → `aces-builder-spec`, `builder-impl` → `aces-builder-impl`; others stay null).
Verify: `node plugins/sdd-new/skills/validate-spec/scripts/governance-resolution.mts --root .
--artifact-type skill` names them in the resolved `bars[]`.

**THEN — Phase B explore, one unit at a time.** Start with `eval-run/run` as the end-to-end proof
of the loop, then fan out. Per unit: resolve → inline spec-producer authors `## Use Cases` +
`<unit>.feature` (backfill from impl source, write to the new vocabulary) → spawn cold
`sdd-spec-judge` over spec.md+.feature only → `check-feature.mts` + `check-spec-state.mts --root
.agents/specs` green → iterate (cap 3). One commit per unit; `status` stays draft.

## The loop (per behavioral unit)

1. `governance-resolution.mts --root . --artifact-type <skill|subagent>` — confirm ACES resolves.
2. Inline spec-producer (`sdd:spec-producer-governance`): write the README `## Use Cases` +
   sibling `<unit>.feature` (boolean Gherkin; observable `Then`; every use case ≥1 scenario;
   `# ── <stage> ──` sections when >6 scenarios; `@rubric` only where a rubric is the contract).
   Write **no** control frontmatter.
3. Spawn `sdd-spec-judge` (cold); fold its `{director,builder,architect}` verdict + open markers.
4. `check-feature.mts --root .agents/specs` + `check-spec-state.mts --root .agents/specs` green.
5. Cap 3; on cap/blocked do not auto-accept — surface failing scenarios, ask accept/loop/change.

## Behavioral units (12) → impl target

| Spec node | Impl | artifact-type |
|---|---|---|
| eval-run/run | skills/run | skill |
| eval-run/compare | skills/compare | skill |
| eval-run/report | skills/report | skill |
| sdd-roles/scenario-writer | agents/aces-scenario-writer | subagent |
| sdd-roles/spec-validator | agents/aces-spec-validator | subagent |
| sdd-roles/implementer | agents/aces-implementer | subagent |
| sdd-roles/judge | agents/aces-judge | subagent |
| config-authoring/define-agent | skills/define-agent | skill |
| config-authoring/define-governance | skills/define-governance | skill |
| suite-authoring/add | skills/add | skill |
| suite-authoring/improve | skills/improve | skill |
| registry/init-aces | skills/init-aces | skill |

Plus: glossary/ (reference, `## Subject`) and acceptance/ (e2e `.feature`).

## Resolved decisions

- **Self-host on the live ACES tree** — no aces-new; explore authors specs in place, deliver
  overhauls `plugins/aces/` in place (backfill/overhaul, not a parallel rebuild).
- **Bind builder-spec + builder-impl custom**; director/architect bars stay SDD default unless
  explore surfaces a real ACES need (confirm, don't pre-invent).
- **Vocabulary sweep happens at deliver** (Phase E), from the frozen spec — not pre-explore — so
  it respects "spec the behavior, never hand-edit the impl to pass."
- **Branch:** work on `next` (matches the SDD effort's integration branch; #38 needs sdd-new).
