import { type ConfigScope, type Provider, readConfig } from './config.js'
import { listRepoSkills } from './github.js'
import { parseSpec } from './spec.js'

export interface FoundSkill {
	name: string
	source: string
	skillPath: string
	installCommand: string
}

export interface FindOptions {
	root: string
	scope?: ConfigScope
}

const DEFAULT_GITHUB_PROVIDER: Provider = { url: 'https://github.com', type: 'github' }
const CYBER_SKILLS_REPO = 'cyberuni/cyber-skills'

async function searchProvider(
	provider: Provider | null,
	ownerRepo: string,
	query: string,
): Promise<FoundSkill[]> {
	const [owner, repo] = ownerRepo.split('/')
	if (!owner || !repo) return []

	try {
		const skills = await listRepoSkills(provider, owner, repo)
		const lower = query.toLowerCase()
		const matched = query ? skills.filter((s) => s.name.toLowerCase().includes(lower)) : skills
		return matched.map((s) => ({
			name: s.name,
			source: ownerRepo,
			skillPath: s.skillPath,
			installCommand: `npx cyber-skills add ${ownerRepo}:${s.name}`,
		}))
	} catch {
		return []
	}
}

export async function findSkills(query: string, options: FindOptions): Promise<FoundSkill[]> {
	const { root, scope = 'project' } = options
	const config = readConfig(root, scope)
	const results: FoundSkill[] = []
	const seen = new Set<string>()

	// always search the default cyber-skills repo
	const defaultResults = await searchProvider(null, CYBER_SKILLS_REPO, query)
	for (const r of defaultResults) {
		const key = `${r.source}:${r.name}`
		if (!seen.has(key)) {
			seen.add(key)
			results.push(r)
		}
	}

	// search configured provider repos
	for (const provider of config.providers ?? []) {
		// for custom providers, we search the registry root — the user needs to specify a repo
		// skip providers without a known repo listing (they're addressed via org/repo spec directly)
		if (provider.type === 'github') {
			// custom github instance — skip, no default repo to search
			continue
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
