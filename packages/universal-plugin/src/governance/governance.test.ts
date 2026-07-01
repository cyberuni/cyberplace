import * as os from 'node:os'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { StateFile } from '../state/state.js'
import { emptyState, writeAssetIndex } from '../state/state.js'
import type { GovernanceFs } from './fs.js'
import {
	getLocalDir,
	getManagedDir,
	getPackageDir,
	getProjectDir,
	getUserDir,
	listGovernances,
	showGovernance,
} from './governance.js'

function makeMockFs(files: Record<string, string>): GovernanceFs {
	return {
		exists: (p) => p in files,
		read: (p) => files[p] ?? '',
		list: (dir) =>
			Object.keys(files)
				.filter((p) => p.startsWith(dir + path.sep) && p.endsWith('.md'))
				.map((p) => path.basename(p, '.md')),
	}
}

const ROOT = '/fake/project'

describe('getManagedDir', () => {
	it('returns a platform-specific path', () => {
		const dir = getManagedDir()
		expect(typeof dir).toBe('string')
		expect(dir.length).toBeGreaterThan(0)
	})
})

describe('getUserDir', () => {
	it('returns a path under the home directory', () => {
		expect(getUserDir()).toBe(path.join(os.homedir(), '.agents', 'governances'))
	})
})

describe('getProjectDir', () => {
	it('returns <root>/governances', () => {
		expect(getProjectDir('/my/project')).toBe('/my/project/governances')
	})
})

describe('getLocalDir', () => {
	it('returns <root>/.agents/governances', () => {
		expect(getLocalDir('/my/project')).toBe('/my/project/.agents/governances')
	})
})

describe('showGovernance', () => {
	describe('Given a governance exists at project scope', () => {
		it('When showing by name, Then returns content and scope=project', () => {
			const projectFile = path.join(getProjectDir(ROOT), 'plugin-design.md')
			const govFs = makeMockFs({ [projectFile]: '# Plugin Design\ncontent' })

			const result = showGovernance('plugin-design', ROOT, govFs)

			expect(result).not.toBeNull()
			expect(result!.scope).toBe('project')
			expect(result!.content).toBe('# Plugin Design\ncontent')
		})
	})

	describe('Given the same governance exists at project and user scope', () => {
		it('When showing by name, Then project scope wins (higher authority)', () => {
			const projectFile = path.join(getProjectDir(ROOT), 'plugin-design.md')
			const userFile = path.join(getUserDir(), 'plugin-design.md')
			const govFs = makeMockFs({
				[projectFile]: 'project version',
				[userFile]: 'user version',
			})

			const result = showGovernance('plugin-design', ROOT, govFs)

			expect(result!.scope).toBe('project')
			expect(result!.content).toBe('project version')
		})
	})

	describe('Given a governance exists at local scope only', () => {
		it('When showing by name, Then returns content and scope=local', () => {
			const localFile = path.join(getLocalDir(ROOT), 'cli-command.md')
			const govFs = makeMockFs({ [localFile]: 'local content' })

			const result = showGovernance('cli-command', ROOT, govFs)

			expect(result!.scope).toBe('local')
			expect(result!.content).toBe('local content')
		})
	})

	describe('Given the same governance exists at project and local scope', () => {
		it('When showing by name, Then project scope wins', () => {
			const projectFile = path.join(getProjectDir(ROOT), 'plugin-design.md')
			const localFile = path.join(getLocalDir(ROOT), 'plugin-design.md')
			const govFs = makeMockFs({
				[projectFile]: 'project version',
				[localFile]: 'local version',
			})

			const result = showGovernance('plugin-design', ROOT, govFs)

			expect(result!.scope).toBe('project')
			expect(result!.content).toBe('project version')
		})
	})

	describe('Given the same governance exists at local and user scope', () => {
		it('When showing by name, Then local scope wins', () => {
			const localFile = path.join(getLocalDir(ROOT), 'plugin-design.md')
			const userFile = path.join(getUserDir(), 'plugin-design.md')
			const govFs = makeMockFs({
				[localFile]: 'local version',
				[userFile]: 'user version',
			})

			const result = showGovernance('plugin-design', ROOT, govFs)

			expect(result!.scope).toBe('local')
			expect(result!.content).toBe('local version')
		})
	})

	describe('Given a governance exists at user scope only', () => {
		it('When showing by name, Then returns content and scope=user', () => {
			const userFile = path.join(getUserDir(), 'plugin-design.md')
			const govFs = makeMockFs({ [userFile]: 'user content' })

			const result = showGovernance('plugin-design', ROOT, govFs)

			expect(result!.scope).toBe('user')
			expect(result!.content).toBe('user content')
		})
	})

	describe('Given a governance exists at package scope only', () => {
		it('When showing by name, Then returns content and scope=package', () => {
			const pkgFile = path.join(getPackageDir(), 'plugin-design.md')
			const govFs = makeMockFs({ [pkgFile]: 'package content' })

			const result = showGovernance('plugin-design', ROOT, govFs)

			expect(result!.scope).toBe('package')
			expect(result!.content).toBe('package content')
		})
	})

	describe('Given no governance exists at any scope', () => {
		it('When showing by name, Then returns null', () => {
			const govFs = makeMockFs({})
			expect(showGovernance('missing', ROOT, govFs)).toBeNull()
		})
	})
})

