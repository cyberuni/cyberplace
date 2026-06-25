---
status: approved
type: feature
blocked-by:
  - sdd-operator
aligned: true
produced-by:
  spec-producer: sdd:sdd-operator
  spec-judge: sdd:sdd-spec-judge
approval:
  spec:
    verdict: approve
    by: unional
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
| UC-2 | A plugin's `init-<plugin>` skill re-runs at a newer version over a stale entry | New plugin version, current `roles{}` / `governances{}` shape | The stale entry is reconciled: `version` is updated and `roles`/`governances` are brought to the current shape; an old-shape entry is rewritten; a malformed file fails closed |

> **Design context — resolution.** Resolving a delegate from the registry (reading an entry to find which agent fills a given role) is owned by `sdd-operator`, not by this spec. It is relevant here only because the entry shape defined above is the direct input to that lookup: the `roles{}` and `governances{}` maps are what the operator traverses at resolution time. This spec owns the shape and the init-write behavior; the traversal semantics are `sdd-operator`'s responsibility.

---

## Design decisions

### Five-role map, not contract pairs

Each entry's `roles` map uses the production-chain roles: `spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`. This replaces the old `scenario-advisor` / `implementer` pair so the registry matches the operator's delegate model exactly.

### `null` and missing keys degenerate to the SDD default

For **roles**: a `null` value, or a missing role key, is a legal entry shape — a plugin lists only the roles it specializes and leaves the rest null or absent. For **governances**: the `governances` block itself is required on every entry; each individual binding (`director`, `builder`, `architect`) may be `null`.

A non-null role value **names a spawned agent** (a plugin delegate or a model-tuned producer) that runs at its own model. Degeneration of a `null` or absent role is performed by `sdd-operator` at resolution time and **differs by role kind** — this spec only guarantees what is a valid stored entry shape, not the traversal:

- **A producer role** (`spec-producer`, `plan-producer`, `impl-producer`) that is `null` or absent → the operator **loads the producer governance and authors inline** in its own warm context; the recorded `produced-by.<role>` is `sdd:sdd-operator`. (A named producer agent is instead spawned at its own model.)
- **A judge role** (`spec-judge`, `impl-judge`) that is `null` or absent → the operator **spawns the SDD-default cold judge agent** (`sdd-spec-judge`, `sdd-implementer`). A judge default is never loaded inline — grader independence requires a cold context.

The `<plugin>-<role>` naming convention applies only when a role **key is omitted** and the plugin ships an agent at that conventional name. There is no "generic Builder" fallback: an unfilled producer is the operator authoring inline, an unfilled judge is the cold SDD-default agent. "Conductor writes, cold judges grade."

### The registry is the only resolution source

Runtime resolution reads only `.agents/universal-plugin.json`. `plan.md` never controls delegate resolution; it may record the chosen architecture but is not consulted by the resolver. Contested domains are disambiguated by the operator recording the chosen producer into the spec's `produced-by` map (a resolution cache owned by `sdd-operator`), never by `plan.md` and never by the retired `domain-plugin` field.

### Init writes the file directly and idempotently

`init-<plugin>` reads the file (creating `{}` if missing), locates its own entry by `name`, replaces it if found or appends it if not, and writes back without reordering or reformatting other entries. Re-running rewrites an old-shape entry to the current role-map shape, and reconciles a stale entry against the plugin's own version: on a version mismatch it updates the recorded `version` and brings the `roles`/`governances` maps to the current plugin shape. The operator never compares versions at runtime — version reconciliation is the init skill's job at install/upgrade/re-run, so the operator only ever reads a current-shape entry.

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
| `roles` | Yes | Map of the five production-chain roles to spawned agents; `null` or omitted = SDD default (a producer role → operator authors inline as `sdd:sdd-operator`; a judge role → operator spawns the cold SDD-default judge agent) |
| `governances` | Yes | Actor-governance bindings (`director`, `builder`, `architect`); the block is required, each binding may be `null` = SDD default |

Init-write behavior:

1. Read `.agents/universal-plugin.json`; create with `{}` if missing.
2. **If the file exists but contains malformed JSON, fail with an error and stop — do not overwrite.**
3. Find the entry whose `name` matches this plugin; replace it, or append if absent.
4. Reconcile a stale entry against the plugin's own version: on a `version` mismatch, update `version` and bring `roles`/`governances` to the current plugin shape.
5. Write back; do not reorder or reformat other entries; rewrite an old-shape entry to the role-map shape.

---

**Gherkin scenarios:** [sdd-contract-registry.feature](./sdd-contract-registry.feature)

---

## Related

- `artifacts/specs/sdd-operator/spec.md` — resolves delegates by reading this registry
- `artifacts/specs/sdd-plugin/spec.md` — owning project

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-contract-registry/spec.md` |
| Scenarios | `artifacts/specs/sdd-contract-registry/sdd-contract-registry.feature` |
| Registry file | `.agents/universal-plugin.json` |
