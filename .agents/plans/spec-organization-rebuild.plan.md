---
cr-ref: spec-organization-rebuild
status: approved
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
  - .agents/specs/sdd/formation/                           # the Warden's spec node + .feature (defect 1, additive)
  - plugins/sdd/skills/ssa-lowering/SKILL.md               # retire the SIXTH inline placement copy ("screaming architecture")
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
  - content: "Spec gate — round 5 ALIGNED: true (cold judge, 0 spec/.feature findings); touches: under-scope fixed"
    status: completed
  - content: "OWNER: ratify the joint gate for all three CRs — RATIFIED 2026-07-19 (by: unional); status approved, 64 suites frozen"
    status: completed
---

# CR: spec-organization-rebuild — the project-spec organization system

> **Branch `test-framework-rebuild` carries THREE CRs that gate together** —
> `test-framework-rebuild`, `spec-organization-rebuild`, `partition-quality`.
> Read all three plan briefs before gating. **No blocking decision remains** — the former
> `confirm-read`/`read-check` question was resolved 2026-07-19 by dropping it from this CR and
> relocating it to `cyberuni/universal-plugin#9`; see this plan's read-check section.


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

## SPEC GATE — 2026-07-19: **NOT APPROVED** (cold spec-judge, ALIGNED: false)

Lenses `{oracle: pass, builder: FAIL, architect: FAIL}`.

**FIXED at the gate — `place-node/SKILL.md:13` asserted a read that never happens.** Its opening said
the engine "reads the project-spec's declared placement map + capability layout", contradicting both
its own body ("This tool therefore neither reads nor recommends a strategy") and the engine, which
only scans `concept:` frontmatter and never opens `spec.md`. Defect 2 was marked `completed`, but the
fix rewrote the paragraph below and left this sentence — the contradiction was relocated, not
resolved. Corrected to describe what the engine actually does.

**BLOCKER — the pilot node violates the rule it was chosen to pilot.**
`scaffold-project-spec.feature:115-116` reads `Given a project in detection mode whose src/ is
organized by layer` — the conjunctive `Given` this CR's own Fifth Clearance and the scaffoldable-
`Given` rule exist to ban. Sibling scenarios at `:110-111` and `:137-138` split the **identical**
fact pair correctly. `check-suite` cannot catch it (semantic, not mechanical). Re-cutting a frozen
scenario is a narrowing ⇒ **Clearance required.**

**Observation (not blocking):** the four-section node format is live on only 2 of 38 sdd behavioral
nodes while `spec-format-governance` states it as a **universal** bar. Both briefs record this as
deliberate debt, but only in transient `plan.md` files that retire at handoff — no durable trace
distinguishes tracked migration from an undetected violation.

## Clearance — granted by owner in-session 2026-07-19 (frozen re-cut)

Owner authorized the spec-gate re-cut. Recorded before the edit, per grant -> record -> edit.

**`scaffold-project-spec.feature` — the conjunctive `Given` (spec-judge BLOCKER).** Line 115-116 read
`Given a project in detection mode whose src/ is organized by layer`, bundling two independently
varying conditions in one step. Split to the two-step form its own sibling scenarios (`:110-111`,
`:137-138`) already use for the identical fact pair, and which this CR's scaffoldable-`Given` rule
and its Fifth Clearance worked example both prescribe.

Basis: a **narrowing to the CR's own ratified rule**, not a behavior change — the scenario tests the
same branch with the same outcome; only the `Given`'s step structure changes. No contract is widened.

## Round-2 gate corrections — 2026-07-19

**The "retire the inline copies (4 sites)" todo was incomplete: there were FIVE.**
`plugins/sdd/skills/start-mission/SKILL.md:39` still recommended `capability-first` unconditionally
and called a layered placement discouraged, with no read of the declared placement map and no mention
of `mirror-source` — contradicting the doctrine this CR ratified and shipped in every sibling
consumer (`place-node`, `spec-structure-governance`, `architect-spec-governance`, `formation-loop`).
Corrected to judge placement *within* the declared layout. Pre-existing (the line predates the
merge-base), surfaced only by a corpus sweep rather than by re-reading the four named sites.

> **Method note — why the round-1 fixes were too narrow.** Round 1 named one instance of each defect;
> the fixes edited exactly those lines. A judge naming an instance means the finding is the **rule**,
> and the rule needed a scripted sweep. Round 2 surfaced two adjacent instances the narrow fix could
> never have reached — both pre-existing, neither a regression. The sweep is now run; its result is
> recorded below rather than left as "checked it".

