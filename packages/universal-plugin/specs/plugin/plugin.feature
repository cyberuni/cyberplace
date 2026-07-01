Feature: add plugin

  Background:
    Given a project root with a ".agents/universal-plugin-lock.json"

  Scenario: installs plugin from GitHub repo
    Given "myorg/my-plugin" is a valid plugin repo
    When I run "universal-plugin add myorg/my-plugin --yes --root <root>"
    Then the exit code is 0
    And the plugin "my-plugin" is recorded in the lock file

  Scenario: installs specific plugin from repo by name
    When I run "universal-plugin add myorg/my-plugin:lint-plugin --yes --root <root>"
    Then the exit code is 0
    And the plugin "lint-plugin" is recorded in the lock file

  Scenario: installs plugin from npm package
    When I run "universal-plugin add @myorg/my-plugin --yes --root <root>"
    Then the exit code is 0
    And the plugin "@myorg/my-plugin" is recorded in the lock file

  Scenario: --global installs to user scope
    When I run "universal-plugin add myorg/my-plugin --global --yes --root <root>"
    Then the plugin is recorded in "~/.agents/universal-plugin-lock.json"
    And NOT in the project lock file

  Scenario: --branch fetches from a specific branch
    When I run "universal-plugin add myorg/my-plugin --branch dev --yes --root <root>"
    Then the lock file records source branch "dev" for the installed plugin

  Scenario: repo not found exits 1
    Given "myorg/nonexistent" does not exist on GitHub
    When I run "universal-plugin add myorg/nonexistent --yes --root <root>"
    Then the exit code is 1
    And stderr contains "not found"

  Scenario: --format json suppresses prompts and returns result
    When I run "universal-plugin add myorg/my-plugin --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with an "installed" array


Feature: remove plugin

  Background:
    Given a project root with "my-plugin" installed in the lock file

  Scenario: removes installed plugin by name
    When I run "universal-plugin remove my-plugin --root <root>"
    Then the exit code is 0
    And the plugin "my-plugin" is removed from the lock file

  Scenario: --global removes from user scope
    Given "my-plugin" is installed in the global lock file
    When I run "universal-plugin remove my-plugin --global --root <root>"
    Then the plugin is removed from "~/.agents/universal-plugin-lock.json"

  Scenario: plugin not found exits 1
    When I run "universal-plugin remove unknown-plugin --root <root>"
    Then the exit code is 1
    And stderr contains "not found"

  Scenario: --format json suppresses prompts and returns result
    When I run "universal-plugin remove my-plugin --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON


Feature: update plugin

  Background:
    Given a project root with "my-plugin" installed in the lock file

  Scenario: updates a named plugin
    When I run "universal-plugin update my-plugin --root <root>"
    Then the exit code is 0
    And stdout contains "my-plugin"

  Scenario: updates all plugins when name omitted
    Given "plugin-a" and "plugin-b" are installed
    When I run "universal-plugin update --root <root>"
    Then the exit code is 0
    And stdout mentions "plugin-a" and "plugin-b"

  Scenario: plugin not found exits 1
    When I run "universal-plugin update unknown-plugin --root <root>"
    Then the exit code is 1
    And stderr contains "not found"


Feature: find plugin

  Background:
    Given a project root with configured registries

  Scenario: returns matching local plugins
    Given the local registry contains a plugin named "markdown-lint"
    When I run "universal-plugin find markdown --root <root>"
    Then the exit code is 0
    And stdout contains "markdown-lint"

  Scenario: no query returns all available plugins
    When I run "universal-plugin find --root <root>"
    Then the exit code is 0

  Scenario: --limit caps results
    Given the local registry contains 20 plugins
    When I run "universal-plugin find --limit 5 --root <root>"
    Then stdout contains at most 5 results

  Scenario: --offset skips first N results
    Given the local registry contains 10 plugins in alphabetical order
    When I run "universal-plugin find --limit 5 --offset 5 --root <root>"
    Then stdout contains results 6 through 10

  Scenario: --in searches a specific repo
    When I run "universal-plugin find --in myorg/my-plugins --root <root>"
    Then results are limited to "myorg/my-plugins"

  Scenario: no match returns empty result and exits 0
    When I run "universal-plugin find zzznomatch --root <root>"
    Then the exit code is 0
    And stdout contains "(none)" or an empty list

  Scenario: --format json returns structured results
    When I run "universal-plugin find --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with an "items" array


Feature: search plugin

  Background:
    Given the marketplace registry is reachable

  Scenario: returns matching remote plugins
    When I run "universal-plugin search markdown"
    Then the exit code is 0
    And stdout contains at least one result matching "markdown"

  Scenario: --limit caps results
    When I run "universal-plugin search markdown --limit 3"
    Then stdout contains at most 3 results

  Scenario: --offset skips first N results
    When I run "universal-plugin search markdown --limit 5 --offset 5"
    Then results begin from the sixth match

  Scenario: --registry uses a custom registry
    When I run "universal-plugin search foo --registry https://my-registry.example.com"
    Then the search targets "https://my-registry.example.com"

  Scenario: registry unreachable exits 0 with empty results
    Given the marketplace registry is unreachable
    When I run "universal-plugin search anything"
    Then the exit code is 0
    And stdout contains "(none)" or an empty list

  Scenario: --format json returns structured results
    When I run "universal-plugin search markdown --format json"
    Then stdout is valid JSON with an "items" array
    And stdout JSON includes "total", "offset", and "limit" fields


Feature: list plugins

  Background:
    Given a project root with "plugin-a" and "plugin-b" installed in the lock file

  Scenario: lists installed plugins
    When I run "universal-plugin list --root <root>"
    Then the exit code is 0
    And stdout contains "plugin-a"
    And stdout contains "plugin-b"

  Scenario: --global lists user-scope plugins
    Given "plugin-g" is installed in the global lock file
    When I run "universal-plugin list --global --root <root>"
    Then stdout contains "plugin-g"
    And stdout does NOT contain "plugin-a"

  Scenario: no plugins installed
    Given the lock file is empty
    When I run "universal-plugin list --root <root>"
    Then the exit code is 0
    And stdout contains "(none)"

  Scenario: --format json returns array of entries
    When I run "universal-plugin list --format json --root <root>"
    Then the exit code is 0
    And stdout is a JSON array where each entry has "name" and "source"


Feature: migrate plugin lock file

  Background:
    Given a project root with an older lock file format at "skills-lock.json"

  Scenario: migrates to current format
    When I run "universal-plugin migrate --root <root>"
    Then the exit code is 0
    And ".agents/universal-plugin-lock.json" is written
    And stdout contains the number of migrated entries

  Scenario: --dry-run previews without writing
    When I run "universal-plugin migrate --dry-run --root <root>"
    Then the exit code is 0
    And ".agents/universal-plugin-lock.json" is NOT written
    And stdout contains "(dry-run)"

  Scenario: source not found exits 1
    Given no legacy lock file exists
    When I run "universal-plugin migrate --root <root>"
    Then the exit code is 1
    And stderr contains "not found"

  Scenario: --format json returns migration summary
    When I run "universal-plugin migrate --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with "migratedCount" and "skippedCount"
