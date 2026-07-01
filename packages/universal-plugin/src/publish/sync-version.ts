import * as path from 'node:path'
import type { SyncVersionFs } from './fs.js'

export interface SyncVersionResult {
	version: string
	manifestPath: string
}

function detectIndent(json: string): string | number {
	const match = json.match(/\n([ \t]+)/)
	if (!match) return '\t'
	return match[1].startsWith('\t') ? '\t' : match[1].length
}

export function syncVersion(root: string, syncFs: SyncVersionFs): SyncVersionResult {
	const manifestPath = path.join(root, '.plugin', 'plugin.json')
	if (!syncFs.exists(manifestPath)) {
		throw new Error(`No .plugin/plugin.json found at ${root}`)
	}

	const agentsConfigPath = path.join(root, '.agents', 'universal-plugin.json')
	const agentsConfig = syncFs.exists(agentsConfigPath)
		? (JSON.parse(syncFs.read(agentsConfigPath)) as Record<string, unknown>)
		: {}
	const packagePath = agentsConfig['packagePath']
	if (!packagePath || typeof packagePath !== 'string') {
		throw new Error('packagePath is required in .agents/universal-plugin.json')
	}

	const raw = syncFs.read(manifestPath)
	const manifest = JSON.parse(raw) as Record<string, unknown>

	const pkgJsonPath = path.join(root, packagePath, 'package.json')
	if (!syncFs.exists(pkgJsonPath)) {
		throw new Error(`No package.json found at ${packagePath}`)
	}

	const pkg = JSON.parse(syncFs.read(pkgJsonPath)) as Record<string, unknown>
	const version = pkg['version']
	if (!version || typeof version !== 'string') {
		throw new Error(`No version found in ${packagePath}/package.json`)
	}

	const indent = detectIndent(raw)
	const updated = { ...manifest, version }
	syncFs.write(manifestPath, `${JSON.stringify(updated, null, indent)}\n`)

	return { version, manifestPath }
}
