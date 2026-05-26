import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export type ProviderType = 'github' | 'gitlab' | 'custom'

export interface Provider {
	url: string
	type: ProviderType
	/** Glob pattern on "owner/repo" — e.g. "mycompany/*" or "mycompany/my-repo" */
	match?: string
}

export interface CyberSkillsConfig {
	version: 1
	providers?: Provider[]
	skills?: Record<string, string>
}

export type ConfigScope = 'project' | 'global'

export function getConfigPath(root: string, scope: ConfigScope): string {
	if (scope === 'global') return join(homedir(), '.agents', 'cyber-skills.json')
	return join(root, '.agents', 'cyber-skills.json')
}

export function readConfig(root: string, scope: ConfigScope): CyberSkillsConfig {
	const filePath = getConfigPath(root, scope)
	if (!fs.existsSync(filePath)) return { version: 1 }
	try {
		const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Omit<CyberSkillsConfig, 'version'>
		return { version: 1, ...raw }
	} catch {
		return { version: 1 }
	}
}

export function writeConfig(root: string, scope: ConfigScope, config: CyberSkillsConfig): void {
	const filePath = getConfigPath(root, scope)
	fs.mkdirSync(dirname(filePath), { recursive: true })
	const data: CyberSkillsConfig = { version: 1 }
	if (config.providers && config.providers.length > 0) data.providers = config.providers
	if (config.skills && Object.keys(config.skills).length > 0) data.skills = config.skills
	fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

const VALID_PROVIDER_TYPES: ProviderType[] = ['github', 'gitlab', 'custom']

export function inferProviderType(url: string): ProviderType {
	if (url.includes('github.com')) return 'github'
	if (url.includes('gitlab.')) return 'gitlab'
	return 'custom'
}

export function validateProviderType(type: string): ProviderType {
	if ((VALID_PROVIDER_TYPES as string[]).includes(type)) return type as ProviderType
	throw new Error(`Invalid provider type '${type}'. Must be one of: ${VALID_PROVIDER_TYPES.join(', ')}`)
}

export function addProvider(root: string, scope: ConfigScope, url: string, type?: ProviderType, match?: string): void {
	const config = readConfig(root, scope)
	const providers = config.providers ?? []
	const normalized = url.replace(/\/$/, '')
	const exists = providers.some((p) => p.url === normalized)
	if (!exists) {
		const entry: Provider = { url: normalized, type: type ?? inferProviderType(normalized) }
		if (match) entry.match = match
		providers.push(entry)
		writeConfig(root, scope, { ...config, providers })
	}
}

function globMatches(pattern: string, value: string): boolean {
	// Supports * (any chars within one segment) and ** (any chars across segments)
	const re = new RegExp(
		`^${pattern
			.replace(/[.+^${}()|[\]\\]/g, '\\$&')
			.replace(/\*\*/g, '.+')
			.replace(/\*/g, '[^/]+')}$`,
	)
	return re.test(value)
}

export function matchProvider(providers: Provider[], ownerRepo: string): Provider | null {
	for (const p of providers) {
		if (p.match && globMatches(p.match, ownerRepo)) return p
	}
	return null
}

export function removeProvider(root: string, scope: ConfigScope, url: string): void {
	const config = readConfig(root, scope)
	const normalized = url.replace(/\/$/, '')
	const providers = (config.providers ?? []).filter((p) => p.url !== normalized)
	writeConfig(root, scope, { ...config, providers })
}

export function listProviders(root: string, scope: ConfigScope): Provider[] {
	return readConfig(root, scope).providers ?? []
}
