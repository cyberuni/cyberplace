---
status: approved
type: feature
blocked-by:
  - sdd-operator
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
---

# SDD Operator — Registry Resolution

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

How the Operator decides **who** to commit. At the start of a segment it reads **only** the project registry `.agents/universal-plugin.json` (the resolved lockfile — never scanning plugin directories), matches the spec's domain, and resolves each of the five production-chain role keys and the three actor governances to a plugin agent or the SDD default. A required role always lands on a real producer — a plugin agent or an SDD default; if it lands on neither, the Operator **hard-fails closed** and records nothing. Two plugins claiming one domain returns `needs-input`; the relay writes the choice to the `domain-plugin` map and resume is decisive.

## Use Cases

This behavior has two coarse entry-points: the **runtime resolution** the Operator performs at the start of every segment, and the **setup/upgrade write** the init-plugin performs to populate the lockfile that resolution reads. Each entry-point is invoked differently, takes different inputs, and produces a different outcome; the nine frozen `.feature` scenarios are verification cases grouped under one or the other.

### UC-1 — Operator resolves delegates at segment start

| | |
|---|---|
| **Trigger** | `sdd-orchestrator` opens a segment for a spec and must decide who to commit to each production-chain role and actor governance. |
| **Inputs** | The spec's domain; the project registry `.agents/universal-plugin.json` (the resolved lockfile) — read only, never a plugin-directory scan. |
| **Outcome** | Each required role lands on a real producer (plugin agent or SDD default) and each actor governance on a plugin or SDD default; an unresolvable required role **hard-fails closed** recording nothing; a domain claimed by two plugins returns `needs-input` (decisive on resume). |

Verified by (`.feature`):

- The orchestrator resolves roles from the registry without scanning *(happy path — reads the map, no directory scan)*
- An omitted role key falls back to the naming convention
- A null role value degenerates with no agent
- A required role with no resolvable producer hard-fails *(negative — fail-closed, records nothing)*
- An actor governance is resolved from the registry with an SDD default
- A domain claimed by two plugins is disambiguated without looping *(`needs-input` branch — relay writes `domain-plugin`, resume is decisive)*

### UC-2 — init-plugin writes / reconciles the registry entry

| | |
|---|---|
| **Trigger** | A user runs the plugin's init skill (e.g. `init-quill`) on install, upgrade, or manual re-run. |
| **Inputs** | The plugin's own version and role coverage; any existing registry entry for the plugin (current-shape, old-shape, or stale-version). |
| **Outcome** | The registry entry is written in the role-to-agent map shape under the `sdd-plugins` array — domain coverage, five-role map, and plugin version — and reconciled to the plugin's own version, so UC-1 always reads a current, well-shaped lockfile and never compares versions or reads the old shape at runtime. |

Verified by (`.feature`):

- init-plugin writes the resolved role map at setup *(happy path — fresh entry)*
- init rewrites a pre-orchestrator registry entry to the role map *(migration — old shape → role map)*
- init reconciles a stale registry entry against its own version *(version drift — rewrite on mismatch)*

## References

`sdd:plugin-contract-governance` (registry shape, role/governance keys); `combat-log-governance` / `sdd-provenance` (the fail-closed structural-error class).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-resolution/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-resolution/sdd-operator-resolution.feature` |
