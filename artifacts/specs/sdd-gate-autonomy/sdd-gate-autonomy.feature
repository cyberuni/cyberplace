Feature: Gate autonomy and accountability

  # ── leash derivation ──────────────────────────────────────────────────

  Scenario: a novel contract decision derives auto-none
    Given the spec encodes a contestable decision the human has not seen
    When the agent assesses the spec gate
    Then the derived leash is "auto-none"
    And it stops at the spec gate for the human verdict

  Scenario: settled contract but risky implementation derives auto-spec
    Given the contract decisions are already ratified by the human
    And the implementation is irreversible or high blast radius
    When the agent assesses both gates
    Then the derived leash is "auto-spec"
    And it self-asserts the spec gate but stops before implementing

  Scenario: reversible low-blast work derives auto-all
    Given the contract decisions are ratified or trivial
    And the implementation is reversible and local to this spec
    And the verdict is a clear pass
    When the agent assesses both gates
    Then the derived leash is "auto-all"
    And both gates are self-asserted

  Scenario: an auto-none spec gate does not bind the impl gate
    Given the spec gate was derived auto-none and ratified by the human in an earlier run
    And the implementation is reversible, local, and its tests pass
    When the agent reaches the impl gate in a later run
    Then the impl gate independently derives "auto-all"
    And the agent self-asserts the impl gate as provisional

  Scenario: the human ceiling caps the derived leash
    Given the derived leash is "auto-all"
    And the Conductor capped the run at the spec gate
    When the effective leash is computed
    Then it is the minimum of the ceiling and the derivation
    And the agent stops at the spec gate

  # ── gate report ───────────────────────────────────────────────────────

  Scenario: the gate report records the leash derivation
    Given the agent reaches a gate
    When it emits the gate report
    Then the report contains a leash-derivation block
    And the block shows the four-dimension assessment per gate
    And it shows the derived and effective leash with a reason per dimension

  Scenario: the gate report is decidable
    Given the agent reaches a gate with one blocking open marker
    When it emits the gate report
    Then each blocking marker appears as a question with a proposed answer
    And a decision menu lists approve, change, and reject with their consequences

  Scenario: the gate report is regenerated, not stored
    Given a spec with approved-by.spec of "agent" awaiting review
    When the human opens the review
    Then the gate report is regenerated from current artifact state
    And no stored gate-report file exists

  # ── approved-by attribution ───────────────────────────────────────────

  Scenario: a self-assertion records its derivation in frontmatter
    Given the agent self-asserts a gate
    When the operator records it
    Then approved-by for that gate has by "agent"
    And approved-by for that gate has a why block with the four-dimension derivation

  Scenario: a human ratification carries no derivation
    Given the human ratifies a gate
    When the skill records it
    Then approved-by for that gate has by the human's name
    And no why block is required

  Scenario: the operator writes self-assertions and the skill writes ratifications
    Given a gate is self-asserted then later ratified
    When each record is written
    Then the operator wrote the agent self-assertion and its why
    And the skill wrote the human ratification

  # ── gate actions ──────────────────────────────────────────────────────

  Scenario: change at the spec gate edits the contract
    Given the spec gate report is returned with "change"
    When the agent acts on it
    Then it revises spec.md or the .feature
    And the status stays draft

  Scenario: change at the impl gate edits the code, not the contract
    Given the impl gate report is returned with "change"
    When the agent acts on it
    Then it fixes the implementation against the frozen .feature
    And the .feature is not modified

  Scenario: reject at the impl gate can trigger a Director-revert
    Given building reveals a frozen scenario is fatal
    When the impl gate is rejected as a Director-revert
    Then the .feature is unfrozen
    And the status returns to draft

  Scenario: an agent-asserted gate is provisional
    Given the operator self-asserts the spec gate
    When the spec is written
    Then approved-by.spec is "agent"
    And the spec appears in the human review queue

  Scenario: a self-assertion advances the run without a synchronous human stop
    Given the agent self-asserts a gate within the effective leash
    When the gate is recorded
    Then the run advances to the next phase immediately
    And it does not stop to wait for a synchronous human ratification
    And the spec is enqueued for asynchronous ratify-or-kick-back review

  Scenario: human ratification reassigns the approver
    Given approved-by.spec is "agent"
    When the human ratifies the spec gate
    Then approved-by.spec is the human's name
    And the spec leaves the review queue

  # ── state integrity ───────────────────────────────────────────────────

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
    Given the operator reaches a gate
    When it emits the gate report
    Then the report carries a verdict for Director, Builder, and Architect
    And it lists the contestable defaults the agent chose
    And a self-asserted report is flagged for ratification

  Scenario: the review queue is derived, not stored
    Given several specs have approved-by values of "agent"
    When the human asks what awaits review
    Then the queue is the set of specs with an agent approver
    And there is no separate backlog file
