import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, expect, test, vi } from 'vitest'

import { findSkillSource } from './source.js'

vi.mock('node:child_process', () => ({
	spawnSync: vi.fn(),
}))

const mockedSpawnSync = vi.mocked(spawnSync)

function withHome(home: string, run: () => void) {
	const previous = process.env.HOME
	process.env.HOME = home
	try {
		run()
	} finally {
		if (previous === undefined) delete process.env.HOME
		else process.env.HOME = previous
	}
}

afterEach(() => {
	mockedSpawnSync.mockReset()
})

test('findSkillSource resolves skill from repo skills-lock.json', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-repo-'))
	try {
		fs.writeFileSync(
			path.join(root, 'skills-lock.json'),
			JSON.stringify({
				version: 1,
				skills: {
					'audit-skill': {
						source: 'cyberuni/cyberplace',
						skillPath: 'skills/audit-skill/SKILL.md',
					},
				},
			}),
		)

		const result = findSkillSource('audit-skill', root)

		expect(result).toEqual({
			name: 'audit-skill',
			source: 'cyberuni/cyberplace',
			sourceUrl: 'https://github.com/cyberuni/cyberplace',
			skillPath: 'skills/audit-skill/SKILL.md',
			foundIn: 'repo',
		})
		expect(mockedSpawnSync).not.toHaveBeenCalled()
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('findSkillSource resolves skill from global skill lock', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-root-'))
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-home-'))
	try {
		fs.mkdirSync(path.join(home, '.agents'), { recursive: true })
		fs.writeFileSync(
			path.join(home, '.agents', '.skill-lock.json'),
			JSON.stringify({
				version: 1,
				skills: {
					'setup-github-repo': {
						source: 'repobuddy/repobuddy',
						sourceUrl: 'https://github.com/repobuddy/repobuddy',
						skillPath: 'skills/setup-github-repo/SKILL.md',
					},
				},
			}),
		)

		withHome(home, () => {
			const result = findSkillSource('setup-github-repo', root)

			expect(result).toEqual({
				name: 'setup-github-repo',
				source: 'repobuddy/repobuddy',
				sourceUrl: 'https://github.com/repobuddy/repobuddy',
				skillPath: 'skills/setup-github-repo/SKILL.md',
				foundIn: 'global',
			})
			expect(mockedSpawnSync).not.toHaveBeenCalled()
		})
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
		fs.rmSync(home, { recursive: true, force: true })
	}
})

test('findSkillSource falls back to npx skills find output', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-npx-'))
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-empty-home-'))
	try {
		withHome(home, () => {
			mockedSpawnSync.mockReturnValue({
				stdout: 'Found cyberuni/cyberplace@audit-skill\n',
				stderr: '',
				status: 0,
				pid: 1,
				output: ['Found cyberuni/cyberplace@audit-skill\n', ''],
				signal: null,
			})

			const result = findSkillSource('audit-skill', root)

			expect(result).toEqual({
				name: 'audit-skill',
				source: 'cyberuni/cyberplace',
				sourceUrl: 'https://github.com/cyberuni/cyberplace',
				skillPath: 'skills/audit-skill/SKILL.md',
				foundIn: 'npx-skills',
			})
			expect(mockedSpawnSync).toHaveBeenCalledWith(
				'npx',
				['--yes', 'skills', 'find', 'audit-skill'],
				expect.objectContaining({ encoding: 'utf8' }),
			)
		})
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
		fs.rmSync(home, { recursive: true, force: true })
	}
})

test('findSkillSource returns null fields when skill is not found', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-miss-'))
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-source-miss-home-'))
	try {
		withHome(home, () => {
			mockedSpawnSync.mockReturnValue({
				stdout: '',
				stderr: 'not found',
				status: 1,
				pid: 1,
				output: ['', 'not found'],
				signal: null,
			})

			const result = findSkillSource('definitely-does-not-exist-xyz', root)

			expect(result).toEqual({
				name: 'definitely-does-not-exist-xyz',
				source: null,
				sourceUrl: null,
				skillPath: null,
				foundIn: null,
			})
		})
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
		fs.rmSync(home, { recursive: true, force: true })
	}
})
