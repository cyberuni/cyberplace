Feature: Layer resolution
  The resolution algorithm merges collected layers in priority order to produce the
  effective extension the agent reads. Each layer is applied as a diff against the
  accumulated result of all prior layers.

  The system under test is any conformant layer resolver (e.g., `cyber-skills skill resolve`).

  # --- Frontmatter: string fields ---

  Scenario: Higher-priority layer replaces string field by default
    Given base layer has frontmatter "description: Base description"
    And project layer has frontmatter "description: Project description"
    When resolution runs
    Then the effective "description" is "Project description"

  Scenario: name field is always taken from base regardless of augmenting layers
    Given base layer has frontmatter "name: commit-work"
    And project layer has frontmatter "name: custom-name"
    When resolution runs
    Then the effective "name" is "commit-work"

  Scenario: String field with append strategy concatenates values
    Given base layer has frontmatter "description: Base description"
    And project layer declares:
      """
      fields:
        description:
          strategy: append
      description: " (team override)"
      """
    When resolution runs
    Then the effective "description" is "Base description (team override)"

  # --- Frontmatter: array fields ---

  Scenario: Array fields are unioned and deduplicated by default
    Given base layer has frontmatter "triggers: [commit, push]"
    And project layer has frontmatter "triggers: [push, deploy]"
    When resolution runs
    Then the effective "triggers" is "[commit, push, deploy]" with no duplicates

  Scenario: Array field with replace strategy discards lower-priority values
    Given base layer has frontmatter "triggers: [commit, push]"
    And project layer declares:
      """
      fields:
        triggers:
          strategy: replace
      triggers: [deploy]
      """
    When resolution runs
    Then the effective "triggers" is "[deploy]"

  # --- Frontmatter: boolean fields ---

  Scenario: Boolean fields use last-wins semantics
    Given base layer has frontmatter "enabled: true"
    And project layer has frontmatter "enabled: false"
    When resolution runs
    Then the effective "enabled" is false

  Scenario: Boolean field set to true in higher-priority layer overrides false in lower
    Given base layer has frontmatter "enabled: false"
    And project layer has frontmatter "enabled: true"
    When resolution runs
    Then the effective "enabled" is true

  # --- Frontmatter: object fields ---

  Scenario: Object fields are deep-merged by default
    Given base layer frontmatter has:
      """
      config:
        timeout: 30
        retries: 3
      """
    And project layer frontmatter has:
      """
      config:
        timeout: 60
      """
    When resolution runs
    Then the effective "config.timeout" is 60
    And the effective "config.retries" is 3

  Scenario: Object field with replace strategy discards base keys not present in augmenting layer
    Given base layer frontmatter has:
      """
      config:
        timeout: 30
        retries: 3
      """
    And project layer declares:
      """
      fields:
        config:
          strategy: replace
      config:
        timeout: 60
      """
    When resolution runs
    Then the effective "config.timeout" is 60
    And "config.retries" is not present in the effective extension

  # --- Markdown sections ---

  Scenario: Section present in augmenting layer replaces same-named section by default
    Given base layer has:
      """
      ## Steps
      Base steps.
      """
    And project layer has:
      """
      ## Steps
      Project steps.
      """
    When resolution runs
    Then the effective "## Steps" contains "Project steps."
    And does not contain "Base steps."

  Scenario: Section with append strategy adds augmenting content after accumulated content
    Given base layer has "## Steps" containing "Step 1."
    And project layer declares section strategy append for "Steps" and has "## Steps" containing "Step 2."
    When resolution runs
    Then the effective "## Steps" contains "Step 1." followed by "Step 2."

  Scenario: Section with prepend strategy adds augmenting content before accumulated content
    Given base layer has "## Steps" containing "Step 1."
    And project layer declares section strategy prepend for "Steps" and has "## Steps" containing "Step 0."
    When resolution runs
    Then the effective "## Steps" contains "Step 0." followed by "Step 1."

  Scenario: New section in augmenting layer not present in accumulated result is appended at end
    Given base layer has sections "## Overview" and "## Steps"
    And project layer has section "## Team Notes" not present in base
    When resolution runs
    Then the effective extension ends with "## Team Notes"

  Scenario: Section remove:true deletes the section from the accumulated result
    Given base layer has section "## Troubleshooting"
    And project layer declares:
      """
      sections:
        Troubleshooting:
          remove: true
      """
    When resolution runs
    Then the effective extension has no "## Troubleshooting" section

  Scenario: remove:true on a section not present in the accumulated result is silently ignored
    Given base layer does not have a "## Troubleshooting" section
    And project layer declares:
      """
      sections:
        Troubleshooting:
          remove: true
      """
    When resolution runs
    Then no error is raised

  Scenario: Nested ### headings are treated as part of their parent ## section
    Given base layer has:
      """
      ## Steps
      ### Step 1
      Do this.
      ### Step 2
      Do that.
      """
    And project layer replaces "## Steps" with:
      """
      ## Steps
      ### Step A
      Do A.
      """
    When resolution runs
    Then the effective "## Steps" contains only "### Step A"
    And "### Step 1" and "### Step 2" are absent from the effective extension

  # --- Layer ordering ---

  Scenario: Layers are applied in order with each later layer taking precedence
    Given all seven layers exist and each sets "## Steps" to their scope name
    When resolution runs
    Then the effective "## Steps" contains "local"

  Scenario: Only a local layer with no base produces an effective extension equal to local content
    Given only "SKILL.local.md" exists for "commit-work"
    When resolution runs
    Then the effective extension equals the local layer content exactly

  Scenario: Three layers applied in sequence accumulate correctly
    Given base layer has "## Steps" containing "Step 1."
    And org layer has "## Steps" with append strategy containing "Step 2."
    And local layer has "## Steps" with append strategy containing "Step 3."
    When resolution runs
    Then the effective "## Steps" contains "Step 1." then "Step 2." then "Step 3." in order

  # --- Conflict detection ---

  Scenario: Contradictory prose sections produce no automatic merge resolution
    Given base layer "## Rules" contains "Always squash commits."
    And project layer "## Rules" contains "Never squash commits."
    When resolution runs
    Then the effective "## Rules" contains "Never squash commits."
    And no error or warning is emitted about semantic contradiction
