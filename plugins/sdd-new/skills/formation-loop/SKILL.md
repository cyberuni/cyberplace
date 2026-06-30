---
name: formation-loop
description: "Internal skill: the SDD formation loop — the Architect's outer loop run by the Warden. Fires post-mission, corpus-wide and continuous, asking one question — is what we have organized right? — and emits a finding set covering every spec (split / dedupe / reconcile), each carrying the Warden's self-clear-or-escalate verdict. Invoked by the formation-loop delegate — not triggered by users directly."
user-invocable: false
metadata:
  internal: true
---

# SDD Formation Loop

The **structure outer loop** of the SDD model. Owned by the **Architect** and run by its delegate,
the **Warden** (`sdd-warden`), parallel to the conductor running the mission loop. It fires
**post-mission**, **corpus-wide and continuous**, and asks one question and only one — **is what we
have organized right?** Its standing subject is `corpus/` and the whole organization: it evolves how
the corpus is **arranged**, never what it says.

Load `sdd:combat-log-governance` for any provenance it touches and `../design/autonomy-rubric.md`
for the floor + gradient the Warden renders its per-act verdict against — this skill defers both and
never restates them.

## Corpus-wide, never the per-spec gate

This is the load-bearing distinction. The Architect appears in **two** places that must never be
conflated:

| | **Formation loop** (this skill) | **The gate's Architect-backward face** |
|---|---|---|
| Scope | the **whole corpus** | **one spec** |
| Cadence | **continuous**, across missions | **point-in-time**, at one spec's gate |
| Question | is the corpus **organized** right? | does **this change** fit structurally? |
| Acts | dedupe, split, reconcile | one approve/pause/reject structural verdict |

Every run produces a **finding set covering every spec in the corpus**; a structural pass scoped to
one spec is **not** a formation run. When asked to act as the per-spec gate structural check, the
loop **declines** and renders no per-spec gate verdict.

## Input — corpus structure + discovery, never the combat log

The Warden reads what the corpus **is**, never what a mission **did**. Its **primary** input is
structural: the corpus **structure** and **discovery** (`corpus/`). To stay efficient rather than
cold-scanning the whole corpus every run, it may consult the durable **public trail** (CR-source
conclusions + changesets + git history) **forward** via a cursor to learn what shipped recently and
prioritize the structural pass there first. It reads **never** the combat log (the doctrine loop's
input, retired at retro) and **never** live subagent context — like the other outer loops it fires
strictly post-mission.

## The three corpus-wide acts

It acts on the corpus's **structure**, not its content. A station is **not** a dependency —
formation depends on the corpus structure and discovery (`corpus/`), not on any given station skill.

| Act | Trigger | Station (`corpus/`) | Output |
|---|---|---|---|
| **Split a monolith** | a spec trips the spec-granularity heuristic | `split-spec` | a project spec + feature children |
| **Dedupe overlap** | two specs cover overlapping behavior | `dedupe-specs` | a finding naming the overlapping specs |
| **Reconcile a contradiction** | two governances (or two specs) contradict | `dedupe-specs` | a finding naming the contradicting artifacts |

A spec **within** the granularity heuristic raises **no** split finding; two specs whose behavior
does **not** overlap raise **no** dedupe finding; artifacts that **agree** raise **no** reconcile
finding. The acts are evidence-gated, not run unconditionally.

## The Warden's self-clear-vs-escalate verdict

The Warden is **rubric-subject**, exactly as the conductor is at a gate, and has **no direct user
channel**. For **each structural act** it applies the full floor + gradient
(`../design/autonomy-rubric.md`) — the floor (**Clearance** for a narrowing act; **Compatibility**
when the act's semver class exceeds the ceiling; **Conflict** for a contested reconciliation) plus
the gradient (**blast** magnitude, **novelty**, **confidence**) — and renders its own verdict:

- **Self-clear** the reversible, derivable, low-blast acts — a coverage-preserving split, a refactor
  or consistency fix. The Warden acts **in-session** and leaves a **provisional, agent-attributed
  marker** that is never final until the Council ratifies the trail; a Council reject unwinds it.
- **Escalate** the narrowing, contested, or class-exceeding acts. The escalated finding re-enters as
  a **new CR** (`intake/`) naming the artifacts; it does not land until the Council ratifies.
  - **narrowing** — a dedupe that drops scenarios → **Clearance**;
  - **contested** — a reconciliation whose winning claim is contested → **Conflict**;
  - **class-exceeding** — a structural change whose semver class exceeds the ceiling →
    **Compatibility**;
  - a **destructive** dedupe (it deprecates a spec) → **escalates regardless** of contract-impact
    class.

It is **not** true that every act is proposed-and-ratified: the reversible/derivable acts self-clear
under the provisional marker; the narrowing/contested/class-exceeding ones emit a CR.

## Stations, not status — and the frozen-contract guard

The Warden runs stations in-session and **never** writes a spec's `status`. The frozen-contract
guard is keyed on **contract impact**, not the bare fact that a `.feature` is frozen:

- a split that **preserves every scenario verbatim narrows nothing** — it self-clears **even on a
  frozen `.feature`**, leaving the provisional marker; no freeze re-open needed;
- a split that **alters or drops scenario truth is a narrowing** — it shards a frozen contract only
  with a Council-ratified freeze re-open;
- **dedupe is destructive** — it **escalates regardless** of contract-impact class.

## Altitude discipline — route, do not decide

Formation owns corpus **structure** only and emits **no** out-of-loop decision:

- a **build-or-deprecate** request → routed to `campaign/` (Product); it makes no
  build-or-deprecate decision itself;
- a **process lesson** → routed to `doctrine/` (Process); it emits no process edit itself;
- a **per-spec gate structural check** → **declined**; formation does not run as the gate check.

Cross-capability outcome scenarios (a split or dedupe carried end-to-end) live in
`../acceptance/`; the loop and verdict behaviors are in `formation/formation.feature`.
