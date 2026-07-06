import * as fs from 'node:fs'
import * as path from 'node:path'

const CREW_TAG = 'crew'

interface MarketplacePluginEntry {
	name: string
	description: string
	source: string
	tags?: string[]
}

interface MarketplaceManifest {
	plugins?: MarketplacePluginEntry[]
}

export interface CrewPlugin {
	name: string
	description: string
	source: string
	tags: string[]
	recruit: string
}

function matchesQuery(crew: CrewPlugin, query: string): boolean {
	const needle = query.toLowerCase()
	return (
		crew.name.toLowerCase().includes(needle) ||
		crew.description.toLowerCase().includes(needle) ||
		crew.tags.some((tag) => tag.toLowerCase().includes(needle))
	)
}

/**
 * Reads the crew roster from the cyberplace marketplace manifest
 * (<root>/.claude-plugin/marketplace.json) — plugin entries tagged "crew", optionally
 * filtered by free-text query over name, description, and tags.
 */
export function readCrewPlugins(root: string, query?: string): CrewPlugin[] {
	const manifestPath = path.join(root, '.claude-plugin', 'marketplace.json')
	if (!fs.existsSync(manifestPath)) throw new Error(`No .claude-plugin/marketplace.json found at ${manifestPath}`)

	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as MarketplaceManifest
	const crews = (manifest.plugins ?? [])
		.filter((plugin) => plugin.tags?.includes(CREW_TAG))
		.map(
			(plugin): CrewPlugin => ({
				name: plugin.name,
				description: plugin.description,
				source: plugin.source,
				tags: plugin.tags ?? [],
				recruit: `cyberplace add ${plugin.name}`,
			}),
		)
		.sort((a, b) => a.name.localeCompare(b.name))

	if (!query) return crews
	return crews.filter((crew) => matchesQuery(crew, query))
}
