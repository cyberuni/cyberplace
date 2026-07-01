Feature: register lifecycle hooks

  Background:
    Given a project root with ".plugin/plugin.json"
    And the manifest declares a hook with event "PostInstall" and command "universal-plugin prepare"

  Scenario: registers hook for all declared vendors
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin hook register --root <root>"
    Then the exit code is 0
    And ".claude/settings.json" contains the hook entry for "PostInstall"
    And ".cursor/hooks.json" contains the hook entry for "postInstall"

  Scenario: event name is translated per vendor convention
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin hook register --root <root>"
    Then ".claude/settings.json" uses PascalCase event "PostInstall"
    And ".cursor/hooks.json" uses camelCase event "postInstall"

  Scenario: --vendor limits registration to one runtime
    Given the manifest declares vendorExtensions for "claude-code" and "cursor"
    When I run "universal-plugin hook register --vendor claude-code --root <root>"
    Then ".claude/settings.json" contains the hook entry
    And ".cursor/hooks.json" is NOT modified

  Scenario: --vendor unknown value exits 1
    When I run "universal-plugin hook register --vendor acme --root <root>"
    Then the exit code is 1
    And stderr contains "Unknown vendor"

  Scenario: registration is idempotent — same command not duplicated
    Given ".claude/settings.json" already contains the hook entry for "PostInstall" with command "universal-plugin prepare"
    When I run "universal-plugin hook register --root <root>"
    Then the exit code is 0
    And ".claude/settings.json" contains exactly one entry for "PostInstall"

  Scenario: existing hook with different command is updated
    Given ".claude/settings.json" contains a hook for "PostInstall" with command "old-command"
    When I run "universal-plugin hook register --root <root>"
    Then the exit code is 0
    And ".claude/settings.json" contains "universal-plugin prepare" for "PostInstall"
    And "old-command" is no longer present for "PostInstall"

  Scenario: --dry-run previews without writing
    When I run "universal-plugin hook register --dry-run --root <root>"
    Then the exit code is 0
    And ".claude/settings.json" is NOT modified
    And stdout contains "PostInstall"
    And stdout contains ".claude/settings.json"

  Scenario: missing .plugin/plugin.json exits 1
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin hook register --root <root>"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  Scenario: no hooks declared in manifest exits 0 with warning
    Given the manifest has no "hooks" field
    When I run "universal-plugin hook register --root <root>"
    Then the exit code is 0
    And stdout or stderr contains "no hooks declared"

  Scenario: --format json returns list of registered entries
    When I run "universal-plugin hook register --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with a "registered" array
    And each entry has "vendor", "event", and "file" fields
