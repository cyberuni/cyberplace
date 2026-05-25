import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { commandMatchesHook } from './command.js'
import { registerHook } from './register.js'

function withTempRoot(setup: (root: string) => void, check: (root: string) => void): void {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'register-hooks-'))
	try {
		setup(root)
		check(root)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
}

function readJson(filePath: string): unknown {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

test('skips all agents when no agent dirs exist', () => {
	withTempRoot(
		(_root) => {},
		(root) => {
			const results = registerHook(
				{ name: 'local-augmentations', event: 'SessionStart', glob: '.agents/skills/**/SKILL.local.md' },
				{ root },
			)
			expect(results.every((r) => r.status === 'skipped (dir not found)')).toBe(true)
		},
	)
})

test('registers SessionStart glob hook on Claude Code', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.claude')),
		(root) => {
			const results = registerHook(
				{ name: 'local-augmentations', event: 'SessionStart', glob: '.agents/skills/**/SKILL.local.md' },
				{ root },
			)
			const session = results.find((r) => r.agent === 'Claude Code')
			expect(session?.status).toBe('registered')

			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { SessionStart: Array<{ hooks: Array<{ command: string }> }> }
			}
			const command = settings.hooks.SessionStart[0]?.hooks[0]?.command ?? ''
			expect(command).toContain('hook run')
			expect(command).toContain('--name local-augmentations')
			expect(command).toContain('--glob')
			expect(command).toContain('SKILL.local.md')
		},
	)
})

test('registers extract hook on Claude Code', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.claude')),
		(root) => {
			const results = registerHook(
				{
					name: 'commit-discipline',
					event: 'SessionStart',
					extract: 'AGENTS.md',
					heading: 'Commit Discipline',
				},
				{ root },
			)
			const session = results.find((r) => r.agent === 'Claude Code')
			expect(session?.status).toBe('registered')

			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { SessionStart: Array<{ hooks: Array<{ command: string }> }> }
			}
			const command = settings.hooks.SessionStart[0]?.hooks[0]?.command ?? ''
			expect(command).toContain('--extract AGENTS.md')
			expect(command).toContain('--heading')
			expect(command).toContain('Commit Discipline')
		},
	)
})

test('upgrades legacy inject-local-augmentations shell hook', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.claude'))
			fs.writeFileSync(
				path.join(root, '.claude', 'settings.json'),
				JSON.stringify({
					hooks: {
						SessionStart: [
							{ hooks: [{ type: 'command', command: 'bash .agents/hooks/inject-local-augmentations.sh' }] },
						],
					},
				}),
			)
		},
		(root) => {
			const results = registerHook(
				{ name: 'local-augmentations', event: 'SessionStart', glob: '.agents/skills/**/SKILL.local.md' },
				{ root },
			)
			expect(results.find((r) => r.agent === 'Claude Code')?.status).toBe('registered')

			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { SessionStart: Array<{ hooks: Array<{ command: string }> }> }
			}
			const command = settings.hooks.SessionStart[0]?.hooks[0]?.command ?? ''
			expect(command).toContain('hook run')
			expect(command).toContain('--name local-augmentations')
		},
	)
})

test('matches hooks by --name and input flags', () => {
	const expected =
		"npx cyber-skills@1.0.0 hook run --name local-augmentations --glob '.agents/skills/**/SKILL.local.md'"
	const existing =
		"npx cyber-skills@1.0.0 hook run --name local-augmentations --glob '.agents/skills/**/SKILL.local.md'"
	expect(commandMatchesHook(existing, 'local-augmentations', expected)).toBe(true)
	expect(
		commandMatchesHook(
			"npx cyber-skills@1.0.0 hook run --name other --glob '.agents/skills/**/SKILL.local.md'",
			'local-augmentations',
			expected,
		),
	).toBe(false)
})

test('does not treat different semver as equivalent', () => {
	const expected =
		"npx cyber-skills@2.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	const existing =
		"npx cyber-skills@1.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', expected)).toBe(false)
})

test('upgrades pinned semver in Cursor sessionStart hook', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.cursor'))
			fs.writeFileSync(
				path.join(root, '.cursor', 'hooks.json'),
				JSON.stringify({
					version: 1,
					hooks: {
						sessionStart: [
							{
								command:
									"npx cyber-skills@0.1.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'",
							},
						],
					},
				}),
			)
		},
		(root) => {
			const results = registerHook(
				{
					name: 'commit-discipline',
					event: 'SessionStart',
					extract: 'AGENTS.md',
					heading: 'Commit Discipline',
				},
				{ root },
			)
			expect(results.find((r) => r.agent === 'Cursor')?.status).toBe('registered')

			const settings = readJson(path.join(root, '.cursor', 'hooks.json')) as {
				hooks: { sessionStart: Array<{ command: string }> }
			}
			const command = settings.hooks.sessionStart[0]?.command ?? ''
			expect(command).toContain('npx cyber-skills@')
			expect(command).not.toContain('@0.1.0')
			expect(settings.hooks.sessionStart.length).toBe(1)
		},
	)
})

test('does not clobber unrelated Claude Code settings', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.claude'))
			fs.writeFileSync(
				path.join(root, '.claude', 'settings.json'),
				JSON.stringify({
					model: 'claude-opus-4-7',
					permissions: { allow: ['Bash'] },
					hooks: {},
				}),
			)
		},
		(root) => {
			registerHook(
				{ name: 'local-augmentations', event: 'SessionStart', glob: '.agents/skills/**/SKILL.local.md' },
				{ root },
			)
			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				model: string
				permissions: { allow: string[] }
			}
			expect(settings.model).toBe('claude-opus-4-7')
			expect(settings.permissions.allow).toEqual(['Bash'])
		},
	)
})

test('registers Cursor sessionStart hook', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.cursor')),
		(root) => {
			const results = registerHook(
				{ name: 'local-augmentations', event: 'SessionStart', glob: '.agents/skills/**/SKILL.local.md' },
				{ root },
			)
			expect(results.find((r) => r.agent === 'Cursor')?.status).toBe('registered')

			const settings = readJson(path.join(root, '.cursor', 'hooks.json')) as {
				version: number
				hooks: { sessionStart: Array<{ command: string }> }
			}
			expect(settings.hooks.sessionStart.some((h) => h.command.includes('--name local-augmentations'))).toBe(true)
		},
	)
})

test('dry-run writes no files', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.claude'))
			fs.mkdirSync(path.join(root, '.cursor'))
		},
		(root) => {
			const results = registerHook(
				{ name: 'local-augmentations', event: 'SessionStart', glob: '.agents/skills/**/SKILL.local.md' },
				{ root, dryRun: true },
			)
			expect(results.some((r) => r.status === 'registered')).toBe(true)
			expect(fs.existsSync(path.join(root, '.claude', 'settings.json'))).toBe(false)
			expect(fs.existsSync(path.join(root, '.cursor', 'hooks.json'))).toBe(false)
		},
	)
})

test('running twice produces no duplicate hooks', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.claude')),
		(root) => {
			const input = {
				name: 'local-augmentations',
				event: 'SessionStart' as const,
				glob: '.agents/skills/**/SKILL.local.md',
			}
			registerHook(input, { root })
			registerHook(input, { root })
			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { SessionStart: Array<{ hooks: unknown[] }> }
			}
			expect(settings.hooks.SessionStart[0]?.hooks.length).toBe(1)
		},
	)
})
