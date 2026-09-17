import { expect, test } from 'vitest'

import { listGovernances, loadGovernance, normalizeGovernanceName } from './load.js'
import { MOVED_GOVERNANCES, movedGovernance, movedGovernanceNotice } from './moved.js'

test('listGovernances includes universal-plugin', () => {
	const names = listGovernances().map((d) => d.name)
	expect(names).toContain('universal-plugin')
})

test('listGovernances omits every moved governance', () => {
	const names = listGovernances().map((d) => d.name)
	for (const moved of Object.keys(MOVED_GOVERNANCES)) {
		expect(names, moved).not.toContain(moved)
	}
})

test('loadGovernance returns markdown body with title', () => {
	const governance = loadGovernance('universal-plugin')
	expect(governance.title).toBe('Universal Plugin Format')
	expect(governance.body).toMatch(/maintained by the/)
})

test('loadGovernance normalizes name casing and separators', () => {
	const governance = loadGovernance('Universal_Plugin')
	expect(governance.name).toBe('universal-plugin')
	expect(governance.title).toBe('Universal Plugin Format')
})

test('normalizeGovernanceName trims whitespace and lowercases', () => {
	expect(normalizeGovernanceName(' universal-plugin ')).toBe('universal-plugin')
	expect(normalizeGovernanceName('Universal-Plugin')).toBe('universal-plugin')
	expect(normalizeGovernanceName('universal_plugin')).toBe('universal-plugin')
})

test('normalizeGovernanceName collapses repeated hyphens', () => {
	expect(normalizeGovernanceName('universal--plugin')).toBe('universal-plugin')
})

test('loadGovernance rejects unknown name', () => {
	expect(() => loadGovernance('not-a-real-governance')).toThrow(/Unknown governance/)
})

test('loadGovernance rejects invalid name characters', () => {
	expect(() => loadGovernance('../escape')).toThrow(/Invalid governance name/)
	expect(() => normalizeGovernanceName('')).toThrow(/Invalid governance name/)
})

test('loadGovernance no longer ships a moved governance', () => {
	for (const moved of Object.keys(MOVED_GOVERNANCES)) {
		expect(() => loadGovernance(moved), moved).toThrow(/Unknown governance/)
	}
})

test('movedGovernance names the owner and where to read it', () => {
	const moved = movedGovernance('skill-design')
	expect(moved?.owner).toBe('cyber-aced')
	expect(moved?.source).toMatch(/^https:\/\//)
})

test('movedGovernance returns undefined for a governance that stays', () => {
	expect(movedGovernance('universal-plugin')).toBeUndefined()
})

test('the moved notice is one line naming the governance, the owner and the source', () => {
	const moved = movedGovernance('cli-resolution')
	if (!moved) throw new Error('cli-resolution should be a moved governance')
	const notice = movedGovernanceNotice('cli-resolution', moved)
	expect(notice).not.toMatch(/\n/)
	expect(notice).toContain('cli-resolution')
	expect(notice).toContain('cyber-aced')
	expect(notice).toContain(moved.source)
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
