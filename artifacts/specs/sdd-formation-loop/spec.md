---
status: implemented
type: feature
priority: 3
aligned: true
blocked-by:
  - sdd-spec-graph
  - sdd-spec-discovery
produced-by:
  plan-producer: sdd:sdd-planner
  impl-producer: sdd:builder
  impl-judge: sdd:sdd-implementer
log:
  - seq: 1
    kind: report
    role: impl-producer
    agent: sdd:builder
    outcome: pass
  - seq: 2
    kind: report
    role: impl-judge
    agent: sdd:sdd-implementer
    outcome: pass
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
---

# SDD Formation Loop — keeping the corpus coherent

**Formation loop** (metaphor) / **Structure loop** (descriptive) — the Architect's outer loop that keeps the spec **corpus** structurally coherent across missions.

---

## What

The **Formation loop** (descriptively, the **Structure loop**) — one of the **three outer loops** of the SDD model, owned by the **Architect** actor and worn as the fleet role **Warden**. Where the inner **Mission loop** wins one mission, the Formation loop keeps the fleet's **order of battle** coherent: it is the Warden's continuous act across the **whole corpus** of specs, asking one question and only one — **is what we have organized right?**

It acts on the corpus's *structure*, not its content:

- **dedupe** overlapping specs so each behavior has exactly one home,
- **split** monoliths that have outgrown the spec-granularity heuristic,
- **keep the spec graph sound** — the rendered DAG stays in sync with the `blocked-by` edges, and cycles are surfaced,
- **reconcile contradictions** between governances or between specs.

```mermaid
flowchart TB
  subgraph corpus[the spec corpus]
    a[spec]:::s
    b[spec]:::s
    c[spec]:::s
  end
  corpus --> warden[Warden · Formation loop<br/>continuous, corpus-wide]
  warden -->|too big| split[split-spec station]
  warden -->|overlap / contradiction| dedupe[dedupe-specs station]
  warden -->|edges changed| render[render-spec-graph station]
  split --> corpus
  dedupe --> corpus
  render --> graph[(graph.md back in sync)]
  classDef s fill:#eef,stroke:#88a;
```

What it is **not**: it does **not** decide *what* to build or deprecate (that is the **Campaign / Product** loop, the Director), and it does **not** grow *how we work* (that is the **Doctrine / Process** loop, the Strategist). Formation is altitude-disciplined to corpus organization alone.

---

## Why

A growing corpus of specs decays structurally if no one tends it. Two specs drift into covering the same behavior; one spec absorbs three behaviors and becomes expensive to re-judge; the rendered graph falls out of sync with the `blocked-by` edges; two governances quietly contradict each other. None of these are *Mission* problems (no single mission is wrong) and none are *Campaign* problems (the right features may all be present) — they are **structure** problems, and the model names a distinct loop and actor for them so they are actually tended rather than ignored.

---

## Design decisions

### Corpus-wide and continuous — DISTINCT from the per-spec gate judgment

This is the load-bearing distinction of this spec. The Architect appears in **two** places, and they must not be conflated:

| | **Formation loop** (this spec) | **The gate's Architect-backward face** (`architect-governance`) |
|---|---|---|
| Scope | the **whole corpus** | **one spec** |
| Cadence | **continuous**, across missions | **point-in-time**, at one spec's gate |
| Question | is the corpus **organized** right? | does **this spec** fit structurally? |
| Acts | dedupe, split, graph soundness, reconcile | a single approve/pause/reject structural verdict |

The Formation loop **does not fire** as the per-spec structural check at a gate, and the per-spec gate structural judgment **is not** the Formation loop. They share the Architect's *concern* (structural fit) but operate at different altitudes. Formation reads the corpus and reshapes it between missions; the gate judges one mission's contract in the moment.

### Formation runs through stations

The Formation loop's acts are performed by **stations** — skills the Operator runs in-session over the corpus:

| Act | Station | Status |
|---|---|---|
| split a monolith | `split-spec` | **exists** |
| keep the graph sound | `render-spec-graph` | **exists** |
| dedupe / reconcile | `dedupe-specs` | **exists** |

Every act now has a dedicated station; `dedupe-specs` and `split-spec` were each once a noted gap before being built. A station is *not* a spec dependency — the Formation loop depends on the spec **graph** and **discovery**, not on the existence of any given station skill.

### The split trigger is the spec-granularity heuristic

A spec is a split candidate when it trips the granularity heuristic owned by `spec-governance`: the `.feature` exceeds ~15–20 scenarios, the `## Use Cases` table spans more than one distinct behavior, or different parts change on independent cadences. A spec **within** the heuristic is left alone — Formation does not split for its own sake.

### Altitude discipline — Formation owns structure only

Formation never decides what to build (Campaign/Director) and never grows the process (Doctrine/Strategist). A "we should build feature X" or "we should add cause Y to the enum" observation is **out of scope** here and belongs to the sibling loop that owns it.

---

## Use Cases

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **Split a monolith** | a spec trips the spec-granularity heuristic (too many scenarios / >1 behavior / independent cadences) | the oversized spec + the granularity heuristic | run `split-spec` → a project spec + feature children |
| **Dedupe overlap** | two specs cover overlapping behavior | the overlapping specs | run `dedupe-specs` → a dedupe proposal naming the overlapping specs so each behavior has one home |
| **Keep the graph sound** | the rendered graph is stale vs the `blocked-by` edges, or a cycle appears | the corpus's `blocked-by` edges | run `render-spec-graph` → `graph.md` back in sync, cycles surfaced |
| **Reconcile a contradiction** | two governances or two specs contradict | the contradicting artifacts | run `dedupe-specs` → a reconciliation proposal naming the contradicting artifacts so the corpus holds no internal contradiction |
| **Stay altitude-disciplined** | a request that belongs to another loop (a build/deprecate proposal, a process lesson), or a per-spec gate structural check | the misrouted request, or the spec at its gate | acts corpus-wide; produces no out-of-loop decision and routes the request to the owning loop (Campaign / Doctrine); does not run as the per-spec gate check |

---

## Command surface / API

| Concern | Behavior |
|---|---|
| Trigger | corpus-wide, continuous — never a per-spec gate check |
| Split | the granularity heuristic (`spec-governance`); fires only when tripped |
| Graph | `render-spec-graph` re-syncs `graph.md` from `blocked-by` edges and surfaces cycles |
| Dedupe / reconcile | `dedupe-specs` proposes the resolution (naming the artifacts) so each behavior has one home and no contradiction stands |
| Out of scope | what-to-build (Campaign), how-we-work (Doctrine) |

---

## Related

- `artifacts/specs/motive-model/spec.md` — the Architect actor and the three outer loops; this spec is the **Structure** one
- `artifacts/specs/sdd-doctrine-loop/spec.md` — the sibling outer loop (Strategist / Process)
- `artifacts/specs/sdd-mission-loop/spec.md` — the inner loop, for contrast (one mission vs the whole corpus)
- `artifacts/specs/sdd-spec-graph/spec.md` — the spec-DAG the `render-spec-graph` station re-syncs
- `plugins/sdd/skills/split-spec` — the station that decomposes a monolith
- `plugins/sdd/skills/render-spec-graph` — the station that re-renders the graph from `blocked-by` edges

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-formation-loop/spec.md` |
| Scenarios | `artifacts/specs/sdd-formation-loop/sdd-formation-loop.feature` |
