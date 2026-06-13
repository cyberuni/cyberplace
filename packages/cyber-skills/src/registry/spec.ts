export type SpecType = 'repo' | 'npm' | 'git-url'

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

export type GitProviderHint = 'github' | 'gitlab' | 'gitea' | null

export interface GitUrlSpec {
	type: 'git-url'
	/** scheme://host/owner/repo — no .git suffix, no path suffix, no fragment */
	cloneUrl: string
	owner: string
	repo: string
	/** scheme://host — base URL for provider config lookup */
	host: string
	/** Extracted from path pattern or bare fragment; undefined = use caller's default */
	branch?: string
	/** Detected from path pattern, not hostname */
	providerHint: GitProviderHint
	raw: string
}

export type ParsedSpec = RepoSpec | NpmSpec | GitUrlSpec

const REPO_RE = /^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?::([a-zA-Z0-9_.-]+))?$/

// Matches HTTPS git URLs: https://host/... or http://host/...
const HTTPS_RE = /^https?:\/\//
// Matches SSH git URLs: git@host:owner/repo.git
const SSH_RE = /^git@([^:]+):([^/]+)\/(.+?)(?:\.git)?$/

function parseGitUrl(input: string): GitUrlSpec | null {
	// SSH: git@host:owner/repo.git
	const sshMatch = SSH_RE.exec(input)
	if (sshMatch) {
		const [, sshHost, owner, repo] = sshMatch
		const host = `https://${sshHost!}`
		return {
			type: 'git-url',
			cloneUrl: `${host}/${owner}/${repo}`,
			owner: owner!,
			repo: repo!,
			host,
			providerHint: null,
			raw: input,
		}
	}

	if (!HTTPS_RE.test(input)) return null

	// Strip fragment for branch, then parse path
	let branch: string | undefined
	let urlWithoutFragment = input
	const hashIdx = input.indexOf('#')
	if (hashIdx !== -1) {
		branch = input.slice(hashIdx + 1) || undefined
		urlWithoutFragment = input.slice(0, hashIdx)
	}

	// Strip .git suffix
	const withoutGit = urlWithoutFragment.replace(/\.git$/, '')

	let url: URL
	try {
		url = new URL(withoutGit)
	} catch {
		return null
	}

	const host = `${url.protocol}//${url.host}`
	const pathParts = url.pathname.replace(/^\//, '').split('/')

	// GitLab: /owner/repo/-/tree/{branch}
	const gitlabTreeIdx = url.pathname.indexOf('/-/tree/')
	if (gitlabTreeIdx !== -1) {
		const beforeTree = url.pathname.slice(1, gitlabTreeIdx).split('/')
		if (beforeTree.length >= 2) {
			const owner = beforeTree[0]!
			const repo = beforeTree[1]!
			const detectedBranch = url.pathname.slice(gitlabTreeIdx + '/-/tree/'.length).split('/')[0]
			return {
				type: 'git-url',
				cloneUrl: `${host}/${owner}/${repo}`,
				owner,
				repo,
				host,
				branch: detectedBranch || branch,
				providerHint: 'gitlab',
				raw: input,
			}
		}
	}

	// GitHub: /owner/repo/tree/{branch}
	const treeIdx = pathParts.indexOf('tree')
	if (treeIdx === 2 && pathParts.length > treeIdx + 1) {
		const owner = pathParts[0]!
		const repo = pathParts[1]!
		const detectedBranch = pathParts[treeIdx + 1]!
		return {
			type: 'git-url',
			cloneUrl: `${host}/${owner}/${repo}`,
			owner,
			repo,
			host,
			branch: detectedBranch || branch,
			providerHint: 'github',
			raw: input,
		}
	}

	// Gitea / Forgejo / Gogs: /owner/repo/src/branch/{branch}
	const srcIdx = pathParts.indexOf('src')
	if (srcIdx === 2 && pathParts[srcIdx + 1] === 'branch' && pathParts.length > srcIdx + 2) {
		const owner = pathParts[0]!
		const repo = pathParts[1]!
		const detectedBranch = pathParts[srcIdx + 2]!
		return {
			type: 'git-url',
			cloneUrl: `${host}/${owner}/${repo}`,
			owner,
			repo,
			host,
			branch: detectedBranch || branch,
			providerHint: 'gitea',
			raw: input,
		}
	}

	// Bare URL: scheme://host/owner/repo[.git][#branch]
	if (pathParts.length >= 2 && pathParts[0] && pathParts[1]) {
		const owner = pathParts[0]
		const repo = pathParts[1]
		return {
			type: 'git-url',
			cloneUrl: `${host}/${owner}/${repo}`,
			owner,
			repo,
			host,
			branch,
			providerHint: null,
			raw: input,
		}
	}

	return null
}

export function parseSpec(input: string): ParsedSpec {
	if (input.startsWith('@')) {
		return { type: 'npm', packageName: input, raw: input }
	}

	// Git URLs: HTTPS or SSH
	if (HTTPS_RE.test(input) || input.startsWith('git@')) {
		const gitSpec = parseGitUrl(input)
		if (gitSpec) return gitSpec
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

export function isGitUrlSpec(spec: ParsedSpec): spec is GitUrlSpec {
	return spec.type === 'git-url'
}

export function formatRepoSpec(spec: RepoSpec): string {
	return spec.skill ? `${spec.owner}/${spec.repo}:${spec.skill}` : `${spec.owner}/${spec.repo}`
}
