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
    Then it includes the domain coverage, the five-role map, and the plugin version
    And the top-level container is the sdd-plugins array

  Scenario: init rewrites a pre-orchestrator registry entry to the role map
    Given the registry holds an old-shape quill entry with scenario-advisor and implementer keys
    When init-quill runs
    Then it rewrites the entry to the role-to-agent map shape
    And the orchestrator never reads the old shape

  Scenario: init reconciles a stale registry entry against its own version
    Given .agents/universal-plugin.json records quill version 1.2.0
    And init-quill ships inside quill at version 1.3.0
    When init-quill runs on install, upgrade, or manual re-run
    Then it compares its own version against the recorded entry
    And it rewrites the entry when they differ
    And the orchestrator never compares versions at runtime

  Scenario: An omitted role key falls back to the naming convention
    Given a registry entry omits the impl-producer key entirely
    When the orchestrator resolves impl-producer
    Then it falls back to the convention name plugin-impl-producer

  Scenario: A null role value degenerates with no agent
    Given a registry entry sets the impl-producer key to null
    When the orchestrator resolves impl-producer
    Then the role degenerates to the generic Builder with no agent

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

  Scenario: A domain claimed by two plugins is disambiguated without looping
    Given both the aces and quill plugins cover the "guide" domain in the registry
    When sdd-orchestrator resolves the delegate for the "guide" domain
    Then it returns STATUS needs-input asking which plugin owns the domain
    And the skill writes the choice to the domain-plugin frontmatter map in spec.md
    And on resume the resolver reads that map before counting candidates
    And the suspend does not loop

  Scenario: The spec-producer writes the spec.md body and the impl side cannot
    Given the orchestrator dispatches the spec-producer for the "auth" domain
    When the spec-producer runs
    Then it may write the spec.md body and the .feature
    And it does not write the status, aligned, or domain-plugin frontmatter fields
    And neither the impl-producer nor the impl-judge may write spec.md or the .feature

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
    And its output is scaffolding that may be discarded or promoted at the freeze
    And the ship-quality impl-judge does not run during explore

  Scenario: An explore discovery is judged before it reshapes the contract
    Given an explore-mode impl-producer finds the .feature omits a token-refresh case
    When the discovery is routed back into the spec row
    Then it becomes a proposed .feature change judged by the spec-judge
    And the human at the spec gate decides whether the behavior is wanted
    And it is not absorbed into the contract unjudged

  Scenario: Explore-mode discoveries feed back as markers
    Given an explore-mode impl-producer finds the .feature omits a token-refresh case
    When it returns
    Then the discovery is returned as a content-gap and an OBSERVATIONS entry
    And the orchestrator writes an open marker in spec.md and re-invokes the spec-producer

  Scenario: The impl-producer co-produces the verification with the implementation
    Given the "auth" .feature is frozen with five scenarios
    When the orchestrator dispatches the impl-producer in implement mode
    Then it writes the implementation and one functional test or eval per frozen scenario
    And the verification is anchored to the frozen scenarios, not free-authored from its own sense of done

  Scenario: The impl-judge runs the producer's verification rather than authoring it
    Given the impl-producer has written one functional test or eval per frozen scenario
    When the impl-judge runs at the impl gate
    Then it runs the producer's verification and reports pass or fail per scenario
    And it does not author the functional tests or evals
    And it adds its own orthogonal structural and scope reading

  Scenario: The planner runs in explore alongside the spec, not after a gate
    Given the "auth" domain is in the exploratory loop
    When the orchestrator dispatches the plan-producer in explore mode
    Then it writes plan.md and tasks.md co-delivered with the spec and .feature
    And no plan-judge or task-judge is invoked
    And there is no plan gate between the spec and the plan
    And the plan and tasks are validated transitively by the implementation test result

  Scenario: Forward producers load the actor governances they embody
    Given the builder bar is codified as the builder actor governance
    When the impl-producer runs
    Then it loads the builder and architect actor governances
    And it shapes its output to meet those bars before the impl-judge runs

  Scenario: An actor governance is resolved from the registry with an SDD default
    Given the registry binds the aces plugin's builder governance to "aces-eval-bar"
    And it leaves the architect governance null
    When the orchestrator resolves governances for an aces domain
    Then the builder governance resolves to aces-eval-bar
    And the architect governance falls back to the SDD default

  Scenario: Scenarios are ordered to trace the workflow
    Given a .feature with scenarios for several lifecycle stages
    When a spec-producer writes them
    Then they are ordered top-to-bottom by workflow stage
    And each stage is grouped under a section comment

  Scenario: The spec-producer enriches spec.md for human consumption
    Given the spec-governance enrichment rule is loaded
    When a spec-producer writes spec.md and an idea is clearer as a picture
    Then it includes a diagram rather than a wall of prose
    And spec.md is formatted with headings, tables, and short paragraphs
    And the .feature stays plain boolean Gherkin

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

  Scenario: The iteration cap blocks and asks rather than auto-accepting
    Given the producer and judge have iterated the configured cap of three times without converging
    When the cap is hit
    Then the skill returns STATUS blocked with the failing scenarios batched
    And it asks the user to accept, keep looping, or change the spec
    And it never auto-accepts the unconverged result

  Scenario: The workflow cursor is derived from artifact state across sessions
    Given a spec with status draft, aligned false, and two open markers
    When the orchestrator is invoked cold in a new session
    Then it determines the phase and remaining blockers from the files alone
    And no separate workflow journal is required

  Scenario: MODE is derived from whether the .feature is frozen
    Given the orchestrator is about to dispatch a forward producer
    When the .feature is still a draft
    Then it dispatches in explore mode
    And when the .feature is frozen it dispatches in implement mode

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
    And the orchestrator does not spawn specs or write outside the spec it owns

  Scenario: Curator observations surface only at boundaries and dedupe by recurrence
    Given a delegate emits a curator observation matching an existing candidate spec
    When a Curator boundary is reached
    Then the skill bumps the candidate spec's recurrence instead of spawning a duplicate
    And it is not surfaced to the user until that boundary

  Scenario: A curator lesson spawns a spec that may target another monorepo project
    Given an accepted curator lesson applies to a sibling project in the monorepo
    When the skill spawns the spec
    Then the spec is created under that sibling project
    And it may carry an external-routing flag to sync to an external tracker

  # ── spec gate: Draft → Approved ──────────────────────────────────────────

  Scenario: A plugin-written .feature must pass validate-spec
    Given aces-scenario-writer produced specs/skill/skill.feature
    When validate-spec runs against the spec
    Then the .feature is checked for valid boolean Gherkin regardless of which delegate wrote it

  Scenario: validate-spec runs without NodeJS when npx is unavailable
    Given npx is not available in the environment
    When validate-spec runs the deterministic checks
    Then it falls back to an equivalent agent-level check
    And the gate still completes without a hard NodeJS dependency

  Scenario: validate-spec enforces domain criteria against a plugin-written .feature
    Given the "skill" domain criteria require every scenario to carry a trigger context
    And a scenario in skill.feature omits the trigger context
    When validate-spec runs
    Then validation fails
    And the report names the scenario missing the required field

  Scenario: A spec-producer that writes frontmatter control fields is rejected
    Given a spec-producer runs for the "skill" domain
    When the delegate attempts to write the status, aligned, or domain-plugin frontmatter
    Then the change is rejected
    And the spec-producer may write only the spec.md body and the .feature

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

  Scenario: An accepted structural observation spawns a new spec
    Given the skill surfaced an architect observation at the spec gate
    When the user accepts it as deferred work
    Then the skill spawns a new spec with priority and blocked-by
    And it does not record the concern in the triggering spec's markers

  # ── freeze: a strength gradient, co-delivered (Approved ≠ Implemented) ─────

  Scenario: A spec can be Approved with no implementation
    Given specs/auth/spec.md has passed the spec gate
    When its status is Approved
    Then no implementation is required for Approved
    And the status is not Implemented

  Scenario: Approval co-freezes the whole chain at descending strength
    Given the auth spec is co-delivered with spec.md, .feature, plan.md, and tasks.md
    When the spec gate firms the contract end
    Then spec.md and .feature are frozen firmest
    And plan.md is committed at lower strength
    And tasks.md stays live
    And there is no separate plan gate

  Scenario: Freeze is reversible when a deal-breaker emerges
    Given an Approved spec with a frozen .feature
    When implementation reveals one scenario is a fatal deal-breaker
    Then the spec reverts to Draft
    And the freeze did not make the contract absolute

  Scenario: A plan change ripples to the .feature expression but not its essence
    Given a frozen .feature and a chosen solution in plan.md
    When the plan changes to a different solution
    Then the .feature scenarios are re-expressed to test the new solution
    And the behavioral essence the scenarios guarantee stays intact

  Scenario: tasks.md is a dependency DAG, not a flat todo
    Given tasks.md for the auth domain
    When it is inspected
    Then each task has an id, dependency edges, and traceability to a .feature scenario
    And task order is emergent from the graph rather than authored
    And tasks.md is regenerated as the plan changes rather than hard-frozen

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
    And the impl-producer builds the artifact and its verification against the frozen .feature
    And the impl-judge runs that verification against the frozen .feature

  Scenario: The impl-judge runs the test result the producer authored
    Given the impl gate evaluates the "auth" implementation
    And the impl-producer has written the functional verification from the frozen .feature
    When the impl-judge runs
    Then it runs the producer's verification rather than authoring it
    And the test result combines the producer's functional tests with the judge's own structural checks
    And the impl-producer does not declare its own pass verdict

  Scenario: Product and test separation stays inside the impl-producer
    Given a security domain wants separate product-code and test-code writers
    When the orchestrator dispatches the impl-producer
    Then the split is handled inside the plugin's impl-producer
    And the orchestrator does not learn whether the split happened

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

  Scenario: ACES evals are authored by the impl-producer and run by the impl-judge
    Given the "skill" domain uses ACES
    When the orchestrator resolves who authors the evals
    Then the evals are authored by the impl-producer that writes the agent config
    And aces-implementer as the impl-judge runs the evals rather than authoring them
    And independence holds because the evals are anchored to the frozen .feature and run by a separate runner

  Scenario: Degenerate roles fall back without a plugin agent
    Given the "guide" domain declares no impl-producer and a static spec-judge
    When sdd-orchestrator runs the full loop
    Then impl-producing is done by the generic Builder with no agent
    And spec-judging runs as static criteria with no judge agent

  Scenario: A plugin author reads the interface from the orchestrator and default delegates
    Given a plugin author wants to implement a new impl-judge delegate
    When they read the sdd-orchestrator definition and the sdd-implementer default
    Then the input and output contract is fully specified without a separate governance file
