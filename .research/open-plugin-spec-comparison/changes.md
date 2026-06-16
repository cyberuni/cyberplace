# Changes — Open Plugin Spec Comparison

## 2026-06-01 — Initial research

- **What changed**: First investigation.
- **Why**: User request to use open-plugin-spec as a base and compare it to all popular agent runtimes, clearly showing how each runtime differs from the spec.
- **Conclusion change**: N/A (initial).
- **Triggered by**: User request after plugin-schema research was completed.

## 2026-06-01 — Added OIAP as real-world implementation reference

- **What changed**: Added E-CMP-09 (OIAP as existing implementation). Added OIAP section to conclusion's recheck triggers.
- **Why**: OIAP independently solves the same problem and its design choices (snake_case events, 8-event minimal set, TypeScript-first, capability model) are relevant design alternatives worth tracking.
- **Conclusion changes**: Added "Notable real-world implementation: OIAP" section documenting key design differences and confirming the design space is viable.
- **Triggered by**: User pointing to https://github.com/fboldo/oiap.
- **Method**: Fetched open-plugin-spec v1.0.0 in full from GitHub; fetched Claude Code and Cursor JSON Schemas directly; combined with prior plugin-schema research findings for Codex, Copilot CLI, Windsurf, Zed, Continue.dev, and Cline.
