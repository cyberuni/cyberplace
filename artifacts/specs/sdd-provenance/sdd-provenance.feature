Feature: Production provenance

  # ── spec-folder shape ─────────────────────────────────────────────────

  Scenario: the spec folder contains combat-log.jsonl beside spec.md
    Given a spec domain has been initialised
    When the spec folder is inspected
    Then the folder contains spec.md
    And the folder contains the domain .feature file
    And the folder contains combat-log.jsonl as a sibling of spec.md

  Scenario: current-state fields remain in spec.md frontmatter
    Given the operator has dispatched a production-chain role and recorded a correction
    When spec.md is inspected
    Then status appears in the spec.md frontmatter
    And approval appears in the spec.md frontmatter
    And aligned appears in the spec.md frontmatter
    And produced-by appears in the spec.md frontmatter
    And the spec.md frontmatter contains no log ledger entries

  Scenario: the sibling combat-log file is never frozen
    Given a spec has been approved and its spec.md and .feature are frozen
    When the operator appends a dispatch report during delivery-phase work
    Then the report entry is appended to the sibling combat-log file
    And spec.md is not modified
    And the .feature is not modified

  Scenario: the sibling combat-log file is never gated
    Given a spec's sibling combat-log file carries new entries
    When validate-spec runs the spec gate
    Then the gate does not require approval for the combat-log file
    And the gate does not freeze the combat-log file

  Scenario: freeze covers spec.md and .feature only
    Given a spec transitions to approved
    When the freeze is applied
    Then spec.md is frozen
    And the .feature is frozen
    And the sibling combat-log file is not frozen

  # ── reader split by path ──────────────────────────────────────────────

  Scenario: the sdd gateway reads status from spec.md frontmatter only
    Given a spec folder contains spec.md and a sibling combat-log file
    When the sdd gateway performs a status scan
    Then it reads the status field from spec.md frontmatter
    And it does not open the sibling combat-log file

  Scenario: the doctrine-loop Scanner reads the sibling combat-log file
    Given a spec folder contains spec.md and a sibling combat-log file
    When the doctrine-loop Scanner processes the spec
    Then it reads entries from the sibling combat-log file
    And it does not read the spec.md frontmatter for log data

  # ── gate appends to sibling while judging the contract ───────────────

  Scenario: the spec gate appends its entry to the sibling ledger while judging the contract
    Given the spec gate runs validate-spec against spec.md and the .feature
    When the gate finishes its verdict
    Then the gate appends its report entry to the sibling combat-log file
    And the judged files are spec.md and the .feature
    And the written-to file for the log entry is the sibling combat-log file

  # ── recording provenance ──────────────────────────────────────────────

  Scenario: the producer is recorded on every artifact
    Given the operator dispatches the spec-producer for a domain
    When the producer writes the .feature
    Then produced-by.spec-producer is set to the plugin-qualified agent name in spec.md frontmatter
    And it is recorded even though no disambiguation occurred

  Scenario: provenance and approval together give full attribution
    Given produced-by records the producer of an artifact in spec.md frontmatter
    And approval records the judge of its gate in spec.md frontmatter
    When the artifact is traced
    Then both the producer and the judge are known

  # ── resume and availability ───────────────────────────────────────────

  Scenario: resume reuses the recorded producer when its plugin is installed
    Given produced-by.spec-producer is "aced:aced-scenario-writer" in spec.md frontmatter
    And the aced plugin is installed
    When the operator resumes work on the spec
    Then it reuses aced:aced-scenario-writer without re-asking

  Scenario: an unavailable recorded producer does not block
    Given produced-by.spec-producer names a plugin that is no longer installed
    When the operator resumes work on the spec
    Then it re-resolves the producer from the registry
    And the historical produced-by value is preserved, annotated unavailable
    And work is not blocked

  # ── defaults and conflicts ────────────────────────────────────────────

  Scenario: a degenerate role records the SDD default
    Given no plugin covers the spec's domain
    When the operator dispatches the role
    Then it uses the SDD default
    And produced-by records the sdd-prefixed default agent in spec.md frontmatter

  Scenario: an unresolvable producer hard-fails with no sentinel
    Given no producer can be resolved for the role, not even an SDD default
    When the operator dispatches the role
    Then it hard-fails with a blocker
    And it records no producer
    And it records no sentinel value

  Scenario: a first-time conflict asks once, then is decisive
    Given two plugins claim the spec's domain
    And produced-by has no entry for the role
    When the operator dispatches the role
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

  Scenario: validate-spec blocks a role with no resolvable producer
    Given a role has no resolvable producer, not even an SDD default
    When validate-spec runs
    Then it flags the unresolvable producer
    And it fails the spec

  Scenario: a legacy domain-plugin map is migrated into produced-by
    Given a spec carries the old domain-plugin map
    When the operator next dispatches for that spec
    Then the choice is rewritten into produced-by
    And the domain-plugin map is dropped

  Scenario: the operator writes produced-by; producers and judges do not
    Given a producer agent finishes its work
    When provenance is recorded
    Then produced-by appears in spec.md frontmatter
    And the producer's .feature carries no produced-by entry
    And the spec body carries no produced-by entry

  # ── log ledger: dispatch reports ──────────────────────────────────────

  Scenario: a per-subagent report entry is appended to the sibling ledger per dispatch
    Given the operator dispatches a production-chain role
    When the dispatched agent finishes
    Then a report entry is appended to the sibling combat-log file
    And the entry names the role and the plugin-qualified agent
    And the entry records the dispatch outcome

  Scenario: each dispatch appends a new entry rather than overwriting
    Given the sibling combat-log file already carries a report entry from an earlier dispatch
    When the operator dispatches another role
    Then a new report entry is appended with the next seq
    And the earlier report entry is unchanged

  # ── log ledger: corrections with cause ────────────────────────────────

  Scenario: a gate rejection is recorded in both faces without duplication
    Given a gate rejects the spec
    When the operator records the outcome
    Then a correction entry with a matchable cause is appended to the sibling combat-log file
    And the standing verdict is recorded in approval in spec.md frontmatter
    And the correction entry is not duplicated into approval

  Scenario: a gate rejection followed by a fix preserves the correction
    Given a gate rejected the spec and a correction entry was appended to the sibling ledger
    When the producer fixes the spec and the gate later approves
    Then approval in spec.md frontmatter records the approve verdict
    And the earlier correction entry remains in the sibling combat-log file

  Scenario: a producer-judge iteration is logged with a cause
    Given a producer and judge iterate on an artifact
    When the iteration completes
    Then a correction entry with correction-kind judge-iteration is appended to the sibling combat-log file
    And the entry carries a matchable cause

  Scenario: a Council kick-back is logged with a cause
    Given the Council kicks a spec back
    When the operator records the outcome
    Then a correction entry with correction-kind council-kickback is appended to the sibling combat-log file
    And the entry carries a matchable cause

  # ── log ledger: mission reconstruction ───────────────────────────────

  Scenario: the mission is reconstructed from the sibling ledger alone
    Given a spec's sibling combat-log file carries its report and correction entries in seq order
    And no session transcript is available
    When a reader replays the sibling ledger
    Then the ordered sequence of dispatches and corrections is recovered from the ledger alone

  Scenario: a killed spec's correction trail survives for post-mortem
    Given a spec reached a terminal killed state
    And its sibling combat-log file carried correction entries with causes before the kill
    When a post-mortem reads the killed spec's sibling ledger
    Then the correction-with-cause entries are still present and readable
    And the deal-breaker that drove the kill is recoverable from the ledger

  # ── log ledger: recurrence detection ──────────────────────────────────

  Scenario: the same cause is matchable across two specs' sibling ledgers
    Given one spec's sibling combat-log carries a correction with cause coverage-gap
    And another spec's sibling combat-log carries a correction with cause coverage-gap
    When corrections are grouped by cause across the two ledgers
    Then both corrections fall in the same coverage-gap group

  # ── log ledger: strategy slot ─────────────────────────────────────────

  Scenario: a strategy entry occupies a slot in the sibling ledger
    Given the doctrine-loop Scanner drafts strategy from detected patterns
    When the Scanner records the strategy
    Then a strategy entry is appended to the sibling combat-log file
    And the entry carries the corrections that drove it as evidence

  Scenario: the operator does not write strategy entries
    Given the operator records dispatch and correction provenance
    When it writes to the sibling combat-log file
    Then it appends only report and correction entries
    And it appends no strategy entry

  # ── log ledger: ownership and validation ──────────────────────────────

  Scenario: the operator writes the sibling ledger; producers and judges do not
    Given a producer and a judge finish their work
    When the sibling combat-log file is written
    Then only the operator appends entries to the sibling combat-log file
    And the producer's .feature carries no log entry
    And neither the producer nor the judge writes to the sibling combat-log file

  Scenario: validate-spec blocks a correction entry with an off-enum cause
    Given a sibling combat-log file carries a correction entry whose cause is off-enum
    When validate-spec runs
    Then it flags the malformed correction cause
    And it fails the spec

  Scenario: validate-spec passes a well-formed sibling ledger
    Given a sibling combat-log file carries report and correction entries with valid causes
    When validate-spec runs
    Then it does not flag the sibling ledger
    And it does not fail the spec on the ledger
