import * as fs from 'node:fs'
import { dirname } from 'node:path'

import {
	getLayerFilePath,
	getResolvedSources,
	loadSourceConfigFile,
	normalizePath,
	normalizeRepo,
	parseRepositoryFromPackage,
	type SourceConfigFile,
	type SourceRef,
	sourceKey,
} from './lib.js'

type SourceClass = 'local-private' | 'repo-shared' | 'global-user'

export function resolveLayer(value: string): SourceClass {
	switch (value) {
		case 'local':
		case 'local-private':
			return 'local-private'
		case 'repo':
		case 'repo-shared':
			return 'repo-shared'
		case 'global':
		case 'global-user':
			return 'global-user'
		default:
			throw new Error('Expected --layer local|repo|global')
	}
}

function saveSourceConfigFile(filePath: string, config: SourceConfigFile): void {
	fs.mkdirSync(dirname(filePath), { recursive: true })
	fs.writeFileSync(
		filePath,
		`${JSON.stringify(
			{
				version: 1,
				...(config.sources && config.sources.length > 0 ? { sources: config.sources } : {}),
				...(config.disabled_sources && config.disabled_sources.length > 0
					? { disabled_sources: config.disabled_sources }
					: {}),
			},
			null,
			2,
		)}\n`,
	)
}

function mutateRefs(refs: SourceRef[], predicate: (ref: SourceRef) => boolean, next?: SourceRef): SourceRef[] {
	const kept = refs.filter((ref) => !predicate(ref))
	if (next) kept.push(next)
	return kept.sort((a, b) => sourceKey(a).localeCompare(sourceKey(b)))
}

function getCurrentSourceSet(config: SourceConfigFile): Set<string> {
	return new Set([...(config.sources ?? []), ...(config.disabled_sources ?? [])].map(sourceKey))
}

function getLowerLayerSources(cwd: string, layer: SourceClass): Set<string> {
	const all: SourceClass[] = ['global-user', 'repo-shared', 'local-private']
	const index = all.indexOf(layer)
	const refs = new Set<string>()
	for (const item of all.slice(0, index)) {
		const config = loadSourceConfigFile(getLayerFilePath(cwd, item))
		for (const ref of config.sources ?? []) refs.add(sourceKey(ref))
	}
	return refs
}

export type SourceCommand = 'list' | 'add' | 'remove' | 'disable' | 'enable'

export interface SourcesListResult {
	sources: Array<SourceRef & { sourceClass: string }>
}

export function listSources(cwd: string): SourcesListResult {
	const sources = getResolvedSources(cwd).map((s) => ({
		repo: s.repo,
		path: s.path,
		sourceClass: s.sourceClass,
	}))
	return { sources }
}

export function mutateSources(
	command: Exclude<SourceCommand, 'list'>,
	cwd: string,
	layer: SourceClass,
	repo: string,
	filePath: string,
): { configPath: string; message: string; defaultDisabled: boolean } {
	const ref: SourceRef = { repo: normalizeRepo(repo), path: normalizePath(filePath) }
	const configPath = getLayerFilePath(cwd, layer)
	const config = loadSourceConfigFile(configPath)
	const predicate = (item: SourceRef) => sourceKey(item) === sourceKey(ref)
	const currentRefs = getCurrentSourceSet(config)
	const inheritedSources = getLowerLayerSources(cwd, layer)

	let message = ''

	switch (command) {
		case 'add':
			config.sources = mutateRefs(config.sources ?? [], predicate, ref)
			config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate)
			saveSourceConfigFile(configPath, config)
			message = `Added ${ref.repo} (${ref.path}) to ${configPath}`
			break
		case 'remove':
			config.sources = mutateRefs(config.sources ?? [], predicate)
			config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate)
			saveSourceConfigFile(configPath, config)
			message = `Removed ${ref.repo} (${ref.path}) from ${configPath}`
			break
		case 'disable':
			config.sources = mutateRefs(config.sources ?? [], predicate)
			config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate, ref)
			saveSourceConfigFile(configPath, config)
			message = `Disabled ${ref.repo} (${ref.path}) in ${configPath}`
			break
		case 'enable':
			config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate)
			if (!currentRefs.has(sourceKey(ref)) && !inheritedSources.has(sourceKey(ref))) {
				config.sources = mutateRefs(config.sources ?? [], predicate, ref)
				message = `Enabled ${ref.repo} (${ref.path}) in ${configPath} and added it as a direct source.`
			} else {
				config.sources = mutateRefs(config.sources ?? [], predicate)
				message = `Enabled ${ref.repo} (${ref.path}) in ${configPath}.`
			}
			saveSourceConfigFile(configPath, config)
			break
	}

	const currentRepo = parseRepositoryFromPackage(cwd)
	const defaultDisabled =
		Boolean(currentRepo) &&
		sourceKey(ref) === sourceKey({ repo: currentRepo!, path: 'awesome-skills.json' }) &&
		command === 'disable'

	return { configPath, message, defaultDisabled }
}
