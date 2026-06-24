Feature: SDD Operator — Explore Phase (produce & judge the contract)

  # Scenarios trace the Explore phase top-to-bottom — shape & probe the draft
  # → enforce the contract bar → the spec gate — per the scenario-ordering
  # convention in sdd:spec-governance. Explore output is NOT throwaway: the
  # distinction is contract-not-yet-frozen, not discarded-vs-kept.

  # ── explore: shape the draft, probe by building ───────────────────────────

  Scenario: MODE is derived from whether the .feature is frozen
    Given the operator is about to dispatch a forward producer
    When the .feature is still a draft
    Then it dispatches in explore mode
    And when the .feature is frozen it dispatches in deliver mode

  Scenario: The exploratory loop shapes the spec and probes it by building
    Given the "auth" domain is in the exploratory loop
    When the spec-producer and spec-judge iterate
    And the operator also runs forward producers in explore mode
    Then they shape the .feature until the spec gate freezes it

  Scenario: An explore-mode producer builds against the draft, not a frozen contract
    Given the "auth" .feature is still a draft
    When the operator dispatches the impl-producer in explore mode
    Then the producer spikes against the draft .feature
    And its output is scaffolding that may carry forward or be reshaped at the freeze
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
    And the operator writes an open marker in spec.md and re-invokes the spec-producer

  Scenario: The planner runs in explore alongside the spec, not after a gate
    Given the "auth" domain is in the exploratory loop
    When the operator dispatches the plan-producer in explore mode
    Then it writes plan.md and tasks.md co-delivered with the spec and .feature
    And no plan-judge or task-judge is invoked
    And there is no plan gate between the spec and the plan
    And the plan and tasks are validated transitively by the implementation test result

  # ── the contract bar: ordering, enrichment, validation ────────────────────

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
    When the delegate attempts to write the status, aligned, or produced-by frontmatter
    Then the change is rejected
    And the spec-producer may write only the spec.md body and the .feature

  # ── spec gate: judge the contract, Draft → Approved ───────────────────────

  Scenario: The spec-gate judge is a domain delegate, not SDD
    Given the "skill" domain declares aces-spec-validator
    When the spec gate evaluates skill.feature against domain criteria
    Then SDD delegates the domain judgment to aces-spec-validator
    And SDD's generic validate-spec does not judge domain contract quality

  Scenario: A static-bar domain projects the default spec-judge delegate
    Given the "guide" domain declares no plugin spec-judge
    When the spec gate evaluates guide.feature
    Then the operator projects sdd:sdd-spec-judge as the default spec-judge delegate
    And the default judge is spawned with clean context, not run inline
    And it applies the validate-spec static criteria as its bar

  Scenario: aligned at the spec gate checks only the contract layer
    Given exploratory spike code exists alongside a Draft spec
    When the spec gate evaluates alignment
    Then aligned considers only spec.md and the .feature
    And the spike code does not block the spec from reaching Approved
