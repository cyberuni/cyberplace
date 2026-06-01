Feature: Section locking
  A layer may declare a section locked. Locked sections cannot be replaced, appended to,
  prepended to, or removed by any layer with a higher priority index.
  Lock direction: no layer with a higher index may modify a locked section.

  The system under test is any conformant layer resolver.

  # --- Basic lock ---

  Scenario: Locked section cannot be replaced by a higher-priority layer
    Given base layer has "## Compliance" containing "Must review."
    And base layer frontmatter declares:
      """
      sections:
        Compliance:
          locked: true
      """
    And project layer has "## Compliance" containing "Skip review."
    When resolution runs
    Then the effective "## Compliance" contains "Must review."
    And does not contain "Skip review."

  Scenario: Locked section cannot be appended to by a higher-priority layer
    Given base layer has "## Compliance" locked
    And project layer declares section strategy append for "Compliance" and adds "Extra rule."
    When resolution runs
    Then the effective "## Compliance" does not contain "Extra rule."

  Scenario: Locked section cannot be prepended to by a higher-priority layer
    Given base layer has "## Compliance" locked
    And project layer declares section strategy prepend for "Compliance" and adds "Preamble."
    When resolution runs
    Then the effective "## Compliance" does not contain "Preamble."

  Scenario: Locked section cannot be removed by a higher-priority layer
    Given base layer has "## Compliance" locked
    And project layer declares:
      """
      sections:
        Compliance:
          remove: true
      """
    When resolution runs
    Then the effective extension still contains "## Compliance"

  Scenario: Non-locked sections in the same layer are not affected by another section's lock
    Given base layer has "## Compliance" locked and "## Steps" not locked
    And project layer replaces "## Steps" with "Project steps."
    When resolution runs
    Then the effective "## Steps" contains "Project steps."
    And the effective "## Compliance" retains its base content

  # --- Lock is not transitive ---

  Scenario: Lock in user layer (priority 2) does not prevent org layer (priority 4) from overriding
    Given user layer has "## Policy" locked with content "User policy."
    And org layer has "## Policy" with content "Org policy."
    When resolution runs
    Then the effective "## Policy" contains "Org policy."

  Scenario: Lock in org layer (priority 4) prevents project (5) from overriding
    Given org layer has "## Compliance" locked with content "Org compliance."
    And project layer has "## Compliance" with content "Project override."
    When resolution runs
    Then the effective "## Compliance" contains "Org compliance."

  Scenario: Lock in org layer (priority 4) prevents workspace (6) from overriding
    Given org layer has "## Compliance" locked with content "Org compliance."
    And workspace layer has "## Compliance" with content "Workspace override."
    When resolution runs
    Then the effective "## Compliance" contains "Org compliance."

  Scenario: Lock in org layer (priority 4) prevents local (7) from overriding
    Given org layer has "## Compliance" locked with content "Org compliance."
    And local layer has "## Compliance" with content "Local override."
    When resolution runs
    Then the effective "## Compliance" contains "Org compliance."

  Scenario: Lock in project layer (priority 5) prevents local (7) but not org (4)
    Given project layer has "## Policy" locked with content "Project policy."
    And local layer has "## Policy" with content "Local override."
    And org layer has "## Policy" with content "Org override."
    When resolution runs
    Then the effective "## Policy" contains "Project policy."

  # --- Lock from local scope is ineffective ---

  Scenario: Lock declared in local layer is vacuously satisfied (local is already highest priority)
    Given local layer has "## Notes" with content "My notes." and declares it locked
    And no higher layer exists
    When resolution runs
    Then the effective "## Notes" contains "My notes."
    And no error is raised

  Scenario: Audit warns when locked:true appears in a local scope file
    Given "SKILL.local.md" has frontmatter declaring a section locked
    When the audit runs
    Then a warning is emitted that locked:true in a local scope file is ineffective

  # --- Lock source preserved in provenance ---

  Scenario: skill resolve output marks locked sections with their source layer
    Given org layer has "## Compliance" locked
    When "cyber-skills skill resolve commit-work" runs
    Then the output marks "## Compliance" with the org source and a lock indicator
