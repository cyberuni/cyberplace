Feature: SDD usage feedback — the Strategist field loop

  # Collects REAL corrections from REAL usage across installations and feeds
  # them upstream so the shared taxonomy and doctrine grow from real
  # corrections — opt-in always, redacted always, human-reviewed always.

  # ── consent: opt-in always, default OFF ───────────────────────────────

  Scenario: the field loop is off by default
    Given a fresh installation where the user has not opted in
    When the field loop's consent state is read
    Then the field loop is disabled

  Scenario: the user explicitly opts in
    Given the user performs the explicit opt-in action
    When the field loop's consent state is read
    Then the field loop is enabled

  Scenario: opt-in is not inferred without an explicit action
    Given the user has taken no explicit opt-in action
    When an update is installed
    Then the field loop remains disabled

  Scenario: the user revokes opt-in
    Given the user had opted in
    When the user revokes consent
    Then the field loop is disabled

  # ── capture: only when opted in ───────────────────────────────────────

  Scenario: a recurring correction is captured when opted in
    Given the user has opted in
    And a recurring correction-with-cause occurs during usage
    When the field loop processes the correction
    Then the correction-with-cause record is captured locally

  Scenario: nothing is captured when opt-in is off
    Given the user has not opted in
    And a recurring correction-with-cause occurs during usage
    When the field loop processes the correction
    Then no correction record is captured

  Scenario: nothing is transmitted when opt-in is off
    Given the user has not opted in
    And a recurring correction-with-cause occurs during usage
    When the field loop runs
    Then no data leaves the user's environment

  # ── egress guard: minimize, redact, before transmit ───────────────────

  Scenario: a captured correction is minimized before leaving the environment
    Given a correction-with-cause record captured under opt-in
    When the record is staged for submission
    Then the staged record contains only the correction-with-cause data

  Scenario: a captured correction is redacted before leaving the environment
    Given a correction-with-cause record containing sensitive data
    When the record is staged for submission
    Then the sensitive data is redacted from the staged record

  Scenario: an unredacted record is never transmitted
    Given a record that has not passed redaction
    When transmission is attempted
    Then the record is not transmitted

  Scenario: sensitive data is never transmitted unredacted
    Given a correction-with-cause record containing a secret
    When the record is submitted upstream
    Then the transmitted record contains no unredacted secret

  # ── visibility: the user reviews what would be sent ───────────────────

  Scenario: the user previews exactly what would be sent
    Given a redacted record staged for submission
    When the user reviews the staged submission
    Then the user is shown exactly what would be sent

  Scenario: nothing is sent without the user confirming the preview
    Given a redacted record staged for submission
    And the user has not confirmed the preview
    When the field loop runs
    Then the record is not transmitted

  # ── maintainer review: human gate before the corpus ───────────────────

  Scenario: a submission is surfaced for maintainer review
    Given an opt-in submission reaches the SDD system
    When the submission is processed
    Then it is surfaced for maintainer review

  Scenario: a submission does not enter the corpus without maintainer review
    Given an opt-in submission that no maintainer has reviewed
    When the shared corpus is read
    Then the submission is absent from the corpus

  Scenario: a reviewed submission grows the shared taxonomy
    Given a submission a maintainer accepts
    When it is applied
    Then the shared corpus reflects the real correction

  # ── optionality: the core workflow is unaffected ──────────────────────

  Scenario: the core workflow runs with the field loop absent
    Given an installation without the field loop
    When a core mission runs
    Then the mission completes normally

  Scenario: the core workflow runs with the field loop opted out
    Given an installation where the field loop is opted out
    When a core mission runs
    Then the mission completes normally

  Scenario: no core step depends on the field loop
    Given a core mission in progress
    When the field loop is unavailable
    Then no core step fails for its absence
