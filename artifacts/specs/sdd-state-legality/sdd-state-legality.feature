Feature: SDD spec state legality

  The single legality ruling for frontmatter state tuples, with the
  reconciled case (draft + aligned:true) made legal and every genuine
  illegal state retained. The enforcement script and the governance prose
  must agree on this ruling.

  # ── the reconciled case: draft + aligned:true is LEGAL ────────────────

  Scenario: a draft with a synced contract and no open markers is legal
    Given a spec with status "draft"
    And aligned is true
    And the open-marker count is zero
    And a feature file is present
    When the state is checked for legality
    Then the state is legal

  Scenario: a draft with a synced contract still carrying open markers is legal
    Given a spec with status "draft"
    And aligned is true
    And the open-marker count is greater than zero
    When the state is checked for legality
    Then the state is legal

  Scenario: a draft with an unsynced contract is legal
    Given a spec with status "draft"
    And aligned is false
    When the state is checked for legality
    Then the state is legal

  # ── aligned is layer-scoped, never status-coupled ─────────────────────

  Scenario: aligned true at draft means the contract layer is synced
    Given a spec with status "draft"
    And aligned is true
    When the meaning of aligned is resolved
    Then aligned true means the contract layer is in sync
    And aligned true does not by itself mean the spec is implemented

  Scenario: aligned true at approved means the implementation layer conforms
    Given a spec with status "implemented"
    And aligned is true
    When the meaning of aligned is resolved
    Then aligned true means the implementation layer conforms to the frozen feature

  # ── genuine illegal states are retained ───────────────────────────────

  Scenario: approved without a frozen feature is illegal
    Given a spec with status "approved"
    And no feature file is present
    When the state is checked for legality
    Then the state is illegal

  Scenario: approved with open markers is illegal
    Given a spec with status "approved"
    And the open-marker count is greater than zero
    And a feature file is present
    When the state is checked for legality
    Then the state is illegal

  Scenario: approved without a recorded spec-gate approver is illegal
    Given a spec with status "approved"
    And a feature file is present
    And the open-marker count is zero
    And the spec gate has no recorded approver
    When the state is checked for legality
    Then the state is illegal

  Scenario: implemented with aligned not true is illegal
    Given a spec with status "implemented"
    And aligned is not true
    When the state is checked for legality
    Then the state is illegal

  Scenario: implemented without a recorded impl-gate approver is illegal
    Given a spec with status "implemented"
    And aligned is true
    And the open-marker count is zero
    And a feature file is present
    And the spec gate has a recorded approver
    And the impl gate has no recorded approver
    When the state is checked for legality
    Then the state is illegal

  Scenario: an approved-by entry naming an unknown gate is illegal
    Given a spec whose approved-by names a gate other than spec or impl
    When the state is checked for legality
    Then the state is illegal

  Scenario: an agent self-assertion without a why block is illegal
    Given a spec with an approved-by gate attributed to the agent
    And that gate has no why block
    When the state is checked for legality
    Then the state is illegal

  # ── the script and the prose must agree ───────────────────────────────

  Scenario: the enforcement script accepts the reconciled draft state
    Given the enforcement script checks a spec with status "draft" and aligned true and zero markers
    When the script evaluates the state
    Then the script reports no violation for that state

  Scenario: the governance prose states the same legality as the script
    Given the governance legal-state list and the enforcement script
    When the draft-plus-aligned-true tuple is looked up in each
    Then both classify it as legal