**Sweep result — evaluative `Given` steps, corpus-wide.** Three sit in the pilot node itself:
`scaffold-project-spec.feature:93` ("whose shape allows more than one **valid** location"), `:128`
("a **strongly** layered project"), `:190` ("whose repo-root name is already **correct**"). The other
sweep hits are **not** defects: "valid JSON" / "valid gitignore pattern" are decidable predicates,
not judgment calls — the word alone does not make a `Given` evaluative, so the naive word list
over-fires and must be read, not trusted.

**Plan-accuracy correction.** This brief's "Landed" list claims "`## References` … piloted on
`scaffold-project-spec`". The shipped README has **no** `## References` section, and no BDD source is
cited for the scaffoldable-`Given` rule's claimed research basis. An empty section is correctly
omitted per governance — the defect is the brief's claim, now withdrawn.

## Clearance — granted by owner in-session 2026-07-19 (frozen re-cut, second grant)

Recorded before the edit, per grant -> record -> edit. Distinct from the earlier grant covering
`scaffold-project-spec.feature:115`; this one covers three further `Given` steps in the same file,
one named by the round-2 judge and two found by the sweep that judge's finding required.

Each fails the scaffoldable-`Given` bar (observable, not evaluative) and is re-cut to the state a
fixture can actually build:

| line | was | becomes |
|---|---|---|
| `:93` | `a project whose shape allows more than one **valid** location` | the two concrete locations that shape admits, named |
| `:128` | `a **strongly** layered project` | the split form its three siblings already use |
| `:190` | `whose repo-root name is **already correct**` | the repo-root directory name equals the derived project name |

**Owner chose the rule-wide cut over the judge-named line alone** — the narrow fix is exactly what
produced the round-2 findings, and `:93` had independently been flagged by a round-1 judge as well.

Basis: a **narrowing to this CR's own ratified rule**. Each scenario keeps its `When`, its `Then`,
and the branch it tests; only the `Given`'s observability changes. No contract is widened, and no
scenario is removed.

## Round-3 gate — the loop DIVERGED, and the producer caused it

Rounds 1 and 2 found only pre-existing defects; every fix was clean. **Round 3 found two NEW defects,
both traceable to the round-2 fix commit `cc078e8e`.** Recording that plainly, because a defect
introduced by the previous round's fix is the signal that a repair loop is no longer converging —
and it is the first time in this CR's gate history that it happened.

**New defect 1 — the `:93` re-cut replaced a vague `Given` with a WRONG one.** It became
`a package nested in a monorepo that is itself an agentic plugin / And the spec could sit hoisted at
the repo root or colocated beside the package`. Two faults: "could sit … or …" is the same
unbuildable hedge as the "valid" it replaced, and — worse — it contradicts this CR's own shipped bar.
`spec-structure-governance:78-83` says hoist applies only when "the spec cannot be kept out of what
ships", names the agentic plugin as "**the one identified case**", and states "**nesting is never the
reason**". So that fact pattern is **deterministically hoisted**, exactly as sibling scenarios
`:40-44` and `:65-68` already assert. The pre-fix wording was too vague to contradict anything; the
fix concretized it into a contradiction.

**Corrected** to `an agentic plugin, for which the hoist rule leaves exactly one legal location`.
Reading the governance properly, **no** ambiguous fact pattern exists — a plugin hoists, an npm
package colocates. The scenario's real content is therefore the stronger, non-contradictory claim:
the choice is surfaced **even when the rules leave one legal answer**. A convergence, not a branch.

**New defect 2 — the scenario map was never reconciled.** `cc078e8e` touched only the `.feature` and
this plan; `README.md`'s map still described the pre-fix `Given` text in three `Path` cells.
`check-suite` passed throughout because it binds on scenario **name**, which never changed — the lint
structurally cannot see a stale `Path` description. All three cells are now reconciled.

**Standing lesson: re-cutting a `Given` is a TWO-FILE edit.** The `.feature` carries the step; the
`README` scenario map describes it in the `Path` column. Changing one without the other produces
spec-vs-suite drift that the mechanical binding lint cannot catch. Both round-2 `Given` re-cuts in
this CR made exactly this mistake.

