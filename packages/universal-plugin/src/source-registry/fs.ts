import * as fsNode from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import type { SourcesConfig } from './source-registry.js'
import { DEFAULT_SOURCES } from './source-registry.js'

function sourcesConfigPath(): string {
	return path.join(os.homedir(), '.agents', '.universal-plugin', 'sources.json')
}

export function loadSourcesConfig(configPath?: string): SourcesConfig {
	const filePath = configPath ?? sourcesConfigPath()
	try {
		return JSON.parse(fsNode.readFileSync(filePath, 'utf8')) as SourcesConfig
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') return DEFAULT_SOURCES
		throw err
	}
}
