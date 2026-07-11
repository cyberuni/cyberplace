@frozen
Feature: init — commission a ship by writing cyberfleet's own marker
  cyberfleet init makes the current directory a ship by writing the minimal opt-in marker
  .agents/cyberfleet/ship.json (a schema version). It is idempotent and needs no git. Capturing a
  ship's live layout — its blueprint — is a separate Pod-driven concern, never init's.

  # ── init creates the marker ──

  Scenario: init writes the marker when none is present
    Given a directory with no .agents/cyberfleet/ marker
    When cyberfleet init runs there
    Then .agents/cyberfleet/ship.json exists at that root recording a schema version

  # ── idempotent ──

  Scenario: init on an already-initialized directory is a no-op
    Given a directory whose .agents/cyberfleet/ship.json already exists
    When cyberfleet init runs there
    Then it reports the marker is already present and does not overwrite it

  Scenario: re-running init does not error
    Given a directory whose .agents/cyberfleet/ship.json already exists
    When cyberfleet init runs there
    Then it exits without error

  # ── no git required ──

  Scenario: init works in a non-git folder
    Given a non-git folder with no .agents/cyberfleet/ marker
    When cyberfleet init runs there
    Then .agents/cyberfleet/ship.json exists at that root
