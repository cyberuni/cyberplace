@frozen
Feature: write-vendor-config — write per-harness agent config directly
  Unit suite for the write-vendor-config skill: write each targeted agent harness's configuration file from
  AGENTS.md by hand, without the universal-plugin CLI — the fallback init routes to when the user declines npx,
  and a standalone by-hand entry. The preferred CLI-offload wiring is init's own step; authoring AGENTS.md is
  init; publishing or upgrading a cross-vendor plugin is publish-universal-plugin / upgrade-universal-plugin.
  Cross-capability e2e scenarios live in ../../workflows/.

  # ── Triggering ──

  @trigger
  Scenario Outline: write-vendor-config activates on the by-hand wiring path
    Given a user query "<query>"
    When cyberspace routes the request
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                        | should_trigger |
      | write my per-harness agent config by hand without npx                        | yes            |
      | set up the vendor config files directly, I don't want to run the CLI          | yes            |
      | generate CLAUDE.md and the Cursor and Copilot config from AGENTS.md manually   | yes            |
      | wire the harness config without the universal-plugin tool                      | yes            |
      | initialize AGENTS.md for this repo                                            | no             |
      | sync my vendor config using the universal-plugin CLI                          | no             |
      | publish my plugin to the marketplace                                          | no             |
      | upgrade the pinned universal-plugin version                                    | no             |

  Scenario: a request that accepts the CLI defers to init's offload path
    Given the user is fine running npx and wants the vendor config wired
    When cyberspace routes the request
    Then write-vendor-config does not handle it and init's CLI-offload step does

  # ── Detect harnesses in play ──

  @behavior
  Scenario: only targeted harnesses get a config file
    Given a repo that targets Claude Code and Cursor but not Codex or Copilot
    When write-vendor-config wires the per-harness config
    Then it writes config for Claude Code and Cursor and does not create Codex or Copilot files

  @behavior
  Scenario: a named harness set is honored
    Given the user names the harnesses to configure
    When write-vendor-config wires the per-harness config
    Then it writes config for exactly those harnesses

  @behavior
  Scenario: no detectable harness and none named prompts rather than guessing
    Given a repo where no harness can be detected and the user named none
    When write-vendor-config wires the per-harness config
    Then it asks the user which harnesses to configure rather than writing files blindly

  # ── Write each vendor file from AGENTS.md ──

  @behavior
  Scenario: each vendor file is written in its own shape grounded in AGENTS.md
    Given an AGENTS.md to propagate
    When write-vendor-config writes a targeted vendor's file
    Then it writes that vendor's file in the vendor's own format, grounded in AGENTS.md rather than invented content

  # ── Idempotence + overwrite guard ──

  @behavior
  Scenario: a matching vendor file is left unchanged
    Given a targeted vendor file whose content already matches AGENTS.md
    When write-vendor-config wires the per-harness config
    Then it leaves that file unchanged

  @behavior
  Scenario: a differing vendor file is not overwritten silently
    Given a targeted vendor file whose content substantively differs from AGENTS.md
    When write-vendor-config wires the per-harness config
    Then it asks the user before overwriting that file

  # ── No CLI ──

  @behavior
  Scenario: the wiring never shells out to the universal-plugin CLI
    Given the user declined running npx
    When write-vendor-config wires the per-harness config
    Then it writes the files directly and never invokes the universal-plugin CLI

  # ── Quality ──

  @quality @rubric
  Scenario: the by-hand wiring is grounded, per-vendor-correct, and npx-free
    Given a repo whose per-harness config is wired by hand
    When write-vendor-config produces the vendor files
    Then the judge evaluates the wiring against the rubric
      """
      dimensions:
        - name: grounded_in_agents_md_not_invented
          max: 3
        - name: per_vendor_shape_correct
          max: 2
        - name: only_targeted_harnesses
          max: 2
        - name: no_npx_dependency
          max: 2
      threshold: 7
      """
    And the rubric score is at least the threshold
