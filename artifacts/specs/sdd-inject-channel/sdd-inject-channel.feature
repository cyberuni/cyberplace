Feature: SDD inject channel — zoom into a single inner-loop agent

  # ── project vs inject ─────────────────────────────────────────────────

  Scenario: project tunes a program and persists
    Given the Council projects into an agent
    When it imprints a new program and withdraws
    Then the agent's program is changed
    And the change persists on the next run

  Scenario: inject opens a live channel to one agent
    Given the Council injects into a named inner-loop agent
    When the channel is open
    Then the Council communicates with that agent directly
    And the channel closes when the Council withdraws

  Scenario: project and inject are distinct moves
    Given a project and an inject of the same agent
    When the two are compared
    Then project is asynchronous and persistent
    And inject is live and transient

  # ── dual-mode mechanism ───────────────────────────────────────────────

  Scenario: an inner-loop agent is both dispatchable and injectable
    Given an inner-loop producer or judge
    When the Operator runs the loop
    Then the agent can be dispatched autonomously
    And the same agent can be injected directly by the Council

  Scenario: the gateway is the entry to the channel
    Given the Council wants to inject into an agent
    When it opens the channel
    Then it enters through the gateway
    And it selects one named inner-loop agent

  # ── contracts hold under inject ───────────────────────────────────────

  Scenario: an injected judge cannot write what it does not own
    Given a judge injected live during an approved spec
    When the Council pilots it toward editing the frozen feature
    Then the judge does not write the frozen feature

  Scenario: an injected producer still answers to its program
    Given a producer injected live
    When it acts through the channel
    Then its program still governs its behavior
