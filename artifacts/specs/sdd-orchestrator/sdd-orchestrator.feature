Feature: SDD Orchestrator & the Plugin-Delegate Model

  # ── dispatch: writer ─────────────────────────────────────────────────────

  Scenario: Orchestrator dispatches to a declared plugin writer
    Given plan.md Plugin assignments names "aces-scenario-writer" as the writer for the "skill" domain
    When sdd-orchestrator runs the design phase for the "skill" domain
    Then it invokes the aces-scenario-writer delegate
    And it does not invoke the sdd-scenario-writer default

  Scenario: Orchestrator falls back to the default writer when no plugin is declared
    Given plan.md declares no writer for the "parser" domain
    When sdd-orchestrator runs the design phase for the "parser" domain
    Then it invokes the sdd-scenario-writer default delegate
    And the default writer produces generic boolean Gherkin with no domain criteria

  Scenario: A participating plugin always provides its own writer
    Given the "guide" domain is handled by the Quill plugin
    When sdd-orchestrator runs the design phase for the "guide" domain
    Then it invokes the quill-writer delegate
    And SDD does not classify the domain as simple or complex

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

  # ── suspend / resume ─────────────────────────────────────────────────────

  Scenario: Orchestrator suspends at a user-input checkpoint instead of asking
    Given sdd-orchestrator is running an autonomous segment for the "auth" domain
    When it reaches a point that requires user input to proceed
    Then it returns STATUS needs-input with the questions batched
    And it does not attempt to ask the user directly

  Scenario: The skill resumes the orchestrator after collecting answers
    Given the orchestrator returned STATUS needs-input with two questions
    When the skill asks the user and collects the answers
    Then the skill re-invokes the orchestrator with the answers included
    And the orchestrator reconstructs its state by reading spec.md and the .feature

  Scenario: Questions are batched within a segment, not asked one at a time
    Given three open questions block progress in the current segment
    When the orchestrator returns to the skill
    Then all three questions are returned in one batch

  Scenario: The workflow cursor is derived from artifact state across sessions
    Given a spec with status draft, aligned false, and two open markers
    When the orchestrator is invoked cold in a new session
    Then it determines the phase and remaining blockers from the files alone
    And no separate workflow journal is required

  # ── question persistence ─────────────────────────────────────────────────

  Scenario: A content gap persists as an inline marker, not a separate file
    Given the orchestrator cannot fill the Why section without PM input
    When the segment ends
    Then a "<!-- open: needs PM input -->" marker is written in spec.md
    And no questions.md file is created

  Scenario: A workflow-procedural question is not persisted
    Given the skill must know whether this is a new feature or a backfill
    When the skill asks the user and receives an answer
    Then the answer is used for this run
    And it is not written into spec.md or any other artifact

  # ── observations: the deferred axis ──────────────────────────────────────

  Scenario: A structural concern is emitted as a non-blocking observation
    Given the scenario-writer notices the "auth" scenarios duplicate the "billing" domain shape
    When it returns
    Then the concern is returned in OBSERVATIONS with owner architect
    And STATUS is not blocked by the concern

  Scenario: Observations bubble up and only the skill surfaces them
    Given a plugin delegate returned an OBSERVATIONS entry
    When the orchestrator aggregates delegate results
    Then it forwards the observation to the skill
    And the orchestrator does not write to the backlog or the corpus

  Scenario: An accepted structural observation lands in the product backlog
    Given the skill surfaced an architect observation at the spec gate
    When the user accepts it as deferred work
    Then the skill records it at product level, not in the triggering spec's markers

  Scenario: Curator observations accumulate and surface only at boundaries
    Given a delegate emits a curator observation during an ordinary segment
    When the segment completes
    Then the observation is appended to the candidate queue
    And it is not surfaced to the user until a Curator boundary is reached
