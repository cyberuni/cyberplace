@frozen
Feature: tuning — the crew-tuning persona: the Tuner
  Unit suite for the Tuner persona gateway: activate when the user wants to reconfigure an
  automaton already in the fleet — adjust its program (governance, model, effort, leash), re-chip
  its loadout (add/remove the skills and governances it carries), or hot-swap the whole unit for
  another. Tuner is a thin in-session dispatcher shaped like aced:manage: it fast-paths when the
  operation is named, else shows a short menu, and routes to concrete engines rather than
  reimplementing them — model/effort to manage-model-runners, program/loadout edits to
  define-agent / improve-agent-definition, leash to the autonomy rubric. It picks no model itself:
  it advises and the user switches. It reconfigures an existing unit only — it never recruits a new
  crew (that is the Crimp persona) and never deploys a ship instance (that is the Operator persona);
  it defers both at the boundary.

  # ── Triggering ──

  @trigger
  Scenario Outline: the Tuner persona activates on reconfiguring an existing automaton
    Given a user query "<query>"
    When cyberspace routes the request
    Then invocation is "<should_trigger>"

    Examples:
      | query                                                                          | should_trigger |
      | tune this agent so it uses opus                                                 | yes            |
      | give this crew more reasoning effort on hard steps                              | yes            |
      | re-chip its loadout — add the commit-work skill to that agent                   | yes            |
      | drop the changeset governance from this automaton's program                     | yes            |
      | swap this crew for a different one to run this task                             | yes            |
      | loosen this automaton's leash so it self-asserts more                           | yes            |
      | recruit a new crew for me / browse the Tavern for a persona to install          | no             |
      | spawn a new ship and worktree to run this migration in parallel                 | no             |
      | author a brand-new skill from scratch for exporting reports                     | no             |
      | just refactor this file in the current session                                 | no             |

  @behavior
  Scenario: a recruit-a-new-crew request is not a Tuner request
    Given the user wants to acquire a crew type the fleet does not have yet — browse the Tavern,
      install and register a new persona
    When cyberspace routes the request
    Then Tuner does not handle it and defers to the Crimp recruitment persona

  @behavior
  Scenario: a deploy-a-ship request is not a Tuner request
    Given the user wants to spawn a new ship instance or worktree to run work in parallel
    When cyberspace routes the request
    Then Tuner does not handle it and defers to the Operator persona

  @behavior
  Scenario: an author-from-scratch request is not a Tuner request
    Given the user wants a brand-new skill authored from scratch, not a change to an existing unit
    When cyberspace routes the request
    Then Tuner does not handle it and the define-skill authoring path does

  # ── Thin-dispatcher shape ──

  @behavior
  Scenario: the operation is named, so Tuner fast-paths to the matching engine
    Given the invocation already names the operation — "make this agent use opus"
    When Tuner classifies the request
    Then it loads the matching engine in the current session with no menu, spawning nothing and opening no CR

  @behavior
  Scenario: the invocation is bare, so Tuner shows a short menu instead of guessing
    Given Tuner is invoked with no operation named — "tune this agent"
    When Tuner classifies the request
    Then it presents a short menu of at most four routing options and does not guess the operation

  # ── Routing the program change ──

  @quality @rubric
  Scenario: a model or effort change routes to manage-model-runners
    Given the user wants an existing automaton to run a different model or effort
    When Tuner classifies the program change
    Then the judge evaluates the routing against the rubric
      """
      dimensions:
        - name: routes_model_or_effort_to_manage_model_runners
          max: 3
        - name: stays_a_thin_dispatcher_holds_no_runner_def_logic_itself
          max: 2
        - name: keeps_the_target_unit_in_scope_does_not_recruit_or_deploy
          max: 2
      threshold: 5
      """
    And the rubric score is at least the threshold

  @quality @rubric
  Scenario: a governance or loadout re-chip routes to the agent-definition engines
    Given the user wants to change which governances or skills an existing automaton carries
    When Tuner classifies the program change
    Then the judge evaluates the routing against the rubric
      """
      dimensions:
        - name: routes_program_or_loadout_edits_to_define_agent_or_improve_agent_definition
          max: 3
        - name: edits_the_existing_unit_rather_than_authoring_a_new_one
          max: 2
        - name: names_the_engine_aloud_and_reimplements_none_of_it
          max: 2
      threshold: 5
      """
    And the rubric score is at least the threshold

  @quality @rubric
  Scenario: a leash or autonomy change routes to the autonomy rubric
    Given the user wants to loosen or tighten an existing automaton's leash
    When Tuner classifies the program change
    Then the judge evaluates the routing against the rubric
      """
      dimensions:
        - name: routes_the_leash_change_to_the_autonomy_rubric
          max: 3
        - name: frames_the_change_as_an_autonomy_posture_not_an_ad_hoc_toggle
          max: 2
      threshold: 4
      """
    And the rubric score is at least the threshold

  @quality @rubric
  Scenario: Tuner advises the model switch but never applies it silently
    Given the user asks Tuner to change an automaton's model or effort
    When Tuner handles the request
    Then the judge evaluates the behavior against the rubric
      """
      dimensions:
        - name: advises_which_model_or_effort_the_work_wants
          max: 3
        - name: leaves_the_actual_switch_to_the_user_never_flips_the_session_model_silently
          max: 3
        - name: states_the_recommendation_and_the_manual_step_plainly
          max: 2
      threshold: 6
      """
    And the rubric score is at least the threshold

  @quality @rubric
  Scenario: Tuner confirms before hot-swapping the whole unit
    Given the user asks to swap an existing crew for a different automaton on a task
    When Tuner handles the hot-swap
    Then the judge evaluates the behavior against the rubric
      """
      dimensions:
        - name: confirms_the_whole_unit_replacement_before_performing_it
          max: 3
        - name: names_the_outgoing_and_incoming_unit_so_the_user_can_veto
          max: 2
        - name: does_not_treat_a_destructive_swap_as_an_unconfirmed_fast_path
          max: 2
      threshold: 5
      """
    And the rubric score is at least the threshold

  # ── Boundaries ──

  @behavior
  Scenario: Tuner only reconfigures an existing unit, never authors a brand-new crew
    Given a request whose target automaton does not yet exist in the fleet
    When Tuner classifies the request
    Then it does not author a brand-new crew and defers acquiring one to the Crimp recruitment persona

  @behavior
  Scenario: Tuner never deploys or spawns a ship instance
    Given a request that would require deploying or spawning a ship instance to run work
    When Tuner classifies the request
    Then it does not spawn a ship or worktree and defers deployment to the Operator persona

  @behavior
  Scenario: a mixed request is split — Tuner reconfigures, and hands the out-of-scope part off
    Given a request that both re-chips an existing automaton and asks to recruit a new crew type
    When Tuner classifies the request
    Then it handles the reconfiguration of the existing unit and hands the recruit-a-new-crew part
      to the Crimp persona aloud, never performing the recruitment itself

  @quality @rubric
  Scenario: Tuner defers cleanly to Crimp or Operator at the boundary
    Given a request that mixes reconfiguring an existing unit with recruiting a new crew or deploying a ship
    When Tuner handles it
    Then the judge evaluates the deferral against the rubric
      """
      dimensions:
        - name: identifies_the_out_of_scope_part_correctly_crimp_for_recruit_operator_for_deploy
          max: 3
        - name: hands_it_off_aloud_by_persona_name_rather_than_acting_out_of_scope
          max: 2
        - name: still_completes_the_in_scope_reconfiguration
          max: 2
      threshold: 5
      """
    And the rubric score is at least the threshold
