import * as fs from 'node:fs'
import * as path from 'node:path'

const CREW_TAG = 'crew'

const GITHUB_OWNER = 'cyberuni'
const GITHUB_REPO = 'cyberplace'

interface MarketplacePluginEntry {
	name: string
	description: string
	source: string
	tags?: string[]
}

interface MarketplaceManifest {
	plugins?: MarketplacePluginEntry[]
}

interface PluginManifest {
	version?: string
	description?: string
	homepage?: string
	repository?: string
}

export interface CrewPlugin {
	name: string
	description: string
	source: string
	tags: string[]
	recruit: string
	version?: string
	skillCount: number
	agentCount: number
	commandCount: number
	sourceUrl: string
}

export interface MarketplacePlugin extends CrewPlugin {
	isCrew: boolean
}

// import.meta.url resolves to a bundled build-time chunk path (not the source
// file location) once callers (e.g. Astro/Vite) prerender, so it cannot be
// used to derive the repo root by relative distance. Instead, walk upward
// from the current working directory looking for the marketplace manifest's
// containing directory.
function findRepoRoot(): string {
	let dir = process.cwd()
	for (let i = 0; i < 8; i++) {
		if (fs.existsSync(path.join(dir, '.claude-plugin', 'marketplace.json'))) return dir
		const parent = path.dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	// Fallback: apps/website/../.. is the repo root in this monorepo layout.
	return path.join(process.cwd(), '..', '..')
}

function countEntries(dir: string): number {
	if (!fs.existsSync(dir)) return 0
	try {
		return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory() || entry.isFile()).length
	} catch {
		return 0
	}
}

function readPluginManifest(pluginRoot: string): PluginManifest | null {
	const candidates = [
		path.join(pluginRoot, '.claude-plugin', 'plugin.json'),
		path.join(pluginRoot, '.plugin', 'plugin.json'),
	]
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) {
			try {
				return JSON.parse(fs.readFileSync(candidate, 'utf8')) as PluginManifest
			} catch {
				return null
			}
		}
	}
	return null
}

function matchesQuery(plugin: MarketplacePlugin, query: string): boolean {
	const needle = query.toLowerCase()
	return (
		plugin.name.toLowerCase().includes(needle) ||
		plugin.description.toLowerCase().includes(needle) ||
		plugin.tags.some((tag) => tag.toLowerCase().includes(needle))
	)
}

/**
 * Reads every plugin in the cyberplace marketplace manifest
 * (<root>/.claude-plugin/marketplace.json), enriched with counts, version,
 * and GitHub source URL derived from each plugin's own manifest and
 * directory contents, optionally filtered by free-text query over name,
 * description, and tags. Defaults `root` to the repo root discovered from
 * the current working directory.
 */
export function readMarketplacePlugins(root: string = findRepoRoot(), query?: string): MarketplacePlugin[] {
	const manifestPath = path.join(root, '.claude-plugin', 'marketplace.json')
	if (!fs.existsSync(manifestPath)) throw new Error(`No .claude-plugin/marketplace.json found at ${manifestPath}`)

	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as MarketplaceManifest
	const plugins = (manifest.plugins ?? [])
		.map((plugin): MarketplacePlugin => {
			const tags = plugin.tags ?? []
			const pluginRoot = path.join(root, plugin.source.replace(/^\.\//, ''))
			const pluginManifest = readPluginManifest(pluginRoot)

			return {
				name: plugin.name,
				description: plugin.description ?? pluginManifest?.description ?? '',
				source: plugin.source,
				tags,
				recruit: `cyberplace add ${plugin.name}`,
				version: pluginManifest?.version,
				skillCount: countEntries(path.join(pluginRoot, 'skills')),
				agentCount: countEntries(path.join(pluginRoot, 'agents')),
				commandCount: countEntries(path.join(pluginRoot, 'commands')),
				sourceUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/main/plugins/${plugin.name}`,
				isCrew: tags.includes(CREW_TAG),
			}
		})
		.sort((a, b) => a.name.localeCompare(b.name))

	if (!query) return plugins
	return plugins.filter((plugin) => matchesQuery(plugin, query))
}

/**
 * Reads the crew roster from the cyberplace marketplace manifest
 * (<root>/.claude-plugin/marketplace.json) — plugin entries tagged "crew", optionally
 * filtered by free-text query over name, description, and tags. Defaults
 * `root` to the repo root discovered from the current working directory.
 */
export function readCrewPlugins(root: string = findRepoRoot(), query?: string): CrewPlugin[] {
	return readMarketplacePlugins(root, query).filter((plugin) => plugin.isCrew)
}
