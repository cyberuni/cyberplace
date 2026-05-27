import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { commandMatchesHook, hookCommand, sameHookTarget } from './command.js'

const npxExpected =
	"npx cyber-skills@2.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
const pnpmExpected =
	"pnpm exec cyber-skills hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-hook-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

test('hookCommand uses npx when no lock file present', () => {
	const cmd = hookCommand('hook run --name test', root)
	expect(cmd).toMatch(/^npx cyber-skills@/)
	expect(cmd).not.toContain('--yes')
})

test('hookCommand uses pnpm exec when pnpm-lock.yaml present', () => {
	fs.writeFileSync(path.join(root, 'pnpm-lock.yaml'), '')
	const cmd = hookCommand('hook run --name test', root)
	expect(cmd).toBe('pnpm exec cyber-skills hook run --name test')
})

test('hookCommand uses yarn exec when yarn.lock present', () => {
	fs.writeFileSync(path.join(root, 'yarn.lock'), '')
	const cmd = hookCommand('hook run --name test', root)
	expect(cmd).toBe('yarn exec cyber-skills hook run --name test')
})

test('hookCommand uses bunx when bun.lock present', () => {
	fs.writeFileSync(path.join(root, 'bun.lock'), '')
	const cmd = hookCommand('hook run --name test', root)
	expect(cmd).toBe('bunx cyber-skills hook run --name test')
})

test('hookCommand uses bunx when bun.lockb present', () => {
	fs.writeFileSync(path.join(root, 'bun.lockb'), ''), fs.writeFileSync(path.join(root, 'bun.lockb'), '')
	const cmd = hookCommand('hook run --name test', root)
	expect(cmd).toBe('bunx cyber-skills hook run --name test')
})

test('sameHookTarget returns false for missing command', () => {
	expect(sameHookTarget(undefined, 'commit-discipline', npxExpected)).toBe(false)
	expect(sameHookTarget(null, 'commit-discipline', npxExpected)).toBe(false)
})

test('commandMatchesHook returns false for missing command', () => {
	expect(commandMatchesHook(undefined, 'commit-discipline', npxExpected)).toBe(false)
	expect(commandMatchesHook(null, 'commit-discipline', npxExpected)).toBe(false)
})

test('commandMatchesHook still compares semver for valid commands', () => {
	const existing =
		"npx cyber-skills@1.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', npxExpected)).toBe(false)
})

test('commandMatchesHook returns false when existing is npx and expected is pm exec', () => {
	const existing =
		"npx cyber-skills@2.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', pnpmExpected)).toBe(false)
})

test('commandMatchesHook returns false when existing is pm exec and expected is npx', () => {
	const existing =
		"pnpm exec cyber-skills hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', npxExpected)).toBe(false)
})

test('commandMatchesHook returns false when pm exec prefix differs', () => {
	const existing =
		"yarn exec cyber-skills hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', pnpmExpected)).toBe(false)
})

test('commandMatchesHook returns true for matching pm exec commands', () => {
	expect(commandMatchesHook(pnpmExpected, 'commit-discipline', pnpmExpected)).toBe(true)
})
