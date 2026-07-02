Feature: Spec-Driven Development Plugin

  # Scenarios trace the plugin-owned workflow surface: context → create/resume
  # → spec gate → implementation → impl gate → graph and observation invariants.

  # -- context -------------------------------------------------------------

  Scenario: sdd is the gateway entrypoint for SDD work
    Given the user wants to work on a feature under SDD
    When the user invokes the sdd skill
    Then sdd classifies the requested SDD action
    And sdd routes the work to create-spec, validate-spec, or render-spec-graph
    And sdd does not load authoring governances into context

  Scenario: SDD governance is loaded from skills, not a CLI
    Given the SDD plugin is installed in a repo
    When an SDD producer or judge needs reference rules
    Then it loads the relevant sdd governance skill through the harness
    And runtime SDD work does not require a governance show command

  Scenario: spec-producers load the ownership governance split
    Given the SDD workflow is active
    When sdd-operator dispatches a spec-producer
    Then the spec-producer loads sdd:ownership-governance

  Scenario: spec-judges load the gate-validation governance split
    Given the SDD workflow is active
    When sdd-operator dispatches a spec-judge
    Then the spec-judge loads sdd:gate-validation-governance

  Scenario: sdd does not modify project files
    Given a repo with AGENTS.md present
    When the user invokes the sdd skill
    Then AGENTS.md is unchanged
    And no SessionStart hook is registered
    And no cyber-skills CLI command is required

  Scenario: sdd routes feature creation to create-spec
    Given the user wants to start a new feature under SDD
    When the user invokes the sdd skill
    Then sdd directs the agent to run create-spec before implementation
    And the agent does not edit implementation before a draft contract exists

  Scenario: sdd routes approved feature work to validate-spec
    Given specs/auth/spec.md has status approved
    When the user invokes the sdd skill to implement auth
    Then sdd directs the agent to keep auth.feature frozen
    And implementation proceeds through validate-spec targeting the impl gate

  # -- registry setup ------------------------------------------------------

  Scenario: Domain plugin init writes the resolved role map
    Given the Quill plugin ships an init-quill skill
    When init-quill runs in an SDD project
    Then .agents/universal-plugin.json contains a quill entry under sdd-plugins
    And the entry includes domains, version, roles, and governances
    And the roles map uses spec-producer, plan-producer, spec-judge, impl-producer, and impl-judge

  Scenario: Domain plugin init rewrites old registry shape
    Given .agents/universal-plugin.json contains a quill entry with scenario-advisor and implementer keys
    When init-quill runs
    Then the quill entry is rewritten to the five-role map
    And the operator does not need to read the old shape

  Scenario: Runtime resolution does not read plan.md plugin assignments
    Given .agents/universal-plugin.json maps the "guide" domain to quill
    And plan.md contains an obsolete Plugin assignments table
    When create-spec resumes the operator for the "guide" domain
    Then the operator resolves delegates from .agents/universal-plugin.json
    And it ignores plan.md for plugin resolution

  Scenario: Ambiguous domain coverage is resolved by the skill
    Given both aced and quill claim the "guide" domain
    And spec.md has no domain-plugin frontmatter choice
    When create-spec invokes the operator
    Then the operator returns STATUS needs-input with a batched domain choice question
    And create-spec asks the user which plugin owns the domain
    And create-spec writes the answer to the domain-plugin frontmatter map

  # -- create-spec exploration -------------------------------------------

  Scenario: Scaffold the co-delivered artifact chain for a new feature
    Given a project with no spec for the "auth" domain
    When the user runs create-spec for "auth" with enough What, Why, and surface detail
    Then specs/auth/spec.md is created with status draft
    And specs/auth/auth.feature is created with behavioral scenarios
    And specs/auth/plan.md is created when planning output exists
    And specs/auth/tasks.md is created when task output exists
    And the Artifacts section lists the created files

  Scenario: create-spec suspends before writing when core intent is missing
    Given a new feature with no existing implementation
    When the user runs create-spec for "auth" but provides only What
    Then create-spec asks for the missing Why and public surface in one batch
    And no spec files are written before the missing intent is supplied

  Scenario: create-spec resumes the operator after batched answers
    Given create-spec received STATUS needs-input with two questions
    When the user answers both questions
    Then create-spec invokes sdd-operator again with those answers
    And the operator reconstructs workflow state from the artifact files

  Scenario: Backfill explores existing implementation before writing a contract
    Given implementation code exists at src/auth with tests
    And no spec exists for the "auth" domain
    When the user runs create-spec in backfill mode for "auth"
    Then create-spec asks the operator to inspect source files, tests, and history
    And inferred What, Why, decisions, and surface are presented for user review
    And the spec-producer writes the contract only after the user confirms the inferred intent

  Scenario: Explore-mode implementation discoveries become content gaps
    Given specs/auth/spec.md has status draft
    And the impl-producer discovers the draft scenarios omit token refresh behavior
    When the operator returns from the explore segment
    Then the discovery is represented as a CONTENT_GAPS item
    And an open marker is written in the owning artifact
    And create-spec surfaces the gap before the spec gate

  Scenario: Observations are surfaced without blocking the current spec
    Given a plan-producer returns an OBSERVATIONS item owned by architect
    When create-spec receives the operator result
    Then create-spec reports the observation separately from content gaps
    And the current spec is not blocked by that observation

  # -- spec gate -----------------------------------------------------------

  Scenario: validate-spec runs the spec gate against the contract layer
    Given specs/auth/spec.md has status draft and aligned false
    And specs/auth/auth.feature exists
    When the user runs validate-spec targeting the spec gate
    Then validate-spec invokes sdd-spec-judge through the operator
    And it checks spec.md and auth.feature without requiring implementation artifacts
    And it reports whether the contract is ready for approval

  Scenario: validate-spec rejects unresolved open markers at the spec gate
    Given specs/auth/spec.md has status draft
    And the Why section contains "<!-- open: needs PM input on scope -->"
    When the user runs validate-spec targeting the spec gate
    Then validation fails
    And the report identifies the unresolved open marker
    And status remains draft

  Scenario: validate-spec accepts draft aligned true as ready for the spec gate
    Given specs/auth/spec.md has status draft
    And aligned is true
    And auth.feature passes the spec-judge checks
    When the user runs validate-spec targeting the spec gate
    Then validate-spec treats the tuple as ready for human approval
    And it does not interpret aligned true as implemented

  Scenario: validate-spec freezes scenarios after human approval
    Given specs/auth/spec.md has status draft
    And auth.feature passes the spec-judge checks
    And all required reviewers have acknowledged the contract
    When the user approves the spec gate
    Then validate-spec writes status approved in spec.md
    And validate-spec records the spec approval provenance
    And auth.feature becomes frozen

  Scenario: A plugin-written feature must pass the universal format bar
    Given aced-scenario-writer produced specs/skill/skill.feature
    When validate-spec runs the spec gate
    Then sdd-spec-judge checks valid boolean Gherkin and scenario ordering
    And the check applies regardless of which spec-producer wrote the file

  Scenario: Domain criteria are enforced at the spec gate
    Given the "skill" domain requires every scenario to carry trigger context
    And skill.feature has a scenario without trigger context
    When validate-spec runs the spec gate
    Then validation fails
    And the report names the scenario missing the required domain criterion

  Scenario: validate-spec can run without NodeJS
    Given npx is unavailable in the environment
    When validate-spec runs the spec gate
    Then sdd-spec-judge performs the required checks at agent level
    And the gate report is still produced

  # -- frozen contract -----------------------------------------------------

  Scenario: Agent refuses to modify .feature while Approved
    Given specs/auth/spec.md has status approved
    And specs/auth/auth.feature exists
    When an agent attempts to add or remove a scenario in auth.feature
    Then the agent refuses the modification
    And explains that the .feature file is frozen while the spec is approved
    And tells the user to revert the spec to draft to change scenarios

  Scenario: Fatal contract gap reopens the spec through a gate
    Given specs/auth/spec.md has status approved
    And implementation reveals the specified behavior cannot work as written
    When the user accepts the Director revert
    Then validate-spec writes status draft in spec.md
    And auth.feature becomes editable again
    And the spec must pass the spec gate before returning to approved

  # -- implementation and impl gate ---------------------------------------

  Scenario: Implementation runs against the frozen feature
    Given specs/auth/spec.md has status approved
    And specs/auth/auth.feature is frozen with three scenarios
    When validate-spec targets the impl gate
    Then the operator dispatches forward producers in implement mode
    And the impl-producer writes implementation and verification derived from the frozen scenarios

  Scenario: Impl gate passes only when every frozen scenario passes
    Given specs/auth/spec.md has status approved
    And auth.feature contains three frozen scenarios
    And the impl-judge reports all three scenarios passing
    When the user approves the impl gate
    Then validate-spec writes status implemented in spec.md
    And validate-spec records the impl approval provenance
    And aligned is true for the implementation layer

  Scenario: Impl gate reports uncovered scenarios
    Given specs/auth/spec.md has status approved
    And auth.feature contains three frozen scenarios
    And passing verification exists for only two scenarios
    When validate-spec targets the impl gate
    Then validation fails
    And the report identifies the uncovered scenario
    And status remains approved

  # -- surfaces and graph invariants --------------------------------------

  Scenario: Spec a TypeScript library with no CLI surface
    Given a TypeScript module exposes only function exports
    When create-spec scaffolds specs/parser/spec.md
    Then the surface section documents the library API
    And parser.feature scenarios use return values and thrown errors as observable behavior

  Scenario: Spec a config-only change with no public interface
    Given a change only modifies project configuration
    When create-spec scaffolds specs/config/spec.md
    Then the surface section is marked N/A with justification
    And validate-spec does not fail for an absent public interface

  Scenario: blocked-by defines the spec DAG
    Given specs/report/spec.md has blocked-by containing "auth"
    When render-spec-graph runs
    Then artifacts/specs/graph.md contains the edge "auth --> report"
    And no blocks field is required in either spec

  Scenario: A project spec composes feature specs via subtasks
    Given a project spec lists a feature in its subtasks
    When render-spec-graph runs
    Then the Composition view contains the edge "project --> feature"
    And the feature spec declares no subtasks of its own

  Scenario: A feature belongs to exactly one project
    Given two project specs both list the same feature in subtasks
    When render-spec-graph runs
    Then the render fails reporting the feature has more than one parent

  Scenario: tasks.md is a DAG with scenario traceability
    Given specs/auth/auth.feature contains a scenario named "Refresh an expired token"
    When the plan-producer writes specs/auth/tasks.md
    Then tasks.md contains executable task IDs and dependency edges
    And at least one task traces to "Refresh an expired token"
