# Examples

Canonical `.plugin/plugin.json` files showing how real plugins would look in the universal format.

Each example represents what an author would write as the single source of truth. The `build` command would generate vendor-specific manifests from it.

## research-workbench

A real multi-runtime plugin by [cyberuni](https://github.com/cyberuni/research-workbench). Durable research workflows with topic-centric workspaces and conclusion-first consumption.

- Source: https://github.com/cyberuni/research-workbench
- Components: `skills/`, `hooks/hooks.json` (SessionStart)
- Vendor extensions: Claude Code adds `governances` and `assets` directory pointers

## Claude Code

Plugins from the [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) marketplace.

| Example | Description | Source |
|---|---|---|
| `claude-code/code-review` | Automated PR review using multiple specialized agents with confidence-based scoring | [code-review](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review) |
| `claude-code/feature-dev` | Feature development workflow with agents for exploration, architecture, and quality review | [feature-dev](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) |
| `claude-code/github` | Official GitHub MCP server — issues, PRs, code review, repository management | [github (external)](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/github) |

## Cursor

Plugins from the [Cursor marketplace](https://cursor.com/marketplace).

| Example | Description | Source |
|---|---|---|
| `cursor/stripe` | Stripe payment integration with best practices, API upgrade guidance, and test environment access | https://cursor.com/marketplace/stripe |
| `cursor/figma` | Translates Figma designs into code via Code Connect template files | https://cursor.com/marketplace/figma |
| `cursor/datadog` | Datadog monitoring, logging, and observability tools via natural conversation | https://cursor.com/marketplace/datadog |

## Codex

Plugins from the [OpenAI Codex plugin directory](https://developers.openai.com/codex/plugins).

| Example | Description | Source |
|---|---|---|
| `codex/google-drive` | Read and write across Google Drive, Docs, Sheets, and Slides | https://developers.openai.com/codex/plugins |
| `codex/gmail` | Read and manage Gmail — filter threads, summarize, compose drafts | https://developers.openai.com/codex/plugins |
| `codex/security-review` | Vulnerability detection and security analysis for authorized codebases | https://developers.openai.com/codex/plugins |

## GitHub Copilot CLI

Plugins from [github/awesome-copilot](https://github.com/github/awesome-copilot).

| Example | Description | Source |
|---|---|---|
| `copilot-cli/terraform` | Terraform IaC specialist — registry integration, workspace management, compliant code generation | [terraform.agent.md](https://github.com/github/awesome-copilot/blob/main/agents/terraform.agent.md) |
| `copilot-cli/dependabot` | Dependency update management across Docker, Python, and other ecosystems | [skills/dependabot](https://github.com/github/awesome-copilot/blob/main/skills/dependabot/SKILL.md) |
| `copilot-cli/python-pypi` | End-to-end Python library build, test, version, and PyPI publish workflow | [skills/python-pypi-package-builder](https://github.com/github/awesome-copilot/blob/main/skills/python-pypi-package-builder/SKILL.md) |
