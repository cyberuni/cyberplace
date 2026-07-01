Feature: Agent Governance Composition

  # Scenarios trace build-time embedding of contract governance into worker
  # agent configuration, the gateway exclusion, and loud failure on missing
  # references. Reference/criteria governance via skills is out of scope here.

  # -- embedding ----------------------------------------------------------

  Scenario: Build embeds a declared governance inline
    Given a worker agent declares requires_governances with one entry
    When universal-plugin build runs
    Then the built output contains that governance content inline
    And the built output has no requires_governances field

  Scenario: Multiple governances embed in declaration order
    Given a worker agent declares two governances in a given order
    When universal-plugin build runs
    Then the built output inlines the two governances in that order

  Scenario: A cross-plugin reference resolves by plugin and name
    Given a worker agent declares "sdd/gate-validation-governance"
    When universal-plugin build runs
    Then it resolves the governance from the sdd plugin
    And inlines its content into the built output

  Scenario: An intra-plugin reference resolves by bare name
    Given a worker agent declares "skill-spec-schema" with no plugin prefix
    When universal-plugin build runs
    Then it resolves the governance from the current plugin

  # -- gateway exclusion --------------------------------------------------

  Scenario: A gateway declares no governance
    Given a gateway skill that only classifies and routes
    When its source is authored
    Then it declares no requires_governances

  Scenario: Build does not embed governance for routed targets
    Given a gateway routes work to a downstream worker skill
    When universal-plugin build runs on the gateway
    Then the gateway output contains no governance for the downstream skill

  # -- failure ------------------------------------------------------------

  Scenario: A missing plugin fails the build
    Given a worker agent declares a governance from an uninstalled plugin
    When universal-plugin build runs
    Then the build fails with a plugin-not-installed error

  Scenario: A missing governance name fails the build
    Given a worker agent declares a governance name that does not exist
    When universal-plugin build runs
    Then the build fails with a governance-not-found error
