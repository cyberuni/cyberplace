import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { registerHooksForSet } from '../../hooks/register-agent-hooks.mts'

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
			const results = registerHooksForSet('init', { root })
			expect(results.every((r) => r.status === 'skipped (dir not found)')).toBe(true)
		},
	)
})

test('registers Claude Code hooks when .claude dir exists and settings.json is absent', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.claude')),
		(root) => {
			const results = registerHooksForSet('init', { root })
			const postToolUse = results.find((r) => r.agent === 'Claude Code' && r.hook.includes('mark-internal'))
			const sessionStart = results.find((r) => r.agent === 'Claude Code' && r.hook.includes('inject-local'))
			expect(postToolUse?.status).toBe('registered')
			expect(sessionStart?.status).toBe('registered')

			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: {
					PostToolUse: Array<{ matcher?: string; hooks: Array<{ command: string }> }>
					SessionStart: Array<{ hooks: Array<{ command: string }> }>
				}
			}
			expect(
				settings.hooks.PostToolUse[0]?.hooks.some((h) => h.command === 'bash .agents/hooks/mark-internal.sh'),
			).toBe(true)
			expect(
				settings.hooks.SessionStart[0]?.hooks.some(
					(h) => h.command === 'bash .agents/hooks/inject-local-augmentations.sh',
				),
			).toBe(true)
		},
	)
})

test('detects Claude Code hooks as already present when fully registered', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.claude'))
			fs.writeFileSync(
				path.join(root, '.claude', 'settings.json'),
				JSON.stringify({
					hooks: {
						PostToolUse: [
							{ matcher: 'Write|Edit', hooks: [{ type: 'command', command: 'bash .agents/hooks/mark-internal.sh' }] },
						],
						SessionStart: [
							{ hooks: [{ type: 'command', command: 'bash .agents/hooks/inject-local-augmentations.sh' }] },
						],
					},
				}),
			)
		},
		(root) => {
			const results = registerHooksForSet('init', { root })
			const claude = results.filter((r) => r.agent === 'Claude Code')
			expect(claude.every((r) => r.status === 'already present')).toBe(true)
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
			registerHooksForSet('init', { root })
			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				model: string
				permissions: { allow: string[] }
			}
			expect(settings.model).toBe('claude-opus-4-7')
			expect(settings.permissions.allow).toEqual(['Bash'])
		},
	)
})

test('merges into existing PostToolUse group with matching matcher', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.claude'))
			fs.writeFileSync(
				path.join(root, '.claude', 'settings.json'),
				JSON.stringify({
					hooks: {
						PostToolUse: [{ matcher: 'Write|Edit', hooks: [{ type: 'command', command: 'bash other.sh' }] }],
					},
				}),
			)
		},
		(root) => {
			registerHooksForSet('init', { root })
			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { PostToolUse: Array<{ matcher?: string; hooks: Array<{ command: string }> }> }
			}
			const group = settings.hooks.PostToolUse.find((g) => g.matcher === 'Write|Edit')
			expect(group?.hooks.some((h) => h.command === 'bash other.sh')).toBe(true)
			expect(group?.hooks.some((h) => h.command === 'bash .agents/hooks/mark-internal.sh')).toBe(true)
			expect(settings.hooks.PostToolUse.length).toBe(1)
		},
	)
})

test('registers Cursor hook when .cursor dir exists and hooks.json is absent', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.cursor')),
		(root) => {
			const results = registerHooksForSet('init', { root })
			const cursor = results.find((r) => r.agent === 'Cursor')
			expect(cursor?.status).toBe('registered')

			const settings = readJson(path.join(root, '.cursor', 'hooks.json')) as {
				version: number
				hooks: { afterFileEdit: Array<{ command: string }> }
			}
			expect(settings.version).toBe(1)
			expect(settings.hooks.afterFileEdit.some((h) => h.command === 'bash .agents/hooks/mark-internal.sh')).toBe(true)
		},
	)
})

test('registers commit-discipline SessionStart on Claude Code', () => {
	withTempRoot(
		(root) => fs.mkdirSync(path.join(root, '.claude')),
		(root) => {
			const results = registerHooksForSet('commit-discipline', { root })
			const session = results.find((r) => r.agent === 'Claude Code' && r.hook.includes('commit-discipline'))
			expect(session?.status).toBe('registered')

			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { SessionStart: Array<{ hooks: Array<{ command: string }> }> }
			}
			expect(settings.hooks.SessionStart[0]?.hooks.some((h) => h.command.includes('run-hook commit-discipline'))).toBe(
				true,
			)
		},
	)
})

test('dry-run: writes no files even when hooks are missing', () => {
	withTempRoot(
		(root) => {
			fs.mkdirSync(path.join(root, '.claude'))
			fs.mkdirSync(path.join(root, '.cursor'))
		},
		(root) => {
			const results = registerHooksForSet('init', { root, dryRun: true })
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
			registerHooksForSet('init', { root })
			registerHooksForSet('init', { root })
			const settings = readJson(path.join(root, '.claude', 'settings.json')) as {
				hooks: { PostToolUse: Array<{ hooks: unknown[] }>; SessionStart: Array<{ hooks: unknown[] }> }
			}
			expect(settings.hooks.PostToolUse[0]?.hooks.length).toBe(1)
			expect(settings.hooks.SessionStart[0]?.hooks.length).toBe(1)
		},
	)
})
