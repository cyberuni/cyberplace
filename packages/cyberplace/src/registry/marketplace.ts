import type { Scope } from './scope.js'

interface MarketplacePlugin {
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

export interface FoundSkill {
	name: string
	source: string
	skillPath: string
	installCommand: string
	installs?: number
}

export interface FindOptions {
	root: string
	scope?: Scope
	limit?: number
}

interface MarketplaceSkill {
	id: string
	skillId: string
	name: string
	installs: number
	source: string
}

interface MarketplaceSearchResponse {
	query: string
	searchType: string
	skills: MarketplaceSkill[]
	count: number
	duration_ms: number
}

export async function searchMarketplace(baseUrl: string, query: string): Promise<FoundSkill[]> {
	try {
		const url = `${baseUrl.replace(/\/$/, '')}/api/search?q=${encodeURIComponent(query)}&limit=50`
		const res = await fetch(url)
		if (!res.ok) return []
		const data = (await res.json()) as MarketplaceSearchResponse
		return (data.skills ?? []).map((s) => ({
			name: s.name,
			source: s.source,
			skillPath: `skills/${s.skillId ?? s.name}/SKILL.md`,
			installCommand: `npx cyberplace add ${s.source}:${s.name}`,
			installs: s.installs,
		}))
	} catch {
		return []
	}
}
