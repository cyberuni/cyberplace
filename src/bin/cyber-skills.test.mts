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

test('hook run requires an instruction source', () => {
	const result = run('hook', 'run')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/exactly one of --file, --glob, or --extract/i)
})

test('hook register requires --name and instruction source', () => {
	const result = run('hook', 'register')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/--name/)
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

test('skill list lists init companion skills', () => {
	const result = run('skill', 'list', '--grep', 'init-*', '--json')
	expect(result.status).toBe(0)
	const parsed = JSON.parse(result.stdout) as { name: string; description: string; foundIn: string }[]
	expect(parsed.some((s) => s.name === 'init-commit-discipline')).toBe(true)
	expect(parsed.every((s) => s.name.startsWith('init-'))).toBe(true)
	expect(parsed.every((s) => s.foundIn)).toBe(true)
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

test('hook run --extract emits SessionStart JSON', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-hook-'))
	try {
		fs.writeFileSync(path.join(root, 'AGENTS.md'), '## Commit Discipline\n\n- Custom rule\n')
		const result = spawnSync('node', [bin, 'hook', 'run', '--extract', 'AGENTS.md', '--heading', 'Commit Discipline'], {
			cwd: root,
			encoding: 'utf8',
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

test('hook run --glob emits SessionStart JSON', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'glob-hook-'))
	try {
		const skillDir = path.join(root, '.agents', 'skills', 'demo-skill')
		fs.mkdirSync(skillDir, { recursive: true })
		fs.writeFileSync(path.join(skillDir, 'SKILL.local.md'), 'Use repo-specific commit rules.')
		const result = spawnSync('node', [bin, 'hook', 'run', '--glob', '.agents/skills/**/SKILL.local.md'], {
			cwd: root,
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const payload = JSON.parse(result.stdout.trim()) as {
			hookSpecificOutput: { hookEventName: string; additionalContext: string }
		}
		expect(payload.hookSpecificOutput.additionalContext).toContain('demo-skill')
		expect(payload.hookSpecificOutput.additionalContext).toContain('Use repo-specific commit rules.')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})
