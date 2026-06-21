Feature: SDD Orchestrator & the Plugin-Delegate Model

  # Scenarios trace the SDD lifecycle top-to-bottom — setup → exploratory loop
  # → spec gate → freeze → implementation loop → impl gate → invariants — per
  # the scenario-ordering convention in sdd:spec-governance.

  # ── setup: resolve plugins (the lockfile) ────────────────────────────────

  Scenario: The orchestrator resolves roles from the registry without scanning
    Given .agents/universal-plugin.json lists quill with its role-to-agent map
    When sdd-orchestrator resolves delegates for a Quill-owned domain
    Then it resolves the role-to-agent map from .agents/universal-plugin.json
    And it does not scan user-global, project-global, or project-local plugin directories

  Scenario: init-plugin writes the resolved role map at setup
    Given the user runs init-quill
    When the registry entry is written
    Then it includes the domain coverage, the role-to-agent map, and the plugin version

  Scenario: init reconciles a stale registry entry against its own version
    Given .agents/universal-plugin.json records quill version 1.2.0
    And init-quill ships inside quill at version 1.3.0
    When init-quill runs on install, upgrade, or manual re-run
    Then it compares its own version against the recorded entry
    And it rewrites the entry when they differ
    And the orchestrator never compares versions at runtime

  Scenario: An omitted role cell falls back to convention or degenerates
    Given a registry entry omits the impl-producer cell
    When the orchestrator resolves impl-producer
    Then it falls back to the convention name or treats the cell as degenerate

  Scenario: Spec-producers load the SDD governance skill for format rules
    Given sdd:spec-governance is a user-invocable:false skill in the sdd plugin
    When a plugin spec-producer needs the .feature format conventions
    Then it loads sdd:spec-governance via the harness
    And it does not call governance show

  Scenario: The loop runs without a governance-show call
    Given no governances/ directory exists for the SDD plugin
    When sdd-orchestrator runs the full loop
    Then it resolves the producer and judge roles from the delegate definitions
    And it makes no governance show call

  # ── exploratory loop: shape the spec, and probe it by attempting the build ─

  Scenario: Orchestrator dispatches to the plugin that covers the domain
    Given the registry maps the "skill" domain to the aces plugin
    And aces declares "aces-scenario-writer" as its spec-producer
    When sdd-orchestrator runs the design phase for the "skill" domain
    Then it invokes the aces-scenario-writer delegate
    And it does not invoke the sdd-scenario-writer default

  Scenario: Orchestrator falls back to the default spec-producer when no plugin covers the domain
    Given no registered plugin covers the "parser" domain
    When sdd-orchestrator runs the design phase for the "parser" domain
    Then it invokes the sdd-scenario-writer default delegate
    And the default spec-producer produces generic boolean Gherkin with no domain criteria

  Scenario: A domain claimed by two plugins is disambiguated by the user and recorded
    Given both the aces and quill plugins cover the "guide" domain in the registry
    When sdd-orchestrator resolves the delegate for the "guide" domain
    Then it returns STATUS needs-input asking which plugin owns the domain
    And the chosen mapping is recorded in spec.md
    And later resolution reads the choice from spec.md without re-asking

  Scenario: A participating plugin always provides its own spec-producer
    Given the "guide" domain is handled by the Quill plugin
    When sdd-orchestrator runs the design phase for the "guide" domain
    Then it invokes the quill-writer delegate
    And SDD does not classify the domain as simple or complex

  Scenario: The exploratory loop shapes the spec and probes it by building
    Given the "auth" domain is in the exploratory loop
    When the spec-producer and spec-judge iterate
    And the orchestrator also runs forward producers in explore mode
    Then they shape the .feature until the spec gate freezes it

  Scenario: An explore-mode producer builds against the draft, not a frozen contract
    Given the "auth" .feature is still a draft
    When the orchestrator dispatches the impl-producer in explore mode
    Then the producer spikes against the draft .feature
    And its output is throwaway scaffolding
    And no impl-judge runs because there is no frozen bar

  Scenario: Explore-mode discoveries feed back into the spec row
    Given an explore-mode impl-producer finds the .feature omits a token-refresh case
    When it returns
    Then the discovery is returned as a content-gap and an OBSERVATIONS entry
    And the orchestrator writes an open marker in spec.md and re-invokes the spec-producer

  Scenario: The planner produces plan and tasks but is not judged
    Given the "auth" domain needs a solution design
    When the orchestrator dispatches the plan-producer
    Then it writes plan.md and tasks.md
    And no plan-judge or task-judge is invoked
    And the plan and tasks are validated transitively by the implementation test result

  Scenario: Forward producers load the judges' governance skills to self-align
    Given the impl gate's testability bar is codified as a governance skill
    When the impl-producer runs
    Then it loads the testability governance skill
    And it shapes its output to meet that bar before the impl-judge runs

  Scenario: Scenarios are ordered to trace the workflow
    Given a .feature with scenarios for several lifecycle stages
    When a spec-producer writes them
    Then they are ordered top-to-bottom by workflow stage
    And each stage is grouped under a section comment

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

  Scenario: A structural concern is emitted as a non-blocking observation
    Given a spec-producer notices the "auth" scenarios duplicate the "billing" domain shape
    When it returns
    Then the concern is returned in OBSERVATIONS with owner architect
    And STATUS is not blocked by the concern

  Scenario: Observations bubble up and only the skill surfaces them
    Given a plugin delegate returned an OBSERVATIONS entry
    When the orchestrator aggregates delegate results
    Then it forwards the observation to the skill
    And the orchestrator does not write to the backlog or the corpus

  Scenario: Curator observations accumulate and surface only at boundaries
    Given a delegate emits a curator observation during an ordinary segment
    When the segment completes
    Then the observation is appended to the candidate queue
    And it is not surfaced to the user until a Curator boundary is reached

  # ── spec gate: Draft → Approved ──────────────────────────────────────────

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

  Scenario: A spec-producer that modifies spec.md is rejected
    Given a spec-producer runs for the "skill" domain
    When the delegate attempts to modify spec.md
    Then the change is rejected
    And only the .feature file may be written by a spec-producer

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

  Scenario: aligned at the spec gate checks only the contract layer
    Given exploratory spike code exists alongside a Draft spec
    When the spec gate evaluates alignment
    Then aligned considers only spec.md and the .feature
    And the spike code does not block the spec from reaching Approved

  Scenario: An accepted structural observation lands in the product backlog
    Given the skill surfaced an architect observation at the spec gate
    When the user accepts it as deferred work
    Then the skill records it at product level, not in the triggering spec's markers

  # ── freeze: the contract locks (Approved ≠ Implemented) ──────────────────

  Scenario: A spec can be Approved with no implementation
    Given specs/auth/spec.md has passed the spec gate
    When its status is Approved
    Then no implementation is required for Approved
    And the status is not Implemented

  Scenario: The .feature is the object at the spec gate and the bar at the impl gate
    Given the spec gate judged auth.feature against the domain criteria
    When the spec advances to Approved and auth.feature is frozen
    Then the impl gate judges the implementation against auth.feature as the bar

  # ── implementation loop: plan, build, and judge against the frozen contract ─

  Scenario: Orchestrator dispatches to the plugin impl-judge that covers the domain
    Given the registry maps the "guide" domain to the quill plugin
    And quill declares "quill-implementer" as its impl-judge
    When sdd-orchestrator runs the implementation phase for the "guide" domain
    Then it invokes the quill-implementer delegate
    And it does not invoke the sdd-implementer default

  Scenario: Orchestrator falls back to the default impl-judge when no plugin covers the domain
    Given no registered plugin covers the "parser" domain
    When sdd-orchestrator runs the implementation phase for the "parser" domain
    Then it invokes the sdd-implementer default delegate
    And the default reports IMPLEMENTATION_PASS true only when every scenario has a passing test

  Scenario: The implementation loop plans, builds, and judges against the frozen contract
    Given the "auth" .feature is frozen
    When the plan-producer, impl-producer, and impl-judge run
    Then the planner writes plan.md and tasks.md in implement mode
    And the impl-producer builds the artifact against the frozen .feature
    And the impl-judge verifies it against the frozen .feature

  Scenario: The impl-judge produces and runs the test result
    Given the impl gate evaluates the "auth" implementation
    When the impl-judge runs
    Then it produces the verification from the frozen .feature and runs it
    And the test result combines functional tests and structural checks
    And the impl-producer does not author its own pass verdict

  Scenario: Product and test separation stays inside the impl-producer
    Given a security domain wants separate product-code and test-code writers
    When the orchestrator dispatches the impl-producer
    Then the split is handled inside the plugin's impl-producer
    And the orchestrator does not learn whether the split happened

  Scenario: The .feature carries no rubric
    Given aces-implementer owns a 1-5 rubric for a scenario
    When the .feature file is inspected
    Then it contains only boolean Given/When/Then scenarios
    And no rubric, threshold, or score appears in the .feature

  Scenario: A graded subject still yields a boolean per scenario
    Given aces-implementer evaluates a scenario with a rubric and a threshold over N runs
    When the aggregate score meets or exceeds the threshold
    Then the impl-judge reports that scenario as passing
    And reports failing when the aggregate score is below the threshold

  # ── impl gate: Approved → Implemented ────────────────────────────────────

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

  # ── model invariants: the production chain and producer ≠ judge ───────────

  Scenario: The orchestrator resolves every production-chain role
    Given the "skill" domain is fully handled by the ACES plugin
    When sdd-orchestrator runs the full loop
    Then it resolves spec-producer, plan-producer, impl-producer, spec-judge, and impl-judge to ACES agents

  Scenario: ACES evals belong to the impl-judge, not the impl-producer
    Given the "skill" domain uses ACES
    When the orchestrator resolves who authors the evals
    Then the evals are owned by aces-implementer as the impl-judge
    And the impl-producer that writes the agent config does not author its own evals

  Scenario: Degenerate roles fall back without a plugin agent
    Given the "guide" domain declares no impl-producer and a static spec-judge
    When sdd-orchestrator runs the full loop
    Then impl-producing is done by the generic Builder with no agent
    And spec-judging runs as static criteria with no judge agent

  Scenario: A plugin author reads the interface from the orchestrator and default delegates
    Given a plugin author wants to implement a new impl-judge delegate
    When they read the sdd-orchestrator definition and the sdd-implementer default
    Then the input and output contract is fully specified without a separate governance file
