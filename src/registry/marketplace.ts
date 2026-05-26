export interface MarketplacePlugin {
	name: string
	description: string
	skills: string[]
}

export interface Marketplace {
	plugins: MarketplacePlugin[]
}

export function mapSkillsToPlugins(marketplace: Marketplace): Map<string, string> {
	const map = new Map<string, string>()
	for (const plugin of marketplace.plugins) {
		for (const skillPath of plugin.skills) {
			const name = skillPath.replace(/\/$/, '').split('/').pop()!
			if (!map.has(name)) map.set(name, plugin.name)
		}
	}
	return map
}