**Clearance basis:** these corrections sit **inside** the owner's 2026-07-19 grant to re-cut `:93`,
`:128`, and `:190` — this is that granted work executed correctly, not new scope. No scenario is
added or removed; each keeps its `When`, `Then`, and branch.

## Round-4 gate — converged; two pre-existing findings, and a lesson about sweeps

**Round 3's divergence is broken.** The judge independently verified both round-3 fixes correct with
**zero** new defects: all 42 scenario titles match all 42 map rows 1:1, and `:93`/`:128`/`:190` now
match their map `Path` cells verbatim. No finding this round traces to the previous round's fix.

**Both findings were PRE-EXISTING — and both are indictments of the sweep method, not the fixes.**

| finding | why every prior sweep missed it |
|---|---|
| `scaffold-project-spec.feature:100` — `Given a project whose capabilities can be derived` | the word-list sweep matched `discernible`/`valid`/`strongly`…; **"can be derived" contains none of them.** The scenario *title* says "discernible"; the `Given` does not |
| `plugins/sdd/skills/ssa-lowering/SKILL.md:82` — a **sixth** inline copy of the placement rule | the sweep grepped `capability-first`; this copy says **"screaming architecture"**. A synonym, so the token missed |

**The method was wrong, twice, in the same way: a token sweep has false NEGATIVES.** Earlier rounds
recorded that the naive word list *over*-fires (`valid JSON` is a decidable predicate). What went
unrecorded is that it also *under*-fires — a synonym walks straight through. The counts have now been
wrong three times running: inline copies **4 -> 5 -> 6**; evaluative `Given`s **3 -> 4 -> 5**.

**Replaced with exhaustive enumeration where the set is bounded.** Every `Given`/`And` step in the
pilot node (54 of them) was listed and read rather than matched. That found the judge's `:100` **and a
second instance it did not name** — `:186`, `a hoisted or nested project whose name is not reliably
derivable`. Both re-cut to observable state. The placement rule was re-swept on **synonyms**
(`screaming architecture|screaming placement|placed by the capability|never by a technical layer`),
which surfaced the sixth copy; `crimp`'s "by intent" was inspected and **ruled out** (marketplace
query, different domain).

**One rule, three files.** The `capabilities can be derived` defect lived in the `.feature` step, the
map's `Path` cell, **and** the `## Logic` graph's `D4` edge label — the judge caught that the graph
carried the same vagueness. All three are now reconciled. The two-file rule for a `Given` re-cut is
really *however many files state it*; enumerate them rather than assume two.

## Clearance — extension of the 2026-07-19 rule-wide grant (recorded before the edit)

The owner granted the evaluative-`Given` re-cut **rule-wide** ("all three, fix the rule"), choosing
that over the judge-named line alone. `:100` and `:186` are two further instances of **that same
rule**, found after the grant. They are re-cut under it, keeping each scenario's `When`, `Then`, and
branch — only the `Given`'s observability changes; nothing is added or removed.

**Flagged for ratification rather than assumed:** if the owner reads the grant as covering only the
three lines named at the time, these two need an explicit extension.

## Round-5 gate — 2026-07-19: **ALIGNED: true**, `{oracle: pass, builder: pass, architect: pass}`

Cold spec-judge, pointed at this ledger and the diff. **Zero findings against `spec.md` or the
`.feature`.** Structural band ran green first (`check-spec-state --root`, `check-suite` on the six
touched suites, `check-spec-state --files --base <merge-base>`).

