@frozen
Feature: init — initialize harness-agnostic agent config
  Unit suite for the init skill: analyze a project and initialize its agent configuration to work across
  every major agent harness — write or refresh AGENTS.md grounded in the repo, wire the per-harness config
  through the universal-plugin CLI (routing to the direct-write fallback skill on npx-decline), merge/symlink
  CLAUDE.md, repair repo-private skills, surface companion init-* skills, and suggest SDD then ACED (gated,
  honoring prior declines via harness memory). Registering ACED as an SDD plugin is the ACED registry skill;
  authoring or evaluating agent config is ACED's domain; publishing or upgrading a cross-vendor plugin is
  publish-universal-plugin / upgrade-universal-plugin. Cross-capability e2e scenarios live in
  ../../workflows/.

  # ── Triggering ──

  @trigger
  Scenario Outline: init activates on a harness-agnostic onboarding request and defers its siblings
    Given a user query "<query>"
    When cyberspace routes the request
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                        | should_trigger |
      | initialize AGENTS.md for this repo                                            | yes            |
      | set up agent documentation for this project                                  | yes            |
      | onboard this codebase for AI coding agents                                    | yes            |
      | make my agent config work across Cursor and Claude Code                       | yes            |
      | get this repo ready to work with any agent harness                            | yes            |
      | register ACED as an SDD plugin for this project                               | no             |
      | create a new skill that formats our changelog entries                         | no             |
      | why are my skill's golden-set evals failing                                   | no             |
      | publish my plugin to the universal marketplace                                | no             |
      | bump the pinned universal-plugin version across the repo                      | no             |

  Scenario: a registry-only request defers to the ACED registry skill
    Given the user asks only to register ACED as an SDD plugin, with no repo onboarding
    When cyberspace routes the request
    Then init does not handle it and the ACED registry skill does

  Scenario: a skill-authoring request defers to ACED
    Given the user asks to scaffold or evaluate a skill
    When cyberspace routes the request
    Then init does not handle it and ACED does

  Scenario: a publish or upgrade request defers to its plugin-lifecycle sibling
    Given the user asks to publish or upgrade a cross-vendor plugin
    When cyberspace routes the request
    Then init does not handle it and publish-universal-plugin / upgrade-universal-plugin does

  # ── Authoring AGENTS.md ──

  @behavior
  Scenario: AGENTS.md is written grounded in the repo when absent
    Given a repo with no AGENTS.md
    When init authors AGENTS.md
    Then it writes sections grounded in real project files and does not invent generic sections

  @behavior
  Scenario: a missing section is added without asking
    Given an existing AGENTS.md that lacks a section init would add
    When init reconciles AGENTS.md
    Then it adds the missing section without asking the user

  @behavior
  Scenario: a differing existing section is not overwritten silently
    Given an existing AGENTS.md whose section content substantively differs from what init would write
    When init reconciles AGENTS.md
    Then it asks the user before changing that section rather than overwriting it silently

  # ── Wiring cross-vendor config ──

  @behavior
  Scenario: per-harness config is wired through the universal-plugin CLI
    Given the user accepts running npx
    When init wires the per-harness config
    Then it offloads the cross-vendor wiring to the universal-plugin CLI rather than writing each vendor's files by hand

  @behavior
  Scenario: declining npx routes to the direct-write fallback skill
    Given the user declines running npx
    When init needs to wire the per-harness config
    Then it routes to the separate direct-write skill and does not silently skip the wiring

  @behavior
  Scenario: CLAUDE.md is symlinked to AGENTS.md, merging a pre-existing regular file first
    Given a repo whose CLAUDE.md is a regular file
    When init sets up the CLAUDE.md pointer
    Then it merges that file into AGENTS.md first and then symlinks CLAUDE.md to AGENTS.md

  @behavior
  Scenario: CLAUDE.md is created as a symlink when absent
    Given a repo with no CLAUDE.md
    When init sets up the CLAUDE.md pointer
    Then it symlinks CLAUDE.md to AGENTS.md directly with nothing to merge

  @behavior
  Scenario: an already-correct CLAUDE.md symlink is left as an idempotent no-op
    Given a repo whose CLAUDE.md is already a symlink to AGENTS.md
    When init sets up the CLAUDE.md pointer
    Then it leaves the symlink unchanged rather than recreating or duplicating it

  @behavior
  Scenario: repo-private skills are repaired via the CLI
    Given repo-private skills under .agents/skills that lack metadata internal true or have erroneous symlinks
    When init repairs repo-private skills
    Then it fixes them through the CLI rather than reading each SKILL.md by hand

  @behavior
  Scenario: companion init skills are surfaced, not auto-run
    Given companion init-* skills are installed
    When init finishes the core setup
    Then it lists them with a one-line summary and offers to run them rather than running them silently

  # ── Suggesting SDD, then ACED (gated) ──

  @behavior
  Scenario: SDD setup is suggested when SDD is absent
    Given a project with no SDD set up and no prior SDD decline in memory
    When init reaches the setup suggestions
    Then it suggests setting up SDD

  @behavior
  Scenario: ACED registration is suggested only once SDD is present
    Given a project with SDD already set up and no prior ACED decline in memory
    When init reaches the setup suggestions
    Then it suggests registering ACED by chaining init-aced

  @behavior
  Scenario: ACED is not suggested when SDD is absent and unaccepted
    Given a project with no SDD set up where the user declines setting up SDD
    When init reaches the setup suggestions
    Then it does not suggest registering ACED

  @behavior
  Scenario: ACED is not re-suggested when it is already registered
    Given a project with SDD set up where ACED is already registered as an SDD plugin
    When init reaches the setup suggestions
    Then it does not suggest registering ACED again

  # ── Respecting prior declines (harness memory) ──

  @behavior
  Scenario: a previously declined SDD suggestion is skipped
    Given harness memory records that the project previously declined the SDD suggestion
    When init reaches the setup suggestions
    Then it does not re-suggest setting up SDD

  @behavior
  Scenario: a declined SDD does not suppress an ACED offer when SDD is independently present
    Given harness memory records a declined SDD suggestion but SDD is set up and ACED was not declined
    When init reaches the setup suggestions
    Then it still suggests registering ACED

  @behavior
  Scenario: a previously declined ACED suggestion is skipped
    Given harness memory records that the project previously declined the ACED suggestion
    When init reaches the setup suggestions
    Then it does not re-suggest registering ACED

  @behavior
  Scenario: no harness memory means ask rather than assume
    Given a harness with no memory facility
    When init reaches the setup suggestions
    Then it asks about the SDD and ACED suggestions rather than assuming a prior decline

  # ── Quality of the initialization ──

  @quality @rubric
  Scenario: the initialization is grounded, harness-agnostic, and non-coercive
    Given a repo to initialize for agent-assisted development
    When init produces AGENTS.md and the setup suggestions
    Then the judge evaluates the initialization against the rubric
      """
      dimensions:
        - name: agents_md_grounded_not_invented
          max: 3
        - name: harness_agnostic_not_single_vendor
          max: 2
        - name: suggestions_offered_not_forced
          max: 2
        - name: prior_declines_respected
          max: 2
      threshold: 7
      """
    And the rubric score is at least the threshold
