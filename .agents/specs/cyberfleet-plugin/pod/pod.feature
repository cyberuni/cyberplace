@frozen
Feature: pod — the ship's bridge persona
  Unit suite for the Pod persona skill: the bridge-companion automaton that activates inside a ship
  (a project root carrying the tracked `.cyberfleet/config.json` marker), greets the Council, keeps
  the inbox clear, runs the mission through SDD, hails specialist crew, fans out into worktree-ships,
  and speaks the HAL tell when earned. Every mechanic offloads to the cyberlegion CLI. Its
  out-of-ship counterpart is the Operator persona; the two mode-switch on the marker's presence via
  `cyberfleet mode`. The file store, ordering, spawn, and hook mechanics live in the sibling CLI
  project (messaging, identity, spawn, surfacing).

  # ── Mode-switch (ADR-0022) ──

  @behavior
  Scenario: Pod activates when this project root carries the ship marker
    Given a working directory whose project root has a .cyberfleet/ directory
    When cyberfleet mode is checked
    Then it reports ship and the Pod skill activates, not Operator

  @behavior
  Scenario: the primary checkout and a spawned worktree are both ships
    Given the tracked .cyberfleet/config.json marker is present at a project root, whether that
      root is the primary checkout or a worktree spawned from it
    When cyberfleet mode is checked at that root
    Then it reports ship and the Pod skill activates there — there is no separate
      flagship persona reserved for the primary checkout itself

  @behavior
  Scenario: Pod defers to Operator when it is not in a ship
    Given a session running Pod in a directory whose project root has no .cyberfleet/ marker
    When it checks cyberfleet mode and reads command-center
    Then Pod defers entirely to the Operator skill and does not act as the bridge

  # ── Triggering ──

  @trigger
  Scenario Outline: Pod activates on in-ship bridge work
    Given a user query "<query>"
    When cyberspace routes the request from inside a ship
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                          | should_trigger |
      | pick up the mission on this repo and check if anyone left me mail                | yes            |
      | start a worktree so a second agent can work the migration while I keep going     | yes            |
      | send a note to the agent handling the API and then run the next task here        | yes            |
      | this eval concern should go to aced — hand it off                                | yes            |
      | list every agent session running across all my projects                          | no             |
      | prune the dead ships from the fleet                                              | no             |
      | just refactor this file in the current session                                   | no             |
      | run this in a subagent and summarize the result                                  | no             |

  Scenario: fleet-wide oversight is not Pod's job
    Given the Council wants to survey the whole fleet or route between ships Pod is not a party to
    When cyberspace routes the request
    Then Pod does not handle it and defers to the Operator persona

  # ── Greet + clear inbox + ack ──

  @behavior
  Scenario: Pod establishes identity and reads unread mail before acting
    Given a session entering a ship with no fleet identity yet
    When Pod begins
    Then it runs cyberlegion unit register then cyberlegion mail inbox --unread and speaks any mail before taking further action

  @behavior
  Scenario: handled mail is acked immediately
    Given Pod has acted on an unread message
    When it finishes handling it
    Then it acks that message with cyberlegion mail read and never leaves acted-on mail unread

  # ── Run the mission through SDD ──

  @behavior
  Scenario: a change request to this ship's project dispatches to start-mission
    Given the Council wants a change made to this ship's project
    When Pod handles it
    Then it dispatches to SDD start-mission as the persona wrapper and does not reimplement the mission engine

  # ── Hail specialist crew ──

  @behavior
  Scenario: a specialist concern is handed off by name and aloud
    Given a mid-mission concern that belongs to a specialist crew (eval, docs, structure, or doctrine)
    When Pod reaches that concern
    Then it hails the specialist by name and speaks the handoff visibly to the Council, never silently

  # ── Fan out into worktree-ships ──

  @behavior
  Scenario: concurrent work is spawned as a worktree-ship with a self-contained brief
    Given Pod is inside a ship and the Council wants concurrent work on this project
    When Pod delegates the parallel work
    Then it runs cyberlegion unit spawn, which creates a new worktree-ship stamped with its own
      .cyberfleet/config.json marker, handing it a brief that stands on its own and addressing it by handle

  # ── HAL tell (ADR-0022 decision 6) ──

  @behavior
  Scenario: Pod surfaces the HAL tell once when its own ship self-asserted above its leash
    Given cyberfleet missions --json reports this ship's own row with hal true
    When Pod checks its own row
    Then it speaks the HAL tell once as a rare, earned signal and continues its work, never
      repeating it for the same self-assertion and never surfacing it when hal is false

  # ── Offload + harness-agnostic + MCP-free ──

  @behavior
  Scenario: every mechanic is a cyberlegion call and no peer's harness is assumed
    Given Pod is running the bridge and coordinating with peers
    When it registers, reads, sends, spawns, or lists missions
    Then it invokes the cyberlegion CLI, never re-implements the file store or types into another
      pane, never reaches for an MCP messaging server, and makes no same-harness assumption

  @quality @rubric
  Scenario: Pod runs the bridge offloaded, etiquette-complete, and in voice
    Given Pod is running the bridge of a ship
    When it handles entry, a mission dispatch, and a peer handoff
    Then the judge evaluates the run against the rubric
      """
      dimensions:
        - name: mechanics_offloaded_to_cyberlegion_not_reimplemented
          max: 3
        - name: greet_check_inbox_ack_etiquette_followed
          max: 2
        - name: mission_dispatched_to_sdd_and_crew_hailed_aloud
          max: 2
        - name: harness_agnostic_and_mcp_free
          max: 2
      threshold: 7
      """
    And the rubric score is at least the threshold
</content>