**The two producer-self-reported fixes in `655149d2` survived a cold read.** The judge verified them
independently rather than trusting the commit message: `:100` and `:186` are now buildable fixtures
and reconciled in **all three** sites the rule is stated (`.feature` step, README `Path` cell, and
the `## Logic` graph's `D4` edge label); the sixth inline placement copy is gone from
`ssa-lowering/SKILL.md`. It re-ran the synonym sweep independently and found **no seventh copy** —
every remaining hit is SDD's root `spec.md` *using* its own placement map, `touch-set-correction`'s
unrelated "capability = first path segment" convention, or historical ledger prose. It also read all
42 `Given`/`And` steps in the pilot node end-to-end rather than grepping, and found no further
evaluative or conjunctive step beyond the four granted Clearances.

**Both findings were bookkeeping, one rule twice: `touches:` under-scoped the actual diff.**

| finding | path | status |
|---|---|---|
| NEW | `plugins/sdd/skills/ssa-lowering/SKILL.md` (modified by `655149d2` itself) | added to `touches:` |
| pre-existing | `.agents/specs/sdd/formation/` (README + `.feature`, 44 lines, the defect-1 fix) | added to `touches:` |

Ownership checked against both sibling briefs before claiming: `test-framework-rebuild` owns
the `ssa-lowering` **`.feature`** and `plugins/sdd/skills/*-governance/SKILL.md` — neither covers
these two paths.

**Standing lesson: re-derive `touches:` from `git diff --stat`, never from the hand-maintained list.**
This is the CR's own round-2/round-4 sweep lesson applied to *bookkeeping* rather than content — a
hand-kept list under-fires exactly the way a token sweep does. A gate diff scoped to `touches:` would
have judged neither path; the judge only reached them because this brief's prose happened to name one.

## SPEC GATE — 2026-07-19: **APPROVED** (human verdict, `by: unional`)

Owner ratified in-session. Not self-asserted and not relayed — the positional channel held it.

**What the ratification was taken to cover** (stated explicitly so it can be corrected): the joint
gate for all three CRs, **including** the extension of the rule-wide evaluative-`Given` grant to
`:100` and `:186`. That extension was the one open question put to the owner immediately before the
ratification, so the flat "ratify" is read as answering it. If that is wrong, the two lines need an
explicit ruling and this record amended.

**Clearance ledger cleared at this gate** — the edit-class classifier routed four files off the
self-clearing path, each covered by a recorded grant:

| file | class | grant |
|---|---|---|
| `gateway/gateway.feature` | NARROWING | 2026-07-18, identifier rename |
| `gateway/manage/manage.feature` | MIXED | 2026-07-18, identifier rename |
| `project-spec/concept-index.feature` | MIXED | 2026-07-18, `acceptance/` -> `workflows/` rename |
| `ssa-lowering.feature` | MIXED | standing grant, #306 unbuildable `Given` |

The other 60 touched suites classified `ADDITIVE` (7) or `NO-CONTENT-CHANGE` (53) and self-cleared.
All 64 already carried `@frozen`, so the freeze verb was a no-op on tag state — the Clearance path
had re-frozen each after its re-cut.

**Two anomalies recorded rather than silently resolved** (also in `ledger/joint-gate-note.9f0e23.jsonl`):

1. **The root `spec.md` was never re-opened `implemented` -> `draft`** when these behavior-changing
   CRs started. This gate therefore records `implemented` -> `approved`, a transition the lifecycle
   state machine does not list. The end state is what the approve verb specifies; the missing
   re-open is a gap in the recorded history, not a fresh decision.
2. **Per-CR attribution of the 64-file freeze footprint is approximate where the CRs overlap** — the
   `backfill` -> `scaffold` identifier renames are recorded in *both* this CR's and
   `test-framework-rebuild`'s Clearance ledgers. That is the branch-hygiene debt (three CRs on one
   branch is not one revertable unit), which this gate does not resolve.

## NEXT — resume here

**Next action:** **owner ratification of the joint gate.** All three CRs on this branch are now
ALIGNED (this one as of round 5, above). Every build todo here is done. Ratification is **positional**
— it belongs to the human holding the session channel, and must not be self-asserted or relayed, so
`status:` stays `draft` and no `approval` is written until the owner rules.

**The one question outstanding for the owner** (carried, not new): the evaluative-`Given` re-cut grant
was given rule-wide ("all three, fix the rule"). `:100` and `:186` were found *after* that grant and
re-cut under it. If the owner reads the grant as covering only the three lines named at the time,
those two need an explicit extension. Recorded above under the Clearance extension section. That CR's last open decision (`confirm-read` /
`read-check`) was resolved 2026-07-19 by dropping it and relocating it to
`cyberuni/universal-plugin#9`, so **nothing blocks the joint gate**. Not self-asserted while
unattended — the reasoning is recorded in that plan's `## NEXT`.

