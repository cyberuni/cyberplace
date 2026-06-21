Feature: Gate autonomy and accountability

  Scenario: default leash is gated
    Given the Conductor declares no autonomy level
    When the orchestrator finishes one autonomous segment at the spec gate
    Then it stops and returns needs-input for the human verdict

  Scenario: auto-to-spec stops before implementing
    Given the autonomy level is "auto-to-spec"
    When the spec gate is reached and the spec passes the spec-judge
    Then the orchestrator self-asserts the spec gate
    And it does not begin implementation

  Scenario: auto runs through the impl gate
    Given the autonomy level is "auto"
    And the change is low blast radius
    When implementation passes the impl-judge
    Then the orchestrator self-asserts the impl gate

  Scenario: the leash is a ceiling and downgrades on high blast radius
    Given the autonomy level is "auto"
    And the change modifies a frozen contract or an installed public surface
    When the gate is reached
    Then the orchestrator stops for the human verdict regardless of the leash

  Scenario: an agent-asserted gate is provisional
    Given the orchestrator self-asserts the spec gate
    When the spec is written
    Then approved-by.spec is "agent"
    And the spec appears in the human review queue

  Scenario: human ratification reassigns the approver
    Given approved-by.spec is "agent"
    When the human ratifies the spec gate
    Then approved-by.spec is the human's name
    And the spec leaves the review queue

  Scenario: an illegal state tuple is rejected
    Given a spec with status "draft" and an implementation committed against an unfrozen .feature
    When validate-spec runs
    Then it reports the state tuple is illegal
    And the spec cannot be committed

  Scenario: aligned is read gate-relative at draft
    Given a spec with status "draft" whose spec.md and .feature are in sync
    When validate-spec runs
    Then aligned true means ready for the spec gate
    And it does not mean implemented

  Scenario: the gate report lists faces and contestable defaults
    Given the orchestrator reaches a gate
    When it emits the gate report
    Then the report carries a verdict for Framer, Builder, and Architect
    And it lists the contestable defaults the agent chose
    And a self-asserted report is flagged for ratification

  Scenario: the review queue is derived, not stored
    Given several specs have approved-by values of "agent"
    When the human asks what awaits review
    Then the queue is the set of specs with an agent approver
    And there is no separate backlog file
