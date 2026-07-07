import { describe, expect, it } from 'vitest'
import type { PinFs } from '../pin/fs.js'
import type { BundlePin, VersionSource } from './bundle.js'
import { bundlePins, isPinExempt } from './bundle.js'

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

function fakeWorkspace(entries: Record<string, string | undefined>): VersionSource {
	return {
		resolve(pkg: string) {
			if (!(pkg in entries)) return { inWorkspace: false }
			return { inWorkspace: true, version: entries[pkg] }
		},
	}
}

// ── Pin from workspace ──
// Scenario: bundle pins a workspace CLI to its local package.json version
describe('bundlePins — pin from workspace', () => {
	it('rewrites a concrete pin to the workspace version', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@0.0.9' })
		const workspace = fakeWorkspace({ cyberplace: '0.1.0' })

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@0.1.0')
		expect(result.pins).toEqual<BundlePin[]>([
			{ package: 'cyberplace', current: '0.0.9', resolved: '0.1.0', status: 'pinned' },
		])
	})

	// Scenario: a placeholder pin on a workspace CLI resolves to the workspace version
	it('resolves a placeholder pin to the workspace version', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@<version>' })
		const workspace = fakeWorkspace({ cyberplace: '0.1.0' })

		bundlePins(fs, workspace)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@0.1.0')
	})

	// Scenario: bundle pins to the workspace version even when a registry would resolve
	// differently, and resolves with no network access — structurally guaranteed: bundlePins
	// takes a VersionSource, never a registry client or fetch, so there is no network path to
	// diverge from the workspace value.
	it('has no registry/network dependency to diverge from the workspace value', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@0.0.9' })
		const workspace = fakeWorkspace({ cyberplace: '0.1.0' })

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/x/SKILL.md']).toContain('0.1.0')
		expect(fs.files['/skills/x/SKILL.md']).not.toContain('0.2.0')
		expect(result.pins[0]?.resolved).toBe('0.1.0')
	})
})

// ── Idempotent ──
// Scenario: a pin already at the workspace version is left unchanged
describe('bundlePins — idempotent', () => {
	it('leaves a pin already at the workspace version unchanged', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@0.1.0' })
		const workspace = fakeWorkspace({ cyberplace: '0.1.0' })

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@0.1.0')
		expect(result.pins).toEqual<BundlePin[]>([
			{ package: 'cyberplace', current: '0.1.0', resolved: '0.1.0', status: 'unchanged' },
		])
	})
})

// ── Best-effort on a broken workspace entry ──
// Scenario: a workspace package whose local package.json is unreadable warns and skips
describe('bundlePins — unreadable workspace entry', () => {
	it('warns, skips the package, and leaves the file untouched', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberfleet@0.0.1' })
		const workspace = fakeWorkspace({ cyberfleet: undefined })

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberfleet@0.0.1')
		expect(result.pins).toEqual<BundlePin[]>([
			{ package: 'cyberfleet', current: '0.0.1', resolved: '0.0.1', status: 'skipped' },
		])
		expect(result.warnings.some((w) => w.includes('cyberfleet'))).toBe(true)
	})
})

// ── Doc-example ignore ──
describe('isPinExempt', () => {
	it('detects the metadata.pin-exempt marker in frontmatter', () => {
		const content = '---\nname: upgrade-universal-plugin\nmetadata:\n  pin-exempt: true\n---\nbody\n'
		expect(isPinExempt(content)).toBe(true)
	})

	it('is false when the marker is absent', () => {
		expect(isPinExempt('---\nname: x\n---\nbody')).toBe(false)
	})

	it('is false when there is no frontmatter at all', () => {
		expect(isPinExempt('no frontmatter here')).toBe(false)
	})
})

