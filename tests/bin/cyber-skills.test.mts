import { spawnSync } from 'node:child_process'
import * as path from 'node:path'
import { expect, test } from 'vitest'

const bin = path.resolve('bin/cyber-skills.mts')

function run(...args: string[]) {
	return spawnSync('node', ['--experimental-strip-types', bin, ...args], {
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
