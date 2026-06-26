Feature: Dedupe specs

  # ── invocation ─────────────────────────────────────────────────────────

  Scenario: User invokes dedupe directly
    Given the user says "dedupe these specs" for a named set of specs
    When the agent invokes the dedupe-specs skill
    Then the agent reads each candidate spec.md and its .feature
    And the agent produces a dedupe plan before changing any file

  Scenario: Gateway routes a dedupe request to dedupe-specs
    Given the dedupe-specs skill exists
    And the user picks "manage specs & graph" then "dedupe overlapping specs"
    When the sdd gateway resolves the route
    Then the agent invokes the dedupe-specs analysis
    And the agent does not surface the dedupe analysis as manual

  # ── analysis and plan ──────────────────────────────────────────────────

  Scenario: Flag substantial overlap only
    Given two candidate specs share a behavior and several specs reuse a common term
    When the agent runs the overlap analysis
    Then the plan flags the two specs that share the behavior as overlapping
    And the plan does not flag the reused common term as duplication

  Scenario: Propose a survivor with stated criteria
    Given a set of overlapping candidate specs
    When the agent proposes a dedupe plan
    Then the plan names the surviving spec
    And the plan states why that spec was chosen as the survivor
    And the plan lists the specs to collapse into the survivor

  Scenario: Ask the user to choose a peer survivor
    Given overlapping specs with equal coverage and status
    When the survivor criteria are inconclusive
    Then the agent asks the user to choose the survivor
    And the agent does not pick the survivor silently

  Scenario: Plan records edge rewrites
    Given a dedupe plan that deprecates at least one spec
    When the agent presents the plan
    Then the plan states which blocked-by edges are rewritten toward the survivor

  # ── approval gate ──────────────────────────────────────────────────────

  Scenario: Require approval before acting
    Given the agent has produced a dedupe plan
    When no user approval has been given
    Then no spec is rewritten
    And no redundant spec is deprecated

  Scenario: Report-only mode does not act
    Given the user asks whether any specs are redundant
    When the agent runs the overlap scan
    Then the agent reports the findings
    And the agent does not rewrite or deprecate any spec

  Scenario: Delegate merge authoring after approval
    Given the user approves the dedupe plan
    When the agent acts on the plan
    Then the agent delegates the merge authoring to create-spec
    And the agent does not rewrite spec.md or the .feature itself

  # ── boundaries ─────────────────────────────────────────────────────────

  Scenario: Do not edit a frozen survivor in place
    Given the surviving spec has status approved
    When the merge would change its scenarios
    Then the agent routes the survivor through the draft re-open path first
    And the agent does not edit the frozen .feature directly

  Scenario: Retain redundant specs via deprecation
    Given the dedupe plan is approved and the survivor absorbs the overlap
    When the redundant specs are retired
    Then each redundant spec is deprecated rather than deleted
