---
cr-ref: spec-structure-governance
status: draft
target: .agents/specs/sdd/ (project spec: plugins/sdd)
touches:
  - plugins/sdd/skills/spec-structure-governance/          # NEW — the shipped bar
  - .agents/specs/sdd/common-governances/spec-structure/   # NEW — its spec node
  - plugins/sdd/skills/place-node/SKILL.md                 # drop inline copy, load the bar
  - plugins/sdd/skills/architect-spec-governance/SKILL.md  # drop inline copy, reference the bar
  - plugins/sdd/skills/formation-loop/SKILL.md             # drop inline copy, load the bar
  - plugins/sdd/skills/backfill-project-spec/SKILL.md      # load the bar for placement; keep envelope + spec-type stamping
  - plugins/sdd/skills/spec-format-governance/SKILL.md     # fix dangling `design/spec-structure.md` pointer
  - plugins/sdd/skills/check-scenario-overlap/SKILL.md     # same dangling pointer
  - plugins/sdd/skills/manage/SKILL.md                     # same dangling pointer
sources:
  - (no issue filed yet — see todo 1)
todos:
  - content: "File the issue: no shipped home for the project-spec organization law; 4 inline copies + 3 dangling pointers"
    status: pending
  - content: "Author the spec node .agents/specs/sdd/common-governances/spec-structure/README.md (spec-type: reference, ## Subject)"
    status: pending
  - content: "Write plugins/sdd/skills/spec-structure-governance/SKILL.md + README.md — tree-placement law only, SDD-specific tree EXCLUDED"
    status: pending
  - content: "Retire the 4 inline copies: place-node, architect-spec, formation-loop, backfill (backfill keeps envelope + spec-type stamping)"
    status: pending
  - content: "Fix the 3 dangling `design/spec-structure.md` pointers in shipped SKILL.mds -> the governance name"
    status: pending
  - content: "Spec gate + handoff"
    status: pending
---

# CR: spec-structure-governance — a shipped home for the project-spec organization law

## The problem

There is **no shippable artifact** describing how a project spec is organized.

- The law lives at `.agents/specs/sdd/design/spec-structure.md` — SDD's **self-spec**. It does
  **not** ship with the plugin.
- `check-spec-structure` is an *engine* (a lint), not a description of the law.
- Consequence 1 — **three shipped SKILL.mds point at a file consumers do not have**:
  `spec-format-governance`, `check-scenario-overlap`, `manage` all reference
  `design/spec-structure.md`.
- Consequence 2 — **the placement rule is restated in four places**: `backfill:15`
  ("bakes in … screaming-architecture as the default"), `place-node:29` ("Homes are capability
  folders — the capability-first partition is strongly recommended"), `architect-spec:29`
  ("Screaming placement. The capability lives in a folder named for its intent"),
  `formation-loop:67` ("a layered / framework-first layout scatters a capability").

Four copies of one rule drift. The `acceptance/` -> `workflows/` rename already left a stale frozen
scenario in `backfill-project-spec.feature` for exactly this reason.

## Resolved decisions (do not relitigate)

- **Placement mechanism: a partial skill.** Verified: cross-plugin name references work and are used
  (`aced` and `quill` both load `sdd:*` governances). `references/` prose is **ruled out** — every
  consumption site in the repo is same-skill relative, zero cross-plugin reads, and the folder law
  *is* needed cross-plugin (`aced-impl-judge` loads `sdd:architect-impl-governance`; `init-aced`
  leaves `architect-spec: null` so it falls back to the SDD default). `cyberplace governance show`
  is the wider third option but buys nothing here — every consumer is already inside an SDD mission,
  and that channel is for agent-tool contracts consumed *outside* SDD.
- **Spec-node placement: `common-governances/spec-structure/`.** Per the rule already written in
  `common-governances/README.md` — cross-cutting bars with no single capability owner live there;
  single-owner bars live in their capability; rules/models live in `design/`. Structure has five
  consumers across four capabilities, so it is cross-cutting. `lifecycle` is the exact precedent:
  `design/lifecycle-model.md` (model) + `common-governances/lifecycle/` (bar spec) +
  `skills/lifecycle-governance/` (shipped skill).
- **Scope: tree-placement ONLY — no node-taxonomy governance.** A concern earns a governance when
  multiple consumers must **load** it consistently. Tree placement has four runtime loaders
  (`place-node`, `architect-spec`, formation Warden, `backfill`). Node taxonomy has **zero** — it is
  enforced in code by `spec-gate/scripts/check-spec-state.mts:13-14` (`reference => ## Subject and
  no sibling .feature; behavioral => ## Use Cases`), modeled in `design/spec-structure.md`, and its
  authoring consequence already stated in `spec-format-governance`. A fourth home would be pure
  duplication.
- **Do NOT merge the design trio.** `project-unit.md` / `spec-structure.md` / `spec-layout.md` stay
  separate. Evidence: 13 of 20 commits touched exactly one; `project-unit.md` is nearly disjoint
  (zero hits on screaming / descriptive / behavioral / strategy); `spec-layout.md` **references**
  `spec-structure.md` as the taxonomy owner four times rather than restating it. They are
  coincidental resemblance, not knowledge duplication — the case the architect bar's two-kinds rule
  protects. The missing piece was never a merge; it was a **front door**.
- **`design/spec-structure.md` stays put** as the model (the *why*). The skill carries the loadable
  law. Same split as lifecycle.
- **`backfill` loads the bar rather than baking in placement.** Loading a governance by name is the
  established composition, not a self-containment violation (`spec-producer` and
  `aced-scenario-writer` both load `sdd:spec-format-governance`). No bootstrap problem — the
  governance is a skill, available before any spec exists. Backfill keeps what is genuinely its own:
  the shared envelope it writes, and stamping each stub node with a `spec-type`.

## Non-goals

- A node-taxonomy governance (see above — zero runtime loaders).
- Merging or re-cutting the `design/` trio.
- **Shipping SDD's own tree.** `spec-structure.md`'s "The folder skeleton maps to the loops"
  section (`gateway/`, `intake/`, `mission/`, `campaign/`, …) is SDD self-spec, NOT a law for a
  user's project. It must not enter the shipped governance.

## Consumers (settled)

| Consumer | Needs | Loads at runtime |
| --- | --- | --- |
| `place-node` | tree placement | yes — the production-time helper |
| `architect-spec` bar | tree placement (screaming) | yes |
| formation Warden | tree placement | yes |
| `backfill-project-spec` | tree + node taxonomy | yes (after this CR) |
| `check-spec-structure` | reads `spec-type` as a signal only | **no** — audit engine, findings are `untagged-node` + `oversized-node` |
| `check-spec-state.mts` | node taxonomy | **no** — encodes it |

`place-node` produces and `check-spec-structure` audits against the same law — one rule, one home,
one producer and one auditor.

## NEXT — resume here

**Next action:** todo 1 — file the issue capturing the problem statement above, then author the spec
node (todo 2). No implementation before the spec node exists.

**Open question not yet settled with the owner:** how much of `spec-layout.md`'s **strategy menu**
(S1 capability-first, S2 mirror-the-source-tree, the composition rule, the selection compass) belongs
in the shipped governance versus staying model-only. `backfill` is the one consumer that genuinely
chooses a strategy; the other three only need capability-first + screaming + depth cap. Raise before
writing todo 3.
