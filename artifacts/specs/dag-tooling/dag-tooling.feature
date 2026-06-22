Feature: DAG Tooling

  # Scenarios trace the reusable graph operations and the Node-optional
  # delivery: a skill runs a bundled script, with an agent fallback when Node
  # is unavailable. Operations are domain-agnostic over nodes and edges.

  # -- graph operations ---------------------------------------------------

  Scenario: Detect a cycle in dependency edges
    Given a node-and-edge set whose dependency edges form a cycle
    When the skill runs the detect-cycle operation
    Then it reports the cycle path

  Scenario: Confirm an acyclic graph
    Given a node-and-edge set with no dependency cycle
    When the skill runs the detect-cycle operation
    Then it reports the graph is acyclic

  Scenario: Order an acyclic graph topologically
    Given an acyclic node-and-edge set
    When the skill runs the topological-order operation
    Then every node precedes the nodes that depend on it

  Scenario: Validate a single-parent tree
    Given containment edges where one child is owned by two parents
    When the skill runs the validate-tree operation
    Then it reports the multi-parent violation

  Scenario: Report an orphan in tree validation
    Given a node marked as a child that no parent contains
    When the skill runs the validate-tree operation
    Then it reports the orphan

  Scenario: Resolve each parent from declared children
    Given nodes whose parents declare child lists
    When the skill runs the resolve-parents operation
    Then each child maps to the single parent that declared it

  Scenario: Render a Mermaid graph
    Given a node-and-edge set
    When the skill runs the render-mermaid operation
    Then it returns a graph TD block with one edge line per edge

  # -- node-optional delivery ---------------------------------------------

  Scenario: Run the bundled script when Node is available
    Given Node is available in the environment
    When the skill performs a graph operation
    Then it runs the bundled mts script

  Scenario: Fall back to agent instructions without Node
    Given Node is unavailable in the environment
    When the skill performs a graph operation
    Then it follows the agent-level procedure for that operation
    And it returns the same shape of result as the script

  # -- domain agnosticism -------------------------------------------------

  Scenario: Operations do not read project files
    Given a caller supplies nodes and edges directly
    When the skill performs any operation
    Then it reads no spec files
    And it interprets no SDD-specific fields
