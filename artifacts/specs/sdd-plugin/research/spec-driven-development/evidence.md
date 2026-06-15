# Evidence Log: SDD Tools & Approaches

## E01 — SDD definition (Böckeler/Thoughtworks)

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: Thoughtworks blog + Martin Fowler site
- URL: https://www.thoughtworks.com/en-us/insights/blog/agile-engineering-practices/spec-driven-development-unpacking-2025-new-engineering-practices
- Type: Thought-leader / practitioner
- Notes: Defines three rigor levels (spec-first, spec-anchored, spec-as-source). Leaves spec-vs-code authority unresolved. Most widely cited taxonomy.

## E02 — Academic treatment (arxiv:2602.00180)

- Date: February 2026
- Status: Confirmed
- Confidence: Medium (academic; not peer-reviewed in major venue yet)
- Source: arxiv
- URL: https://arxiv.org/html/2602.00180v1
- Type: Research paper
- Notes: First academic paper named "Spec-Driven Development." Frames TDD as SDD at unit level. BDD as most direct ancestor. MDD parallel flagged as risk.

## E03 — GitHub Spec Kit (~90k stars)

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: GitHub
- URL: https://github.com/github/spec-kit
- Type: Open-source repository
- Notes: GitHub-backed. 7-phase pipeline. 30+ agent integrations. EARS notation. Install via uvx.

## E04 — Amazon Kiro

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: Official docs
- URL: https://kiro.dev/docs/specs/
- Type: Official documentation
- Notes: VS Code fork. 3 spec files (requirements/design/tasks). Parallel task waves. EARS-native. Launched August 2025. Free (50 credits/month).

## E05 — BMAD-METHOD (~47k stars)

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: GitHub
- URL: https://github.com/bmad-code-org/BMAD-METHOD
- Type: Open-source repository
- Notes: 21+ AI personas simulate agile team roles. 42 platform integrations. Docs-as-code markdown. Heavier setup than spec-kit/OpenSpec.

## E06 — OpenSpec (~4k stars)

- Date: June 2026
- Status: Confirmed
- Confidence: Medium
- Source: GitHub
- URL: https://github.com/Fission-AI/OpenSpec
- Type: Open-source repository
- Notes: Brownfield-first. Delta markers (ADDED/MODIFIED/REMOVED). 3-phase state machine. ~250 lines vs ~800 for spec-kit. npm install.

## E07 — cc-sdd (Claude Code native)

- Date: June 2026
- Status: Confirmed
- Confidence: Medium (smaller project, fewer independent references)
- Source: GitHub
- URL: https://github.com/gotalab/cc-sdd
- Type: Open-source repository
- Notes: 17 agent skills. EARS-based. TDD loop (RED→GREEN→REVIEW). Auto-debug on test failure. Most comprehensive Claude Code SDD harness found.

## E08 — alfredoperez/sdd (Claude Code plugin)

- Date: June 2026
- Status: Confirmed
- Confidence: Medium
- Source: GitHub
- URL: https://github.com/alfredoperez/sdd
- Type: Open-source Claude Code plugin
- Notes: 4-phase pipeline. Auto-skips planning for small changes (≤3 files, <10 lines). State persistence via `.spec-context.json`.

## E09 — ai-dev-tasks (zero-install)

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: GitHub
- URL: https://github.com/snarktank/ai-dev-tasks
- Type: Open-source repository
- Notes: 3 markdown prompt files. No CLI, no install. Works with any AI IDE. Maximum portability.

## E10 — Tessl (spec-as-source)

- Date: June 2026
- Status: Unverified (closed beta)
- Confidence: Low
- Source: Martin Fowler site + Tessl docs
- URL: https://tessl.io/registry/tessl-labs/spec-driven-development
- Type: Commercial platform + thought-leader writeup
- Notes: Only tool actively pursuing spec-as-source level. Tag-annotated markdown tiles. MCP-native. No public case studies yet.

## E11 — EARS notation origin

- Date: June 2026
- Status: Confirmed
- Confidence: High
- Source: Alistair Mavin
- URL: https://alistairmavin.com/ears/
- Type: Primary source (original author)
- Notes: Easy Approach to Requirements Syntax. IEEE RE'09. Aerospace origin (Rolls-Royce). Now adopted by Kiro, cc-sdd, spec-kit.

## E12 — MDD parallel risk

- Date: June 2026
- Status: Confirmed as concern (not as outcome)
- Confidence: Medium
- Source: Martin Fowler site + arxiv paper
- URL: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- Type: Thought-leader analysis
- Notes: Both sources draw explicit parallel. MDD failed due to abstraction overhead and rigid code generators. LLMs reduce some constraints but add non-determinism. Outcome for SDD genuinely uncertain.

## E13 — Spec-to-code validation gap

- Date: June 2026
- Status: Confirmed as gap
- Confidence: High
- Source: Research synthesis (no single source)
- URL: https://specmatic.io
- Type: Gap analysis
- Notes: Only Specmatic validates implementation against spec, and only for OpenAPI/AsyncAPI contracts. No equivalent exists for markdown-based SDD specs. Active research gap.
