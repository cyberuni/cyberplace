Feature: Spec digest for gate review

  # ── content ────────────────────────────────────────────────────────────

  Scenario: Digest reports the fixed sections
    Given a spec folder with spec.md and a .feature
    When the agent runs spec-digest on the folder
    Then the digest includes the What summary from spec.md
    And the digest includes the current lifecycle status
    And the digest includes the scenario count and each scenario name from the .feature
    And the digest includes each design-decision heading from spec.md
    And the digest lists every open marker found in spec.md or the .feature

  Scenario: Digest reports zero scenarios when no .feature exists
    Given a spec folder with spec.md and no .feature
    When the agent runs spec-digest on the folder
    Then the digest reports zero scenarios
    And the digest does not report an error for the missing .feature

  Scenario: Digest lists open markers when present
    Given a spec folder whose spec.md contains an open marker
    When the agent runs spec-digest on the folder
    Then the digest lists the open marker text under open items

  # ── boundaries ─────────────────────────────────────────────────────────

  Scenario: Digest mutates no files
    Given a spec folder with spec.md and a .feature
    When the agent runs spec-digest on the folder
    Then spec.md is unchanged
    And the .feature is unchanged
    And no lifecycle status is written

  Scenario: Digest renders no gate verdict
    Given a spec folder with spec.md and a .feature
    When the agent runs spec-digest on the folder
    Then the digest contains no approval decision
    And the digest contains no advance-or-block verdict
