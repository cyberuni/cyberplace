Feature: marketplace publish

  Background:
    Given a project root with a valid ".plugin/plugin.json"
    And the user is authenticated with the marketplace registry

  Scenario: publishes valid plugin
    When I run "universal-plugin marketplace publish --root <root>"
    Then the exit code is 0
    And stdout contains the published plugin URL

  Scenario: validates manifest before uploading
    Given the manifest is missing the required "name" field
    When I run "universal-plugin marketplace publish --root <root>"
    Then the exit code is 1
    And stderr contains "name"
    And no upload is made

  Scenario: --dry-run validates without uploading
    When I run "universal-plugin marketplace publish --dry-run --root <root>"
    Then the exit code is 0
    And no upload is made
    And stdout contains "dry-run"

  Scenario: missing auth token in non-interactive mode exits 1
    Given no auth token is present in env or "~/.agents/universal-plugin-auth.json"
    When I run "universal-plugin marketplace publish --format json --root <root>"
    Then the exit code is 1
    And stderr contains "authentication required"

  Scenario: --registry targets a custom registry
    When I run "universal-plugin marketplace publish --registry https://my-registry.example.com --root <root>"
    Then the upload targets "https://my-registry.example.com"

  Scenario: --format json returns structured result
    When I run "universal-plugin marketplace publish --format json --root <root>"
    Then the exit code is 0
    And stdout is valid JSON with "name", "version", and "url" fields


Feature: marketplace register

  Background:
    Given the user is authenticated with the marketplace registry

  Scenario: registers an npm package in the marketplace index
    Given "@myorg/my-plugin" is publicly accessible on npm
    When I run "universal-plugin marketplace register @myorg/my-plugin"
    Then the exit code is 0
    And stdout contains the registered plugin URL

  Scenario: registers a GitHub repo in the marketplace index
    Given "myorg/my-plugin" is a publicly accessible GitHub repo
    When I run "universal-plugin marketplace register myorg/my-plugin"
    Then the exit code is 0
    And stdout contains the registered plugin URL

  Scenario: package not publicly accessible exits 1
    Given "@myorg/private-plugin" is not publicly accessible
    When I run "universal-plugin marketplace register @myorg/private-plugin"
    Then the exit code is 1
    And stderr contains "not found" or "not accessible"

  Scenario: --dry-run checks accessibility without modifying the index
    Given "@myorg/my-plugin" is publicly accessible on npm
    When I run "universal-plugin marketplace register @myorg/my-plugin --dry-run"
    Then the exit code is 0
    And the marketplace index is NOT modified
    And stdout contains "dry-run"

  Scenario: missing auth token in non-interactive mode exits 1
    Given no auth token is present in env or "~/.agents/universal-plugin-auth.json"
    When I run "universal-plugin marketplace register @myorg/my-plugin --format json"
    Then the exit code is 1
    And stderr contains "authentication required"

  Scenario: --registry targets a custom registry
    When I run "universal-plugin marketplace register @myorg/my-plugin --registry https://my-registry.example.com"
    Then the registration targets "https://my-registry.example.com"

  Scenario: --format json returns structured result
    Given "@myorg/my-plugin" is publicly accessible on npm
    When I run "universal-plugin marketplace register @myorg/my-plugin --format json"
    Then the exit code is 0
    And stdout is valid JSON with "name", "version", and "url" fields
