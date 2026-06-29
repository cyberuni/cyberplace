Feature: registry — register ACES as the agent-config SDD plugin
  Unit suite for the init-aces skill: upsert the ACES entry in .agents/universal-plugin.json so the
  conductor resolves ACES for the agent-config artifact-types. Idempotent, fail-closed. Cross-
  capability e2e scenarios live in ../acceptance/.

  # ---- Triggering ----

  Scenario: a request to register ACES triggers init-aces
    Given the user asks to register or initialize ACES as the SDD plugin
    When ACES routes the request
    Then init-aces handles it

  Scenario: a request to run evals defers to run
    Given the user asks to run the evals for a configuration
    When ACES routes the request
    Then init-aces does not handle it and run does

  Scenario: a request to change the project spec defers to start-mission
    Given the user asks to add or revise part of the project spec
    When ACES routes the request
    Then init-aces does not handle it and start-mission does

  # ---- Registering ----

  Scenario: an absent entry is appended as the canonical squad
    Given a registry with no aces entry
    When init-aces registers ACES
    Then it appends the canonical aces squad serving skill, subagent, command, and agents-section

  Scenario: a missing registry file is created
    Given no registry file exists
    When init-aces registers ACES
    Then it creates the registry file with the aces entry

  Scenario: other plugins' entries are left untouched
    Given a registry holding entries for other plugins
    When init-aces registers ACES
    Then it leaves the other entries unchanged

  # ---- Migration ----

  Scenario: a legacy-shape entry is rewritten to squads
    Given an aces entry in the legacy domains shape
    When init-aces registers ACES
    Then it rewrites the entry to the squads shape

  Scenario: a stale version stamp is refreshed
    Given an aces squads entry stamped with a different version
    When init-aces registers ACES
    Then it rewrites the entry with the current ACES version

  Scenario: an up-to-date entry is left unchanged
    Given an aces squads entry already stamped with the current version
    When init-aces registers ACES
    Then it leaves the entry unchanged

  # ---- Failing closed ----

  Scenario: a corrupt registry stops without overwriting
    Given a registry file containing malformed JSON
    When init-aces registers ACES
    Then it stops with an error and leaves the file untouched

  Scenario: a squad missing its governances block is rejected
    Given a payload whose squad has no governances block
    When init-aces validates the payload
    Then it fails with an error and writes nothing

  # ---- Reporting ----

  Scenario: a successful registration confirms the entry
    Given ACES has been registered
    When init-aces reports
    Then it confirms the entry, its version, and the served artifact-types
