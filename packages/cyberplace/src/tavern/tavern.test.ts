import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import { findCrews } from './lib.js'
import { renderTavernRosterMarkdown } from './render.js'

const bin = path.resolve('bin/cyberplace.mjs')

function makeCatalog(awesomeList: Record<string, unknown>): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tavern-catalog-'))
	fs.writeFileSync(
		path.join(root, 'package.json'),
		JSON.stringify({ repository: { url: 'https://github.com/test/tavern-fixture.git' } }),
	)
	fs.writeFileSync(path.join(root, 'awesome-skills.json'), JSON.stringify(awesomeList, null, 2))
	return root
}

function runCli(...args: string[]) {
	return spawnSync('node', [bin, 'tavern', ...args], {
		encoding: 'utf8',
		env: { ...process.env, NODE_NO_WARNINGS: '1' },
	})
}

// Scenario: an entry tagged crew appears in the tavern roster
test('an entry tagged crew appears in the tavern roster', async () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
		skills: {},
	})
	try {
		const crews = await findCrews(root, '')
		expect(crews.some((c) => c.repo === 'acme/navigator')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: an entry not tagged crew is excluded from the roster
test('an entry not tagged crew is excluded from the roster', async () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/plain': {
				repo: 'acme/plain',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Not a crew',
				why_recommended: 'Just a regular skill repo',
				tags: ['validation'],
			},
		},
		skills: {},
	})
	try {
		const crews = await findCrews(root, '')
		expect(crews.some((c) => c.repo === 'acme/plain')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: the roster shows each crew's install command
test("the roster shows a crew-tagged repo's install command", async () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
		skills: {},
	})
	try {
		const crews = await findCrews(root, '')
		const navigator = crews.find((c) => c.repo === 'acme/navigator')
		expect(navigator?.installCommand).toBe('npx skills add acme/navigator')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a crew-tagged skill entry derives a --skill install command
test('a crew-tagged skill entry derives a --skill install command', async () => {
	const root = makeCatalog({
		version: 1,
		repos: {},
		skills: {
			'acme/navigator::helm': {
				repo: 'acme/navigator',
				skill: 'helm',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Helm crew skill',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
	})
	try {
		const crews = await findCrews(root, '')
		const helm = crews.find((c) => c.repo === 'acme/navigator' && c.skill === 'helm')
		expect(helm?.installCommand).toBe('npx skills add acme/navigator --skill helm')
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: cyberplace tavern <query> filters the crew roster by text
test('cyberplace tavern <query> filters the crew roster by text', async () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
			'acme/gunner': {
				repo: 'acme/gunner',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Gunner crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
		skills: {},
	})
	try {
		const crews = await findCrews(root, 'navigator')
		expect(crews.some((c) => c.repo === 'acme/navigator')).toBe(true)
		expect(crews.some((c) => c.repo === 'acme/gunner')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: a query never surfaces a non-crew entry
test('a query never surfaces a non-crew entry', async () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator plain repo, not a crew',
				why_recommended: 'Matches the query text but ships no persona',
				tags: ['validation'],
			},
		},
		skills: {},
	})
	try {
		const crews = await findCrews(root, 'navigator')
		expect(crews.some((c) => c.repo === 'acme/navigator')).toBe(false)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: json output emits structured crew records
test('json output emits structured crew records', () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
		skills: {},
	})
	try {
		const result = runCli('--format', 'json', '--root', root)
		expect(result.status).toBe(0)
		const parsed = JSON.parse(result.stdout) as { repo: string; installCommand: string }[]
		expect(
			parsed.some((c) => c.repo === 'acme/navigator' && c.installCommand === 'npx skills add acme/navigator'),
		).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: an empty catalog yields an empty roster, not an error
test('an empty catalog yields an empty roster, not an error', () => {
	const root = makeCatalog({ version: 1, repos: {}, skills: {} })
	try {
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/no crews/i)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: the Tavern lists a crew but performs no install or deployment
test('the tavern lists a crew but performs no install or deployment', () => {
	const root = makeCatalog({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
		skills: {},
	})
	try {
		const before = fs.readdirSync(root).sort()
		const result = runCli('--root', root)
		expect(result.status).toBe(0)
		expect(result.stdout).toMatch(/Install: npx skills add acme\/navigator/)
		// only prints the roster; no files created, nothing installed/deployed
		const after = fs.readdirSync(root).sort()
		expect(after).toEqual(before)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

// Scenario: the Tavern website page lists the cataloged crews
test('the Tavern website page lists the cataloged crews', () => {
	const markdown = renderTavernRosterMarkdown([
		{
			type: 'repo',
			repo: 'acme/navigator',
			kind: 'targeted',
			trust: 'authored',
			summary: 'Navigator crew',
			why_recommended: 'Ships a persona gateway skill',
			tags: ['crew'],
			highlights: [],
		},
	])
	expect(markdown).toContain('acme/navigator')
	expect(markdown).toContain('Install: `npx skills add acme/navigator`')
})

// Build a monorepo-layout fixture: catalog at packages/cyberplace/awesome-skills.json,
// Tavern page (with markers) at apps/website/src/content/docs/tavern/index.md.
function makeMonorepo(awesomeList: Record<string, unknown>): string {
	const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tavern-monorepo-'))
	const catalogDir = path.join(repoRoot, 'packages', 'cyberplace')
	fs.mkdirSync(catalogDir, { recursive: true })
	fs.writeFileSync(path.join(catalogDir, 'awesome-skills.json'), JSON.stringify(awesomeList, null, 2))
	const pageDir = path.join(repoRoot, 'apps', 'website', 'src', 'content', 'docs', 'tavern')
	fs.mkdirSync(pageDir, { recursive: true })
	fs.writeFileSync(
		path.join(pageDir, 'index.md'),
		'---\ntitle: Tavern\n---\n\n<!-- TAVERN-ROSTER:START -->\nplaceholder\n<!-- TAVERN-ROSTER:END -->\n',
	)
	return repoRoot
}

// Scenario: the Tavern website page lists the cataloged crews (When the website is built)
// Exercised through the REAL `cyberplace tavern render` wiring the website prebuild invokes.
test('tavern render regenerates the Tavern page from the catalog', () => {
	const repoRoot = makeMonorepo({
		version: 1,
		repos: {
			'acme/navigator': {
				repo: 'acme/navigator',
				kind: 'targeted',
				trust: 'authored',
				summary: 'Navigator crew',
				why_recommended: 'Ships a persona gateway skill',
				tags: ['crew'],
			},
		},
		skills: {},
	})
	try {
		const result = spawnSync('node', [bin, 'tavern', 'render', '--root', repoRoot], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const pagePath = path.join(repoRoot, 'apps', 'website', 'src', 'content', 'docs', 'tavern', 'index.md')
		const content = fs.readFileSync(pagePath, 'utf8')
		expect(content).toContain('acme/navigator')
		expect(content).toContain('Install: `npx skills add acme/navigator`')
	} finally {
		fs.rmSync(repoRoot, { recursive: true, force: true })
	}
})

test('tavern render writes a no-crews page when the catalog has no crews', () => {
	const repoRoot = makeMonorepo({ version: 1, repos: {}, skills: {} })
	try {
		const result = spawnSync('node', [bin, 'tavern', 'render', '--root', repoRoot], {
			encoding: 'utf8',
			env: { ...process.env, NODE_NO_WARNINGS: '1' },
		})
		expect(result.status).toBe(0)
		const pagePath = path.join(repoRoot, 'apps', 'website', 'src', 'content', 'docs', 'tavern', 'index.md')
		const content = fs.readFileSync(pagePath, 'utf8')
		expect(content).toMatch(/No crews are cataloged yet\./)
	} finally {
		fs.rmSync(repoRoot, { recursive: true, force: true })
	}
})

// Scenario: the Tavern page is reachable from the site navigation
test('the Tavern section is registered in the sidebar navigation', () => {
	const astroConfig = fs.readFileSync(path.resolve('../../apps/website/astro.config.mjs'), 'utf8')
	expect(astroConfig).toMatch(/label:\s*'Tavern'/)
	expect(astroConfig).toMatch(/slug:\s*'tavern'/)
})

test('the Tavern docs page exists', () => {
	const pagePath = path.resolve('../../apps/website/src/content/docs/tavern/index.md')
	expect(fs.existsSync(pagePath)).toBe(true)
	const content = fs.readFileSync(pagePath, 'utf8')
	expect(content).toMatch(/TAVERN-ROSTER:START/)
})
