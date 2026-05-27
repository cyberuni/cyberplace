# audit-skill

Audit a `SKILL.md` for structure, quality, security, and supply-chain signals before installing or publishing.

## When to use

Use this skill before trusting or shipping a skill.

Good triggers include:

- Before installing a third-party skill
- Before committing a new or modified skill
- When reviewing a skill for publication on skills.sh

## What it does

The skill runs a full rubric covering:

- Structure and frontmatter (S1–S5)
- Content quality aligned with skill-design governance (Q1–Q13)
- Security and supply-chain checks (E1–E9, P1–P3)

Mechanical checks can run without an LLM:

```bash
npx cyber-skills@<version> audit validate --path skills/my-skill
```

Full quality review requires this agent skill after mechanical validation passes.

## Install

```bash
npx skills add cyberuni/cyber-skills --skill audit-skill
```
