---
cr-ref: spec-organization-rebuild
status: draft
target: .agents/specs/sdd/ (project spec: plugins/sdd)
touches:
  - plugins/sdd/skills/spec-structure-governance/          # NEW — the shipped bar (taxonomy + placement)
  - .agents/specs/sdd/common-governances/spec-structure/   # NEW — its spec node
  - plugins/sdd/skills/scaffold-project-spec/              # RENAMED from backfill-project-spec + intent mode
  - .agents/specs/sdd/authoring/scaffold-project-spec/     # RENAMED spec node + .feature (Clearance)
  - plugins/sdd/skills/place-node/SKILL.md                 # drop inline copy + hardcoded capability-first; read the declared strategy
  - plugins/sdd/skills/start-mission/SKILL.md              # wire the placement-map read (defect 1)
  - plugins/sdd/skills/formation-loop/SKILL.md             # drop inline copy; wire the placement-map read (defect 1)
  - plugins/sdd/agents/sdd-warden.md                       # wire the placement-map read (defect 1)
  - plugins/sdd/skills/architect-spec-governance/SKILL.md  # drop inline copy, reference the bar
  - plugins/sdd/skills/spec-format-governance/SKILL.md     # fix dangling `design/spec-structure.md` pointer
  - plugins/sdd/skills/check-scenario-overlap/SKILL.md     # same dangling pointer
  - plugins/sdd/skills/manage/SKILL.md                     # same dangling pointer
  - .agents/specs/sdd/design/spec-layout.md                # correct "backfill is the only step that decides"
sources:
  - (none — owner waived the issue; work lands on branch test-framework-rebuild)
todos:
  - content: "OWNER: ratify 'strategy is policy, homes are data' — RATIFIED 2026-07-18; no issue/CR filed by owner decision"
    status: completed
  - content: "Author the spec node common-governances/spec-structure/README.md (spec-type: reference, ## Subject)"
    status: completed
  - content: "Write skills/spec-structure-governance/ SKILL.md + README.md — taxonomy + placement law, SDD-specific tree EXCLUDED (verified absent)"
    status: completed
  - content: "Defect 0a: generalize steps 1-3 on evidence mode (detection | intent); steps 4-6 unchanged"
    status: completed
  - content: "Defect 0b: rename backfill-project-spec -> scaffold-project-spec (53 refs / 34 files; .feature move was a pure git mv so the freeze held)"
    status: completed
  - content: "Defect 2: place-node stops RECOMMENDING a strategy — it need not read one, since deriving from live concept tags is strategy-neutral"
    status: completed
  - content: "Defect 1: post-mission Warden judges against the declared strategy (the only reader actually missing; the other two were a grep false positive)"
    status: completed
  - content: "Retire the inline copies (4 sites load the bar); architect bars + formation signal now judge the DECLARED layout, not the default"
    status: completed
  - content: "Repoint the dangling pointers (3 refs, all in spec-format-governance) -> sdd:spec-structure-governance; correct spec-layout's sole-decider claim"
    status: completed
  - content: "Spec gate + handoff"
    status: pending
---

# CR: spec-organization-rebuild — the project-spec organization system

**Scope note.** This began as "give the organization law a shipped home" and was **folded into a
system rebuild** by owner decision: the three defects below are not follow-ups, they are the work.
A governance stating "read the declared strategy" is meaningless while no consumer reads it, no
greenfield project declares one, and `place-node` hardcodes a different answer.

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
scenario in what is now `scaffold-project-spec.feature` for exactly this reason.

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
| `scaffold-project-spec` | creates nodes and stamps each `spec-type` | yes (after this CR) |
| `check-spec-structure` | reads `spec-type` as a signal only | **no** — audit engine, findings are `untagged-node` + `oversized-node` |
| `check-spec-state.mts` | enforces the section consequence | **no** — encodes it |

The last two **enforce**; the first four **apply**. Those are different consumers — conflating them
is what produced the superseded "tree-only" scope above.

## Clearance — recorded owner ratification (2026-07-18)

