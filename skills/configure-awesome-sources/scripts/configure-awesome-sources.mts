#!/usr/bin/env node
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

type SourceClass = 'local-private' | 'repo-shared' | 'global-user'

interface SourceRef {
  repo: string
  path: string
}

interface SourceConfigFile {
  version: 1
  sources?: SourceRef[]
  disabled_sources?: SourceRef[]
}

function normalizeRepo(repo: string): string {
  return repo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/^\/+|\/+$/g, '')
}

function normalizePath(filePath: string): string {
  return filePath.trim().replace(/^\/+/, '') || 'awesome-skills.json'
}

function sourceKey(source: SourceRef): string {
  return `${normalizeRepo(source.repo)}::${normalizePath(source.path)}`
}

function getLayerFilePath(cwd: string, sourceClass: SourceClass): string {
  switch (sourceClass) {
    case 'local-private':
      return path.join(cwd, '.agents', 'awesome-skill-sources.local.json')
    case 'repo-shared':
      return path.join(cwd, '.agents', 'awesome-skill-sources.json')
    case 'global-user':
      return path.join(os.homedir(), '.agents', 'awesome-skill-sources.json')
  }
}

function parseRepositoryFromPackage(cwd: string): string | null {
  const manifestPath = path.join(cwd, 'package.json')
  if (!fs.existsSync(manifestPath)) return null
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { repository?: { url?: string } | string }
  const repoUrl = typeof manifest.repository === 'string' ? manifest.repository : manifest.repository?.url
  if (!repoUrl) return null
  const match = repoUrl.match(/github\.com[:/](.+?)(?:\.git)?$/)
  return match ? normalizeRepo(match[1]) : null
}

function loadSourceConfigFile(filePath: string): SourceConfigFile {
  if (!fs.existsSync(filePath)) return { version: 1, sources: [], disabled_sources: [] }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as SourceConfigFile
}

