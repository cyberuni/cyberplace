---
status: implemented
type: feature
domain-type: subagent
blocked-by:
  - sdd-operator
aligned: true
produced-by:
  spec-producer: sdd:sdd-operator
  impl-producer: sdd:sdd-operator
  impl-judge: sdd:sdd-implementer
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
---

# SDD Operator — Registry Resolution

> **Feature child of [`sdd-operator`](../sdd-operator/spec.md).** This spec owns one behavior of the Operator (the SDD lead delegate, `sdd-operator`). The parent holds the human-readable overview and the model invariants; this child holds the normative scenarios for its slice.

## What

How the Operator decides **who** to commit. At the start of a segment it reads **only** the project registry `.agents/universal-plugin.json` (the resolved lockfile — never scanning plugin directories), matches the spec's domain, and resolves each of the five production-chain role keys and the three actor governances to a plugin delegate or the SDD default. This spec owns only the **read side** — the Operator's resolution at segment start. The init-plugin **registry-write** behavior (writing, migrating, and version-reconciling the lockfile entry) is owned by the `sdd-plugin` / init spec (relocation target landing next segment) — tracked as in-transit, not dropped.

Resolution distinguishes role kind and, for producers, whether a model-tuned agent is named:

- **Plugin / named-agent producer** → **spawn**. If a covered domain supplies a delegate agent, or a producer slot **names a model-tuned agent** (in the registry or the `produced-by` slot), the Operator **spawns that agent** so it runs with its **own model and effort**. The spawn path is keyed on whether an agent is *named*, not merely on whether a full domain plugin covers the domain.
- **Unnamed SDD-default producer** → **inline**. With no named agent for a producer role, the Operator **loads the SDD-default producer governance and authors inline (warm) at the operator's own model**, recorded as `sdd:sdd-operator`.
- **Judge** → **always spawn cold**. A judge default is a **cold agent the Operator spawns** (`sdd:sdd-spec-judge`, `sdd:sdd-implementer`) in a fresh context — never run inline, regardless of any naming.

A required role always lands on a real delegate — a spawned agent (plugin or named model-tuned producer), a loaded SDD-default producer governance, or a spawned SDD-default judge agent; if it lands on none, the Operator **hard-fails closed** and records nothing. Two plugins claiming one domain returns `needs-input`; the relay writes the choice to the `produced-by` map and resume is decisive.

## Use Cases

This behavior has **one coarse entry-point**: the **runtime resolution** the Operator performs at the start of every segment. (The setup/upgrade **write** that populates the lockfile is a different subject — owned by the `sdd-plugin` / init spec, relocation target landing next segment.) The eight `.feature` scenarios are all verification cases for this one entry-point.

### UC-1 — Operator resolves delegates at segment start

| | |
|---|---|
| **Trigger** | `sdd-operator` opens a segment for a spec and must decide who to commit to each production-chain role and actor governance. |
| **Inputs** | The spec's domain; the project registry `.agents/universal-plugin.json` (the resolved lockfile) — read only, never a plugin-directory scan. |
| **Outcome** | Each required role resolves per its kind — a **spawn** for any *named* agent (a plugin delegate **or** a model-tuned producer agent named in the slot), running at its own model/effort; an **unnamed SDD-default producer** role resolves to the Operator loading the producer governance and authoring inline at the operator's model (recorded `sdd:sdd-operator`); a **judge** role always spawns the cold judge agent — and each actor governance resolves to a plugin governance or SDD default; an unresolvable required role **hard-fails closed** recording nothing; a domain claimed by two plugins returns `needs-input` (decisive on resume). |

Verified by (`.feature`):

- The operator resolves roles from the registry without scanning *(happy path — reads the map, no directory scan)*
- An omitted role key falls back to the naming convention
- An unnamed SDD-default producer role is run inline by the Operator *(producer fallback — load governance, author warm at operator model, record `sdd:sdd-operator`)*
- A producer role assigned a named agent is spawned, not run inline *(model-tuning escape valve — any named agent, plugin or model-tuned, spawns at its own model)*
- An SDD-default judge role is spawned as a cold agent *(judge — `sdd:sdd-spec-judge` spawned cold, always)*
- A required role with no resolvable delegate hard-fails *(negative — fail-closed, records nothing)*
- An actor governance is resolved from the registry with an SDD default
- A domain claimed by two plugins is disambiguated without looping *(`needs-input` branch — relay writes `produced-by`, resume is decisive)*

## References

`sdd:plugin-contract-governance` (registry shape, role/governance keys); `combat-log-governance` / `sdd-provenance` (the fail-closed structural-error class). The init-plugin registry-**write** behavior relocated to the `sdd-plugin` / init spec (in-transit, next segment).

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-operator-resolution/spec.md` |
| Scenarios | `artifacts/specs/sdd-operator-resolution/sdd-operator-resolution.feature` |
| Implementation | `plugins/sdd/agents/sdd-operator.md` |
| Verification | `plugins/sdd/agents/sdd-operator.test.mts` |
