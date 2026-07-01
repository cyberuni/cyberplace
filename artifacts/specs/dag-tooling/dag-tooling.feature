Feature: DAG Tooling

  # Scenarios trace the reusable graph operations and the Node-optional
  # delivery: a skill runs a bundled script, with an agent fallback when Node
  # is unavailable. Operations are domain-agnostic over nodes and edges.
  # Every Then asserts observable output or result shape, never the execution
  # path or any internal step.

  # ── detect-cycle ───────────────────────────────────────────────────────

  Scenario: Confirm an acyclic graph
    Given a node-and-edge set with no dependency cycle
    When the skill runs the detect-cycle operation
    Then it reports the graph is acyclic

  Scenario: Detect a cycle in dependency edges
    Given a node-and-edge set whose dependency edges form a cycle
    When the skill runs the detect-cycle operation
    Then it reports the cycle path naming the nodes on the cycle

  # ── topological-order ──────────────────────────────────────────────────

  Scenario: Order an acyclic graph topologically
    Given an acyclic node-and-edge set
    When the skill runs the topological-order operation
    Then it returns an order in which every node precedes the nodes that depend on it

  Scenario: Reject cyclic input to topological-order as caller error
    Given a node-and-edge set whose dependency edges form a cycle
    When the skill runs the topological-order operation
    Then it returns no order and reports the input as a cycle violation

  # ── validate-tree ──────────────────────────────────────────────────────

  Scenario: Validate a single-parent tree without violations
    Given containment edges where every child has at most one parent
    When the skill runs the validate-tree operation
    Then it reports the tree is valid with no violations

  Scenario: Report a multi-parent violation in tree validation
    Given containment edges where one child is owned by two parents
    When the skill runs the validate-tree operation
    Then it reports the multi-parent violation naming the child and both parents

  Scenario: Report an orphan in tree validation
    Given a node marked as a child that no parent contains
    When the skill runs the validate-tree operation
    Then it reports the orphan naming the unparented node

  # ── resolve-parents ────────────────────────────────────────────────────

  Scenario: Resolve each parent from declared children
    Given nodes whose parents declare child lists with no child claimed twice
    When the skill runs the resolve-parents operation
    Then each child maps to the single parent that declared it

  Scenario: Report a child claimed by two parents as a multi-parent violation
    Given nodes where two parents declare the same child
    When the skill runs the resolve-parents operation
    Then it reports a multi-parent violation naming the child and the contending parents

  # ── render-mermaid ─────────────────────────────────────────────────────

  Scenario: Render a Mermaid graph
    Given a node-and-edge set
    When the skill runs the render-mermaid operation
    Then it returns a graph TD block with one edge line per edge

  Scenario: Render an empty graph
    Given a node-and-edge set with no edges
    When the skill runs the render-mermaid operation
    Then it returns a graph TD block with no edge lines

  # ── node-optional delivery ─────────────────────────────────────────────

  Scenario: Return a result when Node is available
    Given Node is available in the environment
    When the skill performs a graph operation
    Then it returns the operation's result

  Scenario: Return the same result shape when Node is unavailable
    Given Node is unavailable in the environment
    When the skill performs a graph operation
    Then it returns a result of the same shape as when Node is available

  # ── domain agnosticism ─────────────────────────────────────────────────

  Scenario: Compute results only from caller-supplied data
    Given a caller supplies nodes and edges directly
    When the skill performs any operation
    Then it returns a result derived only from the supplied nodes and edges
    And the result reflects no spec file content or SDD-specific field
