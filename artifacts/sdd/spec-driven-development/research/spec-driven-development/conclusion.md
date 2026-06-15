# Conclusion: Existing SDD Tools & Approaches

## Last updated

June 2026

## Question

What popular spec-driven development (SDD) skills, plugins, and tools exist, and how do they approach the spec→implementation pipeline?

## Verdict

SDD is a real and rapidly maturing practice (emerged mid-2025) with a clear mainstream and several diverging schools. The mainstream consensus is **spec-anchored development**: spec and code are co-delivered — a builder works from their angle of expertise and submits spec + code together in an MR; builders from other angles contribute before and after to improve both. The spec lifecycle is iterative and collaborative, not a sequential gate. Most tools encode this as markdown spec files (`requirements.md`, `design.md`, `tasks.md`) living alongside code, with 3–7 phase pipelines that are angle-scoped rather than blocking. EARS notation ("WHEN X THE SYSTEM SHALL Y") is the dominant requirement format. Most tools target Claude Code as a primary integration surface.

The dominant open-source tools are GitHub Spec Kit (~90k stars), BMAD-METHOD (~47k stars), and OpenSpec. For Claude Code specifically, cc-sdd is the most comprehensive native harness (17 skills, TDD loop, auto-debug). The most experimental bet — spec-as-source where code is always generated — is pursued only by Tessl (closed beta).

## Tool comparison

| Tool | Type | Pipeline | Claude Code | Cost |
|---|---|---|---|---|
| GitHub Spec Kit | CLI + slash cmds | 7-phase gated | Slash commands | Free |
| Amazon Kiro | IDE | 3-phase + parallel | Yes | Free/paid |
| BMAD-METHOD | Framework | Agile persona simulation | Yes | Free |
| OpenSpec | CLI | Propose→Apply→Archive | Slash commands | Free |
| cc-sdd | Skills harness | Discovery→EARS→Design→Tasks→TDD | Native (17 skills) | Free |
| alfredoperez/sdd | Claude plugin | specify→plan→tasks→implement | Native | Free |
| ai-dev-tasks | Markdown prompts | PRD→tasks→execute | Any | Free |
| Tessl | Platform | Spec↔Code bidirectional | MCP | Closed beta |
| Zenflow | Desktop app | Spec→parallel impl→cross-verify | Yes | Free/paid |
| Intent (Augment) | Desktop app | Coordinator→specialists→living spec | Yes | $60/mo |

## Confidence

**High** for tool landscape and pipeline patterns. **Medium** for market adoption claims (star counts may not reflect active usage). **Low** for long-term viability of spec-as-source paradigm.

## Strongest supporting evidence

- Multiple independent sources (Thoughtworks, Martin Fowler, GitHub Blog, arxiv) converge on the same methodology definition and tool categorization.
- GitHub star counts and install documentation confirm tool maturity.
- EARS notation has independent aerospace/academic origin (IEEE RE'09) — not invented by SDD toolmakers.

## Contradictions and weakening evidence

- **Co-delivery vs. sequential gate**: Practitioner experience shows spec, code, and product are co-delivered — a builder works from one angle and submits both together. Several tools (spec-kit, Kiro) enforce phase-gated pipelines that imply spec must be "Approved" before implementation. This tension is real: gated tools are valuable for governance but can misrepresent the underlying workflow.
- No consensus on whether spec or code is the authoritative source of truth. The most credible voices (Thoughtworks, Martin Fowler) explicitly leave this unresolved.
- MDD parallel is a genuine risk: Model-Driven Development had similar promises in the 2000s and largely failed for business applications. LLMs reduce some constraints but add non-determinism. Whether SDD avoids MDD's fate is unknown.
- "Spec-driven development" is semantically diluted — used for anything from structured prompting to full spec-as-source generation.

## What is not supported

- No evidence of mature spec-to-code validation (proving implementation matches spec) beyond running tests — only Specmatic does this for API contracts.
- No evidence of mainstream adoption for spec-as-source level (Tessl still closed beta, no public case studies).
- Long-lived project spec drift remains an unsolved problem for all static-spec tools.

## Where evidence is thin

- Actual team adoption patterns and failure modes (most writing is by tool authors, not neutral practitioners)
- Brownfield SDD — most tools optimize for greenfield; OpenSpec is the exception
- Non-TypeScript/JavaScript ecosystems — tool ecosystem is heavily JS/TS-biased

## Check again later

- Tessl public launch and first real-world case studies
- Whether GitHub Spec Kit or Kiro establish EARS as a de facto standard
- spec-to-code validation tooling — active research gap
