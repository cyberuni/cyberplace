Feature: SDD Operator — Production-Chain Dispatch

  # Scenarios trace dispatch top-to-bottom — load the bar → dispatch the
  # spec-producer → dispatch the impl side → the model invariants — per the
  # scenario-ordering convention in sdd:spec-governance.

  # ── governance loading without a CLI call ─────────────────────────────────

  Scenario: Spec-producers load the SDD governance skill for format rules
    Given sdd:spec-governance is a user-invocable:false skill in the sdd plugin
    When a plugin spec-producer needs the .feature format conventions
    Then it loads sdd:spec-governance via the harness
    And it does not call governance show

  Scenario: The loop runs without a governance-show call
    Given no governances/ directory exists for the SDD plugin
    When sdd-operator runs the full loop
    Then it resolves the producer and judge roles from the delegate definitions
    And it makes no governance show call

  # ── resolve & dispatch the spec-producer ──────────────────────────────────

  Scenario: Operator dispatches to the plugin that covers the domain
    Given the registry maps the "skill" domain to the aces plugin
    And aces declares "aces-scenario-writer" as its spec-producer
    When sdd-operator runs the design phase for the "skill" domain
    Then it invokes the aces-scenario-writer delegate
    And it does not invoke the sdd-scenario-writer default

  Scenario: Operator falls back to the default spec-producer when no plugin covers the domain
    Given no registered plugin covers the "parser" domain
    When sdd-operator runs the design phase for the "parser" domain
    Then it invokes the sdd-scenario-writer default delegate
    And the default spec-producer produces generic boolean Gherkin with no domain criteria

  Scenario: A participating plugin always provides its own spec-producer
    Given the "guide" domain is handled by the Quill plugin
    When sdd-operator runs the design phase for the "guide" domain
    Then it invokes the quill-writer delegate
    And SDD does not classify the domain as simple or complex

  Scenario: The spec-producer writes the spec.md body and the impl side cannot
    Given the operator dispatches the spec-producer for the "auth" domain
    When the spec-producer runs
    Then it may write the spec.md body and the .feature
    And it does not write the status, aligned, or produced-by frontmatter fields
    And neither the impl-producer nor the impl-judge may write spec.md or the .feature

  # ── dispatch the impl side; producers load actor governances ──────────────

  Scenario: Forward producers load the actor governances they embody
    Given the builder bar is codified as the builder actor governance
    When the impl-producer runs
    Then it loads the builder and architect actor governances
    And it shapes its output to meet those bars before the impl-judge runs

  Scenario: The impl-producer co-produces the verification with the implementation
    Given the "auth" .feature is frozen with five scenarios
    When the operator dispatches the impl-producer in deliver mode
    Then it writes the implementation and one functional test or eval per frozen scenario
    And the verification is anchored to the frozen scenarios, not free-authored from its own sense of done

  Scenario: The impl-judge runs the producer's verification rather than authoring it
    Given the impl-producer has written one functional test or eval per frozen scenario
    When the impl-judge runs at the impl gate
    Then it runs the producer's verification and reports pass or fail per scenario
    And it does not author the functional tests or evals
    And it adds its own orthogonal structural and scope reading

  Scenario: Operator dispatches to the plugin impl-judge that covers the domain
    Given the registry maps the "guide" domain to the quill plugin
    And quill declares "quill-implementer" as its impl-judge
    When sdd-operator runs the implementation phase for the "guide" domain
    Then it invokes the quill-implementer delegate
    And it does not invoke the sdd-implementer default

  Scenario: Operator falls back to the default impl-judge when no plugin covers the domain
    Given no registered plugin covers the "parser" domain
    When sdd-operator runs the implementation phase for the "parser" domain
    Then it invokes the sdd-implementer default delegate
    And the default reports IMPLEMENTATION_PASS true only when every scenario has a passing test

  Scenario: Product and test separation stays inside the impl-producer
    Given a security domain wants separate product-code and test-code writers
    When the operator dispatches the impl-producer
    Then the split is handled inside the plugin's impl-producer
    And the operator does not learn whether the split happened

  # ── model invariants: the whole chain, producer ≠ judge ───────────────────

  Scenario: The operator resolves every production-chain role
    Given the "skill" domain is fully handled by the ACES plugin
    When sdd-operator runs the full loop
    Then it resolves spec-producer, plan-producer, impl-producer, spec-judge, and impl-judge to ACES agents

  Scenario: ACES evals are authored by the impl-producer and run by the impl-judge
    Given the "skill" domain uses ACES
    When the operator resolves who authors the evals
    Then the evals are authored by the impl-producer that writes the agent config
    And aces-implementer as the impl-judge runs the evals rather than authoring them
    And independence holds because the evals are anchored to the frozen .feature and run by a separate runner

  Scenario: Degenerate roles fall back without a plugin agent
    Given the "guide" domain declares no impl-producer and a static spec-judge
    When sdd-operator runs the full loop
    Then impl-producing is done by the generic Builder with no agent
    And spec-judging runs as static criteria with no judge agent

  Scenario: A plugin author reads the interface from the operator and default delegates
    Given a plugin author wants to implement a new impl-judge delegate
    When they read the sdd-operator definition and the sdd-implementer default
    Then the input and output contract is fully specified without a separate governance file
