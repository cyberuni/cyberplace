Feature: SDD Operator — Freeze: a Strength Gradient, Co-Delivered

  # Scenarios trace freeze top-to-bottom — co-freeze the chain → reversibility &
  # co-evolution → the .feature pivot — per the scenario-ordering convention in
  # sdd:spec-governance.

  # ── freeze co-delivers the chain at descending strength ───────────────────

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

  # ── freeze is reversible; the chain co-evolves ────────────────────────────

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

  # ── the .feature pivots from object to bar ────────────────────────────────

  Scenario: The .feature is the object at the spec gate and the bar at the impl gate
    Given the spec gate judged auth.feature against the domain criteria
    When the spec advances to Approved and auth.feature is frozen
    Then the impl gate judges the implementation against auth.feature as the bar
