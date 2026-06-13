import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { findSkills, findSkillsInRepo, formatInstallCount } from './find.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-find-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
	vi.restoreAllMocks()
})

function makeMarketplaceResponse(count: number) {
	return {
		query: '',
		searchType: 'fuzzy',
		skills: Array.from({ length: count }, (_, i) => ({
			id: `cyberuni/cyber-skills/skill-${i}`,
			skillId: `skill-${i}`,
			name: `skill-${i}`,
			installs: (count - i) * 10,
			source: 'cyberuni/cyber-skills',
		})),
		count,
		duration_ms: 10,
	}
}

const marketplaceResponse = {
	query: '',
	searchType: 'fuzzy',
	skills: [
		{
			id: 'cyberuni/cyber-skills/commit',
			skillId: 'commit',
			name: 'commit',
			installs: 100,
			source: 'cyberuni/cyber-skills',
		},
		{
			id: 'cyberuni/cyber-skills/add-changeset',
			skillId: 'add-changeset',
			name: 'add-changeset',
			installs: 80,
			source: 'cyberuni/cyber-skills',
		},
		{
			id: 'cyberuni/cyber-skills/create-skill',
			skillId: 'create-skill',
			name: 'create-skill',
			installs: 60,
			source: 'cyberuni/cyber-skills',
		},
	],
	count: 3,
	duration_ms: 10,
}

const githubSkillsData = [
	{ name: 'commit', skillPath: 'skills/commit/SKILL.md' },
	{ name: 'add-changeset', skillPath: 'skills/add-changeset/SKILL.md' },
	{ name: 'create-skill', skillPath: 'skills/create-skill/SKILL.md' },
]

test('findSkills returns all skills when query is empty', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(marketplaceResponse) }))

	const results = await findSkills('', { root })
	expect(results.length).toBeGreaterThanOrEqual(3)
})

test('findSkills filters by query string', async () => {
	const filtered = { ...marketplaceResponse, skills: [marketplaceResponse.skills[0]!], count: 1 }
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(filtered) }))

	const results = await findSkills('commit', { root })
	expect(results.some((r) => r.name === 'commit')).toBe(true)
})

test('findSkills includes install command', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(marketplaceResponse) }))

	const results = await findSkills('commit', { root })
	expect(results[0]!.installCommand).toContain('npx cyber-skills add')
	expect(results[0]!.installCommand).toContain('commit')
})

test('findSkills includes installs and sorts by popularity', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(marketplaceResponse) }))

	const results = await findSkills('', { root })
	expect(results[0]!.installs).toBe(100)
	expect(results[0]!.name).toBe('commit')
	expect(results.at(-1)!.installs).toBe(60)
})

test('formatInstallCount uses compact notation', () => {
	expect(formatInstallCount(100)).toBe('100')
	expect(formatInstallCount(1200)).toBe('1.2K')
})

test('findSkills returns empty array when fetch fails', async () => {
	vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

	const results = await findSkills('commit', { root })
	expect(results).toEqual([])
})

test('findSkillsInRepo searches a specific repo', async () => {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(githubSkillsData) }))

	const results = await findSkillsInRepo('repobuddy/repobuddy', '')
	expect(results.length).toBeGreaterThanOrEqual(1)
	expect(results[0]!.source).toBe('repobuddy/repobuddy')
	expect(results[0]!.installCommand).toContain('repobuddy/repobuddy')
})

test('findSkillsInRepo returns empty for non-repo spec', async () => {
	const results = await findSkillsInRepo('@org/pkg', '')
	expect(results).toEqual([])
})

test('findSkills returns at most 10 results by default', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(makeMarketplaceResponse(15)) }),
	)

	const results = await findSkills('', { root })
	expect(results.length).toBe(10)
})

test('findSkills respects custom limit', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(makeMarketplaceResponse(15)) }),
	)

	const results = await findSkills('', { root, limit: 5 })
	expect(results.length).toBe(5)
})

test('findSkillsInRepo returns at most 10 results by default', async () => {
	const manySkills = Array.from({ length: 15 }, (_, i) => ({
		name: `skill-${i}`,
		skillPath: `skills/skill-${i}/SKILL.md`,
	}))
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(manySkills) }))

	const results = await findSkillsInRepo('repobuddy/repobuddy', '')
	expect(results.length).toBe(10)
})

test('findSkillsInRepo respects custom limit', async () => {
	const manySkills = Array.from({ length: 15 }, (_, i) => ({
		name: `skill-${i}`,
		skillPath: `skills/skill-${i}/SKILL.md`,
	}))
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(manySkills) }))

	const results = await findSkillsInRepo('repobuddy/repobuddy', '', { limit: 3 })
	expect(results.length).toBe(3)
})
