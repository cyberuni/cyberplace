# ADR-0003: Agent-first Authoring

## Status

Accepted

## Context

[ADR-0001](0001-governance-vs-discipline-taxonomy.md) requires governances to stay **normative and concise** because they load into agent context via `governance show`. That policy covers version-pinned standards only. It does not name **Discipline** (AGENTS.md sections injected by hooks) or **Skill** (`SKILL.md`) explicitly, and it does not define a shared document shape.

Three artifact types share the same primary reader — an LLM agent executing instructions — but authors still mix tutorials, mid-document links, and background prose into normative bodies. Agents waste context window space and may follow links before completing the workflow.

## Decision Drivers

- **Agent context efficiency** — every token in Governance, Discipline, and Skill docs competes with code and task context.
- **Self-contained execution** — agents complete the workflow without opening linked files; agent-facing artifacts must not link to other repository files.
- **Consistent shape** — one structural template across artifact types reduces author drift.
- **Optional depth** — ADRs, research, sibling skill files, and cross-governance loads remain available without bloating the body.

## Considered Options

### Option 1: Extend ADR-0001 only

Add Skill and Discipline notes to ADR-0001 governance content boundaries.

- **Pros**: No new ADR; single taxonomy doc.
- **Cons**: ADR-0001 is about naming and load models; authoring style is a separate concern; harder to find for skill authors.

### Option 2: Agent-first doctrine in skill-design only

Encode rules only in the skill-design governance.

- **Pros**: Loaded on demand when authoring skills.
- **Cons**: Governance and Discipline authors never see it unless they also load skill-design; no single cross-cutting decision record.

### Option 3: ADR-0003 + governance enforcement (chosen)

Record the cross-cutting decision in ADR-0003; enforce per artifact in governances and public init skills.

- **Pros**: Clear doctrine; each artifact type has actionable rules in the doc authors already load; ADR explains why.
- **Cons**: Two places to maintain (ADR rationale + governance rules) — mitigated by extracting rules into governances and linking back.

## Decision

Adopt **agent-first authoring** for all Governance, Discipline, and Skill documents:

| Term | Meaning |
| --- | --- |
| **Agent-first** | Primary reader is an LLM agent executing the doc, not a human browsing for context |
| **Dense and concise** | Imperative rules; no tutorials, surveys, or "why we chose X" prose in the body |
| **Self-contained** | Agent completes the workflow from this document alone — **no links to other repository files** (ADRs, research, other governances as paths). Load related standards via `governance show` stdout, not checkout paths. |
| **References at end** | Optional `## References` after normative content — `governance show` commands, external HTTPS URLs, and skill-sibling files (`reference.md` in the same skill folder) only |
| **No rationale sections** | Do not include `## Why`, `## Rationale`, `## Background`, or `## Context` sections. One-line **scope** ("Apply when…") is allowed; causal explanation ("because agents parse stdout…") is not. Rationale belongs in ADRs; evidence belongs in research. |

**Document structure template:**

```markdown
# Title
## Scope / When to apply   # 1–3 lines
## Rules / Workflow        # normative body — must / should / do not
## Anti-patterns           # optional, short
## References              # governance show, external URLs, skill-sibling files — no repo file paths
```

### Per artifact type

| Artifact | Location | Agent-first rules |
| --- | --- | --- |
| **Governance** | `governances/*.md` | Normative rules in body. **No repository file links.** Cross-governance loads via `governance show` commands in `## References` only. External HTTPS URLs allowed. |
| **Discipline** | AGENTS.md sections (e.g. `## Commit Discipline`) | Habitual rules in body; commit-helper skill names and `governance show` one-liners in `### References`. **No repository file links.** Never paste full governance bodies. |
| **Skill** | `SKILL.md` (public `skills/`) | Workflow in body; `reference.md` / `examples.md` (same skill folder) and `governance show` commands in `## References` only. **No links to other repository files.** |

**Out of scope for agent-first restructuring:** ADRs and `docs/research/` remain contributor-facing evidence and decisions (per ADR-0001). Repo-internal skills under `.agents/skills/` are not updated by this ADR.

## Rationale

Option 3 separates the **why** (ADR) from the **what** (governances, init skills) without forcing skill authors to read taxonomy ADRs. References-at-end keeps mid-workflow link-chasing out of agent context while preserving optional depth for stuck agents.

## Consequences

### Positive

- Unified authoring doctrine across Governance, Discipline, and Skill.
- Governances model the pattern they require (refactored as exemplars).
- Discipline injection (`commit inject`) and init skills encode the same shape.

### Negative

- Existing docs need periodic refactor when they accumulate mid-body links.
- "References at end" is not mechanically linted in v1.

### Risks

- Authors may treat References as optional and omit required cross-governance loads — mitigated by audit-skill and skill-design text stating when to load related governances.

## Implementation Notes

- Refactor `governances/skill-design.md`, `governances/skill-repo-structure.md`, and `governances/agent-tool-output.md` as exemplars — remove all `## Why` sections and rationale prose; move glossary tables out of governance bodies.
- Split cyber-skills CLI output patterns out of `governances/agent-tool-output.md` into [ADR-0004](0004-cyber-skills-cli-output.md).
- Update `skills/init-commit-discipline/SKILL.md`, `skills/init/SKILL.md`, and `src/commit/content.ts` for Discipline section shape.
- Align [ADR-0001](0001-governance-vs-discipline-taxonomy.md) governance content boundaries with this ADR (no ADR/research path links in governances).
- Add governance load tests and audit-skill Q13 to catch rationale sections in shipped artifacts.
- Cross-link from `governances/README.md`, `AGENTS.md`, and `docs/research/README.md`.

## Related Decisions

- [ADR-0001: Governance vs Discipline Taxonomy](0001-governance-vs-discipline-taxonomy.md) — load models and governance content boundaries
- [ADR-0002: External Governance Federation](0002-external-governance-federation.md) — federation deferred; domain governances co-located until npm packages exist
- [ADR-0004: cyber-skills CLI Output Architecture](0004-cyber-skills-cli-output.md) — three CLI output archetypes; package-specific patterns moved out of governance
