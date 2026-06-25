---
status: draft
type: feature
blocked-by:
  - sdd-operator
aligned: true
approval:
  spec:
    verdict: pause
    why:
      reversibility: "safe — contract-layer edits to one spec folder this run; cheap revert, no published/external effect"
      blast-radius: "risky — framework governance; the registry shape is a shared contract every plugin init skill and sdd-operator depend on, so the subject reaches beyond this spec's own artifacts"
      novelty: "risky — four contestable defaults resolved by agent judgement (governances as a required block with nullable bindings, init fails closed on corrupt JSON, domain-plugin retired in favor of produced-by, ## Use Cases added) that the Council has not yet seen"
      confidence: "safe — spec-judge passes 11/11, no open markers, spec.md ↔ .feature coherent"
---

# SDD Contract Registry

---

## What

The `.agents/universal-plugin.json` file carries an `sdd-plugins` array — a project-level registry mapping each installed domain plugin to the SDD production-chain roles it fills. It is the single source the operator reads to resolve delegates; there is no `plan.md` assignment fallback.

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

A domain plugin's `init-<plugin>` skill writes its own entry idempotently — replacing its entry if present, leaving every other entry unchanged, and creating the file when absent. This spec owns the **file shape and init-write behavior**; resolving a delegate from the registry is owned by `sdd-operator`.

---

## Why

Without a project-level registry, every spec must declare which plugin fills which role, which is repeated, error-prone, and disconnected from what is installed. A registry lets each plugin register once at install time, and gives the operator a single, authoritative resolution source. The earlier shape (`scenario-advisor` / `implementer` keys, with a `plan.md` override) predates the operator's five-role production chain; this spec is the modernized contract.

---

## Use Cases

| # | Trigger | Inputs | Outcome |
|---|---|---|---|
| UC-1 | A plugin's `init-<plugin>` skill runs | Plugin name, version, `domains[]`, `roles{}` (five-role map), `governances{}` | The plugin's entry is written idempotently into `.agents/universal-plugin.json` `sdd-plugins[]`; the file is created if absent; other entries are untouched |
| UC-2 | `sdd-operator` needs to resolve a production-chain role for a domain | Domain name, role key (e.g., `spec-producer`) | The resolved agent name is read from the matching entry's `roles{}`/`governances{}`; a `null` or absent binding degenerates to the SDD default |

> **UC-1** is init-write territory (owned here). **UC-2** is operator-resolution territory (owned by `sdd-operator`); it is listed here because the entry shape this spec defines is the direct input to that lookup.

---

## Design decisions

### Five-role map, not contract pairs

Each entry's `roles` map uses the production-chain roles: `spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`. This replaces the old `scenario-advisor` / `implementer` pair so the registry matches the operator's delegate model exactly.

### `null` and missing keys degenerate to the SDD default

For **roles**: a `null` value, or a missing role key, is a legal entry shape — a plugin lists only the roles it specializes and leaves the rest null or absent. For **governances**: the `governances` block itself is required on every entry; each individual binding (`director`, `builder`, `architect`) may be `null`. The degeneration (null/absent → SDD default, using the `<plugin>-<role>` naming convention then the generic default) is performed by `sdd-operator` at resolution time; this spec only guarantees what is a valid stored entry shape.

### The registry is the only resolution source

Runtime resolution reads only `.agents/universal-plugin.json`. `plan.md` never controls delegate resolution; it may record the chosen architecture but is not consulted by the resolver. Contested domains are disambiguated by the operator recording the chosen producer into the spec's `produced-by` map (a resolution cache owned by `sdd-operator`), never by `plan.md` and never by the retired `domain-plugin` field.

### Init writes the file directly and idempotently

`init-<plugin>` reads the file (creating `{}` if missing), locates its own entry by `name`, replaces it if found or appends it if not, and writes back without reordering or reformatting other entries. Re-running rewrites an old-shape entry to the current role-map shape.

### Init fails closed on a corrupt file

If `.agents/universal-plugin.json` exists but contains malformed JSON, `init-<plugin>` must fail with an error and leave the file untouched. Silently overwriting a corrupt file could destroy valid entries from other plugins that happened to survive in a partial write. Fail loudly; let a human repair the file.

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
| `governances` | Yes | Actor-governance bindings (`director`, `builder`, `architect`); the block is required, each binding may be `null` = SDD default |

Init-write behavior:

1. Read `.agents/universal-plugin.json`; create with `{}` if missing.
2. **If the file exists but contains malformed JSON, fail with an error and stop — do not overwrite.**
3. Find the entry whose `name` matches this plugin; replace it, or append if absent.
4. Write back; do not reorder or reformat other entries; rewrite an old-shape entry to the role-map shape.

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
