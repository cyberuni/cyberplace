@frozen
Feature: decommission — tear a ship down and reap its state
  The cyberfleet CLI decommission layer: the deterministic inverse of spawn. Given a ship id, remove
  its git worktree, tear down its session pane (tmux or herdr), and reap its id-keyed .cyberfleet/
  record. Refuses the primary checkout (the flagship) and a dirty worktree unless --force. Distinct
  from the soft liveness sweep `prune` (identity), which only marks dead agents exited. Deciding when
  a ship is safe to decommission is persona judgment (cyberfleet-plugin), not a CLI concern.

  # ── Teardown worktree + session ──

  Scenario: decommission removes the ship's worktree and tears down its session
    Given a ship registered as agents/<id>.json with a recorded worktree and pane
    When it runs cyberfleet decommission <id>
    Then the ship's git worktree is removed through the worktree adapter
    And the ship's pane is torn down through the session adapter

  Scenario: decommission tears down through the session backend selected by environment
    Given $TMUX is set and a registered ship <id>
    When it runs cyberfleet decommission <id>
    Then the pane is torn down through the tmux session adapter

  Scenario: decommission uses the herdr adapter when tmux is not present
    Given $TMUX is unset and $HERDR_ENV is set and a registered ship <id>
    When it runs cyberfleet decommission <id>
    Then the pane is torn down through the herdr session adapter

  Scenario: decommission resolves the ship's pane from the reverse index when its record has none
    Given a herdr ship <id> whose pane is not stored on agents/<id>.json but is recorded under panes/<pane>.id
    When it runs cyberfleet decommission <id>
    Then the pane recorded under panes/<pane>.id is the one torn down

  # ── Reap the record ──

  Scenario: decommission reaps the ship's id-keyed record after teardown
    Given a ship <id> with agents/<id>.json, panes/<pane>.id, and data/<id>/
    When it runs cyberfleet decommission <id>
    Then agents/<id>.json is deleted
    And the ship's panes/<pane>.id is deleted
    And data/<id>/ is deleted

  Scenario: decommission reaps only the decommissioned ship's state
    Given two ships <id> and <other> each with their own agents, panes, and data
    When it runs cyberfleet decommission <id>
    Then <other>'s agents, panes, and data are left untouched

  # ── The flagship rule (ADR-0022 decision 8) ──

  Scenario: decommission refuses a ship whose worktree is the primary checkout
    Given a ship <id> whose recorded worktree root equals the primary checkout root
    When it runs cyberfleet decommission <id>
    Then the command errors clearly rather than removing the primary checkout
    And nothing is reaped

  Scenario: --force does not override the flagship rule
    Given a ship <id> whose recorded worktree root equals the primary checkout root
    When it runs cyberfleet decommission <id> --force
    Then the command still errors clearly rather than removing the primary checkout
    And nothing is reaped

  # ── Dirty-worktree refusal ──

  Scenario: decommission refuses a ship with uncommitted changes
    Given a ship <id> whose worktree has uncommitted changes
    When it runs cyberfleet decommission <id>
    Then the command errors clearly rather than discarding unlanded work
    And nothing is reaped

  Scenario: decommission with --force tears down a dirty worktree
    Given a ship <id> whose worktree has uncommitted changes
    When it runs cyberfleet decommission <id> --force
    Then the worktree is removed and the record is reaped

  # ── Unknown id ──

  Scenario: decommission on an unknown id errors and reaps nothing
    Given no agents/<id>.json exists for <id>
    When it runs cyberfleet decommission <id>
    Then the command errors clearly
    And no state is deleted

  # ── Idempotent reap (already-gone is tolerated) ──

  Scenario: decommission completes the reap when the worktree is already gone
    Given a ship <id> whose recorded worktree no longer exists on disk
    When it runs cyberfleet decommission <id>
    Then the worktree step does not hard-fail
    And agents/<id>.json, its pane pointer, and data/<id>/ are still reaped

  Scenario: decommission completes the reap when the pane is already gone
    Given a ship <id> whose recorded pane no longer exists
    When it runs cyberfleet decommission <id>
    Then the session teardown step does not hard-fail
    And agents/<id>.json, its pane pointer, and data/<id>/ are still reaped

  # ── Teardown precedes reap (a genuine failure is not tolerated) ──

  Scenario: decommission aborts without reaping when worktree removal genuinely fails
    Given a ship <id> whose worktree removal fails for a real reason, not already-removed
    When it runs cyberfleet decommission <id>
    Then the command errors
    And agents/<id>.json, its pane pointer, and data/<id>/ are left intact so the decommission can be retried
