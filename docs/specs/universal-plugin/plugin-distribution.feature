Feature: Plugin distribution rules
  Plugins are distributed in three scopes: personal, team, and public.
  Each scope has vendor-specific paths and installation mechanisms.

  The system under test is any conformant plugin installer or distribution tool.

  # --- Personal scope ---

  Scenario: Personal Claude Code installation uses a symlink
    Given a plugin directory at an absolute path P
    When the plugin is installed personally for Claude Code
    Then a symbolic link exists at "~/.claude/plugins/local/<plugin-name>"
    And the symlink target is the absolute path P

  Scenario: Personal Cursor installation uses a symlink and requires window reload
    Given a plugin directory at an absolute path P
    When the plugin is installed personally for Cursor
    Then a symbolic link exists at "~/.cursor/plugins/local/<plugin-name>"
    And the symlink target is the absolute path P
    And the installation output instructs the user to reload the Cursor window

  Scenario: Personal Codex installation adds an entry to ~/.agents/plugins/marketplace.json
    Given a plugin at path P
    When the plugin is installed personally for Codex
    Then "~/.agents/plugins/marketplace.json" contains an entry for the plugin
    And the entry has "source.source" set to "local"
    And the entry has "source.path" pointing to P

  # --- Team scope (default) ---

  Scenario: Default distribution scope is team
    Given a new plugin created without specifying a scope
    When the distribution scope is determined
    Then the scope is "team"

  Scenario: Team Claude Code distribution packages the plugin as an npm package
    Given a plugin distributed as an npm package
    When the package is installed by a team member
    Then the agent can load the plugin from the npm installation path

  Scenario: Team Cursor distribution requires Cursor Teams or Enterprise plan
    Given a plugin to distribute to a team via Cursor
    When the distribution plan is documented
    Then the documentation states that Cursor Teams or Enterprise plan is required
    And the admin must import the GitHub repository in the Cursor admin panel

  Scenario: Team Codex distribution uses .agents/plugins/marketplace.json in the repo
    Given a plugin available to the team
    When ".agents/plugins/marketplace.json" in the repo contains a plugin entry
    And a team member opens the project in Codex
    Then the plugin appears in the Codex plugin browser

  # --- Public scope ---

  Scenario: Public Claude Code submission requires an open-source license
    Given a plugin intended for the Claude Code official marketplace
    When the submission checklist is evaluated
    Then the plugin must have an open-source license declared in "plugin.json"
    And a PR must be submitted to "anthropics/claude-plugins-official"

  Scenario: Public Cursor submission goes through cursor.com/marketplace
    Given a plugin intended for the Cursor public marketplace
    When the submission checklist is evaluated
    Then the plugin must be submitted to "cursor.com/marketplace/publish"
    And an open-source license is required

  Scenario: Public Codex submission uses the marketplace add command
    Given a plugin intended for public Codex distribution
    When the distribution command is run
    Then it invokes "codex plugin marketplace add <source>"

  # --- npm package structure ---

  Scenario: npm package includes all vendor manifest directories
    Given a plugin distributed via npm
    When "package.json" is validated
    Then "files" includes ".plugin/"
    And "files" includes ".claude-plugin/"
    And "files" includes ".cursor-plugin/"
    And "files" includes ".codex-plugin/"

  Scenario: npm package includes all component directories
    Given a plugin distributed via npm
    When "package.json" is validated
    Then "files" includes "skills/"
    And "files" includes "commands/"
    And "files" includes "agents/"
    And "files" includes "hooks/"

  Scenario: npm package.json carries no plugin-specific semantics
    Given a plugin's "package.json"
    When validation runs
    Then "package.json" does not contain a "skills" field
    And "package.json" does not contain an "agents" field
    And "package.json" does not contain a "commands" field
    And plugin semantics reside only in ".plugin/plugin.json"

  Scenario: npm package root equals the plugin directory root
    Given a plugin distributed via npm
    When the package is unpacked
    Then ".plugin/plugin.json" exists at the package root
    And ".claude-plugin/plugin.json" exists at the package root
    And all component directories exist at the package root

  Scenario: JS-consumer convenience export is optional but recommended
    Given a plugin's "package.json"
    When it contains '"exports": { "./package.json": "./package.json" }'
    Then JS-based tools can resolve the package root via import.meta.resolve
    And non-JS tools ignore this field without error

  # --- Codex marketplace catalog format ---

  Scenario: Codex marketplace catalog entry with AVAILABLE policy is browseable
    Given ".agents/plugins/marketplace.json" with an entry:
      """
      {
        "name": "my-plugin",
        "source": { "source": "local", "path": "./plugins/my-plugin" },
        "policy": { "installation": "AVAILABLE" },
        "category": "Productivity"
      }
      """
    When a Codex user opens the project
    Then the plugin appears in the Codex plugin browser
    And the plugin is not active until the user explicitly installs it

  Scenario: Codex marketplace catalog entry with INSTALLED_BY_DEFAULT policy is auto-active
    Given ".agents/plugins/marketplace.json" with policy "installation": "INSTALLED_BY_DEFAULT"
    When a Codex user opens the project
    Then the plugin is active without explicit user installation

  Scenario: Codex marketplace entry requires name, source, and policy fields
    Given ".agents/plugins/marketplace.json" with an entry missing the "policy" field
    When validation runs
    Then validation fails
    And the error states that "policy" is required in marketplace entries

  Scenario: Codex marketplace catalog accepts both repo-scoped and personal paths
    Given a personal marketplace at "~/.agents/plugins/marketplace.json"
    And it contains an entry for a plugin
    When Codex starts
    Then the plugin is discoverable from the personal marketplace

  # --- Local development testing ---

  Scenario: Local install for Claude Code testing uses symlink
    Given a plugin directory at the current working directory
    When running the local install command for Claude Code
    Then a symlink is created at "~/.claude/plugins/local/<plugin-name>" pointing to the plugin directory

  Scenario: Local install for Cursor testing uses symlink and prompts reload
    Given a plugin directory at the current working directory
    When running the local install command for Cursor
    Then a symlink is created at "~/.cursor/plugins/local/<plugin-name>" pointing to the plugin directory
    And the user is instructed to run "Developer: Reload Window" in Cursor

  Scenario: Removing a local symlink uninstalls the personal plugin
    Given a symlink at "~/.claude/plugins/local/my-plugin"
    When the symlink is removed
    Then the plugin is no longer available in Claude Code
