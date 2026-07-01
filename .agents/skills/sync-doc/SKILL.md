---
name: sync-doc
description: Use this skill when a concept doc in the website needs to reflect a new ADR, a design decision made in conversation, or a change to a spec. Triggers on "sync the docs", "update the concept doc", or after writing/merging an ADR.
metadata:
  internal: true
---

# Sync Doc

Keeps concept docs in `apps/website/src/content/docs/concepts/` current after a decision lands. Concept docs describe *current state*; ADRs record *why*. This skill bridges them — surgical updates only, no rewrites, no history prose.

## Trigger types

| Trigger | When |
|---------|------|
| `adr` | A new ADR was written or merged |
| `decision` | A significant design decision was made in conversation without an ADR |
| `explicit` | User invokes directly: "sync the docs for X" |

## Workflow

### 1. Identify source of change

- **ADR trigger:** note the ADR number and path (`artifacts/adr/NNNN-slug.md`); read it fully
- **Decision trigger:** summarize the decision in one sentence — what changed and what the current state is now
- **Explicit trigger:** identify the concept named by the user

### 2. Extract what changed

From the ADR or decision, extract:
- Which **concept(s)** changed (e.g. skill lifecycle, governance loading, ADR format)
- What the **current state** is (not the history — just what is true now)
- What the **previous state** was, so you know what to replace

### 3. Find affected concept doc(s)

Scan `apps/website/src/content/docs/concepts/` for docs that cover the changed concept:
- Read each doc's frontmatter `description` and first paragraph
- Match by concept name, not by ADR title — one ADR can affect multiple docs; one doc can absorb multiple ADRs

If **no concept doc exists** for this concept: invoke the `create-web-doc` skill to scaffold one, then continue with step 4.

### 4. Determine what needs updating

For each affected doc, identify the minimal change:

| Situation | Action |
|-----------|--------|
| A fact is now wrong or outdated | Replace the specific sentence or paragraph |
| A new concept or capability was added | Add a new `##` section in the appropriate place |
| A concept was removed or deprecated | Remove or strike the section; add a note if the removal is user-visible |
| An ADR now explains the background | Add the ADR to the Related section (see step 5) |

Do not rewrite prose that is still correct. Do not add history or rationale — link to the ADR instead.

### 5. Make surgical edits

Edit the concept doc:
- Replace only what changed
- Preserve existing voice, tense, and structure
- Never add "As of ADR-NNNN..." or date-stamped language — concept docs are always-current
- Never reproduce ADR rationale in concept docs — one sentence summary + link is enough

Add or update a `## Related decisions` section at the bottom of the doc:

```text
## Related decisions

- [ADR-NNNN: Title](<relative-path-to-adr>) — one-line summary of what the ADR decided
```

If a `## Related` or `## See also` section already exists, add to it rather than creating a duplicate.

### 6. Cross-link back to concept doc (ADR trigger only)

If triggered by an ADR, open the ADR file and check whether it already references the concept doc. If not, add to the ADR's `## Related Decisions` or closing section:

```markdown
**Concept doc:** [ConceptName](/concepts/concept-slug/) — current state reference
```

Only add this if the concept doc meaningfully reflects this decision. Skip if the ADR is too narrow or internal.

### 7. Report

State:
- Which concept doc(s) were updated and what changed in each
- Whether a new concept doc was created
- Whether the ADR was cross-linked
- Any concept that was affected but has no doc yet (flag, don't block)

## Anti-patterns

- Do not rewrite a concept doc from scratch — surgical edits only
- Do not add history, timelines, or "previously we did X" prose to concept docs
- Do not create a concept doc for every ADR — only when a user-facing concept changed
- Do not reproduce ADR rationale — link to the ADR, summarize in one line
- Do not add date-stamped or ADR-stamped language in concept doc body prose

## Concept doc location

`apps/website/src/content/docs/concepts/` — Astro Starlight content collection.

Existing concept docs and their scope:

| File | Covers |
|------|--------|
| `adrs.md` | What ADRs are, what belongs in one, ADR vs governance |
| `agent-configuration.md` | AGENTS.md, skills, subagent definitions, commands |
| `commands.md` | Slash commands and agent command patterns |
| `disciplines.md` | Disciplines concept, commit-discipline |
| `glossary.md` | Term definitions |
| `governances.md` | What governances are, how they differ from ADRs |
| `spec-driven-development.md` | SDD methodology, maturity levels, co-delivery model |
| `test-driven-development.md` | TDD for agents |

## References

- `create-web-doc` skill — scaffold a new Astro doc page when no concept doc exists yet
- ADR template: `artifacts/adr/template.md`
- Concept docs live in: `apps/website/src/content/docs/concepts/`
