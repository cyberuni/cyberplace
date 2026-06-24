---
status: draft
type: feature
blocked-by:
  - sdd-operator
aligned: false
---

# SDD Operator — Registry Resolution

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-orchestrator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

How the Operator decides **who** to commit. At the start of a segment it reads **only** the project registry `.agents/universal-plugin.json` (the resolved lockfile — never scanning plugin directories), matches the spec's domain, and resolves each of the five production-chain role keys and the three actor governances to a plugin agent or the SDD default. A required role always lands on a real producer — a plugin agent or an SDD default; if it lands on neither, the Operator **hard-fails closed** and records nothing. Two plugins claiming one domain returns `needs-input`; the relay writes the choice to the `domain-plugin` map and resume is decisive.

## Use Cases

Every scenario in this child traces to its behavior, step-down ordered in the `.feature`:

| Scenario | Covered in |
|---|---|
| The orchestrator resolves roles from the registry without scanning | sdd-operator-resolution.feature |
| init-plugin writes the resolved role map at setup | sdd-operator-resolution.feature |
| init rewrites a pre-orchestrator registry entry to the role map | sdd-operator-resolution.feature |
| init reconciles a stale registry entry against its own version | sdd-operator-resolution.feature |
| An omitted role key falls back to the naming convention | sdd-operator-resolution.feature |
| A null role value degenerates with no agent | sdd-operator-resolution.feature |
| A required role with no resolvable producer hard-fails | sdd-operator-resolution.feature |
| An actor governance is resolved from the registry with an SDD default | sdd-operator-resolution.feature |
| A domain claimed by two plugins is disambiguated without looping | sdd-operator-resolution.feature |

## References

`sdd:plugin-contract-governance` (registry shape, role/governance keys); `combat-log-governance` / `sdd-provenance` (the fail-closed structural-error class).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-resolution/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-resolution/sdd-operator-resolution.feature` |
