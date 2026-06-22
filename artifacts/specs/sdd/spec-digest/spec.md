---
status: draft
type: feature
aligned: false
blocked-by:
---

# Spec Digest

---

## What

`spec-digest` is an internal, read-only SDD utility skill that synthesizes a human-readable digest of a single spec for gate review. Given a spec folder, it reads `spec.md` and the sibling `.feature` and returns a compact summary — the What line, the scenario names and count, the design-decision headings, any open markers, and the current lifecycle status. It does not mutate any file, run the gate, or make an approval decision. Its sole consumer is `validate-spec`, which calls it at the spec gate so the human ratifying the transition sees *what* they are approving before they decide.

---

## Why

The spec gate's decision is always the human's, but a bare "approve this spec?" gives the human nothing to decide on. Surfacing the digest at the gate makes ratification informed without forcing the reviewer to open and read every artifact. The synthesis is factored into its own skill — rather than inlined into `validate-spec` or the gateway — because the gateway runs on a small/fast routing model that should not read and summarize artifacts, and because a single owned digest keeps the gate report format consistent across domains.

---

## Design decisions

### The digest is read-only and decision-free

`spec-digest` reads `spec.md` and the `.feature`; it writes nothing, advances no status, and renders no verdict. It returns the digest to its caller and stops. All gate legality, alignment, and approval logic stays in `validate-spec` and the orchestrator.

### The digest is structural and domain-agnostic

The digest is derived mechanically from the artifacts every SDD spec shares: the What line, the `### ` headings under Design decisions, the `Scenario:` names in the `.feature`, the `<!-- open: ... -->` markers, and the `status` frontmatter. It does not interpret domain semantics. Domain-rich digests (for example an ACES- or Quill-flavored reading) are out of scope: the SDD plugin contract defines a closed five-role delegate set with no digest role, so the structural digest is the single default and plugins do not override it.

### The digest content is fixed

The digest always reports these sections, in order:

| Section | Source |
|---|---|
| **What** | the first paragraph under `## What` in `spec.md` |
| **Status** | the `status` frontmatter field |
| **Scenarios** | count and the list of `Scenario:` names from the `.feature` |
| **Key decisions** | the `### ` headings under `## Design decisions` |
| **Open items** | every `<!-- open: ... -->` marker in `spec.md` or the `.feature` |

A missing `.feature` is reported as zero scenarios, not an error; the gate, not the digest, decides whether that is legal.

### The gate owns when the digest is shown

`validate-spec` calls `spec-digest` at the spec gate (step 4), before presenting the gate report for ratification. `spec-digest` does not decide when it runs and is never invoked by the `sdd` gateway directly — the gateway only routes to the gate.

---

## Skill surface

No CLI surface is required. The skill is internal and invoked by `validate-spec`.

```text
spec-digest
  in: a spec folder (spec.md + sibling .feature)
  reads: spec.md and the .feature only
  out: a fixed-section digest (What, Status, Scenarios, Key decisions, Open items)
  mutates: nothing
  decides: nothing
```

**Scenarios:** [spec-digest.feature](./spec-digest.feature)

---

## Related

- `artifacts/specs/sdd/sdd-skill/spec.md` — the gateway that routes to the gate where this digest is shown.
- `artifacts/specs/sdd-gate-autonomy/spec.md` — the gate model and human-ratification boundary this enriches.
- `plugins/sdd/skills/validate-spec/SKILL.md` — the sole consumer; calls this at step 4.
- `plugins/sdd/skills/plugin-contract-governance/SKILL.md` — the closed five-role set that excludes a digest role.

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd/spec-digest/spec.md` |
| Scenarios | `artifacts/specs/sdd/spec-digest/spec-digest.feature` |
| Plan | `artifacts/specs/sdd/spec-digest/plan.md` |
| Tasks | `artifacts/specs/sdd/spec-digest/tasks.md` |
| Skill | `plugins/sdd/skills/spec-digest/SKILL.md` |
| Integration | `plugins/sdd/skills/validate-spec/SKILL.md` (step 4) |
