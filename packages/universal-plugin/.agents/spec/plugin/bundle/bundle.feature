@frozen
Feature: plugin bundle — materialize the release form

  Background:
    Given a project root with ".plugin/plugin.json"
    And the workspace package "cyberplace" is at version "0.1.0"

  # ── Preconditions ──

  Scenario: missing .plugin/plugin.json fails
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin plugin bundle"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  # ── Pin from workspace ──

  Scenario: bundle pins a workspace CLI to its local package.json version
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    When I run "universal-plugin plugin bundle"
    Then "skills/x/SKILL.md" contains "npx cyberplace@0.1.0"
    And the exit code is 0

  Scenario: a placeholder pin on a workspace CLI resolves to the workspace version
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@<version>"
    When I run "universal-plugin plugin bundle"
    Then "skills/x/SKILL.md" contains "npx cyberplace@0.1.0"
    And the exit code is 0

  Scenario: bundle pins to the workspace version even when a registry would resolve differently
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    And a registry would resolve "cyberplace" to a newer "0.2.0"
    When I run "universal-plugin plugin bundle"
    Then "skills/x/SKILL.md" contains "npx cyberplace@0.1.0"
    And "skills/x/SKILL.md" does not contain "npx cyberplace@0.2.0"

  Scenario: bundle resolves from the workspace with no network access
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    And no network is available
    When I run "universal-plugin plugin bundle"
    Then "skills/x/SKILL.md" contains "npx cyberplace@0.1.0"
    And the exit code is 0

  Scenario: a pin already at the workspace version is left unchanged
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.1.0"
    When I run "universal-plugin plugin bundle"
    Then "skills/x/SKILL.md" contains "npx cyberplace@0.1.0"
    And stdout is TOON with a pins row for "cyberplace" whose "status" is "unchanged"
    And the exit code is 0

  Scenario: a workspace package whose local package.json is unreadable warns and skips, bundle still succeeds
    Given a skill "skills/x/SKILL.md" contains "npx cyberfleet@0.0.1"
    And the workspace package "cyberfleet" has no readable package.json version
    When I run "universal-plugin plugin bundle"
    Then the exit code is 0
    And "skills/x/SKILL.md" contains "npx cyberfleet@0.0.1"
    And stderr contains "cyberfleet"
    And stdout is TOON with a pins row for "cyberfleet" whose "status" is "skipped"

  # ── Doc-example ignore ──

  Scenario: a skill marked as pin-exempt is never rewritten
    Given a skill "skills/upgrade-universal-plugin/SKILL.md" is marked pin-exempt
    And it contains "npx universal-plugin@1.2.3" and "npx universal-plugin@<old-version>"
    When I run "universal-plugin plugin bundle"
    Then "skills/upgrade-universal-plugin/SKILL.md" contains "npx universal-plugin@1.2.3"
    And "skills/upgrade-universal-plugin/SKILL.md" contains "npx universal-plugin@<old-version>"
    And no pins row is emitted for a package in the pin-exempt skill

  Scenario: a pin-exempt skill is skipped even when its package is a workspace CLI
    Given the workspace package "universal-plugin" is at version "0.2.1"
    And a skill "skills/upgrade-universal-plugin/SKILL.md" is marked pin-exempt
    And it contains "npx universal-plugin@<version>"
    When I run "universal-plugin plugin bundle"
    Then "skills/upgrade-universal-plugin/SKILL.md" contains "npx universal-plugin@<version>"
    And the exit code is 0

  # ── External / non-workspace pins ──

  Scenario: a pin for a package with no workspace entry is left untouched
    Given a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.1"
    And there is no workspace package "gherkin-cli"
    When I run "universal-plugin plugin bundle"
    Then "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.1"
    And stdout is TOON with a pins row for "gherkin-cli" whose "status" is "skipped"
    And the exit code is 0

  # ── Write control ──

  Scenario: --dry-run reports resolved pins without writing them
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    When I run "universal-plugin plugin bundle --dry-run"
    Then "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    And stdout is TOON with a pins row carrying "package" "cyberplace", "current" "0.0.9", "resolved" "0.1.0"
    And the exit code is 0

  # ── AXI output contract ──

  Scenario: a bundle prints TOON pins rows and a pre-computed aggregate
    Given the workspace package "cyberfleet" is at version "0.0.1"
    And a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9" and "npx cyberfleet@0.0.1"
    When I run "universal-plugin plugin bundle"
    Then stdout is TOON with one pins row per package carrying "package", "current", "resolved", "status"
    And each pins row's "status" is "pinned", "unchanged", or "skipped"
    And stdout contains the aggregate summary "pinned 1, unchanged 1, skipped 0"
    And the exit code is 0

  Scenario: --format json returns a structured pins result
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    When I run "universal-plugin plugin bundle --format json"
    Then stdout is JSON with a "pins" array
    And a pins entry has "package" "cyberplace" and "resolved" "0.1.0"
    And the exit code is 0

  Scenario: --format toon names the default explicitly
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    When I run "universal-plugin plugin bundle --format toon"
    Then stdout is TOON with one pins row per package
    And the exit code is 0

  Scenario: a large pins list truncates with a size hint
    Given the skills reference 40 distinct workspace CLIs the workspace resolves
    When I run "universal-plugin plugin bundle --dry-run"
    Then stdout lists a truncated set of pins rows
    And stdout ends with a truncation hint matching "… +\d+ more — rerun with --full"
    And the exit code is 0

  Scenario: --full suppresses pins truncation
    Given the skills reference 40 distinct workspace CLIs the workspace resolves
    When I run "universal-plugin plugin bundle --dry-run --full"
    Then stdout lists all 40 pins rows
    And the exit code is 0

  Scenario: no pins to resolve is a definitive empty state
    Given no skill references an "npx <pkg>@<pin>" reference
    When I run "universal-plugin plugin bundle"
    Then the exit code is 0
    And stdout contains the aggregate summary "pinned 0"
    And stderr contains "nothing to bundle"

  Scenario: a successful bundle ends with a next-step suggestion
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    When I run "universal-plugin plugin bundle"
    Then stderr ends with a "→" next-step suggestion

  Scenario: bundle never prompts interactively
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@0.0.9"
    When I run "universal-plugin plugin bundle"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    When I run "universal-plugin plugin bundle --frobnicate"
    Then the exit code is 1
    And stderr contains "--frobnicate"

  Scenario: --help documents the bundle flags
    When I run "universal-plugin plugin bundle --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
    And stdout mentions "--dry-run" and "--full"
