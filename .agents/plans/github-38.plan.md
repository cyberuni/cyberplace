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

**▶ MISSION COMPLETE (2026-06-29) — ACES is `status: implemented`.** All phases A–F landed on
`next`; both gates passed (self-asserted `by: agent`, async review queue). The dogfood of the
sdd-new explore loop carried a second real project end-to-end without tooling changes — every
behavioral unit cold-judged ALIGNED at the spec gate, every unit cold-impl-judged conformant at
the impl gate (ADR-0016; the 4 found gaps were fixed in code and re-verified). Custom
`aces-builder-spec`/`aces-builder-impl` bars bound + resolving; plugin impl swept to the new
vocabulary + Model-B governance loads. `pnpm verify:specs-new` green; `pnpm verify` green except a
**pre-existing, untracked, non-mission** knip flag on `plugins/sdd-new/skills/read-specs-frontmatter/`
(not part of #38 — left untouched). Mission commits: `95fcc4c`→`6d40af7` (17 commits).
**REMAINING (owner's call):** open the `next → main` PR for the broader SDD effort (carries #34 +
#38); this mission did not push or open it (outward-facing — left to the user).

---

**Phases A–D record (superseded by the line above):** The ACES project spec reached
**`status: approved`** — all 14 `.feature` files (12 behavioral units + 2 acceptance e2e)
are `@frozen`, the durable spec gate line is in `.agents/specs/aces/ledger.jsonl`, and
`pnpm verify:specs-new` is green over the whole tree. Every behavioral unit was cold-judged ALIGNED
on the 3-lens {director,builder,architect} set, dogfooding the real sdd-new explore loop; the
custom `aces-builder-spec`/`aces-builder-impl` bars are bound and resolve. Commits: `95fcc4c`
(intake) `c2a4e39` (bars) `b185035` `84e1f0e` `e8c7d9c` `7d161f7` `81ac5c7` `58b8e05` `ff1f1a9`
(unit suites) `be93a7c` (spec gate). Spec-gate ratification self-asserted `by: agent` within leash
→ ACES draft lands in the async review queue (the user may re-open any frozen `.feature`).

**▶ NEXT ACTION — Phase E (deliver): rebuild `plugins/aces/` from the frozen specs.** This is the
in-place impl overhaul, done now (post-freeze) so it respects "spec the behavior, never hand-edit
the impl to pass." Two parts:
1. **Vocabulary sweep + governance-load alignment** across `plugins/aces/` agents + skills +
   `readme.md`: `sdd-operator`/"the Operator" → `conductor`/`automaton`; `sdd:create-spec` →
   `sdd:start-mission`; `sdd:spec-governance` → `sdd:spec-format-governance` (+ `suite-format`);
   `plan-producer` → `solution-producer`; drop `aligned`/`domain-plugin` from prose; align each
   role's Model-B bar loads (spec-producer/judge load the ACES `builder-spec`; impl-judge/producer
   load `builder-impl`); refresh the `init-aces` canonical entry to show the bound bars.
2. **Impl gate (Approved → Implemented):** verify each unit against its frozen `.feature` via the
   ACES impl-judge, then advance `spec.md` to `status: implemented` + `approval.impl` + the durable
   `impl` gate line in `ledger.jsonl`.

Then **Phase F** — `pnpm verify` green, PR (next → main) for #38, update memory.

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
