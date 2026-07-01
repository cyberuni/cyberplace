Feature: Autonomy Governance — the risk-assessment rubric
  The rubric that determines, per decision at any escalation point, whether an agent
  config self-clears or escalates to a human. Each Then is a boolean assertion of the
  verdict the rubric produces for a decision.

  # ── Hard floor (checked first, invariant) ──

  Scenario: A data-egress decision escalates by the hard floor
    Given a decision moves sensitive data out of the environment
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the hard floor as the reason

  Scenario: An irreversible-publication decision escalates by the hard floor
    Given a decision performs an irreversible external publication
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the hard floor as the reason

  Scenario: A high computed confidence does not unlock the hard floor
    Given a data-egress decision whose five gradient dimensions all read low risk
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the hard floor as the reason

  Scenario: An irreversible publication escalates even when the gradient score is low risk
    Given an irreversible-publication decision whose gradient dimensions all read low risk
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the hard floor as the reason

  # ── Reversibility dimension ──

  Scenario: A cheap-to-undo decision reads low on reversibility
    Given a decision that edits draft prose with a cheap revert and no external effect
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A git-tracked file in a shipped package with a cheap revert and no publish act reads low on reversibility
    Given a decision that edits a git-tracked source file that lives in a publishable or installable directory
    And the change has a cheap revert and performs no actual publish or release act and has no external side effect
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A destructive decision reads high on reversibility and escalates
    Given a decision that is destructive and carries an external side effect
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names reversibility as the dominant dimension

  # ── Blast radius dimension ──

  Scenario: A decision with no user-facing dependents reads low on blast radius
    Given a decision with no blocked-by dependents and no breaking change and no publish or release act
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A git-tracked file in a shipped package with a cheap revert and no dependents reads low on blast radius
    Given a decision that edits a git-tracked source file that lives in a publishable or installable directory
    And the file has a cheap revert and no breaking change and no blocked-by dependents and no publish or release act is performed
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: An actual publish or release act reads high on blast radius and escalates
    Given a decision that performs an actual publish or release act such as npm publish
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names blast radius as the dominant dimension

  Scenario: A decision with many blocked-by dependents reads high on blast radius and escalates
    Given a decision that has many blocked-by dependents and performs no publish or release act and introduces no breaking change
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names blast radius as the dominant dimension

  Scenario: Blast radius is measured by user-facing impact, not artifact count and not surface location
    Given a decision that edits many artifacts but has no blocked-by dependents and no breaking change and performs no publish or release act
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  # ── Contract impact dimension ──

  Scenario: An additive contract change reads low and self-clears
    Given a decision that adds a new scenario without altering an existing scenario's truth
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A coverage-preserving split of a frozen contract self-clears
    Given a split of a frozen contract that preserves every existing scenario verbatim and reads low on every other dimension
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A split that drops or alters a frozen contract's scenario truth escalates
    Given a split of a frozen contract that alters or drops an existing scenario's truth
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names contract impact as the dominant dimension

  Scenario: A breaking contract change reads high and escalates
    Given a decision that alters or removes an established behavior
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names contract impact as the dominant dimension

  Scenario: A breaking change is weighted higher when many dependents rely on it
    Given a breaking contract change to a behavior with many blocked-by dependents
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names contract impact as the dominant dimension

  # ── Decision novelty dimension ──

  Scenario: An already-ratified decision reads low on novelty
    Given a decision the human has already ratified
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A new contestable choice reads high on novelty and escalates
    Given a decision that is a new contestable choice the human has not seen
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names decision novelty as the dominant dimension

  # ── Confidence dimension ──

  Scenario: A clean judge pass reads low on confidence
    Given a decision backed by converging evidence and a clean judge pass with no open markers
    And every other dimension reads low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: A marginal verdict with unresolved markers reads high on confidence and escalates
    Given a decision with a marginal verdict and unresolved open markers
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names confidence as the dominant dimension

  # ── Aggregate verdict ──

  Scenario: All-low dimensions self-clear
    Given a decision whose five gradient dimensions all read low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: Any single high-risk dimension forces escalate
    Given a decision with four dimensions low and exactly one dimension high risk
    When the rubric assesses the decision
    Then the verdict is escalate

  Scenario: A high user-facing blast radius dominates the aggregate even when every other dimension reads low
    Given a decision with high user-facing blast radius and every other dimension low risk
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names blast radius as the dominant dimension

  Scenario: The escalate verdict names the dominant dimension
    Given a decision with exactly one high-risk dimension
    When the rubric assesses the decision
    Then the verdict names that dimension as the dominant reason

  # ── Survey buckets ──

  Scenario: Bucket A — a gate self-clears when low-risk
    Given an impl-gate decision whose reversibility, blast radius, contract impact, novelty, and confidence all read low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: Bucket B — a freeze re-open self-clears when the change is additive
    Given a freeze re-open whose change is additive and whose other dimensions read low risk
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: Bucket B — a low-risk change-request accept self-clears
    Given a change-request accept whose change is non-breaking and low user-facing impact
    When the rubric assesses the decision
    Then the verdict is self-clear

  Scenario: Bucket C — an observation-accept intent decision always escalates
    Given an observation accept-or-decline decision whose gradient dimensions all read low risk
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the decision as an intent decision

  Scenario: Bucket C — a domain-disambiguation intent decision always escalates
    Given a domain-disambiguation decision whose gradient dimensions all read low risk
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the decision as an intent decision

  Scenario: Bucket D — forge-loop redaction always escalates by invariant
    Given a forge-loop redaction / data-egress decision whose gradient dimensions all read low risk
    When the rubric assesses the decision
    Then the verdict is escalate
    And the verdict names the hard floor as the reason

  # ── Consumption model ──

  Scenario: The runtime self-clear-vs-escalate verdict is made by the most capable conductor agent
    Given a runtime decision at an escalation point assessed by the most capable conductor agent
    When the verdict is produced
    Then the verdict is produced by the conductor
    And the verdict is not produced by a non-conductor delegate

  Scenario: The doctrine-loop Scanner always escalates and makes no self-clear verdict
    Given the doctrine-loop Scanner reaches an intent-class process-change decision whose gradient dimensions all read low risk
    When the Scanner handles the decision
    Then the verdict is escalate
    And the Scanner does not produce a self-clear verdict

  Scenario: The formation-loop Warden self-clears a coverage-preserving derivable structural act
    Given the formation-loop Warden as a conductor applies the rubric to re-rendering the derived spec graph whose change preserves every scenario and reads low user-facing blast radius
    When the Warden assesses the act
    Then the verdict is self-clear
    And the act lands a provisional agent-attributed marker in the async human review queue

  Scenario: The formation-loop Warden escalates a destructive or contested structural act
    Given the formation-loop Warden as a conductor applies the rubric to deprecating a spec in a dedupe
    When the Warden assesses the act
    Then the verdict is escalate

  Scenario: A self-cleared verdict is provisional and lands in the async human review queue
    Given the conductor produces a self-clear verdict for a decision
    When the verdict is recorded
    Then the verdict is agent-attributed
    And the decision lands in the async human review queue
    And the decision is not final

  Scenario: An eval of a fully-compliant config raises no flags
    Given an agent config is evaluated against the rubric at config-design time
    And every escalation point's posture matches the rubric verdict
    When the evaluation runs
    Then the evaluation raises no flags

  Scenario: An eval flags an escalation point whose posture mismatches the rubric verdict
    Given an agent config is evaluated against the rubric at config-design time
    And an escalation point whose posture mismatches the rubric verdict
    When the evaluation checks that escalation point
    Then the evaluation flags the escalation point

  Scenario: The rubric is not loaded inline by a runtime actor per decision
    Given a runtime actor taking a decision whose posture is already baked into its config
    When the actor takes the decision
    Then the actor does not load the rubric for that decision

  # ── Relationship and portability ──

  Scenario: The rubric supersets the leash without contradicting gate legality
    Given a decision at an SDD gate already covered by the leash
    When the rubric assesses the decision
    Then the verdict does not assert which frontmatter state tuples are legal

  Scenario: The contract names ACES as the intended future home
    Given the autonomy-governance contract
    When the contract is inspected for its future home
    Then the contract names ACES as the intended future home
    And the contract stays plugin-portable
