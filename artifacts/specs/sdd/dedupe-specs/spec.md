---
status: draft
type: feature
aligned: false
---

# Dedupe Specs

---

## What

`dedupe-specs` is the SDD skill that analyzes a set of specs to find overlapping or duplicate scope and proposes how to collapse it. It reads the candidate specs, identifies where their What, design decisions, and scenarios overlap, and proposes a **dedupe plan**: which spec survives, which are folded into it, and which `blocked-by` edges must be rewritten. On explicit user approval, it delegates the merge authoring to `create-spec` and routes the redundant specs through deprecation. It owns the **overlap analysis**; it does not author specs or write status itself. It is the downstream delegate the `sdd` gateway routes to for "dedupe overlapping specs," and it is also directly user-invocable.

---

## Why

As a spec set grows, concerns drift into more than one spec: two specs end up describing the same behavior, or one spec's scope is largely a subset of another's. Duplicate scope splits the source of truth, so gates and the graph disagree about who owns a behavior. Deciding which specs overlap and which should survive is judgment work that had no delegate, so the `sdd` gateway did it manually. A dedicated skill makes the overlap analysis explicit, while keeping authoring in `create-spec` and retirement in the deprecation path so no single skill owns the whole destructive operation.

---

## Design decisions

### Owns the overlap analysis, not authoring or status

`dedupe-specs` reads the candidate specs and produces a **dedupe plan**: the overlapping scope, the surviving spec, the specs to collapse into it, and the `blocked-by` edges to rewrite. It does not scaffold or rewrite `spec.md`/`.feature` files (that is `create-spec`), does not write `status`/`approved-by` (that is the gate skill), and does not delete or deprecate specs itself (that is the management/deprecation path). It analyzes and proposes; downstream skills act.

### Invocable by the user and by the gateway

The skill triggers on direct user intent — "dedupe these specs," "these two specs overlap," "merge the duplicate specs" — and is also the delegate the `sdd` gateway routes to under option 3 when a `dedupe-specs` skill exists. Both entrypoints run the same analysis and produce the same dedupe plan.

### Proposes a plan and requires explicit approval before acting

Deduping rewrites the surviving spec and retires the redundant ones — a structural, hard-to-reverse change. The skill must present the dedupe plan (survivor, collapsed specs, overlapping scope, and edge rewrites) and obtain **explicit user approval** before any spec is rewritten or deprecated. It never merges specs automatically.

### Overlap is detected across What, decisions, and scenarios

The analysis compares candidate specs on their What summary, design-decision headings, and `.feature` scenarios, and flags **substantial** scope overlap — not incidental shared vocabulary. Shared concepts that belong to many specs are not duplication; the skill distinguishes a genuine duplicate behavior from a legitimately reused term, and surfaces borderline cases for the user rather than collapsing them.

### Survivor selection is proposed, not assumed

The plan proposes a surviving spec using clear criteria — the most complete coverage and the most advanced lifecycle status — and names why. When the criteria are inconclusive or specs are peers, the skill asks the user to choose the survivor instead of picking silently.

### Reads candidates read-only; never edits a frozen `.feature`

The analysis reads each candidate's `spec.md` and `.feature` but writes neither. If the survivor is `approved` or `implemented`, its `.feature` is frozen — folding overlap into it routes the survivor through the draft re-open path before any scenario moves, exactly as the lifecycle freeze rule requires. The skill emits the plan; it does not patch specs in place.

### Redundant specs are retained, not deleted

After the survivor absorbs the overlap and is re-approved, the redundant specs are **deprecated**, not deleted — deprecation retains them for graph history per the lifecycle contract. `blocked-by` edges that pointed at a deprecated spec are rewritten to point at the survivor as part of the plan.

---

## Trigger surface

The skill description uses this trigger contract:

```text
Use this skill when the user wants to find and collapse overlapping SDD specs, or when the SDD gateway routes a "dedupe overlapping specs" request.
```

Examples that trigger the skill:

| User intent | Expected behavior |
|---|---|
| "Dedupe these specs" | Analyze candidates, propose a dedupe plan, await approval |
| "These two specs overlap" | Same — propose survivor and collapse plan |
| Gateway option 3 → dedupe overlapping specs | Same analysis, routed from `sdd` |
| "Are any of my specs redundant?" | Run the overlap scan and report findings without acting |

---

## Skill surface

No CLI surface is required. The public surface is the user-invocable `dedupe-specs` skill.

```text
dedupe-specs
  in: a set of candidate specs (named, a domain, or the whole spec set)
  reads: each candidate spec.md and its .feature (read-only)
  analysis: identifies substantial scope overlap across candidates
  out: a dedupe plan (survivor, collapsed specs, overlap, blocked-by rewrites)
  on approval: delegates merge authoring to create-spec; routes redundant specs through deprecate
```

**Scenarios:** [dedupe-specs.feature](./dedupe-specs.feature)

---

## Related

- `artifacts/specs/sdd/sdd-skill/spec.md` — the gateway that routes option-3 "dedupe overlapping specs" here.
- `artifacts/specs/sdd/split-spec/spec.md` — the sibling skill for the split analysis.
- `plugins/sdd/skills/create-spec/SKILL.md` — the authoring delegate this skill hands the merge to.

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd/dedupe-specs/spec.md` |
| Scenarios | `artifacts/specs/sdd/dedupe-specs/dedupe-specs.feature` |
| Skill | `plugins/sdd/skills/dedupe-specs/SKILL.md` |
