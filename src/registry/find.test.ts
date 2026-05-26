import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { findSkills, findSkillsInRepo } from './find.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-find-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
	vi.restoreAllMocks()
})

const awesomeData = [
	{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
	{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
	{ name: 'create-skill', skillPath: 'skills/create-skill/SKILL.md' },
]

test('findSkills returns all skills when query is empty', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(awesomeData) }))

	const results = await findSkills('', { root })
	expect(results.length).toBeGreaterThanOrEqual(3)
})

test('findSkills filters by query string', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(awesomeData) }))

	const results = await findSkills('commit', { root })
	expect(results.some((r) => r.name === 'commit')).toBe(true)
	expect(results.every((r) => r.name.includes('commit'))).toBe(true)
})

test('findSkills includes install command', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(awesomeData) }))

	const results = await findSkills('commit', { root })
	expect(results[0]!.installCommand).toContain('npx cyber-skills add')
	expect(results[0]!.installCommand).toContain('commit')
})

test('findSkills returns empty array when fetch fails', async () => {
	vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

	const results = await findSkills('commit', { root })
	expect(results).toEqual([])
})

test('findSkillsInRepo searches a specific repo', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(awesomeData) }))

	const results = await findSkillsInRepo('repobuddy/repobuddy', '')
	expect(results.length).toBeGreaterThanOrEqual(1)
	expect(results[0]!.source).toBe('repobuddy/repobuddy')
	expect(results[0]!.installCommand).toContain('repobuddy/repobuddy')
})

test('findSkillsInRepo returns empty for non-repo spec', async () => {
	const results = await findSkillsInRepo('@org/pkg', '')
	expect(results).toEqual([])
})
