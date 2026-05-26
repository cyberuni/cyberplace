# ADR-0005: Skill Taxonomy

## Status

Accepted

## Context

The repo used **kind** in multiple meanings:

1. **Skill authoring placement** — where a skill lives (`~/.agents/skills`, `.agents/skills`, `skills/`)
2. **Awesome catalog classification** — repo or skill recommendation class (`targeted`, `broad-catalog`)
3. Prospective discussion of skill **type** — workflow shape, persona, style, actions, or knowledge

That overloaded two near-synonyms, **kind** and **type**, across different layers:

| Layer | Old term | Actual meaning |
| --- | --- | --- |
| Skill authoring docs | `kind` | Placement / install location |
| Awesome catalog schema | `kind` | Catalog classification |
| General product/ecosystem language | `type` | Often behavior, tools, knowledge, or workflow shape |

This creates ambiguity in docs, agent skills, and future APIs.

External product language is more explicit:

- OpenAI Skills describes **patterns** such as reusable process, tool-based workflow, and conventions/standards.
- OpenAI GPTs separates **instructions**, **knowledge**, **capabilities**, **apps**, and **actions**.
- Anthropic separates **project instructions**, **styles**, **roles/perspectives**, and **subagents**.
- Anthropic and related tooling also use scope-like words such as **user**, **project**, and **local**.

In the wild, a distinct class of skills loads an expert stance — orchestrator, designer, product manager, security auditor — into the session. These are widely called **persona skills** and split into two activation modes: invoked once at session start to set identity for the whole session, or triggered per-situation like a slash command. Neither the placement axis nor the existing pattern values covered this.

## Decision Drivers

- Remove ambiguity between placement and workflow shape.
- Align repo terminology with broader agent ecosystem language.
- Avoid breaking the existing awesome catalog schema without a migration plan.
- Keep authoring guidance short enough for agent-loaded artifacts.
- Make future metadata fields composable instead of overloading one label.
- Cover persona/role skills, which are common in the wild but not described by process/tool-based/standard.

## Decision

Adopt this taxonomy:

| Concern | Term | Meaning |
| --- | --- | --- |
| Where a skill lives | **Placement** | User vs project-private vs project-public |
| What workflow shape it encodes | **Pattern** | Process vs tool-based vs standard vs persona |
| Expert stance, if any | **Role** | Reviewer, analyst, designer, etc. |
| Output voice/format, if any | **Style** | Concise, formal, brand voice, etc. |
| External systems or tools needed | **Capabilities** | Tools, actions, connectors, apps |
| Reference corpus or domain material | **Knowledge** | Uploaded files, references, templates, schemas |
| When it activates | **Activation** | Session-start vs per-situation |

### Placement values

Use these names in docs and skill-authoring guidance:

| Placement | Location |
| --- | --- |
| `user` | `~/.agents/skills/<name>/` |
| `project-private` | `.agents/skills/<name>/` |
| `project-public` | `skills/<name>/` |

These replace the older labels `global`, `repo internal`, and `repo public` in authoring guidance.

### Pattern values

Use these names for workflow shape:

| Pattern | Meaning |
| --- | --- |
| `process` | Ordered multi-step workflow with decisions or phases |
| `tool-based` | Workflow centered on tools, systems, or connectors |
| `standard` | Workflow that enforces tone, structure, formatting, or quality |
| `persona` | Loads an expert stance, decision style, and working behavior into the session |

Do not use **type** for this axis in repo-facing docs.

### Activation values

Store activation in frontmatter as **`metadata.activation`** (cyber-skills canon in **skill-design** governance). Values normalize **hook lifecycle events** across Claude Code, Cursor, and Codex (kebab-case → agent-specific hook config keys). Applies to all patterns — not persona-only.

| Activation | Meaning |
| --- | --- |
| `per-situation` | No hook event; load via `description` or explicit invoke — **default when omitted** |
| `session-start` | Normalized SessionStart / `sessionStart` hook — chat opens or resumes |
| `post-tool-use` | Normalized PostToolUse / `postToolUse` hook — after tool succeeds |
| *(others)* | Full vocabulary and agent mapping table in **skill-design** governance |

Persona skills default to `per-situation`. Discipline and always-on injection skills use hook events such as `session-start`. Hosts may interpret metadata differently; authors declare intent.

### What not to call a skill type

Do not treat these as primary skill types:

- Role
- Tone
- Style
- Actions
- Tools
- Knowledge

Model them as orthogonal attributes when needed. The exception is **persona** — it is the workflow shape for role-loading skills and belongs under **Pattern**.

## Awesome Catalog Compatibility

The awesome catalog JSON schema keeps its existing field name:

- `kind` in `awesome-skills.json` continues to mean **catalog classification**

This ADR does **not** rename that schema field. Renaming it would be a compatibility change for:

- `awesome-skills.json`
- `src/awesome/lib.ts`
- tests and renderers
- any external consumers of the generated JSON

Within TypeScript, prefer names such as **catalog kind** or `CatalogKind` to avoid confusion with skill placement.

## Consequences

### Positive

- Separates placement from workflow shape cleanly.
- Leaves room for future metadata without another rename.
- Matches common external terminology more closely.
- Reduces ambiguity in agent-loaded skills and governances.
- Persona skills are now a first-class pattern — authoring guidance and audit rules can reference them explicitly.
- Activation mode distinguishes session-start persona skills from per-situation slash-command-style skills.

### Negative

- Contributors must learn new names for the old placement labels.
- Repo docs now use a more explicit taxonomy than some adjacent tools.
- The awesome catalog still carries historical `kind` naming until a schema migration is planned.
- Adding `persona` as a fourth pattern value means existing tooling that enumerates patterns needs updating.

## Migration Guidance

Update repo-facing docs and skills as follows:

- `Skill kind` → `Skill placement`
- `Global` → `User`
- `Repo internal` → `Project private`
- `Repo public` → `Project public`
- `skill type` for workflow shape → `skill pattern`

Persona skills must declare `metadata.persona: true` in frontmatter. The `audit-skill` E2 rule (prompt injection check) already exempts declared persona skills from flagging role-loading phrases.

Do not change the awesome catalog schema in the same step.

## Related Decisions

- [ADR-0001: Governance vs Discipline Taxonomy](0001-governance-vs-discipline-taxonomy.md)
- [ADR-0003: Agent-first Authoring](0003-agent-first-authoring.md)
- [Activation frontmatter proposal](../research/2026-05-activation-frontmatter-proposal.md) — upstream draft for `metadata.activation`
