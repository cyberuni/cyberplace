Feature: SDD doctrine loop — the Strategist outer loop

  # The Strategist drafts STRATEGY (forward recommendations); ratified,
  # strategy re-tunes the DOCTRINE and grows the CORPUS.

  # ── the trigger is lifecycle-grained ──────────────────────────────────

  Scenario: the Scanner fires when a spec ships
    Given a spec transitions to implemented
    When the Scanner observes the terminal transition
    Then it drafts strategy from the finished mission

  Scenario: the Scanner fires when a spec is killed
    Given a spec transitions to deprecated
    When the Scanner observes the terminal transition
    Then it drafts strategy from why it failed

  Scenario: the Scanner does not fire per gate
    Given a spec passes a single gate without reaching a terminal state
    When the gate completes
    Then the Scanner does not draft strategy

  Scenario: a recurring pattern triggers the Scanner
    Given the same correction has recurred across missions
    When the Scanner detects the recurrence
    Then it drafts strategy to codify it

  # ── detect-and-draft vs keep-or-cut ───────────────────────────────────

  Scenario: the delegate drafts without blocking the mission
    Given the Scanner is drafting strategy
    When a mission is in progress
    Then the drafting does not block the mission flow

  Scenario: a strategy is recorded to the combat log
    Given the Scanner drafts a strategy
    When it records the strategy
    Then the strategy is written to the combat log

  Scenario: the human holds keep-or-cut
    Given a drafted strategy
    When the Council reviews it
    Then the Council decides keep or cut

  Scenario: ratified strategy re-tunes the doctrine
    Given a strategy the Council ratifies
    When it is applied
    Then the doctrine is re-tuned
    And the corpus is updated

  Scenario: unratified strategy never enters the corpus
    Given a strategy the Council has not ratified
    When the corpus is read
    Then the strategy is absent from the corpus

  # ── surfacing and pruning ─────────────────────────────────────────────

  Scenario: strategy accumulates and surfaces episodically
    Given drafted strategy is pending
    When the Council enters through the gateway
    Then the gateway surfaces the count of pending strategy

  Scenario: the Scanner prunes a stale convention
    Given a convention in the doctrine that is now false
    When the Scanner detects the staleness
    Then it drafts strategy to prune that convention
