Feature: Cross-platform portability rules
  Skills inside a plugin must remain usable across the widest possible set of agent
  runtimes. Portability rules constrain skill body content and installation behavior
  to avoid breaking on constrained hosts (Windsurf) or mismatched paths (Amp).

  The system under test is any conformant plugin validator or installer.

  # --- Windsurf character limits ---

  Scenario: Skill body of exactly 6000 characters passes Windsurf constraint
    Given "skills/my-skill/SKILL.md" with a body of exactly 6000 characters
    When portability validation runs
    Then validation passes with no character-limit warning

  Scenario: Skill body of 6001 characters triggers a Windsurf warning
    Given "skills/my-skill/SKILL.md" with a body of 6001 characters
    When portability validation runs
    Then validation warns that the skill body exceeds Windsurf's 6000-character per-file limit

  Scenario: Total plugin skill content under 12000 characters passes Windsurf constraint
    Given a plugin with two skills, each with 5000-character bodies
    When portability validation runs
    Then validation passes the Windsurf 12000-character total limit check

  Scenario: Total plugin skill content exceeding 12000 characters triggers a Windsurf warning
    Given a plugin with three skills, each with 5000-character bodies (total: 15000)
    When portability validation runs
    Then validation warns that total skill content exceeds Windsurf's 12000-character total limit

  # --- Path format ---

  Scenario: Forward slashes in skill body paths are portable
    Given "skills/my-skill/SKILL.md" body references a path "./scripts/run.sh"
    When portability validation runs
    Then validation passes with no path warning

  Scenario: Backslashes in skill body paths break Unix hosts
    Given "skills/my-skill/SKILL.md" body references "scripts\\run.bat"
    When portability validation runs
    Then validation warns that backslashes break Unix hosts
    And suggests replacing backslashes with forward slashes

  # --- Vendor-specific syntax in skill bodies ---

  Scenario: Vendor-specific hook event names in skill body reduce portability
    Given "skills/my-skill/SKILL.md" body contains the literal string "PreToolUse"
    When portability validation runs
    Then validation warns that vendor-specific hook event names in skill bodies reduce portability
    And suggests referencing hooks abstractly or in hooks/hooks.json instead

  Scenario: Vendor-specific slash command syntax in skill body reduces portability
    Given "skills/my-skill/SKILL.md" body contains "Run /claude-specific-command"
    When portability validation runs
    Then validation warns that vendor-specific slash command syntax in skill bodies reduces portability

  # --- Environment requirements ---

  Scenario: Environment requirements declared in compatibility frontmatter pass portability
    Given "skills/my-skill/SKILL.md" frontmatter contains:
      """
      compatibility:
        requires: [node, git]
      """
    When portability validation runs
    Then validation passes with no undeclared-dependency warning

  Scenario: Using an undeclared tool in skill body triggers a warning
    Given "skills/my-skill/SKILL.md" body runs "terraform apply"
    And frontmatter does not declare "terraform" in compatibility.requires
    When portability validation runs
    Then validation warns to declare "terraform" in the compatibility frontmatter

  # --- SKILL.md path recognition per runtime ---

  Scenario: Plugin skills/ directory is read natively by Claude Code
    Given a plugin with "skills/my-skill/SKILL.md" installed in Claude Code
    When the plugin loads
    Then the skill is available to the Claude Code agent

  Scenario: Plugin skills/ directory is read natively by Codex
    Given a plugin with "skills/my-skill/SKILL.md" installed in Codex
    When the plugin loads
    Then the skill is available to the Codex agent

  Scenario: Plugin skills/ directory is NOT auto-read by Amp without installation mapping
    Given a plugin with "skills/my-skill/SKILL.md"
    When the plugin is installed for Amp without a path mapping
    Then the skill is NOT available to the Amp agent
    And installation must map "skills/" → ".agents/skills/" for Amp compatibility

  Scenario: Plugin skills/ directory mapped to .agents/skills/ is read by Amp
    Given a plugin with "skills/my-skill/SKILL.md"
    When the installer maps the skill to ".agents/skills/my-skill/SKILL.md" for Amp
    Then the skill is available to the Amp agent

  # --- Component type compatibility per runtime ---

  Scenario: commands/ is silently ignored by Codex
    Given a plugin with "commands/deploy.md"
    When loaded by Codex
    Then no error is raised for commands/

  Scenario: agents/ is silently ignored by Codex
    Given a plugin with "agents/reviewer.md"
    When loaded by Codex
    Then no error is raised for agents/

  Scenario: rules/ is silently ignored by Claude Code
    Given a plugin with "rules/style.mdc"
    When loaded by Claude Code
    Then the rule is not injected and no error is raised

  Scenario: rules/ is silently ignored by Codex
    Given a plugin with "rules/style.mdc"
    When loaded by Codex
    Then the rule is not injected and no error is raised

  Scenario: .app.json is silently ignored by Claude Code
    Given a plugin with ".app.json" (Codex app connectors)
    When loaded by Claude Code
    Then the file is ignored and no error is raised

  Scenario: .app.json is silently ignored by Cursor
    Given a plugin with ".app.json"
    When loaded by Cursor
    Then the file is ignored and no error is raised

  Scenario: lspServers is silently ignored by Cursor and Codex
    Given a plugin with ".lsp.json" declared in the manifest
    When loaded by Cursor
    Then no LSP server is registered and no error is raised
    When loaded by Codex
    Then no LSP server is registered and no error is raised

  # --- Namespacing collision prevention ---

  Scenario: Two installed plugins with the same skill name are distinguished by namespace
    Given plugin "alpha" with skill "deploy"
    And plugin "beta" with skill "deploy"
    When both plugins are installed
    Then "alpha:deploy" refers to alpha's skill
    And "beta:deploy" refers to beta's skill
    And there is no collision

  Scenario: MCP tools from different plugins are namespace-isolated
    Given plugin "alpha" with MCP server "srv" providing tool "run"
    And plugin "beta" with MCP server "srv" providing tool "run"
    When both plugins are installed
    Then the tools are accessible as "mcp__plugin_alpha_srv__run" and "mcp__plugin_beta_srv__run"

  # --- Conversion requirements ---

  Scenario: Windsurf requires format conversion (not native SKILL.md)
    Given a plugin with "skills/my-skill/SKILL.md"
    When targeted for Windsurf distribution
    Then the skill content must be converted to Windsurf's VS Code extension format
    And conversion must respect the 6000-character per-file limit

  Scenario: Zed requires manual configuration (not native SKILL.md)
    Given a plugin with skills
    When targeted for Zed
    Then installation requires manual configuration in Zed's extension system
    And no automated conversion is available

  Scenario: Continue.dev requires conversion to YAML blocks format
    Given a plugin with skills
    When targeted for Continue.dev
    Then skill content must be converted to Continue.dev's YAML config format
    And no automated conversion is available
