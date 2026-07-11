Feature: init — commission a ship by writing cyberfleet's own marker
  cyberfleet init makes the current directory a ship by writing .agents/cyberfleet/ship.json — the
  opt-in marker that mode reads and the home for the ship's own settings. It is
  idempotent, needs no git, and never touches .agents/cyberlegion/.

  # ── init creates the marker ──

  Scenario: init writes the marker when none is present
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs there
    Then .agents/cyberfleet/ship.json exists at that root

  Scenario: after init the directory reports mode ship
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs there
    Then cyberfleet mode at that root reports ship

  # ── ship.json carries the commissioning defaults ──

  Scenario: the written ship.json records the ship's default settings
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs with no override flags
    Then ship.json records a schema version and the default harness and placement

  Scenario: init flags override the recorded defaults
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs with --harness cursor and --at pane:down
    Then ship.json records harness cursor and placement pane:down

  Scenario: init records the optional space binding only when given
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs with --space acme
    Then ship.json records space acme

  # ── idempotent ──

  Scenario: init on an already-initialized directory is a no-op
    Given a directory whose .agents/cyberfleet/ship.json already exists
    When cyberfleet init runs there
    Then it reports the marker is already present and does not overwrite the existing config

  Scenario: re-running init does not error
    Given a directory whose .agents/cyberfleet/ship.json already exists
    When cyberfleet init runs there
    Then it exits without error

  # ── no git required ──

  Scenario: init works in a non-git folder
    Given a non-git folder with no .agents/cyberfleet/ marker
    When cyberfleet init runs there
    Then .agents/cyberfleet/ship.json exists and cyberfleet mode reports ship

  # ── decoupled from cyberlegion ──

  Scenario: init does not create or modify the cyberlegion marker
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs there
    Then no .agents/cyberlegion/ marker is created by the command
