Feature: Universal Plugin

  # Scenarios trace the project-level guarantees: one source set targets many
  # harnesses, governance is embedded ahead of time, and the project composes
  # its feature specs. Detailed behavior lives in the feature specs.

  # -- build and distribution ---------------------------------------------

  Scenario: One source set builds output for a target harness
    Given a source set of agent configuration artifacts
    When the universal plugin builds for a target harness
    Then the harness-specific output is emitted from that single source set

  Scenario: Required governance is embedded at build time
    Given an artifact declares required governance
    When the universal plugin builds the artifact
    Then the governance content is embedded inline in the built output
    And the agent does not run a governance show command at invocation time

  # -- composition --------------------------------------------------------

  Scenario: The project composes feature specs via subtasks
    Given the universal-plugin spec has type project
    When render-spec-graph runs
    Then the Composition view shows universal-plugin owning its feature subtasks
    And each owned spec has type feature

  Scenario: Reusable tooling is owned as a feature, not restated here
    Given the dag-tooling feature spec exists
    When a reader inspects the universal-plugin project spec
    Then the graph tooling rules are cross-referenced to dag-tooling
    And the project spec does not restate them
