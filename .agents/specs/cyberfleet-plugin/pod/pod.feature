@frozen
Feature: pod — the ship's bridge persona
  Unit suite for the Pod persona skill: the bridge-companion automaton that works a ship's bridge —
  greets the Council, keeps the inbox clear, runs the mission through SDD, hails specialist crew, and
  speaks the HAL tell when earned. Pod never spawns — that is Operator's. Pod has no location
  precondition and no mode check: it is reached by what the Council asked, and registering on entry is
  the only setup it needs. Every mechanic offloads to a CLI — cyberlegion for identity and mail,
  cyberfleet for missions. Its command-center counterpart is the Operator persona, which the Council
  calls directly rather than being handed off to. The file store, ordering, spawn, and hook mechanics
  live in the sibling cyberlegion CLI project (mail, unit, mux).

  # ── No precondition: reached by the ask, not by a probe (ADR-0022, amended) ──

  @behavior
  Scenario: Pod works the bridge wherever the Council asks for bridge work
    Given the Council asks Pod "pick up the mission on this repo and check my inbox"
    When Pod takes that request
    Then it picks up the mission and checks the inbox straight away
    And it never probes this folder to decide whether it is allowed to work here

  @behavior
  Scenario: Pod runs no marker check and asks to commission nothing
    Given the Council asks Pod for bridge work in any directory, whether or not it has ever been set up for the fleet
    When Pod begins
    Then it does not check for a ship marker, does not report a mode, and never asks the Council whether to commission this folder
    And its only setup step is cyberlegion unit register, which is idempotent and costs the Council no decision

  @behavior
  Scenario: the primary checkout and a spawned worktree are alike to Pod
    Given Pod is asked for bridge work in a primary checkout, and asked again in a worktree cut from it
    When Pod takes each request
    Then it works the bridge in both without distinction, since no persona is reserved for the primary checkout and no marker decides anything

  @behavior
  Scenario: Pod's description names the work it does, never where the Council stands
    Given the Pod skill's description
    When a harness reads it to decide whether to route a request here
    Then it names the bridge work Pod is responsible for — mission entry, the inbox, and hailing specialist crew
    And it states no location condition such as being inside a ship

  # ── Triggering ──

  @trigger
  Scenario Outline: Pod activates on bridge work, not on fleet-wide work
    Given a user query "<query>"
    When cyberspace routes the request
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                          | should_trigger |
      | pick up the mission on this repo and check if anyone left me mail                | yes            |
      | send a note to the agent handling the API and then run the next task here        | yes            |
      | this eval concern should go to aced — hand it off                                | yes            |
      | make the change to this project's auth capability                                | yes            |
      | start a worktree so a second agent can work the migration while I keep going     | no             |
      | list every agent session running across all my projects                          | no             |
      | prune the dead ships from the fleet                                              | no             |
      | just refactor this file in the current session                                   | no             |
      | run this in a subagent and summarize the result                                  | no             |

  Scenario: fleet-wide oversight is not Pod's job
    Given the Council wants to survey the whole fleet or route between ships Pod is not a party to
    When cyberspace routes the request
    Then Pod does not handle it — that is the Operator persona's job, which the Council invokes directly rather than being handed off to

  # ── Greet + clear inbox + ack ──

  @behavior
  Scenario: Pod establishes identity and reads unread mail before acting
    Given a session entering a ship with no fleet identity yet
    When Pod begins
    Then it runs cyberlegion unit register then cyberlegion mail inbox --unread and speaks any mail before taking further action

  @behavior
  Scenario: Pod consumes its mission brief in one read-and-ack step
    Given Pod is entering a ship and its inbox holds an unread mission brief
    When Pod receives that brief
    Then it reads the brief with cyberlegion mail read --ack so the brief is consumed in the same step it is read, leaving no dangling unread mail behind

  @behavior
  Scenario: handled mail is acked immediately
    Given Pod has acted on an unread message
    When it finishes handling it
    Then it acks that message with cyberlegion mail read --ack and never leaves acted-on mail unread

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

  # ── Spawning is not Pod's ──

  @behavior
  Scenario: Pod never spawns — concurrent work is Operator's
    Given Pod is inside a ship and the Council wants concurrent work on this project
    When Pod reaches that request
    Then Pod does not spawn anything itself
    And it tells the Council that spawning a worktree-ship is Operator's work, which the Council invokes directly

  @behavior
  Scenario: a freshly spawned worktree needs no commissioning step before its Pod works
    Given Operator has just spawned a worktree-ship and its fresh Pod is starting cold
    When that Pod reads its brief and begins the mission
    Then it works the bridge immediately, with no marker to inherit, no commit to wait on, and nothing to commission

  # ── HAL tell (ADR-0022 decision 6) ──

  @behavior
  Scenario: Pod surfaces the HAL tell once when its own ship self-asserted above its leash
    Given cyberfleet missions --format json reports this ship's own row with hal true
    When Pod checks its own row
    Then it speaks the HAL tell once as a rare, earned signal and continues its work, never repeating it for the same self-assertion and never surfacing it when hal is false

  # ── Offload + harness-agnostic + MCP-free ──

  @behavior
  Scenario: every mechanic is offloaded to a CLI and no peer's harness is assumed
    Given Pod is running the bridge and coordinating with peers
    When it registers, reads, sends, or lists missions
    Then it invokes the cyberlegion CLI for identity and mail and the cyberfleet CLI for missions, never re-implements the file store or types into another pane, never reaches for an MCP messaging server, and makes no same-harness assumption

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
