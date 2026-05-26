# ADR-0005: Skill Placement vs Pattern Taxonomy

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

## Decision Drivers

- Remove ambiguity between placement and workflow shape.
- Align repo terminology with broader agent ecosystem language.
- Avoid breaking the existing awesome catalog schema without a migration plan.
- Keep authoring guidance short enough for agent-loaded artifacts.
- Make future metadata fields composable instead of overloading one label.

## Decision

Adopt this taxonomy:

| Concern | Term | Meaning |
| --- | --- | --- |
| Where a skill lives | **Placement** | User vs project-private vs project-public |
| What workflow shape it encodes | **Pattern** | Process vs tool-based vs standard |
| Expert stance, if any | **Role** | Reviewer, analyst, designer, etc. |
| Output voice/format, if any | **Style** | Concise, formal, brand voice, etc. |
| External systems or tools needed | **Capabilities** | Tools, actions, connectors, apps |
| Reference corpus or domain material | **Knowledge** | Uploaded files, references, templates, schemas |

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

Do not use **type** for this axis in repo-facing docs.

### What not to call a skill type

Do not treat these as primary skill types:

- Persona
- Role
- Tone
- Style
- Actions
- Tools
- Knowledge

Model them as orthogonal attributes when needed.

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

### Negative

- Contributors must learn new names for the old placement labels.
- Repo docs now use a more explicit taxonomy than some adjacent tools.
- The awesome catalog still carries historical `kind` naming until a schema migration is planned.

## Migration Guidance

Update repo-facing docs and skills as follows:

- `Skill kind` → `Skill placement`
- `Global` → `User`
- `Repo internal` → `Project private`
- `Repo public` → `Project public`
- `skill type` for workflow shape → `skill pattern`

Do not change the awesome catalog schema in the same step.

## Related Decisions

- [ADR-0001: Governance vs Discipline Taxonomy](0001-governance-vs-discipline-taxonomy.md)
- [ADR-0003: Agent-first Authoring](0003-agent-first-authoring.md)
