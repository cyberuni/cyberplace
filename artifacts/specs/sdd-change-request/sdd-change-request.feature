Feature: SDD change request — the async change-needed flag for any target

  # A CR is a first-class object in a SEPARATE, PLUGGABLE STORE — not the
  # combat log. Any requester writes it through the ADAPTOR; on accept it
  # routes by TARGET class (local spec, corpus item, sdd-itself).

  # ── creation: any requester, through the adaptor ──────────────────────

  Scenario: a doctrine recommendation becomes a corpus-targeted CR
    Given the doctrine loop recommends revising a governance
    When it files a change request through the adaptor
    Then an open change request targeting that corpus item exists in the store

  Scenario: a structure finding becomes a corpus-targeted CR
    Given the structure loop finds two specs that should be deduped
    When it files a change request through the adaptor
    Then an open change request targeting the corpus item exists in the store

  Scenario: a harness finding becomes an sdd-itself CR
    Given the harness loop finds that SDD itself should change
    When it files a change request through the adaptor
    Then an open change request whose target class is sdd-itself exists in the store

  Scenario: an operator observation becomes a CR
    Given an operator flags something out of band during a mission
    When it files a change request through the adaptor
    Then an open change request created by the operator exists in the store

  Scenario: a judge raises a CR
    Given a judge surfaces a change that is needed
    When it files a change request through the adaptor
    Then an open change request created by the judge exists in the store

  Scenario: a requester writes through the adaptor and never to a backend directly
    Given a requester files a change request
    When the request is stored
    Then the write goes through the adaptor and not to a backend directly

  # ── schema and validity ───────────────────────────────────────────────

  Scenario: a new change request starts open
    Given a requester creates a change request
    When its status is read
    Then the status is open

  Scenario: a why may cite a combat-log correction
    Given a requester references a combat-log correction in the why
    When the change request is stored
    Then the why cites the correction without copying the mission record

  # ── accept dispatch: route by target class ────────────────────────────

  Scenario: accepting a local-spec CR flips the target spec to draft
    Given an open change request targeting a local spec
    When a maintainer accepts it
    Then the targeted spec is flipped to draft and routed to the revise-spec station

  Scenario: accepting a corpus-item CR changes the named corpus artifact
    Given an open change request targeting a named governance
    When a maintainer accepts it
    Then the named governance is the thing changed

  Scenario: accepting an sdd-itself CR files on the upstream tracker
    Given an open change request whose target class is sdd-itself
    When a maintainer accepts it
    Then a change request is filed on the upstream SDD tracker through the adaptor

  # ── terminal: completion ──────────────────────────────────────────────

  Scenario: an accepted change request reaches done when the change is carried out
    Given an accepted change request
    When the change is carried out
    Then the change request status is done

  Scenario: a change request cannot skip from open to done
    Given an open change request
    When a transition straight to done is attempted
    Then the transition is rejected and the change request stays open

  Scenario: a done change request cannot transition again
    Given a change request that is done
    When a further transition is attempted
    Then the transition is rejected and the change request stays done

  # ── altitude: negative invariants ─────────────────────────────────────

  Scenario: creating a corpus CR writes no mission combat log
    Given a requester creates a corpus-targeted change request
    When the store is read
    Then no mission combat log entry is written for the change request

  Scenario: a change request does not record producer or judge provenance
    Given a change request that cites a combat-log correction
    When the change request record is read
    Then it does not record who produced or judged any artifact

  Scenario: a change request status is independent of the target spec lifecycle
    Given a local-spec change request that reaches done
    When the target spec lifecycle status is read
    Then it is unchanged by the change request reaching done
