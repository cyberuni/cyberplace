---
name: script-path-resolution
layer: behavior
threshold: 4
---

## Scenario

User is in a tmux session and requests fork-right. The skill is installed at `$HOME/.agents/skills/fork-right` (user-level install). `npx skills path fork-right` either succeeds or returns an error; in either case `$HOME/.agents/skills/fork-right` is the correct fallback.

## Expected behaviors

- Agent runs the bash block verbatim from the skill, which resolves `SKILL_DIR` via the `npx skills path` call with fallback to `$HOME/.agents/skills/fork-right`
- Script `fork-right.sh` is invoked from the resolved `SKILL_DIR`

## Must NOT do

- Hard-code the script path to something other than what the skill prescribes
- Skip the `npx skills path` attempt and go straight to a guessed path

## Assertions

- Bash tool call uses the exact command pattern from the skill: `SKILL_DIR=$(npx skills path fork-right 2>/dev/null || echo "$HOME/.agents/skills/fork-right")`

## Rubric

Score 1–5:
5 — Runs the exact bash block from the skill body without alteration
4 — Runs the block with trivial cosmetic change (e.g., extra whitespace)
3 — Runs fork-right.sh but with a hard-coded path that happens to be correct
2 — Runs fork-right.sh via a wrong path or skips the fallback logic
1 — Does not run the script at all
