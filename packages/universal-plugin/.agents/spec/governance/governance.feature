@frozen
Feature: governance — resolve documents by name
  universal-plugin governance show <name> resolves a governance document by name across a fixed scope
  precedence (managed → project → local → user → package for a plain name, plus a store scope for a
  namespaced <plugin>/<asset> lookup), and governance list enumerates the resolvable documents by
  name and winning scope. Output follows the AXI contract: TOON by default with pre-computed
  aggregates, truncation with --full for large documents, definitive empty states, content-first
  bare invocation, next-step suggestions, and fail-loud unknown flags. Authoring, editing, and
  installing governance are out of scope.

  Background:
    Given the project root is a temporary directory

  # ── show: scope precedence (plain name) ──

  Scenario: managed scope wins over every other scope
    Given a governance file "plugin-design.md" exists at the managed scope
    And a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the managed-scope content

  Scenario: governance found at project scope
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the content of "plugin-design.md"

  Scenario: project scope wins over user scope
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    And a governance file "plugin-design.md" exists in "~/.agents/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the project-scope content

  Scenario: local scope wins over user scope
    Given a governance file "shared.md" exists in "<root>/.agents/governances/"
    And a governance file "shared.md" exists in "~/.agents/governances/"
    When I run "universal-plugin governance show shared --root <root>"
    Then the exit code is 0
    And stdout contains the local-scope content

  Scenario: governance found at local scope only
    Given no governance file exists in "<root>/governances/"
    And a governance file "local-only.md" exists in "<root>/.agents/governances/"
    When I run "universal-plugin governance show local-only --root <root>"
    Then the exit code is 0
    And stdout contains the local-scope content

  Scenario: governance found at user scope only
    Given no governance file exists in "<root>/governances/" or "<root>/.agents/governances/"
    And a governance file "plugin-design.md" exists in "~/.agents/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the user-scope content

  Scenario: governance found at package scope only
    Given no governance file exists at managed, project, local, or user scope
    And a governance file "plugin-design.md" exists in the package "governances/" directory
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the package-scope content

  # ── show: namespaced (asset-store) ──

  Scenario: namespaced name resolves from the asset-store
    Given no override governance file exists at managed, project, or user scope for "acme/policy"
    And the plugin "acme" is installed in the asset-store with a governance "policy.md"
    When I run "universal-plugin governance show acme/policy --root <root>"
    Then the exit code is 0
    And stdout contains the store-scope content

  Scenario: namespaced override wins over the asset-store
    Given a governance file "policy.md" exists in "<root>/governances/acme/"
    And the plugin "acme" is also installed in the asset-store with a governance "policy.md"
    When I run "universal-plugin governance show acme/policy --root <root>"
    Then the exit code is 0
    And stdout contains the project-scope content

  # ── show: not found + JSON ──

  Scenario: governance not found at any scope
    Given no governance file named "missing" exists at any scope
    When I run "universal-plugin governance show missing --root <root>"
    Then the exit code is 1
    And stderr contains 'Governance "missing" not found'

  Scenario: show --format json returns structured output
    Given a governance file "test-gov.md" with content "content" exists in "<root>/governances/"
    When I run "universal-plugin governance show test-gov --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with scope "project" and content "content"

  # ── list: enumerate by name and scope ──

  Scenario: package defaults are listed when project root has no governances
    Given no governance files exist at managed, project, local, or user scope
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout is TOON containing a row with name "plugin-design" and scope "package"

  Scenario: governance listed with name and scope
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout is TOON containing a row with name "plugin-design" and scope "project"

  Scenario: de-duplicates by name, highest scope wins
    Given a governance file "shared.md" exists in "<root>/governances/"
    And a governance file "shared.md" exists in "~/.agents/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout contains "shared" exactly once
    And the scope shown is "project"

  Scenario: results sorted alphabetically
    Given governance files "zzz.md" and "aaa.md" exist in "~/.agents/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout lists "aaa" before "zzz"

  # ── list: JSON output ──

  Scenario: list --format json returns array of entries
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance list --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array where each entry has "name" and "scope"

  # ── AXI: list TOON default + aggregate (#1,#2,#4) ──

  Scenario: list prints a TOON result with a pre-computed aggregate
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    And a governance file "shared.md" exists in "~/.agents/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then stdout is TOON with rows carrying "name" and "scope"
    And stdout contains the aggregate summary "2 governances across 2 scopes"
    And the exit code is 0

  # ── AXI: show truncation + --full (#3) ──

  Scenario: show truncates a large document body with a size hint
    Given a governance file "huge.md" with 400 lines of content exists in "<root>/governances/"
    When I run "universal-plugin governance show huge --root <root>"
    Then the exit code is 0
    And stdout is truncated with a size hint matching "… +\d+ lines — rerun with --full"

  Scenario: show --full prints the whole document body untruncated
    Given a governance file "huge.md" with 400 lines of content exists in "<root>/governances/"
    When I run "universal-plugin governance show huge --full --root <root>"
    Then the exit code is 0
    And stdout contains all 400 lines of "huge.md"

  Scenario: a small document is never truncated
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the full content of "plugin-design.md"
    And stdout does not contain "rerun with --full"

  Scenario: show --format json is never truncated
    Given a governance file "huge.md" with 400 lines of content exists in "<root>/governances/"
    When I run "universal-plugin governance show huge --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON containing all 400 lines of "huge.md" in "content"

  # ── AXI: definitive empty state (#5) ──

  Scenario: list is a definitive empty state when nothing resolves at any scope
    Given no governance files exist at managed, project, local, user, or package scope
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout contains "0 governances found"

  # ── AXI: content-first (#8) ──

  Scenario: bare governance with no subcommand runs list
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance --root <root>"
    Then the exit code is 0
    And stdout is the same TOON result as "universal-plugin governance list --root <root>"

  # ── AXI: next-step suggestions (#9) ──

  Scenario: show ends with a next-step suggestion
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then stderr ends with "→ universal-plugin governance list"

  Scenario: list ends with a next-step suggestion
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then stderr ends with "→ universal-plugin governance show <name>"

  # ── AXI: non-interactive, fail-loud (#6) ──

  Scenario: governance commands never prompt interactively
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance show plugin-design --frobnicate --root <root>"
    Then the exit code is 1
    And stderr contains "--frobnicate"

  # ── AXI: help (#10) ──

  Scenario: governance --help prints a concise reference
    When I run "universal-plugin governance --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example

  Scenario: governance show --help prints a concise reference
    When I run "universal-plugin governance show --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
