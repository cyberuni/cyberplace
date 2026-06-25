---
status: draft
type: feature
domain-type: skill
aligned: false
---

# Split Spec

---

## What

`split-spec` is the SDD skill that analyzes one oversized spec and proposes how to break it into smaller, cohesive specs. It reads the target spec, groups its design decisions and scenarios into independent concerns, and proposes a set of child specs — each independently gateable — with their scope and `blocked-by` edges. On explicit user approval of that plan, it delegates child authoring to `create-spec` and routes the original through revision or deprecation. It owns the **split analysis**; it does not author specs or write status itself. It is the downstream delegate the `sdd` gateway routes to for "split a spec," and it is also directly user-invocable.

---

## Why

Specs accumulate scope: a single spec grows multiple concerns until it violates "one workflow per spec," its `.feature` sprawls, and its gate becomes hard to reason about. Deciding *where* to cut — which scenarios and decisions form a cohesive child — is judgment work that had no delegate, so the `sdd` gateway performed it manually. A dedicated skill makes the split analysis explicit and repeatable, while keeping authoring in `create-spec` and retirement in the deprecation path so no single skill owns the whole destructive operation.

---

## Design decisions

### Owns the split analysis, not authoring or status

`split-spec` reads the target spec and produces a **split plan**: the proposed child specs, what each covers, and the `blocked-by` edges between them and toward the original. It does not scaffold `spec.md`/`.feature` files (that is `create-spec`), does not write `status`/`approval` (that is the gate skill), and does not delete or deprecate specs itself (that is the management/deprecation path). It analyzes and proposes; downstream skills act.

### Invocable by the user and by the gateway

The skill triggers on direct user intent — "split this spec," "break X into smaller specs," "this spec is too big" — and is also the delegate the `sdd` gateway routes to under option 3 when a `split-spec` skill exists. Both entrypoints run the same analysis and produce the same split plan.

### Proposes a plan and requires explicit approval before acting

Splitting creates new specs and retires the original — a structural, hard-to-reverse change. The skill must present the split plan (child specs, their scope, `blocked-by` edges, and what happens to the original) and obtain **explicit user approval** before any child is authored or the original is deprecated. It never restructures specs automatically.

### Boundaries group cohesive concerns

The analysis groups the target's design decisions and `.feature` scenarios into clusters that each form one coherent workflow, so every proposed child is independently gateable. A scenario or decision belongs to exactly one child; shared vocabulary becomes a governance or a `blocked-by` dependency rather than duplicated scope. If a clean partition is not obvious, the skill surfaces the ambiguous decisions for the user to assign rather than guessing.

### Reads the target read-only; never edits a frozen `.feature`

The analysis reads `spec.md` and the `.feature` but writes neither. If the target is `approved` or `implemented`, its `.feature` is frozen — splitting routes the original through the draft re-open path before any scenario moves, exactly as the lifecycle freeze rule requires. The skill emits the plan; it does not patch the target in place.

### The original is retained, not deleted

After children are authored and approved, the original spec is **deprecated**, not deleted — deprecation retains it for graph history per the lifecycle contract. `blocked-by` edges that pointed at the original are rewritten to point at the relevant child specs as part of the plan.

---

## Trigger surface

The skill description uses this trigger contract:

```text
Use this skill when the user wants to break one large SDD spec into smaller cohesive specs, or when the SDD gateway routes a "split a spec" request.
```

Examples that trigger the skill:

| User intent | Expected behavior |
|---|---|
| "Split this spec into smaller ones" | Analyze the target, propose a split plan, await approval |
| "This auth spec is too big" | Same — propose boundaries for auth |
| Gateway option 3 → split a spec | Same analysis, routed from `sdd` |
| "Just delete the parts about X" | Out of scope — not a split; report and suggest revise/deprecate |

---

## Skill surface

No CLI surface is required. The public surface is the user-invocable `split-spec` skill.

```text
split-spec
  in: a target spec to split (named domain or spec folder)
  reads: the target spec.md and its .feature (read-only)
  analysis: groups decisions and scenarios into cohesive child concerns
  out: a split plan (child specs, scope, blocked-by edges, original disposition)
  on approval: delegates child authoring to create-spec; routes the original through revise/deprecate
```

**Scenarios:** [split-spec.feature](./split-spec.feature)

---

## Related

- `artifacts/specs/sdd/sdd-skill/spec.md` — the gateway that routes option-3 "split a spec" here.
- `artifacts/specs/sdd/dedupe-specs/spec.md` — the sibling skill for the overlap/dedupe analysis.
- `plugins/sdd/skills/create-spec/SKILL.md` — the authoring delegate this skill hands child specs to.

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd/split-spec/spec.md` |
| Scenarios | `artifacts/specs/sdd/split-spec/split-spec.feature` |
| Skill | `plugins/sdd/skills/split-spec/SKILL.md` |
