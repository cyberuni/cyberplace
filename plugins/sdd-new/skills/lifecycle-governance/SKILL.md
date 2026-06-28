---
name: lifecycle-governance
description: "Internal skill: the SDD spec lifecycle contract — the root spec.md frontmatter schema, status enum, status transitions, open-marker gating, and the per-file freeze state-transition. Loaded by sdd, validate-spec, start-mission, the conductor, and the spec-judge. Not triggered by users directly."
user-invocable: false
---

# SDD Lifecycle Governance

The state machine a `spec.md` moves through, and the frontmatter that records it. This skill is the
canonical home consumers load instead of restating it. Write-ownership of these fields lives in
`sdd:ownership-governance`; legality of field combinations and gate verdicts in
`sdd:gate-validation-governance`; the ledger shape in `sdd:combat-log-governance`.

## Frontmatter schema

The **root** `spec.md` carries YAML frontmatter:

```yaml
---
status: draft           # draft | approved | implemented | deprecated
artifact-types:         # the artifact-types / squad keys this project touches: e.g. skill,
  - skill               # subagent, command, agents-section, npm-package, docs. Resolution is
                        # per file (each file's artifact-type -> its squad). Omit for plain code.
aligned: false          # true once the current layer's artifacts are synced
strategy:               # run-level initial evaluation (leash + approach)
  leash: auto-all       # first-evaluated reach: auto-none | auto-spec | auto-all
  by: derived           # derived | user
  approach: [no-spike, mocks, worktree]   # blast-radius-containment choices
approval:               # per-gate verdict
  spec:                 # verdict: approve | pause | reject
    verdict: approve
    by: agent           # agent (self-asserted, provisional) | <human name> (ratified); omitted on pause
    cause: dimension    # dimension | ceiling — what drove the verdict
    why:                # verdict derivation (agent self-assertion or pause)
      floor:       <none | clearance | conflict | compatibility | consent>
      blast:       <low|high — reason>
      novelty:     <low|high — reason>
      confidence:  <low|high — reason>
  impl: { verdict: approve, by: <human name> }   # ratified — no why needed
produced-by:            # who produced each artifact; see sdd:combat-log-governance
  spec-producer: <plugin>:<agent>
domain-plugin:          # map: artifact-type -> owning plugin, when an artifact-type is contested
  <artifact-type>: <plugin>
---
```

Open input is recorded in the body as `<!-- open: ... -->` markers, not in frontmatter.

`status` is the base schema; `artifact-types`, `aligned`, `strategy`, `approval`, `produced-by`, and
`domain-plugin` are the SDD-workflow additions.

**`artifact-types` is the resolution axis, set once at scaffold.** It is the only field a plugin's
`domains[]` is matched against during delegate resolution (`sdd:plugin-contract-governance`):
resolution is **per file** — each file's artifact-type resolves its own squad. It draws from the
artifact-type vocabulary the project's registered plugins cover (for agent-configuration work:
`skill | subagent | command | agents-section`). Plain-code specs omit it.

**This whole frontmatter is root-`spec.md`-only.** A capability node README (a `reference` or
`behavioral` spec — `sdd:spec-format-governance`) carries **only** its `spec-type` marker, never a
lifecycle field. Folders are views, never lifecycle units: the project has **one** lifecycle, on the
root.

## Spec discovery

A spec is defined by its **shape, not its location**: an SDD spec is any git-tracked `spec.md` whose
frontmatter `status` is one of the enum values below. There is no spec registry to keep in sync — to
locate specs, glob `**/spec.md` repo-wide, keep git-tracked files whose `status` is in the enum. A
`spec.md` without a lifecycle `status` is not an SDD spec.

**`aligned` and commit timing.** `aligned: false` means the current layer's artifacts are being
updated or contain unresolved markers; `aligned: true` means the layer is synced (which layer
depends on the gate — `sdd:gate-validation-governance`). Do not commit SDD artifacts while their
spec is `aligned: false`.

## Status enum

| Status | Meaning |
|---|---|
| `draft` | Contract can still evolve; not yet implementable as a fixed bar |
| `approved` | Contract is frozen; ready to implement against |
| `implemented` | Implementation passed the impl gate |
| `deprecated` | Historical spec only; not implementable work |

## Status transitions

```mermaid
stateDiagram-v2
    [*] --> draft: start-mission (new or backfill)
    draft --> approved: spec gate (validate-spec --target spec)
    approved --> implemented: impl gate (validate-spec --target impl)
    approved --> draft: behavior change (re-open)
    implemented --> draft: behavior change (re-open)
    draft --> deprecated: Director-lens kill (scope)
    approved --> deprecated
    implemented --> deprecated
```

- **Draft → Approved** is the **spec gate**: judges `spec.md` + the `.feature`.
- **Approved → Implemented** is the **impl gate**: judges the implementation against the frozen `.feature`.
- A behavior change after approval is **not** a direct edit — revert to `draft` and re-pass the spec
  gate. Re-open is a lightweight "change needed" flag an auditor sets; only re-approval is the heavy
  positional act.
- Deprecation retains the spec as a historical record; never treat it as implementable.

## Freeze (per suite file)

Reaching a spec-gate `approve` **freezes** the `.feature` files the CR *touched* — each via its own
feature-level **`@frozen` tag** (set/cleared per file; the vocabulary is **freeze / unfreeze**, never
lock/unlock — lock is the concurrency layer, `cr-concurrency`). Files the CR did not touch keep
whatever state they held. "Which scenarios are the frozen contract" is answered by the set of
`@frozen` files — a plain per-file flag, no computed baseline. The `@frozen` tag is metadata,
excluded from the content the freeze protects; toggling it is not a scenario edit. The matching
write constraint ("never write a frozen `.feature`") is in `sdd:ownership-governance`.

- **The unfreeze trigger is risk, not phase.** *Narrowing or rewriting* a scenario unfreezes its
  file (in explore or deliver alike) — at the gate that is **Clearance** (`sdd:autonomy-rubric` /
  the autonomy bar), contract narrowed → escalate. An *additive* scenario never unfreezes its file:
  it widens the contract, cannot break existing impl, and **self-clears** — folding into the frozen
  file under the conductor's authority, logged as a detail-adjustment.
- **`spec.md` is kept aligned, never frozen** — the readable abstraction of the suite, free to be
  reworded/restructured as long as it does not contradict a frozen scenario. Enforced by the
  spec-judge applying the Builder (coverage) lens, not by freezing the prose.
- **The ledger is never frozen and never gated** — it keeps appending across the whole lifecycle,
  including while files sit `@frozen` (`sdd:combat-log-governance`).
- **Spec owns behavior.** If the implementation disagrees with `spec.md`, the implementation is
  wrong — fix it, or unfreeze the relevant file for a new cycle. The **impl gate** is the only place
  a frozen file reopens — via the Director-lens revert (building proved the contract wrong). Rare
  and deliberate.

**Two modes.** Before a file's freeze, exploration may update `spec.md`, that `.feature`, the plan
(brief + ordered `todos`), and spikes. After it freezes, implementation proceeds against it; every
frozen scenario must pass the full impl-gate run before `implemented`.

## Open-marker gating

Missing contributor input is recorded as `<!-- open: ... -->` in the owning artifact. Open markers
must be resolved (count = 0) before a spec may advance to `approved`; they are permitted at `draft`
(markers block only the *gate*, not the draft state). `sdd:gate-validation-governance` defines how
markers interact with legal state; producers emit gaps that the conductor turns into markers
(`sdd:ownership-governance`).
