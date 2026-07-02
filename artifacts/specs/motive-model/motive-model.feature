Feature: The Motive Model — two outputs

  # ── Output 1: Human artifact — The Motive Model documentation ──────────────
  # Live at apps/website/src/content/docs/motive-model/

  Scenario: Documentation covers the premise
    Given the spec is approved
    When the human documentation artifact is complete
    Then it explains why production scarcity made titles the unit of a team
    And it explains why AI abundance dissolves that limit
    And it states that the new unit is the role — a motive a person holds — not the title

  Scenario: Documentation defines Actors and Delegates as distinct kinds
    Given the human documentation artifact is complete
    When a reader reads the Actors and Delegates section
    Then it defines an Actor as a human defined by motive who holds accountability
    And it defines a Delegate as an agent given intent through a delegation surface with no motive of its own
    And it explains the substrate-to-party transition for both sides
    And it explains that "delegate" is first a verb — the act an actor performs

  Scenario: Documentation covers the four actors with motives and objects
    Given the human documentation artifact is complete
    When a reader reads the four actors section
    Then it names Director (intend), Builder (generate), Architect (structure), Strategist (accumulate)
    And it gives each actor a motive, object, signature output, and boundary to its neighbor
    And it includes the generalization ladder (design / architecture / curation) with scope and mechanism
    And it explains the two-tier split: delivery actors vs Strategist as foundation actor

  Scenario: Documentation covers the two faces and the gate
    Given the human documentation artifact is complete
    When a reader reads the faces and gate section
    Then it explains that every actor's expertise points forward (produce) or backward (evaluate)
    And it explains that Gatekeeper is not a standalone actor — judging is a face, not a role
    And it explains producer ≠ judge as an echo of separation of duties plus a time-split of judgment
    And it describes the gate as a two-axis decision: verdict (accept/block) × change-request (none/yes with timing)
    And it names the two terminal corners: kill and the feedback edge

  Scenario: Documentation covers delegation surfaces and the bar
    Given the human documentation artifact is complete
    When a reader reads the delegation surfaces section
    Then it names the four surfaces: brief (Director), contract+exemplars (Builder), shape (Architect), corpus (Strategist)
    And it explains the bar as the criteria face of each surface — not a separate surface
    And it explains that surfaces are categories, not products — the team chooses the medium

  Scenario: Documentation covers variants with their status
    Given the human documentation artifact is complete
    When a reader reads the variants section
    Then it states the three membership gates: distinct motive, capacity differentiation, persistence
    And it lists Explorer (Builder, forward, confirmed) and QA (Builder, backward, confirmed)
    And it lists Scout (Director, forming) and Conductor (Architect, forming) with their forming rationale
    And it explains that Strategist has no variants — its acts share one cognitive profile
    And it explains that variants are lateral specializations, not advancements

  Scenario: Documentation covers positions vs roles
    Given the human documentation artifact is complete
    When a reader reads the positions section
    Then it shows a table mapping PM, Designer, Engineer, QA to their default actor and face
    And it shows which additional actors each position can now access with AI delegates
    And it explains QA as the backward-face Builder variant, not a phantom Gatekeeper

  Scenario: Documentation covers the compressed and decoupled scenarios
    Given the human documentation artifact is complete
    When a reader reads the scenarios section
    Then it walks through a decoupled open-source bug fix (contributor + maintainer)
    And it walks through a compressed solo developer shipping a feature with delegates
    And each scenario identifies which actor role is active at each step

  Scenario: Documentation covers recursion as overlapping sets
    Given the human documentation artifact is complete
    When a reader reads the recursion section
    Then it explains the framework applies to product, process, and toolchain as overlapping sets
    And it explains these are not stacked levels — process and toolchain interpenetrate
    And it explains that codification carries knowledge across the seams between sets

  Scenario: Documentation includes a glossary in dependency order
    Given the human documentation artifact is complete
    When a reader reads the glossary
    Then it defines all load-bearing terms: Role, Actor, Agent, Delegate, Motive, Object, Face, Variant, Membership gates, Codifiability, Agent configuration, Angle, Gate, Verdict, Change request, Decision rule, producer≠judge, Dependency order vs work order, Scheduling decision, Delegation surface, Bar, Tier, Recursion, Delegate fidelity
    And earlier terms ground later ones

  # ── Output 2: Machine artifact — Agent configuration system ─────────────────
  # Governance files consumable by AI agents via cyberplace governance show

  Scenario: Machine artifact enumerates the four actors as typed definitions
    Given the spec is approved
    When the machine artifact is generated
    Then it defines Director, Builder, Architect, Strategist each with motive, object, and signature output
    And each definition includes the delegation surface and bar criteria for that actor
    And each definition states the boundary distinguishing it from its neighbor actors

  Scenario: Machine artifact encodes the delegate-has-no-motive rule
    Given the machine artifact is generated
    When an agent reads the governance
    Then it knows delegates have no intrinsic motive — they are capacity, not a party
    And it knows accountability stays with the actor and never delegates
    And it knows agents become delegates only when given intent through a delegation surface

  Scenario: Machine artifact encodes gate decision rules
    Given the machine artifact is generated
    When an agent applies the gate rules to a change
    Then it can produce a two-axis verdict: verdict (accept/block) × change-request (none/yes with timing)
    And it can classify a block+none outcome as a kill, distinguishing Director kill from Architect/Builder kill
    And it knows block forces within-PR timing — deferred is only available under accept

  Scenario: Machine artifact encodes the deferred-branch scheduling rules
    Given the machine artifact is generated
    When an agent handles a deferred change request
    Then it assigns the deferred work to its owning actor (feature → Director, refactor → Architect)
    And it encodes the two scheduling options: defer new work (placeholder now) vs defer current work (prerequisite first)
    And it knows the determining factor is rework cost vs switch/blocking cost

  Scenario: Machine artifact encodes the three loops and when each fires
    Given the machine artifact is generated
    When an agent reads the loop definitions
    Then it knows the inner loop fires within a task (Builder produces, bar fires, Builder corrects)
    And it knows the product feedback edge fires across tasks on the same product (deferred work re-enters)
    And it knows the outer loop fires across products (Strategist distills durable lessons)
    And it knows the Strategist does not fire on the inner loop — to avoid premature codification

  Scenario: Machine artifact encodes the Strategist interface pattern
    Given the machine artifact is generated
    When an agent reads the Strategist interface definition
    Then it knows the Strategist-delegate watches continuously (flags candidates, drafts conventions)
    And it knows the human Strategist holds the accept/prune decision
    And it knows this detection-by-delegate / decision-by-human pattern is the template for every actor interface

  Scenario: Machine artifact encodes producer ≠ judge per artifact
    Given the machine artifact is generated
    When an agent applies the producer≠judge rule
    Then it knows an instance that produced an artifact is not its independent judge
    And it knows this is a time-split: general criteria authored ahead of time via the bar, focused judgment in the loop
    And it knows switching from forward to backward on the same artifact spends arm's-length standing

  Scenario: Machine artifact is consumable via governance show
    Given the machine artifact governances are published under artifacts/ai-era/motive-model/
    When an agent runs the governance show command for motive-model
    Then it receives the actor definitions and decision rules in a format suitable for agent reasoning
