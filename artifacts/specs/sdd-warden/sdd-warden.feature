Feature: SDD Warden — the Formation-loop delegate agent

  # The Warden is the AGENT that runs the Formation loop: a subagent
  # parallel to the Operator, with no user channel, making its own
  # self-clear-vs-escalate verdict per act — it self-clears reversible,
  # derivable acts (leaving a provisional agent-attributed marker) and
  # escalates destructive, contested, or breaking acts for the Council to
  # ratify through the relay. These scenarios assert the DELEGATE's contract
  # — the agent's operating rules — distinct from the loop model itself
  # (specced in sdd-formation-loop).

  # ── per-act self-clear-vs-escalate verdict (rubric-subject) ───────────

  Scenario: the Warden makes a self-clear-vs-escalate verdict per act
    Given the Warden is acting on a structural act
    When it assesses that act's risk
    Then it renders its own self-clear-vs-escalate verdict for that act

  Scenario: a coverage-preserving fix self-clears with a provisional marker
    Given a coverage-preserving refactor or consistency fix
    When the Warden acts on it
    Then it self-clears the act in-session
    And it leaves a provisional agent-attributed marker in the async review queue
    And that marker is never final until the Council ratifies the trail

  Scenario: a destructive dedupe escalates to the Council
    Given a dedupe that deprecates a spec
    When the Warden acts on it
    Then it escalates the act to the Council through the relay

  Scenario: a contested reconcile escalates to the Council
    Given a reconcile that picks the winning claim
    When the Warden acts on it
    Then it escalates the act to the Council through the relay

  Scenario: a breaking change escalates to the Council
    Given a change that is breaking under the contract-impact gradient
    When the Warden acts on it
    Then it escalates the act to the Council through the relay

  # ── relay seam: no user channel; self-clear vs escalate ───────────────

  Scenario: the Warden returns findings to the relay, not the user
    Given the Warden has accumulated a finding set
    When it surfaces those findings
    Then it returns them to the relay
    And it does not address the user directly

  Scenario: an escalated structural-change proposal is held for the Council
    Given the Warden has drafted a dedupe proposal
    When it emits that proposal
    Then ratify-or-reject is left to the Council through the relay
    And the Warden applies no merge of its own

  # ── continuous and non-blocking ───────────────────────────────────────

  Scenario: the Warden runs between missions
    Given a mission is in progress
    When the Warden runs
    Then it does not block that mission

  Scenario: findings accumulate and surface episodically
    Given the Warden has run across the corpus
    When it has findings to report
    Then it surfaces them episodically through the relay

  # ── corpus-wide, never per spec ───────────────────────────────────────

  Scenario: every run covers every spec in the corpus
    Given a corpus of many specs
    When the Warden runs
    Then it produces a finding set covering every spec in the corpus

  Scenario: a run scoped to one spec is not a Formation run
    Given a request to examine a single spec only
    When that request is evaluated
    Then the Warden does not treat it as a Formation run

  # ── stations, not status ──────────────────────────────────────────────

  Scenario: the Warden runs the split-spec station in-session
    Given a spec that trips the granularity heuristic
    When the Warden acts on it
    Then it runs the split-spec station in-session

  Scenario: the Warden self-clears the render-spec-graph re-render
    Given the rendered graph is stale versus the blocked-by edges
    When the Warden acts on it
    Then it runs the render-spec-graph station in-session
    And it self-clears the re-render as derived reversible output
    And it leaves a provisional agent-attributed marker
    And it does not escalate the re-render

  Scenario: the Warden never writes a spec status
    Given the Warden runs any station
    When it completes
    Then it writes no spec's status

  # ── proposals naming the artifacts; the Council ratifies ──────────────

  Scenario: overlap produces a dedupe proposal naming the specs
    Given two specs cover overlapping behavior
    When the Warden evaluates the overlap
    Then it produces a dedupe proposal naming the overlapping specs

  Scenario: a contradiction produces a reconciliation proposal naming the artifacts
    Given two governances contradict each other
    When the Warden evaluates the contradiction
    Then it produces a reconciliation proposal naming the contradicting artifacts

  Scenario: the Warden never silently merges or deletes a spec
    Given the Warden has identified overlap between two specs
    When it acts
    Then it merges, rewrites, or deletes no spec without the Council's confirmation

  Scenario: a dependency cycle is surfaced, not written away
    Given the blocked-by edges contain a cycle
    When the Warden checks the graph
    Then it surfaces the cycle
    And it writes no graph over the cycle

  # ── frozen-contract guard: keyed on the semver class, not on frozen ───

  Scenario: a non-breaking split of a frozen feature self-clears
    Given a spec whose feature is frozen
    And a split that preserves every scenario verbatim
    When the Warden would split that spec
    Then the split is non-breaking under the contract-impact gradient
    And it self-clears the split in-session
    And it leaves a provisional agent-attributed marker
    And it requires no Council-ratified freeze re-open

  Scenario: a breaking split of a frozen feature requires a ratified re-open
    Given a spec whose feature is frozen
    And a split that alters or drops scenario truth
    When the Warden would split that spec
    Then the split is breaking under the contract-impact gradient
    And it shards the frozen contract only with a Council-ratified freeze re-open carried by the relay

  Scenario: deduping a frozen feature escalates because it is destructive
    Given a spec whose feature is frozen
    When the Warden would dedupe that spec
    Then the dedupe is destructive
    And it escalates regardless of the contract-impact class
    And it merges the frozen contract only with a Council-ratified freeze re-open carried by the relay

  # ── altitude discipline: route out-of-loop requests away ──────────────

  Scenario: a build-or-deprecate request is routed to the Campaign loop
    Given a request to build or deprecate a feature
    When the Warden receives it
    Then it produces no build-or-deprecate decision
    And it routes the request to the Campaign loop

  Scenario: a process lesson is routed to the Doctrine loop
    Given a lesson about how the team should work
    When the Warden receives it
    Then it emits no governance or process edit
    And it routes the lesson to the Doctrine loop

  Scenario: a per-spec gate structural check is declined
    Given a request to run the per-spec gate structural check
    When the Warden receives it
    Then it declines to run as that per-gate check

  Scenario: out-of-loop requests yield no decision
    Given an out-of-loop request
    When the Warden routes it away
    Then it emits no out-of-loop decision
