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

  Scenario: A role may be set to null in the entry
    Given a plugin specializes only some roles
    When its entry is written
    Then a role it does not specialize is recorded as null

  Scenario: A role key may be omitted from the entry
    Given a written entry that omits a role the plugin does not specialize
    Then the entry with the omitted role key is a valid entry shape

  Scenario: An entry carries a governances map with the required keys
    Given a plugin registers in sdd-plugins
    When its entry is written
    Then the entry contains a governances map with director, builder, and architect keys

  Scenario: A governance binding may be set to null in the entry
    Given a plugin does not override a governance
    When its entry is written
    Then that governance binding is recorded as null in the governances map

  Scenario: An entry missing the governances block is not a valid entry shape
    Given a written entry that has no governances block
    Then the entry is not a valid entry shape

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

  Scenario: Init fails loudly on a malformed registry file
    Given .agents/universal-plugin.json exists but contains malformed JSON
    When the plugin init skill runs
    Then it fails with an error
    And the file is not overwritten
