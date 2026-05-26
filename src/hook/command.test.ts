import { expect, test } from 'vitest'

import { commandMatchesHook, hookCommand, sameHookTarget } from './command.js'

const expected =
	"npx cyber-skills@2.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"

test('hookCommand pins npx without --yes by default', () => {
	const cmd = hookCommand('hook run --name test', '/tmp/nonexistent-root')
	expect(cmd).toMatch(/^npx cyber-skills@/)
	expect(cmd).not.toContain('--yes')
})

test('hookCommand adds --yes when npxYes is set', () => {
	const cmd = hookCommand('hook run --name test', '/tmp/nonexistent-root', { npxYes: true })
	expect(cmd).toMatch(/^npx --yes cyber-skills@/)
})

test('commandMatchesHook treats missing npx --yes as upgrade when expected has it', () => {
	const existing =
		"npx cyber-skills@1.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	const expectedWithYes =
		"npx --yes cyber-skills@1.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"
	expect(commandMatchesHook(existing, 'commit-discipline', expectedWithYes)).toBe(false)
	expect(commandMatchesHook(expectedWithYes, 'commit-discipline', expectedWithYes)).toBe(true)
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
