import * as os from 'node:os'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StateFile } from '../state/state.js'
import type { GovernanceFs } from './fs.js'

type Scope = 'managed' | 'project' | 'local' | 'user' | 'package' | 'store'

export interface AssetStoreOpts {
	state: StateFile
	globalStorePath: string
}

interface ScopedPath {
	scope: Scope
	dir: string
}

export interface GovernanceEntry {
	name: string
	scope: Scope
}

export interface ShowResult {
	content: string
	scope: Scope
}

export function getManagedDir(): string {
	if (process.platform === 'darwin') return '/Library/Application Support/UniPlugin/governances'
	if (process.platform === 'win32')
		return path.join(process.env['ProgramData'] ?? 'C:\\ProgramData', 'UniPlugin', 'governances')
	return '/etc/universal-plugin/governances'
}

export function getUserDir(): string {
	return path.join(os.homedir(), '.agents', 'governances')
}

export function getProjectDir(root: string): string {
	return path.join(root, 'governances')
}

export function getLocalDir(root: string): string {
	return path.join(root, '.agents', 'governances')
}

export function getPackageDir(): string {
	const thisFile = fileURLToPath(import.meta.url)
	return path.join(path.dirname(thisFile), '..', 'governances')
}

function getScopedPaths(root: string): ScopedPath[] {
	return [
		{ scope: 'managed', dir: getManagedDir() },
		{ scope: 'project', dir: getProjectDir(root) },
		{ scope: 'local', dir: getLocalDir(root) },
		{ scope: 'user', dir: getUserDir() },
		{ scope: 'package', dir: getPackageDir() },
	]
}

export function showGovernance(
	name: string,
	root: string,
	govFs: GovernanceFs,
	storeOpts?: AssetStoreOpts,
): ShowResult | null {
	const slashIdx = name.indexOf('/')
	if (slashIdx !== -1 && storeOpts) {
		const pluginName = name.slice(0, slashIdx)
		const assetName = name.slice(slashIdx + 1)

		// Check managed, project, user scopes (no package) for overrides
		const overrideScopes: Scope[] = ['managed', 'project', 'user']
		for (const scope of overrideScopes) {
			let dir: string
			if (scope === 'managed') dir = getManagedDir()
			else if (scope === 'project') dir = getProjectDir(root)
			else dir = getUserDir()
			const filePath = path.join(dir, pluginName, `${assetName}.md`)
			if (govFs.exists(filePath)) {
				return { content: govFs.read(filePath), scope }
			}
		}

		// Look up asset index
		const entry = storeOpts.state.assets[pluginName]
		if (!entry) return null

		const segment = path.join(entry.source, `${pluginName}@${entry.version}`)
		const storePath = path.join(storeOpts.globalStorePath, segment, 'governances', `${assetName}.md`)
		if (govFs.exists(storePath)) {
			return { content: govFs.read(storePath), scope: 'store' }
		}
		return null
	}

	for (const { scope, dir } of getScopedPaths(root)) {
		const filePath = path.join(dir, `${name}.md`)
		if (govFs.exists(filePath)) {
			return { content: govFs.read(filePath), scope }
		}
	}
	return null
}

export function listGovernances(root: string, govFs: GovernanceFs): GovernanceEntry[] {
	const seen = new Set<string>()
	const entries: GovernanceEntry[] = []
	for (const { scope, dir } of getScopedPaths(root)) {
		for (const name of govFs.list(dir)) {
			if (!seen.has(name)) {
				seen.add(name)
				entries.push({ name, scope })
			}
		}
	}
	return entries.sort((a, b) => a.name.localeCompare(b.name))
}
