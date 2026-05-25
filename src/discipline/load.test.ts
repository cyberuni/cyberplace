import { expect, test } from 'vitest'

import { listDisciplines, loadDiscipline, normalizeDisciplineName } from './load.js'

test('listDisciplines includes agent-tool-output and skill-design', () => {
	const names = listDisciplines().map((d) => d.name)
	expect(names).toContain('agent-tool-output')
	expect(names).toContain('skill-design')
})

test('loadDiscipline returns markdown body with title', () => {
	const discipline = loadDiscipline('agent-tool-output')
	expect(discipline.title).toBe('Agent Tool Output')
	expect(discipline.body).toMatch(/Stdout is the machine contract/)
})

test('loadDiscipline normalizes name casing and separators', () => {
	const discipline = loadDiscipline('Agent_Tool_Output')
	expect(discipline.name).toBe('agent-tool-output')
	expect(discipline.title).toBe('Agent Tool Output')
})

test('loadDiscipline loads skill-design', () => {
	const discipline = loadDiscipline('skill-design')
	expect(discipline.title).toBe('Skill Design')
	expect(discipline.body).toMatch(/Progressive disclosure/)
})

test('normalizeDisciplineName trims whitespace and lowercases', () => {
	expect(normalizeDisciplineName(' agent-tool-output ')).toBe('agent-tool-output')
	expect(normalizeDisciplineName('Agent-Tool-Output')).toBe('agent-tool-output')
	expect(normalizeDisciplineName('agent_tool_output')).toBe('agent-tool-output')
})

test('normalizeDisciplineName collapses repeated hyphens', () => {
	expect(normalizeDisciplineName('agent--tool--output')).toBe('agent-tool-output')
})

test('loadDiscipline rejects unknown name', () => {
	expect(() => loadDiscipline('not-a-real-discipline')).toThrow(/Unknown discipline/)
})

test('loadDiscipline rejects invalid name characters', () => {
	expect(() => loadDiscipline('../escape')).toThrow(/Invalid discipline name/)
	expect(() => normalizeDisciplineName('')).toThrow(/Invalid discipline name/)
})
