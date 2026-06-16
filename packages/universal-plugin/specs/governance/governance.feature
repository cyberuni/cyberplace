Feature: governance show

  Background:
    Given the project root is a temporary directory

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

  Scenario: governance found at user scope only
    Given no governance file exists in "<root>/governances/"
    And a governance file "plugin-design.md" exists in "~/.agents/governances/"
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the user-scope content

  Scenario: governance found at package scope only
    Given no governance file exists at managed, project, or user scope
    And a governance file "plugin-design.md" exists in the package "governances/" directory
    When I run "universal-plugin governance show plugin-design --root <root>"
    Then the exit code is 0
    And stdout contains the package-scope content

  Scenario: governance not found at any scope
    Given no governance file named "missing" exists at any scope
    When I run "universal-plugin governance show missing --root <root>"
    Then the exit code is 1
    And stderr contains 'Governance "missing" not found'

  Scenario: --format json returns structured output
    Given a governance file "test-gov.md" with content "content" exists in "<root>/governances/"
    When I run "universal-plugin governance show test-gov --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with scope "project" and content "content"

Feature: governance list

  Background:
    Given the project root is a temporary directory

  Scenario: package defaults are listed when project root has no governances
    Given no governance files exist at managed, project, or user scope
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout contains "cli-command"
    And stdout contains "package"

  Scenario: governance listed with name and scope
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance list --root <root>"
    Then the exit code is 0
    And stdout contains "plugin-design"
    And stdout contains "project"

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

  Scenario: --format json returns array of entries
    Given a governance file "plugin-design.md" exists in "<root>/governances/"
    When I run "universal-plugin governance list --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array where each entry has "name" and "scope"
