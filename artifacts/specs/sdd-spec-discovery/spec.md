---
status: draft
aligned: false
blocked-by:
  - sdd-plugin
---

# Spec Discovery

---

## What

A convention by which any SDD consumer locates specs without a registry or a fixed path. A spec is defined by its **shape, not its location**: an SDD spec is any git-tracked `spec.md` whose frontmatter `status` is in the lifecycle enum. Consumers discover specs by globbing `**/spec.md`, filtering to those with a lifecycle `status`, and matching a requested domain name to a spec's folder slug (its root-relative path). The convention is owned by `lifecycle-governance`; the `sdd` gateway and `render-spec-graph` consume it instead of assuming `specs/<domain>/`.

---

## Why

Spec locations vary across projects and even within one: flat (`sdd-orchestrator/`) and nested (`sdd/spec-digest/`), under `artifacts/specs/` or elsewhere. Any mechanism that *enumerates* specs — an index, an array in config, a hand-maintained graph — duplicates information the spec folders already carry and drifts the moment a spec is added, moved, or removed. Defining a spec by the presence of lifecycle frontmatter makes the spec folder the single source of truth and makes discovery a pure derivation, so no second place can fall out of sync. It also fixes the gateway's prior inability to find a spec whose folder differs from the implementation folder.

---

## Design decisions

### Shape, not location

A spec is identified by a git-tracked `spec.md` carrying a lifecycle `status`, found via `**/spec.md`. No specs root is hardcoded and no path convention like `specs/<domain>/` is assumed. A project may keep specs anywhere; discovery still finds them.

### Lifecycle frontmatter is the discriminator

A `spec.md` without a `status` in the lifecycle enum is **not** an SDD spec and is excluded. This cleanly separates SDD-governed specs from unrelated spec documents that may share the `spec.md` filename, with no allowlist or ignore-list to maintain.

### No enumeration, ever

Discovery never reads a registry, array, or index of spec paths. Derived views such as `graph.md` are rendered from the discovered set and regenerated, never hand-edited. Eliminating enumeration removes the drift point that a stale index represents.

### Domain resolves to a folder slug

A requested domain name resolves by matching against each discovered spec's folder slug — the root-relative path of the folder containing `spec.md` — by leaf segment or full slug. The spec folder is distinct from the implementation folder; discovery returns the former. An ambiguous match is disambiguated with the user, not guessed.

### Owned by lifecycle-governance

The convention lives in `lifecycle-governance` (the canonical home for what a spec is). The `sdd` gateway and `render-spec-graph` defer to it rather than restating it, so the rule has one definition.

---

## Skill surface

No CLI surface. The convention is a rule encoded in `lifecycle-governance` and consumed by SDD skills.

```text
discover specs:
  in:  a repo (and optionally a requested domain name)
  scan: git-tracked **/spec.md
  keep: those whose frontmatter status is in the lifecycle enum
  out: spec folders (slug = root-relative folder path), or the one matching the domain
```

**Scenarios:** [sdd-spec-discovery.feature](./sdd-spec-discovery.feature)

---

## Related

- `plugins/sdd/skills/lifecycle-governance/SKILL.md` — owns the discovery rule (the "Spec discovery" section).
- `artifacts/specs/sdd/sdd-skill/spec.md` — the gateway that consumes discovery to locate a spec for a named domain.
- `artifacts/specs/sdd-spec-graph/spec.md` — renders `graph.md` from the discovered set; the derived-view consumer.

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-spec-discovery/spec.md` |
| Scenarios | `artifacts/specs/sdd-spec-discovery/sdd-spec-discovery.feature` |
| Rule | `plugins/sdd/skills/lifecycle-governance/SKILL.md` (Spec discovery) |
| Gateway consumer | `plugins/sdd/skills/sdd/SKILL.md` (Route The Work) |
