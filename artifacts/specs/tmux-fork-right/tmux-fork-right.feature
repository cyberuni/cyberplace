@frozen
Feature: fork-right — fork the Claude session into a new tmux pane on the right
  Eval suite for the tmux fork-right skill: it activates only on an intent to fork the current Claude
  session into a right-hand tmux pane, runs the skill's bash block silently, and surfaces tmux errors
  without retrying. The rubric for the graded output-quality case is inline; trigger cases are an
  Examples table of {query, should_trigger}.

  # ── activation (trigger) ──

  @trigger
  Scenario Outline: fork-right activates only on a fork-the-session-right intent
    Given a user in a tmux session says "<query>"
    When the agent decides whether to invoke fork-right
    Then invoking fork-right is "<should_trigger>"

    Examples:
      | query                                                                       | should_trigger |
      | Fork right.                                                                 | yes            |
      | hey can you fork right real quick                                           | yes            |
      | fork-right                                                                  | yes            |
      | Fork session right                                                          | yes            |
      | Fork this conversation into a new tmux pane on the right                    | yes            |
      | Can you fork right so I can work on something else in parallel?             | yes            |
      | Split a new Claude session to the right in tmux                             | yes            |
      | I want to continue this chat in a parallel pane. Fork it to the right.      | yes            |
      | Please fork the current Claude conversation into a new pane                 | yes            |
      | open a forked claude session to the right in tmux                           | yes            |
      | I need a new claude pane to the right that continues from here              | yes            |
      | I want to work on a parallel topic without losing this session. Fork right. | yes            |
      | Open a new tmux window for my project                                       | no             |
      | Split the pane horizontally without starting Claude                         | no             |
      | Fork my git branch to try a different approach                              | no             |
      | Open a new terminal tab                                                     | no             |
      | How do I split panes in tmux?                                               | no             |
      | I use tmux for all my development work                                      | no             |
      | Split this pane but don't fork the session                                  | no             |
      | Create a new Claude conversation from scratch                               | no             |
      | Can you move to a new window in tmux?                                       | no             |
      | How does tmux pane splitting work in general?                               | no             |

  # ── execution (behavior) ──

  @behavior
  Scenario: it executes the skill's bash block silently
    Given a user in a tmux session invokes fork-right and the skill body contains a bash block
    When the agent runs the skill
    Then it issues a Bash tool call running fork-right.sh
    And it does not print or echo the bash block as text to the user
    And it does not ask for confirmation before running

  @behavior
  Scenario: it resolves the script path via the skill's prescribed command
    Given fork-right is installed at the user-level skills path
    When the agent runs the skill
    Then the Bash call resolves the skill directory via the "npx skills path fork-right" command with the documented user-level fallback
    And it invokes fork-right.sh from the resolved skill directory

  @behavior
  Scenario: it reports the not-in-tmux error without retrying
    Given the agent is not inside a tmux session and fork-right.sh exits non-zero with "not inside a tmux session"
    When the agent runs the skill
    Then it reports the "not inside a tmux session" error to the user
    And it does not issue a second tmux-related Bash call
    And it does not claim the fork succeeded

  @behavior
  Scenario: it reports a pane-limit failure without retrying
    Given fork-right.sh fails because tmux is at its pane limit
    When the agent runs the skill
    Then it reports to the user that splitting the pane failed
    And it does not issue a second tmux split-window call
    And it does not claim the pane was created

  # ── output quality ──

  @quality @rubric
  Scenario: a successful fork produces terse output
    Given a user in a tmux session says "fork right" and the script succeeds
    When the agent reports the result
    Then the judge evaluates the scenario against the rubric
      """
      dimensions:
        - name: terseness
          max: 3
        - name: no-narration
          max: 2
      threshold: 4
      """
    And the rubric score is at least the threshold
