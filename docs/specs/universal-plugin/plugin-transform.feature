Feature: Vendor manifest derivation
  Vendor-specific manifests are generated from the canonical .plugin/plugin.json.
  A conformant generator derives .claude-plugin/plugin.json, .cursor-plugin/plugin.json,
  and .codex-plugin/plugin.json with exactly the fields each vendor requires or allows.

  The system under test is any conformant plugin generator (e.g., `cyber-skills plugin generate`).

  Background:
    Given a canonical manifest at ".plugin/plugin.json" containing:
      | field       | value                           |
      | name        | my-plugin                       |
      | version     | 1.0.0                           |
      | description | A test plugin                   |
      | author.name | Test Author                     |
      | homepage    | https://example.com             |
      | license     | MIT                             |
      | keywords    | ["test", "plugin"]              |
      | skills      | ./skills/                       |
      | mcpServers  | ./.mcp.json                     |
      | commands    | ./commands/                     |
      | agents      | ./agents/                       |
      | hooks       | ./hooks/hooks.json              |

  # --- All three vendor manifests generated ---

  Scenario: Generator creates all three vendor manifest files
    When the generator runs
    Then ".claude-plugin/plugin.json" exists
    And ".cursor-plugin/plugin.json" exists
    And ".codex-plugin/plugin.json" exists

  # --- Shared metadata fields ---

  Scenario: name appears in all three vendor manifests
    When the generator runs
    Then ".claude-plugin/plugin.json" has "name" equal to "my-plugin"
    And ".cursor-plugin/plugin.json" has "name" equal to "my-plugin"
    And ".codex-plugin/plugin.json" has "name" equal to "my-plugin"

  Scenario: version appears in all three vendor manifests
    When the generator runs
    Then ".claude-plugin/plugin.json" has "version" equal to "1.0.0"
    And ".cursor-plugin/plugin.json" has "version" equal to "1.0.0"
    And ".codex-plugin/plugin.json" has "version" equal to "1.0.0"

  Scenario: description appears in all three vendor manifests
    When the generator runs
    Then ".claude-plugin/plugin.json" has "description" equal to "A test plugin"
    And ".cursor-plugin/plugin.json" has "description" equal to "A test plugin"
    And ".codex-plugin/plugin.json" has "description" equal to "A test plugin"

  Scenario: author, homepage, license, keywords appear in all three vendor manifests
    When the generator runs
    Then all three vendor manifests contain "author", "homepage", "license", and "keywords"

  # --- Codex required fields ---

  Scenario: Codex derivation fails when version is absent from canonical
    Given a canonical manifest with name "my-plugin" and description "Test" and no version
    When the Codex manifest is derived
    Then derivation fails with an error containing "Codex requires version"

  Scenario: Codex derivation fails when description is absent from canonical
    Given a canonical manifest with name "my-plugin" and version "1.0.0" and no description
    When the Codex manifest is derived
    Then derivation fails with an error containing "Codex requires description"

  Scenario: Claude Code derivation succeeds without version
    Given a canonical manifest with name "my-plugin" and no version
    When the Claude Code manifest is derived
    Then derivation succeeds
    And ".claude-plugin/plugin.json" does not contain "version"

  Scenario: Cursor derivation succeeds without version
    Given a canonical manifest with name "my-plugin" and no version
    When the Cursor manifest is derived
    Then derivation succeeds
    And ".cursor-plugin/plugin.json" does not contain "version"

  # --- Component field inclusion / exclusion ---

  Scenario: skills field is included in all three vendor manifests
    When the generator runs
    Then ".claude-plugin/plugin.json" has "skills" equal to "./skills/"
    And ".cursor-plugin/plugin.json" has "skills" equal to "./skills/"
    And ".codex-plugin/plugin.json" has "skills" equal to "./skills/"

  Scenario: commands field is included in Claude Code and Cursor, omitted from Codex
    When the generator runs
    Then ".claude-plugin/plugin.json" has "commands" equal to "./commands/"
    And ".cursor-plugin/plugin.json" has "commands" equal to "./commands/"
    And ".codex-plugin/plugin.json" does not contain "commands"

  Scenario: agents field is included in Claude Code and Cursor, omitted from Codex
    When the generator runs
    Then ".claude-plugin/plugin.json" has "agents" equal to "./agents/"
    And ".cursor-plugin/plugin.json" has "agents" equal to "./agents/"
    And ".codex-plugin/plugin.json" does not contain "agents"

  Scenario: rules field is omitted from Claude Code manifest
    Given the canonical manifest has "rules" set to "./rules/"
    When the generator runs
    Then ".claude-plugin/plugin.json" does not contain "rules"

  Scenario: rules field is included in Cursor manifest
    Given the canonical manifest has "rules" set to "./rules/"
    When the generator runs
    Then ".cursor-plugin/plugin.json" has "rules" equal to "./rules/"

  Scenario: rules field is omitted from Codex manifest
    Given the canonical manifest has "rules" set to "./rules/"
    When the generator runs
    Then ".codex-plugin/plugin.json" does not contain "rules"

  Scenario: lspServers field is included in Claude Code, omitted from Cursor and Codex
    Given the canonical manifest has "lspServers" set to "./.lsp.json"
    When the generator runs
    Then ".claude-plugin/plugin.json" has "lspServers" equal to "./.lsp.json"
    And ".cursor-plugin/plugin.json" does not contain "lspServers"
    And ".codex-plugin/plugin.json" does not contain "lspServers"

  Scenario: outputStyles field is included in Claude Code, omitted from Cursor and Codex
    Given the canonical manifest has "outputStyles" set to "./output-styles/"
    When the generator runs
    Then ".claude-plugin/plugin.json" has "outputStyles" equal to "./output-styles/"
    And ".cursor-plugin/plugin.json" does not contain "outputStyles"
    And ".codex-plugin/plugin.json" does not contain "outputStyles"

  # --- mcpServers path adaptation ---

  Scenario: Claude Code manifest mcpServers points to .mcp.json (dot-prefix)
    When the generator runs
    Then ".claude-plugin/plugin.json" has "mcpServers" equal to "./.mcp.json"

  Scenario: Cursor manifest mcpServers points to mcp.json (no dot-prefix, symlink target)
    When the generator runs
    Then ".cursor-plugin/plugin.json" has "mcpServers" equal to "./mcp.json"

  Scenario: Codex manifest mcpServers points to .mcp.json (dot-prefix)
    When the generator runs
    Then ".codex-plugin/plugin.json" has "mcpServers" equal to "./.mcp.json"

  # --- Hook event name transformation ---

  Scenario Outline: Hook event names are transformed per vendor
    Given the canonical manifest has a hook for canonical event "<canonical_event>"
    When the generator derives hook files
    Then the Claude Code hook file uses event name "<claude_event>"
    And the Cursor hook file uses event name "<cursor_event>"
    And the Codex hook file uses event name "<codex_event>"

    Examples:
      | canonical_event        | claude_event        | cursor_event        | codex_event        |
      | pre-tool-use           | PreToolUse          | preToolUse          | preToolUse         |
      | post-tool-use          | PostToolUse         | postToolUse         | postToolUse        |
      | post-tool-use-failure  | PostToolUseFailure  | postToolUseFailure  | postToolUseFailure |
      | session-start          | SessionStart        | sessionStart        | sessionStart       |
      | session-end            | SessionEnd          | sessionEnd          | sessionEnd         |
      | stop                   | Stop                | stop                | stop               |

  Scenario: user-prompt-submit maps to UserPromptSubmit in Claude Code and beforeSubmitPrompt in Cursor
    Given the canonical manifest has a hook for "user-prompt-submit"
    When the generator derives hook files
    Then the Claude Code hook file uses event name "UserPromptSubmit"
    And the Cursor hook file uses event name "beforeSubmitPrompt"
    And the Codex hook file does not include this event

  # --- Hook file structure ---

  Scenario: Cursor hook file has "version": 1 at top level
    Given the canonical manifest has a hooks field
    When the Cursor hook manifest is derived
    Then the Cursor hook file has a top-level "version" field equal to 1

  Scenario: Claude Code hook file does not have a top-level version field
    Given the canonical manifest has a hooks field
    When the Claude Code hook manifest is derived
    Then the Claude Code hook file does not contain a top-level "version" field

  Scenario: Codex hook file does not have a top-level version field
    Given the canonical manifest has a hooks field
    When the Codex hook manifest is derived
    Then the Codex hook file does not contain a top-level "version" field

  Scenario: Claude Code hook file uses "hooks" as the top-level key for event handlers
    Given the canonical manifest has a hooks field
    When the Claude Code hook manifest is derived
    Then all event handlers are nested under a top-level "hooks" key

  Scenario: Codex hook file places event handlers at the top level (no "hooks" wrapper)
    Given the canonical manifest has a hooks field
    When the Codex hook manifest is derived
    Then event handlers are at the top level (not nested under "hooks")

  Scenario: Claude Code hook file uses CLAUDE_PLUGIN_ROOT for script paths
    Given the canonical hooks reference "./hooks/impl.sh"
    When the Claude Code hook manifest is derived
    Then the command path uses "${CLAUDE_PLUGIN_ROOT}/hooks/impl.sh"

  # --- Vendor overlay merging ---

  Scenario: Claude Code overlay fields are preserved in derived manifest
    Given ".claude-plugin/plugin.json" exists as an overlay with "displayName" set to "My Plugin"
    When the generator merges the Claude Code overlay
    Then ".claude-plugin/plugin.json" contains "displayName" equal to "My Plugin"
    And all canonical fields are also present

  Scenario: Vendor overlay does not add unsupported fields to other vendor manifests
    Given the Claude Code overlay contains "userConfig"
    When the generator runs
    Then ".cursor-plugin/plugin.json" does not contain "userConfig"
    And ".codex-plugin/plugin.json" does not contain "userConfig"

  # --- Idempotency ---

  Scenario: Running the generator twice produces the same output
    When the generator runs
    And the generator runs again without changing the canonical manifest
    Then all three vendor manifests are byte-for-byte identical to the first run

  # --- Source preservation ---

  Scenario: The canonical .plugin/plugin.json is never modified by the generator
    Given the canonical manifest has content C
    When the generator runs
    Then ".plugin/plugin.json" still has content C
