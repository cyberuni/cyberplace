@frozen
Feature: tavern — browse and install crews
  The cyberplace Tavern: a discovery + install surface for crews — catalog entries that ship an
  installable persona gateway skill, marked by a reserved "crew" tag in the entry's tags[] (no
  catalog schema change). Ships as a CLI command (cyberplace tavern) over the resolved awesome
  catalog and a website storefront (a Starlight section rendering the same roster). The Tavern
  lists and points to install only; deploying, tuning, and recruiting crews are cyberfleet
  concerns (Operator / Tuner / Crimp), out of scope here. General discovery lives in awesome-list.
  Output follows the shared AXI contract (../../axi/README.md): TOON by default, a pre-computed
  aggregate, a definitive empty state, next-step on stderr, and fail-loud errors.

  # ── The crew tag selects the roster ──

  Scenario: an entry tagged crew appears in the tavern roster
    Given a catalog entry whose tags include "crew"
    When a user runs cyberplace tavern
    Then that entry is listed in the crew roster

  Scenario: an entry not tagged crew is excluded from the roster
    Given a catalog entry whose tags do not include "crew"
    When a user runs cyberplace tavern
    Then that entry is not listed in the crew roster

  # ── Each crew is installable from the roster ──

  Scenario: the roster shows each crew's install command
    Given a crew-tagged repo entry "acme/navigator"
    When a user runs cyberplace tavern
    Then the listing for "acme/navigator" includes the install command npx skills add acme/navigator

  Scenario: a crew-tagged skill entry derives a --skill install command
    Given a crew-tagged skill entry for skill "helm" in repo "acme/navigator"
    When a user runs cyberplace tavern
    Then the listing includes npx skills add acme/navigator --skill helm

  # ── Filtering and output formats ──

  Scenario: cyberplace tavern <query> filters the crew roster by text
    Given crew-tagged entries "acme/navigator" and "acme/gunner"
    When a user runs cyberplace tavern navigator
    Then the roster includes "acme/navigator" and excludes "acme/gunner"

  Scenario: a query never surfaces a non-crew entry
    Given a non-crew entry "acme/navigator" that matches the query text
    When a user runs cyberplace tavern navigator
    Then "acme/navigator" is not in the roster

  Scenario: json output emits structured crew records
    Given a crew-tagged entry "acme/navigator"
    When a user runs cyberplace tavern --format json
    Then the output is valid JSON listing "acme/navigator" with its install command

  # ── Empty tavern is graceful ──

  Scenario: an empty catalog yields an empty roster, not an error
    Given the resolved catalog has no crew-tagged entries
    When a user runs cyberplace tavern
    Then the command exits 0 and reports that there are no crews

  # ── The website storefront ──

  Scenario: the Tavern website page lists the cataloged crews
    Given a crew-tagged entry "acme/navigator" in the catalog
    When the website is built
    Then the Tavern page at docs/tavern renders "acme/navigator" with its install command

  Scenario: the Tavern page is reachable from the site navigation
    Given the built website
    Then the Tavern section is registered in the sidebar navigation

  # ── Boundary: the Tavern does not deploy ──

  Scenario: the Tavern lists a crew but performs no install or deployment
    Given a crew-tagged entry "acme/navigator"
    When a user runs cyberplace tavern
    Then the command only prints the roster and install command
    And it does not install, deploy, or launch the crew

  # ── AXI: TOON default + aggregate (#1,#2,#4) ──

  Scenario: tavern prints a TOON result with a pre-computed aggregate
    Given crew-tagged entries "acme/navigator" and "acme/gunner"
    When a user runs cyberplace tavern
    Then stdout is TOON with rows carrying "repo", "summary", and "install"
    And stdout contains the aggregate summary "2 crews"
    And the exit code is 0

  # ── AXI: truncation + --full (#3) ──

  Scenario: a long crew roster truncates with a size hint
    Given the resolved catalog has 40 crew-tagged entries
    When a user runs cyberplace tavern
    Then the exit code is 0
    And stdout is truncated with a size hint matching "… +\d+ lines — rerun with --full"

  Scenario: tavern --full prints the whole roster untruncated
    Given the resolved catalog has 40 crew-tagged entries
    When a user runs cyberplace tavern --full
    Then the exit code is 0
    And stdout lists all 40 crews

  Scenario: tavern --format json is never truncated
    Given the resolved catalog has 40 crew-tagged entries
    When a user runs cyberplace tavern --format json
    Then the exit code is 0
    And stdout is valid JSON listing all 40 crews

  # ── AXI: definitive empty state (#5) ──

  Scenario: an empty roster is a definitive empty state
    Given the resolved catalog has no crew-tagged entries
    When a user runs cyberplace tavern
    Then the exit code is 0
    And stdout contains "0 crews found"

  # ── AXI: content-first (#8) ──

  Scenario: bare cyberplace tavern shows the roster, not help
    Given a crew-tagged entry "acme/navigator"
    When a user runs cyberplace tavern
    Then stdout lists the crew roster
    And stdout does not contain the command usage help

  # ── AXI: next-step suggestions (#9) ──

  Scenario: tavern ends with a next-step suggestion
    Given a crew-tagged entry "acme/navigator"
    When a user runs cyberplace tavern
    Then stderr ends with "→ cyberplace add <spec>"

  # ── AXI: non-interactive, fail-loud (#6) ──

  Scenario: tavern never prompts interactively
    Given a crew-tagged entry "acme/navigator"
    When a user runs cyberplace tavern
    Then no interactive prompts are shown
    And the exit code is 0

  Scenario: an unknown flag fails loud
    Given a crew-tagged entry "acme/navigator"
    When a user runs cyberplace tavern --frobnicate
    Then the exit code is 1
    And stderr contains "--frobnicate"

  # ── AXI: help (#10) ──

  Scenario: tavern --help prints a concise reference
    When a user runs cyberplace tavern --help
    Then the exit code is 0
    And stdout contains a synopsis, the flags, and one example
