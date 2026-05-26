import { readConfig } from './config.js'
import { listRepoSkills } from './github.js'
import { type FindOptions, type FoundSkill, searchMarketplace } from './marketplace-api.js'
import { parseSpec } from './spec.js'

export type { FindOptions, FoundSkill }

const SKILLS_SH_URL = 'https://skills.sh'

export async function findSkills(query: string, options: FindOptions): Promise<FoundSkill[]> {
	const { root, scope = 'project' } = options
	const config = readConfig(root, scope)
	const results: FoundSkill[] = []
	const seen = new Set<string>()

	const addResults = (items: FoundSkill[]) => {
		for (const r of items) {
			const key = `${r.source}:${r.name}`
			if (!seen.has(key)) {
				seen.add(key)
				results.push(r)
			}
		}
	}

	addResults(await searchMarketplace(SKILLS_SH_URL, query))

	for (const provider of config.providers ?? []) {
		if (provider.type === 'marketplace') {
			addResults(await searchMarketplace(provider.url, query))
		}
	}

	return results
}

export async function findSkillsInRepo(spec: string, query: string): Promise<FoundSkill[]> {
	const parsed = parseSpec(spec)
	if (parsed.type !== 'repo') return []

	const { owner, repo } = parsed
	try {
		const skills = await listRepoSkills(null, owner, repo)
		const lower = query.toLowerCase()
		const matched = query ? skills.filter((s) => s.name.toLowerCase().includes(lower)) : skills
		return matched.map((s) => ({
			name: s.name,
			source: `${owner}/${repo}`,
			skillPath: s.skillPath,
			installCommand: `npx cyber-skills add ${owner}/${repo}:${s.name}`,
		}))
	} catch {
		return []
	}
}
