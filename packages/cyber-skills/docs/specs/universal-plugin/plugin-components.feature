Feature: Plugin component authoring rules
  Each component type in a plugin has specific file layout, format, and frontmatter
  requirements. A conformant validator checks each component against its authoring rules.

  The system under test is any conformant plugin validator.

  # --- Skills ---

  Scenario: Each skill lives in its own subdirectory
    Given a plugin with skills
    When the skills directory is validated
    Then each skill exists at "skills/<name>/SKILL.md"
    And no SKILL.md file exists directly under "skills/" (flat layout not allowed)

  Scenario: Skill name in frontmatter must match its directory name
    Given "skills/my-skill/SKILL.md" with frontmatter "name: my-skill"
    When validation runs
    Then validation passes

  Scenario: Skill name mismatch with directory name fails validation
    Given "skills/my-skill/SKILL.md" with frontmatter "name: other-skill"
    When validation runs
    Then validation fails
    And the error states that the skill name must match the directory name

  Scenario: Skill without a description in frontmatter fails validation
    Given "skills/my-skill/SKILL.md" with frontmatter containing only "name: my-skill"
    When validation runs
    Then validation warns that description is required in skill frontmatter

  Scenario: Plugin with no skills directory generates a warning
    Given a plugin directory with no "skills/" directory
    When validation runs
    Then validation warns that at least one skill is expected
    And suggests adding "skills/<name>/SKILL.md"

  Scenario: Skills declared in the canonical manifest must resolve to existing directories
    Given the canonical manifest has "skills" set to "./skills/"
    And the "skills/" directory does not exist
    When validation runs
    Then validation fails
    And the error states that the declared skills path does not exist

  Scenario: Multiple skills directories are all validated
    Given the canonical manifest has "skills" set to '["./skills-a/", "./skills-b/"]'
    And both directories exist and contain SKILL.md files
    When validation runs
    Then all skills in both directories are validated

  # --- Commands ---

  Scenario: Command filename (without extension) becomes the command identifier
    Given "commands/deploy.md" in the plugin
    When the plugin is loaded by a conformant host
    Then the command identifier is "deploy"

  Scenario: Command frontmatter description is strongly recommended
    Given "commands/deploy.md" with no frontmatter description
    When validation runs
    Then validation warns that a description field is missing from command frontmatter

  Scenario: Command with $ARGUMENTS placeholder accepts user input
    Given "commands/search.md" with body containing "$ARGUMENTS"
    When validation runs
    Then validation passes and notes that $ARGUMENTS expands to user input at invocation

  Scenario: Command with allowed-tools frontmatter restricts tool access
    Given "commands/read-only.md" with frontmatter:
      """
      ---
      description: Read-only inspection command
      allowed-tools: [Read, Glob, Grep]
      ---
      """
    When validation runs
    Then validation passes

  Scenario: Commands directory declared in manifest must exist
    Given the canonical manifest has "commands" set to "./commands/"
    And the "commands/" directory does not exist
    When validation runs
    Then validation fails
    And the error states that the declared commands path does not exist

  Scenario: Commands are silently ignored by Codex
    Given a plugin with "commands/deploy.md"
    When the plugin is loaded by Codex
    Then no error or warning is raised for the commands directory
    And the command is not available in Codex

  # --- Agents ---

  Scenario: Agent requires name and description in frontmatter
    Given "agents/reviewer.md" with frontmatter:
      """
      ---
      name: reviewer
      description: Reviews pull requests for correctness and style issues
      ---
      """
    When validation runs
    Then validation passes

  Scenario: Agent without name field fails validation
    Given "agents/reviewer.md" with no name in frontmatter
    When validation runs
    Then validation fails
    And the error states that name is required in agent frontmatter

  Scenario: Agent without description field fails validation
    Given "agents/reviewer.md" with no description in frontmatter
    When validation runs
    Then validation fails
    And the error states that description is required in agent frontmatter

  Scenario: Agent name must be 1-64 lowercase alphanumeric + hyphens
    Given "agents/reviewer.md" with frontmatter "name: My Reviewer"
    When validation runs
    Then validation fails
    And the error states the agent name format constraint

  Scenario: Agent name of exactly 64 characters is valid
    Given "agents/reviewer.md" with frontmatter name of 64 lowercase characters
    When validation runs
    Then validation passes

  Scenario: Agent name exceeding 64 characters fails validation
    Given "agents/reviewer.md" with frontmatter name of 65 characters
    When validation runs
    Then validation fails
    And the error states the agent name exceeds the 64-character limit

  Scenario: Agent description exceeding 1024 characters fails validation
    Given "agents/reviewer.md" with a description of 1025 characters
    When validation runs
    Then validation fails
    And the error states the agent description exceeds the 1024-character limit

  Scenario: Agents are silently ignored by Codex
    Given a plugin with "agents/reviewer.md"
    When the plugin is loaded by Codex
    Then no error is raised for the agents directory

  # --- Rules (Cursor-only) ---

  Scenario: Rule file requires description in frontmatter
    Given "rules/commit-style.mdc" with frontmatter:
      """
      ---
      description: Enforces conventional commit format
      alwaysApply: true
      ---
      """
    When Cursor component validation runs
    Then validation passes

  Scenario: Rule file without description fails Cursor validation
    Given "rules/my-rule.mdc" with no description in frontmatter
    When Cursor component validation runs
    Then validation fails
    And the error states that description is required in rule frontmatter

  Scenario: Rule with alwaysApply:true injects on every Cursor interaction
    Given "rules/style.mdc" with "alwaysApply" set to true
    When the plugin is loaded by Cursor
    Then the rule is injected into every Cursor interaction

  Scenario: Rule with globs applies only to matching files
    Given "rules/typescript.mdc" with frontmatter:
      """
      ---
      description: TypeScript rules
      globs: ["**/*.ts", "**/*.tsx"]
      alwaysApply: false
      ---
      """
    When the plugin is loaded by Cursor
    Then the rule applies only when TypeScript files match the globs pattern

  Scenario: rules/ directory is silently ignored by Claude Code
    Given a plugin with "rules/my-rule.mdc"
    When the plugin is loaded by Claude Code
    Then no error or warning is raised for the rules/ directory
    And the rule is not loaded by Claude Code

  Scenario: rules/ directory is silently ignored by Codex
    Given a plugin with "rules/my-rule.mdc"
    When the plugin is loaded by Codex
    Then no error or warning is raised for the rules/ directory

  Scenario: Plugin with rules/ but no commands/setup.md generates a warning
    Given a plugin with "rules/my-rule.mdc"
    And "commands/setup.md" does not exist
    When validation runs
    Then validation warns that "commands/setup.md" is needed to merge rules into AGENTS.md for cross-agent always-on behavior

  # --- Setup command (required with rules/) ---

  Scenario: commands/setup.md is valid when rules/ is present
    Given a plugin with both "rules/my-rule.mdc" and "commands/setup.md"
    When validation runs
    Then validation passes with no setup warning

  Scenario: setup.md instructs merging rule content into AGENTS.md
    Given "commands/setup.md" exists
    When the setup command is executed by an agent
    Then the agent reads all .mdc files under rules/
    And strips YAML frontmatter from each file
    And appends the remaining content as a new section in the project's AGENTS.md

  # --- MCP tool references in skills ---

  Scenario: Skill referencing an MCP tool by fully qualified name is valid
    Given "skills/deploy/SKILL.md" references tool "my-plugin:deploy-server__run"
    When validation runs
    Then validation passes

  Scenario: Skill referencing a bare tool name generates a portability warning
    Given "skills/deploy/SKILL.md" references tool "run" (unqualified)
    When validation runs
    Then validation warns to use fully qualified name "my-plugin:{server-name}__run" to avoid ambiguity
