import { expect, test } from 'vitest'
import type { Marketplace } from './marketplace.js'
import { mapSkillsToPlugins } from './marketplace.js'

test('mapSkillsToPlugins maps skill name from path', () => {
	const m: Marketplace = {
		plugins: [{ name: 'discovery', description: '', skills: ['./skills/find-awesome-skill'] }],
	}
	expect(mapSkillsToPlugins(m).get('find-awesome-skill')).toBe('discovery')
})

test('mapSkillsToPlugins handles multiple plugins', () => {
	const m: Marketplace = {
		plugins: [
			{ name: 'a', description: '', skills: ['./skills/commit'] },
			{ name: 'b', description: '', skills: ['./skills/audit-skill'] },
		],
	}
	const map = mapSkillsToPlugins(m)
	expect(map.get('commit')).toBe('a')
	expect(map.get('audit-skill')).toBe('b')
})

test('mapSkillsToPlugins first plugin wins for duplicates', () => {
	const m: Marketplace = {
		plugins: [
			{ name: 'first', description: '', skills: ['./skills/audit-skill'] },
			{ name: 'second', description: '', skills: ['./skills/audit-skill'] },
		],
	}
	expect(mapSkillsToPlugins(m).get('audit-skill')).toBe('first')
})

test('mapSkillsToPlugins returns empty map for no plugins', () => {
	expect(mapSkillsToPlugins({ plugins: [] }).size).toBe(0)
})

test('mapSkillsToPlugins strips trailing slash from path', () => {
	const m: Marketplace = {
		plugins: [{ name: 'g', description: '', skills: ['skills/my-skill/'] }],
	}
	expect(mapSkillsToPlugins(m).get('my-skill')).toBe('g')
})