describe('bundlePins — pin-exempt skill', () => {
	// Scenario: a skill marked as pin-exempt is never rewritten
	it('never rewrites a pin-exempt skill and emits no pins row for its packages', () => {
		const fs = fakeFs({
			'/skills/upgrade-universal-plugin/SKILL.md':
				'---\nname: upgrade-universal-plugin\nmetadata:\n  pin-exempt: true\n---\nnpx universal-plugin@1.2.3 and npx universal-plugin@<old-version>',
		})
		const workspace = fakeWorkspace({ 'universal-plugin': '9.9.9' })

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/upgrade-universal-plugin/SKILL.md']).toContain('npx universal-plugin@1.2.3')
		expect(fs.files['/skills/upgrade-universal-plugin/SKILL.md']).toContain('npx universal-plugin@<old-version>')
		expect(result.pins).toEqual([])
	})

	// Scenario: a pin-exempt skill is skipped even when its package is a workspace CLI
	it('skips a pin-exempt skill even when its package resolves in the workspace', () => {
		const fs = fakeFs({
			'/skills/upgrade-universal-plugin/SKILL.md':
				'---\nname: upgrade-universal-plugin\nmetadata:\n  pin-exempt: true\n---\nnpx universal-plugin@<version>',
		})
		const workspace = fakeWorkspace({ 'universal-plugin': '0.2.1' })

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/upgrade-universal-plugin/SKILL.md']).toContain('npx universal-plugin@<version>')
		expect(result.pins).toEqual([])
	})
})

// ── External / non-workspace pins ──
// Scenario: a pin for a package with no workspace entry is left untouched
describe('bundlePins — external package', () => {
	it('leaves an external pin untouched and reports it skipped', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx gherkin-cli@0.0.1' })
		const workspace = fakeWorkspace({})

		const result = bundlePins(fs, workspace)

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx gherkin-cli@0.0.1')
		expect(result.pins).toEqual<BundlePin[]>([
			{ package: 'gherkin-cli', current: '0.0.1', resolved: '0.0.1', status: 'skipped' },
		])
	})
})

// ── Write control ──
// Scenario: --dry-run reports resolved pins without writing them
describe('bundlePins — dry-run', () => {
	it('resolves and reports without writing', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@0.0.9' })
		const workspace = fakeWorkspace({ cyberplace: '0.1.0' })

		const result = bundlePins(fs, workspace, { dryRun: true })

		expect(fs.files['/skills/x/SKILL.md']).toBe('npx cyberplace@0.0.9')
		expect(result.pins).toEqual<BundlePin[]>([
			{ package: 'cyberplace', current: '0.0.9', resolved: '0.1.0', status: 'pinned' },
		])
	})
})

// ── AXI output contract — pins shape ──
// Scenario: a bundle prints TOON pins rows and a pre-computed aggregate (data-shape half; the
// rendering itself is exercised at the CLI/e2e layer)
describe('bundlePins — multiple packages', () => {
	it('returns one row per package with a status the aggregate can be derived from', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'npx cyberplace@0.0.9 and npx cyberfleet@0.0.1' })
		const workspace = fakeWorkspace({ cyberplace: '0.1.0', cyberfleet: '0.0.1' })

		const result = bundlePins(fs, workspace)

		expect(result.pins).toHaveLength(2)
		for (const pin of result.pins) {
			expect(['pinned', 'unchanged', 'skipped']).toContain(pin.status)
		}
		const pinned = result.pins.filter((p) => p.status === 'pinned').length
		const unchanged = result.pins.filter((p) => p.status === 'unchanged').length
		expect(pinned).toBe(1)
		expect(unchanged).toBe(1)
	})
})

// Scenario: no pins to resolve is a definitive empty state
describe('bundlePins — empty state', () => {
	it('returns no pins when no skill references an npx <pkg>@<pin>', () => {
		const fs = fakeFs({ '/skills/x/SKILL.md': 'no references here' })
		const workspace = fakeWorkspace({})

		const result = bundlePins(fs, workspace)

		expect(result.pins).toEqual([])
	})
})
