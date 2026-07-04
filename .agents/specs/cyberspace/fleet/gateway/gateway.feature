Feature: gateway — the fleet skill: spawn peers and message between sessions
  Unit suite for the fleet gateway skill: activate when the user wants to coordinate peer agent
  sessions that message each other, load the fleet etiquette, and route every mechanic to the
  cyberfleet CLI. It defers plain single-session work and in-harness subagent nesting. The file
  store, ordering, spawn, and hook mechanics live in messaging, identity, spawn, and
  surfacing; authoring agent config or plugins is bootstrap and plugin. Cross-capability e2e
  lives in acceptance.

  # ── Triggering ──

  @trigger
  Scenario Outline: the fleet skill activates on multi-session coordination
    Given a user query "<query>"
    When cyberspace routes the request
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                          | should_trigger |
      | spawn a second agent session to work on the migration while I keep going here   | yes            |
      | have this session send a message to the other agent working on the API          | yes            |
      | start a parallel Cursor session and let it report back to me here               | yes            |
      | check if any of my other running agent sessions left me a message               | yes            |
      | run this in a subagent and summarize the result                                 | no             |
      | just refactor this file in the current session                                  | no             |
      | set up mcp-agent-mail so my agents can talk                                      | no             |
      | initialize AGENTS.md and wire my vendor config                                  | no             |

  Scenario: a subagent request is not a fleet request
    Given the user wants a nested subagent to do a scoped task and return a result
    When cyberspace routes the request
    Then the fleet skill does not handle it and the harness's own subagent tooling does

  # ── Offload to cyberfleet ──

  @behavior
  Scenario: every mechanic is a cyberfleet call
    Given the fleet skill is coordinating peer sessions
    When it spawns, registers, sends, reads, or lists mail
    Then it invokes the cyberfleet CLI and does not re-implement the file store or type into another pane

  # ── Register + check inbox + ack ──

  @behavior
  Scenario: the skill establishes identity and reads unread mail before acting
    Given a session entering fleet coordination
    When the fleet skill begins
    Then it runs cyberfleet register and reads cyberfleet inbox --unread before taking peer actions

  @behavior
  Scenario: handled mail is acked
    Given the session has acted on an unread message
    When it finishes handling it
    Then it acks that message with cyberfleet read

  # ── Spawn with a self-contained brief ──

  @behavior
  Scenario: parallel work is handed to a peer with a standalone brief
    Given work that should run in parallel with the current session
    When the fleet skill delegates it
    Then it spawns a peer with cyberfleet spawn and a brief that stands on its own, addressing peers by handle

  # ── Harness-agnostic + MCP-free ──

  @behavior
  Scenario: the skill never assumes the peer's harness and never reaches for MCP
    Given a peer session that may run a different harness
    When the fleet skill coordinates with it
    Then it addresses the peer through the shared files and cyberfleet, not an MCP messaging server, and makes no same-harness assumption

  @quality @rubric
  Scenario: fleet coordination is offloaded, etiquette-complete, and harness-agnostic
    Given a session coordinating peers over the fleet
    When the fleet skill runs a coordination
    Then the judge evaluates the coordination against the rubric
      """
      dimensions:
        - name: mechanics_offloaded_to_cyberfleet_not_reimplemented
          max: 3
        - name: register_check_inbox_ack_etiquette_followed
          max: 2
        - name: brief_is_self_contained_and_addressed_by_handle
          max: 2
        - name: harness_agnostic_and_mcp_free
          max: 2
      threshold: 7
      """
    And the rubric score is at least the threshold
