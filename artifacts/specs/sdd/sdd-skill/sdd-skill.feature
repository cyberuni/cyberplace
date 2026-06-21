Feature: SDD gateway skill

  # -- activation and intake ----------------------------------------------

  Scenario: Activate SDD before feature work
    Given the user wants to work on a software feature under SDD
    When the agent invokes the sdd skill
    Then SDD is active for the current workflow
    And the SDD lifecycle rules are loaded into context
    And sdd:spec-governance is identified as required context for spec authoring and judging
    And the skill surfaces create-spec, validate-spec, render-spec-graph, and sdd-orchestrator as the active workflow surface

  Scenario: Ask for SDD intent on empty invocation
    Given the user invokes "$sdd"
    And the user provides no feature, artifact, or action
    When the agent invokes the sdd skill
    Then the agent asks what SDD work the user wants to do
    And the choices include creating a new feature, backfilling an existing feature, revising or validating a spec, implementing an approved spec, managing or deprecating specs, and refreshing the graph
    And implementation does not start before the user selects a route

  Scenario: Route explicit SDD request with enough detail
    Given the user says "use SDD to create a spec for auth"
    When the agent invokes the sdd skill
    Then the SDD lifecycle rules are loaded into context
    And sdd:spec-governance is identified as required context for spec authoring and judging
    And the next action is create-spec for auth

  Scenario: sdd does not mutate project setup
    Given a repo with AGENTS.md present
    When the agent invokes the sdd skill
    Then AGENTS.md is unchanged
    And no SessionStart hook is registered
    And no cyber-skills CLI command is required

  # -- routing -------------------------------------------------------------

  Scenario: Route a new feature to create-spec
    Given no spec exists for the requested feature
    When the agent invokes the sdd skill
    Then the next action is create-spec
    And implementation does not start before a draft contract exists

  Scenario: Route a backfill feature to create-spec
    Given implementation exists for the requested feature
    And no spec exists for that feature
    When the agent invokes the sdd skill
    Then the next action is create-spec in backfill mode
    And the inferred contract is presented for user confirmation before scenarios are frozen

  Scenario: Route a draft spec to the spec gate
    Given specs/auth/spec.md has status draft
    And specs/auth/auth.feature exists
    When the user asks to approve the contract
    Then the next action is validate-spec targeting the spec gate
    And implementation artifacts are not required for the spec gate

  Scenario: Route approved implementation to the impl gate
    Given specs/auth/spec.md has status approved
    And specs/auth/auth.feature exists
    When the user asks to implement auth
    Then auth.feature remains frozen
    And implementation proceeds against the frozen scenarios
    And the next gate action is validate-spec targeting the impl gate

  Scenario: Route graph refreshes to render-spec-graph
    Given a spec blocked-by edge changed
    When the user asks to refresh the SDD dependency view
    Then the next action is render-spec-graph
    And graph.md is treated as a derived artifact

  # -- freeze and state handling ------------------------------------------

  Scenario: Refuse direct scenario changes after approval
    Given specs/auth/spec.md has status approved
    And specs/auth/auth.feature exists
    When the user asks to add a new scenario to auth.feature
    Then the agent refuses to edit auth.feature directly
    And the agent routes the work through the draft re-open path

  Scenario: Validate inconsistent lifecycle state before implementation
    Given specs/auth/spec.md has missing lifecycle frontmatter
    When the user asks to implement auth
    Then the next action is validate-spec for state validation
    And implementation does not start until the lifecycle state is legal
