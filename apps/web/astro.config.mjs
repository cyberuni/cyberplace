// @ts-check
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
	integrations: [
		starlight({
			title: 'cyber-skills',
			description: 'Opinionated skills, hooks, and workflows for AI agents — Claude Code, Cursor, Codex, and others.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/cyberuni/cyber-skills' },
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Supply Chain', slug: 'getting-started/supply-chain' },
					],
				},
				{
					label: 'Skills',
					items: [
						{ label: 'Overview', slug: 'skills/overview' },
						{ label: 'init', slug: 'skills/init' },
						{ label: 'init-commit-discipline', slug: 'skills/init-commit-discipline' },
						{ label: 'commit', slug: 'skills/commit' },
						{ label: 'create-skill', slug: 'skills/create-skill' },
						{ label: 'audit-skill', slug: 'skills/audit-skill' },
					],
				},
				{
					label: 'CLI Reference',
					items: [
						{ label: 'Overview', slug: 'cli/overview' },
						{ label: 'audit', slug: 'cli/audit' },
						{ label: 'governance', slug: 'cli/governance' },
						{ label: 'hook', slug: 'cli/hook' },
						{ label: 'skill', slug: 'cli/skill' },
					],
				},
				{
					label: 'Governances',
					items: [
						{ label: 'Overview', slug: 'governances/overview' },
						{ label: 'Skill Design', slug: 'governances/skill-design' },
						{ label: 'Skill Repo Structure', slug: 'governances/skill-repo-structure' },
						{ label: 'Agent Tool Output', slug: 'governances/agent-tool-output' },
						{ label: 'CLI Resolution', slug: 'governances/cli-resolution' },
						{ label: 'Universal Plugin', slug: 'governances/universal-plugin' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Agent Configuration', slug: 'concepts/agent-configuration' },
						{ label: 'Commands', slug: 'concepts/commands' },
					],
				},
				{
					label: 'Disciplines',
					items: [
						{ label: 'Commit Discipline', slug: 'disciplines/commit-discipline' },
					],
				},
			],
		}),
	],
})
