import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import {
	addProvider,
	getConfigPath,
	inferProviderType,
	listProviders,
	matchProvider,
	readConfig,
	removeProvider,
	validateProviderType,
	writeConfig,
} from './config.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-config-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

test('getConfigPath returns project path for project scope', () => {
	expect(getConfigPath(root, 'project')).toBe(path.join(root, '.agents', 'cyber-skills.json'))
})

test('getConfigPath returns home path for global scope', () => {
	expect(getConfigPath(root, 'global')).toBe(path.join(os.homedir(), '.agents', 'cyber-skills.json'))
})

test('readConfig returns empty config when file missing', () => {
	const config = readConfig(root, 'project')
	expect(config).toEqual({ version: 1 })
})

test('readConfig returns stored config', () => {
	fs.mkdirSync(path.join(root, '.agents'), { recursive: true })
	fs.writeFileSync(
		path.join(root, '.agents', 'cyber-skills.json'),
		JSON.stringify({ version: 1, providers: [{ url: 'https://github.com', type: 'github' }] }),
	)
	const config = readConfig(root, 'project')
	expect(config.providers).toHaveLength(1)
	expect(config.providers![0]!.url).toBe('https://github.com')
})

test('readConfig returns empty config on malformed JSON', () => {
	fs.mkdirSync(path.join(root, '.agents'), { recursive: true })
	fs.writeFileSync(path.join(root, '.agents', 'cyber-skills.json'), 'not json')
	expect(readConfig(root, 'project')).toEqual({ version: 1 })
})

test('writeConfig creates .agents dir and writes file', () => {
	writeConfig(root, 'project', { version: 1, providers: [{ url: 'https://gitlab.example.com', type: 'gitlab' }] })
	const filePath = path.join(root, '.agents', 'cyber-skills.json')
	expect(fs.existsSync(filePath)).toBe(true)
	const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
	expect(parsed.providers[0].url).toBe('https://gitlab.example.com')
})

test('writeConfig omits empty providers and skills', () => {
	writeConfig(root, 'project', { version: 1, providers: [], skills: {} })
	const parsed = JSON.parse(fs.readFileSync(path.join(root, '.agents', 'cyber-skills.json'), 'utf8'))
	expect(parsed.providers).toBeUndefined()
	expect(parsed.skills).toBeUndefined()
})

test('inferProviderType detects github', () => {
	expect(inferProviderType('https://github.com')).toBe('github')
})

test('inferProviderType detects gitlab', () => {
	expect(inferProviderType('https://gitlab.mycompany.com')).toBe('gitlab')
})

test('inferProviderType returns custom for unknown', () => {
	expect(inferProviderType('https://my-forge.example.com')).toBe('custom')
})

test('addProvider adds a provider', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	const providers = listProviders(root, 'project')
	expect(providers).toHaveLength(1)
	expect(providers[0]!.url).toBe('https://gitlab.mycompany.com')
	expect(providers[0]!.type).toBe('gitlab')
})

test('addProvider strips trailing slash', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com/')
	const providers = listProviders(root, 'project')
	expect(providers[0]!.url).toBe('https://gitlab.mycompany.com')
})

test('addProvider is idempotent', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	expect(listProviders(root, 'project')).toHaveLength(1)
})

test('addProvider accepts explicit type', () => {
	addProvider(root, 'project', 'https://my-forge.example.com', 'github')
	expect(listProviders(root, 'project')[0]!.type).toBe('github')
})

test('removeProvider removes matching provider', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	removeProvider(root, 'project', 'https://gitlab.mycompany.com')
	expect(listProviders(root, 'project')).toHaveLength(0)
})

test('removeProvider strips trailing slash when matching', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	removeProvider(root, 'project', 'https://gitlab.mycompany.com/')
	expect(listProviders(root, 'project')).toHaveLength(0)
})

test('removeProvider is safe when provider not found', () => {
	removeProvider(root, 'project', 'https://nothere.example.com')
	expect(listProviders(root, 'project')).toHaveLength(0)
})

test('listProviders returns empty array when no config', () => {
	expect(listProviders(root, 'project')).toEqual([])
})

test('addProvider stores match field', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com', 'gitlab', 'mycompany/*')
	const providers = listProviders(root, 'project')
	expect(providers[0]!.match).toBe('mycompany/*')
})

test('addProvider stores no match field when omitted', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	const providers = listProviders(root, 'project')
	expect(providers[0]!.match).toBeUndefined()
})

test('matchProvider returns null when no providers have a match pattern', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com')
	const providers = listProviders(root, 'project')
	expect(matchProvider(providers, 'mycompany/myrepo')).toBeNull()
})

test('matchProvider returns provider when owner/* matches', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com', 'gitlab', 'mycompany/*')
	const providers = listProviders(root, 'project')
	const result = matchProvider(providers, 'mycompany/myrepo')
	expect(result).not.toBeNull()
	expect(result!.url).toBe('https://gitlab.mycompany.com')
})

test('matchProvider returns null when owner does not match pattern', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com', 'gitlab', 'mycompany/*')
	const providers = listProviders(root, 'project')
	expect(matchProvider(providers, 'other-org/myrepo')).toBeNull()
})

test('matchProvider matches exact owner/repo pattern', () => {
	addProvider(root, 'project', 'https://gitlab.mycompany.com', 'gitlab', 'mycompany/specific-repo')
	const providers = listProviders(root, 'project')
	expect(matchProvider(providers, 'mycompany/specific-repo')).not.toBeNull()
	expect(matchProvider(providers, 'mycompany/other-repo')).toBeNull()
})

test('matchProvider returns first matching provider', () => {
	addProvider(root, 'project', 'https://gitlab1.com', 'gitlab', 'mycompany/*')
	addProvider(root, 'project', 'https://gitlab2.com', 'gitlab', 'mycompany/*')
	const providers = listProviders(root, 'project')
	expect(matchProvider(providers, 'mycompany/repo')!.url).toBe('https://gitlab1.com')
})

test('validateProviderType accepts github', () => {
	expect(validateProviderType('github')).toBe('github')
})

test('validateProviderType accepts gitlab', () => {
	expect(validateProviderType('gitlab')).toBe('gitlab')
})

test('validateProviderType accepts custom', () => {
	expect(validateProviderType('custom')).toBe('custom')
})

test('validateProviderType throws on unknown value', () => {
	expect(() => validateProviderType('unknown')).toThrow("Invalid provider type 'unknown'")
})

test('validateProviderType error message lists valid options', () => {
	expect(() => validateProviderType('bitbucket')).toThrow('github, gitlab, custom')
})
