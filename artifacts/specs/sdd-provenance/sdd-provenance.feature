Feature: Production provenance

  # ── recording provenance ──────────────────────────────────────────────

  Scenario: the producer is recorded on every artifact
    Given the orchestrator dispatches the spec-producer for a domain
    When the producer writes the .feature
    Then produced-by.spec-producer is set to the plugin-qualified agent name
    And it is recorded even though no disambiguation occurred

  Scenario: provenance and approval together give full attribution
    Given produced-by records the producer of an artifact
    And approval records the judge of its gate
    When the artifact is traced
    Then both the producer and the judge are known

  # ── resume and availability ───────────────────────────────────────────

  Scenario: resume reuses the recorded producer when its plugin is installed
    Given produced-by.spec-producer is "aces:aces-scenario-writer"
    And the aces plugin is installed
    When the orchestrator resumes work on the spec
    Then it reuses aces:aces-scenario-writer without re-asking

  Scenario: an unavailable recorded producer does not block
    Given produced-by.spec-producer names a plugin that is no longer installed
    When the orchestrator resumes work on the spec
    Then it re-resolves the producer from the registry
    And the historical produced-by value is preserved, annotated unavailable
    And work is not blocked

  # ── defaults and conflicts ────────────────────────────────────────────

  Scenario: a degenerate role records the SDD default
    Given no plugin covers the spec's domain
    When the orchestrator dispatches the role
    Then it uses the SDD default
    And produced-by records the sdd-prefixed default agent

  Scenario: an unresolvable producer hard-fails with no sentinel
    Given no producer can be resolved for the role, not even an SDD default
    When the orchestrator dispatches the role
    Then it hard-fails with a blocker
    And it records no producer
    And it records no sentinel value

  Scenario: a first-time conflict asks once, then is decisive
    Given two plugins claim the spec's domain
    And produced-by has no entry for the role
    When the orchestrator dispatches the role
    Then it returns needs-input for the choice
    And the chosen producer is recorded in produced-by
    And a later resume does not re-ask

  # ── gate fail-closed ──────────────────────────────────────────────────

  Scenario: the spec gate fails closed on an unresolved contested producer
    Given two plugins claim the spec's domain
    And produced-by has no entry for the spec-producer role
    When validate-spec runs the spec gate
    Then it returns a blocker to resolve the domain producer via create-spec first
    And it does not ask the user to choose a producer
    And it does not write produced-by
    And it does not write the domain-plugin map

  Scenario: the impl gate fails closed on an unresolved contested producer
    Given two plugins claim the spec's domain
    And produced-by has no entry for the impl-producer role
    When validate-spec runs the impl gate
    Then it returns a blocker to resolve the domain producer via create-spec first
    And it does not ask the user to choose a producer
    And it does not write produced-by
    And it does not write the domain-plugin map

  Scenario: a gate still writes verdict frontmatter when it fails closed
    Given a gate fails closed on an unresolved contested producer
    When the gate records its outcome
    Then the only frontmatter it may write is status and the approval ratification
    And it writes no setup frontmatter

  # ── validation, migration, ownership ──────────────────────────────────

  Scenario: validate-spec flags but does not block an unavailable producer
    Given produced-by names a producer whose plugin is not installed
    When validate-spec runs
    Then it flags the unavailable producer
    And it does not fail the spec

  Scenario: validate-spec blocks a malformed produced-by entry
    Given produced-by has an entry that is not a well-formed plugin-qualified name
    When validate-spec runs
    Then it flags the malformed entry
    And it fails the spec
    And an unavailable-but-valid entry in the same spec does not fail the spec

  Scenario: a legacy domain-plugin map is migrated into produced-by
    Given a spec carries the old domain-plugin map
    When the orchestrator next dispatches for that spec
    Then the choice is rewritten into produced-by
    And the domain-plugin map is dropped

  Scenario: the orchestrator writes produced-by, not the producer
    Given a producer agent finishes its work
    When provenance is recorded
    Then produced-by appears in the spec frontmatter
    And the producer's .feature carries no produced-by entry
    And the spec body carries no produced-by entry

  # ── log ledger: dispatch reports ──────────────────────────────────────

  Scenario: a per-subagent report entry is appended per dispatch
    Given the orchestrator dispatches a production-chain role
    When the dispatched agent finishes
    Then a report entry is appended to the log
    And the entry names the role and the plugin-qualified agent
    And the entry records the dispatch outcome

  Scenario: each dispatch appends a new entry rather than overwriting
    Given the log already carries a report entry from an earlier dispatch
    When the orchestrator dispatches another role
    Then a new report entry is appended with the next seq
    And the earlier report entry is unchanged

  # ── log ledger: corrections with cause ────────────────────────────────

  Scenario: a gate rejection is recorded in both faces
    Given a gate rejects the spec
    When the orchestrator records the outcome
    Then a correction entry with a matchable cause is appended to the log
    And the standing verdict is recorded in approval
    And the correction entry is not duplicated into approval

  Scenario: a gate rejection followed by a fix preserves the correction
    Given a gate rejected the spec and a correction entry was logged
    When the producer fixes the spec and the gate later approves
    Then approval records the approve verdict
    And the earlier correction entry remains in the log

  Scenario: a producer-judge iteration is logged with a cause
    Given a producer and judge iterate on an artifact
    When the iteration completes
    Then a correction entry with correction-kind judge-iteration is appended
    And the entry carries a matchable cause

  Scenario: a Council kick-back is logged with a cause
    Given the Council kicks a spec back
    When the orchestrator records the outcome
    Then a correction entry with correction-kind council-kickback is appended
    And the entry carries a matchable cause

  # ── log ledger: mission reconstruction ───────────────────────────────

  Scenario: the mission is reconstructed from the log alone
    Given a spec's log carries its report and correction entries in seq order
    And no session transcript is available
    When a reader replays the log
    Then the ordered sequence of dispatches and corrections is recovered from the log alone

  Scenario: a killed spec's correction trail survives for post-mortem
    Given a spec reached a terminal killed state
    And its log carried correction entries with causes before the kill
    When a post-mortem reads the killed spec's log
    Then the correction-with-cause entries are still present and readable
    And the deal-breaker that drove the kill is recoverable from the log

  # ── log ledger: recurrence detection ──────────────────────────────────

  Scenario: the same cause is matchable across two specs' logs
    Given one spec's log carries a correction with cause coverage-gap
    And another spec's log carries a correction with cause coverage-gap
    When corrections are grouped by cause across the two logs
    Then both corrections fall in the same coverage-gap group

  # ── log ledger: strategy slot ─────────────────────────────────────────

  Scenario: a strategy entry occupies a log slot
    Given the doctrine-loop Scanner drafts strategy from detected patterns
    When the Scanner records the strategy
    Then a strategy entry is appended to the log
    And the entry carries the corrections that drove it as evidence

  Scenario: the orchestrator does not write strategy entries
    Given the orchestrator records dispatch and correction provenance
    When it writes to the log
    Then it appends only report and correction entries
    And it appends no strategy entry

  # ── log ledger: ownership and validation ──────────────────────────────

  Scenario: the orchestrator writes the log, producers and judges do not
    Given a producer and a judge finish their work
    When the log is written
    Then the log appears in the spec frontmatter
    And the producer's .feature carries no log entry
    And neither the producer nor the judge writes the log

  Scenario: validate-spec blocks a correction entry with an off-enum cause
    Given a log carries a correction entry whose cause is off-enum
    When validate-spec runs
    Then it flags the malformed correction cause
    And it fails the spec

  Scenario: validate-spec passes a well-formed log
    Given a log carries report and correction entries with valid causes
    When validate-spec runs
    Then it does not flag the log
    And it does not fail the spec on the log
