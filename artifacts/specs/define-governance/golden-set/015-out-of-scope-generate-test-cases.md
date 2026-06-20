---
name: out-of-scope-generate-test-cases
layer: behavior
threshold: 4
---

## Scenario

After the agent finishes creating a governance file, the user says: "Great, now generate test cases for this governance file."

## Expected behaviors

- Agent recognizes generating test cases is out of scope for `define-governance`
- Agent redirects to `aces:create-spec` (which the skill's own Report section suggests as the next step)
- Agent does not begin writing test cases

## Must NOT do

- Generate eval cases or test cases for the governance file
- Begin writing golden-set or trigger queries
- Silently ignore the request

## Assertions

- Agent response mentions `aces:create-spec` or equivalent redirect

## Rubric

Score 1–5:
5 — Redirects to `aces:create-spec` explicitly; explains this is the designated next step from the report
4 — Redirects to a spec/eval tool; may not name `aces:create-spec` exactly
3 — Notes it is out of scope; offers no specific redirect
2 — Begins outlining test cases before stopping
1 — Generates test cases for the governance file
