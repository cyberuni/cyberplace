@frozen
Feature: plugin build — derive per-vendor manifests

  Background:
    Given a project root with ".plugin/plugin.json"

  # ── Derive vendor manifests ──

  Scenario: builds all declared vendors
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin plugin build"
    Then ".claude-plugin/plugin.json" is written
    And ".cursor-plugin/plugin.json" is written
    And the exit code is 0

  Scenario: vendor-specific fields are merged into output
    Given the manifest has name "my-plugin" and skills "./skills/"
    And vendorExtensions.claude-code has displayName "My Plugin"
    When I run "universal-plugin plugin build"
    Then ".claude-plugin/plugin.json" contains name "my-plugin"
    And ".claude-plugin/plugin.json" contains skills "./skills/"
    And ".claude-plugin/plugin.json" contains displayName "My Plugin"

  Scenario: vendorExtensions and $schema are stripped from output
    Given the manifest has a $schema field and vendorExtensions
    When I run "universal-plugin plugin build"
    Then the output file does not contain "vendorExtensions"
    And the output file does not contain "$schema"

  # ── Vendor filtering ──

  Scenario: --vendor filters to a single vendor
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin plugin build --vendor claude-code"
    Then ".claude-plugin/plugin.json" is written
    And ".cursor-plugin/plugin.json" is NOT written
    And the exit code is 0

  Scenario: --vendor not in vendorExtensions fails
    Given the manifest declares vendorExtensions for "claude-code" only
    When I run "universal-plugin plugin build --vendor cursor"
    Then the exit code is 1
    And stderr contains "not declared in vendorExtensions"

  # ── Warnings, not errors ──

  Scenario: no vendorExtensions declared is a definitive empty state
    Given the manifest has no vendorExtensions field
    When I run "universal-plugin plugin build"
    Then the exit code is 0
    And no output files are written
    And stdout is TOON with zero built rows and the aggregate "built 0"
    And stderr contains "nothing to build"

  Scenario: unknown vendor in vendorExtensions is warned and skipped
    Given vendorExtensions contains an unknown vendor key "acme"
    When I run "universal-plugin plugin build"
    Then the exit code is 0
    And stdout or stderr contains "Unknown vendor"
    And no output file is written for "acme"

  # ── Eager validation ──

  Scenario: missing .plugin/plugin.json fails
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin plugin build"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  Scenario: codex vendor requires description and version
    Given the manifest declares vendorExtensions for "codex"
    And the manifest has no description or version
    When I run "universal-plugin plugin build"
    Then the exit code is 1
    And stderr contains "description is required when targeting codex"
    And stderr contains "version is required when targeting codex"

  # ── Write-control flags ──

  Scenario: --dry-run skips file writes
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin plugin build --dry-run"
    Then the exit code is 0
    And ".claude-plugin/plugin.json" is NOT written

  Scenario: --clean removes existing output before writing
    Given ".claude-plugin/plugin.json" already exists from a previous build
    When I run "universal-plugin plugin build --clean"
    Then ".claude-plugin/plugin.json" is removed and rewritten
    And the exit code is 0

  # ── AXI output contract ──

  Scenario: a successful build prints a TOON result with per-vendor status and aggregate
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin plugin build"
    Then stdout is TOON with one row per vendor carrying "vendor", "path", "status"
    And each row's "status" is "built", "skipped", or "failed"
    And stdout contains the aggregate summary "built 2, skipped 0, failed 0"
    And the exit code is 0

  Scenario: --format json returns a structured build result
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin plugin build --format json"
    Then stdout is JSON with a "built" array
    And stdout contains the summary counts "built", "skipped", "failed"
    And the exit code is 0

  Scenario: --format toon names the default explicitly
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin plugin build --format toon"
    Then stdout is TOON with one row per vendor
    And the exit code is 0

  Scenario: a successful build ends with a next-step suggestion
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin plugin build"
    Then stderr ends with "→ universal-plugin plugin validate"

  Scenario: build never prompts interactively
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin plugin build"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    Given the manifest declares vendorExtensions for "claude-code"
    When I run "universal-plugin plugin build --frobnicate"
    Then the exit code is 1
    And stderr contains "--frobnicate"

  Scenario: --help prints a concise reference
    When I run "universal-plugin plugin build --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
