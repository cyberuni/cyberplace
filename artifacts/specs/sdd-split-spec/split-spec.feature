Feature: Split spec

  # ── invocation ─────────────────────────────────────────────────────────

  Scenario: User invokes split directly
    Given the user says "split this spec into smaller ones" for a named spec
    When the agent invokes the split-spec skill
    Then the agent reads the target spec.md and its .feature
    And the agent produces a split plan before changing any file

  Scenario: Gateway routes a split request to split-spec
    Given the split-spec skill exists
    And the user picks "manage specs & graph" then "split a spec"
    When the sdd gateway resolves the route
    Then the agent invokes the split-spec analysis
    And the agent does not surface the split analysis as manual

  # ── analysis and plan ──────────────────────────────────────────────────

  Scenario: Propose cohesive child specs
    Given a target spec with multiple independent concerns
    When the agent runs the split analysis
    Then the plan lists each proposed child spec with its scope
    And each design decision and scenario is assigned to exactly one child
    And each proposed child is independently gateable

  Scenario: Plan records dependency edges
    Given a split plan with more than one child spec
    When the agent presents the plan
    Then the plan states the blocked-by edges between the children and toward the original
    And the plan states what happens to the original spec

  Scenario: Surface ambiguous assignments instead of guessing
    Given a target spec where a decision does not cleanly belong to one child
    When the agent runs the split analysis
    Then the agent surfaces the ambiguous decision for the user to assign
    And the agent does not assign it silently

  # ── approval gate ──────────────────────────────────────────────────────

  Scenario: Require approval before acting
    Given the agent has produced a split plan
    When no user approval has been given
    Then no child spec is authored
    And the original spec is not deprecated

  Scenario: Delegate authoring after approval
    Given the user approves the split plan
    When the agent acts on the plan
    Then the agent delegates each child spec authoring to create-spec
    And the agent does not scaffold spec.md or the .feature itself

  # ── boundaries ─────────────────────────────────────────────────────────

  Scenario: Do not edit a frozen target in place
    Given the target spec has status approved
    When the user asks to split it
    Then the agent routes the original through the draft re-open path before scenarios move
    And the agent does not edit the frozen .feature directly

  Scenario: Retain the original via deprecation
    Given the split plan is approved and the children are authored
    When the original spec is retired
    Then the original is deprecated rather than deleted
    And blocked-by edges that pointed at the original are rewritten toward the children

  Scenario: Reject a non-split request
    Given the user asks only to remove part of a spec
    When the agent invokes the split-spec skill
    Then the agent reports the request is not a split
    And the agent suggests the revise or deprecate route instead
