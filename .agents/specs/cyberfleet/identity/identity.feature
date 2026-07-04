@frozen
Feature: identity — self-identify and discover peers
  The cyberfleet CLI identity layer: register records an agent's identity under .cyberfleet/, the
  agent recovers its own id on later calls via a pane-keyed self file, the harness is auto-detected,
  who lists addressable peers, and every call refreshes liveness. Sending and reading mail live in
  messaging; launching a session lives in spawn. Cross-capability e2e lives in
  acceptance.

  # ── Register records who and where ──

  Scenario: register writes the agent record and a pane pointer
    Given an unregistered agent in a tmux pane
    When it runs cyberfleet register --handle alice
    Then .cyberfleet/agents/<id>.json exists recording handle=alice, the detected harness, cwd, and timestamps
    And .cyberfleet/panes/<pane>.id points to that id

  Scenario: register is idempotent for the same pane
    Given an agent already registered in the current pane
    When it runs cyberfleet register again
    Then it keeps the same id and refreshes the record rather than creating a second identity

  Scenario: register fails cleanly when it cannot write the registry
    Given a .cyberfleet root that cannot be created or written
    When an agent runs cyberfleet register
    Then the command errors and writes no partial agent record

  # ── Pane-keyed self-recall ──

  Scenario: a later call recovers the agent's own id from its pane
    Given an agent registered in the current pane
    When it runs any cyberfleet command that needs its own identity
    Then it resolves its id from .cyberfleet/panes/<$TMUX_PANE>.id without being told the id

  Scenario: outside tmux, self-identity falls back to an env var or a self file
    Given an agent running with no $TMUX_PANE
    When it needs its own identity
    Then it resolves from $CYBERFLEET_AGENT_ID or .cyberfleet/self

  Scenario: $CYBERFLEET_AGENT_ID wins over .cyberfleet/self when both are present
    Given an agent with no $TMUX_PANE where both $CYBERFLEET_AGENT_ID and .cyberfleet/self are set
    When it resolves its own identity
    Then it uses $CYBERFLEET_AGENT_ID

  # ── Harness auto-detect ──

  Scenario: an explicit --harness overrides detection
    Given a register call passing --harness codex
    When the agent is recorded
    Then its harness is codex regardless of the pane command

  Scenario: harness is read from the tmux pane command when not given
    Given a register call with no --harness in a pane running cursor-agent
    When the agent is recorded
    Then its harness is detected as cursor

  Scenario: an undetectable harness requires --harness rather than guessing
    Given a register call with no --harness and no detectable harness signal
    When the agent registers
    Then the command asks for --harness rather than recording a guessed harness

  # ── who lists peers ──

  Scenario: who lists the registry as a markdown table
    Given three agents are registered
    When an agent runs cyberfleet who
    Then all three are listed with handle, harness, cwd, pane, status, and last-seen

  Scenario: who on an empty registry reports no agents rather than erroring
    Given no agents are registered
    When an agent runs cyberfleet who
    Then it reports that there are no agents rather than failing

  # ── Liveness on every call ──

  Scenario: every cyberfleet call refreshes the agent's last-seen
    Given a registered agent
    When it runs any cyberfleet command
    Then its record's last-seen is updated to the time of that call
