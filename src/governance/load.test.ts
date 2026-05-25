import { expect, test } from 'vitest'

import { listGovernances, loadGovernance, normalizeGovernanceName } from './load.js'

test('listGovernances includes agent-tool-output and skill-design', () => {
	const names = listGovernances().map((d) => d.name)
	expect(names).toContain('agent-tool-output')
	expect(names).toContain('skill-design')
	expect(names).toContain('skill-repo-structure')
})

test('loadGovernance returns markdown body with title', () => {
	const governance = loadGovernance('agent-tool-output')
	expect(governance.title).toBe('Agent Tool Output')
	expect(governance.body).toMatch(/Stdout is the machine contract/)
	expect(governance.body).not.toMatch(/cyber-skills package patterns/)
	expect(governance.body).toMatch(/Default-stdout exception/)
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

test('loadGovernance loads skill-repo-structure', () => {
	const governance = loadGovernance('skill-repo-structure')
	expect(governance.title).toBe('Skill Repo Structure')
	expect(governance.body).toMatch(/Repo archetypes/)
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

test('shipped governances exclude rationale sections', () => {
	for (const { name } of listGovernances()) {
		const governance = loadGovernance(name)
		expect(governance.body, name).not.toMatch(/^## Why/m)
		expect(governance.body, name).not.toMatch(/^## Rationale/m)
		expect(governance.body, name).not.toMatch(/^## Background/m)
		expect(governance.body, name).not.toMatch(/^## Context/m)
	}
})
