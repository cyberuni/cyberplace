---
status: implemented
type: feature
domain-type: subagent
blocked-by:
  - sdd-operator
  - sdd-plugin
aligned: true
approval:
  spec:
    verdict: approve
    by: agent
    why:
      reversibility: "safe — tracked spec.md + .feature, cheap revert, no external effect"
      blast-radius: "safe — contained to the two artifacts this spec owns; cross-spec impact (sdd-skill) lands at impl gate, not here"
      novelty: "safe — relay→Operator→station model already Council-ratified"
      confidence: "safe — all 9 scenarios pass, no open markers, legal Draft tuple"
  impl:
    verdict: approve
    by: agent
    why:
      reversibility: "safe — three tracked skill/agent markdown files; cheap git revert; no runtime or external effect"
      blast-radius: "safe — sdd gateway + Operator text only; no code/schema/registry change; cross-spec touch (sdd-skill) is doc-contract alignment, not runtime coupling; pnpm verify green"
      novelty: "safe — mechanical encoding of the already-ratified relay→Operator→station model; no new decision at impl"
      confidence: "safe — all 9 frozen scenarios read PASS on static inspection; no open markers; state check legal (exit 0); audit clean; 123 tests green"
---

# SDD Mission Loop — the Operator owns the middle loop

---

## What

The **middle loop** — one spec's journey from `draft` to `approved` to `implemented`, across many tasks — is owned by a single coordinator: the **Operator** (the role filled today by `sdd-operator`). The `sdd` gateway is a **thin relay**; `create-spec` and `validate-spec` are **stations the Operator runs**, never spawned as agent types. The Operator escalates to the human **Council** only at **gates** and **scrub** (kill).

```mermaid
flowchart LR
  council([Council · human]) <-->|answers / escalations| relay[sdd gateway · relay]
  relay -->|spawns once| op[Operator · operator]
  op -->|runs as stations| cs[create-spec]
  op -->|runs as stations| vs[validate-spec]
  op -->|dispatches| chain[producers · judges]
  op -->|"escalates only at gate / scrub"| relay
```

---

## Why

The `sdd` gateway skill is internally contradictory about delegation, and the contradiction produces real failures:

- Its *Delegate Downstream Work* section says "spawn a subagent… Do not load `create-spec`, `validate-spec`, or `render-spec-graph` into the current session," and maps each workflow action to a **"Subagent skill"** column naming those skills.
- But those are **skills, not agent types** — an agent that reads the table literally attempts `subagent_type: validate-spec`, which fails with *"Agent type not found."*
- Meanwhile `validate-spec` "owns the gate decision… on the human verdict writes `status` and `approved-by`," and `create-spec` "owns the user loop." Both need a user channel — i.e. in-session — contradicting "spawn a subagent / don't load in-session." The gateway itself states (downstream) that "user questions belong to this skill's intake or the downstream skill."

The result is that a router either fails outright, or bypasses the gate skill entirely and hand-writes the `status`/`approved-by` the gate was meant to own.

---

## Design decisions

### The Operator owns the mission loop

The coordinator (`sdd-operator`, the **Operator**) owns the per-spec middle loop. It drives the production chain across segments and is the single agent the gateway spawns. The downstream skills (`create-spec`, `validate-spec`, `render-spec-graph`) are **stations the Operator runs**, not separately-spawned user-facing skills.

### The gateway is a thin relay

The `sdd` gateway holds **no production logic**. It routes by status, hands the resolved work to the Operator, carries the Council's answers down and the Operator's escalations up. The user channel lives at the **relay ↔ Operator** boundary: the Operator (which has no user channel) returns `STATUS: needs-input`; the relay asks the Council and resumes the Operator with the answers.

### Never spawn the judge directly

The relay **must never** spawn a gate or judge skill as a `subagent_type`. The only thing it spawns is the Operator. The Operator runs the gate station and escalates to the Council **only at gates and scrub**.

### Write-ownership is preserved

This spec changes *who is invoked how*, not *who writes what*. The gate station still owns `status` and the human ratification of `approved-by`; the Operator still owns `aligned` and agent self-assertions. The fix is a delegation-mechanism correction, not an ownership change.

---

## Use Cases

A **use case** is an entry-point — a trigger, its inputs, and its outcome. Each maps to one-or-more boolean scenarios in the `.feature`.

| Use case | Trigger | Inputs | Outcome |
|---|---|---|---|
| **Delegate a routed action** | the gateway resolves a route to a downstream SDD action | the resolved workflow action | the gateway spawns the Operator (only) and runs `create-spec`/`validate-spec` as stations — never as a `subagent_type` |
| **Relay a user question** | the Operator returns `needs-input` mid-segment | the Operator's batched question | the gateway asks the Council and resumes the Operator with the answer |
| **Drive the mission loop** | a spec advancing `draft → implemented` across segments | the spec under work | the Operator drives every segment; the gateway holds no production logic |
| **Hold the escalation boundary** | the Operator is running with no gate or scrub reached | the in-flight segment | the Operator does not escalate to the Council |
| **Escalate at a gate** | the Operator reaches a gate needing a human verdict | the gate review | the Operator escalates to the Council through the relay, never directly |
| **Escalate at a scrub** | a scrub (kill) decision is reached | the kill decision | the Operator escalates to the Council through the relay |
| **Preserve write-ownership** | a gate advances on a human verdict | the transition to record | the gate station writes `status` + the `approval` ratification; the Operator writes `aligned` and agent self-assertions |

---

## Command surface / API

**Spawn vs invoke:**

| Thing | Mechanism |
|---|---|
| Operator (`sdd-operator`) | **spawned** as a subagent, once per segment |
| `create-spec` / `validate-spec` / `render-spec-graph` | **run as stations** by the Operator / relay — never `subagent_type` |
| User questions | returned by the Operator as `STATUS: needs-input`; asked by the **relay** |
| Escalation to Council | only at **gates** (go/no-go) and **scrub** (kill) |

---

## Related

- `artifacts/specs/sdd-orchestrator/spec.md` — the Operator (operator) and the production-chain model this clarifies
- `artifacts/specs/sdd/sdd-skill/spec.md` — the gateway skill whose delegation section this corrects (Revised at impl)
- `artifacts/specs/sdd-inject-channel/spec.md` — the live channel into a single inner-loop agent, a sibling capability
- `artifacts/specs/motive-model/spec.md` — the three-loop model; this spec owns the **middle** loop

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-mission-loop/spec.md` |
| Scenarios | `artifacts/specs/sdd-mission-loop/sdd-mission-loop.feature` |
