@frozen
Feature: plugin validate — check the canonical manifest

  Background:
    Given a project root with ".plugin/plugin.json"

  # ── Valid + missing manifest ──

  Scenario: valid manifest exits 0 with a definitive clean result
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin plugin validate"
    Then the exit code is 0
    And stdout is a TOON result with "valid" equal to true
    And stdout contains empty "schemaViolations" and "vendorViolations" arrays

  Scenario: missing .plugin/plugin.json fails
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin plugin validate"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  # ── Schema violations ──

  Scenario: schema violation is reported in the default TOON result
    Given the manifest is missing the required "name" field
    When I run "universal-plugin plugin validate"
    Then the exit code is 1
    And stdout is a TOON result with "valid" equal to false
    And stdout contains a schemaViolations row with field "name" and message "required field missing"

  Scenario: all violations are reported together
    Given the manifest is missing "name" and "version"
    When I run "universal-plugin plugin validate"
    Then the exit code is 1
    And stdout contains a schemaViolations row with field "name"
    And stdout contains a schemaViolations row with field "version"
    And stdout carries the aggregate "2 schema violations, 0 vendor violations"

  # ── Vendor rules ──

  Scenario: vendor rule violation is reported
    Given the manifest declares vendorExtensions for "codex"
    And the manifest has no description or version
    When I run "universal-plugin plugin validate"
    Then the exit code is 1
    And stdout contains a vendorViolations row with message "description is required when targeting codex"
    And stdout contains a vendorViolations row with message "version is required when targeting codex"

  Scenario: --vendor limits vendor rule checks to one vendor
    Given the manifest declares vendorExtensions for "codex" and "cursor"
    And the manifest has no description or version
    When I run "universal-plugin plugin validate --vendor cursor"
    Then the exit code is 0
    And stdout is a TOON result with "valid" equal to true

  Scenario: --vendor unknown value fails
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin plugin validate --vendor acme"
    Then the exit code is 1
    And stderr contains "Unknown vendor"

  # ── Unknown vendor keys + --strict ──

  Scenario: unknown vendorExtensions key emits warning but exits 0 without --strict
    Given vendorExtensions contains an unknown vendor key "acme"
    When I run "universal-plugin plugin validate"
    Then the exit code is 0
    And stdout is a TOON result with "valid" equal to true
    And stderr contains "Unknown vendor"

  Scenario: --strict promotes warnings to errors
    Given vendorExtensions contains an unknown vendor key "acme"
    When I run "universal-plugin plugin validate --strict"
    Then the exit code is 1
    And stdout is a TOON result with "valid" equal to false
    And stdout contains a vendorViolations row for the unknown vendor "acme"
    And stderr contains "Unknown vendor"

  # ── JSON output (escape hatch) ──

  Scenario: --format json returns structured output
    Given the manifest is missing the required "name" field
    When I run "universal-plugin plugin validate --format json"
    Then the exit code is 1
    And stdout is valid JSON with "valid" equal to false
    And stdout JSON contains a "schemaViolations" array with at least one entry

  Scenario: --format json valid manifest
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin plugin validate --format json"
    Then the exit code is 0
    And stdout is valid JSON with "valid" equal to true
    And stdout JSON contains empty "schemaViolations" and "vendorViolations" arrays

  # ── Truncation + --full ──

  Scenario: default output truncates a large violation list
    Given the manifest has 50 schema violations
    When I run "universal-plugin plugin validate"
    Then the exit code is 1
    And stdout lists a truncated set of schemaViolations rows
    And stdout ends with a truncation hint matching "… +N more — rerun with --full"

  Scenario: --format json is never truncated
    Given the manifest has 50 schema violations
    When I run "universal-plugin plugin validate --format json"
    Then stdout JSON contains a "schemaViolations" array with 50 entries

  Scenario: --full suppresses truncation
    Given the manifest has 50 schema violations
    When I run "universal-plugin plugin validate --full"
    Then stdout lists all 50 schemaViolations rows
    And stdout contains no truncation hint

  # ── Next-step suggestions ──

  Scenario: passing validate suggests the next command
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin plugin validate"
    Then the exit code is 0
    And stderr ends with "→ universal-plugin plugin build"

  Scenario: failing validate suggests a fix
    Given the manifest is missing the required "name" field
    When I run "universal-plugin plugin validate"
    Then the exit code is 1
    And stderr ends with a fix hint referencing "name"

  # ── Content-first plugin group ──

  Scenario: bare "plugin" command runs validate on the current project
    Given the manifest is a valid canonical plugin.json
    And the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin plugin"
    Then the exit code is 0
    And stdout is a TOON result with "valid" equal to true
    And stdout reports the declared vendors "claude-code" and "cursor"

  # ── Non-interactive + fail-loud unknown flag ──

  Scenario: validate never prompts interactively
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin plugin validate"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: unknown flag fails loud
    Given the manifest is a valid canonical plugin.json
    When I run "universal-plugin plugin validate --frobnicate"
    Then the exit code is 1
    And stderr names the unknown flag "--frobnicate"

  # ── Help ──

  Scenario: --help prints a concise reference
    When I run "universal-plugin plugin validate --help"
    Then the exit code is 0
    And stdout contains a synopsis, the available flags, and one example
