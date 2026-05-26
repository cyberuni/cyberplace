import * as fs from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export type ProviderType = 'github' | 'gitlab' | 'custom'

export interface Provider {
	url: string
	type: ProviderType
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
		const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CyberSkillsConfig
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

export function inferProviderType(url: string): ProviderType {
	if (url.includes('github.com')) return 'github'
	if (url.includes('gitlab.')) return 'gitlab'
	return 'custom'
}

export function addProvider(root: string, scope: ConfigScope, url: string, type?: ProviderType): void {
	const config = readConfig(root, scope)
	const providers = config.providers ?? []
	const normalized = url.replace(/\/$/, '')
	const exists = providers.some((p) => p.url === normalized)
	if (!exists) {
		providers.push({ url: normalized, type: type ?? inferProviderType(normalized) })
		writeConfig(root, scope, { ...config, providers })
	}
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
