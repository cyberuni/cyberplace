---
cr-ref: spec-structure-governance
status: draft
target: .agents/specs/sdd/ (project spec: plugins/sdd)
touches:
  - plugins/sdd/skills/spec-structure-governance/          # NEW — the shipped bar (taxonomy + placement)
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
  - content: "Write plugins/sdd/skills/spec-structure-governance/SKILL.md + README.md — taxonomy + placement law, SDD-specific tree EXCLUDED"
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
- **Scope: node taxonomy AND placement, together — they are ONE rule.** The placement law is the
  taxonomy *applied to folders* and cannot be stated without it: `spec-structure.md:96` reads
  "a rule and the behavior that enacts it live in different places — **the descriptive/behavioral
  split above, applied across the project-spec**" (rules -> `design/` as descriptive; behaviors ->
  capability folders as behavioral; reference artifacts -> the capability that owns them). So
  `place-node` cannot place without the type, and `architect-spec` cannot judge placement without it
  — a descriptive doc in `design/` is correct where a behavioral node there is a defect, and the
  folder alone does not say which.
  **Superseded reasoning (recorded so it is not re-tried):** an earlier pass scoped this to
  "tree-placement only, node taxonomy has zero runtime loaders". That counted who *enforces* the
  taxonomy (`check-spec-state.mts`) and missed who must *know* it to **apply** placement — which is
  all four consumers. Enforcement and application are different consumers.
  Still no **separate** node governance: the taxonomy rides with its consequence in one home.
- **Do NOT merge the design trio.** `project-unit.md` / `spec-structure.md` / `spec-layout.md` stay
  separate. Evidence: 13 of 20 commits touched exactly one; `project-unit.md` is nearly disjoint
  (zero hits on screaming / descriptive / behavioral / strategy); `spec-layout.md` **references**
  `spec-structure.md` as the taxonomy owner four times rather than restating it. They are
  coincidental resemblance, not knowledge duplication — the case the architect bar's two-kinds rule
  protects. The missing piece was never a merge; it was a **front door**.
- **`spec-structure.md` is internally coherent — do not re-cut it.** An earlier pass called it "two
  concerns fused" (node taxonomy + folder anatomy) and proposed splitting along that line. That was
  wrong for the same reason as above: the two halves are one rule, since placement is expressed in
  taxonomy terms. The doc is correct as it stands.
- **`design/spec-structure.md` stays put** as the model (the *why*). The skill carries the loadable
  law. Same split as lifecycle.
- **`backfill` loads the bar rather than baking in placement.** Loading a governance by name is the
  established composition, not a self-containment violation (`spec-producer` and
  `aced-scenario-writer` both load `sdd:spec-format-governance`). No bootstrap problem — the
  governance is a skill, available before any spec exists. Backfill keeps what is genuinely its own:
  the shared envelope it writes, and stamping each stub node with a `spec-type`.

## Non-goals

- A **separate** node-taxonomy governance — the taxonomy ships inside this one, as the vocabulary
  the placement law is written in. Splitting them would hand every consumer half a rule.
- Merging or re-cutting the `design/` trio, or re-cutting `spec-structure.md` internally.
- **Shipping SDD's own tree.** `spec-structure.md`'s "The folder skeleton maps to the loops"
  section (`gateway/`, `intake/`, `mission/`, `campaign/`, …) is SDD self-spec, NOT a law for a
  user's project. It must not enter the shipped governance.

## Consumers (settled)

Every runtime consumer needs **taxonomy + placement together**, because placement is type-conditioned:

| Consumer | Why it needs the type | Loads at runtime |
| --- | --- | --- |
| `place-node` | "`design/` or a capability folder?" **is** the type question | yes — the production-time helper |
| `architect-spec` bar | a descriptive doc in `design/` is correct; a behavioral node there is a defect | yes |
| formation Warden | audits that shape corpus-wide | yes |
| `backfill-project-spec` | creates nodes and stamps each `spec-type` | yes (after this CR) |
| `check-spec-structure` | reads `spec-type` as a signal only | **no** — audit engine, findings are `untagged-node` + `oversized-node` |
| `check-spec-state.mts` | enforces the section consequence | **no** — encodes it |

The last two **enforce**; the first four **apply**. Those are different consumers — conflating them
is what produced the superseded "tree-only" scope above.

## Finding — the declared strategy is written but not honored

Surfaced in review. The strategy is a **per-project decision**, so consumers do not need the menu —
they need the project's **chosen** strategy. The recording place already exists and is fully
designed (`spec-layout.md:185-208`): the **placement map** in the body of the root `spec.md`
(deliberately not frontmatter, per ADR-0017), naming the primary strategy
(`capability-first | mirror-source | bounded-context | layered | doc-envelope`) plus a routing table
and tie-break rules. `backfill` writes it — "the only step that *decides* the layout (it ran
detection + the compass with the user)".

**Defect 1 — the designed readers do not read it.** `spec-layout.md` names `start-mission`'s
explore, the handoff Warden, and the post-mission Warden as readers. Mentions of "placement map":
`start-mission` **0**, `formation-loop` **0**, `sdd-warden` **0**. Only `place-node` reads it and
`backfill` writes it. The decision is made with the user, recorded, then ignored.

**Defect 2 — `place-node` contradicts itself and the design.** `place-node:14` says it "reads the
project-spec's **declared placement map**"; `place-node:28` says the home is "**derived** from the
project-spec's own `concept:` tags, **never a stored routing list** (the `corpus/discovery` no-drift
rule)" and hardcodes "Homes are **capability folders** — the capability-first partition is strongly
recommended". `spec-layout.md:197` says the opposite: "A **lookup**, not a derivation." Practical
consequence: a project that chose `mirror-source` still gets capability-first placement.

**Proposed reconciliation (needs owner ratification before the governance states it):** the two
principles are each right about a different thing — **strategy is policy, homes are data**.

- The **strategy** is a decision made once with the user; a choice cannot be derived, so it is
  **declared** in the placement map and **read**.
- The **homes** are facts about the current tree; a stored home list rots, so they stay **derived**
  from `concept:` tags (`corpus/discovery`'s no-drift rule holds).

The declared strategy tells `place-node` *how* to derive; capability-first stops being hardcoded.

## NEXT — resume here

**Next action:** todo 1 — file the issue capturing the problem statement above, then author the spec
node (todo 2). No implementation before the spec node exists.

**Settled by the finding above:** the **strategy menu** stays model-only — `backfill` is the sole
decider and runs the compass with the user. What the governance must carry instead is the rule that
the choice is **declared in the placement map and read, never re-assumed**. The other consumers
never need the menu; they need the project's recorded choice.

**Open decision (owner) — blocks todo 3:** ratify the "strategy is policy, homes are data"
reconciliation above. The governance cannot state the placement law without resolving the
lookup-vs-derivation contradiction, and resolving it changes `place-node` (drop the hardcoded
capability-first) and wires three readers that currently ignore the placement map.

**Scope question that follows:** fixing defects 1 and 2 may be its own CR — this one is "give the
law a shipped home", and rewiring the placement-map readers is a behavior change to `place-node`,
`start-mission`, and the Warden. Decide split-or-absorb before starting todo 3.
