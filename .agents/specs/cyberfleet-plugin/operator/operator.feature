@frozen
Feature: operator — the command-center persona
  Unit suite for the Operator persona skill: the dispatcher automaton that activates outside any one
  ship (a folder whose project root has no `.cyberfleet/` marker), commissioning the fleet's first
  ship, listing who's out there, routing messages between ships, and sweeping away the dead ones.
  Every mechanic offloads to the cyberlegion CLI. Its in-ship counterpart is the Pod persona; the two
  mode-switch on the marker's presence via `cyberfleet mode`. The file store, ordering, spawn, and
  hook mechanics live in the sibling CLI project (messaging, identity, spawn, surfacing).

  # ── Mode-switch (ADR-0022) ──

  @behavior
  Scenario: Operator activates when there is no ship marker at this project root
    Given a working directory whose project root has no .cyberfleet/ directory
    When cyberfleet mode is checked
    Then it reports command-center and the Operator skill activates, not Pod

  @behavior
  Scenario: Operator defers to Pod when it is inside a ship
    Given a session running Operator in a directory whose project root has a .cyberfleet/ marker
    When it checks cyberfleet mode and reads ship
    Then Operator defers entirely to the Pod skill and does not run a mission or hail crew itself

  # ── Triggering ──

  @trigger
  Scenario Outline: Operator activates on out-of-ship fleet dispatch
    Given a user query "<query>"
    When cyberspace routes the request from outside any ship
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                          | should_trigger |
      | stand up the first ship so an agent can start on this project                   | yes            |
      | show me every agent session running across my fleet                             | yes            |
      | send a message from here to the agent working in the api worktree               | yes            |
      | clear out the dead ships that already exited                                    | yes            |
      | pick up the mission on this repo and start the work                             | no             |
      | hand this eval concern off to aced mid-mission                                  | no             |
      | just refactor this file in the current session                                  | no             |
      | run this in a subagent and summarize the result                                 | no             |

  Scenario: in-ship mission work is not Operator's job
    Given the Council wants a mission run or specialist crew hailed inside one specific ship
    When cyberspace routes the request
    Then Operator does not handle it and routes the Council to the Pod persona in that ship

  # ── Commission the first ship or a peer ──

  @behavior
  Scenario: Operator commissions a ship from outside with a self-contained brief
    Given the Council wants to stand up the fleet's first ship or a new peer session from outside any ship
    When Operator commissions it
    Then it runs cyberlegion session spawn with a brief that stands on its own, since the new Pod starts cold
      and reads it through its own SessionStart hook, and addresses it by handle

  @behavior
  Scenario: Operator does not fan out worktree-ships once inside a ship
    Given parallel work is wanted on a project that is already an initialized ship
    When the request is routed
    Then Operator leaves the worktree fan-out to Pod inside that ship rather than spawning it itself

  # ── List the fleet ──

  @behavior
  Scenario: Operator lists the fleet, optionally including exited ships
    Given the Council asks what sessions are out there
    When Operator reports the fleet
    Then it runs cyberlegion identity who, adding --all to include exited ships when the Council wants them

  # ── Route messages between ships ──

  @behavior
  Scenario: a cross-ship message is routed by handle
    Given a message must cross from one session to another
    When Operator routes it
    Then it uses cyberlegion mail send / inbox / read addressed by handle, never a raw id

  # ── Sweep dead ships ──

  @behavior
  Scenario: dead ships are swept on request
    Given the Council asks to clear out dead ships
    When Operator sweeps them
    Then it runs cyberlegion identity prune

  # ── Offload + harness-agnostic + MCP-free ──

  @behavior
  Scenario: every mechanic is a cyberlegion call and no ship's harness is assumed
    Given Operator is dispatching the fleet
    When it spawns, lists, sends, reads, or prunes
    Then it invokes the cyberlegion CLI, never re-implements the file store or types into a ship's
      pane, never reaches for an MCP messaging server, and makes no same-harness assumption

  @quality @rubric
  Scenario: Operator dispatches the fleet offloaded, status-forward, and in voice
    Given Operator is dispatching from outside any ship
    When it commissions a ship, lists the fleet, and routes a message
    Then the judge evaluates the dispatch against the rubric
      """
      dimensions:
        - name: mechanics_offloaded_to_cyberlegion_not_reimplemented
          max: 3
        - name: first_brief_is_self_contained_and_addressed_by_handle
          max: 2
        - name: defers_in_ship_mission_work_to_pod
          max: 2
        - name: harness_agnostic_and_mcp_free
          max: 2
      threshold: 7
      """
    And the rubric score is at least the threshold
</content>
