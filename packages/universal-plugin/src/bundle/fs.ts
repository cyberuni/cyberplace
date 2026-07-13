import * as fsNode from 'node:fs'
import * as path from 'node:path'
import { detectIndent } from '../json.js'
import type { BundlePin, VersionSource } from './bundle.js'

const DEFAULT_GLOBS = ['packages/*']

/** Walks up from `start` looking for `pnpm-workspace.yaml`; falls back to `start` itself when no
 *  ancestor declares one (the workspace glob then resolves relative to `start`). */
function findMonorepoRoot(start: string): string {
	let dir = start
	for (;;) {
		if (fsNode.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir
		const parent = path.dirname(dir)
		if (parent === dir) return start
		dir = parent
	}
}

/** Minimal `packages:` list extraction from a `pnpm-workspace.yaml` — no YAML dependency, just the
 *  flat glob-list shape pnpm-workspace files use. */
function parseWorkspaceGlobs(yamlText: string): string[] {
	const lines = yamlText.split(/\r?\n/)
	const globs: string[] = []
	let inPackages = false
	for (const line of lines) {
		if (/^packages:\s*$/.test(line)) {
			inPackages = true
			continue
		}
		if (!inPackages) continue
		const item = line.match(/^\s*-\s*["']?([^"'\s#]+)["']?\s*$/)
		if (item) {
			globs.push(item[1]!)
			continue
		}
		if (/^\S/.test(line)) inPackages = false
	}
	return globs
}

function readWorkspaceGlobs(monorepoRoot: string): string[] {
	const yamlPath = path.join(monorepoRoot, 'pnpm-workspace.yaml')
	if (!fsNode.existsSync(yamlPath)) return DEFAULT_GLOBS
	try {
		const globs = parseWorkspaceGlobs(fsNode.readFileSync(yamlPath, 'utf8'))
		return globs.length > 0 ? globs : DEFAULT_GLOBS
	} catch {
		return DEFAULT_GLOBS
	}
}

/** Expands a workspace glob to its member directories. Only the `<dir>/*` shape pnpm-workspace
 *  files use is supported; a glob without a trailing `/*` is treated as a single literal path. */
function expandGlob(monorepoRoot: string, glob: string): string[] {
	if (glob.endsWith('/*')) {
		const base = path.join(monorepoRoot, glob.slice(0, -2))
		if (!fsNode.existsSync(base)) return []
		return fsNode
			.readdirSync(base, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.map((entry) => path.join(base, entry.name))
	}
	const dir = path.join(monorepoRoot, glob)
	return fsNode.existsSync(dir) ? [dir] : []
}

/** Discovers every workspace member's version, keyed by its `package.json` `name` field (falling
 *  back to the directory name when `package.json` is missing or unreadable — registering the
 *  package as an in-workspace member with an unresolved version, distinct from a package with no
 *  workspace entry at all). */
export function discoverWorkspace(root: string): Map<string, string | undefined> {
	const monorepoRoot = findMonorepoRoot(root)
	const globs = readWorkspaceGlobs(monorepoRoot)
	const map = new Map<string, string | undefined>()

	for (const glob of globs) {
		for (const dir of expandGlob(monorepoRoot, glob)) {
			let name = path.basename(dir)
			let version: string | undefined
			try {
				const pkg = JSON.parse(fsNode.readFileSync(path.join(dir, 'package.json'), 'utf8')) as {
					name?: string
					version?: string
				}
				if (typeof pkg.name === 'string') name = pkg.name
				if (typeof pkg.version === 'string') version = pkg.version
			} catch {
				// package.json missing or unreadable — still register the directory as a workspace
				// member (under its directory name) with an unresolved version.
			}
			map.set(name, version)
		}
	}

	return map
}

/** Writes `<root>/.plugin/pins.json` — a flat, key-sorted `{ "<package>": "<resolvedVersion>" }`
 *  map of the workspace-resolved pins (`pinned` + `unchanged`), so a bundled plugin's skills can read
 *  the shipped version programmatically (e.g. `${CLAUDE_PLUGIN_ROOT}/.plugin/pins.json`). External /
 *  `skipped` packages are excluded — they have no authoritative workspace version. */
export function writePinsMap(root: string, pins: BundlePin[]): void {
	const map: Record<string, string> = {}
	for (const pin of pins) {
		if (pin.status === 'pinned' || pin.status === 'unchanged') map[pin.package] = pin.resolved
	}
	const sorted: Record<string, string> = {}
	for (const key of Object.keys(map).sort((a, b) => a.localeCompare(b))) sorted[key] = map[key]!
	const dir = path.join(root, '.plugin')
	fsNode.mkdirSync(dir, { recursive: true })
	const pinsPath = path.join(dir, 'pins.json')
	const existing = fsNode.existsSync(pinsPath) ? fsNode.readFileSync(pinsPath, 'utf8') : null
	const indent = existing ? detectIndent(existing) : '\t'
	fsNode.writeFileSync(pinsPath, `${JSON.stringify(sorted, null, indent)}\n`)
}

export function realVersionSource(workspace: Map<string, string | undefined>): VersionSource {
	return {
		resolve(pkg: string) {
			if (!workspace.has(pkg)) return { inWorkspace: false }
			return { inWorkspace: true, version: workspace.get(pkg) }
		},
	}
}
