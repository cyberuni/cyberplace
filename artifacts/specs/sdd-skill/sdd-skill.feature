Feature: SDD gateway skill

  # ── activation and intake ──────────────────────────────────────────────

  Scenario: Activate SDD before creation work
    Given the user wants to work on a creation artifact under SDD
    When the agent invokes the sdd skill
    Then the skill reports that SDD is active for the current workflow
    And the skill reports status meanings consistent with the lifecycle contract when classifying a spec's state
    And the skill surfaces create-spec, validate-spec, render-spec-graph, and sdd-operator as the active workflow surface

  Scenario: Present the four-option top-level menu on empty invocation
    Given the user invokes "$sdd"
    And the user provides no work item, artifact, or action
    When the agent invokes the sdd skill
    Then the agent asks what SDD work the user wants to do
    And the top-level question presents exactly four options
    And the four options are create-or-backfill a spec, work on an existing spec, manage specs and graph, and help me choose
    And implementation does not start before the user selects a route

  Scenario: Never ask a question with more than four options
    Given the user invokes the sdd skill for any intake question
    When the agent presents an AskUserQuestion
    Then the question carries at most four options

  Scenario: Apply the list-overflow fallback when specs exceed four
    Given the user picks "work on an existing spec"
    And more than four specs exist
    When the agent presents the spec choices
    Then the agent presents at most four options
    And the agent either shows only the most-actionable few or asks the user to name the domain directly
    And the agent does not present a question listing every spec

  Scenario: Fast path skips the menu when artifact and action are named
    Given the user says "implement the auth spec"
    When the agent invokes the sdd skill
    Then the agent does not present the intake menu
    And the next action is the implement route for auth

  Scenario: Route explicit SDD request with enough detail
    Given the user says "use SDD to create a spec for auth"
    When the agent invokes the sdd skill
    Then the agent does not present the intake menu
    And the next action is create-spec for auth

  Scenario: sdd does not mutate project setup
    Given a repo with AGENTS.md present
    When the agent invokes the sdd skill
    Then AGENTS.md is unchanged
    And no SessionStart hook is registered
    And no cyberplace CLI command is required

  # ── intake menu branches ───────────────────────────────────────────────

  Scenario: Option 1 detects new-vs-backfill by implementation presence
    Given the user picks "create or backfill a spec"
    And the user names the target work
    When the agent resolves the second level
    Then the agent routes to create-spec in new mode when no implementation exists for that work
    And the agent routes to create-spec in backfill mode when an implementation already exists for that work

  Scenario: Option 2 routes a picked spec by its status
    Given the user picks "work on an existing spec"
    And the agent lists existing specs with their folder slug and status
    When the user picks one spec
    Then the agent routes that spec through the Routing Table by its status
    And a draft spec resolves through the draft tiebreaker, an approved spec to the impl gate, an implemented spec to revise, and a deprecated spec to management

  Scenario: Option 2 covers single-spec deprecation
    Given the user picks "work on an existing spec"
    And the user picks one spec and asks to deprecate it
    When the agent resolves the route
    Then the next action is the spec management route for deprecation

  Scenario: Option 3 routes a graph refresh to render-spec-graph
    Given the user picks "manage specs & graph"
    And the user picks refresh graph
    When the agent resolves the route
    Then the next action is render-spec-graph

  Scenario: Option 3 routes split authoring to create-spec with manual analysis surfaced
    Given the user picks "manage specs & graph"
    And the user picks split a spec
    And no split-spec skill exists
    When the agent resolves the route
    Then the agent routes the authoring half to create-spec
    And the agent surfaces that the split analysis is manual

  Scenario: Option 3 routes dedupe authoring to create-spec with manual analysis surfaced
    Given the user picks "manage specs & graph"
    And the user picks dedupe overlapping specs
    And no dedupe-specs skill exists
    When the agent resolves the route
    Then the agent routes the authoring half to create-spec
    And the agent surfaces that the dedupe analysis is manual

  Scenario: Option 3 routes analysis to split-spec and dedupe-specs once they exist
    Given the user picks "manage specs & graph"
    And the split-spec and dedupe-specs skills exist
    When the user picks split a spec or dedupe overlapping specs
    Then the agent routes the analysis to split-spec or dedupe-specs
    And the agent does not surface the analysis as manual

  Scenario: Option 4 suggests the most-actionable specs then lets the user pick
    Given the user picks "help me choose"
    When the agent scans specs and their statuses
    Then the agent presents at most four suggested specs ranked by actionability
    And the agent lets the user pick one to route
    And no route is taken before the user picks

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

  # ── delegation ─────────────────────────────────────────────────────────

  Scenario: Delegate create-spec work to a subagent
    Given the user says "use SDD to create a spec for auth"
    When the agent invokes the sdd skill
    Then the agent spawns a subagent to run create-spec for auth
    And the sdd skill session does not load create-spec content into the current context

  Scenario: Delegate validate-spec work to a subagent
    Given specs/auth/spec.md has status draft
    And all tasks are checked and no open markers exist
    When the user asks to review at the spec gate
    Then the agent spawns a subagent to run validate-spec for auth
    And the sdd skill session does not load validate-spec content into the current context

  Scenario: Gateway context remains bounded after routing
    Given the user invokes the sdd skill for any valid route
    When the route is resolved and the subagent is spawned
    Then the sdd skill session contains only intake, the spec.md frontmatter, the inlined routing table, and the route report
    And no sub-skill body is loaded into the sdd skill session

  # ── errors ─────────────────────────────────────────────────────────────

  Scenario: Report an error on an ambiguous nonempty request
    Given the user invokes the sdd skill with a nonempty request
    And the request does not resolve to any known SDD action
    When the agent invokes the sdd skill
    Then the agent reports that the request is unroutable
    And no SDD action is invoked
