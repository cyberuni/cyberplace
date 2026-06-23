Feature: Production provenance

  # ── recording provenance ──────────────────────────────────────────────

  Scenario: the producer is recorded on every artifact
    Given the orchestrator dispatches the spec-producer for a domain
    When the producer writes the .feature
    Then produced-by.spec-producer is set to the plugin-qualified agent name
    And it is recorded even though no disambiguation occurred

  Scenario: provenance and approval together give full attribution
    Given produced-by records the producer of an artifact
    And approved-by records the judge of its gate
    When the artifact is traced
    Then both the producer and the judge are known

  # ── resume and availability ───────────────────────────────────────────

  Scenario: resume reuses the recorded producer when its plugin is installed
    Given produced-by.spec-producer is "aces:aces-scenario-writer"
    And the aces plugin is installed
    When the orchestrator resumes work on the spec
    Then it reuses aces-scenario-writer without re-asking

  Scenario: an unavailable recorded producer does not block
    Given produced-by.spec-producer names a plugin that is no longer installed
    When the orchestrator resumes work on the spec
    Then it re-resolves the producer from the registry
    And the historical produced-by value is preserved, annotated unavailable
    And work is not blocked

  # ── defaults and conflicts ────────────────────────────────────────────

  Scenario: a degenerate role records the SDD default
    Given no plugin covers the spec's domain
    When the orchestrator dispatches the role
    Then it uses the SDD default
    And produced-by records the sdd-prefixed default agent

  Scenario: an inline production is recorded, not hidden
    Given the orchestrator executes a role inline with no producer agent
    When it records the production
    Then produced-by names sdd:orchestrator-inline
    And the absence of a domain producer is visible in the data

  Scenario: a first-time conflict asks once, then is decisive
    Given two plugins claim the spec's domain
    And produced-by has no entry for the role
    When the orchestrator dispatches the role
    Then it returns needs-input for the choice
    And the chosen producer is recorded in produced-by
    And a later resume does not re-ask

  # ── gate fail-closed ──────────────────────────────────────────────────

  Scenario: the spec gate fails closed on an unresolved contested producer
    Given two plugins claim the spec's domain
    And produced-by has no entry for the spec-producer role
    When validate-spec runs the spec gate
    Then it returns a blocker to resolve the domain producer via create-spec first
    And it does not ask the user to choose a producer
    And it does not write produced-by
    And it does not write the domain-plugin map

  Scenario: the impl gate fails closed on an unresolved contested producer
    Given two plugins claim the spec's domain
    And produced-by has no entry for the impl-producer role
    When validate-spec runs the impl gate
    Then it returns a blocker to resolve the domain producer via create-spec first
    And it does not ask the user to choose a producer
    And it does not write produced-by
    And it does not write the domain-plugin map

  Scenario: a gate still writes verdict frontmatter when it fails closed
    Given a gate fails closed on an unresolved contested producer
    When the gate records its outcome
    Then the only frontmatter it may write is status and the approved-by ratification
    And it writes no setup frontmatter

  # ── validation, migration, ownership ──────────────────────────────────

  Scenario: validate-spec flags but does not block an unavailable producer
    Given produced-by names a producer whose plugin is not installed
    When validate-spec runs
    Then it flags the unavailable producer
    And it does not fail the spec

  Scenario: a legacy domain-plugin map is migrated into produced-by
    Given a spec carries the old domain-plugin map
    When the orchestrator next dispatches for that spec
    Then the choice is rewritten into produced-by
    And the domain-plugin map is dropped

  Scenario: the orchestrator writes produced-by, not the producer
    Given a producer agent finishes its work
    When provenance is recorded
    Then the orchestrator wrote produced-by
    And the producer did not write it
