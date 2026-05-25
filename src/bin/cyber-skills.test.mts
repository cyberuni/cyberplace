import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

const bin = path.resolve('bin/cyber-skills.mjs')

function run(...args: string[]) {
	return spawnSync('node', [bin, ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

test('prints help when no arguments given', () => {
	const result = run()
	const output = result.stdout + result.stderr
	expect(output).toMatch(/cyber-skills/)
})

test('prints error for unknown command', () => {
	const result = run('unknown-command')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/unknown command/)
})

test('hook run exits non-zero for unknown hook name', () => {
	const result = run('hook', 'run', 'nonexistent-hook')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/Unknown hook/)
})

test('hook register requires --set', () => {
	const result = run('hook', 'register')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/--set/)
})

test('commit inject requires --commit-skill', () => {
	const result = run('commit', 'inject')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/commit-skill/)
})

test('skill source requires a skill name', () => {
	const result = run('skill', 'source')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/missing required argument/)
})

test('skill source returns JSON for a skill in repo lock', () => {
	const root = path.resolve('.')
	const result = run('skill', 'source', 'audit-skill', '--json', '--root', root)
	expect(result.status).toBe(0)
	const parsed = JSON.parse(result.stdout)
	expect(parsed.name).toBe('audit-skill')
	expect(parsed.source).toBe('cyberuni/cyber-skills')
	expect(parsed.foundIn).toBe('repo')
})

test('skill source exits non-zero for unknown skill', () => {
	const result = run('skill', 'source', 'definitely-does-not-exist-xyz', '--json')
	expect(result.status).toBe(1)
	const parsed = JSON.parse(result.stdout)
	expect(parsed.foundIn).toBeNull()
})

test('hook run commit-discipline emits SessionStart JSON', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-hook-'))
	try {
		fs.writeFileSync(path.join(root, 'AGENTS.md'), '## Commit Discipline\n\n- Custom rule\n')
		const result = spawnSync('node', [bin, 'hook', 'run', 'commit-discipline'], {
			cwd: root,
			encoding: 'utf8',
			input: '{}',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const payload = JSON.parse(result.stdout.trim()) as {
			hookSpecificOutput: { hookEventName: string; additionalContext: string }
		}
		expect(payload.hookSpecificOutput.hookEventName).toBe('SessionStart')
		expect(payload.hookSpecificOutput.additionalContext).toContain('Custom rule')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})
