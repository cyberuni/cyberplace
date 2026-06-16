Feature: prepare plugin runtime artifacts

  Background:
    Given a project root with ".plugin/plugin.json"
    And the manifest declares a governance "clean-architecture"

  Scenario: copies governance to project scope
    Given "governances/clean-architecture.md" exists in the plugin package
    When I run "universal-plugin prepare --root <root>"
    Then the exit code is 0
    And ".agents/governances/clean-architecture.md" is written

  Scenario: --global copies to user scope
    Given "governances/clean-architecture.md" exists in the plugin package
    When I run "universal-plugin prepare --global --root <root>"
    Then the exit code is 0
    And "~/.agents/governances/clean-architecture.md" is written

  Scenario: --vendor limits setup to one runtime
    Given the manifest declares artifacts for "claude-code" and "cursor"
    When I run "universal-plugin prepare --vendor claude-code --root <root>"
    Then only claude-code artifacts are written
    And cursor artifacts are NOT written

  Scenario: --dry-run previews without writing
    Given "governances/clean-architecture.md" exists in the plugin package
    When I run "universal-plugin prepare --dry-run --root <root>"
    Then the exit code is 0
    And ".agents/governances/clean-architecture.md" is NOT written
    And stdout contains "clean-architecture.md"

  Scenario: idempotent — running twice produces same result
    Given "governances/clean-architecture.md" exists in the plugin package
    When I run "universal-plugin prepare --root <root>"
    And I run "universal-plugin prepare --root <root>" again
    Then the exit code is 0
    And ".agents/governances/clean-architecture.md" has the same content as after the first run

  Scenario: partial failure continues and exits 1
    Given "governances/clean-architecture.md" exists in the plugin package
    And "governances/missing.md" is declared in the manifest but does not exist
    When I run "universal-plugin prepare --root <root>"
    Then the exit code is 1
    And ".agents/governances/clean-architecture.md" is written
    And stderr contains "missing.md"

  Scenario: missing .plugin/plugin.json fails
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin prepare --root <root>"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  Scenario: --format json returns installed and failed lists
    Given "governances/clean-architecture.md" exists in the plugin package
    When I run "universal-plugin prepare --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with an "installed" array
    And stdout JSON contains an empty "failed" array

  Scenario: --format json with failure includes failed entry
    Given "governances/missing.md" is declared in the manifest but does not exist
    When I run "universal-plugin prepare --format json --root <root>"
    Then the exit code is 1
    And stdout is valid JSON
    And stdout JSON "failed" array contains an entry for "missing.md"
