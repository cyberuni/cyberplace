---
cr-ref: control-flow-graph-rename
target-project: sdd
blast: medium
hitl: true
leash: auto-spec
tier: opus
todos:
  - content: "intake — plan scaffolded; target project sdd; ledger leash line written"
    status: done
  - content: "explore — 17 files renamed; 2 hits found ONLY by a wrapped-line sweep; glossary entry + 4 retired-terms rows"
    status: done
  - content: "spec gate — freeze proven intact by gherkin-cli structural diff (modified 0/removed 0); self-asserted, seq 2"
    status: done
  - content: "deliver — no gate script keys on the old heading; root pnpm verify 34/34"
    status: done
  - content: "impl gate — cold judge round 1 CHANGE (prose rewrap only, substance PASS); ratified by unional"
    status: done
  - content: "handoff — PR #333 against main"
    status: done
---

# CR control-flow-graph-rename — one name for the capability's internal decision structure

CR source: Council directive (no forge issue). Branch `sdd/control-flow-graph-rename`.
Target: `.agents/specs/sdd/` (project-path `plugins/sdd`).

## The defect

The SDD corpus names **one** concept — a capability's internal decision structure — with **three**
terms: **logic graph** (9 sites), **decision graph** (~12 sites, the dominant term), **decision
tree** (1 site). None is defined in `glossary.md`. Three names for one concept is the defect.

## The decision — SETTLED, do not relitigate

The name is **control-flow graph (CFG)**.

- Not a *tree* — it has loops and joins, and many paths reach the same node.
- Chosen over "flow diagram" (names the picture; the spec makes claims about the **structure** —
  "a use case is a path through it", "the suite's sections mirror it", "every decision reachable,
  no dangling branch") and over "flow graph" (vague; reads as data-flow).
- Lands in the compiler vocabulary the repo already runs (SSA lowering, the mission-graph
  compiler/scheduler model in ADR-0025).

Spec convention applies: first use per document is `control-flow graph (CFG)`; later uses may be `CFG`.

## Owner rulings this session

1. **`## Logic` → `## Control Flow`.** The mandated spec section heading renames too
   (`spec-format-governance` fixes the four section names). 2 live corpus instances + the scaffold
   + a comment in `partition-quality.feature`.
2. **All "decision graph" sites are in scope** (~12, not the 2 the originating brief listed).

## Freeze status — no Clearance floor

- `authoring/spec-format/` is a **README-only node** — it owns no `.feature`, so the four-section
  contract is **not** frozen in any scenario.
- The only `.feature` hit is `project-spec/partition-quality/partition-quality.feature:98`, and it
  is a **comment**, not a step. Comment edits carry no scenario delta — verify structurally with
  `gherkin-cli diff` at the gate before touching it.
- Therefore: **no narrowing, no freeze re-open, no Clearance**.

## Not in scope — false-positive classes

| Site | Why it stays |
|---|---|
| `mission-graph`, `work-graph` | different structures (project-level scheduling, not capability-internal) |
| `apps/website/.../sdd/control-flow.md` | SDD's **process** control flow (the mission loop) — a different concept. **Name collision noted**; page left alone. |
| `packages/universal-plugin/governances/plugin-design.md` "Decision tree for always-on guidance" | unrelated authoring aid |
| bare "logic" / bare "graph" / generic "control flow" prose | not the concept noun |

`.agents/plans/*.plan.md` — historical briefs, record what was true when written. **Out of scope**
(they are provenance, not doctrine).

## The one site that is NOT a plain rename

`.agents/specs/sdd/authoring/spec-format/README.md:64` lists **diagram kinds**:
`(state, data flow, decision tree)`. Change `decision tree` → `control-flow`, keep it **as a diagram
kind in that list**. Do not fold it into the concept noun; do not restructure the list.

## The asymmetric risk — indirect references

A term-swap alone under-delivers. The governances refer to the concept by **pronoun**: "use cases
enter **this graph**", "section by **sub-graph**", "each edge of **it**", "the suite's sections
mirror **it**", "a seed the agent **grows the graph around**". These must read coherently after the
rename. Sweep for them explicitly — grepping the three terms will not find them.

## Done looks like

- Zero residual `logic graph` / `decision graph` / `decision-tree-as-concept` hits corpus-wide.
- `glossary.md` defines **control-flow graph (CFG)**, in the **same commit** as the rename, plus
  four **Retired terms** rows so the old names are not reintroduced.
- Root `pnpm verify` green in this worktree (root also runs `//#knip` + `//#verify:specs`).
- PR against `main`.

## Outcome

17 files renamed. Residual in-scope hits: **zero**. Root `pnpm verify` **34/34**.

**The finding that justified the process.** Two occurrences were **wrapped across a line break**
(`decision\ngraph` in `authoring/suite-format/README.md`, `the drawn logic\n  graph` in
`suite-format-governance/README.md`). Every single-line grep — including the one behind the
originating brief's site table — is blind to them. A `sed` sweep would have shipped exactly the
half-rename this CR exists to prevent. Sweep whitespace-normalized, not line-by-line.

**Freeze proven, not asserted.** `gherkin-cli diff` on the one touched `.feature`:
`modified: 0, removed: 0, unchanged: 15, addOnly: true`. The hit was a comment.

**No lint keys on the old heading.** Checked before renaming: `check-spec-state` requires only
`## Use Cases` for a behavioral node; `check-suite` indexes only `## Scenario map`.

## NEXT

Merge PR #333. No follow-ups filed: the one residual observation (the new concept noun shares the
word "control flow" with the website page naming SDD's *process* control flow) is recorded as a
distinction in the glossary entry itself, which is where a reintroduction would be caught.
