Feature: SDD Operator — Deliver Phase (build & judge against the frozen contract)

  # Scenarios trace the Deliver phase top-to-bottom — build against the frozen
  # contract (producer inline-warm or named-spawn) → judge cold → rubric-as-detail
  # → the impl gate — per the scenario-ordering convention in sdd:spec-governance.

  # ── deliver: build against the frozen contract (warm inline vs named spawn) ─

  Scenario: An unnamed impl-producer is built inline against the frozen contract
    Given the "auth" .feature is frozen
    And no plugin agent and no model-tuned agent is named for the impl-producer role
    When sdd-operator runs the deliver loop for the domain
    Then it loads the SDD-default impl-producer governance and builds the implementation and one verification per frozen scenario inline
    And it does not spawn a default impl-producer agent
    And it records produced-by.impl-producer as sdd:sdd-operator

  Scenario: A named impl-producer agent is spawned at its own model
    Given the "auth" .feature is frozen
    And the impl-producer slot names an agent in the registry or produced-by map
    And the named agent may be a plugin delegate or a model-tuned producer agent
    When sdd-operator runs the deliver loop for the domain
    Then it spawns that named agent
    And it does not build the impl-producer artifact inline

  Scenario: The deliver loop blocks when the impl-producer returns no artifacts
    Given the "auth" .feature is frozen
    When the impl-producer returns no implementation and no verification for the domain
    Then sdd-operator does not run the impl-judge
    And it leaves aligned false
    And it surfaces the BLOCKER

  Scenario: The impl-judge is spawned cold and runs the producer's verification
    Given the impl gate evaluates the "auth" implementation
    And the impl-producer has written the functional verification from the frozen .feature
    When sdd-operator runs the impl-judge
    Then it spawns the impl-judge as a cold agent
    And the cold impl-judge runs the producer's verification and reports pass or fail per scenario
    And it does not author the functional tests or evals
    And it adds its own orthogonal structural and scope reading
    And the impl-producer does not declare its own pass verdict

  # ── the rubric is a validation detail, not in the contract ────────────────

  Scenario: The .feature carries no rubric
    Given the impl-producer authored a 1-5 rubric for a scenario
    When the .feature file is inspected
    Then it contains only boolean Given/When/Then scenarios
    And no rubric, threshold, or score appears in the .feature

  Scenario: A graded subject at or above threshold yields a passing scenario
    Given a graded subject is evaluated for a frozen scenario over N runs
    When the aggregate score meets or exceeds the threshold
    Then the impl-judge reports that scenario as passing

  Scenario: A graded subject below threshold yields a failing scenario
    Given a graded subject is evaluated for a frozen scenario over N runs
    When the aggregate score is below the threshold
    Then the impl-judge reports that scenario as failing

  # ── impl gate: impl-layer aligned, Approved → Implemented ─────────────────

  Scenario: A frozen scenario with no verification is reported failing
    Given a frozen scenario has no verification authored for it
    When the cold impl-judge runs at the impl gate
    Then it reports that scenario as failing
    And sdd-operator leaves aligned false

  Scenario: aligned at the impl gate checks the impl layer
    Given specs/auth has Status Approved and a frozen .feature
    And the impl layer conforms to the frozen .feature while the spec layer has unrelated drift
    When the impl gate evaluates alignment
    Then sdd-operator sets aligned true

  Scenario: aligned is true only when every impl-judge passes
    Given two sub-domains each with a declared impl-judge
    When every impl-judge returns IMPLEMENTATION_PASS true
    Then sdd-operator sets aligned true in spec.md frontmatter

  Scenario: aligned stays false when any impl-judge fails
    Given two sub-domains each with a declared impl-judge
    When one impl-judge returns IMPLEMENTATION_PASS false with a BLOCKER
    Then sdd-operator leaves aligned false
    And it surfaces the BLOCKER
