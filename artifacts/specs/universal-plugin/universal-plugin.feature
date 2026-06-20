Feature: SDD contract registry in .agents/universal-plugin.json

  Scenario: sdd-author resolves implementer from project registry
    Given .agents/universal-plugin.json lists "aces" as implementer for "agent-config"
    And plan.md has no Plugin assignments for this spec
    When sdd-author resolves the implementer for domain type "agent-config"
    Then it invokes aces-implementer

  Scenario: plan.md Plugin assignments override the project registry
    Given .agents/universal-plugin.json lists "aces" as implementer for "agent-config"
    And plan.md explicitly assigns "quill" as implementer for this spec's sub-domain
    When sdd-author resolves the implementer for that sub-domain
    Then it invokes quill-implementer, not aces-implementer

  Scenario: sdd-author resolves scenario-advisor from project registry
    Given .agents/universal-plugin.json lists "aces" as scenario-advisor for "agent-config"
    And plan.md has no Plugin assignments for this spec
    When sdd-author resolves the scenario-advisor for domain type "agent-config"
    Then it invokes aces-scenario-advisor

  Scenario: no implementer registered for domain type
    Given .agents/universal-plugin.json has no entry covering domain type "documentation"
    And plan.md has no Plugin assignments
    When sdd-author resolves the implementer for domain type "documentation"
    Then it falls back to checking that passing tests exist for every scenario

  Scenario: domain plugin init registers itself in the project registry
    Given .agents/universal-plugin.json exists with no "aces" entry in sdd-plugins
    When the aces init-sdd skill runs
    Then .agents/universal-plugin.json contains an aces entry
    And the entry lists "agent-config" and "skill" under both "scenario-advisor" and "implementer"

  Scenario: domain plugin init is idempotent
    Given .agents/universal-plugin.json already has an "aces" entry in sdd-plugins
    When the aces init-sdd skill runs again
    Then the file contains exactly one "aces" entry
    And all other plugin entries are unchanged

  Scenario: domain plugin init creates the file if missing
    Given .agents/universal-plugin.json does not exist
    When the aces init-sdd skill runs
    Then .agents/universal-plugin.json is created
    And it contains the aces entry under sdd-plugins

  Scenario: a plugin omits a contract it does not implement
    Given quill implements only the "implementer" contract, not "scenario-advisor"
    When sdd-author resolves the scenario-advisor for domain type "documentation"
    Then no advisor is found and sdd-spec-designer proceeds without constraints
    When sdd-author resolves the implementer for domain type "documentation"
    Then it invokes quill-implementer
