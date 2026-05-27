# CLI output format for agents (May 2026)

Background research informing how `cyber-skills` CLI should format output for agent consumers. Relevant to `agent-tool-output` governance and [ADR-0004](../adr/0004-cyber-skills-cli-output.md).

## Question

What CLI output format actually works best for AI agent (LLM) consumption in practice?

## Findings

### JSON hurts agent reasoning

- Tam et al. (2024): JSON mode caused **10–15% performance degradation** on reasoning tasks vs free-form text.
- `{"sentiment":"positive"}` uses ~40% more tokens than "The sentiment is positive."
- LLMs occasionally emit near-valid JSON that breaks parse steps — active production issue in langchain and pydantic-ai.
- MCP community discussion [#529](https://github.com/orgs/modelcontextprotocol/discussions/529): pro-text camp argues text has lower error rate and requires no conversion step; the model was trained on text.

### Text and Markdown win for agent reasoning

- Webex Developer benchmarks: Markdown improves RAG retrieval accuracy **20–35%** vs HTML/plain text.
- Markdown cuts token usage up to **80%** vs HTML for equivalent content.
- LLMs are trained heavily on Markdown — they read it natively.
- DEV.to post "The Case for Markdown as Your Agent's Task Format" and aiquinta.ai analysis both conclude: Markdown for skill definitions and agent-facing output.

### JSON wins for machine-to-machine handoff

- Schema enforcement for pipeline steps, DB inserts, non-LLM consumers.
- MCP spec (2025-06-18) added `structuredContent` field for this; **recommends** also emitting a `TextContent` fallback for backwards compatibility.

### Verbosity is the #1 real-world failure mode

- Large JSON blobs overflow context or get blocked by clients.
- Nearform: "Tool responses should be concise — JSON or small well-formatted Markdown fragments. Large payloads risk context limits. Paginate or summarize."
- Microsoft Azure SRE Agent team: started with 100+ tools with verbose outputs; had to consolidate because it created a "policy manual" prompt problem.

### STDIO transport rule

- Any stray text to stdout corrupts the JSON-RPC stream.
- Logs and diagnostics must go to **stderr**.

### CLI-as-tool vs MCP

- Pulumi blog (2026): A well-designed CLI invoked via bash can be **10–32× cheaper** on context than MCP, because MCP tool definitions persist in the system prompt.
- The `--help` output quality matters directly — it is the tool description the agent reads.

### Emerging consensus (2025–2026)

Enterprise and framework authors (Nearform, aiquinta.ai, MCP spec authors) converge on a **layered approach**:

- **Agent-reasoning layer**: Markdown or structured plain text
- **Machine-execution layer**: JSON — flat schema, explicit types, no `$ref`/`oneOf`, max 3–4 fields, text fallback alongside

## Format matrix

| Situation | Format |
| --- | --- |
| Agent reads + reasons about result | Plain text or Markdown |
| Non-LLM code parses result | Flat JSON |
| Both consumers | JSON with `TextContent` fallback |
| High-volume pipelines | TOON or TSV |
| Large payloads | Paginate or summarize |
| Skill / instruction files | Markdown |
| STDIO MCP transport | Never print to stdout (use stderr for logs) |

## Naming implication

`--json` describes **format**, not **purpose**. Alternatives that communicate intent:

| Flag | Style |
| --- | --- |
| `--format json` / `--format text` | Explicit, flexible |
| `--machine` | Purpose-based |
| `--porcelain` | Git-style; well-known for machine-stable output |
| `--structured` | Intent-based |

## Decision

`--format json` adopted as the machine-output flag for all dual-audience `cyber-skills` CLI commands. `--json` kept as a hidden backward-compat alias. See [ADR-0004](../adr/0004-cyber-skills-cli-output.md).

## Sources

- [Should the MCP service return natural language or JSON · Discussion #529](https://github.com/orgs/modelcontextprotocol/discussions/529)
- [Implementing MCP: Tips, tricks and pitfalls — Nearform](https://nearform.com/digital-community/implementing-model-context-protocol-mcp-tips-tricks-and-pitfalls/)
- [Tools — Model Context Protocol spec 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [Writing CLI Tools That AI Agents Actually Want to Use — DEV Community](https://dev.to/uenyioha/writing-cli-tools-that-ai-agents-actually-want-to-use-39no)
- [LLM Output Formats: Why JSON Costs More Than TSV — David Gilbertson](https://david-gilbertson.medium.com/llm-output-formats-why-json-costs-more-than-tsv-ebaf590bd541)
- [TOON vs JSON: Why AI Agents Need Token-Optimized Data Formats — jduncan.io (2025-11)](https://jduncan.io/blog/2025-11-11-toon-vs-json-agent-optimized-data/)
- [Markdown vs JSON for Agent Skills: Which Format Works Best? — aiquinta.ai](https://aiquinta.ai/blog/markdown-vs-json-for-agent-skills/)
- [Boosting AI Performance: LLM-Friendly Content in Markdown — Webex Developers](https://developer.webex.com/blog/boosting-ai-performance-the-power-of-llm-friendly-content-in-markdown)
- [How Building AI Agents Has Changed in 2026 — Pulumi Blog](https://www.pulumi.com/blog/how-building-ai-agents-has-changed/)
