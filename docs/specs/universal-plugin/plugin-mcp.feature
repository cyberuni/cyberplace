Feature: MCP server configuration rules
  .mcp.json is the source of truth for MCP server configuration.
  mcp.json must always be a symbolic link to .mcp.json — never a regular file.
  This design avoids configuration drift across vendor consumers.

  The system under test is any conformant plugin validator or installer.

  # --- Symlink invariant ---

  Scenario: mcp.json is a symbolic link to .mcp.json
    Given a plugin with MCP configuration
    When the plugin structure is validated
    Then "mcp.json" is a symbolic link
    And the symlink target is ".mcp.json"

  Scenario: mcp.json as a regular file fails validation
    Given a plugin directory where "mcp.json" is a regular file
    When validation runs
    Then validation fails
    And the error states "mcp.json must be a symbolic link to .mcp.json, not a regular file"

  Scenario: mcp.json missing when .mcp.json exists generates a warning
    Given ".mcp.json" exists in the plugin directory
    And "mcp.json" does not exist
    When validation runs
    Then validation warns that the "mcp.json" symlink is missing
    And suggests running "ln -sf .mcp.json mcp.json"

  Scenario: Neither .mcp.json nor mcp.json present is valid (MCP is optional)
    Given a plugin directory with no MCP configuration files
    When validation runs
    Then validation passes with no MCP-related errors

  # --- Symlink creation ---

  Scenario: Installer creates mcp.json as a symlink to .mcp.json
    Given a plugin directory with ".mcp.json"
    And "mcp.json" does not yet exist
    When the installer creates the MCP symlink
    Then "mcp.json" exists as a symbolic link
    And the symlink resolves to ".mcp.json"

  Scenario: Symlink creation is idempotent
    Given "mcp.json" already exists as a symlink to ".mcp.json"
    When the installer creates the MCP symlink again
    Then "mcp.json" still points to ".mcp.json"
    And no error is raised

  # --- Content propagation ---

  Scenario: Editing .mcp.json is visible through mcp.json symlink
    Given "mcp.json" is a symbolic link to ".mcp.json"
    When ".mcp.json" content is updated
    Then reading "mcp.json" returns the updated content

  Scenario: mcp.json symlink tracks the same content as .mcp.json at all times
    Given "mcp.json" is a symbolic link to ".mcp.json"
    Then the byte content of "mcp.json" equals the byte content of ".mcp.json"

  # --- Runtime file resolution ---

  Scenario: Claude Code reads .mcp.json (dot-prefix)
    Given a plugin with ".mcp.json" containing a valid MCP server config
    When the plugin is loaded by Claude Code
    Then Claude Code reads MCP configuration from ".mcp.json"

  Scenario: Codex reads .mcp.json (dot-prefix)
    Given a plugin with ".mcp.json" containing a valid MCP server config
    When the plugin is loaded by Codex
    Then Codex reads MCP configuration from ".mcp.json"

  Scenario: Cursor reads mcp.json (no dot-prefix, via symlink)
    Given a plugin with "mcp.json" as a symlink to ".mcp.json"
    When the plugin is loaded by Cursor
    Then Cursor reads MCP configuration through "mcp.json"

  # --- Path rules in .mcp.json ---

  Scenario: stdio server command uses CLAUDE_PLUGIN_ROOT for portability
    Given ".mcp.json" contains a stdio server with command "${CLAUDE_PLUGIN_ROOT}/bin/server"
    When validation runs
    Then validation passes with no path-hardcoding warning

  Scenario: stdio server command using absolute path triggers a warning
    Given ".mcp.json" contains a stdio server with command "/usr/local/bin/server"
    When validation runs
    Then validation warns about a hardcoded absolute path
    And suggests using "${CLAUDE_PLUGIN_ROOT}/bin/server" instead

  Scenario: http server uses a full URL (no path portability concern)
    Given ".mcp.json" contains an http server with url "https://api.example.com/mcp"
    When validation runs
    Then validation passes with no path warning

  Scenario: PLUGIN_DATA used in server args is valid
    Given ".mcp.json" contains a server arg using "${CLAUDE_PLUGIN_DATA}/cache"
    When validation runs
    Then validation passes

  # --- MCP server startup behavior ---

  Scenario: MCP server startup failure is non-fatal
    Given a plugin with a misconfigured MCP server
    When the plugin loads
    Then the MCP server failure is logged
    And other plugin components (skills, commands, agents) continue loading

  # --- .gitattributes recommendation ---

  Scenario: Missing .gitattributes symlink declaration generates a recommendation
    Given a git repository containing a plugin with "mcp.json" as a symlink
    And ".gitattributes" does not contain the entry "mcp.json symlink"
    When validation runs
    Then validation recommends adding "mcp.json symlink" to ".gitattributes"

  Scenario: .gitattributes with mcp.json symlink entry passes validation
    Given ".gitattributes" contains "mcp.json symlink"
    When validation runs
    Then no .gitattributes warning is emitted

  # --- MCP server config format ---

  Scenario: Stdio server with required fields is valid
    Given ".mcp.json" contains:
      """
      {
        "my-server": {
          "type": "stdio",
          "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",
          "args": []
        }
      }
      """
    When validation runs
    Then validation passes

  Scenario: HTTP server with required fields is valid
    Given ".mcp.json" contains:
      """
      {
        "remote-api": {
          "type": "http",
          "url": "https://api.example.com/mcp",
          "headers": { "Authorization": "Bearer ${API_TOKEN}" }
        }
      }
      """
    When validation runs
    Then validation passes

  Scenario: MCP server missing type field fails validation
    Given ".mcp.json" contains a server entry with no "type" field
    When validation runs
    Then validation fails
    And the error references the missing "type" field in the server config
