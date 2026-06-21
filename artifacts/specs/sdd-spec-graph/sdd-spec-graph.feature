Feature: Render the spec DAG to graph.md

  Scenario: a blocked-by edge becomes a graph edge
    Given a spec "universal-plugin" with blocked-by "sdd-plugin"
    When the renderer runs
    Then graph.md contains the edge "sdd-plugin --> universal-plugin"

  Scenario: a spec with no edges appears as a bare node
    Given a spec "motive-model" with empty blocked-by
    And no other spec lists "motive-model" in blocked-by
    When the renderer runs
    Then graph.md declares "motive-model" as a standalone node

  Scenario: multiple blockers produce one edge each
    Given a spec "aces-spec-designer-composition" with blocked-by "governance-composition" and "aces-skill-spec-schema"
    When the renderer runs
    Then graph.md contains the edge "governance-composition --> aces-spec-designer-composition"
    And graph.md contains the edge "aces-skill-spec-schema --> aces-spec-designer-composition"

  Scenario: the node table lists slug, blocked-by, and status
    Given a spec "universal-plugin" with status "draft" and blocked-by "sdd-plugin"
    When the renderer runs
    Then graph.md has a node table row for "universal-plugin" showing blocked-by "sdd-plugin" and status "draft"

  Scenario: output is deterministic across runs
    Given a fixed set of specs
    When the renderer runs twice
    Then both runs produce byte-identical graph.md

  Scenario: a cycle is rejected
    Given a spec "a" with blocked-by "b"
    And a spec "b" with blocked-by "a"
    When the renderer runs
    Then it reports the cycle "a -> b -> a"
    And it exits with code 1
    And it does not write graph.md

  Scenario: check mode passes when graph.md is current
    Given graph.md matches the current blocked-by edges
    When the renderer runs with --check
    Then it writes nothing
    And it exits with code 0

  Scenario: check mode fails when graph.md is stale
    Given a blocked-by edge was changed but graph.md was not regenerated
    When the renderer runs with --check
    Then it reports graph.md is stale
    And it exits with code 1

  Scenario: check mode fails when graph.md is missing
    Given graph.md does not exist
    When the renderer runs with --check
    Then it exits with code 1

  Scenario: frontmatter blocked-by is parsed in every form
    Given a spec with inline "blocked-by: [x, y]"
    And a spec with block-list "blocked-by:" then "- x"
    And a spec with "blocked-by: []"
    When the frontmatter is parsed
    Then the inline and block forms both yield two blockers
    And the empty form yields no blockers

  Scenario: a folder without spec.md is ignored
    Given a directory "empty-folder" under the specs root with no spec.md
    When the renderer runs
    Then "empty-folder" is not a node in graph.md
