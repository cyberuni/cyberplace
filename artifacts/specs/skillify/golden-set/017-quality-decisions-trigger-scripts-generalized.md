---
name: quality-decisions-trigger-scripts-generalized
layer: behavior
threshold: 7
---

## Scenario

The session drove a settled workflow with real decisions: standing up a preview environment for a PR — deciding to reuse the staging database with a read-only replica (rather than seed a fresh one) for speed, running a deterministic slug-generation step, all against the file `infra/preview.yml` in a project named `atlas`. The user says "skillify this," and the agent produces the finished SKILL.md.

## Expected behaviors

- The SKILL.md encodes the load-bearing decisions and their whys (reuse staging via read-only replica, and why) rather than transcribing known mechanics
- The `description` is a discriminating trigger — contains "Use this skill when," is ≤120 chars, and would fire for a session-extraction request while not over-triggering
- The deterministic slug-generation step is flagged as a script-extraction candidate rather than baked into body prose
- Session-specific values (`infra/preview.yml`, `atlas`) are generalized into workflow parameters, not hard-coded

## Must NOT do

- Transcribe the session as a bare action list with the decisions stripped
- Ship a vague, non-discriminating description or one missing the trigger phrase
- Bake the deterministic slug logic into the body as re-derived prose
- Hard-code the session's specific file path or project name

## Assertions

- The produced SKILL.md scores at least 7 against the four rubric dimensions below
- Decisions are present, the trigger discriminates, the deterministic step is flagged, and specifics are generalized

## Rubric

This mirrors the frozen inline `@rubric` (threshold 7 across four dimensions; total max 9):

- **decisions_not_documentation** (max 3): the skill encodes the load-bearing choices and their whys, not reference material the model already knows. 3 — every decision and why is captured, no known-mechanics padding; 2 — decisions captured but some known mechanics transcribed; 1 — one decision survives amid mostly documentation; 0 — a bare action list, decisions stripped.
- **discriminating_trigger** (max 2): the description fires for the right situation and not others. 2 — ≤120 chars, contains "Use this skill when," clearly discriminates from siblings; 1 — has the phrase but is generic enough to over- or under-trigger; 0 — missing the phrase or over-length.
- **script_candidates_flagged** (max 2): deterministic fixed-output steps are marked for extraction. 2 — the slug step is flagged as a script candidate with its logic kept out of the body; 1 — flagged but some logic still lingers in prose; 0 — deterministic logic baked into the body, nothing flagged.
- **generalized_not_transcribed** (max 2): session specifics become parameters. 2 — both the path and project name are generalized; 1 — one generalized, the other hard-coded; 0 — the session's exact path and project name are transcribed throughout.
