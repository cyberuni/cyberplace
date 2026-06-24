Feature: SDD Operator — Registry Resolution

  # Scenarios trace resolution top-to-bottom — read the lockfile → resolve
  # each role → resolve governances and disambiguate — per the scenario-ordering
  # convention in sdd:spec-governance.

  # ── registry read: the resolved lockfile ──────────────────────────────────

  Scenario: The orchestrator resolves roles from the registry without scanning
    Given .agents/universal-plugin.json lists quill with its role-to-agent map
    When sdd-orchestrator resolves delegates for a Quill-owned domain
    Then it resolves the role-to-agent map from .agents/universal-plugin.json
    And it does not scan user-global, project-global, or project-local plugin directories

  Scenario: init-plugin writes the resolved role map at setup
    Given the user runs init-quill
    When the registry entry is written
    Then it includes the domain coverage, the five-role map, and the plugin version
    And the top-level container is the sdd-plugins array

  Scenario: init rewrites a pre-orchestrator registry entry to the role map
    Given the registry holds an old-shape quill entry with scenario-advisor and implementer keys
    When init-quill runs
    Then it rewrites the entry to the role-to-agent map shape
    And the orchestrator never reads the old shape

  Scenario: init reconciles a stale registry entry against its own version
    Given .agents/universal-plugin.json records quill version 1.2.0
    And init-quill ships inside quill at version 1.3.0
    When init-quill runs on install, upgrade, or manual re-run
    Then it compares its own version against the recorded entry
    And it rewrites the entry when they differ
    And the orchestrator never compares versions at runtime

  # ── role resolution: convention, degeneracy, hard-fail ────────────────────

  Scenario: An omitted role key falls back to the naming convention
    Given a registry entry omits the impl-producer key entirely
    When the orchestrator resolves impl-producer
    Then it falls back to the convention name plugin-impl-producer

  Scenario: A null role value degenerates with no agent
    Given a registry entry sets the impl-producer key to null
    When the orchestrator resolves impl-producer
    Then the role degenerates to the generic Builder with no agent

  Scenario: A required role with no resolvable producer hard-fails
    Given no plugin covers the domain and no SDD default exists for a required role
    When sdd-orchestrator resolves that role
    Then it returns a hard-fail blocker
    And it records nothing
    And no inline sentinel value is written

  # ── governance resolution & domain disambiguation ─────────────────────────

  Scenario: An actor governance is resolved from the registry with an SDD default
    Given the registry binds the aces plugin's builder governance to "aces-eval-bar"
    And it leaves the architect governance null
    When the orchestrator resolves governances for an aces domain
    Then the builder governance resolves to aces-eval-bar
    And the architect governance falls back to the SDD default

  Scenario: A domain claimed by two plugins is disambiguated without looping
    Given both the aces and quill plugins cover the "guide" domain in the registry
    When sdd-orchestrator resolves the delegate for the "guide" domain
    Then it returns STATUS needs-input asking which plugin owns the domain
    And the skill writes the choice to the domain-plugin frontmatter map in spec.md
    And on resume the resolver reads that map before counting candidates
    And the suspend does not loop
