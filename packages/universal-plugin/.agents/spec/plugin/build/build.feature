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

  # ── Pin resolution ──

  Scenario: build resolves and pins the CLIs a skill references
    Given the manifest declares vendorExtensions for "claude-code"
    And a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry's latest "cyberplace" within major 1 is "1.4.2"
    When I run "universal-plugin plugin build"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.4.2"
    And ".claude-plugin/plugin.json" is written
    And the exit code is 0

  Scenario: a newer major is not crossed by default
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry has "cyberplace" versions "1.4.2" and "2.0.0"
    When I run "universal-plugin plugin build"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.4.2"
    And "skills/x/SKILL.md" does not contain "npx cyberplace@2.0.0"

  Scenario: --allow-major crosses the major boundary
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry has "cyberplace" versions "1.4.2" and "2.0.0"
    When I run "universal-plugin plugin build --allow-major"
    Then "skills/x/SKILL.md" contains "npx cyberplace@2.0.0"
    And the exit code is 0

  Scenario: a placeholder pin resolves to the absolute latest
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@<version>"
    And the registry's latest "cyberplace" is "2.0.0"
    When I run "universal-plugin plugin build"
    Then "skills/x/SKILL.md" contains "npx cyberplace@2.0.0"
    And the exit code is 0

  Scenario Outline: --range styles the written pin
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry's latest "cyberplace" within major 1 is "1.4.2"
    When I run "universal-plugin plugin build --range <style>"
    Then "skills/x/SKILL.md" contains "npx cyberplace@<written>"
    And the exit code is 0

    Examples:
      | style | written |
      | exact | 1.4.2   |
      | tilde | ~1.4.2  |
      | caret | ^1.4.2  |
      | ~     | ~1.4.2  |
      | ^     | ^1.4.2  |

  Scenario: --registry overrides the registry queried
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And a custom registry at "https://npm.example.com" serves "cyberplace" latest "1.9.0" within major 1
    When I run "universal-plugin plugin build --registry https://npm.example.com"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.9.0"
    And the exit code is 0

  Scenario: --package limits resolution to the named CLIs
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0" and "npx cyberfleet@1.0.0"
    And the registry's latest within major 1 is "cyberplace" "1.4.2" and "cyberfleet" "1.3.0"
    When I run "universal-plugin plugin build --package cyberplace"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.4.2"
    And "skills/x/SKILL.md" contains "npx cyberfleet@1.0.0"

  Scenario: --package composes across repeated flags
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0", "npx cyberfleet@1.0.0", and "npx universal-plugin@0.1.0"
    And the registry's latest within major is "cyberplace" "1.4.2", "cyberfleet" "1.3.0", and "universal-plugin" "0.2.0"
    When I run "universal-plugin plugin build --package cyberplace --package cyberfleet"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.4.2"
    And "skills/x/SKILL.md" contains "npx cyberfleet@1.3.0"
    And "skills/x/SKILL.md" contains "npx universal-plugin@0.1.0"
    And the exit code is 0

  Scenario: --skip-pins leaves pins untouched but still builds manifests
    Given the manifest declares vendorExtensions for "claude-code"
    And a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    When I run "universal-plugin plugin build --skip-pins"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And ".claude-plugin/plugin.json" is written
    And the exit code is 0

  Scenario: pin rewriting is idempotent
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.4.2"
    And the registry's latest "cyberplace" within major 1 is "1.4.2"
    When I run "universal-plugin plugin build"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.4.2"
    And stdout is TOON with a pins row for "cyberplace" whose "status" is "unchanged"
    And the exit code is 0

  Scenario: a registry failure warns and skips that package, build still succeeds
    Given the manifest declares vendorExtensions for "claude-code"
    And a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry is unreachable
    When I run "universal-plugin plugin build"
    Then the exit code is 0
    And ".claude-plugin/plugin.json" is written
    And "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And stderr contains "cyberplace"
    And stdout is TOON with a pins row for "cyberplace" whose "status" is "skipped"

  Scenario: an unresolvable package warns and skips, build still succeeds
    Given the manifest declares vendorExtensions for "claude-code"
    And a skill "skills/x/SKILL.md" contains "npx no-such-pkg@1.0.0"
    And the registry returns not-found for "no-such-pkg"
    When I run "universal-plugin plugin build"
    Then the exit code is 0
    And ".claude-plugin/plugin.json" is written
    And "skills/x/SKILL.md" contains "npx no-such-pkg@1.0.0"
    And stderr contains "no-such-pkg"
    And stdout is TOON with a pins row for "no-such-pkg" whose "status" is "skipped"

  Scenario: a package with no newer version in the current major is left unchanged
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry has "cyberplace" versions "1.2.0" and "2.0.0"
    When I run "universal-plugin plugin build"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And stdout is TOON with a pins row for "cyberplace" whose "status" is "unchanged"
    And the exit code is 0

  # ── Pin resolution: AXI output ──

  Scenario: --dry-run reports resolved pins without writing them
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry's latest "cyberplace" within major 1 is "1.4.2"
    When I run "universal-plugin plugin build --dry-run"
    Then "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And stdout is TOON with a pins row carrying "package" "cyberplace", "current" "1.2.0", "resolved" "1.4.2"
    And the exit code is 0

  Scenario: a build with pins prints TOON pins rows and a pre-computed aggregate
    Given the manifest declares vendorExtensions for "claude-code"
    And a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0" and "npx cyberfleet@1.0.0"
    And the registry's latest within major 1 is "cyberplace" "1.4.2" and "cyberfleet" "1.3.0"
    When I run "universal-plugin plugin build"
    Then stdout is TOON with one pins row per package carrying "package", "current", "resolved", "status"
    And each pins row's "status" is "updated", "unchanged", or "skipped"
    And stdout contains the aggregate summary "pinned 2, unchanged 0, skipped 0"
    And the exit code is 0

  Scenario: --format json includes a pins array
    Given a skill "skills/x/SKILL.md" contains "npx cyberplace@1.2.0"
    And the registry's latest "cyberplace" within major 1 is "1.4.2"
    When I run "universal-plugin plugin build --format json"
    Then stdout is JSON with a "pins" array
    And a pins entry has "package" "cyberplace" and "resolved" "1.4.2"
    And the exit code is 0

  Scenario: a large pins list truncates with a size hint
    Given the skills reference 40 distinct pinned CLIs the registry resolves
    When I run "universal-plugin plugin build --dry-run"
    Then stdout lists a truncated set of pins rows
    And stdout ends with a truncation hint matching "… +\d+ more — rerun with --full"
    And the exit code is 0

  Scenario: --full suppresses pins truncation
    Given the skills reference 40 distinct pinned CLIs the registry resolves
    When I run "universal-plugin plugin build --dry-run --full"
    Then stdout lists all 40 pins rows
    And the exit code is 0

  Scenario: no pins to resolve is a definitive empty state
    Given the manifest declares vendorExtensions for "claude-code"
    And no skill references an "npx <pkg>@<pin>" reference
    When I run "universal-plugin plugin build"
    Then the exit code is 0
    And stdout contains the aggregate summary "pinned 0"

  Scenario: --help documents the pin-resolution flags
    When I run "universal-plugin plugin build --help"
    Then the exit code is 0
    And stdout mentions "--registry", "--range", and "--skip-pins"
