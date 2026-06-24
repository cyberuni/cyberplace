---
status: draft
type: feature
blocked-by:
  - sdd-operator
aligned: false
---

# SDD Contract Registry

---

## What

The `.agents/universal-plugin.json` file carries an `sdd-plugins` array — a project-level registry mapping each installed domain plugin to the SDD production-chain roles it fills. It is the single source the orchestrator reads to resolve delegates; there is no `plan.md` assignment fallback.

Each entry names a plugin, its version, the domains it covers, a five-role map, and actor-governance bindings:

```json
{
  "sdd-plugins": [
    {
      "name": "<plugin>",
      "version": "x.y.z",
      "domains": ["agent-config", "skill"],
      "roles": {
        "spec-producer": "<agent>",
        "plan-producer": null,
        "spec-judge": null,
        "impl-producer": "<agent>",
        "impl-judge": "<agent>"
      },
      "governances": {
        "director": null,
        "builder": "<skill>",
        "architect": null
      }
    }
  ]
}
```

A domain plugin's `init-<plugin>` skill writes its own entry idempotently — replacing its entry if present, leaving every other entry unchanged, and creating the file when absent. This spec owns the **file shape and init-write behavior**; resolving a delegate from the registry is owned by `sdd-orchestrator`.

---

## Why

Without a project-level registry, every spec must declare which plugin fills which role, which is repeated, error-prone, and disconnected from what is installed. A registry lets each plugin register once at install time, and gives the orchestrator a single, authoritative resolution source. The earlier shape (`scenario-advisor` / `implementer` keys, with a `plan.md` override) predates the orchestrator's five-role production chain; this spec is the modernized contract.

---

## Design decisions

### Five-role map, not contract pairs

Each entry's `roles` map uses the production-chain roles: `spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`. This replaces the old `scenario-advisor` / `implementer` pair so the registry matches the orchestrator's delegate model exactly.

### `null` and missing keys degenerate to the SDD default

A `null` role, or a missing role key, means the role falls back to the SDD default delegate (the `<plugin>-<role>` naming convention, then the generic default). A plugin lists only the roles it specializes.

### The registry is the only resolution source

Runtime resolution reads only `.agents/universal-plugin.json`. `plan.md` never controls delegate resolution; it may record the chosen architecture but is not consulted by the resolver. Contested domains are disambiguated by `domain-plugin` spec frontmatter, not by `plan.md`.

### Init writes the file directly and idempotently

`init-<plugin>` reads the file (creating `{}` if missing), locates its own entry by `name`, replaces it if found or appends it if not, and writes back without reordering or reformatting other entries. Re-running rewrites an old-shape entry to the current role-map shape.

### Open string domains, no enum

`domains` are open strings so new domain types need no schema bump.

---

## Surface

`.agents/universal-plugin.json` `sdd-plugins[]` entry schema:

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Plugin name; matches the plugin's `.plugin/plugin.json` `name` |
| `version` | Yes | Installed plugin version |
| `domains` | Yes | Open-string domain types this plugin covers |
| `roles` | Yes | Map of the five production-chain roles to agents; `null` or omitted = SDD default |
| `governances` | No | Actor-governance bindings (`director`, `builder`, `architect`); `null` = SDD default |

Init-write behavior:

1. Read `.agents/universal-plugin.json`; create with `{}` if missing.
2. Find the entry whose `name` matches this plugin; replace it, or append if absent.
3. Write back; do not reorder or reformat other entries; rewrite an old-shape entry to the role-map shape.

---

**Gherkin scenarios:** [sdd-contract-registry.feature](./sdd-contract-registry.feature)

---

## Related

- `artifacts/specs/sdd-orchestrator/spec.md` — resolves delegates by reading this registry
- `artifacts/specs/sdd-plugin/spec.md` — owning project

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-contract-registry/spec.md` |
| Scenarios | `artifacts/specs/sdd-contract-registry/sdd-contract-registry.feature` |
| Registry file | `.agents/universal-plugin.json` |
