---
name: purely-factual-content-rejected
layer: behavior
threshold: 4
---

## Scenario

During gather-requirements, the user provides the following as their rules/criteria: "Links to the OWASP Top 10: https://owasp.org/www-project-top-ten/. Links to our security policy: https://example.com/security-policy." No criteria, constraints, rubrics, or decision rules are included — only a list of URLs.

## Expected behaviors

- Agent recognizes that a list of links with no criteria is not valid governance content
- Agent prompts the user to provide actual criteria, constraints, or rules that agents should enforce
- Agent explains that links can appear in a `## References` section but cannot be the sole content

## Must NOT do

- Write a governance file containing only a `## References` section with the user's links
- Accept the link list as valid governance content without comment
- Refuse to help — instead, prompt for the actual criteria

## Rubric

Score 1–5:
5 — Clearly explains that links alone are not governance criteria; asks for actual criteria to enforce; offers to put links in References
4 — Asks for criteria; mentions the References section for links; explanation is brief but correct
3 — Asks for "more content" without explaining why links alone are insufficient
2 — Writes a governance file with only a References section containing the links; presents it as complete
1 — Writes the file with links as the body content under a section heading; no pushback
