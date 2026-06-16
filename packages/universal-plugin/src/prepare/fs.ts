import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

function expandHome(p: string): string {
	return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p
}

import { globalStorePath, storeEntryPath } from '../asset-store/asset-store.js'
import { entryExists, populateEntry } from '../asset-store/fs.js'
import type { StateFile } from '../state/state.js'
import { emptyState, mergeSafeState } from '../state/state.js'
import type { VendorConfig } from '../vendor-registry/vendor-registry.js'

export interface PrepareFs {
	readManifest(): Record<string, string>
	readPluginRoots(): Record<string, string>
	readGlobalState(): StateFile
	readProjectState(): StateFile | null
	writeGlobalState(state: StateFile): void
	writeProjectState(state: StateFile): void
}

function globalStatePath(): string {
	return path.join(os.homedir(), '.agents', 'universal-plugin.json')
}

function projectStatePath(root: string): string {
	return path.join(root, '.agents', 'universal-plugin.json')
}

function readStateFile(filePath: string): StateFile | null {
	try {
		return mergeSafeState(JSON.parse(fsNode.readFileSync(filePath, 'utf8')) as StateFile)
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
		throw err
	}
}

function writeStateFile(filePath: string, state: StateFile): void {
	fsNode.mkdirSync(path.dirname(filePath), { recursive: true })
	fsNode.writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n', 'utf8')
}

export function realPrepareFs(vendor: VendorConfig, projectRoot?: string): PrepareFs {
	return {
		readManifest(): Record<string, string> {
			if (!vendor.globalManifest) return {}
			const manifestPath = expandHome(vendor.globalManifest)
			try {
				const raw = JSON.parse(fsNode.readFileSync(manifestPath, 'utf8')) as Record<string, unknown>
				// Claude Code installed_plugins.json: keys are plugin names, values are objects with a version field
				return Object.fromEntries(
					Object.entries(raw).map(([k, v]) => [
						k,
						typeof v === 'object' && v !== null && 'version' in v
							? String((v as Record<string, unknown>).version)
							: String(v),
					]),
				)
			} catch (err: unknown) {
				if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {}
				throw err
			}
		},
		readPluginRoots(): Record<string, string> {
			if (!vendor.globalPluginDir) return {}
			const pluginDir = expandHome(vendor.globalPluginDir)
			const manifest = this.readManifest()
			const home = os.homedir()
			return Object.fromEntries(
				Object.keys(manifest).map((name) => {
					const absPath = path.join(pluginDir, name)
					const relPath = absPath.startsWith(home) ? '~' + absPath.slice(home.length) : absPath
					return [name, relPath]
				}),
			)
		},
		readGlobalState: () => readStateFile(globalStatePath()) ?? emptyState(),
		readProjectState: () => (projectRoot ? readStateFile(projectStatePath(projectRoot)) : null),
		writeGlobalState: (s) => writeStateFile(globalStatePath(), s),
		writeProjectState: (s) => {
			if (projectRoot) writeStateFile(projectStatePath(projectRoot), s)
		},
	}
}

export function populateStoreFromVendorCache(
	pluginRoots: Record<string, string>,
	versions: Record<string, string>,
): void {
	const storePath = globalStorePath()
	for (const [pluginName, pluginRoot] of Object.entries(pluginRoots)) {
		const version = versions[pluginName] ?? 'unknown'
		const segment = `npm/${pluginName}@${version}`
		const entryPath = storeEntryPath(storePath, segment)
		if (entryExists(entryPath)) continue
		populateEntry(entryPath, pluginRoot)
	}
}
