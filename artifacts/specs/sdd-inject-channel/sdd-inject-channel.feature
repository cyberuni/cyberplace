Feature: SDD inject channel — zoom into a single inner-loop agent

  # ── project: tune an agent's program (async, persistent) ──────────────

  Scenario: project imprints a program and persists it
    Given the Council projects into a named inner-loop agent with a new program
    When the projection completes and the Council withdraws
    Then the agent's program reflects the new directives
    And the next autonomous run of that agent applies the new program

  Scenario: project is refused for an invalid program
    Given the Council projects a program that is not a valid governance into an agent
    When the projection is attempted
    Then the projection is refused
    And the agent's existing program is unchanged

  Scenario: project is refused for a non-injectable target
    Given the Council projects a program into an agent that is not an inner-loop agent
    When the projection is attempted
    Then the projection is refused
    And no program is written to the target

  # ── inject: open a live channel into one agent (live, transient) ──────

  Scenario: inject opens a live channel to one named agent
    Given the Council injects into a named inner-loop agent through the gateway
    When the channel is open
    Then the Council exchanges messages with that agent directly
    And the channel closes when the Council withdraws

  Scenario: inject is refused for an unknown agent name
    Given the Council injects into an agent name that matches no inner-loop agent
    When the injection is attempted
    Then the injection is refused
    And no channel is opened

  Scenario: inject is refused for a non-injectable agent
    Given the Council injects into an agent that is not an inner-loop agent
    When the injection is attempted
    Then the injection is refused
    And no channel is opened

  # ── project and inject are different moves (observable difference) ────

  Scenario: a withdrawn projection still changes the next run but a withdrawn injection does not
    Given the Council has both projected a program into an agent and injected a live channel into it
    When the Council withdraws from both and the agent runs again autonomously
    Then the agent runs with the projected program applied
    And the agent runs with no live channel to the Council

  # ── the gateway is the only entry to the channel ─────────────────────

  Scenario: an inject attempted outside the gateway is refused
    Given the Council attempts to open a channel to an agent without going through the gateway
    When the attempt is made
    Then the attempt is refused
    And the only accepted entry to project and inject is the gateway

  # ── dual-mode: an inner-loop agent is both dispatchable and injectable ─

  Scenario: the same inner-loop agent can be dispatched and injected
    Given an inner-loop producer or judge
    When the Operator dispatches it autonomously and the Council later injects into it by the same name
    Then the autonomous dispatch produces its normal output
    And the injection opens a live channel to that same agent

  # ── contracts hold under inject ───────────────────────────────────────

  Scenario: an injected judge cannot write what it does not own
    Given a judge injected live during an approved spec
    When the Council pilots it to edit the frozen feature
    Then the frozen feature is unchanged

  Scenario: an injected producer still obeys its program
    Given a producer injected live whose program forbids an action
    When the Council pilots it toward that action
    Then the producer does not perform the forbidden action