function stateWithPlugin(pluginName: string): StateFile {
	return writeAssetIndex(emptyState(), pluginName, { source: 'npm', version: '1.2.3' })
}

describe('showGovernance — namespaced name', () => {
	it('resolves plugin-name/governance-name from asset store', () => {
		const state = stateWithPlugin('universal-plugin')
		const storePath = '/store'
		const storeFile = path.join('/store', 'npm', 'universal-plugin@1.2.3', 'governances', 'plugin-design.md')
		const govFs = makeMockFs({ [storeFile]: '# Plugin Design\ncontent' })

		const result = showGovernance('universal-plugin/plugin-design', ROOT, govFs, { state, globalStorePath: storePath })

		expect(result).not.toBeNull()
		expect(result!.scope).toBe('store')
		expect(result!.content).toBe('# Plugin Design\ncontent')
	})

	it('returns null when plugin not in asset index', () => {
		const govFs = makeMockFs({})
		const result = showGovernance('unknown-plugin/policy', ROOT, govFs, {
			state: emptyState(),
			globalStorePath: '/store',
		})
		expect(result).toBeNull()
	})

	it('project scope overrides store for namespaced name', () => {
		const state = stateWithPlugin('universal-plugin')
		const projectFile = path.join(ROOT, 'governances', 'universal-plugin', 'plugin-design.md')
		const storeFile = path.join('/store', 'npm', 'universal-plugin@1.2.3', 'governances', 'plugin-design.md')
		const govFs = makeMockFs({
			[projectFile]: '# Override',
			[storeFile]: '# Original',
		})

		const result = showGovernance('universal-plugin/plugin-design', ROOT, govFs, {
			state,
			globalStorePath: '/store',
		})

		expect(result!.scope).toBe('project')
		expect(result!.content).toBe('# Override')
	})
})

describe('listGovernances', () => {
	describe('Given governances at multiple scopes', () => {
		it('When listing, Then returns all unique names with highest-scope annotation', () => {
			const projectFile = path.join(getProjectDir(ROOT), 'plugin-design.md')
			const userFile1 = path.join(getUserDir(), 'plugin-design.md')
			const userFile2 = path.join(getUserDir(), 'commit-discipline.md')
			const govFs = makeMockFs({
				[projectFile]: 'project',
				[userFile1]: 'user',
				[userFile2]: 'user',
			})

			const entries = listGovernances(ROOT, govFs)

			expect(entries).toHaveLength(2)
			const pluginDesign = entries.find((e) => e.name === 'plugin-design')!
			expect(pluginDesign.scope).toBe('project')
			const commitDiscipline = entries.find((e) => e.name === 'commit-discipline')!
			expect(commitDiscipline.scope).toBe('user')
		})
	})

	describe('Given no governances at any scope', () => {
		it('When listing, Then returns empty array', () => {
			expect(listGovernances(ROOT, makeMockFs({}))).toEqual([])
		})
	})

	describe('Given a governance exists at local scope', () => {
		it('When listing, Then returns entry with scope=local', () => {
			const localFile = path.join(getLocalDir(ROOT), 'cli-command.md')
			const govFs = makeMockFs({ [localFile]: 'content' })

			const entries = listGovernances(ROOT, govFs)

			expect(entries).toHaveLength(1)
			expect(entries[0]!.name).toBe('cli-command')
			expect(entries[0]!.scope).toBe('local')
		})
	})

	describe('Given governances at multiple scopes with the same name', () => {
		it('When listing, Then de-duplicates by name (highest scope wins)', () => {
			const projectFile = path.join(getProjectDir(ROOT), 'shared.md')
			const userFile = path.join(getUserDir(), 'shared.md')
			const govFs = makeMockFs({ [projectFile]: 'p', [userFile]: 'u' })

			const entries = listGovernances(ROOT, govFs)

			expect(entries).toHaveLength(1)
			expect(entries[0]!.scope).toBe('project')
		})
	})

	describe('Given governances at multiple scopes', () => {
		it('When listing, Then returns entries sorted alphabetically by name', () => {
			const govFs = makeMockFs({
				[path.join(getUserDir(), 'zzz.md')]: '',
				[path.join(getUserDir(), 'aaa.md')]: '',
			})

			const entries = listGovernances(ROOT, govFs)

			expect(entries.map((e) => e.name)).toEqual(['aaa', 'zzz'])
		})
	})
})
