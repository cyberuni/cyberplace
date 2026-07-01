Feature: validate plugin manifest

  Background:
    Given a project root with ".plugin/plugin.json"

  Scenario: valid manifest exits 0
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin validate"
    Then the exit code is 0

  Scenario: missing .plugin/plugin.json fails
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin validate"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  Scenario: schema violation is reported
    Given the manifest is missing the required "name" field
    When I run "universal-plugin validate"
    Then the exit code is 1
    And stderr contains "name"
    And stderr contains "required field missing"

  Scenario: all violations are reported together
    Given the manifest is missing "name" and "version"
    When I run "universal-plugin validate"
    Then the exit code is 1
    And stderr contains "name"
    And stderr contains "version"

  Scenario: vendor rule violation is reported
    Given the manifest declares vendorExtensions for "codex"
    And the manifest has no description or version
    When I run "universal-plugin validate"
    Then the exit code is 1
    And stderr contains "description is required when targeting codex"
    And stderr contains "version is required when targeting codex"

  Scenario: --vendor limits vendor rule checks to one vendor
    Given the manifest declares vendorExtensions for "codex" and "cursor"
    And the manifest has no description or version
    When I run "universal-plugin validate --vendor cursor"
    Then the exit code is 0

  Scenario: --vendor unknown value fails
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin validate --vendor acme"
    Then the exit code is 1
    And stderr contains "Unknown vendor"

  Scenario: unknown vendorExtensions key emits warning but exits 0 without --strict
    Given vendorExtensions contains an unknown vendor key "acme"
    When I run "universal-plugin validate"
    Then the exit code is 0
    And stderr contains "Unknown vendor"

  Scenario: --strict promotes warnings to errors
    Given vendorExtensions contains an unknown vendor key "acme"
    When I run "universal-plugin validate --strict"
    Then the exit code is 1
    And stderr contains "Unknown vendor"

  Scenario: --format json returns structured output
    Given the manifest is missing the required "name" field
    When I run "universal-plugin validate --format json"
    Then the exit code is 1
    And stdout is valid JSON with "valid" equal to false
    And stdout JSON contains a "schemaViolations" array with at least one entry

  Scenario: --format json valid manifest
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin validate --format json"
    Then the exit code is 0
    And stdout is valid JSON with "valid" equal to true
    And stdout JSON contains empty "schemaViolations" and "vendorViolations" arrays
