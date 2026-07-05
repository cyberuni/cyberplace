import { describe, expect, it } from 'vitest'
import type { PinFs } from '../pin/fs.js'
import type { PinResolution, RegistryClient } from '../pin/pin.js'
import type { PinResolutionList } from './build.js'
import { resolvePins } from './build.js'

function fakeFs(files: Record<string, string>): PinFs & { files: Record<string, string> } {
	return {
		files,
		listSkillFiles: () => Object.keys(files),
		readFile: (p) => files[p]!,
		writeFile: (p, c) => {
			files[p] = c
		},
	}
}

function fakeRegistry(data: Record<string, { latest: string; versions: string[] } | null>): RegistryClient {
	return {
		async fetchVersions(pkg: string) {
			return data[pkg] ?? null
		},
	}
}

describe('resolvePins', () => {
	it('resolves and rewrites a referenced CLI within its major', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '1.4.2', versions: ['1.2.0', '1.4.2'] } })

		const results = await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.4.2')
		expect([...results]).toEqual([{ package: 'cyberplace', current: '1.2.0', resolved: '1.4.2', status: 'updated' }])
	})

	it('does not cross a major boundary by default', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] } })

		await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.4.2')
		expect(fs.files['/skills/x/SKILL.md']).not.toContain('2.0.0')
	})

	it('--allow-major crosses the major boundary', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] } })

		await resolvePins('/root', { allowMajor: true }, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@2.0.0')
	})

	it('resolves a placeholder pin to the absolute latest', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@<version>' })
		const registry = fakeRegistry({ cyberplace: { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] } })

		await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@2.0.0')
	})

	it('converges every occurrence of a package, anchoring the major on a concrete pin', async () => {
		// A concrete pin and a placeholder for the same package both land on the same resolved
		// value, and the concrete pin anchors the major (no jump to absolute latest 2.0.0).
		const fs = fakeFs({
			'/skills/a/SKILL.md': 'run `npx cyberplace@1.2.0`',
			'/skills/b/SKILL.md': 'or npx cyberplace@<version> here',
		})
		const registry = fakeRegistry({ cyberplace: { latest: '2.0.0', versions: ['1.2.0', '1.4.2', '2.0.0'] } })

		const results = await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/a/SKILL.md']).toBe('run `npx cyberplace@1.4.2`')
		expect(fs.files['/skills/b/SKILL.md']).toBe('or npx cyberplace@1.4.2 here')
		expect([...results]).toEqual([{ package: 'cyberplace', current: '1.2.0', resolved: '1.4.2', status: 'updated' }])
	})

	it.each([
		['exact', '1.4.2'],
		['tilde', '~1.4.2'],
		['caret', '^1.4.2'],
	] as const)('--range %s writes %s', async (style, written) => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '1.4.2', versions: ['1.2.0', '1.4.2'] } })

		await resolvePins('/root', { range: style }, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe(`npx cyberplace@${written}`)
	})

	it('accepts a custom registry client (constructor arg equivalent)', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '1.9.0', versions: ['1.2.0', '1.9.0'] } })

		await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.9.0')
	})

	it('--package limits resolution to the named CLI', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0 and npx cyberfleet@1.0.0' })
		const registry = fakeRegistry({
			cyberplace: { latest: '1.4.2', versions: ['1.2.0', '1.4.2'] },
			cyberfleet: { latest: '1.3.0', versions: ['1.0.0', '1.3.0'] },
		})

		const results = await resolvePins('/root', { packages: ['cyberplace'] }, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toContain('npx cyberplace@1.4.2')
		expect(fs.files['/skills/x/SKILL.md']).toContain('npx cyberfleet@1.0.0')
		expect(results.map((r) => r.package)).toEqual(['cyberplace'])
	})

	it('--package composes across repeated flags', async () => {
		const fs = fakeFs({
			'/skills/x/SKILL.md': 'npx cyberplace@1.2.0, npx cyberfleet@1.0.0, npx universal-plugin@0.1.0',
		})
		const registry = fakeRegistry({
			cyberplace: { latest: '1.4.2', versions: ['1.2.0', '1.4.2'] },
			cyberfleet: { latest: '1.3.0', versions: ['1.0.0', '1.3.0'] },
			'universal-plugin': { latest: '0.2.0', versions: ['0.1.0', '0.2.0'] },
		})

		await resolvePins('/root', { packages: ['cyberplace', 'cyberfleet'] }, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toContain('npx cyberplace@1.4.2')
		expect(fs.files['/skills/x/SKILL.md']).toContain('npx cyberfleet@1.3.0')
		expect(fs.files['/skills/x/SKILL.md']).toContain('npx universal-plugin@0.1.0')
	})

	it('pin rewriting is idempotent', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.4.2' })
		const registry = fakeRegistry({ cyberplace: { latest: '1.4.2', versions: ['1.4.2'] } })

		const results = await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.4.2')
		expect([...results]).toEqual([{ package: 'cyberplace', current: '1.4.2', resolved: '1.4.2', status: 'unchanged' }])
	})

	it('a registry failure warns and skips that package without rewriting', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: null })

		const results = (await resolvePins('/root', {}, registry, fs)) as PinResolutionList

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.2.0')
		expect([...results]).toEqual([{ package: 'cyberplace', current: '1.2.0', resolved: '1.2.0', status: 'skipped' }])
		expect(results.warnings.some((w) => w.includes('cyberplace'))).toBe(true)
	})

	it('an unresolvable package (not-found) warns and skips', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx no-such-pkg@1.0.0' })
		const registry = fakeRegistry({ 'no-such-pkg': null })

		const results = (await resolvePins('/root', {}, registry, fs)) as PinResolutionList

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx no-such-pkg@1.0.0')
		expect(results[0]?.status).toBe('skipped')
		expect(results.warnings.some((w) => w.includes('no-such-pkg'))).toBe(true)
	})

	it('a package with no newer version in the current major is left unchanged', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '2.0.0', versions: ['1.2.0', '2.0.0'] } })

		const results = await resolvePins('/root', {}, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.2.0')
		expect(results[0]?.status).toBe('unchanged')
	})

	it('--dry-run reports resolved pins without writing them', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0' })
		const registry = fakeRegistry({ cyberplace: { latest: '1.4.2', versions: ['1.2.0', '1.4.2'] } })

		const results = await resolvePins('/root', { dryRun: true }, registry, fs)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@1.2.0')
		expect([...results]).toEqual<PinResolution[]>([
			{ package: 'cyberplace', current: '1.2.0', resolved: '1.4.2', status: 'updated' },
		])
	})

	it('a build with multiple pins returns one row per package with counts derivable', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@1.2.0 npx cyberfleet@1.0.0' })
		const registry = fakeRegistry({
			cyberplace: { latest: '1.4.2', versions: ['1.2.0', '1.4.2'] },
			cyberfleet: { latest: '1.3.0', versions: ['1.0.0', '1.3.0'] },
		})

		const results = await resolvePins('/root', {}, registry, fs)

		expect(results).toHaveLength(2)
		for (const r of results) {
			expect(['updated', 'unchanged', 'skipped']).toContain(r.status)
		}
	})

	it('returns an empty result when no pins are present', async () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'no references here' })
		const registry = fakeRegistry({})

		const results = await resolvePins('/root', {}, registry, fs)

		expect([...results]).toEqual([])
	})
})
