Feature: Rubric-style Gherkin scenarios in SDD .feature files

  # ── authoring: untagged scenario ──

  Scenario: spec-producer writes a plain boolean scenario
    Given a spec-producer is authoring a .feature for an observable, deterministic behavior
    When the producer writes a scenario without the @rubric tag
    Then the scenario contains only boolean Then assertions
    And the scenario contains no rubric docstrings, scores, or threshold lines
    And the spec-judge accepts the scenario as valid pure-boolean Gherkin

  Scenario: spec-producer attempts rubric lingo in an untagged scenario
    Given a spec-producer writes a scenario without the @rubric tag
    When the scenario contains a Then step with a scoring dimension or threshold
    Then the spec-judge rejects the scenario
    And the rejection message identifies the untagged scenario as the cause

  # ── authoring: rubric scenario ──

  @rubric
  Scenario: spec-producer writes a valid rubric scenario
    Given a spec-producer is authoring a .feature for a gradient-judgment behavior
    When the producer writes a @rubric-tagged scenario with named dimensions, per-dimension max values, a single threshold, and a boolean-collapsing Then
    Then the spec-judge accepts the scenario structure as valid
    And the collapsing Then reads "the rubric score is at least the threshold"
    And the scenario yields exactly one pass or fail at the gate

  # ── validation: structural checks ──

  @rubric
  Scenario: spec-judge rejects a rubric scenario missing a threshold
    Given a @rubric-tagged scenario whose rubric docstring contains named dimensions but no threshold line
    When the spec-judge validates the scenario
    Then the spec-judge emits a structural failure
    And the failure identifies the missing threshold as the cause
    And scoring does not begin

  @rubric
  Scenario: spec-judge rejects a rubric scenario with no named dimensions
    Given a @rubric-tagged scenario whose rubric docstring contains a threshold but no named dimensions
    When the spec-judge validates the scenario
    Then the spec-judge emits a structural failure
    And the failure identifies the missing dimensions as the cause

  @rubric
  Scenario: spec-judge rejects a rubric scenario missing the collapsing Then
    Given a @rubric-tagged scenario with a valid rubric docstring but no boolean-collapsing Then step
    When the spec-judge validates the scenario
    Then the spec-judge emits a structural failure
    And the failure identifies the absent collapsing assertion as the cause

  # ── validation: by-hand scoring ──

  @rubric
  Scenario: spec-judge scores a rubric scenario above threshold and passes it
    Given a @rubric-tagged scenario that passes structural validation
    When the spec-judge reads the rubric, scores each dimension, and sums the result
    And the total score is at or above the threshold
    Then the spec-judge emits pass for the scenario

  @rubric
  Scenario: spec-judge scores a rubric scenario below threshold and fails it
    Given a @rubric-tagged scenario that passes structural validation
    When the spec-judge reads the rubric, scores each dimension, and sums the result
    And the total score is below the threshold
    Then the spec-judge emits fail for the scenario
    And the emitted result is a single boolean — not a raw score
