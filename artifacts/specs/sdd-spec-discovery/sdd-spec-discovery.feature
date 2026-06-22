Feature: Locate specs by shape, not location

  # ── discovery ──────────────────────────────────────────────────────────

  Scenario: a spec.md with a lifecycle status is discovered
    Given a folder containing a spec.md whose status is in the lifecycle enum
    When the agent discovers specs
    Then that folder is in the discovered set

  Scenario: a spec.md without a lifecycle status is excluded
    Given a folder containing a spec.md with no lifecycle status frontmatter
    When the agent discovers specs
    Then that folder is not in the discovered set

  Scenario: an untracked spec.md is not discovered
    Given a spec.md that is not tracked by git
    When the agent discovers specs
    Then that file is not in the discovered set

  Scenario: discovery is not bound to a fixed specs root
    Given two specs with lifecycle status under different parent directories
    When the agent discovers specs
    Then both specs are in the discovered set

  # ── resolution ─────────────────────────────────────────────────────────

  Scenario: a domain name resolves to a flat spec folder
    Given a discovered spec at folder slug "sdd-orchestrator"
    When the agent resolves the domain "sdd-orchestrator"
    Then it returns the spec folder "sdd-orchestrator"

  Scenario: a domain name resolves to a nested spec folder
    Given a discovered spec at folder slug "sdd/spec-digest"
    When the agent resolves the domain "spec-digest"
    Then it returns the spec folder "sdd/spec-digest"

  Scenario: a full-slug domain name resolves to its spec folder
    Given a discovered spec at folder slug "sdd/spec-digest"
    When the agent resolves the domain "sdd/spec-digest"
    Then it returns the spec folder "sdd/spec-digest"

  Scenario: resolution returns the spec folder, not the implementation folder
    Given a domain whose spec folder differs from its implementation folder
    When the agent resolves the domain
    Then it returns the folder containing spec.md

  Scenario: an ambiguous domain name is disambiguated with the user
    Given a domain name that matches more than one discovered spec folder
    When the agent resolves the domain
    Then it asks the user which spec folder is meant
    And it does not pick one without confirmation

  # ── no enumeration ─────────────────────────────────────────────────────

  Scenario: discovery reads no registry or index of spec paths
    Given a repo with discovered specs
    When the agent discovers specs
    Then the discovered set is derived from spec.md frontmatter only
    And no enumerated list of spec paths is consulted
