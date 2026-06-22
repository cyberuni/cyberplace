Feature: SDD Escape Hatch

  # Behavioral contract for the SDD scope boundary, independent of the
  # (still undecided) recognition mechanism. Each Given encodes the
  # classification outcome; how that outcome is reached is an open question
  # tracked in spec.md.

  Scenario: Representation work escapes the lifecycle
    Given work recognized as representation work on the spec corpus
    When the sdd gateway handles the request
    Then the work proceeds outside the SDD lifecycle
    And no draft spec is created for it

  Scenario: Escaped work skips both gates
    Given work recognized as representation work on the spec corpus
    When the work is carried out
    Then it passes through neither the spec gate nor the impl gate

  Scenario: Escape is recorded, not silent
    Given work recognized as representation work on the spec corpus
    When the sdd gateway escapes it
    Then the gateway states that the work is leaving the SDD lifecycle

  Scenario: A subject feature stays in SDD
    Given work recognized as a feature of the subject
    When the sdd gateway handles the request
    Then the work is routed into the SDD lifecycle

  Scenario: Ambiguous work defaults to SDD
    Given work that cannot be positively recognized as representation work
    When the sdd gateway handles the request
    Then the work is routed into the SDD lifecycle
