Feature: spawn — launch a new peer session and hand it its brief
  The cyberfleet CLI spawn layer: open a tmux split, pre-register the new peer under .cyberfleet/,
  write its brief to a file, launch the harness's own CLI in the pane, and let the peer pick up its
  brief through its own SessionStart hook. Identity fields live in ../identity/; the hook that
  injects the brief and inbox lives in ../surfacing/. Cross-capability e2e lives in ../../acceptance/.

  # ── Open pane + pre-register ──

  Scenario: spawn opens a new pane and registers the peer before it starts
    Given an agent running inside tmux
    When it runs cyberfleet spawn --harness claude --task "reply to alice"
    Then a new tmux pane is opened
    And .cyberfleet/agents/<new-id>.json exists with harness=claude, the new pane, status=spawning, and spawnedBy=the spawner
    And .cyberfleet/panes/<new-pane>.id points to the new id

  # ── Brief written to a file ──

  Scenario: the task brief is written to a file
    Given a spawn with --task "reply to alice"
    When the peer is created
    Then .cyberfleet/data/<new-id>/brief.md contains "reply to alice"

  Scenario: the brief can come from stdin or a file
    Given a spawn passing --task - with piped text, or --brief-file <path>
    When the peer is created
    Then brief.md contains the supplied brief content

  # ── Per-harness launch ──

  Scenario: the pane is started with the harness's own CLI
    Given a spawn with --harness cursor
    When the new pane is launched
    Then the pane runs the cursor launch command from the per-harness launch map

  # ── Peer picks up brief at start ──

  Scenario: the spawnee reads its own brief at start rather than being typed to
    Given a peer launched with a pre-written brief
    When its SessionStart hook runs
    Then it resolves its own id by pane, finds brief.md, and has the brief injected into its context
    And the spawner never types the task into the peer's prompt

  # ── Requires tmux ──

  Scenario: spawn outside tmux reports the requirement
    Given an agent not running inside a tmux session
    When it runs cyberfleet spawn
    Then the command reports that spawn requires tmux rather than failing obscurely
