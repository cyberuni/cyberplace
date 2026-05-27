export interface FoundSkill {
	name: string
	source: string
	skillPath: string
	installCommand: string
	installs?: number
}

export interface FindOptions {
	root: string
	scope?: import('./config.js').ConfigScope
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
			installCommand: `npx cyber-skills add ${s.source}:${s.name}`,
			installs: s.installs,
		}))
	} catch {
		return []
	}
}
