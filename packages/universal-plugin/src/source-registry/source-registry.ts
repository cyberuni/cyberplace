import { createHash } from 'node:crypto'

interface SourceHandlerConfig {
	hosts?: string[]
	registries?: string[]
}

export interface SourcesConfig {
	handlers: {
		github?: SourceHandlerConfig
		gitlab?: SourceHandlerConfig
		npm?: SourceHandlerConfig
		[key: string]: SourceHandlerConfig | undefined
	}
}

export const DEFAULT_SOURCES: SourcesConfig = {
	handlers: {
		github: { hosts: ['github.com'] },
		gitlab: { hosts: ['gitlab.com'] },
		npm: { registries: ['https://registry.npmjs.org'] },
	},
}

export function sha8(input: string): string {
	return createHash('sha256').update(input).digest('hex').slice(0, 8)
}

export function resolveSourceType(host: string, sources: SourcesConfig): string {
	for (const [type, config] of Object.entries(sources.handlers)) {
		if (config?.hosts?.includes(host)) return type
	}
	return 'url'
}

export function getStoreSegment(source: string, pluginName: string, version: string, sources: SourcesConfig): string {
	// npm source
	if (source === 'npm') {
		return `npm/${pluginName}@${version}`
	}

	// Try to parse as a URL or host/owner/repo
	let host: string
	let repoPath: string

	let normalizedSource: string | undefined
	if (source.startsWith('https://') || source.startsWith('http://')) {
		const url = new URL(source)
		host = url.hostname
		repoPath = url.pathname.replace(/^\/|\/$/g, '')
		normalizedSource = `${url.protocol}//${url.hostname}/${repoPath}`
	} else if (source.includes('/')) {
		// owner/repo or host/owner/repo format
		const parts = source.split('/')
		if (parts.length === 2) {
			// owner/repo shorthand — defaults to first registered github host
			const githubHosts = sources.handlers.github?.hosts ?? ['github.com']
			host = githubHosts[0] ?? 'github.com'
			repoPath = source
		} else {
			host = parts[0]!
			repoPath = parts.slice(1).join('/')
		}
	} else {
		host = source
		repoPath = pluginName
	}

	const sourceType = resolveSourceType(host, sources)
	if (sourceType === 'url') {
		return `url/${pluginName}-${sha8(normalizedSource ?? source)}@${version}`
	}

	return `${host}/${repoPath}@${version}`
}
