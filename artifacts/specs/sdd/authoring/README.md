# authoring/ — the shared authoring capability (`create-spec` / `revise-spec`)

The **shared authoring capability**: take a CR and **grill it into a concrete delta to the
project spec + behavior suite**. The CR is the abstraction the human raised; authoring is
where it becomes real changes to the `spec.md` prose and the `.feature` suite (and from
there, code, in `../mission/`).

**One capability, two callers.** Authoring is driven (a) **by a human directly**,
interactively, when a person comes through the `../gateway/`; and (b) **by the mission
autonomously**, as the **explore** phase (step 2) of the Mission Loop (`../mission/`,
`../design/loops.md`), where the operator spikes to learn and shows intermediate results to
steer the contract. Explore is the mission's *use* of this capability — authoring is not
"the explore phase" exclusively. Either way it **self-clears** when the agent can confidently
generate a good diff, escalating to the human only on the hard floor
(`../design/autonomy-rubric.md`).

`.feature` is **part of the behavior suite, never part of the CR** — authoring *writes* the
suite delta, it does not receive it.

## Owns

- The **grilling workflow** — pressure-test the CR's intent into spec prose plus boolean
  scenarios, in two variations of this same step:
  - **create** — capability content that does not exist yet; scaffold the prose and an
    initial set of scenarios. Grill the user up front (the producer has no user channel):
    for new behavior with a missing What / Why / surface, ask 3–5 targeted questions — the
    core problem and who experiences it, observable behavior from the user's view, the
    public interface (commands, signatures, events), known edge cases or explicit
    non-goals, and which reviewers must be heard. For **backfill** (the behavior already
    exists in code), skip the grill — the producer reads source, tests, and history.
  - **revise** — existing prose and scenarios; nothing to scaffold. Interrogate what is
    written, find what is weak, missing, or stale, and tighten it.
- The **spec gate** — the verdict on the spec + suite diff before it becomes the contract:
  self-clear when the assessment reads safe, escalate on the hard floor, and on approval
  **freeze** each touched `.feature` file by setting its `@frozen` tag, and record the verdict
  as a durable per-CR `gate` ledger line (`../design/provenance-model.md`).

Gate *rules* live in `../design/`: legal-state transitions and the freeze model in
`lifecycle-model.md`, the self-clear-vs-escalate bar and the two-kind hard floor in
`autonomy-rubric.md`, the provenance shape in `provenance-model.md`. This folder is the
*behavior* that enacts them — reference the rules, do not restate them.

## The grilling workflow

Two phases, in order: **grill the prose first** to settle the contract's intent, **then**
bring the `.feature` into line. Editing scenarios before the prose is settled wastes work —
the scenarios chase a moving target.

Phase 1 — the prose:
- **Scope** — is the touched behavior still *one* coherent thing? Grilling that reveals a
  bundle of several is the moment to recommend a split (a `../corpus/` operation), not to
  grow a monolith.
- **Use cases / entry points** — is each trigger, input, and outcome still accurate? Did
  the change add, remove, or alter an entry point?
- **Design decisions** — does any decision now contradict the change, a sibling capability,
  or a governance? Reconcile stale terms and claims.
- **Open items** — resolve every `<!-- open: -->` marker the diff touches; leave none
  dangling.

Phase 2 — the suite:
- Every use case maps to one-or-more scenarios; add scenarios for new behavior, retire
  scenarios for removed behavior.
- Each scenario stays a pure boolean `Given`/`When`/`Then` (or the rubric form per
  `../design/suite-style.md`); tighten any that drifted.
- Step-down ordering and stage grouping still hold after the edits.

**Producer/judge separation.** The **producer** authors the diff (spec prose plus
scenarios); a **distinct judge** actor verifies it. The gate behavior lives in this folder,
but the judge stays a separate actor whose verdict the gate consumes — authoring never
collapses producing and judging into one voice. The producer self-aligns against the same
governances the judge checks against.

## The spec gate

The gate decides on the spec + suite **diff** the grilling produced. It runs the distinct
judge actor, derives the **leash** (the four-dimension assessment in
`../design/autonomy-rubric.md`), and takes the verdict accordingly:

- **In leash** (every dimension reads safe): self-assert — the diff lands **provisionally**
  into the asynchronous review queue. Still emit the spec digest plus gate report, flagged
  *"agent-asserted — ratify or kick back."*
- **Gated** (the leash stops, or the hard floor fires): present the digest above the gate
  report so the human sees what they are deciding, then take the human verdict.

**Hard floor escalations** (`../design/autonomy-rubric.md`), the only mandatory human
stops: **authorization** — a breaking change (narrowing or deleting an e2e scenario, or
breaking a published contract), escalated for acknowledgment unless the CR pre-authorized
it; and **resolution** — a logical contradiction inside the suite (Scenario A says yes,
Scenario B says no), which the human disambiguates. Everything additive / internal / minor
self-clears.

**Never advance** — by self-assertion or human verdict — with judge failures, any remaining
open markers, or a misaligned suite. Those fail the confidence dimension, so they forbid
self-assertion too; report the blockers for the user to fix.

The three gate verbs at the spec gate (it judges the *contract*, so each verb edits the
contract): **approve** → land the diff and freeze each touched `.feature` file (set its
`@frozen` tag); **change** → revise the diff, nothing freezes yet; **reject** → scope-kill,
drop the delta.

**Freeze on approval is per file.** Each touched `.feature` is **hard-frozen** via its own
`@frozen` tag — no scenario edits to a frozen file without a ratified re-open; untouched
files keep their state. An *additive* scenario folds into a frozen file without unfreezing
it (self-clears); a *narrowing/rewriting* edit unfreezes its file and fires **Clearance**.
`spec.md` is **kept aligned, never frozen** — editable, but it may not contradict a frozen
scenario; that invariant is enforced by the alignment check and the judge, not by a flat
freeze of the prose. Vocabulary is **freeze/unfreeze**; "lock" is reserved for the
concurrency layer. Freeze rules: `../design/lifecycle-model.md`.

## Provenance and alignment

Before any verdict the gate applies the structural provenance checks
(`../design/provenance-model.md`): a malformed `produced-by` entry and an off-enum
`correction` cause **fail closed**; an uninstalled-but-valid recorded producer only
**flags**. A required role with no resolvable producer also fails closed. The gate stays
verdict-only — it writes no setup frontmatter to resolve any of these.

## Scenarios

Unit scenarios for the authoring capability **colocate here**; the e2e / cross-capability
outcome scenarios live in `../acceptance/`.
