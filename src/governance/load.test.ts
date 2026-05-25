import { expect, test } from 'vitest'

import { listGovernances, loadGovernance, normalizeGovernanceName } from './load.js'

test('listGovernances includes agent-tool-output and skill-design', () => {
	const names = listGovernances().map((d) => d.name)
	expect(names).toContain('agent-tool-output')
	expect(names).toContain('skill-design')
})

test('loadGovernance returns markdown body with title', () => {
	const governance = loadGovernance('agent-tool-output')
	expect(governance.title).toBe('Agent Tool Output')
	expect(governance.body).toMatch(/Stdout is the machine contract/)
})

test('loadGovernance normalizes name casing and separators', () => {
	const governance = loadGovernance('Agent_Tool_Output')
	expect(governance.name).toBe('agent-tool-output')
	expect(governance.title).toBe('Agent Tool Output')
})

test('loadGovernance loads skill-design', () => {
	const governance = loadGovernance('skill-design')
	expect(governance.title).toBe('Skill Design')
	expect(governance.body).toMatch(/Progressive disclosure/)
})

test('normalizeGovernanceName trims whitespace and lowercases', () => {
	expect(normalizeGovernanceName(' agent-tool-output ')).toBe('agent-tool-output')
	expect(normalizeGovernanceName('Agent-Tool-Output')).toBe('agent-tool-output')
	expect(normalizeGovernanceName('agent_tool_output')).toBe('agent-tool-output')
})

test('normalizeGovernanceName collapses repeated hyphens', () => {
	expect(normalizeGovernanceName('agent--tool--output')).toBe('agent-tool-output')
})

test('loadGovernance rejects unknown name', () => {
	expect(() => loadGovernance('not-a-real-governance')).toThrow(/Unknown governance/)
})

test('loadGovernance rejects invalid name characters', () => {
	expect(() => loadGovernance('../escape')).toThrow(/Invalid governance name/)
	expect(() => normalizeGovernanceName('')).toThrow(/Invalid governance name/)
})
