Feature: SDD Operator — Production-Chain Dispatch

  # Scenarios trace dispatch top-to-bottom — load the bar → dispatch the
  # spec-producer (inline warm or named-spawn) → dispatch the impl side
  # (producer warm/spawn, judge cold) → the model invariants — per the
  # scenario-ordering convention in sdd:spec-governance.

  # ── governance loading without a CLI call ─────────────────────────────────

  Scenario: Spec-producers load the SDD governance skill for format rules
    Given sdd:spec-governance is a user-invocable:false skill in the sdd plugin
    When a spec-producer needs the .feature format conventions
    Then it loads sdd:spec-governance via the harness
    And it does not call governance show

  Scenario: The loop runs without a governance-show call
    Given no governances/ directory exists for the SDD plugin
    When sdd-operator runs the full loop
    Then it dispatches the producer and judge roles from the delegate definitions
    And it makes no governance show call

  # ── dispatch the spec-producer: unnamed inline (warm) vs named spawn ───────

  Scenario: An unnamed spec-producer is authored inline in the operator warm context
    Given no plugin agent and no model-tuned agent is named for the spec-producer role
    When sdd-operator runs the design phase for the domain
    Then it loads the SDD-default spec-producer governance and authors the spec.md body and .feature inline
    And it does not spawn a default spec-producer agent
    And it records produced-by.spec-producer as sdd:sdd-operator

  Scenario: A named spec-producer agent is spawned at its own model
    Given the spec-producer slot names an agent in the registry or produced-by map
    And the named agent may be a plugin delegate or a model-tuned producer agent
    When sdd-operator runs the design phase for the domain
    Then it spawns that named agent
    And it does not author the spec-producer inline
    And it spawns the named agent even when no full domain plugin covers the domain

  Scenario: The spec-producer writes the spec.md body and the impl side cannot
    Given the operator dispatches the spec-producer for the domain
    When the spec-producer runs
    Then it writes the spec.md body and the .feature
    And it does not write the status, aligned, or produced-by frontmatter fields
    And neither the impl-producer nor the impl-judge writes spec.md or the .feature

  Scenario: A spec-producer that writes a control frontmatter field violates the write boundary
    Given the operator dispatches the spec-producer for the domain
    When the spec-producer writes the status or aligned or produced-by frontmatter field
    Then the operator treats the write as a write-boundary violation
    And the operator does not advance the dispatch on that producer output

  # ── dispatch the impl side: producer warm/spawn, judge always cold ─────────

  Scenario: Forward producers load the actor governances they embody
    Given the builder bar is codified as the builder actor governance
    When the impl-producer runs
    Then it loads the builder and architect actor governances
    And its output meets the builder and architect bars when the impl-judge runs

  Scenario: An unnamed impl-producer is authored inline in the operator warm context
    Given no plugin agent and no model-tuned agent is named for the impl-producer role
    When sdd-operator dispatches the impl-producer in deliver mode
    Then it loads the SDD-default impl-producer governance and builds the implementation and verification inline
    And it does not spawn any impl-producer agent
    And it records produced-by.impl-producer as sdd:sdd-operator

  Scenario: The impl-producer co-produces the verification with the implementation
    Given the domain .feature is frozen with five scenarios
    When the operator dispatches the impl-producer in deliver mode
    Then it writes the implementation and one functional test or eval per frozen scenario
    And the verification is anchored to the frozen scenarios, not free-authored from its own sense of done

  Scenario: The impl-judge is spawned as a cold agent and runs the producer's verification rather than authoring it
    Given the impl-producer has written one functional test or eval per frozen scenario
    When the operator dispatches the impl-judge at the impl gate
    Then it spawns the impl-judge as a cold agent
    And the cold impl-judge runs the producer's verification and reports pass or fail per scenario
    And it does not author the functional tests or evals
    And it adds its own orthogonal structural and scope reading

  Scenario: Operator spawns the plugin impl-judge cold when one covers the domain
    Given the registry maps the "guide" domain to the quill plugin
    And quill declares "quill-implementer" as its impl-judge
    When sdd-operator runs the implementation phase for the "guide" domain
    Then it spawns the quill-implementer delegate as a cold agent
    And it does not spawn the sdd-implementer default

  Scenario: The operator receives one impl-producer result regardless of any product-test split
    Given a security domain splits product-code and test-code writers within its impl-producer
    When the operator dispatches the impl-producer and reads its result
    Then the operator receives one impl-producer result naming the implementation and verification artifacts
    And the result does not report whether a product-test split occurred

  Scenario: A missing verification for a frozen scenario is reported failing by the cold impl-judge
    Given the domain .feature is frozen with five scenarios
    And the impl-producer wrote a verification for only four of the five frozen scenarios
    When the operator dispatches the cold impl-judge at the impl gate
    Then the impl-judge reports the uncovered frozen scenario as failing
    And the operator does not set the impl-layer aligned field to true

  # ── model invariants: the whole chain, producer ≠ judge by context ─────────

  Scenario: The operator resolves every production-chain role
    Given the "skill" domain is fully handled by the ACED plugin
    When sdd-operator runs the full loop
    Then it resolves spec-producer, plan-producer, impl-producer, spec-judge, and impl-judge to ACED agents

  Scenario: ACED evals are authored by the impl-producer and run by the cold impl-judge
    Given the "skill" domain uses ACED
    When the operator resolves who authors the evals
    Then the evals are authored by the impl-producer that writes the agent config
    And aced-implementer as the cold-spawned impl-judge runs the evals rather than authoring them
    And the evals aced-implementer runs are the same artifacts the impl-producer wrote, not new evals authored by the runner

  Scenario: A plugin author reads the interface from the operator and default delegates
    Given a plugin author wants to implement a new impl-judge delegate
    When they read the sdd-operator definition and the sdd-implementer default
    Then the input and output contract is fully specified without a separate governance file
