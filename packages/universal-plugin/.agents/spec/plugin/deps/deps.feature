@frozen
Feature: plugin deps — manage the plugin's npx package dependencies

  Background:
    Given a project root with ".plugin/plugin.json"

  # ── Preconditions ──

  Scenario: missing .plugin/plugin.json fails
    Given the project root has no ".plugin/plugin.json"
    When I run "universal-plugin plugin deps ls"
    Then the exit code is 1
    And stderr contains "No .plugin/plugin.json found"

  Scenario: a missing .plugin/deps.json is an empty managed list, not an error
    Given the project root has no ".plugin/deps.json"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    When I run "universal-plugin plugin deps ls"
    Then the exit code is 0
    And stdout contains the aggregate summary "0 dependencies"

  # ── The allowlist is the selector ──

  Scenario: an unmanaged package named by English prose is invisible to up
    Given ".plugin/deps.json" manages "cyberlegion"
    And a governance doc "governance/spec-judge.md" contains "shipping an npx dependency"
    And the registry resolves "dependency" to "0.0.1"
    When I run "universal-plugin plugin deps up"
    Then "governance/spec-judge.md" contains "shipping an npx dependency"
    And no row is emitted for "dependency"
    And the exit code is 0

  Scenario: an unmanaged package is absent from ls
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps ls"
    Then no row is emitted for "gherkin-cli"
    And the exit code is 0

  # ── The five forms ──

  Scenario: a placeholder is converted to the exact resolved version
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And the exit code is 0

  Scenario: a bare prose reference is warned about and never rewritten
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And "skills/x/SKILL.md" does not contain "npx cyberlegion@0.1.0"
    And stderr contains "cyberlegion"
    And the exit code is 0

  Scenario: an exact reference is a pin bare up never moves
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the exit code is 0

  Scenario: a bare up leaves a tilde range in place
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@~2.4"
    And the registry resolves "cyberlegion@~2.4" to "2.4.9"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@~2.4"
    And the exit code is 0

  Scenario: a bare up leaves a caret range in place
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^2.4"
    And the registry resolves "cyberlegion@^2.4" to "2.9.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^2.4"
    And the exit code is 0

  Scenario: exact, tilde, and caret each accept a partial version
    Given ".plugin/deps.json" manages "aa" and "bb" and "cc"
    And a skill "skills/x/SKILL.md" contains "npx aa@2" and "npx bb@~2.4" and "npx cc@^2"
    And the registry resolves "aa" at latest to "3.0.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx aa@2"
    And "skills/x/SKILL.md" contains "npx bb@~2.4"
    And "skills/x/SKILL.md" contains "npx cc@^2"
    And the exit code is 0

  # ── Anything outside the five forms is ignored ──

  Scenario: a dist-tag reference is not one of the five forms and is left untouched
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@latest --help"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@latest --help"
    And the exit code is 0

  Scenario: a comparator range is not one of the five forms and is left untouched
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@>=1.0.0"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@>=1.0.0"
    And the exit code is 0

  # ── deps up — moving a pin or range explicitly ──

  Scenario: --latest is how an exact pin moves
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@3.1.0"
    And the exit code is 0

  Scenario: --latest bumps a range floor and keeps the operator
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^2.4"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^3.1"
    And the exit code is 0

  Scenario: naming a spec sets the constraint in the prose
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    When I run "universal-plugin plugin deps up cyberlegion@^2.4"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^2.4"
    And the exit code is 0

  Scenario: an exact reference already at the newest is left unchanged
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And the registry resolves "cyberlegion" at latest to "0.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And stdout is TOON with a row for "cyberlegion" whose "status" is "unchanged"
    And the exit code is 0

  # ── One constraint per managed package ──

  Scenario: two references with different constraints fails loud
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 1
    And stderr contains "cyberlegion"
    And "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"

  Scenario: ls reports two conflicting constraints as divergent
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "cyberlegion" whose "status" is "divergent"
    And the exit code is 0

  Scenario: the same constraint declared twice is not divergent
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^0.1.0"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"

  Scenario: a placeholder adopts a sibling's constraint and is pinned within it
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@<version>"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And "skills/a/SKILL.md" contains "npx cyberlegion@2.4.1"
    And "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"

  Scenario: a placeholder carries no constraint and never causes divergence
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@<version>"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0

  Scenario: prose references carry no constraint and never cause divergence
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion mail hook"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And "skills/a/SKILL.md" contains "npx cyberlegion mail hook"
    And "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"

  Scenario: two conflicting constraints inside one file is divergent
    Given ".plugin/deps.json" manages "universal-plugin"
    And a skill "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3" and "npx universal-plugin@1.5.0"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 1
    And stderr contains "universal-plugin"
    And "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.5.0"

  # ── ignore (a path escape, evaluated first) ──

  Scenario: ignoring the illustration file clears the divergence and leaves it untouched
    Given ".plugin/deps.json" manages "universal-plugin" and ignores "skills/upgrade/SKILL.md"
    And a skill "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3" and "npx universal-plugin@1.5.0"
    And a skill "skills/other/SKILL.md" contains "npx universal-plugin@<version>"
    And the registry resolves "universal-plugin" to "0.2.1"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.5.0"
    And "skills/other/SKILL.md" contains "npx universal-plugin@0.2.1"

  Scenario: ignore scopes to the path, not the package
    Given ".plugin/deps.json" manages "universal-plugin" and ignores "skills/upgrade/SKILL.md"
    And a skill "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And a skill "skills/other/SKILL.md" contains "npx universal-plugin@0.0.9"
    And the registry resolves "universal-plugin" at latest to "0.2.1"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/other/SKILL.md" contains "npx universal-plugin@0.2.1"
    And "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And the exit code is 0

  # ── Extraction boundary ──

  Scenario: a trailing sentence delimiter is not part of the version spec
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "Run npx cyberlegion@0.0.9."
    And the registry resolves "cyberlegion" at latest to "0.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "Run npx cyberlegion@0.1.0."
    And the exit code is 0

  Scenario: a backtick closing an inline code span is not part of the version spec
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "`npx cyberlegion@0.0.9`"
    And the registry resolves "cyberlegion" at latest to "0.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "`npx cyberlegion@0.1.0`"
    And the exit code is 0

  # ── deps ls — status ──

  Scenario: ls reports a package with a concrete constraint as pinned
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^0.1"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row carrying "package" "cyberlegion" and "constraint" "^0.1"
    And stdout is TOON with a row for "cyberlegion" whose "status" is "pinned"
    And the exit code is 0

  Scenario: a package with only prose and placeholders is unpinned
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion mail hook"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@<version>"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "cyberlegion" whose "status" is "unpinned"
    And the exit code is 0

  Scenario: ls surfaces a bare-prose reference as a warning count
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion mail hook"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "cyberlegion" whose "warnings" is "1"
    And the exit code is 0

  Scenario: ls reads the files without contacting a registry
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And no network is available
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row carrying "package" "cyberlegion" and "constraint" "0.1.0"
    And the exit code is 0

  Scenario: nothing managed is a definitive empty state
    Given ".plugin/deps.json" manages no packages
    When I run "universal-plugin plugin deps ls"
    Then the exit code is 0
    And stdout contains the aggregate summary "0 dependencies"
    And stderr contains "nothing managed"

  # ── A managed package with no reference ──

  Scenario: ls reports a managed package with no reference as unused
    Given ".plugin/deps.json" manages "gherkin-cli"
    And no skill contains an "npx gherkin-cli" reference
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "gherkin-cli" whose "status" is "unused"
    And the exit code is 0

  Scenario: up writes nothing for a managed package with no reference
    Given ".plugin/deps.json" manages "gherkin-cli"
    And no skill contains an "npx gherkin-cli" reference
    And the registry resolves "gherkin-cli" to "0.1.5"
    When I run "universal-plugin plugin deps up"
    Then no skill file is written
    And the exit code is 0

  # ── deps up — all-or-nothing ──

  Scenario: a managed package the registry cannot resolve writes nothing and fails
    Given ".plugin/deps.json" manages "cyberlegion" and "cyberfleet"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>" and "npx cyberfleet@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    And the registry cannot resolve "cyberfleet"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 1
    And "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And stderr contains "cyberfleet"

  # ── deps.json shape (writes preserve what they do not own) ──

  Scenario: up writes only skill files and never touches deps.json
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And ".plugin/deps.json" is unchanged
    And the exit code is 0

  Scenario: add preserves the hand-edited keys it does not own
    Given ".plugin/deps.json" manages "cyberlegion", ignores "skills/upgrade/SKILL.md", and carries a "$schema" key
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps add gherkin-cli"
    Then ".plugin/deps.json" still ignores "skills/upgrade/SKILL.md"
    And ".plugin/deps.json" still carries its "$schema" key
    And ".plugin/deps.json" manages "gherkin-cli"

  # ── deps add / deps remove ──

  Scenario: add puts a name on the managed list
    Given ".plugin/deps.json" manages no packages
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps add gherkin-cli"
    Then ".plugin/deps.json" manages "gherkin-cli"
    And the exit code is 0

  Scenario: a bare add leaves the prose for the next up
    Given ".plugin/deps.json" manages no packages
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@<version>"
    When I run "universal-plugin plugin deps add gherkin-cli"
    Then "skills/x/SKILL.md" contains "npx gherkin-cli@<version>"
    And the exit code is 0

  Scenario: add with a spec sets the constraint in the prose
    Given ".plugin/deps.json" manages no packages
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps add gherkin-cli@^0.1"
    Then "skills/x/SKILL.md" contains "npx gherkin-cli@^0.1"
    And ".plugin/deps.json" manages "gherkin-cli"
    And the exit code is 0

  Scenario: adding an already-managed name is a no-op
    Given ".plugin/deps.json" manages "cyberlegion"
    When I run "universal-plugin plugin deps add cyberlegion"
    Then the exit code is 0
    And ".plugin/deps.json" manages "cyberlegion"

  Scenario: remove takes a name off the list
    Given ".plugin/deps.json" manages "cyberlegion"
    When I run "universal-plugin plugin deps remove cyberlegion"
    Then ".plugin/deps.json" does not manage "cyberlegion"
    And the exit code is 0

  Scenario: remove leaves the prose alone
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    When I run "universal-plugin plugin deps remove cyberlegion"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And the exit code is 0

  Scenario: removing a name that is not managed fails loud
    Given ".plugin/deps.json" manages "cyberlegion"
    When I run "universal-plugin plugin deps remove nonesuch"
    Then the exit code is 1
    And stderr contains "nonesuch"

  # ── Naming an unmanaged package ──

  Scenario: up naming an unmanaged package fails loud and points at add
    Given ".plugin/deps.json" manages "cyberlegion"
    And the registry resolves "nonesuch" to "1.0.0"
    When I run "universal-plugin plugin deps up nonesuch@1.0.0"
    Then the exit code is 1
    And stderr contains "nonesuch"
    And stderr contains "deps add"
    And ".plugin/deps.json" does not manage "nonesuch"

  # ── Registry ──

  Scenario: --registry resolves from the named registry
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry at "https://npm.example.com" resolves "cyberlegion" to "9.9.9"
    When I run "universal-plugin plugin deps up --registry https://npm.example.com"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@9.9.9"
    And the exit code is 0

  Scenario: --help names npmjs.org as the default registry
    When I run "universal-plugin plugin deps up --help"
    Then the exit code is 0
    And stdout contains "npmjs.org"

  # ── Write control ──

  Scenario: --dry-run reports without writing the skills
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up --dry-run"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And stdout is TOON with a row carrying "package" "cyberlegion", "constraint" "<version>", "resolved" "0.1.0"
    And the exit code is 0

  # ── AXI output contract ──

  Scenario: an up prints TOON rows and a pre-computed aggregate
    Given ".plugin/deps.json" manages "cyberlegion" and "cyberfleet"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>" and "npx cyberfleet@0.0.1"
    And the registry resolves "cyberlegion" to "0.1.0"
    And the registry resolves "cyberfleet" at latest to "0.0.1"
    When I run "universal-plugin plugin deps up"
    Then stdout is TOON with one row per package carrying "package", "constraint", "resolved", "status"
    And stdout contains the aggregate summary "updated 1, unchanged 1"
    And the exit code is 0

  Scenario: --format json returns a structured deps result
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up --format json"
    Then stdout is JSON with a "deps" array
    And a deps entry has "package" "cyberlegion" and "resolved" "0.1.0"
    And the exit code is 0

  Scenario: --format toon names the default explicitly
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up --format toon"
    Then stdout is TOON with one row per package
    And the exit code is 0

  Scenario: a large deps list truncates with a size hint
    Given ".plugin/deps.json" manages 40 packages each with a pinned reference
    When I run "universal-plugin plugin deps ls"
    Then stdout lists a truncated set of rows
    And stdout ends with a truncation hint matching "… \+\d+ more — rerun with --full"
    And the exit code is 0

  Scenario: --full suppresses truncation
    Given ".plugin/deps.json" manages 40 packages each with a pinned reference
    When I run "universal-plugin plugin deps ls --full"
    Then stdout lists all 40 rows
    And the exit code is 0

  Scenario: deps with no subcommand shows live data
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    When I run "universal-plugin plugin deps"
    Then stdout is TOON with a row carrying "package" "cyberlegion"
    And the exit code is 0

  Scenario: a successful up ends with a next-step suggestion
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then stderr ends with a "→" next-step suggestion

  Scenario: deps never prompts interactively
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    When I run "universal-plugin plugin deps up --frobnicate"
    Then the exit code is 1
    And stderr contains "--frobnicate"

  Scenario: --help documents the deps up flags
    When I run "universal-plugin plugin deps up --help"
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
    And stdout contains "--latest"
