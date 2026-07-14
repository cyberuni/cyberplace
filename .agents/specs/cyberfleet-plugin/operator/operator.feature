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
    Then it runs cyberlegion unit spawn with a brief that stands on its own, since the new Pod starts cold and reads it through its own SessionStart hook, and addresses it by handle

  @behavior
  Scenario: a commissioned ship opens in its own workspace
    Given the Council wants a new ship commissioned from outside any ship
    When Operator runs the spawn
    Then it passes --at workspace on the cyberlegion unit spawn call, so the new ship opens in its own herdr workspace rather than a pane crowding a neighbor's

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
    Then it runs cyberlegion unit who, adding --all to include exited ships when the Council wants them

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
    Then it runs cyberlegion unit prune

  # ── Offload + harness-agnostic + MCP-free ──

  @behavior
  Scenario: every mechanic is a cyberlegion call and no ship's harness is assumed
    Given Operator is dispatching the fleet
    When it spawns, lists, sends, reads, or prunes
    Then it invokes the cyberlegion CLI, never re-implements the file store or types into a ship's pane, never reaches for an MCP messaging server, and makes no same-harness assumption

  # ── The lifecycle loop — unattended fleet dispatch (F3, headless) ──

  @behavior
  Scenario: the headless realization runs Operator's dispatch flow with no live Council
    Given there is no user or Council channel to drive dispatch (an unattended or scheduled trigger)
    When the fleet must be advanced
    Then the headless-operator agent runs the same out-of-ship dispatch Operator runs in-session, carries no logic Operator plus the mission-graph engine do not already hold, and batches anything it cannot decide up its relay rather than asking live

  @behavior
  Scenario: the loop pulls the ready frontier and dispatches the top-ranked mission
    Given a mission graph with a non-empty ready frontier
    When the lifecycle loop ticks with spare capacity
    Then it reads the frontier from the mission-graph engine's ready query and dispatches the highest-ranked mission it has capacity to run

  @behavior
  Scenario: a mission is claimed on the graph before it is spawned
    Given the loop has picked a mission off the ready frontier
    When it dispatches that mission
    Then it first appends a claim to the mission graph (status in-progress) as the single writer, then runs cyberlegion unit spawn for the ship that will execute it

  @behavior
  Scenario: capacity and human-availability gate what actually runs
    Given the ready frontier carries more missions than the loop's capacity K, some HITL and some AFK
    When the loop dispatches
    Then it runs at most K at once, sends an AFK mission to an autonomous ship and a HITL mission to a human channel, and leaves the rest on the frontier for a later tick

  @behavior
  Scenario: the Operator is the sole graph writer; dispatched missions only report
    Given a dispatched mission finishes and reports through its existing handoff relay
    When the loop processes the completion
    Then the dispatched mission never writes the graph itself, and the headless-operator appends the retirement so claims and retirements never race

  @behavior
  Scenario: completion retires in Operation order and re-derives the next frontier
    Given a mission reports done at handoff (its PR created)
    When the lifecycle loop handles the completion
    Then it merges in Operation order behind the merge backstop, tears down the pod that ran it, appends the retirement and any discovered edges or nodes as the single writer, and re-derives ready to dispatch the next mission

  @behavior
  Scenario: the loop's spawns are inter-mission, distinct from Pod's intra-mission fan-out
    Given the lifecycle loop dispatches whole missions from outside any one ship
    When it spawns a ship per mission
    Then those spawns stay Operator's inter-mission dispatch, separate from Pod's intra-mission worktree fan-out inside a single ship, and no rule of the in-ship Pod persona is invoked

  @behavior
  Scenario: the loop is summoned, ticks, and exits rather than running as a daemon
    Given the lifecycle loop is invoked for one advance of the fleet
    When it has dispatched what capacity allows and processed any completions handed to it
    Then it returns rather than blocking as a long-lived daemon, so a later tick re-derives fresh state

  # ── The merge backstop — Operation-order retirement (F3) ──

  @behavior
  Scenario: missions retire to trunk in Operation order, not the order they finished
    Given several dispatched missions report done in an arbitrary finish order
    When the loop retires them
    Then it merges in Operation order per merge-backstop-governance — a consumer never lands before its producer, the Operation is the retirement boundary — not in the order the missions happened to finish

  @behavior
  Scenario: a merge lands only when speculative CI is green on the merged result
    Given a mission's merge is staged speculatively against trunk
    When the backstop evaluates it
    Then it lands the merge only if CI is green on the merged result, not merely on the mission's own branch, and re-derives ready for the next tick

  @behavior
  Scenario: a red merged result never lands on trunk
    Given the speculative CI on a staged merge comes back red
    When the backstop handles it
    Then the red result never reaches trunk, so trunk stays always-green by construction

  @behavior
  Scenario: a red stacked batch is bisected — the culprit is held, the innocent land
    Given several merges were speculated stacked ahead of trunk and the integrated result is red
    When the backstop isolates the failure
    Then it bisects the stacked range to the single culprit mission, holds that culprit for repair as a single-writer graph append without retiring it, and lands the missions proven green in isolation

  @behavior
  Scenario: speculation depth is bounded by predictor confidence
    Given the loop chooses how many merges to stack ahead of trunk before landing
    When it sets the speculation depth
    Then low confidence commits near (shallow, CI-gate each) and high confidence speculates far (stack a batch, CI-gate it, bisect only on red), and no depth ever weakens the always-green invariant

  @behavior
  Scenario: the backstop mechanics are offloaded, not re-implemented
    Given the backstop must run CI, merge, and bisect
    When it acts
    Then it invokes gh / git / the project CI as mechanics and never re-implements a CI runner, a merge engine, or a git host, keeping the merge discipline in merge-backstop-governance and the mechanics in the tools

  @behavior
  Scenario: the headless-operator loads merge-backstop-governance for the merge step
    Given the lifecycle loop reaches the retire step of a completed mission
    When it merges
    Then the headless-operator loads merge-backstop-governance by name and runs its Operation-order + speculative-CI + bisection discipline rather than carrying the merge judgment inline

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
