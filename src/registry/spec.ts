export type SpecType = 'repo' | 'npm'

export interface RepoSpec {
	type: 'repo'
	owner: string
	repo: string
	skill?: string
	raw: string
}

export interface NpmSpec {
	type: 'npm'
	packageName: string
	raw: string
}

export type ParsedSpec = RepoSpec | NpmSpec

const REPO_RE = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?::([a-zA-Z0-9_.-]+))?$/

export function parseSpec(input: string): ParsedSpec {
	if (input.startsWith('@')) {
		return { type: 'npm', packageName: input, raw: input }
	}

	const match = REPO_RE.exec(input)
	if (match) {
		const [, owner, repo, skill] = match
		return { type: 'repo', owner: owner!, repo: repo!, skill, raw: input }
	}

	return { type: 'npm', packageName: input, raw: input }
}

export function isRepoSpec(spec: ParsedSpec): spec is RepoSpec {
	return spec.type === 'repo'
}

export function isNpmSpec(spec: ParsedSpec): spec is NpmSpec {
	return spec.type === 'npm'
}

export function formatRepoSpec(spec: RepoSpec): string {
	return spec.skill ? `${spec.owner}/${spec.repo}:${spec.skill}` : `${spec.owner}/${spec.repo}`
}
