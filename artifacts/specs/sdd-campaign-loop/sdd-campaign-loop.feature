Feature: SDD campaign loop — growing and pruning the product

  # The Commander reasons at PORTFOLIO altitude: a shipped feature suggests a
  # successor, and a successor can make a predecessor redundant. Its outputs
  # are PROPOSALS (new spec drafts, deprecation proposals) the Council ratifies.

  # ── portfolio altitude, not the per-spec gate ─────────────────────────

  Scenario: the Commander fires at portfolio altitude
    Given multiple specs and their combat logs are persisted
    When the Commander runs
    Then it reasons across the whole portfolio

  Scenario: the Commander does not fire per gate
    Given a spec passes a single gate
    When the gate completes
    Then the Commander does not draft a proposal

  Scenario: the Commander does not decide whether this spec ships
    Given a spec is at its gate
    When the Commander runs
    Then it does not produce the kill-or-ship decision for that spec

  # ── input: combat logs read post-hoc ──────────────────────────────────

  Scenario: the Commander reads the combat logs as input
    Given completed missions whose combat logs are persisted
    When the Commander reasons about the product
    Then it reads the persisted combat logs

  Scenario: the Commander reads the portfolio of specs
    Given a portfolio of specs
    When the Commander runs
    Then it reads the portfolio of specs

  Scenario: the Commander does not read live subagent context
    Given a mission has ended
    When the Commander reasons about the product
    Then it reads only persisted artifacts

  # ── shipped feature suggests a successor → draft a new spec ────────────

  Scenario: a shipped feature suggests a successor spec
    Given a spec transitions to implemented
    When the Commander reasons about the next feature
    Then it drafts a new feature spec proposal

  Scenario: a new spec draft is surfaced for ratification
    Given the Commander drafts a new feature spec proposal
    When the proposal is produced
    Then the draft is surfaced to the Council

  Scenario: a new spec draft is not auto-applied
    Given the Commander drafts a new feature spec proposal
    When the Council has not ratified it
    Then no new spec enters the Build loop

  Scenario: a ratified draft enters the Build loop
    Given a new feature spec draft the Council ratifies
    When the draft is ratified
    Then a new spec enters the Build loop

  # ── a feature subsumes another → propose deprecation ──────────────────

  Scenario: a subsuming feature makes another redundant
    Given a shipped feature that subsumes an existing feature
    When the Commander reasons about the redundant feature
    Then it proposes deprecating the redundant feature

  Scenario: a feature no longer earning its keep is proposed for scrub
    Given a feature whose value no longer justifies its maintenance
    When the Commander reasons about that feature
    Then it proposes deprecating that feature

  Scenario: a deprecation proposal is surfaced to the Council
    Given the Commander proposes a deprecation
    When the proposal is produced
    Then the deprecation proposal is surfaced to the Council

  Scenario: the Commander triggers but does not write the deprecation
    Given the Commander proposes deprecating a feature
    When the proposal is produced
    Then the Commander does not write the deprecated status

  Scenario: a ratified scrub triggers the deprecated transition
    Given a deprecation proposal the Council ratifies
    When the scrub is ratified
    Then the deprecated transition is triggered

  # ── portfolio review → reprioritize ───────────────────────────────────

  Scenario: a portfolio review triggers the Commander
    Given a portfolio review event is held
    When the Commander runs against the whole portfolio
    Then it produces a reprioritization

  # ── distinct from the other two outer loops ───────────────────────────

  Scenario: the Campaign loop grows the product not the process
    Given the Commander reasons across the portfolio
    When it produces a proposal
    Then the proposal changes what the product has
    And the proposal does not change the process

  Scenario: the Campaign loop decides what to build not how the corpus is organized
    Given the Commander reasons across the portfolio
    When it produces a proposal
    Then the proposal decides what the product should be
    And the proposal does not reorganize the spec corpus
