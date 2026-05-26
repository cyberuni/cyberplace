import { expect, test } from 'vitest'

import { commandMatchesHook, hookCommand, sameHookTarget } from './command.js'

const expected =
	"npx cyber-skills@2.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"

test('hookCommand pins npx without --yes', () => {
	const cmd = hookCommand('hook run --name test', '/tmp/nonexistent-root')
	expect(cmd).toMatch(/^npx cyber-skills@/)
	expect(cmd).not.toContain('--yes')
})

test('sameHookTarget returns false for missing command', () => {
	expect(sameHookTarget(undefined, 'commit-discipline', expected)).toBe(false)
	expect(sameHookTarget(null, 'commit-discipline', expected)).toBe(false)
})

test('commandMatchesHook returns false for missing command', () => {
	expect(commandMatchesHook(undefined, 'commit-discipline', expected)).toBe(false)
	expect(commandMatchesHook(null, 'commit-discipline', expected)).toBe(false)
})

test('commandMatchesHook still compares semver for valid commands', () => {
	const existing =
		"npx cyber-skills@1.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', expected)).toBe(false)
})
