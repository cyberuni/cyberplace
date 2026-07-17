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

  Scenario: an unmanaged package another tool's command names is invisible to up
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx skills add cyberuni/cyberplace --skill legate"
    And the registry resolves "skills" to "1.5.19"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx skills add cyberuni/cyberplace --skill legate"
    And no row is emitted for "skills"
    And the exit code is 0

  Scenario: an unmanaged package named by English prose is invisible to up
    Given ".plugin/deps.json" manages "cyberlegion"
    And a governance doc "governance/spec-judge.md" contains "shipping an npx dependency"
    And the registry resolves "dependency" to "0.0.1"
    And the registry resolves "cyberlegion" to "0.1.0"
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

  # ── deps scan ──

  Scenario: scan reports unmanaged npx references as candidates with a file count
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx gherkin-cli@0.0.2"
    And a skill "skills/b/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps scan"
    Then stdout is TOON with a row carrying "package" "gherkin-cli" and "files" "2"
    And the exit code is 0

  Scenario: scan excludes names that are already managed
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0" and "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps scan"
    Then no row is emitted for "cyberlegion"
    And stdout is TOON with a row carrying "package" "gherkin-cli"

  Scenario: scan writes nothing
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps scan"
    Then "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    And ".plugin/deps.json" does not manage "gherkin-cli"

  Scenario: scan ends with a next-step naming deps add
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps scan"
    Then stderr ends with a "→" next-step suggestion
    And stderr mentions "deps add"

  Scenario: nothing unmanaged is a definitive empty state
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    When I run "universal-plugin plugin deps scan"
    Then the exit code is 0
    And stdout contains the aggregate summary "0 candidates"
    And stderr contains "nothing to scan"

  # ── deps ls ──

  Scenario: ls reports a managed name's declared spec and recorded resolution
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row carrying "package" "cyberlegion", "declared" "^0.1.0", "resolved" "0.1.0"
    And the exit code is 0

  Scenario: a recorded resolution outside the declared range is stale
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^0.2.0"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "cyberlegion" whose "status" is "stale"
    And the exit code is 0

  Scenario: ls reads the lock without contacting a registry
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    And no network is available
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row carrying "package" "cyberlegion" and "resolved" "0.1.0"
    And the exit code is 0

  Scenario: ls keeps a managed name's placeholder reference visible
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "cyberlegion" whose "status" is "placeholder"
    And the exit code is 0

  Scenario: ls keeps a managed name's ignored reference visible
    Given ".plugin/deps.json" manages "universal-plugin" and ignores "skills/upgrade/SKILL.md"
    And a skill "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "universal-plugin" whose "status" is "ignored"
    And the exit code is 0

  Scenario: nothing managed is a definitive empty state
    Given ".plugin/deps.json" manages no packages
    When I run "universal-plugin plugin deps ls"
    Then the exit code is 0
    And stdout contains the aggregate summary "0 dependencies"
    And stderr contains "nothing managed"

  # ── deps up — write semantics ──

  Scenario: a bare reference to a managed package is pinned exact
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0 mail hook"
    And the exit code is 0

  Scenario: a named range is written through to the prose
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up cyberlegion@^2.0.0"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And ".plugin/deps.json" records "cyberlegion" resolved "2.4.1"
    And the exit code is 0

  Scenario: --exact resolves a named range to an exact version on disk
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up cyberlegion@^2.0.0 --exact"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@2.4.1"
    And "skills/x/SKILL.md" does not contain "npx cyberlegion@^2.0.0"
    And the exit code is 0

  Scenario: --latest ignores the spec the prose declares
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@2.0.1"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@3.1.0"
    And the exit code is 0

  Scenario: --latest keeps the range operator the prose already declared
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^3.1.0"
    And the exit code is 0

  Scenario: a bare up leaves a declared range in the prose and refreshes the lock
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And the registry resolves "cyberlegion@^0.1.0" to "0.1.9"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And ".plugin/deps.json" records "cyberlegion" resolved "0.1.9"
    And the exit code is 0

  Scenario: a bare up never moves an exact pin, even when a newer version exists
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And ".plugin/deps.json" records "cyberlegion" resolved "0.0.9"
    And the exit code is 0

  Scenario: --latest is how an exact pin moves
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@3.1.0"
    And the exit code is 0

  Scenario: a declaration already at the resolved version is left unchanged
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And the registry resolves "cyberlegion@^0.1.0" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And stdout is TOON with a row for "cyberlegion" whose "status" is "unchanged"
    And the exit code is 0

  # ── One spec per managed package ──

  Scenario: two skills declaring different specs for one managed package fails loud
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And the registry resolves "cyberlegion@^0.1.0" to "0.1.9"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 1
    And stderr contains "cyberlegion"
    And "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"

  Scenario: ls reports divergent specs for one managed package
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "cyberlegion" whose "status" is "divergent"
    And the exit code is 0

  Scenario: a bare reference adopts a sibling's declared range rather than diverging from it
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion mail hook"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And "skills/a/SKILL.md" contains "npx cyberlegion@^2.0.0 mail hook"
    And "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And ".plugin/deps.json" records "cyberlegion" resolved "2.4.1"

  Scenario: a bare reference adopts a sibling's declared exact pin
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion mail hook"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry resolves "cyberlegion" at latest to "3.1.0"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And "skills/a/SKILL.md" contains "npx cyberlegion@0.0.9 mail hook"
    And "skills/b/SKILL.md" contains "npx cyberlegion@0.0.9"

  Scenario: adopting leaves nothing for a second up to change
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "2.4.1"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^2.0.0 mail hook"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^2.0.0"
    And the registry resolves "cyberlegion@^2.0.0" to "2.4.1"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And stdout is TOON with a row for "cyberlegion" whose "status" is "unchanged"

  Scenario: the same spec declared in two skills is not divergent
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/a/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And a skill "skills/b/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And the registry resolves "cyberlegion@^0.1.0" to "0.1.9"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 0
    And ".plugin/deps.json" records "cyberlegion" resolved "0.1.9"

  # ── A managed package with no reference ──

  Scenario: ls reports a managed package with no reference as unused
    Given ".plugin/deps.json" manages "gherkin-cli"
    And no skill contains an "npx gherkin-cli" reference
    When I run "universal-plugin plugin deps ls"
    Then stdout is TOON with a row for "gherkin-cli" whose "status" is "unused"
    And the exit code is 0

  Scenario: up records nothing for a managed package with no reference
    Given ".plugin/deps.json" manages "gherkin-cli"
    And no skill contains an "npx gherkin-cli" reference
    And the registry resolves "gherkin-cli" to "0.1.5"
    When I run "universal-plugin plugin deps up"
    Then ".plugin/deps.json" does not record a resolution for "gherkin-cli"
    And the exit code is 0

  # ── deps up — all-or-nothing ──

  Scenario: a managed package the registry cannot resolve writes nothing and fails
    Given ".plugin/deps.json" manages "cyberlegion" and "cyberfleet"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook" and "npx cyberfleet@0.0.1"
    And the registry resolves "cyberlegion" to "0.1.0"
    And the registry cannot resolve "cyberfleet"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 1
    And "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And stderr contains "cyberfleet"

  Scenario: a failed resolution leaves the lock untouched
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.0.9"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry cannot resolve "cyberlegion"
    When I run "universal-plugin plugin deps up"
    Then the exit code is 1
    And ".plugin/deps.json" records "cyberlegion" resolved "0.0.9"

  # ── Form: placeholder and extraction boundary ──

  Scenario: a placeholder on a managed package is never rewritten
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@<version>"
    And the exit code is 0

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

  # ── ignore ──

  Scenario: an ignored path is never rewritten even when --latest would cross its pin
    Given ".plugin/deps.json" manages "universal-plugin" and ignores "skills/upgrade/SKILL.md"
    And a skill "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And the registry resolves "universal-plugin" at latest to "0.2.1"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And the exit code is 0

  Scenario: ignore scopes to the path, not the package
    Given ".plugin/deps.json" manages "universal-plugin" and ignores "skills/upgrade/SKILL.md"
    And a skill "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"
    And a skill "skills/other/SKILL.md" contains "npx universal-plugin@0.0.9"
    And the registry resolves "universal-plugin" at latest to "0.2.1"
    When I run "universal-plugin plugin deps up --latest"
    Then "skills/other/SKILL.md" contains "npx universal-plugin@0.2.1"
    And "skills/upgrade/SKILL.md" contains "npx universal-plugin@1.2.3"

  # ── The lock ──

  Scenario: up records what each managed package resolved to
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then ".plugin/deps.json" records "cyberlegion" resolved "0.1.0"
    And "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0 mail hook"
    And the exit code is 0

  Scenario: up preserves the hand-edited keys it does not own
    Given ".plugin/deps.json" manages "cyberlegion", ignores "skills/upgrade/SKILL.md", and carries a "$schema" key
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then ".plugin/deps.json" still ignores "skills/upgrade/SKILL.md"
    And ".plugin/deps.json" still carries its "$schema" key
    And ".plugin/deps.json" records "cyberlegion" resolved "0.1.0"
    And "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0 mail hook"

  # ── deps add / deps remove ──

  Scenario: add puts a name on the managed list
    Given ".plugin/deps.json" manages no packages
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    When I run "universal-plugin plugin deps add gherkin-cli"
    Then ".plugin/deps.json" manages "gherkin-cli"
    And the exit code is 0

  Scenario: a bare add leaves the prose for the next up
    Given ".plugin/deps.json" manages no packages
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    And the registry resolves "gherkin-cli" to "0.1.5"
    When I run "universal-plugin plugin deps add gherkin-cli"
    Then "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    And the exit code is 0

  Scenario: add with a spec writes that spec through and records its resolution
    Given ".plugin/deps.json" manages no packages
    And a skill "skills/x/SKILL.md" contains "npx gherkin-cli@0.0.2"
    And the registry resolves "gherkin-cli@^0.1.0" to "0.1.5"
    When I run "universal-plugin plugin deps add gherkin-cli@^0.1.0"
    Then "skills/x/SKILL.md" contains "npx gherkin-cli@^0.1.0"
    And ".plugin/deps.json" records "gherkin-cli" resolved "0.1.5"
    And the exit code is 0

  Scenario: adding an already-managed name is a no-op
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    When I run "universal-plugin plugin deps add cyberlegion"
    Then the exit code is 0
    And ".plugin/deps.json" records "cyberlegion" resolved "0.1.0"

  Scenario: remove takes a name off the list and drops its recorded resolution
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    When I run "universal-plugin plugin deps remove cyberlegion"
    Then ".plugin/deps.json" does not manage "cyberlegion"
    And the exit code is 0

  Scenario: remove leaves the prose alone
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
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
    And stderr mentions "deps add"

  Scenario: up never grows the managed list as a side effect
    Given ".plugin/deps.json" manages "cyberlegion"
    And the registry resolves "nonesuch" to "1.0.0"
    When I run "universal-plugin plugin deps up nonesuch@1.0.0"
    Then ".plugin/deps.json" does not manage "nonesuch"

  # ── Registry ──

  Scenario: --registry resolves from the named registry
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.0.9"
    And the registry at "https://npm.example.com" resolves "cyberlegion" to "9.9.9"
    When I run "universal-plugin plugin deps up --registry https://npm.example.com"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@9.9.9"
    And the exit code is 0

  Scenario: --help names npmjs.org as the default registry
    When I run "universal-plugin plugin deps up --help"
    Then the exit code is 0
    And stdout mentions "npmjs.org"

  # ── Write control ──

  Scenario: --dry-run reports without writing the skills or the lock
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And the registry resolves "cyberlegion@^0.1.0" to "0.1.9"
    When I run "universal-plugin plugin deps up --dry-run"
    Then "skills/x/SKILL.md" contains "npx cyberlegion@^0.1.0"
    And ".plugin/deps.json" records "cyberlegion" resolved "0.1.0"
    And stdout is TOON with a row carrying "package" "cyberlegion", "declared" "^0.1.0", "resolved" "0.1.9"
    And the exit code is 0

  # ── AXI output contract ──

  Scenario: an up prints TOON rows and a pre-computed aggregate
    Given ".plugin/deps.json" manages "cyberlegion" and "cyberfleet"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook" and "npx cyberfleet@0.0.1"
    And the registry resolves "cyberlegion" to "0.1.0"
    And the registry resolves "cyberfleet" to "0.0.1"
    When I run "universal-plugin plugin deps up"
    Then stdout is TOON with one row per package carrying "package", "declared", "resolved", "status"
    And stdout contains the aggregate summary "updated 1, unchanged 1"
    And the exit code is 0

  Scenario: --format json returns a structured deps result
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up --format json"
    Then stdout is JSON with a "deps" array
    And a deps entry has "package" "cyberlegion" and "resolved" "0.1.0"
    And the exit code is 0

  Scenario: --format toon names the default explicitly
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up --format toon"
    Then stdout is TOON with one row per package
    And the exit code is 0

  Scenario: a large deps list truncates with a size hint
    Given ".plugin/deps.json" manages 40 packages with recorded resolutions
    When I run "universal-plugin plugin deps ls"
    Then stdout lists a truncated set of rows
    And stdout ends with a truncation hint matching "… \+\d+ more — rerun with --full"
    And the exit code is 0

  Scenario: --full suppresses truncation
    Given ".plugin/deps.json" manages 40 packages with recorded resolutions
    When I run "universal-plugin plugin deps ls --full"
    Then stdout lists all 40 rows
    And the exit code is 0

  Scenario: deps with no subcommand shows live data
    Given ".plugin/deps.json" manages "cyberlegion" with resolved "0.1.0"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion@0.1.0"
    When I run "universal-plugin plugin deps"
    Then stdout is TOON with a row carrying "package" "cyberlegion"
    And the exit code is 0

  Scenario: a successful up ends with a next-step suggestion
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
    And the registry resolves "cyberlegion" to "0.1.0"
    When I run "universal-plugin plugin deps up"
    Then stderr ends with a "→" next-step suggestion

  Scenario: deps never prompts interactively
    Given ".plugin/deps.json" manages "cyberlegion"
    And a skill "skills/x/SKILL.md" contains "npx cyberlegion mail hook"
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
    And stdout mentions "--exact" and "--latest"
