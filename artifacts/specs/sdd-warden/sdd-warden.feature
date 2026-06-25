Feature: SDD Warden — the Formation-loop delegate agent

  # The Warden is the AGENT that runs the Formation loop: a subagent
  # parallel to the Operator, with no user channel, running stations not
  # status, emitting proposals the Council ratifies through the relay. These
  # scenarios assert the DELEGATE's contract — the agent's operating rules —
  # distinct from the loop model itself (specced in sdd-formation-loop).

  # ── relay seam: no user channel, the Council ratifies ─────────────────

  Scenario: the Warden returns findings to the relay, not the user
    Given the Warden has accumulated a finding set
    When it surfaces those findings
    Then it returns them to the relay
    And it does not address the user directly

  Scenario: a structural-change proposal is held for the Council
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

  Scenario: the Warden runs the render-spec-graph station in-session
    Given the rendered graph is stale versus the blocked-by edges
    When the Warden acts on it
    Then it runs the render-spec-graph station in-session

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

  # ── frozen-contract guard ─────────────────────────────────────────────

  Scenario: splitting a frozen feature requires a ratified re-open
    Given a spec whose feature is frozen
    When the Warden would split that spec
    Then it shards the frozen contract only with a Council-ratified freeze re-open carried by the relay

  Scenario: deduping a frozen feature requires a ratified re-open
    Given a spec whose feature is frozen
    When the Warden would dedupe that spec
    Then it merges the frozen contract only with a Council-ratified freeze re-open carried by the relay

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
