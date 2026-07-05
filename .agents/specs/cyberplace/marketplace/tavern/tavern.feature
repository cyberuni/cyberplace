@frozen
Feature: tavern — browse and recruit crews
  The cyberplace Tavern: the crew-recruitment storefront. A crew is a plugin listed in the cyberplace
  marketplace manifest (.claude-plugin/marketplace.json) marked by a reserved "crew" tag in the
  entry's tags[]. Ships as a CLI command (cyberplace tavern) over the marketplace manifest and a
  website storefront (a Starlight section rendering the same roster as cards). cyberfleet's Crimp
  recruits crews through this CLI. The Tavern lists and points to recruit only; deploying, tuning,
  and recruiting-through-the-persona are cyberfleet concerns (Operator / Tuner / Crimp), out of scope
  here. General skill discovery lives in awesome-list. Output follows the shared AXI contract
  (../../axi/README.md): TOON by default, a pre-computed aggregate, a definitive empty state,
  next-step on stderr, and fail-loud errors.

  # ── The crew tag selects the roster from the marketplace manifest ──

  Scenario: a marketplace plugin tagged crew appears in the tavern roster
    Given a marketplace plugin whose tags include "crew"
    When a user runs cyberplace tavern
    Then that plugin is listed in the crew roster

  Scenario: a marketplace plugin not tagged crew is excluded from the roster
    Given a marketplace plugin whose tags do not include "crew"
    When a user runs cyberplace tavern
    Then that plugin is not listed in the crew roster

  # ── Each crew is recruitable from the roster ──

  Scenario: the roster shows each crew's recruit command
    Given a crew-tagged marketplace plugin named "navigator"
    When a user runs cyberplace tavern
    Then the listing for "navigator" includes the recruit command cyberplace add navigator

  # ── Filtering and output formats ──

  Scenario: cyberplace tavern <query> filters the crew roster by text
    Given crew-tagged plugins "navigator" and "gunner"
    When a user runs cyberplace tavern navigator
    Then the roster includes "navigator" and excludes "gunner"

  Scenario: a query never surfaces a non-crew plugin
    Given a non-crew plugin "navigator" that matches the query text
    When a user runs cyberplace tavern navigator
    Then "navigator" is not in the roster

  Scenario: json output emits structured crew records
    Given a crew-tagged plugin "navigator"
    When a user runs cyberplace tavern --format json
    Then the output is valid JSON listing "navigator" with its recruit command

  # ── Empty tavern is graceful ──

  Scenario: a marketplace with no crew-tagged plugins yields an empty roster, not an error
    Given the marketplace manifest has no crew-tagged plugins
    When a user runs cyberplace tavern
    Then the command exits 0 and reports that there are no crews

  # ── The website storefront ──

  Scenario: the Tavern website page renders a card per crew
    Given a crew-tagged plugin "navigator" in the marketplace manifest
    When the website is built
    Then the Tavern page at docs/tavern renders a card for "navigator" with its description and recruit command

  Scenario: the Tavern website card shows the crew's tags and source link
    Given a crew-tagged plugin "navigator" with source "./plugins/navigator"
    When the website is built
    Then the "navigator" card shows its tags and links to the plugin source

  Scenario: the Tavern page is reachable from the site top navigation
    Given the built website
    Then the Tavern is registered in the site top navigation
    And the Tavern is registered in the sidebar navigation

  # ── Boundary: the Tavern does not deploy ──

  Scenario: the Tavern lists a crew but performs no recruit, install, or deployment
    Given a crew-tagged plugin "navigator"
    When a user runs cyberplace tavern
    Then the command only prints the roster and recruit command
    And it does not recruit, install, deploy, or launch the crew

  # ── AXI: TOON default + aggregate (#1,#2,#4) ──

  Scenario: tavern prints a TOON result with a pre-computed aggregate
    Given crew-tagged plugins "navigator" and "gunner"
    When a user runs cyberplace tavern
    Then stdout is TOON with rows carrying "name", "description", and "recruit"
    And stdout contains the aggregate summary "2 crews"
    And the exit code is 0

  # ── AXI: truncation + --full (#3) ──

  Scenario: a long crew roster truncates with a size hint
    Given the marketplace manifest has 40 crew-tagged plugins
    When a user runs cyberplace tavern
    Then the exit code is 0
    And stdout is truncated with a size hint matching "… +\d+ lines — rerun with --full"

  Scenario: tavern --full prints the whole roster untruncated
    Given the marketplace manifest has 40 crew-tagged plugins
    When a user runs cyberplace tavern --full
    Then the exit code is 0
    And stdout lists all 40 crews

  Scenario: tavern --format json is never truncated
    Given the marketplace manifest has 40 crew-tagged plugins
    When a user runs cyberplace tavern --format json
    Then the exit code is 0
    And stdout is valid JSON listing all 40 crews

  # ── AXI: definitive empty state (#5) ──

  Scenario: an empty roster is a definitive empty state
    Given the marketplace manifest has no crew-tagged plugins
    When a user runs cyberplace tavern
    Then the exit code is 0
    And stdout contains "0 crews found"

  # ── AXI: content-first (#8) ──

  Scenario: bare cyberplace tavern shows the roster, not help
    Given a crew-tagged plugin "navigator"
    When a user runs cyberplace tavern
    Then stdout lists the crew roster
    And stdout does not contain the command usage help

  # ── AXI: next-step suggestions (#9) ──

  Scenario: tavern ends with a next-step suggestion
    Given a crew-tagged plugin "navigator"
    When a user runs cyberplace tavern
    Then stderr ends with "→ cyberplace add <name>"

  # ── AXI: non-interactive, fail-loud (#6) ──

  Scenario: tavern never prompts interactively
    Given a crew-tagged plugin "navigator"
    When a user runs cyberplace tavern
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    Given a crew-tagged plugin "navigator"
    When a user runs cyberplace tavern --frobnicate
    Then the exit code is 1
    And stderr contains "--frobnicate"

  # ── AXI: help (#10) ──

  Scenario: tavern --help prints a concise reference
    When a user runs cyberplace tavern --help
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
