@frozen
Feature: plugin init — scaffold a new plugin project

  Background:
    Given a project root with no ".plugin/plugin.json"

  # ── Manifest defaults ──

  Scenario: creates manifest with defaults in non-interactive mode
    When I run "universal-plugin plugin init --yes --root <root>"
    Then the exit code is 0
    And ".plugin/plugin.json" is written
    And ".plugin/plugin.json" contains a "name" field

  Scenario: uses --name flag for plugin name
    When I run "universal-plugin plugin init --name my-plugin --yes --root <root>"
    Then the exit code is 0
    And ".plugin/plugin.json" contains name "my-plugin"

  Scenario: uses directory name as default plugin name
    Given the project root directory is named "cool-plugin"
    When I run "universal-plugin plugin init --yes --root <root>"
    Then ".plugin/plugin.json" contains name "cool-plugin"

  # ── Vendor stubs ──

  Scenario: --vendor adds vendorExtensions stub
    When I run "universal-plugin plugin init --vendor claude-code --vendor cursor --yes --root <root>"
    Then ".plugin/plugin.json" contains "vendorExtensions.claude-code"
    And ".plugin/plugin.json" contains "vendorExtensions.cursor"

  # ── Scaffolding ──

  Scenario: --scaffold creates standard directories
    When I run "universal-plugin plugin init --scaffold --yes --root <root>"
    Then the exit code is 0
    And directory "skills/" is created
    And directory "agents/" is created
    And directory "governances/" is created
    And directory "commands/" is created

  Scenario: without --scaffold only manifest is created
    When I run "universal-plugin plugin init --yes --root <root>"
    Then ".plugin/plugin.json" is written
    And directory "skills/" is NOT created

  # ── Guarded overwrite ──

  Scenario: fails if .plugin/plugin.json already exists
    Given ".plugin/plugin.json" already exists
    When I run "universal-plugin plugin init --yes --root <root>"
    Then the exit code is 1
    And stderr contains "already exists"
    And stderr contains "--force"

  Scenario: --force overwrites existing manifest
    Given ".plugin/plugin.json" already exists
    When I run "universal-plugin plugin init --force --yes --root <root>"
    Then the exit code is 0
    And ".plugin/plugin.json" is overwritten

  # ── JSON output ──

  Scenario: --format json returns list of created files
    When I run "universal-plugin plugin init --yes --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with a "created" array
    And the "created" array contains ".plugin/plugin.json"

  Scenario: --format json suppresses interactive prompts
    When I run "universal-plugin plugin init --format json --root <root>"
    Then the exit code is 0
    And no interactive prompts are shown
    And stdout is valid JSON with a "created" array
