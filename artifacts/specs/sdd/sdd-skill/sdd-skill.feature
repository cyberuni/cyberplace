Feature: SDD gateway skill

  # ── activation and intake ──────────────────────────────────────────────

  Scenario: Activate SDD before creation work
    Given the user wants to work on a creation artifact under SDD
    When the agent invokes the sdd skill
    Then the skill reports that SDD is active for the current workflow
    And the skill reports status meanings consistent with the lifecycle contract when classifying a spec's state
    And the skill surfaces create-spec, validate-spec, render-spec-graph, and sdd-orchestrator as the active workflow surface

  Scenario: Ask for SDD intent on empty invocation
    Given the user invokes "$sdd"
    And the user provides no work item, artifact, or action
    When the agent invokes the sdd skill
    Then the agent asks what SDD work the user wants to do
    And the choices include creating a new artifact, backfilling an existing artifact, revising or validating a spec, implementing an approved spec, managing or deprecating specs, and refreshing the graph
    And implementation does not start before the user selects a route

  Scenario: Route explicit SDD request with enough detail
    Given the user says "use SDD to create a spec for auth"
    When the agent invokes the sdd skill
    Then the next action is create-spec for auth

  Scenario: sdd does not mutate project setup
    Given a repo with AGENTS.md present
    When the agent invokes the sdd skill
    Then AGENTS.md is unchanged
    And no SessionStart hook is registered
    And no cyber-skills CLI command is required

  # ── routing ────────────────────────────────────────────────────────────

  Scenario: Route a complete draft spec to the spec gate without asking
    Given specs/auth/spec.md has status draft
    And tasks.md has all items checked
    And no open markers exist in spec.md or the .feature
    When the agent invokes the sdd skill
    Then the next action is to review at the spec gate
    And the agent does not present the revise option as an alternative

  Scenario: Route a draft with open markers to revise
    Given specs/auth/spec.md has status draft
    And an open marker exists in spec.md
    When the agent invokes the sdd skill
    Then the next action is to revise the spec
    And the agent names the open items that must be resolved first

  Scenario: Route a new artifact to create-spec
    Given no spec exists for the requested artifact
    When the agent invokes the sdd skill
    Then the next action is create-spec
    And implementation does not start before a draft contract exists

  Scenario: Route a backfill artifact to create-spec
    Given realization already exists for the requested artifact
    And no spec exists for that artifact
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

  Scenario: Route a deprecation request to spec management
    Given specs/auth/spec.md has status approved
    When the user asks to deprecate the auth spec
    Then the next action is the spec management route for deprecation
    And the agent does not delete the spec without routing through that action

  Scenario: Route graph refreshes to render-spec-graph
    Given a spec blocked-by edge changed
    When the user asks to refresh the SDD dependency view
    Then the next action is render-spec-graph
    And graph.md is regenerated rather than hand-edited

  # ── freeze and state handling ──────────────────────────────────────────

  Scenario: Route a post-approval scenario change to the draft re-open path
    Given specs/auth/spec.md has status approved
    And specs/auth/auth.feature exists
    When the user asks to add a new scenario to auth.feature
    Then the agent recognizes the frozen contract and does not invoke a direct edit of auth.feature
    And the next action is the draft re-open route

  Scenario: Route an approved behavior change to the draft re-open path
    Given specs/auth/spec.md has status approved
    And specs/auth/auth.feature exists
    When the user asks to change an approved behavior in auth
    Then the agent recognizes the frozen contract and routes the change through the draft re-open route
    And implementation does not proceed against the changed behavior before the contract is re-approved

  Scenario: Validate inconsistent lifecycle state before implementation
    Given specs/auth/spec.md has missing lifecycle frontmatter
    When the user asks to implement auth
    Then the next action is validate-spec for state validation
    And implementation does not start until the lifecycle state is legal

  # ── errors ─────────────────────────────────────────────────────────────

  Scenario: Report an error on an ambiguous nonempty request
    Given the user invokes the sdd skill with a nonempty request
    And the request does not resolve to any known SDD action
    When the agent invokes the sdd skill
    Then the agent reports that the request is unroutable
    And no SDD action is invoked
