Feature: Spec-Driven Development Plugin

  # ── init-sdd ─────────────────────────────────────────────────────────────

  Scenario: Initialize SDD governance in a repo
    Given a repo with AGENTS.md present
    When the user runs the init-sdd skill
    Then AGENTS.md contains a "## Spec-Driven Development" section
    And the section includes the .feature freeze rule
    And the section includes the spec-owns-behavior rule
    And a SessionStart hook named "sdd" is registered

  Scenario: init-sdd is idempotent
    Given AGENTS.md already contains a "## Spec-Driven Development" section
    When the user runs init-sdd again
    Then the section body is replaced with the current content
    And no duplicate "## Spec-Driven Development" sections exist in AGENTS.md

  Scenario: init-sdd requires AGENTS.md to exist
    Given a repo with no AGENTS.md
    When the user runs init-sdd
    Then init-sdd tells the user to run the init skill first
    And no files are written

  # ── create-spec — new feature ────────────────────────────────────────────

  Scenario: Scaffold a spec for a new feature
    Given a project with no spec for the "auth" domain
    When the user runs create-spec for "auth" providing What, Why, and command surface
    Then specs/auth/spec.md is created with Status: Draft
    And specs/auth/auth.feature is created with at least one happy-path scenario
    And specs/auth/auth.feature contains at least one error-case scenario
    And validate-spec runs and reports the quality gate outcome before the skill exits

  Scenario: create-spec does not scaffold until What, Why, and command surface are all provided
    Given a new feature with no existing implementation
    When the user runs create-spec for "auth" but provides only What
    Then create-spec asks for Why and command surface before writing any file

  # ── create-spec — backfill ───────────────────────────────────────────────

  Scenario: Backfill a spec from existing code
    Given implementation code exists at src/auth with tests
    And no spec exists for the "auth" domain
    When the user runs create-spec in backfill mode for "auth"
    Then create-spec reads source files, tests, and commit history to infer content
    And presents inferred What, Why, design decisions, and command surface for user review
    And writes specs/auth/spec.md only after the user confirms

  # ── validate-spec — Draft → Approved ────────────────────────────────────

  Scenario: Validate a complete spec for approval
    Given specs/auth/spec.md exists with all required sections filled and no placeholder text
    And specs/auth/auth.feature exists with happy-path and error-case scenarios
    When the user runs validate-spec targeting Draft → Approved
    Then all checks pass
    And the report confirms the spec is ready to advance to Approved

  Scenario: Validate a spec with a missing Why section
    Given specs/auth/spec.md exists but has no Why section
    When the user runs validate-spec
    Then the "why-section-present" check fails
    And the priority issues list includes "spec.md is missing a ## Why section"
    And the user questions include "What problem does this feature solve?"

  Scenario: Validate a spec with placeholder text
    Given specs/auth/spec.md contains "TBD" in the What section
    When the user runs validate-spec
    Then the "no-placeholder-text" check fails
    And the report identifies the section containing placeholder text

  Scenario: Validate a spec where the linked .feature file is missing
    Given specs/auth/spec.md links to specs/auth/auth.feature
    And specs/auth/auth.feature does not exist
    When the user runs validate-spec
    Then validation fails immediately
    And the priority issues list names the missing .feature file

  Scenario: Validate a spec for Approved → Implemented
    Given specs/auth/spec.md has Status: Approved
    And specs/auth/auth.feature contains three scenarios
    And passing tests exist for all three scenarios
    When the user runs validate-spec targeting Approved → Implemented
    Then the "tests-cover-all-scenarios" check passes
    And the report confirms the spec is ready to be marked Implemented

  Scenario: Validate a spec for Approved → Implemented with missing test coverage
    Given specs/auth/spec.md has Status: Approved
    And specs/auth/auth.feature contains three scenarios
    And passing tests exist for only two of the three scenarios
    When the user runs validate-spec targeting Approved → Implemented
    Then the "tests-cover-all-scenarios" check fails
    And the report identifies the uncovered scenario

  # ── .feature freeze ──────────────────────────────────────────────────────

  Scenario: Agent refuses to modify .feature when spec is Approved
    Given specs/auth/spec.md has Status: Approved
    And specs/auth/auth.feature exists
    When an agent attempts to add or remove a scenario in auth.feature
    Then the agent refuses the modification
    And explains that the .feature file is frozen while the spec is Approved
    And tells the user to revert the spec to Draft to change scenarios

  # ── requirements change after Approved ───────────────────────────────────

  Scenario: Change behavior after spec is Approved
    Given specs/auth/spec.md has Status: Approved
    When a user must change the behavior specified in the spec
    Then the user changes Status to Draft in spec.md
    And the .feature file becomes editable again
    And validate-spec must pass before the spec can return to Approved

  # ── command surface edge cases ───────────────────────────────────────────

  Scenario: Spec a TypeScript library with no CLI surface
    Given a TypeScript module that exposes only function exports
    When create-spec scaffolds specs/parser/spec.md
    Then the Command surface section is marked N/A with justification
    And validate-spec does not fail for an absent command surface
    And .feature scenarios use return values and thrown errors as observable behavior

  Scenario: Spec a config-only change with no public interface
    Given a change that only modifies project configuration
    When create-spec scaffolds specs/config/spec.md
    Then the Command surface section is marked N/A with justification
    And validate-spec does not fail for an absent command surface

  # ── two-mode model ───────────────────────────────────────────────────────

  Scenario: Exploration code exists alongside a Draft spec
    Given specs/auth/spec.md has Status: Draft
    And exploratory implementation code already exists in src/auth
    When the user continues working on both the spec and the code
    Then validate-spec does not require implementation to be absent
    And the spec may advance to Approved regardless of whether code exists

  Scenario: .feature scenarios remain editable during Draft
    Given specs/auth/spec.md has Status: Draft
    And specs/auth/auth.feature exists with two scenarios
    When an agent adds a third scenario to auth.feature
    Then the addition is accepted
    And no freeze warning is shown

  # ── open questions ──────────────────────────────────────────────────────────

  Scenario: Open question markup is accepted during Draft
    Given specs/auth/spec.md has Status: Draft
    And the What section contains "<!-- open: needs designer input on empty-state -->"
    When the user runs validate-spec
    Then validate-spec does not fail for the open question comment
    And the report notes the open question as pending input

  Scenario: Draft → Approved blocked when open questions remain
    Given specs/auth/spec.md has Status: Draft
    And the Why section contains "<!-- open: needs PM input on scope -->"
    When the user runs validate-spec targeting Draft → Approved
    Then validation fails
    And the report identifies the unresolved open question as a blocker

  # ── approval gate ────────────────────────────────────────────────────────────

  Scenario: Draft → Approved requires acknowledgment from all required reviewers
    Given specs/auth/spec.md has all required sections filled
    And specs/auth/auth.feature has happy-path and error-case scenarios
    And no open questions remain
    When the user runs validate-spec targeting Draft → Approved
    Then validate-spec asks the user to confirm each required reviewer has acknowledged
    And advances to Approved only after the user confirms

  # ── implementation gap handling ──────────────────────────────────────────────

  Scenario: Minor gap discovered during implementation
    Given specs/auth/spec.md has Status: Approved
    And implementation reveals an edge case clearly implied by the existing spec
    When the gap is added to auth.feature with a quick review note
    Then spec.md status remains Approved

  Scenario: Requirements change discovered during implementation
    Given specs/auth/spec.md has Status: Approved
    When implementation reveals the specified behavior cannot work as written
    Then spec.md status must revert to Draft before behavior can change
    And auth.feature becomes editable again
    And validate-spec must pass before the spec can return to Approved
