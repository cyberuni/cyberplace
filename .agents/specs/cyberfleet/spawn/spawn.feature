@frozen
Feature: spawn — launch a new peer session and hand it its brief
  The cyberfleet CLI spawn layer: create a real git worktree for the new ship, open a session pane
  (tmux or herdr) with its cwd set to that worktree, pre-register the new peer under .cyberfleet/,
  write its brief to a file, launch the harness's own CLI in the pane, and let the peer pick up its
  brief through its own SessionStart hook. Identity fields live in identity; the hook that
  injects the brief and inbox lives in surfacing. Cross-capability e2e lives in acceptance.

  # ── Open pane + pre-register ──

  Scenario: spawn opens a new pane and registers the peer before it starts
    Given an agent running inside tmux
    When it runs cyberfleet spawn --harness claude --task "reply to alice"
    Then a new tmux pane is opened
    And .cyberfleet/agents/<new-id>.json exists with harness=claude, the new pane, status=spawning, and spawnedBy=the spawner
    And .cyberfleet/panes/<new-pane>.id points to the new id

  # ── Ship = worktree (ADR-0022 decision 8) ──

  Scenario: spawn creates a real git worktree for the new ship
    Given an agent running inside tmux at the primary checkout
    When it runs cyberfleet spawn --harness claude --task "reply to alice"
    Then a git worktree is created on a new branch, distinct from the primary checkout
    And the new pane's cwd is set to that worktree's root, not the spawner's cwd
    And .cyberfleet/agents/<new-id>.json records worktree.root and worktree.branch for the new ship

  Scenario: spawn accepts an explicit branch and worktree path
    Given a spawn with --branch <name> and --worktree-path <path>
    When the peer is created
    Then the worktree is created on <name> at <path> instead of the defaults

  Scenario: the flagship rule refuses a ship that resolves onto the primary checkout
    Given a spawn whose resolved worktree root would equal the primary checkout root
    When the spawn runs
    Then the command errors clearly rather than opening a session in the primary checkout

  # ── Console = two adapters (ADR-0022 decision 9) ──

  Scenario: the session backend is selected by environment
    Given $TMUX is set
    When spawn runs
    Then it opens the new pane through the tmux session adapter

  Scenario: herdr is used when tmux is not present
    Given $TMUX is unset and $HERDR_ENV is set
    When spawn runs
    Then it opens the new pane through the herdr session adapter, and the agent record's tmux field is null

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

  Scenario Outline: the pane is started with the harness's own CLI
    Given a spawn with --harness "<harness>"
    When the new pane is launched
    Then the pane runs "<launch>" from the per-harness launch map

    Examples:
      | harness | launch       |
      | claude  | claude       |
      | cursor  | cursor-agent |
      | codex   | codex        |

  Scenario: a spawn with an unmapped harness errors rather than launching
    Given a spawn with a --harness value that has no entry in the launch map
    When the spawn runs
    Then the command errors and no pane is launched

  Scenario: a spawn with no brief source errors
    Given a spawn with neither --task, --task -, nor --brief-file supplied
    When the spawn runs
    Then the command errors rather than creating a peer with an empty brief

  # ── Peer picks up brief at start ──

  Scenario: the spawnee's brief is delivered by file and its hook is wired, not typed
    Given a peer launched with a pre-written brief.md and the fleet SessionStart hook registered
    When the peer starts
    Then it resolves its own id by pane and its SessionStart hook reads brief.md
    And the spawner never types the task into the peer's prompt

  # ── Requires a session backend ──

  Scenario: spawn reports the requirement when no session backend is detected
    Given an agent with neither $TMUX nor $HERDR_ENV set
    When it runs cyberfleet spawn
    Then the command reports that spawn requires a session backend (tmux or herdr) rather than failing obscurely
