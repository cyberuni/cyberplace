# Tasks — SDD Mission Loop

Dependency DAG. Each task maps to frozen `.feature` scenarios.

- [x] T1 — Rewrite the gateway "Delegate Downstream Work" section so the only agent
      spawned is the Operator (`sdd-operator`); remove every naming of
      create-spec / validate-spec / render-spec-graph as a `subagent_type` /
      "Subagent skill". (scenarios: never-spawn-gate-as-agent-type,
      Operator-is-only-agent-spawned)
      deps: none

- [x] T2 — Reframe create-spec / validate-spec / render-spec-graph as **stations**
      the Operator runs in-session (a station mapping, not an agent-type column).
      (scenario: Operator-is-only-agent-spawned)
      deps: T1

- [x] T3 — Encode the relay + user channel: the gateway carries the Operator's
      `STATUS: needs-input` to the Council and resumes the Operator with the answer;
      the gateway holds no production logic and the Operator drives every segment.
      (scenarios: relay-carries-user-question, Operator-owns-mission-loop)
      deps: T1

- [x] T4 — Encode the escalation boundary: escalation to the Council happens only at
      gates and scrub; outside a gate/scrub the Operator does not escalate; the
      Operator never asks the Council directly — the relay carries it.
      (scenarios: no-escalate-away-from-gate, escalate-at-gate, escalate-at-scrub,
      Operator-never-asks-Council-directly)
      deps: T1

- [x] T5 — Affirm write-ownership in the gateway/Operator text: the gate station
      still writes status + approved-by ratification; the Operator writes aligned +
      agent self-assertion. (scenario: gate-station-owns-status-write)
      deps: T1

- [x] T6 — Reinforce the Operator agent (`sdd-operator.md`) for station-running
      and the gate/scrub-only escalation boundary if not already explicit.
      deps: T1–T5

- [x] T7 — Run `pnpm verify` (audit) over edited skills; run validate-spec at the
      impl gate.
      deps: T1–T6
