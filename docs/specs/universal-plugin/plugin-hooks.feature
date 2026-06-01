Feature: Hook configuration rules
  Plugin hooks connect to agent lifecycle events. The three vendors use incompatible
  hook file schemas, requiring separate files per vendor pointing to a shared
  implementation script.

  The system under test is any conformant plugin validator or generator.

  # --- File separation requirement ---

  Scenario: Plugin with hooks requires separate files for Claude Code and Codex
    Given a plugin with hook behavior
    When the plugin structure is validated for multi-vendor support
    Then "hooks/hooks.json" exists for Claude Code
    And "hooks/codex-hooks.json" exists for Codex

  Scenario: A single hooks.json cannot serve both Claude Code and Codex
    Given a plugin with only "hooks/hooks.json" using PascalCase event names
    When Codex hook validation runs
    Then validation warns that a separate "hooks/codex-hooks.json" is needed for Codex compatibility

  Scenario: Cursor hooks are registered at project root, not inside the plugin
    Given a plugin with hooks
    When the plugin structure is validated for Cursor
    Then validation notes that Cursor hooks live at ".cursor/hooks.json" in the project root
    And no hook file inside the plugin directory is treated as a Cursor hook

  # --- Claude Code hook schema ---

  Scenario: Claude Code hooks use PascalCase event names
    Given a plugin with "hooks/hooks.json"
    When the hook file is validated for Claude Code compatibility
    Then all event keys are in PascalCase format

  Scenario: Claude Code hook file does not have a top-level version field
    Given a plugin with "hooks/hooks.json"
    When the hook file is validated for Claude Code compatibility
    Then no top-level "version" field exists in the file

  Scenario: Claude Code hook file uses "hooks" as the top-level event container
    Given a plugin with "hooks/hooks.json"
    When the hook file is validated for Claude Code compatibility
    Then all event handlers are nested under a top-level "hooks" object

  Scenario: Claude Code hook file may include an optional description field
    Given "hooks/hooks.json" contains a top-level "description" field
    When the hook file is validated for Claude Code compatibility
    Then validation passes

  Scenario Outline: Supported Claude Code hook events are valid
    Given "hooks/hooks.json" contains a handler for event "<event>"
    When validated for Claude Code
    Then validation passes

    Examples:
      | event               |
      | PreToolUse          |
      | PostToolUse         |
      | PostToolUseFailure  |
      | SessionStart        |
      | SessionEnd          |
      | Stop                |
      | UserPromptSubmit    |

  # --- Codex hook schema ---

  Scenario: Codex hooks use camelCase event names
    Given a plugin with "hooks/codex-hooks.json"
    When the hook file is validated for Codex compatibility
    Then all event keys are in camelCase format

  Scenario: Codex hook file does not have a top-level version field
    Given a plugin with "hooks/codex-hooks.json"
    When the hook file is validated for Codex compatibility
    Then no top-level "version" field exists in the file

  Scenario: Codex hook file places event handlers at the top level
    Given a plugin with "hooks/codex-hooks.json"
    When the hook file is validated for Codex compatibility
    Then event handlers are directly at the top level (not under "hooks")

  Scenario Outline: Supported Codex hook events are valid
    Given "hooks/codex-hooks.json" contains a handler for event "<event>"
    When validated for Codex
    Then validation passes

    Examples:
      | event               |
      | preToolUse          |
      | postToolUse         |
      | postToolUseFailure  |
      | sessionStart        |
      | sessionEnd          |
      | stop                |

  # --- Cursor hook schema ---

  Scenario: Cursor hook file requires top-level version field equal to 1
    Given a project-level Cursor hook file ".cursor/hooks.json"
    When the hook file is validated for Cursor compatibility
    Then the top-level "version" field equals 1

  Scenario: Cursor hook file uses camelCase event names
    Given a project-level Cursor hook file ".cursor/hooks.json"
    When the hook file is validated for Cursor compatibility
    Then all event keys are in camelCase format

  Scenario Outline: Supported Cursor hook events are valid
    Given ".cursor/hooks.json" contains a handler for event "<event>"
    When validated for Cursor
    Then validation passes

    Examples:
      | event                  |
      | preToolUse             |
      | postToolUse            |
      | postToolUseFailure     |
      | sessionStart           |
      | sessionEnd             |
      | stop                   |
      | beforeSubmitPrompt     |
      | subagentStart          |
      | subagentStop           |
      | beforeShellExecution   |
      | afterShellExecution    |
      | afterFileEdit          |
      | preCompact             |

  # --- Shared implementation script ---

  Scenario: All hook config files reference the same implementation script
    Given a plugin with "hooks/impl.sh" as the shared implementation
    When the plugin structure is validated
    Then "hooks/hooks.json" references "hooks/impl.sh"
    And "hooks/codex-hooks.json" references "hooks/impl.sh"

  Scenario: Shared implementation script must be executable
    Given "hooks/impl.sh" exists
    When the plugin structure is validated
    And "hooks/impl.sh" is not executable
    Then validation fails
    And the error states that "hooks/impl.sh" must have executable permissions

  Scenario: Missing implementation script referenced by hook config fails validation
    Given "hooks/hooks.json" references "./hooks/impl.sh"
    And "hooks/impl.sh" does not exist
    When validation runs
    Then validation fails
    And the error states that the referenced script "hooks/impl.sh" does not exist

  # --- Environment variable rules ---

  Scenario: Claude Code hook command uses CLAUDE_PLUGIN_ROOT for script path
    Given "hooks/hooks.json" contains a hook command using "${CLAUDE_PLUGIN_ROOT}/hooks/impl.sh"
    When validation runs for Claude Code compatibility
    Then no path error is raised

  Scenario: Codex hook command uses relative path for script
    Given "hooks/codex-hooks.json" contains a hook command using "./hooks/impl.sh"
    When validation runs for Codex compatibility
    Then no path error is raised

  Scenario: Hardcoded absolute path in hook command triggers a warning
    Given "hooks/hooks.json" contains a hook command using "/usr/local/bin/impl.sh"
    When validation runs
    Then validation warns to use "${CLAUDE_PLUGIN_ROOT}/hooks/impl.sh" instead of an absolute path

  # --- Hook action types ---

  Scenario: Command-type hook is valid for all vendors
    Given a hook entry with "type" set to "command"
    When validated for any vendor
    Then validation passes

  Scenario: Prompt-type hook is valid for Cursor
    Given a Cursor hook entry with "type" set to "prompt"
    When validated for Cursor
    Then validation passes

  Scenario: Hook timeout field is accepted as a positive integer
    Given a hook entry with "timeout" set to 30
    When validated for any vendor
    Then validation passes

  Scenario: Claude Code default loop limit is null (no limit)
    Given a Claude Code hook with no explicit loop limit
    When validation runs
    Then validation notes that Claude Code has no default loop iteration limit

  Scenario: Cursor default loop limit is 5
    Given a Cursor hook with no explicit loop_limit
    When validation runs
    Then validation notes that Cursor applies a default loop_limit of 5

  Scenario: Hook with failClosed:true is valid but risky
    Given a hook entry with "failClosed" set to true
    When validation runs
    Then validation passes
    And validation emits a warning that failClosed:true blocks the triggering action on hook failure

  # --- Plugin-level vs skill-level hooks ---

  Scenario: Plugin-level side effects belong in hooks/hooks.json, not in SKILL.md activation
    Given a SKILL.md file with hook event handlers defined in its activation frontmatter
    When the plugin structure is validated
    Then validation warns that plugin-level side effects should be in hooks/hooks.json
    And SKILL.md activation should only control when the skill is invoked, not hook scripts
