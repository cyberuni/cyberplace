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

  # ── two gates, one backward face per actor ───────────────────────────────

  Scenario: A spec can be Approved with no implementation
    Given specs/auth/spec.md has passed the spec gate
    When its status is Approved
    Then no implementation is required for Approved
    And the status is not Implemented

  Scenario: The .feature is the object at the spec gate and the bar at the impl gate
    Given the spec gate judged auth.feature against the domain criteria
    When the spec advances to Approved and auth.feature is frozen
    Then the impl gate judges the implementation against auth.feature as the bar

  Scenario: The spec-gate judge is a domain delegate, not SDD
    Given the "skill" domain declares aces-spec-validator
    When the spec gate evaluates skill.feature against domain criteria
    Then SDD delegates the domain judgment to aces-spec-validator
    And SDD's generic validate-spec does not judge domain contract quality

  Scenario: A static-bar domain needs no spec-gate judge agent
    Given the "guide" domain declares only static doc criteria
    When the spec gate evaluates guide.feature
    Then validate-spec runs the static criteria directly
    And no spec-gate judge agent is invoked

  # ── the 2x2: four roles ──────────────────────────────────────────────────

  Scenario: The orchestrator resolves all four roles per cell
    Given the "skill" domain is fully handled by the ACES plugin
    When sdd-orchestrator runs the full loop
    Then it resolves spec-producer, spec-judge, impl-producer, and impl-judge to ACES agents

  Scenario: Degenerate cells fall back without a plugin agent
    Given the "guide" domain declares no impl-producer and a static spec-judge
    When sdd-orchestrator runs the full loop
    Then impl-producing is done by the generic Builder with no agent
    And spec-judging runs as static criteria with no judge agent

  Scenario: The exploratory loop is the spec row
    Given the "auth" domain is in the exploratory loop
    When the spec-producer and spec-judge iterate
    Then they shape the .feature until the spec gate freezes it

  Scenario: The implementation loop is the impl row
    Given the "auth" .feature is frozen
    When the impl-producer and impl-judge iterate
    Then they build and verify the artifact against the frozen .feature

  # ── layer-scoped aligned ─────────────────────────────────────────────────

  Scenario: aligned at the spec gate checks only the contract layer
    Given exploratory spike code exists alongside a Draft spec
    When the spec gate evaluates alignment
    Then aligned considers only spec.md and the .feature
    And the spike code does not block the spec from reaching Approved

  Scenario: aligned at the impl gate checks the impl layer
    Given specs/auth has Status Approved and a frozen .feature
    When the impl gate evaluates alignment
    Then aligned requires the impl layer to conform to the frozen .feature
