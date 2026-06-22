---
status: draft
type: feature
blocked-by: []
aligned: false
---

# SDD Escape Hatch

---

## What

A scope boundary for SDD: some requested work is **not spec-able** as a feature of a subject, and SDD should recognize it and let it **escape** the lifecycle (draft → spec gate → implement → impl gate) rather than forcing an empty ceremony around it. The escape is explicit and recorded, not silent.

An SDD spec describes a **subject** — a `project` (a plugin or repo) or a `feature` of that subject — and a feature is a unit of the subject's observable behavior or capability. Adding CI, publishing a GitHub Pages site, adopting Vitest, or standardizing on pnpm are all **features of the repo**: each has observable behavior that can be frozen as scenarios.

Other work has no such subject behavior to freeze because it operates **on the SDD representation itself** — reorganizing the spec corpus, retyping specs `project`/`feature`, splitting or merging specs, relocating a contract across specs, building graph tooling over specs. This work changes how SDD models things, not what the subject does. The restructuring that introduced spec typing and the `sdd-contract-registry` split is itself an example: it could not be authored as a draft-then-gate feature because there was no subject behavior to put in a `.feature`.

This feature owns the **policy** — what is in and out of SDD scope, and that out-of-scope work escapes — and tracks the **open problem** of how to recognize it reliably. Routing mechanics live in the `sdd` gateway.

---

## Why

Forcing non-spec-able work through the SDD lifecycle produces ceremony with no payoff: a draft with no freezable scenarios, a spec gate with nothing to judge, an impl gate with no behavior to verify. Worse, it trains agents and users to write hollow specs to satisfy the process, which erodes the meaning of the artifacts. Recognizing the boundary keeps SDD focused on subject behavior and lets representational and meta-work proceed by ordinary means, while still recording that the escape was a deliberate decision rather than an oversight.

---

## Design decisions

### Two kinds of work: subject-feature vs representation

| Kind | Goes through SDD? | Examples |
|---|---|---|
| **Subject feature** — observable behavior or capability of a project/repo | Yes | add CI, publish GitHub Pages, adopt Vitest, standardize on pnpm, a new CLI command, a build rule |
| **Representation / meta-work** — changes to how SDD models the corpus | No (escapes) | retype specs `project`/`feature`, split/merge specs, relocate a contract across specs, regenerate derived views, reorganize spec folders |

The distinguishing test is whether there is **subject behavior to freeze as scenarios**. If the work's only "behavior" is the shape of the spec corpus itself, it is representation work and escapes.

### Escape is explicit and recorded, never silent

When work is recognized as out of scope, SDD does not quietly skip it: it states that the work is escaping the lifecycle and why, so the decision is auditable. No draft spec is created for escaped work.

### Ambiguity defaults to SDD

When it is unclear whether work is a subject feature or representation work, the default is to treat it as a subject feature and route it into SDD. Escaping is the exception and must be positively recognized; the safe failure mode is one unnecessary draft, not one untracked behavior change.

### Recognition lives at the gateway, mechanism undecided

The `sdd` gateway is the classification and routing point, so the recognition signal is expected to extend gateway classification. The reliable recognition mechanism is **not yet designed** — this spec exists to register the boundary as tracked work so the mechanism can be figured out later.

<!-- open: How is non-spec-able / representation work recognized? Candidate signals to evaluate: (a) the work targets artifacts/specs/** or SDD tooling itself; (b) the user explicitly declares it meta/representation work; (c) the work has no nameable subject feature when the gateway probes for one; (d) it is a pure refactor of spec shape with no behavior delta. Decide which signals are authoritative, how they combine, and the gateway's behavior on each. -->

<!-- open: What exactly does "escape" route to? Plain execution outside SDD, a lightweight acknowledgement record, or a distinct non-feature work log? Decide whether escaped work leaves any artifact at all. -->

<!-- open: Is there meta-work that SHOULD be specced anyway (e.g., changing the lifecycle rules in lifecycle-governance is behavior of the SDD plugin and belongs in an SDD feature spec)? Define the line between "meta about a subject's behavior" (spec it) and "meta about SDD's representation" (escape it). -->

---

## Surface

No public interface yet; the recognition mechanism is undecided. The behavioral contract this feature commits to, independent of mechanism, is captured in the scenarios.

---

**Gherkin scenarios:** [sdd-escape-hatch.feature](./sdd-escape-hatch.feature)

---

## Related

- `artifacts/specs/sdd/sdd-skill/spec.md` — the `sdd` gateway; expected recognition and routing point
- `artifacts/specs/sdd-plugin/spec.md` — owning project
- `artifacts/specs/sdd-spec-graph/spec.md` — an example of representation work this boundary would exempt

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-escape-hatch/spec.md` |
| Scenarios | `artifacts/specs/sdd-escape-hatch/sdd-escape-hatch.feature` |
