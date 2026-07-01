import * as fsNode from 'node:fs'
import * as path from 'node:path'
import { ASSET_DIRS } from './asset-store.js'

export function entryExists(entryPath: string): boolean {
	return fsNode.existsSync(entryPath)
}

export function populateEntry(entryPath: string, pluginRoot: string): void {
	for (const dir of ASSET_DIRS) {
		const src = path.join(pluginRoot, dir)
		const dest = path.join(entryPath, dir)
		if (!fsNode.existsSync(src)) continue
		fsNode.mkdirSync(dest, { recursive: true })
		for (const file of fsNode.readdirSync(src)) {
			fsNode.copyFileSync(path.join(src, file), path.join(dest, file))
		}
	}
}

export function removeStore(storePath: string): void {
	fsNode.rmSync(storePath, { recursive: true, force: true })
}
