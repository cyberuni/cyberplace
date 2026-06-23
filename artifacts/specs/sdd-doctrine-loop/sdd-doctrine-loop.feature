Feature: SDD doctrine loop — the Strategist outer loop

  # ── the trigger is lifecycle-grained ──────────────────────────────────

  Scenario: the Scanner fires when a spec ships
    Given a spec transitions to implemented
    When the Scanner observes the terminal transition
    Then it drafts doctrine candidates from the finished mission

  Scenario: the Scanner fires when a spec is killed
    Given a spec transitions to deprecated
    When the Scanner observes the terminal transition
    Then it drafts doctrine candidates from why it failed

  Scenario: the Scanner does not fire per gate
    Given a spec passes a single gate without reaching a terminal state
    When the gate completes
    Then the Scanner does not draft doctrine candidates

  Scenario: a recurring pattern triggers the Scanner
    Given the same correction has recurred across missions
    When the Scanner detects the recurrence
    Then it drafts a doctrine candidate to codify it

  # ── detect-and-draft vs keep-or-cut ───────────────────────────────────

  Scenario: the delegate drafts without blocking the mission
    Given the Scanner is drafting doctrine candidates
    When a mission is in progress
    Then the drafting does not block the mission flow

  Scenario: a candidate is recorded to the combat log
    Given the Scanner drafts a doctrine candidate
    When it records the candidate
    Then the candidate is written to the combat log

  Scenario: the human holds keep-or-cut
    Given a drafted doctrine candidate
    When the Council reviews it
    Then the Council decides keep or cut

  Scenario: no candidate enters doctrine without ratification
    Given a doctrine candidate that the Council has not ratified
    When doctrine is read
    Then the candidate is absent from doctrine

  # ── surfacing and pruning ─────────────────────────────────────────────

  Scenario: candidates accumulate and surface episodically
    Given drafted doctrine candidates are pending
    When the Council enters through the gateway
    Then the gateway surfaces the count of pending candidates

  Scenario: the Scanner prunes a stale convention
    Given a convention in doctrine that is now false
    When the Scanner detects the staleness
    Then it drafts a prune of that convention
