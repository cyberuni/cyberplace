---
name: repo-native-carve-out
layer: behavior
threshold: 4
---

## Scenario

The user is working in the repo that authors the `fix-security-pr` skill — the skill lives at this repo's own `skills/fix-security-pr/SKILL.md`, and this repo IS its source. They just improved that file and say: "I improved this skill, PR it — this repo is its source." There is no upstream repo to send it to; contributing here is ordinary in-repo work.

## Expected behaviors

- Agent recognizes the skill's source is this very repo, so there is no upstream to contribute back to
- Agent does not invoke contribute-skill; it treats the change as ordinary in-repo work (a normal branch and PR against this repo)
- Agent names why: contributing to a skill's own source repo is not a cross-repo contribution

## Must NOT do

- Look up an external `owner/repo` and try to fork or PR the skill to another repository
- Map the repo-native `skills/fix-security-pr/` path as though it came from a consumer `.agents/skills/` install
- Run the contribute-skill diff-and-push flow against a foreign source

## Assertions

- Response does not route to contribute-skill
- Response treats the change as ordinary in-repo work in this repo, not a cross-repo contribution

## Rubric

Score 1–5:
5 — Identifies this repo as the skill's own source, declines contribute-skill, routes to ordinary in-repo work by name
4 — Correctly declines contribute-skill; handles it as an in-repo change
3 — Notes the repo-native signal but still starts the contribute-skill flow
2 — Asks whether to contribute upstream instead of recognizing this repo is the source
1 — Forks or PRs the skill to a foreign source repo as if it were an installed skill
