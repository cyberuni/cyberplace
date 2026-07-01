Feature: SDD mission loop — the Operator owns the middle loop

  # ── delegation mechanism ──────────────────────────────────────────────

  Scenario: the gateway never spawns a gate skill as an agent type
    Given the gateway resolves a route to a gate review
    When it delegates the downstream work
    Then it does not spawn validate-spec as a subagent type
    And it spawns the Operator instead

  Scenario: the Operator is the only agent the gateway spawns
    Given a resolved workflow action
    When the gateway delegates
    Then the single agent spawned is the Operator
    And create-spec and validate-spec are run as stations, not spawned as agent types

  # ── the relay and the user channel ────────────────────────────────────

  Scenario: the relay carries a user question raised by the Operator
    Given the Operator returns needs-input during a segment
    When the gateway relays it
    Then the gateway asks the Council the question
    And it resumes the Operator with the answer

  Scenario: the Operator owns the mission loop across segments
    Given a spec advancing from draft toward implemented
    When the work spans multiple segments
    Then the Operator drives every segment of the mission loop
    And the gateway holds no production logic

  # ── escalation boundary ───────────────────────────────────────────────

  Scenario: the Operator does not escalate away from a gate or scrub
    Given the Operator is running the mission loop
    When no gate and no scrub is reached
    Then it does not escalate to the Council

  Scenario: the Operator escalates at a gate
    Given the Operator reaches a gate in the mission loop
    When a human verdict is required to advance
    Then it escalates to the Council through the relay

  Scenario: the Operator escalates at a scrub decision
    Given the Operator is running the mission loop
    When a scrub (kill) decision is reached
    Then it escalates to the Council

  Scenario: the Operator never asks the Council directly
    Given the Operator must escalate at a gate or scrub
    When it raises the escalation
    Then it does not ask the Council directly
    And the escalation is carried to the Council by the relay

  # ── write-ownership preserved ─────────────────────────────────────────

  Scenario: the gate station still owns the status write
    Given a gate advance on a human verdict
    When the transition is recorded
    Then the gate station writes status and the approved-by ratification
    And the Operator writes aligned and any agent self-assertion
