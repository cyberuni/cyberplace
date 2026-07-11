@frozen
Feature: mode — ship vs command-center, keyed on cyberfleet's own marker
  cyberfleet mode reports ship (a place fleet work runs) or command-center (off any ship) by the
  presence of cyberfleet's own tracked marker .agents/cyberfleet/ (its ship.json) at the project
  root. Git shape is irrelevant: primary checkout, linked worktree, and non-git folder are all equal.

  # ── The marker is the sole ship signal ──

  Scenario: a project root carrying the cyberfleet marker is a ship
    Given a project root with .agents/cyberfleet/ship.json present
    When cyberfleet mode runs there
    Then it reports mode ship

  Scenario: a project root with no cyberfleet marker is the command-center
    Given a project root with no .agents/cyberfleet/ marker
    When cyberfleet mode runs there
    Then it reports mode command-center

  # ── Git shape does not change the verdict ──
  # Primary checkout, linked worktree, and non-git folder are all equal — the marker alone decides,
  # on both the ship side (marker present) and the command-center side (marker absent).

  Scenario Outline: any working directory carrying the marker is a ship regardless of git shape
    Given a <shape> whose project root carries the cyberfleet marker
    When cyberfleet mode runs there
    Then it reports mode ship

    Examples:
      | shape                |
      | git primary checkout |
      | git linked worktree  |
      | non-git folder       |

  Scenario: a non-git folder with no marker is the command-center
    Given a non-git folder with no .agents/cyberfleet/ marker
    When cyberfleet mode runs there
    Then it reports mode command-center
