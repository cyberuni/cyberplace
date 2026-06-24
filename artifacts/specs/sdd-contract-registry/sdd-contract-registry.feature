Feature: SDD Contract Registry

  # Scenarios trace the registry file shape and init-write behavior. Resolving
  # a delegate from the registry is owned by sdd-operator; here the focus
  # is the five-role entry shape and idempotent registration.

  # -- entry shape --------------------------------------------------------

  Scenario: An entry maps plugin roles with the five-role map
    Given a plugin registers in sdd-plugins
    When its entry is written
    Then the entry has name, version, and domains
    And the roles map uses spec-producer, plan-producer, spec-judge, impl-producer, and impl-judge

  Scenario: A null role degenerates to the SDD default
    Given a plugin entry sets plan-producer to null
    When the operator resolves the plan-producer for that plugin
    Then it uses the SDD default plan-producer

  Scenario: A missing role key degenerates to the SDD default
    Given a plugin entry omits the spec-judge key
    When the operator resolves the spec-judge for that plugin
    Then it uses the SDD default spec-judge

  # -- resolution source --------------------------------------------------

  Scenario: Resolution reads only the registry
    Given .agents/universal-plugin.json maps the "guide" domain to a plugin
    And plan.md contains a Plugin assignments table
    When the operator resolves delegates for the "guide" domain
    Then it resolves from .agents/universal-plugin.json
    And it ignores plan.md for resolution

  # -- init write ---------------------------------------------------------

  Scenario: Init registers the plugin entry
    Given .agents/universal-plugin.json has no entry for this plugin
    When the plugin init skill runs
    Then the file contains one entry for this plugin under sdd-plugins

  Scenario: Init is idempotent
    Given .agents/universal-plugin.json already has an entry for this plugin
    When the plugin init skill runs again
    Then the file contains exactly one entry for this plugin
    And every other plugin entry is unchanged

  Scenario: Init creates the file when missing
    Given .agents/universal-plugin.json does not exist
    When the plugin init skill runs
    Then the file is created
    And it contains this plugin entry under sdd-plugins

  Scenario: Init rewrites an old-shape entry
    Given .agents/universal-plugin.json has an entry with scenario-advisor and implementer keys
    When the plugin init skill runs
    Then the entry is rewritten to the five-role map
