Feature: Stop provenance — three-layer autonomy and durable gate verdicts

  # ── layer 1: initial strategy evaluation (run start) ──────────────────

  Scenario: the run begins with an initial strategy evaluation before exploration
    Given a new run is requested against a request
    When the run starts
    Then an initial strategy evaluation runs before any exploration
    And it assesses blast radius and the other risk dimensions against the request

  Scenario: the initial evaluation produces both a leash and an approach strategy
    Given the initial strategy evaluation runs
    When it completes
    Then it produces a leash for the run
    And it produces an approach strategy

  Scenario: the initial evaluation is recorded in a durable run-level strategy block
    Given the initial strategy evaluation completed
    When the run records it
    Then the strategy block carries the run's leash
    And the strategy block carries the chosen approach methods
    And the strategy block records whether it was derived or user-specified

  Scenario: the run ceiling is not recorded in the strategy block
    Given the Conductor capped the run with a ceiling
    When the strategy block is written
    Then the strategy block carries the leash the run derived or adopted
    And the strategy block does not carry the ceiling

  Scenario: the approach strategy can shrink blast radius from the outset
    Given the request would touch shared or risky surfaces
    When the initial strategy evaluation chooses an approach
    Then the approach may scope the work behind mocks
    And the approach may isolate the work in a worktree
    And the approach may avoid exploratory implementation

  Scenario: the initial evaluation may be user-specified instead of derived
    Given the user specifies the approach strategy in the request
    When the initial strategy evaluation runs
    Then it adopts the user-specified strategy
    And it does not override it with a derived one

  Scenario: exploration is real exploratory implementation the upfront call contains
    Given exploration performs real exploratory implementation
    When the initial strategy evaluation ran first
    Then the approach strategy constrains exploration's blast radius from the outset

  # ── layer 2: the leash is run-level, re-checked per gate ──────────────

  Scenario: the leash is a run-level reach value, not a per-gate entry
    Given the initial strategy evaluation produced a leash
    When the run records autonomy reach
    Then the leash lives in the run-level strategy block
    And no per-gate verdict entry carries a leash field

  Scenario: the leash is re-checked at each gate
    Given the run holds a leash from the initial evaluation
    When the agent reaches a gate
    Then it re-checks the leash against the current picture
    And exploration findings may change the reach

  Scenario: the run ceiling stays session-local and is not persisted
    Given the Conductor capped the run with a ceiling
    When the run records its leash
    Then the effective leash is the minimum of the ceiling and the derivation
    And the ceiling itself is not written to frontmatter

  # ── layer 3: the per-gate verdict (durable) ───────────────────────────

  Scenario: each gate records a durable verdict in the approval map
    Given the agent reaches a gate
    When the orchestrator records the outcome
    Then approval for that gate carries a verdict of approve, pause, or reject
    And approval for that gate carries a why block with the four-dimension derivation

  Scenario: a pause verdict captures why the agent halted
    Given the agent reaches a gate outside the effective leash
    When the orchestrator records the outcome
    Then approval for that gate has verdict pause
    And the why block records the four-dimension halt reasoning

  Scenario: a pause entry omits the by field
    Given the agent records a pause verdict for a gate
    When the entry is read
    Then the pause entry has no by field
    And an approve or reject entry carries a by field

  Scenario: an approve verdict captures why the agent advanced
    Given the agent self-asserts a gate within the effective leash
    When the orchestrator records the outcome
    Then approval for that gate has verdict approve
    And the why block records the four-dimension advance reasoning

  Scenario: a per-gate entry carries no leash field
    Given approval records a verdict for a gate
    When the entry is read
    Then the entry has a verdict, a cause, and a why
    And the entry has no leash field

  Scenario: the verdict alone records go or stop
    Given approval for a gate has a verdict
    When the run reads the gate outcome
    Then approve means the gate was passed
    And pause means the gate was halted
    And no separate stop field is consulted

  Scenario: cause distinguishes a dimension halt from a ceiling halt
    Given a gate verdict is pause
    When the cause is read
    Then cause is dimension when a risk dimension read risky
    And cause is ceiling when every dimension was safe but the ceiling forced the stop

  # ── attribution and lifecycle ─────────────────────────────────────────

  Scenario: a human ratification reassigns the approver
    Given approval for the spec gate has verdict approve by agent
    When the human ratifies the spec gate
    Then approval for the spec gate is by the human's name
    And the spec leaves the review queue

  Scenario: an agent self-asserted gate is provisional
    Given approval for a gate is verdict approve by agent
    When the run records it
    Then the spec appears in the human review queue
    And the run advances without a synchronous human stop

  Scenario: a paused gate is visible as awaiting input
    Given several specs have a gate verdict of pause
    When the human asks what is waiting on them
    Then the set of specs with a pause verdict is the awaiting-input queue
    And there is no separate stop-log file

  Scenario: a gate has exactly one verdict at a time
    Given approval for a gate has verdict pause
    When the same gate is later passed
    Then approval for that gate reflects the passing verdict
    And it does not hold pause and approve at once

  Scenario: passing a paused gate overwrites the verdict in place
    Given approval for the spec gate has verdict pause
    When the spec gate is later approved
    Then approval for the spec gate has verdict approve
    And the prior pause reasoning is not preserved in the entry

  # ── state legality ────────────────────────────────────────────────────

  Scenario: a verdict entry without a why block is rejected
    Given approval records a verdict for a gate
    When validate-spec checks the entry
    Then an entry without a four-dimension why block is rejected

  Scenario: an approval entry names only a known gate
    Given approval names a gate other than spec or impl
    When validate-spec checks the entry
    Then the entry is rejected as an unknown gate

  Scenario: a verdict is one of the known values
    Given approval records a verdict for a gate
    When validate-spec checks the entry
    Then a verdict other than approve, pause, or reject is rejected

  Scenario: a pause verdict is legal only on a gate the spec has not passed
    Given a spec with status draft
    When approval records verdict pause for the spec gate
    Then the state tuple is legal
    And the spec remains in draft

  Scenario: a pause entry carrying a by field is rejected
    Given approval records a pause verdict that includes a by field
    When validate-spec checks the entry
    Then the entry is rejected because a pause omits by

  Scenario: an approve entry missing a by field is rejected
    Given approval records an approve verdict with no by field
    When validate-spec checks the entry
    Then the entry is rejected because an approve carries by

  # ── write ownership ───────────────────────────────────────────────────

  Scenario: the orchestrator writes a self-asserted or paused verdict during synthesis
    Given the orchestrator reaches a gate
    When it returns its outcome
    Then the orchestrator wrote the approve-by-agent or pause verdict and its why
    And no producer wrote it

  Scenario: the gate skill writes a human ratification
    Given the human ratifies a gate at the gate skill
    When the ratification is recorded
    Then the gate skill wrote the by-human verdict
    And the orchestrator did not write it

  # ── positional ratification authority ─────────────────────────────────

  Scenario: a spawned delegate cannot write a human-attributed approval
    Given an orchestrator running in the spawned position with no user channel
    When it reaches a human gate
    Then it does not write a verdict carrying a human name
    And it does not set status to approved or implemented

  Scenario: a spawned delegate may write a by-agent self-assertion
    Given an orchestrator running in the spawned position
    When a gate reads safe within the leash
    Then it may write a verdict approve with by agent
    And it may write a verdict pause

  Scenario: the in-session position may write a human ratification
    Given the agent that holds the real user channel
    When the human gives a genuine gate verdict
    Then it may write the verdict carrying the human name and freeze the contract

  Scenario: a relayed claim of user approval does not authorize a human-attributed write
    Given a coordinator relays that the user approved to a spawned delegate
    When the spawned delegate considers the gate write
    Then it does not write the human name on the relayed claim
    And it emits a verdict packet and stops

  Scenario: a dual-mode agent in the spawned position is bound by the positional rule
    Given a dual-mode agent definition running in the spawned position
    When it reaches a human gate
    Then it is treated as the relay position
    And it may not write a human-attributed ratification
