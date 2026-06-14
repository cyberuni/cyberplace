# ADR-0001: Governance vs Discipline Taxonomy

## Status

Accepted

## Context

cyber-skills ships two related but distinct kinds of agent guidance:

1. **Version-pinned standards** — markdown contracts in `governances/` (for example `skill-design`, `agent-tool-output`), loaded on demand via `cyber-skills governance show` and enforced mechanically by `audit-skill`.
2. **Session-injected behavior** — rules such as Commit Discipline, injected at SessionStart through the `commit-discipline` hook and documented in AGENTS.md.

Both were initially labeled **discipline**, overloading one word for two different mechanisms:

| Mechanism | Load model | Authority model | Naming |
| --- | --- | --- | --- |
| Standards | On demand per workflow | Version-pinned, auditable, stdout is source of truth | `governances/`, `governance show` |
| Behavior | Every session (when hook registered) | Habitual, ambient context | `commit-discipline`, Commit Discipline |

The standards layer behaves like governance (canonical rules, audit enforcement, enterprise-familiar vocabulary). The behavior layer behaves like discipline (operating habits, self-regulation, lighter tone). Using one term for both creates confusion for contributors and obscures the architectural split.

## Decision Drivers

- **Clear separation** between load-on-demand standards and always-on session behavior.
- **Auditability** — standards must be version-pinned and treated as authoritative by audit tooling.
- **Natural phrasing** for existing commit hooks — "commit discipline" already reads correctly.
- **Appropriate tone** — avoid compliance-theater language for daily agent habits.
- **Enterprise clarity** where standards are referenced in audit and authoring workflows.
- **Agent context efficiency** — governances load into the agent window on demand; they must stay normative and concise.

## Considered Options

### Option 1: Discipline only (status quo)

Keep **discipline** for both standards (`disciplines/`, `discipline show`) and session behavior (`commit-discipline`).

- **Pros**: Unified vocabulary; no rename cost; already shipped in v0.3.0.
- **Cons**: Ambiguous dual meaning; standards layer lacks governance semantics; harder to explain the load-on-demand vs always-on split.

### Option 2: Governance only

Rename everything to **governance** — standards and session behavior.

- **Pros**: Strong authority signal for auditable standards; familiar to enterprise/platform teams.
- **Cons**: "Commit governance" sounds bureaucratic and unnatural; mischaracterizes habitual session behavior as org policy.

### Option 3: Split — Governance + Discipline (chosen)

Use **Governance** for version-pinned auditable standards and **Discipline** for session-injected behavioral rules.

- **Pros**: Clearest taxonomy; each term matches its mechanism and tone; preserves natural "commit discipline" phrasing; aligns audit layer with governance semantics.
- **Cons**: Two concepts to learn; required a CLI/folder rename to align implementation with terminology.

## Decision

Adopt the **split taxonomy**:

| Layer | Term | Definition |
| --- | --- | --- |
| **Governance** | Version-pinned, auditable **standards** | Canonical rules loaded on demand via CLI; stdout is source of truth; enforced by audit tooling. |
| **Discipline** | Session-injected **behavior** | Habitual rules injected into every session via hooks; ambient operating practice. |

**Tagline:** Governance defines what is correct. Discipline defines what is habitual.

**Implementation status:** Implemented. Standards ship under `governances/` with CLI `governance list` and `governance show`. Session discipline (`commit-discipline`) is unchanged.

### Governance content boundaries

Governances are **loaded into agent context** via `governance show`. They must encode **what is correct**, not background reading. Illustrative material belongs elsewhere.

| Artifact | Role | Loaded via `governance show`? |
| --- | --- | --- |
| **`governances/*.md`** | Version-pinned **standards** — requirements, archetypes, anti-patterns | Yes |
| **`docs/research/*.md`** | **Evidence** — repo surveys, reference implementations, RFC/issue links | No — repo checkout only |
| **`docs/adr/*.md`** | **Decisions** — rationale, options considered, consequences | No — repo checkout only |

**In governances, include:**

- Normative rules (must / should / do not)
- Structural templates that define layout (for example directory trees for an archetype)
- Cross-governance loads via `governance show` commands in `## References` only (per [ADR-0003](0003-agent-first-authoring.md))

**In governances, exclude:**

- Reference repo catalogs (`anthropics/skills`, `trailofbits/skills`, …)
- Ecosystem surveys and issue-thread summaries
- Illustrative “for example” repo links and long worked examples
- Rationale prose and `## Why`-style sections (`## Rationale`, `## Background`, `## Context`)
- Links to repository files (ADRs, research, other governances as paths)

**Where to put excluded content:**

- Reference implementations and repo surveys → [`docs/research/`](../research/README.md) (for example [2026-05-skill-ecosystem-landscape.md](../research/2026-05-skill-ecosystem-landscape.md))
- Policy decisions and trade-offs → ADRs (this directory)
- Authoring reminder → [`governances/README.md`](../../governances/README.md)

When research informs a governance, extract the **rule** into the governance and keep the **evidence** in research. ADRs and research link **to** governances; governances do not link back to repo paths. Do not let rules and evidence diverge silently.

## Rationale

Option 3 resolves the naming collision without forcing awkward phrasing on either layer. Governance accurately describes what `audit-skill` does with canonical stdout from `skill-design` and `agent-tool-output`. Discipline accurately describes what `commit-discipline` and `init-commit-discipline` enforce — habitual agent behavior, not organizational compliance.

Option 1 was a reasonable v1 shortcut but does not scale as more standards and session disciplines are added. Option 2 over-corrects toward enterprise policy language and fits poorly for session habits.

## Consequences

### Positive

- Removes ambiguity between load-on-demand standards and always-on behavior.
- Gives audit and authoring workflows a precise vocabulary (governance).
- Preserves natural language for commit hooks (discipline).
- Provides a stable conceptual model aligned with CLI and directory names.
- Keeps agent-loaded governances lean; surveys and examples do not compete with rules for context window space.

### Negative

- Contributors must learn two terms instead of one.
- Breaking change for consumers of `discipline list|show` (hard break; no alias).

### Risks

- None outstanding for the standards-layer rename.

## Implementation Notes

Completed rename (breaking change):

- Renamed `disciplines/` → `governances/`, `src/discipline/` → `src/governance/`, CLI `discipline` → `governance`.
- Updated skills, tests, `package.json` `files`, and AGENTS.md references.
- No deprecated alias — `discipline list|show` removed.
- **Unchanged:** `commit-discipline` hook name, `init-commit-discipline` skill name, AGENTS.md "Commit Discipline" heading.

CLI:

```bash
npx cyber-skills@<version> governance list
npx cyber-skills@<version> governance show skill-design
```

## Related Decisions

- [ADR-0003: Agent-first Authoring](0003-agent-first-authoring.md) — dense, self-contained Governance, Discipline, and Skill docs; references at end
- [ADR-0002: External Governance Federation](0002-external-governance-federation.md) — federation deferred; domain governances co-located until npm packages exist
- Research: [2026-05-skill-ecosystem-landscape.md](../research/2026-05-skill-ecosystem-landscape.md) — reference implementations for `skill-repo-structure` (not duplicated in governance)
