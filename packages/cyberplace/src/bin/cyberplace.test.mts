import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

const bin = path.resolve('bin/cyberplace.mjs')

function run(...args: string[]) {
	return spawnSync('node', [bin, ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

test('prints help when no arguments given', () => {
	const result = run()
	const output = result.stdout + result.stderr
	expect(output).toMatch(/cyberplace/)
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

test('governance list includes agent-tool-output', () => {
	const result = run('governance', 'list')
	expect(result.status).toBe(0)
	expect(result.stdout.trim().split('\n')).toContain('agent-tool-output')
})

test('governance list --json returns structured output', () => {
	const result = run('governance', 'list', '--json')
	expect(result.status).toBe(0)
	const parsed = JSON.parse(result.stdout) as { governances: { name: string; title: string }[] }
	expect(parsed.governances.some((d) => d.name === 'agent-tool-output')).toBe(true)
})

test('governance show prints markdown body', () => {
	const result = run('governance', 'show', 'agent-tool-output')
	expect(result.status).toBe(0)
	expect(result.stdout).toMatch(/# Agent Tool Output/)
	expect(result.stdout).toMatch(/Stdout is the machine contract/)
})

test('governance show accepts normalized name input', () => {
	const result = run('governance', 'show', 'Agent-Tool-Output')
	expect(result.status).toBe(0)
	expect(result.stdout).toMatch(/# Agent Tool Output/)
	expect(result.stdout).toMatch(/Stdout is the machine contract/)
})

test('governance list includes skill-design', () => {
	const result = run('governance', 'list')
	expect(result.status).toBe(0)
	expect(result.stdout.trim().split('\n')).toContain('skill-design')
})

test('governance show --json returns structured output', () => {
	const result = run('governance', 'show', 'agent-tool-output', '--json')
	expect(result.status).toBe(0)
	const parsed = JSON.parse(result.stdout) as { name: string; title: string; body: string }
	expect(parsed.name).toBe('agent-tool-output')
	expect(parsed.body).toMatch(/Agent Tool Output/)
})

test('governance show unknown name exits non-zero', () => {
	const result = run('governance', 'show', 'missing-governance')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/Unknown governance/)
})
