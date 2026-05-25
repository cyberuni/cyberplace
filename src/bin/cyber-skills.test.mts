import { spawnSync } from 'node:child_process'
import * as path from 'node:path'
import { expect, test } from 'vitest'

const bin = path.resolve('bin/cyber-skills.mjs')

function run(...args: string[]) {
	return spawnSync('node', [bin, ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

test('prints usage when no arguments given', () => {
	const result = run()
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/Usage/)
})

test('prints usage for unknown command', () => {
	const result = run('unknown-command')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/Unknown command/)
})

test('run-hook exits non-zero for unknown hook name', () => {
	const result = run('run-hook', 'nonexistent-hook')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/not found/)
})

test('register-hooks requires --set', () => {
	const result = run('register-hooks')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/register-hooks/)
})

test('inject-commit-discipline requires --commit-skill', () => {
	const result = run('inject-commit-discipline')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/commit-skill/)
})

test('skill-source requires a skill name', () => {
	const result = run('skill-source')
	expect(result.status).toBe(1)
	expect(result.stderr).toMatch(/skill-source/)
})

test('skill-source returns JSON for a known global skill', () => {
	const result = run('skill-source', 'setup-github-repo')
	const parsed = JSON.parse(result.stdout)
	expect(parsed.name).toBe('setup-github-repo')
	expect(parsed.source).toBeTruthy()
	expect(parsed.foundIn).toMatch(/repo|global|npx-skills/)
})

test('skill-source exits non-zero for unknown skill', () => {
	const result = run('skill-source', 'definitely-does-not-exist-xyz')
	expect(result.status).toBe(1)
	const parsed = JSON.parse(result.stdout)
	expect(parsed.foundIn).toBeNull()
})
