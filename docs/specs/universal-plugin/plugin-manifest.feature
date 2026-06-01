Feature: Plugin manifest validation
  The canonical plugin manifest at .plugin/plugin.json defines a plugin's identity and
  declares the paths to all component directories. A conformant plugin validator checks
  this file for structural correctness before any vendor derivation or installation occurs.

  The system under test is any conformant plugin validator (e.g., `cyber-skills plugin validate`).

  # --- Name validation ---

  Scenario: Minimal valid manifest with name only
    Given a plugin directory
    When ".plugin/plugin.json" contains '{ "name": "my-plugin" }'
    Then validation passes with no errors

  Scenario Outline: Valid name formats are accepted
    Given a plugin directory
    When ".plugin/plugin.json" has "name" set to "<name>"
    Then validation passes with no errors

    Examples:
      | name            |
      | my-plugin       |
      | plugin123       |
      | a               |
      | my.plugin       |
      | abc-def-ghi     |
      | a1b2c3          |
      | my-plugin.v2    |

  Scenario Outline: Invalid name formats are rejected
    Given a plugin directory
    When ".plugin/plugin.json" has "name" set to "<name>"
    Then validation fails
    And the error references the "name" field

    Examples:
      | name           | reason                              |
      | My-Plugin      | uppercase letter not allowed        |
      | my_plugin      | underscore not allowed              |
      | -my-plugin     | starts with hyphen                  |
      | my-plugin-     | ends with hyphen                    |
      | .my-plugin     | starts with period                  |
      | my-plugin.     | ends with period                    |
      | my--plugin     | consecutive hyphens                 |
      | my..plugin     | consecutive periods                 |
      | my plugin      | space not allowed                   |
      | MY_PLUGIN      | uppercase and underscore            |

  Scenario: Name exceeding 64 characters is rejected
    Given a plugin directory
    When ".plugin/plugin.json" has "name" set to a 65-character lowercase string
    Then validation fails
    And the error states the name exceeds the 64-character limit

  Scenario: Name of exactly 64 characters is accepted
    Given a plugin directory
    When ".plugin/plugin.json" has "name" set to a 64-character lowercase string
    Then validation passes with no errors

  Scenario: Missing name field fails validation
    Given a plugin directory
    When ".plugin/plugin.json" contains '{ "version": "1.0.0" }'
    Then validation fails
    And the error states "name is required"

  Scenario: Empty name string fails validation
    Given a plugin directory
    When ".plugin/plugin.json" has "name" set to ""
    Then validation fails
    And the error references the "name" field

  # --- Version validation ---

  Scenario Outline: Valid semver versions are accepted
    Given a canonical manifest with name "my-plugin"
    When "version" is set to "<version>"
    Then validation passes with no errors

    Examples:
      | version         |
      | 1.0.0           |
      | 0.1.0           |
      | 1.0.0-alpha.1   |
      | 1.0.0-beta.2    |
      | 1.0.0+build.1   |
      | 2.3.4-rc.1      |

  Scenario Outline: Invalid version formats are rejected
    Given a canonical manifest with name "my-plugin"
    When "version" is set to "<version>"
    Then validation fails
    And the error references the "version" field format

    Examples:
      | version   | reason                        |
      | 1.0       | missing patch component       |
      | 1         | missing minor and patch       |
      | v1.0.0    | v prefix not in semver        |
      | 1.0.0.0   | four components not semver    |
      | latest    | not a semver string           |

  # --- Description validation ---

  Scenario: Description of exactly 1024 characters is accepted
    Given a canonical manifest with name "my-plugin"
    When "description" is a string of exactly 1024 characters
    Then validation passes with no errors

  Scenario: Description exceeding 1024 characters is rejected
    Given a canonical manifest with name "my-plugin"
    When "description" is a string of 1025 characters
    Then validation fails
    And the error states the description exceeds the 1024-character limit

  # --- Component path validation ---

  Scenario Outline: Component paths must start with ./
    Given a canonical manifest with name "my-plugin"
    When "<field>" is set to "<path>"
    Then validation fails
    And the error states that paths must start with "./"

    Examples:
      | field      | path       |
      | skills     | skills/    |
      | mcpServers | .mcp.json  |
      | commands   | commands   |
      | agents     | agents/    |
      | rules      | rules/     |
      | hooks      | hooks.json |

  Scenario Outline: Parent traversal in component paths is rejected
    Given a canonical manifest with name "my-plugin"
    When "<field>" is set to "../<path>"
    Then validation fails
    And the error states "path traversal not allowed"

    Examples:
      | field    | path            |
      | skills   | other/skills/   |
      | commands | shared/commands |
      | agents   | lib/agents/     |

  Scenario: Skills as a string path is valid
    Given a canonical manifest with name "my-plugin"
    When "skills" is set to "./skills/"
    Then validation passes with no errors

  Scenario: Skills as an array of paths is valid
    Given a canonical manifest with name "my-plugin"
    When "skills" is set to '["./skills-a/", "./skills-b/"]'
    Then validation passes with no errors

  Scenario: Skills as a paths object is valid
    Given a canonical manifest with name "my-plugin"
    When "skills" is set to '{ "paths": ["./primary/", "./extra/"] }'
    Then validation passes with no errors

  Scenario: Skills array with invalid path fails
    Given a canonical manifest with name "my-plugin"
    When "skills" is set to '["./skills/", "skills-b/"]'
    Then validation fails
    And the error identifies "skills-b/" as missing the "./" prefix

  # --- JSON structure ---

  Scenario: Malformed JSON fails with a parse error
    Given a plugin directory
    When ".plugin/plugin.json" contains "{ name: my-plugin }" (invalid JSON)
    Then validation fails
    And the error states a JSON parse failure

  Scenario: Empty file fails with a parse error
    Given a plugin directory
    When ".plugin/plugin.json" is an empty file
    Then validation fails
    And the error states a JSON parse failure

  Scenario: Empty JSON object fails because name is missing
    Given a plugin directory
    When ".plugin/plugin.json" contains '{}'
    Then validation fails
    And the error states "name is required"

  # --- Forward compatibility ---

  Scenario: Unrecognized fields are permitted with a warning
    Given a canonical manifest with name "my-plugin"
    When ".plugin/plugin.json" contains an unrecognized field "futureComponent"
    Then validation passes
    And validation emits a warning about the unrecognized field "futureComponent"

  # --- Manifest presence ---

  Scenario: Plugin with no manifest passes Claude Code validation (auto-discovery)
    Given a plugin directory with no ".plugin/plugin.json"
    And the directory contains "skills/my-skill/SKILL.md"
    When Claude Code component validation runs
    Then validation passes
    And validation notes that Claude Code auto-discovers components without a manifest

  Scenario: Plugin with no manifest fails Cursor validation
    Given a plugin directory with no ".cursor-plugin/plugin.json"
    When Cursor component validation runs
    Then validation fails
    And the error states that Cursor requires ".cursor-plugin/plugin.json"

  Scenario: Plugin with no manifest fails Codex validation
    Given a plugin directory with no ".codex-plugin/plugin.json"
    When Codex component validation runs
    Then validation fails
    And the error states that Codex requires ".codex-plugin/plugin.json"
