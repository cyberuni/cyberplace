import { expect, test } from 'vitest'

import { commandMatchesHook, sameHookTarget } from './command.js'

const expected =
	"npx cyber-skills@2.0.0 hook run --name commit-discipline --extract AGENTS.md --heading 'Commit Discipline'"

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
