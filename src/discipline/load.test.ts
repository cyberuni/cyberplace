import { expect, test } from 'vitest'

import { listDisciplines, loadDiscipline } from './load.js'

test('listDisciplines includes agent-tool-output', () => {
	const names = listDisciplines().map((d) => d.name)
	expect(names).toContain('agent-tool-output')
})

test('loadDiscipline returns markdown body with title', () => {
	const discipline = loadDiscipline('agent-tool-output')
	expect(discipline.title).toBe('Agent Tool Output')
	expect(discipline.body).toMatch(/Stdout is the machine contract/)
})

test('loadDiscipline rejects unknown name', () => {
	expect(() => loadDiscipline('not-a-real-discipline')).toThrow(/Unknown discipline/)
})

test('loadDiscipline rejects invalid name characters', () => {
	expect(() => loadDiscipline('../escape')).toThrow(/Invalid discipline name/)
})
