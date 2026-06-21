Feature: Gate autonomy and accountability

  Scenario: a novel contract decision derives gated
    Given the spec encodes a contestable decision the human has not seen
    When the agent assesses the spec gate
    Then the derived leash is "gated"
    And it stops at the spec gate for the human verdict

  Scenario: settled contract but risky implementation derives auto-to-spec
    Given the contract decisions are already ratified by the human
    And the implementation is irreversible or high blast radius
    When the agent assesses both gates
    Then the derived leash is "auto-to-spec"
    And it self-asserts the spec gate but stops before implementing

  Scenario: reversible low-blast work derives auto
    Given the contract decisions are ratified or trivial
    And the implementation is reversible and local to this spec
    And the verdict is a clear pass
    When the agent assesses both gates
    Then the derived leash is "auto"
    And both gates are self-asserted

  Scenario: the human ceiling caps the derived leash
    Given the derived leash is "auto"
    And the Conductor capped the run at the spec gate
    When the effective leash is computed
    Then it is the minimum of the ceiling and the derivation
    And the agent stops at the spec gate

  Scenario: the gate report records the leash derivation
    Given the agent reaches a gate
    When it emits the gate report
    Then the report contains a leash-derivation block
    And the block shows the four-dimension assessment per gate
    And it shows the derived and effective leash with a reason per dimension

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

  Scenario: validate-spec enforces layer-scoped aligned at draft
    Given a spec with status "draft" whose spec.md and .feature are in sync
    When validate-spec runs
    Then aligned true is accepted as contract-layer sync, ready for the spec gate
    And it is not treated as implemented

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
