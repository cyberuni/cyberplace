@frozen
Feature: tavern — browse and install crews
  The cyberplace Tavern: a discovery + install surface for crews — catalog entries that ship an
  installable persona gateway skill, marked by a reserved "crew" tag in the entry's tags[] (no
  catalog schema change). Ships as a CLI command (cyberplace tavern) over the resolved awesome
  catalog and a website storefront (a Starlight section rendering the same roster). The Tavern
  lists and points to install only; deploying, tuning, and recruiting crews are cyberfleet
  concerns (Operator / Tuner / Crimp), out of scope here. General discovery lives in awesome-list.

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
