# Disciplines

Versioned agent-tool contracts shipped with the `cyber-skills` npm package. Content is frozen to the installed package version.

## Consumption

Do not link to these files from SKILL.md. Load disciplines through the CLI:

```bash
# List available disciplines
npx cyber-skills@<version> discipline list

# Show discipline body (agents: read stdout)
npx cyber-skills@<version> discipline show agent-tool-output

# Structured output
npx cyber-skills@<version> discipline show agent-tool-output --json
```

Always pin an exact version from `npm view cyber-skills version`.

## Available disciplines

| Name | Purpose |
| ---- | ------- |
| `skill-design` | SKILL.md authoring — principles, progressive disclosure, deterministic extraction |
| `agent-tool-output` | Output rules for scripts, hooks, and CLIs that agents invoke |
