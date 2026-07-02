Feature: SDD Operator — Registry Resolution

  # Scenarios trace resolution top-to-bottom — read the lockfile → resolve
  # each role → resolve governances and disambiguate — per the scenario-ordering
  # convention in sdd:spec-governance.

  # ── registry read: the resolved lockfile ──────────────────────────────────

  Scenario: The operator resolves roles from the registry without scanning
    Given .agents/universal-plugin.json lists quill with its role-to-agent map
    When sdd-operator resolves delegates for a Quill-owned domain
    Then it resolves the role-to-agent map from .agents/universal-plugin.json
    And it does not scan user-global, project-global, or project-local plugin directories

  # ── role resolution: convention, SDD defaults (producer inline-or-spawn / judge cold), hard-fail ──

  Scenario: An omitted role key falls back to the naming convention
    Given a registry entry omits the impl-producer key entirely
    When the operator resolves impl-producer
    Then it falls back to the convention name plugin-impl-producer

  Scenario: An unnamed SDD-default producer role is run inline by the Operator
    Given no model-tuned agent is named for the impl-producer role
    When the operator resolves impl-producer
    Then it loads the SDD-default impl-producer governance in its own warm context
    And it authors the artifact inline at the operator's model rather than spawning a producer agent
    And it records produced-by.impl-producer as sdd:sdd-operator

  Scenario: A producer role assigned a named agent is spawned, not run inline
    Given the impl-producer slot names an agent in the registry or produced-by map
    And the named agent may be a plugin delegate or a model-tuned producer agent
    When the operator resolves impl-producer
    Then it spawns that named agent so it runs with its own model and effort
    And it does not load the producer governance inline in its own context
    And the spawn is keyed on the slot naming an agent, not on a full domain plugin covering the domain

  Scenario: An SDD-default judge role is spawned as a cold agent
    Given no plugin covers the domain for the spec-judge role
    When the operator resolves spec-judge
    Then it spawns sdd:sdd-spec-judge as a cold agent in a fresh context
    And it does not load the judge inline in its own context

  Scenario: A required role with no resolvable delegate hard-fails
    Given no plugin covers the domain and no SDD default exists for a required role
    When sdd-operator resolves that role
    Then it returns a hard-fail blocker
    And it records nothing
    And no inline sentinel value is written

  # ── governance resolution & domain disambiguation ─────────────────────────

  Scenario: An actor governance is resolved from the registry with an SDD default
    Given the registry binds the aced plugin's builder governance to "aced-eval-bar"
    And it leaves the architect governance null
    When the operator resolves governances for an aced domain
    Then the builder governance resolves to aced-eval-bar
    And the architect governance falls back to the SDD default

  Scenario: A domain claimed by two plugins is disambiguated without looping
    Given both the aced and quill plugins cover the "guide" domain in the registry
    When sdd-operator resolves the delegate for the "guide" domain
    Then it returns STATUS needs-input asking which plugin owns the domain
    And the relay writes the choice to the produced-by frontmatter map in spec.md
    And on resume the resolver reads that map before counting candidates
    And the suspend does not loop
