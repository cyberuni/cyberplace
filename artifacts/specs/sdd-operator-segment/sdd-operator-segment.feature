Feature: SDD Operator — The Segment: Suspend/Resume & Observations

  # Scenarios trace one segment top-to-bottom — suspend/resume → questions &
  # markers → observations — per the scenario-ordering convention in
  # sdd:spec-governance.

  # ── one autonomous segment, suspend & resume ──────────────────────────────

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

  # ── questions & markers: two kinds, two homes ─────────────────────────────

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

  Scenario: The iteration cap blocks and asks rather than auto-accepting
    Given the producer and judge have iterated the configured cap of three times without converging
    When the cap is hit
    Then the skill returns STATUS blocked with the failing scenarios batched
    And it asks the user to accept, keep looping, or change the spec
    And it never auto-accepts the unconverged result

  # ── observations: non-blocking, bubble to the skill ───────────────────────

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

  Scenario: Strategist observations surface only at boundaries and dedupe by recurrence
    Given a delegate emits a strategist observation matching an existing candidate spec
    When a Strategist boundary is reached
    Then the skill bumps the candidate spec's recurrence instead of spawning a duplicate
    And it is not surfaced to the user until that boundary

  Scenario: A strategist lesson spawns a spec that may target another monorepo project
    Given an accepted strategist lesson applies to a sibling project in the monorepo
    When the skill spawns the spec
    Then the spec is created under that sibling project
    And it may carry an external-routing flag to sync to an external tracker

  Scenario: An accepted structural observation spawns a new spec
    Given the skill surfaced an architect observation at the spec gate
    When the user accepts it as deferred work
    Then the skill spawns a new spec with priority and blocked-by
    And it does not record the concern in the triggering spec's markers
