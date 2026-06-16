---
name: create-skill
description: >
  Scaffold and ship a new SKILL.md through the full creation lifecycle —
  design, implement, structural audit, trigger eval, and evidence recording.
  Use when creating a skill from scratch or formalizing an existing one,
  even if the user just says "I want a skill for X" or "help me build this."
---

# Create Skill

## Gotchas

- **Never use `@latest`:** Resolve the pinned version first: `npm view cyber-skills version`, then use `npx cyber-skills@<version>`.

## Lifecycle

```
Research → Design → Implement → Audit → Test → Evidence → Ship
```

Each phase gates the next. Do not skip ahead.

---

## Phase 1 — Research

Before writing anything, check what is already known:

1. Search `.research/` for findings relevant to the skill's domain.
2. If the skill enforces non-obvious criteria (thresholds, patterns, rankings), identify the authoritative source now. You will record it in Phase 6.
3. If no prior research applies, proceed — you will record new evidence in Phase 6 after testing confirms the criteria work.

---

## Phase 2 — Design

Answer all five questions before writing a line of SKILL.md:

| Question | What to decide |
|---|---|
| Scope | What exactly does this skill do? One workflow only. |
| Trigger condition | When should it fire? List both explicit and implicit phrasings. |
| Output contract | What artifact does it produce? File path, report format, or decision? |
| Quality bar | How will you know a run succeeded? Define a concrete pass condition. |
| Out of scope | What must this skill explicitly NOT do? |

If you cannot answer all five, stop and resolve them with the user before proceeding.

---

## Phase 3 — Implement

1. Create `skills/<name>/SKILL.md` (user-level: `~/.agents/skills/<name>/SKILL.md`).
2. Write frontmatter:
   - `name`: kebab-case, must match the directory name exactly
   - `description`: capabilities + "Use when…" trigger condition + implicit phrasing examples. Target 150–400 characters. See `.research/skill-description-guidelines/conclusion.md`.
3. Write body: step-by-step instructions, gotchas, output format. Keep under 500 lines.
4. Add `references/` only for material that is large, rarely needed, and has explicit load conditions in the body.
5. Create `evals/` — at minimum `evals/trigger-queries.json` with labeled should/should-not-trigger queries. See `test-skill` for the file formats.

---

## Phase 4 — Structural audit

Run `improve-skill` before any testing:

```bash
npx cyber-skills@<version> audit validate --path skills/<name>
```

- Resolve all CRITICAL and HIGH findings before proceeding.
- MEDIUM findings must be resolved or explicitly deferred with a documented reason in the commit message.

---

## Phase 5 — Test

Run `test-skill` to validate trigger accuracy and output quality:

```
Use the test-skill skill on skills/<name>
```

Pass criteria:
- Trigger accuracy: ≥80% of should-trigger queries activate the skill; ≥90% of should-not-trigger queries do not.
- Output quality: all scenario evals pass their expected output check.

If trigger accuracy is below threshold, revise the description and re-run. See `.research/skill-description-guidelines/conclusion.md` for the optimization approach.

Do not proceed to Phase 6 until both pass.

---

## Phase 6 — Evidence

If the skill enforces non-obvious criteria, record the evidence:

```
.research/<criteria-slug>/
├── conclusion.md   # current best answer (read this first)
├── topic.md        # full investigation record
├── evidence.md     # claims with confidence levels and source URLs
└── changes.md      # dated update history
```

Link from the relevant check definition back to the research slug.

Skip only if: (a) all criteria are direct spec requirements with a cited URL already in the check definition, or (b) every criterion is already covered by an existing `.research/` slug that is still current.

---

## Phase 7 — Ship

1. Run `improve-skill` one final time — all checks must pass.
2. Commit: `feat(skills): add <name> skill`.
3. If publishing to a registry, run `publish-universal-plugin`.
