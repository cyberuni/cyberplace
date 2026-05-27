import { readConfig } from './config.js'
import { listRepoSkills } from './github.js'
import { type FindOptions, type FoundSkill, searchMarketplace } from './marketplace-api.js'
import { parseSpec } from './spec.js'

export type { FindOptions, FoundSkill }

const SKILLS_SH_URL = 'https://skills.sh'

const DEFAULT_LIMIT = 10

export async function findSkills(query: string, options: FindOptions): Promise<FoundSkill[]> {
	const { root, scope = 'project', limit = DEFAULT_LIMIT } = options
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

	sortFoundSkills(results)
	return results.slice(0, limit)
}

const installCountFormatter = new Intl.NumberFormat('en-US', {
	notation: 'compact',
	maximumFractionDigits: 1,
})

export function formatInstallCount(installs: number): string {
	return installCountFormatter.format(installs)
}

function sortFoundSkills(results: FoundSkill[]): void {
	results.sort((a, b) => {
		const installsA = a.installs ?? 0
		const installsB = b.installs ?? 0
		if (installsB !== installsA) return installsB - installsA
		return a.name.localeCompare(b.name)
	})
}

export function printFindResults(results: FoundSkill[], query: string): void {
	if (results.length === 0) {
		console.log(query ? `No skills found for "${query}".` : 'No skills found.')
		return
	}

	console.log(query ? `Skill matches for "${query}":` : 'Available skills:')
	for (const result of results) {
		const installs = result.installs != null ? ` · ${formatInstallCount(result.installs)} installs` : ''
		console.log(`\n- ${result.name} (${result.source}${installs})`)
		console.log(`  ${result.installCommand}`)
	}
}

export async function findSkillsInRepo(
	spec: string,
	query: string,
	options: { limit?: number } = {},
): Promise<FoundSkill[]> {
	const { limit = DEFAULT_LIMIT } = options
	const parsed = parseSpec(spec)
	if (parsed.type !== 'repo') return []

	const { owner, repo } = parsed
	try {
		const skills = await listRepoSkills(null, owner, repo)
		const lower = query.toLowerCase()
		const matched = query ? skills.filter((s) => s.name.toLowerCase().includes(lower)) : skills
		const results = matched.map((s) => ({
			name: s.name,
			source: `${owner}/${repo}`,
			skillPath: s.skillPath,
			installCommand: `npx cyber-skills add ${owner}/${repo}:${s.name}`,
		}))
		sortFoundSkills(results)
		return results.slice(0, limit)
	} catch {
		return []
	}
}