**Landed:** ratification recorded · spec node · governance skill (SDD's own tree verified absent) ·
greenfield evidence mode (0a) · rename to `scaffold-project-spec` (0b) · formation Warden judges the
declared strategy (defect 1) · `place-node` stops recommending one (defect 2) · inline copies retired (**four** at the time; a **fifth** at `start-mission/SKILL.md:39` was missed and
is corrected at the round-2 gate — see below)
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

## IMPL GATE round 1 — 2026-07-19: **NOT PASSED**, remediated

Cold `sdd-impl-judge`. `IMPLEMENTATION_PASS: false` on **one** frozen scenario; the other 45 in scope
passed independent re-derivation (all 42 `scaffold-project-spec` scenarios, 3 of the 4 new
`formation` ones), and the judge verified the rename sweep, the retired sixth inline copy, and the
repointed pointer independently.

**Failing scenario:** `formation.feature:115` — `a node contradicting the declared layout is reported
as misplaced`. Its `Then` is a **disjunction**: misplaced only when a node *neither* mirrors the
source tree *nor* matches the **routing table**. Neither `formation-loop/SKILL.md` nor
`agents/sdd-warden.md` — the Warden's only two governing documents — mentioned a routing table at
all. A Warden following them would report a routing-table-placed node as misplaced.

**The judge named two files; the defect was in a third.** Sweeping all eight placement consumers
found six that read the placement map but never mention its routing table — and the root cause is
that **`spec-structure-governance`, the single shipped home for the placement law, defined the map
as strategy-only.** `place-node` and `start-mission` honor the routing table only because they carry
it locally; `architect-spec-governance` and `ssa-lowering` delegate to the bar ("the rule lives
there"), so they inherited the omission silently.

**Fixed at the root, not at the cited lines.** The bar now states that the placement map has **two
parts** — the declared strategy and the routing table (the "concept of kind K lives in home H"
taxonomy plus its human tie-break rows) — and that a placement judgment must consult both, because
the table records decisions the strategy alone does not settle. `architect-spec-governance` and
`ssa-lowering` pick this up by reference. `formation-loop` and `sdd-warden` restate the rule locally
per the self-containment convention, so each carries the disjunct explicitly.

The frozen `.feature` was **not** touched and no scenario changed — the contract was right and the
implementation was narrower than it.

**Standing lesson: a consumer that delegates to a bar inherits the bar's silences.** Four of the six
gaps were invisible at the consumer because the consumer correctly said "the rule lives there." When
a judge names a consumer, check whether the rule it loads actually states the thing being judged.

## IMPL GATE round 2 — 2026-07-19: **PASS** (`IMPLEMENTATION_PASS: true`)

Cold impl-judge, round 2, on the round-1 remediation. `formation.feature:115` now holds: both of the
Warden's governing documents state the disjunction verbatim, so the scenario is satisfied without
relying on any delegation chain. The judge confirmed the edits were **purely additive** in all three
files (no prior sentence deleted or reworded), so the three sibling `formation` scenarios are
undisturbed, and it verified the commit touched **no** `.feature`.

**The root-cause claim was verified, not taken on trust.** `architect-spec-governance` and
`ssa-lowering` were untouched by the fix and still cite `sdd:spec-structure-governance` by name; the
bar they cite now carries the two-part-map rule. The judge re-ran the consumer sweep independently
and reconciled to the same six — **no seventh consumer**, and it re-confirmed that
`touch-set-correction`/`blast-estimate`'s `capability-first` hits are the unrelated "capability =
first path segment" convention.

**No regression:** the three edited artifacts are the same three round 1 diagnosed, and every edit is
additive.

**Two non-blocking gaps recorded, both pre-existing (untouched by the fix), both the same shape —
narrative prose describing a behavior the `.feature` now specifies more precisely:**

- `.agents/specs/sdd/formation/README.md:95` — the "judged against the declared strategy" narrative
  omits the routing-table disjunct.
- `plugins/sdd/skills/architect-spec-governance/README.md:22` — its summary table restates
  "placement matches the declared layout" without the exception.

Neither is the loaded governance an agent follows (that is the `SKILL.md` / agent `.md` pair, which
are correct), so neither changes a frozen scenario's outcome. **Both are the two-file lesson this CR
already learned at the spec gate, recurring on the README side:** a rule stated in a `SKILL.md` and
summarized in its `README` is stated in as many files as state it. Left for a reconciliation pass
rather than swept now, because this CR's impl gate is closed and the sweep belongs with the sibling
`formation` README debt.

**Structural note from the judge, for future spec authors (not a gap in this gate):** the
inherit-by-named-reference mechanism this fix relies on is unverifiable by static reading — it
depends on an agent actually invoking the named skill rather than reading the citation as a
footnote. No frozen scenario exercises `architect-spec-governance`'s or `ssa-lowering`'s placement
judgment against a routing-table-placed node.
