# Spec-Driven Development — Existing Tools & Approaches (June 2026)

## Question

What popular spec-driven development (SDD) skills, plugins, and tools exist, and how do they approach the spec→implementation pipeline?

## Scope

In scope:
- SDD methodology definitions and schools of thought
- Open-source CLI tools, frameworks, and agent skills
- Claude Code plugins and skills specifically
- Commercial platforms with SDD workflows
- Common spec formats and notations
- Pre-AI API-first / contract-first tooling (historical lineage)

Out of scope:
- Deep implementation analysis of any single tool
- BDD-only tools (Cucumber, SpecFlow) unless directly relevant to SDD
- Non-AI-assisted development workflows

## Source angles

- Academic / thought-leader definitions (Thoughtworks, Martin Fowler, arxiv)
- GitHub repositories with high star counts and SDD in name/description
- Claude Code plugin ecosystem
- Commercial SDD platforms (Kiro, Tessl, Zenflow, Augment Code)
- Pre-AI lineage (OpenAPI-first, contract-first, BDD)

## Findings

### Methodology Definition

SDD emerged in mid-2025 as a named reaction to "vibe coding." Core idea: spec and code are co-delivered — a builder works from their angle of expertise and uses AI to generate spec, code (including tests), and product from that angle. The spec is both input to and output of AI-assisted building. IBM defines it as using "well-crafted software requirement specifications as prompts, aided by AI coding agents, to generate executable code."

Three rigor levels (Böckeler/Thoughtworks taxonomy, widely cited):
- **Spec-first**: Spec guides initial build, discarded after code ships
- **Spec-anchored**: Spec persists alongside code, evolves with system (mainstream)
- **Spec-as-source**: Spec is only human-edited artifact; code always generated (Tessl only)

### Pipeline Patterns

**Pattern A — Linear Phase Gates** (spec-kit, Kiro, BMAD):
```
Specify → Plan/Design → Tasks → Implement → Validate
```
Human review at each phase boundary.

**Pattern B — Iterative Loop** (OpenSpec):
```
Propose → Review → Implement → Archive → repeat
```
Change-scoped; delta markers track changes against baseline.

**Pattern C — Living Spec** (Tessl, Intent/Augment):
```
Spec ↔ Implement ↔ Spec auto-updates ↔ Validate
```
Bidirectional synchronization; spec regenerated from code when drift detected.

**Pattern D — Agent Skills Harness** (cc-sdd, alfredoperez/sdd):
```
Discovery → EARS Requirements → Design → Tasks → TDD (RED→GREEN→REVIEW)
```
Installable skills; agents pick up where humans left off; per-task independent review.

**Pattern E — Zero-Install Markdown** (ai-dev-tasks):
```
PRD prompt file → Task generation prompt → Task execution prompt
```
No tooling; pure markdown prompt files as repo assets.

**Pattern F — Co-Delivery (multi-angle)** (practitioner model):
```
Builder (one angle) → spec + code + tests → MR
Other angles → contribute to spec before/after MR → improved spec + code
```
Spec and implementation are submitted together, not sequentially. A feature has multiple angles (product, design, engineering, security, etc.); no single builder covers all angles. The MR is the integration point where builders from other angles improve the spec and code. The spec is both input to and output of AI-assisted building.

### Common Spec Formats

- **Markdown** — universal base medium for all tools
- **EARS notation** ("WHEN X THE SYSTEM SHALL Y") — Kiro, cc-sdd; aerospace origin (Alistair Mavin, IEEE RE'09)
- **User stories** — Kiro, spec-kit; combined with EARS for acceptance criteria
- **Gherkin / Given-When-Then** — BDD origin; carried into SDD acceptance criteria
- **OpenAPI / AsyncAPI** — API-first SDD; Specmatic, OpenAPI Generator
- **Tag-annotated markdown** (`@generate`, `@test`) — Tessl tiles; 1:1 mapping to code files

### Relationship to Prior Paradigms

| Practice | Relationship |
|---|---|
| TDD | "TDD is SDD at the unit level"; SDD scales TDD discipline to systems |
| BDD | Most direct ancestor; Gherkin carries forward into acceptance criteria |
| API-first | Subsumed by SDD; API contracts are one artifact type within larger spec |
| MDD | Direct historical parallel; LLMs reduce abstraction overhead but add non-determinism |
| Waterfall | Superficially similar but spec is living/versioned, not locked upfront |

## Contradictions

- **Spec vs. code as source of truth**: Radical SDD says spec; conservative (Thoughtworks) says code. No consensus. Tessl is the only tool betting on spec-as-source in production.
- **Semantic diffusion**: "Spec-driven development" conflated with any structured prompting. BMAD uses identical workflows but calls itself "Agile AI Driven Development."
- **MDD risk parallel**: Martin Fowler's team draws explicit parallel to Model-Driven Development failure. Whether LLMs avoid MDD's fate via flexibility is genuinely uncertain.

## Open questions

- Are there patterns for spec-to-code *validation* beyond running tests? (Only Specmatic does this for API contracts; nothing equivalent for markdown SDD specs.)
- How do teams handle spec drift on long-lived projects with static-spec tools?
- What spec format and pipeline pattern best fits this project's domain?

## Sources consulted

- [Martin Fowler — Understanding SDD: Kiro, spec-kit, and Tessl](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [arxiv:2602.00180 — Spec-Driven Development: From Code to Contract](https://arxiv.org/html/2602.00180v1)
- [GitHub Blog — spec-driven development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Thoughtworks — Spec-driven development unpacking 2025](https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices)
- [github/spec-kit](https://github.com/github/spec-kit)
- [gotalab/cc-sdd](https://github.com/gotalab/cc-sdd)
- [alfredoperez/sdd](https://github.com/alfredoperez/sdd)
- [SpillwaveSolutions/sdd-skill](https://github.com/SpillwaveSolutions/sdd-skill)
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [snarktank/ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks)
- [buildermethods/agent-os](https://github.com/buildermethods/agent-os)
- [Kiro documentation](https://kiro.dev/docs/specs/)
- [Tessl SDD tile registry](https://tessl.io/registry/tessl-labs/spec-driven-development)
- [Zenflow by Zencoder](https://zencoder.ai/zenflow)
- [Augment Code — 6 Best SDD Tools](https://www.augmentcode.com/tools/best-spec-driven-development-tools)
- [BCMS — Spec-Driven Development: The Definitive 2026 Guide](https://thebcms.com/blog/spec-driven-development)
- [Specmatic](https://specmatic.io/comparisons/specmatic-vs-pact-io-and-pactflow-io/)
- [EARS notation — Alistair Mavin](https://alistairmavin.com/ears/)
