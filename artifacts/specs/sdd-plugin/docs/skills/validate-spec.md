---
title: validate-spec
description: Check a spec for completeness, consistency, and SDD compliance.
---

Checks a spec for completeness, internal consistency, and adherence to SDD principles.

## When to use

- Before changing a spec's status from Draft → Approved
- Before changing a spec's status from Approved → Implemented
- Saying **"validate spec"** or **"check spec"** in Claude Code

## What it checks

### Required sections

- `Status` field present and valid (`Draft` / `Approved` / `Implemented` / `Deprecated`)
- `What` section present and non-empty
- `Why` section present and non-empty — Why is never optional
- `Command surface / API` section present (or explicitly noted as N/A with justification)
- Link to `.feature` file present
- `.feature` file exists at the linked path

### Content quality

- `What` describes observable behavior, not implementation internals
- `Why` explains the problem, not just restates the What
- `Design decisions` section present if non-obvious choices were made
- No placeholder text (`TBD`, `TODO`, `...`, empty sections)
- No contradictions between sections

### .feature file quality

- At least one happy-path scenario per operation
- At least one error-case scenario per operation
- Scenarios use BDD language (Given/When/Then)
- Scenarios describe observable behavior only (no internal state references)
- `--json` scenarios present if the command supports `--json`

### Status consistency

- If `Implemented`: passing tests exist that correspond to the scenarios
- If `Approved`: spec has been reviewed (PR approval or recorded acknowledgment)
- If `Draft`: no implementation exists yet, or backfill is in progress

## Output

The skill reports PASS / FAIL per check, a summary count, and a list of required fixes before the spec can advance to its next status.
