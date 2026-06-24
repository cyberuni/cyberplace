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

  Scenario: the Scanner reacts to a terminal transition without writing it
    Given a spec transitions to implemented
    When the Scanner observes the terminal transition
    Then the Scanner does not write the spec status

  Scenario: a milestone retro triggers the Scanner
    Given a milestone retro is held
    When the Scanner is run against the completed milestone
    Then it drafts strategy from the milestone

  Scenario: a recurring pattern triggers the Scanner
    Given the same correction has recurred across missions
    When the Scanner detects the recurrence
    Then it drafts strategy to codify it

  Scenario: recurring-pattern detection reads corrections across many specs
    Given corrections-with-cause recorded in multiple specs' combat logs
    When the Scanner scans for a recurring pattern
    Then it reads the corrections across those combat logs

  # ── efficiency / token-waste dimension ───────────────────────────────

  Scenario: a mission over the token-cost threshold triggers efficiency analysis
    Given a mission whose token cost exceeds the configured bound
    When the Scanner runs against that mission
    Then it analyzes the mission's transcripts
    And it drafts efficiency strategy

  Scenario: the Scanner does not run efficiency analysis under the threshold
    Given a mission whose token cost is under the configured bound
    And no on-demand efficiency request
    When the Scanner runs against that mission
    Then it does not run the heavy efficiency analysis

  Scenario: efficiency analysis reads the transcripts not the combat log
    Given a mission whose token cost exceeds the configured bound
    When the Scanner drafts efficiency strategy
    Then it reads the raw session transcripts
    And it does not read the combat log for the token-usage breakdown

  Scenario: efficiency strategy is recorded as an unratified strategy entry
    Given the Scanner drafts efficiency strategy
    When it records that strategy
    Then the strategy is recorded as a strategy entry
    And the strategy entry is unratified

  # ── the Scanner's input is the combat log, read post-hoc ──────────────

  Scenario: the Scanner reads the combat log as its primary input
    Given a spec has reached a terminal state and its combat log is persisted
    When the Scanner drafts strategy from that spec
    Then it reads the persisted combat log

  Scenario: the Scanner does not read live subagent context
    Given a spec's mission has ended
    When the Scanner drafts strategy from that spec
    Then it reads only persisted artifacts

  Scenario: strategy is draftable from the combat log without transcripts
    Given a combat log with no raw session transcripts available
    When the Scanner drafts strategy from that spec
    Then it drafts strategy from the combat log alone

  # ── detect-and-draft vs keep-or-cut ───────────────────────────────────

  Scenario: the delegate drafts without blocking the mission
    Given the Scanner is drafting strategy
    When a mission is in progress
    Then the drafting does not block the mission flow

  Scenario: a strategy is recorded to the combat log
    Given the Scanner drafts a strategy
    When it records the strategy
    Then the strategy is written to the combat log

  Scenario: the Scanner is the sole writer of strategy entries
    Given the Scanner drafts a strategy
    When the strategy entry is appended to the combat log
    Then the Scanner writes the strategy entry

  Scenario: the orchestrator and producers do not write strategy entries
    Given a strategy entry in the combat log
    When the writer of that entry is identified
    Then the orchestrator did not write the strategy entry
    And a producer did not write the strategy entry

  Scenario: the strategy entry carries its driving evidence
    Given the Scanner drafts a strategy from corrections-with-cause
    When it records the strategy
    Then the recorded entry includes the corrections that drove it

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

  Scenario: a ratified prune removes the stale convention from the corpus
    Given a prune strategy the Council ratifies
    When it is applied
    Then the stale convention is absent from the corpus
