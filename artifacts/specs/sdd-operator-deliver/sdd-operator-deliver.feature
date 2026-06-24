Feature: SDD Operator — Deliver Phase (build & judge against the frozen contract)

  # Scenarios trace the Deliver phase top-to-bottom — build & judge against the
  # frozen contract → rubric-as-detail → the impl gate — per the
  # scenario-ordering convention in sdd:spec-governance.

  # ── deliver: build and judge against the frozen contract ──────────────────

  Scenario: The implementation loop plans, builds, and judges against the frozen contract
    Given the "auth" .feature is frozen
    When the plan-producer, impl-producer, and impl-judge run
    Then the planner writes plan.md and tasks.md in deliver mode
    And the impl-producer builds the artifact and its verification against the frozen .feature
    And the impl-judge runs that verification against the frozen .feature

  Scenario: The impl-judge runs the test result the producer authored
    Given the impl gate evaluates the "auth" implementation
    And the impl-producer has written the functional verification from the frozen .feature
    When the impl-judge runs
    Then it runs the producer's verification rather than authoring it
    And the test result combines the producer's functional tests with the judge's own structural checks
    And the impl-producer does not declare its own pass verdict

  # ── the rubric is a validation detail, not in the contract ────────────────

  Scenario: The .feature carries no rubric
    Given the impl-producer authored a 1-5 rubric for a scenario
    When the .feature file is inspected
    Then it contains only boolean Given/When/Then scenarios
    And no rubric, threshold, or score appears in the .feature

  Scenario: A graded subject still yields a boolean per scenario
    Given aces-implementer runs a scenario's rubric and threshold over N runs
    When the aggregate score meets or exceeds the threshold
    Then the impl-judge reports that scenario as passing
    And reports failing when the aggregate score is below the threshold

  # ── impl gate: impl-layer aligned, Approved → Implemented ─────────────────

  Scenario: aligned at the impl gate checks the impl layer
    Given specs/auth has Status Approved and a frozen .feature
    When the impl gate evaluates alignment
    Then aligned requires the impl layer to conform to the frozen .feature

  Scenario: aligned is true only when every impl-judge passes
    Given two sub-domains each with a declared impl-judge
    When every impl-judge returns IMPLEMENTATION_PASS true
    Then sdd-orchestrator sets aligned true in spec.md frontmatter

  Scenario: aligned stays false when any impl-judge fails
    Given two sub-domains each with a declared impl-judge
    When one impl-judge returns IMPLEMENTATION_PASS false with a BLOCKER
    Then sdd-orchestrator leaves aligned false
    And it surfaces the BLOCKER to the user
