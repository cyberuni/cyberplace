Feature: SDD Orchestrator & the Plugin-Delegate Model

  # ── dispatch: writer ─────────────────────────────────────────────────────

  Scenario: Orchestrator dispatches to a declared plugin writer
    Given plan.md Plugin assignments names "aces-scenario-writer" as the writer for the "skill" domain
    When sdd-orchestrator runs the design phase for the "skill" domain
    Then it invokes the aces-scenario-writer delegate
    And it does not invoke the sdd-scenario-writer default

  Scenario: Orchestrator falls back to the default writer when none is declared
    Given plan.md declares no writer for the "parser" domain
    When sdd-orchestrator runs the design phase for the "parser" domain
    Then it invokes the sdd-scenario-writer default delegate
    And the default writer is fed the domain criteria as input

  # ── dispatch: implementer ────────────────────────────────────────────────

  Scenario: Orchestrator dispatches to a declared plugin implementer
    Given plan.md Plugin assignments names "quill-implementer" as the implementer for the "guide" domain
    When sdd-orchestrator runs the implementation phase for the "guide" domain
    Then it invokes the quill-implementer delegate
    And it does not invoke the sdd-implementer default

  Scenario: Orchestrator falls back to the default implementer when none is declared
    Given plan.md declares no implementer for the "parser" domain
    When sdd-orchestrator runs the implementation phase for the "parser" domain
    Then it invokes the sdd-implementer default delegate
    And the default reports IMPLEMENTATION_PASS true only when every scenario has a passing test

  # ── synthesis ────────────────────────────────────────────────────────────

  Scenario: aligned is true only when every implementer passes
    Given two sub-domains each with a declared implementer
    When every implementer returns IMPLEMENTATION_PASS true
    Then sdd-orchestrator sets aligned true in spec.md frontmatter

  Scenario: aligned stays false when any implementer fails
    Given two sub-domains each with a declared implementer
    When one implementer returns IMPLEMENTATION_PASS false with a BLOCKER
    Then sdd-orchestrator leaves aligned false
    And it surfaces the BLOCKER to the user

  # ── format authority lives in validation ────────────────────────────────

  Scenario: A plugin-written .feature must pass validate-spec
    Given aces-scenario-writer produced specs/skill/skill.feature
    When validate-spec runs against the spec
    Then the .feature is checked for valid boolean Gherkin regardless of which delegate wrote it

  Scenario: validate-spec enforces domain criteria against a plugin-written .feature
    Given the "skill" domain criteria require every scenario to carry a trigger context
    And a scenario in skill.feature omits the trigger context
    When validate-spec runs
    Then validation fails
    And the report names the scenario missing the required field

  Scenario: A writer delegate that modifies spec.md is rejected
    Given a writer delegate runs for the "skill" domain
    When the delegate attempts to modify spec.md
    Then the change is rejected
    And only the .feature file may be written by a writer delegate

  # ── rubric is a validation-detail ────────────────────────────────────────

  Scenario: The .feature carries no rubric
    Given aces-implementer owns a 1-5 rubric for a scenario
    When the .feature file is inspected
    Then it contains only boolean Given/When/Then scenarios
    And no rubric, threshold, or score appears in the .feature

  Scenario: A graded subject still yields a boolean per scenario
    Given aces-implementer evaluates a scenario with a rubric and a threshold over N runs
    When the aggregate score meets or exceeds the threshold
    Then the implementer reports that scenario as passing
    And reports failing when the aggregate score is below the threshold

  # ── governance dissolution ───────────────────────────────────────────────

  Scenario: The loop runs without a governance-show call
    Given no governances/ directory exists for the SDD plugin
    When sdd-orchestrator runs the full loop
    Then it resolves the writer and implementer interfaces from the delegate definitions
    And it makes no governance show call

  Scenario: A plugin author reads the interface from the orchestrator and default delegates
    Given a plugin author wants to implement a new implementer delegate
    When they read the sdd-orchestrator definition and the sdd-implementer default
    Then the input and output contract is fully specified without a separate governance file
