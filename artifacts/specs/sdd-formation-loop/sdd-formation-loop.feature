Feature: SDD formation loop — the Architect outer loop

  # The Warden keeps the corpus's ORDER OF BATTLE coherent: dedupe, split,
  # keep the graph sound, reconcile contradictions. Corpus-wide and
  # continuous — distinct from the per-spec structural judgment at a gate.

  # ── altitude: corpus-wide, distinct from the per-spec gate ────────────

  Scenario: the Formation loop acts across the whole corpus
    Given a corpus of many specs
    When the Formation loop runs
    Then it produces a finding set covering every spec in the corpus

  Scenario: the Formation loop does not fire as the per-spec gate structural check
    Given a single spec is at its gate
    When the gate's structural judgment runs
    Then the Formation loop does not run as that per-gate check

  Scenario: the per-spec gate judgment is not the Formation loop
    Given the gate emits a structural verdict for one spec
    When that verdict is recorded
    Then it advances only that one spec

  # ── split a monolith ──────────────────────────────────────────────────

  Scenario: an oversized spec triggers a split
    Given a spec whose feature file exceeds the granularity heuristic
    When the Formation loop evaluates that spec
    Then it runs the split-spec station on that spec

  Scenario: a split produces a project spec with feature children
    Given a monolith spanning more than one behavior
    When the split-spec station runs on it
    Then a project spec and its feature children are produced

  Scenario: a spec within the heuristic is not split
    Given a spec whose feature file is within the granularity heuristic
    When the Formation loop evaluates that spec
    Then it does not split that spec

  # ── keep the graph sound ──────────────────────────────────────────────

  Scenario: a stale graph triggers a re-render
    Given the rendered graph is out of sync with the blocked-by edges
    When the Formation loop checks the graph
    Then it runs the render-spec-graph station

  Scenario: a re-render brings the graph back in sync
    Given the render-spec-graph station runs over the corpus
    When it completes
    Then the rendered graph matches the blocked-by edges

  Scenario: a dependency cycle is surfaced
    Given the blocked-by edges contain a cycle
    When the Formation loop checks the graph
    Then the cycle is surfaced

  # ── dedupe overlap and reconcile contradictions ───────────────────────

  Scenario: overlapping specs trigger a dedupe
    Given two specs cover overlapping behavior
    When the Formation loop evaluates the overlap
    Then it produces a dedupe proposal naming the overlapping specs

  Scenario: contradicting artifacts trigger a reconciliation
    Given two governances contradict each other
    When the Formation loop evaluates the contradiction
    Then it produces a reconciliation proposal naming the contradicting artifacts

  # ── altitude discipline: out of scope ─────────────────────────────────

  Scenario: the Formation loop does not decide what to build
    Given a proposal to add a new feature to the product
    When the Formation loop runs
    Then it produces no build-or-deprecate decision
    And the proposal is routed to the Campaign loop

  Scenario: the Formation loop does not grow the process
    Given a lesson about how the team should work
    When the Formation loop runs
    Then it emits no governance or process edit
    And the lesson is routed to the Doctrine loop
