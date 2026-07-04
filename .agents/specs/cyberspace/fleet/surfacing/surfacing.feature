Feature: surfacing — inject unread mail into a session, across harnesses
  The cyberfleet CLI surfacing layer: inbox --hook emits the SessionStart additionalContext payload
  so a harness hook injects an agent's unread mail (and its spawn brief) into context, and the
  emitter is registered across harnesses reusing the existing per-vendor event mapping. The message
  store and acks live in messaging; when to check or send mail is the gateway skill.
  Cross-capability e2e lives in acceptance.

  # ── inbox --hook emits the SessionStart payload ──

  Scenario: inbox --hook prints the SessionStart injection payload for unread mail
    Given the calling agent has two unread messages
    When it runs cyberfleet inbox --hook --event SessionStart
    Then it prints a { hookSpecificOutput: { hookEventName, additionalContext } } payload
    And additionalContext contains the two unread messages

  Scenario: a spawned peer's brief is surfaced alongside its inbox
    Given a spawned agent with a pending brief.md and no mail
    When its SessionStart hook runs cyberfleet inbox --hook
    Then additionalContext contains the brief

  # ── Purpose-built emitter ──

  Scenario: surfacing uses the dedicated command, not a generic exec source
    Given the surfacing hook is wired
    When it runs
    Then it invokes cyberfleet inbox --hook and not a generic run-any-command hook source

  # ── Per-vendor registration ──

  Scenario: SessionStart is registered for every supported harness
    Given the surfacing hook is registered
    When the per-harness config is written
    Then Claude, Cursor, and Codex each carry a SessionStart registration under their own event name

  Scenario: PostToolUse is registered only where the harness supports it
    Given the surfacing hook is registered for mid-session checks
    When the per-harness config is written
    Then Claude and Codex carry a PostToolUse registration and Cursor does not

  # ── Empty yields no injection ──

  Scenario: no unread mail and no brief injects nothing
    Given the calling agent has no unread mail and no pending brief
    When it runs cyberfleet inbox --hook --event SessionStart
    Then it injects no additionalContext rather than empty noise

  Scenario: an unregistered caller injects nothing rather than erroring the hook
    Given the calling session has no resolvable fleet identity
    When its hook runs cyberfleet inbox --hook --event SessionStart
    Then it injects no additionalContext and does not fail the harness hook

  Scenario: an unsupported --event value is rejected
    Given a hook invocation passing an --event the emitter does not support
    When it runs cyberfleet inbox --hook
    Then the command errors rather than emitting a payload for an unknown event

  # ── Idempotent registration ──

  Scenario: re-registering the surfacing hook does not duplicate it
    Given the surfacing hook is already correctly registered for a harness
    When registration runs again
    Then the existing registration is left in place and not duplicated