function saveSourceConfigFile(filePath: string, config: SourceConfigFile): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify({
    version: 1,
    ...(config.sources && config.sources.length > 0 ? { sources: config.sources } : {}),
    ...(config.disabled_sources && config.disabled_sources.length > 0 ? { disabled_sources: config.disabled_sources } : {}),
  }, null, 2)}\n`)
}

function parseArgs(argv: string[]) {
  const args = argv.slice(2)
  const command = args[0]
  const layerValue = readFlag(args, '--layer')
  const repo = readFlag(args, '--repo')
  const filePath = normalizePath(readFlag(args, '--path') ?? 'awesome-skills.json')
  return { command, layerValue, repo, filePath }
}

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function resolveLayer(value: string | undefined): SourceClass {
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

function mutateRefs(refs: SourceRef[], predicate: (ref: SourceRef) => boolean, next?: SourceRef): SourceRef[] {
  const kept = refs.filter(ref => !predicate(ref))
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

function getResolvedSources(cwd: string): Array<SourceRef & { sourceClass: SourceClass | 'default' }> {
  const layers: Array<{ sourceClass: SourceClass; path: string }> = [
    { sourceClass: 'local-private', path: getLayerFilePath(cwd, 'local-private') },
    { sourceClass: 'repo-shared', path: getLayerFilePath(cwd, 'repo-shared') },
    { sourceClass: 'global-user', path: getLayerFilePath(cwd, 'global-user') },
  ]
  const disabled = new Set<string>()
  const kept = new Map<string, SourceRef & { sourceClass: SourceClass | 'default' }>()

  for (const layer of layers) {
    const config = loadSourceConfigFile(layer.path)
    for (const ref of config.disabled_sources ?? []) disabled.add(sourceKey(ref))
  }

  const currentRepo = parseRepositoryFromPackage(cwd)
  if (currentRepo) {
    const ref = { repo: currentRepo, path: 'awesome-skills.json' }
    const key = sourceKey(ref)
    if (!disabled.has(key) && fs.existsSync(path.join(cwd, ref.path))) {
      kept.set(key, { ...ref, sourceClass: 'default' })
    }
  }

  for (const layer of layers.reverse()) {
    const config = loadSourceConfigFile(layer.path)
    for (const ref of config.sources ?? []) {
      const key = sourceKey(ref)
      if (disabled.has(key) || kept.has(key)) continue
      kept.set(key, { ...ref, sourceClass: layer.sourceClass })
    }
  }

  return Array.from(kept.values())
}

function printUsage(): void {
  console.log('Usage:')
  console.log('  tsx skills/configure-awesome-sources/scripts/configure-awesome-sources.mts list')
  console.log('  tsx skills/configure-awesome-sources/scripts/configure-awesome-sources.mts add --layer local|repo|global --repo owner/name [--path awesome-skills.json]')
  console.log('  tsx skills/configure-awesome-sources/scripts/configure-awesome-sources.mts remove --layer local|repo|global --repo owner/name [--path awesome-skills.json]')
  console.log('  tsx skills/configure-awesome-sources/scripts/configure-awesome-sources.mts disable --layer local|repo|global --repo owner/name [--path awesome-skills.json]')
  console.log('  tsx skills/configure-awesome-sources/scripts/configure-awesome-sources.mts enable --layer local|repo|global --repo owner/name [--path awesome-skills.json]')
}

const cwd = process.cwd()
const { command, layerValue, repo, filePath } = parseArgs(process.argv)

if (!command || command === '--help' || command === 'help') {
  printUsage()
  process.exit(0)
}

if (command === 'list') {
  const sources = getResolvedSources(cwd)
  if (sources.length === 0) {
    console.log('No awesome sources configured.')
    process.exit(0)
  }
  console.log('Effective awesome sources:')
  for (const source of sources) console.log(`- ${source.repo} (${source.path}) [${source.sourceClass}]`)
  process.exit(0)
}

const layer = resolveLayer(layerValue)
if (!repo) throw new Error('Expected --repo owner/name')
const ref = { repo: normalizeRepo(repo), path: filePath }
const configPath = getLayerFilePath(cwd, layer)
const config = loadSourceConfigFile(configPath)
const predicate = (item: SourceRef) => sourceKey(item) === sourceKey(ref)
const currentRefs = getCurrentSourceSet(config)
const inheritedSources = getLowerLayerSources(cwd, layer)

switch (command) {
  case 'add':
    config.sources = mutateRefs(config.sources ?? [], predicate, ref)
    config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate)
    saveSourceConfigFile(configPath, config)
    console.log(`Added ${ref.repo} (${ref.path}) to ${configPath}`)
    break
  case 'remove':
    config.sources = mutateRefs(config.sources ?? [], predicate)
    config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate)
    saveSourceConfigFile(configPath, config)
    console.log(`Removed ${ref.repo} (${ref.path}) from ${configPath}`)
    break
  case 'disable':
    config.sources = mutateRefs(config.sources ?? [], predicate)
    config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate, ref)
    saveSourceConfigFile(configPath, config)
    console.log(`Disabled ${ref.repo} (${ref.path}) in ${configPath}`)
    break
  case 'enable':
    config.disabled_sources = mutateRefs(config.disabled_sources ?? [], predicate)
    if (!currentRefs.has(sourceKey(ref)) && !inheritedSources.has(sourceKey(ref))) {
      config.sources = mutateRefs(config.sources ?? [], predicate, ref)
      console.log(`Enabled ${ref.repo} (${ref.path}) in ${configPath} and added it as a direct source.`)
    } else {
      config.sources = mutateRefs(config.sources ?? [], predicate)
      console.log(`Enabled ${ref.repo} (${ref.path}) in ${configPath}.`)
    }
    saveSourceConfigFile(configPath, config)
    break
  default:
    printUsage()
    process.exit(1)
}

const currentRepo = parseRepositoryFromPackage(cwd)
if (currentRepo && sourceKey(ref) === sourceKey({ repo: currentRepo, path: 'awesome-skills.json' }) && command === 'disable') {
  console.log('Note: this disables the built-in default source for the current repo as well.')
}