Owner granted Clearance ("clearance allowed") and authorized the rename ("go ahead and rename the
file/folder instead of keeping it as backfill"). Under it, these **frozen** scenarios changed:

| Node | Scenario | Change |
|---|---|---|
| `gateway/` | `no spec found for a target offers manage-spec-anchors` | `Then` step: identifier `backfill-project-spec` -> `scaffold-project-spec` |
| `gateway/manage/` | `a setup request loads backfill-project-spec` | title + `Then` step: same identifier rename |
| `workflows/` | `a CR whose target project has no spec routes to backfill` | `Then` step: same identifier rename |

**These are mechanically flagged, semantically neutral.** `align-spec` classifies each as a
"narrowing (clearance)" because its scenario-diff cannot distinguish an identifier rename from a
contract narrowing. No behavior was narrowed: the same skill is referenced under its new name. The
per-file `.feature` **move** itself was a pure `git mv` (git `R`), which preserves the freeze at the
same baseline (`lifecycle-governance:142`) — only the in-scenario identifier text tripped the engine.

**Second Clearance under the same grant — the shippable test was wrong.** Removed:
`intent mode asks for the spec location it cannot detect` ("Then it asks whether the project will be
shippable rather than detecting a plugin layout").

It encoded a test `project-unit.md` does not use. The spec-location discriminator is **nested vs
outer**, not shippable — "a nested project's spec is lifted out of its *(possibly shippable)*
package dir … the outer / repo-level project's is not". A nested package that ships nothing is still
hoisted, so a shippable question returns the wrong answer for it. Replaced by five scenarios that
ask for the **project path** (which step 5 must write as `project-path`, and which cannot be read in
a greenfield project) and then **derive** the location from it, matching the existing rule that the
location mode is derived from `project-path`, never stored.

**Third Clearance under the same grant — "consolidated spec" is vestigial.** Re-cut:
`a project that already has a consolidated spec is not backfilled` ->
`a project that already has a project spec is not scaffolded`.

"Consolidated spec" appeared 12 times and is **defined nowhere**. The defined term is
**`project-spec`** (`TERMINOLOGY.md:39` — "one project's whole durable spec — one `spec.md`, one
suite, one gate/freeze"). "Consolidated" is a leftover from the **spec-fleet** era
(`mission/README.md:134` — "Spec-fleet assumption in the sources — RESOLVED (project-spec model)"),
when a project could carry a fleet of per-feature specs and "consolidated" meant unified-into-one.
The project-spec model made that an invariant (`project-unit.md`: "ONE spec, ONE behavior suite, ONE
gate/freeze baseline … never by splitting into sibling specs"), so **a non-consolidated spec is a
state the model now forbids** — the qualifier marks a distinction that no longer exists, and being
undefined, a reader cannot discover that. Swept to "project spec" / "no spec yet" across 6 files.

Left intact: `mission/README.md:134` itself, where "consolidated" describes the historical
transition and is apt.

Also corrected: the evidence-mode question is scoped to the **project**, not the repo. A new package
in an existing monorepo is a greenfield *project* in a populated *repo* — intent mode still reads the
surrounding repo for shape and conventions.

**Fourth Clearance under the same grant — nesting is not the hoist test.** Re-cut:
`a greenfield project nested in a repo has its spec hoisted` -> `a greenfield agentic plugin has its
spec hoisted`, and `a greenfield project at the repo root keeps its spec colocated` -> `a greenfield
nested package keeps its spec colocated`.

Both encoded **nested -> hoist**, inherited from `project-unit.md`'s "a nested project's spec is
lifted out of its (possibly shippable) package dir". That over-generalizes a **plugin-specific**
constraint. The stated reason is "plugin install copies the whole plugin directory **with no
include/exclude mechanism**" — which npm does not share: `packages/cyberplace/package.json` carries
`"files": ["bin","dist","governances"]`, an allowlist, so a colocated `.agents/spec/` would never
ship. Counter-example in this repo: **cyberplace is a nested npm package whose spec is hoisted
although it need not be.**

**Rule as corrected (owner):** *colocate by default; hoist only when the spec cannot be kept out of
what ships* — i.e. the dir is copied wholesale. The one identified case is the **agentic plugin**.
Narrowed in `project-unit.md`, `scaffold-project-spec` step 2, the decision graph, and the two
scenarios above.

**Not migrated:** existing hoisted specs stay put. `cyberplace` could colocate under the corrected
rule; moving it is a separate call, not a silent consequence of narrowing the rule.

**Fifth Clearance under the same grant — the unscaffoldable Given.** Re-cut:
`a project with no discernible decomposition and no feature-first layout takes the default` ->
`a layer-organized project takes the capability-first default`, with the `Given` split into
`a project in detection mode` + `its src/ is organized by layer rather than by feature`.

The old `Given` failed three ways at once: **evaluative** (*discernible* — each reader supplies their
own threshold), **doubly absent** (a state defined by what is missing has infinitely many fixtures,
so it cannot be built), and a **conjunction** (two conditions in one step, so neither is reusable).
Researched against BDD practice rather than invented; the failure mode is documented — vague steps
produce defensive step definitions carrying flags and branches, and two readers picture different
setups, which is exactly the impl-producer/impl-judge churn predicted. The general rule now lives in
`suite-format-governance` as "a `Given` must be a scaffoldable state", with the build test: *could
two people, given only this line, construct the same fixture?*

Not changed, deliberately: "backfill" used as a **verb** for the existing-project path (e.g. `a
monorepo is detected and a repo-wide backfill is offered`) stays accurate for detection mode, and
`spec-producer`'s unrelated **backfill mode** was untouched by the sweep.

Note: the sibling `test-framework-rebuild.plan.md` Clearance record had its file pointer swept from
`backfill-project-spec.feature` to `scaffold-project-spec.feature` — a pointer to a renamed file, not
a rewrite of what was ratified.

## Finding — the declared strategy is written but not honored

Surfaced in review. The strategy is a **per-project decision**, so consumers do not need the menu —
they need the project's **chosen** strategy. The recording place already exists and is fully
designed (`spec-layout.md:185-208`): the **placement map** in the body of the root `spec.md`
(deliberately not frontmatter, per ADR-0017), naming the primary strategy
(`capability-first | mirror-source | bounded-context | layered | doc-envelope`) plus a routing table
and tie-break rules. `backfill` writes it for an **existing** project — `spec-layout.md` calls it
"the only step that *decides* the layout (it ran detection + the compass with the user)", but see
Defect 0: that claim silently assumes every project arrives with source to detect.

**Defect 0 — greenfield has no decider at all.** `scaffold-project-spec` is scoped to "lay out an
**existing** project's spec", entered "when `start-mission` explore finds an **existing project**
with no consolidated spec". Its whole decision flow is detection-driven and cannot run without
source: step 1 reads `.plugin/` / `apps/`+`packages/` / whether `src/` is feature- or layer-organized
/ framework markers / `CODEOWNERS`; step 3 recommends capability-first "when a capability
decomposition is **discernible**" and mirror-source "when `src/` is **already** feature-first". A new
project has none of those signals, so no branch fires — **a new project never gets a declared
strategy**. Note the deciding *procedure* also differs in kind: backfill decides by **detection**
(what the code shows), greenfield can only decide by **intent** (what the project will do), so it is
not a matter of relaxing backfill's inputs. **Folded into this CR** (see Scope note); the law below
holds for both paths.

**Defect 1 — RESOLVED, and the original finding was mostly WRONG.** It claimed all three readers
`spec-layout.md` names were missing, from a grep for "placement map" (space). `start-mission` writes
**"placement-map"** (hyphen), so the grep read 0 where there were 2. Corrected picture:

| Reader | Spec | Impl |
|---|---|---|
| `start-mission` explore | had it | had it (`:39`) |
| handoff Warden pass | had it (`handoff.feature`) | had it (`:86` — handoff lives inside `start-mission`, there is no handoff skill dir) |
| **post-mission Warden (formation)** | **missing** | **missing** |

So the real gap was **one** reader, absent on both sides. Fixed: `formation/README.md` +4 scenarios
in `formation.feature` (additive, self-clearing), and the read wired into `formation-loop/SKILL.md`
and `agents/sdd-warden.md`.

**The behavior specified**, not merely "reads it": the Warden judges structural fit **against the
declared strategy**, never a default, and **never infers the strategy from the tree** — inference
makes the audit circular (the shape the corpus has becomes the standard it is judged by) and on a
half-migrated corpus judges it against the layout it is migrating away from. A map naming no
strategy is judged against capability-first, and the omission is itself a finding.

**Lesson:** a hyphen defeated the grep that produced the finding. A negative grep result is a
hypothesis about vocabulary, not a fact about behavior.

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

**Next action:** spec gate. Every build todo is done; nothing is left but the gate and handoff.

**Landed:** ratification recorded · spec node · governance skill (SDD's own tree verified absent) ·
greenfield evidence mode (0a) · rename to `scaffold-project-spec` (0b) · formation Warden judges the
declared strategy (defect 1) · `place-node` stops recommending one (defect 2) · inline copies retired
· pointers repointed · `spec-layout`'s sole-decider claim corrected · glossary mandate + corpus
migration + SDD's own glossary · the (path class, edge) doctrine, scaffoldable `Given`, and
`## References`, piloted on `scaffold-project-spec`.

**Finding-accuracy note for the gate.** Four of this CR's findings were overstated and corrected in
place: the "8 invariants to prune" (most had edges), defect 1 ("all three readers" — a hyphen in the
grep), defect 2 ("self-contradicts and hardcodes" — the engine is strategy-neutral; only the prose
overreached), and the "3 dangling pointers in 3 skills" (3 refs in **one** skill; the others matched
`check-spec-structure`, the engine). Common cause: substring greps read as behavioral facts. Treat
the findings list as hypotheses and re-verify against the artifact before acting.

**Carried, not done (deliberate):** `cyberfleet-plugin` and `cyberlegion-plugin` have no glossary
(advisory) · `cyberplace` is hoisted though the corrected rule would colocate it · 36 of 37 sdd
behavioral nodes still use the pre-rebuild node format (that is `test-framework-rebuild`'s sweep) ·
"use case named to its impl surface" does not fit a procedural skill.

**Settled by the finding above:** the **strategy menu** stays model-only — only a *deciding* step
needs it, and it runs the compass with the user. What the governance must carry instead is the rule
that the choice is **declared in the placement map and read, never re-assumed**. The non-deciding
consumers never need the menu; they need the project's recorded choice.

**Scope: SETTLED — fold in.** Owner decision: defects 0/1/2 are absorbed into this CR, not split out.
This is a rebuild of the organization system, not a doc move.

**RATIFIED 2026-07-18 (owner): "strategy is policy, homes are data."** Recorded grant — the
governance states it, `place-node` is rewritten to it, and `decide-spec-layout` exists because of it.

The doctrine, as ratified:

- The **strategy** (`capability-first | mirror-source | …`) is a **choice**: two people can
  legitimately disagree, so it cannot be observed and must be **declared** in the placement map and
  **read**. Proof it is not derivable: a greenfield project has no tree yet still has a strategy.
  Deriving it is circular on a healthy tree (it launders a past decision as an observation) and
  actively wrong on a half-migrated one (it perpetuates the layout being migrated away from).
- The **homes** (which folder a concept sits in) are **facts** about the current tree, observable
  from `concept:` tags and changing as the tree changes. A stored home list is a second source that
  rots — so homes stay **derived**, never stored.
- They compose: **the declared strategy parameterizes the derivation.** `capability-first` groups
  `concept:` tags by capability; `mirror-source` mirrors the source path. `place-node` keeps
  deriving, but asks the placement map *which* derivation to run.

**This is not a new doctrine — it is the existing one applied consistently.**
`corpus/discovery/README.md:8-16` already makes the same split: the three fixed conventions "are
always scanned and **need no registry**" (derived), while extra anchors are "a **declared** second
source that can drift, so it is opt-in and **curated** … **rather than derived**". So the no-drift
rule means "do not store what you can observe", never "do not declare a choice". `place-node:28`
cited that rule to reject a declared strategy, which inverts it.

**Accepted cost.** The placement map can go stale against the tree (a project declares
`capability-first`, drifts layered in practice, and the declaration lies). Mitigation is curation,
matching discovery's `spec-anchors` answer: the Warden owns placement-map rewrites during deliberate
reorganization, already specified at `spec-layout.md:206`.

**Process: no separate CR, no issue.** Owner decision — the work lands on the current branch
(`test-framework-rebuild`) alongside that CR rather than opening a new one.

**Shape for Defect 0 — SETTLED (owner, 2026-07-18): generalize the whole skill, rename to
`scaffold-project-spec`, rename inside this CR.**

`scaffold-project-spec` becomes `scaffold-project-spec`: **one** skill, one entry, with steps 1-3
branching on **evidence mode** and steps 4-6 shared unchanged.

- **detection mode** (source exists) — today's steps 1-3, driven by source signals. Unchanged.
- **intent mode** (greenfield) — no source to read, so the compass runs off the project's stated
  capabilities rather than `src/` shape.

**Why generalize rather than extract a decider.** Only steps 1-3 are mode-dependent; steps 4-6
(scaffold envelope + skeleton, declare the organization, hand back stubs) are already generic.
Extracting only the decision would leave greenfield needing 4-6 too — either duplicating them or
calling into a skill named "backfill". And the mode is **detectable, not a user choice**:
`start-mission` finds no spec, then asks only "is there source to read?". `workflows/cr-lifecycle.feature:27`
already fixes the single entry ("a CR whose target project has no spec routes to backfill").

**Superseded (do not re-try):** an earlier pass proposed extracting `decide-spec-layout` as a shared
decider that `backfill` would call. Rejected — it shares the decision but not the scaffolding, which
is the larger shared part.

**Sequencing (deliberate).** Generalize under the existing name first, then rename in a **separate
commit**. Mixing a semantic change with a 34-file mechanical sweep is what let today's stale
`scaffold-project-spec.feature` scenario slip through. Rename blast measured: **30 `.md`, 4
`.feature` (frozen -> Clearance), 0 code.**
