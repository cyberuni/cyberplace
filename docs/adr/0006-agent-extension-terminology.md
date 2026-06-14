# ADR-0006: "Agent Extension" as Cross-Layer Unifying Term

## Status

Accepted

## Context

The LAIA SDD ([`docs/specs/2026-05-layered-augmentation-sdd.md`](../specs/2026-05-layered-augmentation-sdd.md)) defines an extension system for AI agents. The system covers two fundamentally different add-on types:

- **Instruction-based** — markdown files that tell an agent how to think or act (e.g. SKILL.md)
- **Code-based** — executable servers or functions that give an agent new runtime abilities (e.g. MCP servers)

Both types extend agent behavior beyond what the base model provides. The SDD needs a single neutral term to refer to both without privileging either type.

A [nomenclature survey](../research/2026-05-agent-extension-nomenclature.md) (May 2026) found that the community has settled on a three-layer hierarchy rather than a single unifying term:

| Term | Layer | Primary users |
|---|---|---|
| **skill** | Instruction-based add-on (SKILL.md) | agentskills.io, Claude Code, Cursor, Codex, Gemini CLI, Copilot, LangChain, 30+ platforms |
| **tool** | Callable function at runtime | MCP, LangChain, CrewAI, AutoGen, AG2 |
| **plugin** | Distribution bundle (wraps skills + tools) | open-plugin-spec, Anthropic Claude Code |

No single cross-layer term has achieved community adoption. The closest candidates and their problems:

- **"extension"** — firmly owned by VS Code IDE tooling; adopting it conflicts with established vocabulary
- **"capability"** — used by CrewAI as an umbrella but also by MCP as a protocol-negotiation term; ambiguous
- **"agent extension"** — appears in descriptive prose (e.g. open-plugin-spec's subtitle) but is not a formal term anywhere

## Decision Drivers

- The SDD needs a single term to reason about the augmentation layer system without repeatedly writing "skill or plugin."
- The term must be neutral across the instruction/code axis.
- Coining a term is acceptable for a spec document, provided the relationship to established community terms is documented.

## Considered Options

### Option 1: Use "plugin" as the umbrella

Align with open-plugin-spec and Anthropic's layered model: plugin is the distribution unit, skill and tool are subtypes.

- **Pros**: Matches existing community usage; no new term needed.
- **Cons**: "Plugin" specifically means the distribution bundle, not an individual add-on; it conflates packaging with capability.

### Option 2: Coin "agent extension" as the umbrella (deliberate)

Define "agent extension" as a cross-layer unifying term for the spec. Document its relationship to skill/tool/plugin explicitly.

- **Pros**: Neutral across instruction/code axis; no existing term is displaced; "agent extension" has descriptive precedent in prose; the three-layer hierarchy is preserved underneath.
- **Cons**: Not an established term; spec readers must learn one additional concept.

### Option 3: Use "capability" as the umbrella

Follow CrewAI's model: capability is the umbrella with subtypes.

- **Pros**: Used by at least one major platform.
- **Cons**: MCP uses "capabilities" for protocol negotiation; Anthropic uses it to describe model-level abilities (vision, tool-use); ambiguous in two directions.

## Decision

**Option 2.** Coin "agent extension" as the spec-level umbrella term for any add-on that extends an AI agent's behavior beyond what the base model provides — regardless of whether it is instruction-based or code-based.

The three-layer community hierarchy (skill / tool / plugin) is preserved and documented as the implementation vocabulary beneath the umbrella:

```
agent extension          ← spec-level umbrella (this ADR)
├── skill                ← instruction-based extension (SKILL.md format)
├── tool                 ← code-based callable function (MCP, function registration)
└── plugin               ← distribution unit (bundles skills + tools)
```

"Agent extension" is used when the distinction between skill and tool is irrelevant — e.g. "the augmentation layer applies to any agent extension." When the distinction matters, the specific term is used.

## Rationale

The spec purpose is academic: defining an augmentation model that applies regardless of whether the underlying extension is a skill or a tool. Forcing the reader to mentally substitute "skill or plugin" throughout degrades clarity. Coining a neutral umbrella is the right trade-off for a spec document.

"Agent extension" is chosen over "capability" because it has no conflicting prior definition in the spaces this spec targets (MCP, Claude Code, agentskills). It is chosen over bare "extension" to avoid the VS Code IDE collision.

The deliberate nature of the coinage is documented here so future contributors know it is intentional and can trace the decision back to this ADR.

## Consequences

### Positive

- SDD prose is cleaner; no repeated "skill or plugin" hedging.
- Relationship to community terms is explicit and traceable.
- The spec can propose "agent extension" as a formal term to agentskills and open-plugin-spec in the upstream proposal (D7).

### Negative

- One more term for spec readers to learn on entry.
- If the community later adopts a different umbrella term, this spec will need a terminology update.

### Risks

- Low: "agent extension" could be adopted by a major platform with an incompatible definition before the upstream proposal lands. Mitigation: file D7 promptly.

## Related Decisions

- [ADR-0001](0001-governance-vs-discipline-taxonomy.md) — governance vs discipline taxonomy (prior terminology decision)
- [ADR-0005](0005-skill-taxonomy.md) — skill taxonomy (defines skill subtypes)
