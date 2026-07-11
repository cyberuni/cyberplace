import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectMode } from './mode.ts'

function seedMarker(root: string) {
	mkdirSync(join(root, '.agents', 'cyberfleet'), { recursive: true })
	writeFileSync(join(root, '.agents', 'cyberfleet', 'ship.json'), `${JSON.stringify({ version: 1 }, null, 2)}\n`)
}

describe('detectMode', () => {
	// Scenario: a project root carrying the cyberfleet marker is a ship
	it('reports ship when .agents/cyberfleet/ship.json is present at the project root', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-'))
		seedMarker(cwd)
		const info = detectMode({ cwd, env: {} })
		expect(info.mode).toBe('ship')
	})

	// Scenario: a project root with no cyberfleet marker is the command-center
	it('reports command-center when no .agents/cyberfleet/ marker is present', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-'))
		const info = detectMode({ cwd, env: {} })
		expect(info.mode).toBe('command-center')
		expect(info.cwdRoot).toBe(cwd)
	})

	// Scenario Outline: any working directory carrying the marker is a ship regardless of git shape
	describe('git shape does not change the verdict when the marker is present', () => {
		it('git primary checkout — marker at the repo root is a ship', () => {
			const root = mkdtempSync(join(tmpdir(), 'cf-mode-primary-'))
			execFileSync('git', ['init', '-q'], { cwd: root })
			seedMarker(root)
			const nested = join(root, 'sub', 'dir')
			mkdirSync(nested, { recursive: true })
			// walking up from a nested working dir still resolves to the marked repo root
			const info = detectMode({ cwd: nested, env: {} })
			expect(info.mode).toBe('ship')
			expect(info.cwdRoot).toBe(root)
		})

		it('git linked worktree — marker committed at the primary travels to the worktree root', () => {
			const primary = mkdtempSync(join(tmpdir(), 'cf-mode-wt-primary-'))
			execFileSync('git', ['init', '-q'], { cwd: primary })
			execFileSync('git', ['config', 'user.email', 'a@b.c'], { cwd: primary })
			execFileSync('git', ['config', 'user.name', 'a'], { cwd: primary })
			seedMarker(primary)
			execFileSync('git', ['add', '.'], { cwd: primary })
			execFileSync('git', ['commit', '-q', '-m', 'init'], { cwd: primary })
			const worktree = join(tmpdir(), `cf-mode-wt-linked-${Date.now()}`)
			execFileSync('git', ['worktree', 'add', '-q', '-b', 'cf-mode-wt-branch', worktree], { cwd: primary })
			const info = detectMode({ cwd: worktree, env: {} })
			expect(info.mode).toBe('ship')
			expect(info.cwdRoot).toBe(worktree)
		})

		it('non-git folder — marker present at the folder itself is a ship', () => {
			const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-nogit-'))
			seedMarker(cwd)
			const info = detectMode({ cwd, env: {} })
			expect(info.mode).toBe('ship')
			expect(info.cwdRoot).toBe(cwd)
		})
	})

	// Scenario: a non-git folder with no marker is the command-center
	it('reports command-center for a non-git folder with no marker', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-nogit-'))
		const info = detectMode({ cwd, env: {} })
		expect(info.mode).toBe('command-center')
		expect(info.cwdRoot).toBe(cwd)
	})

	it('resolves fleetRoot via cyberlegion resolveRoot (explicit --root/--space wins)', () => {
		const cwd = mkdtempSync(join(tmpdir(), 'cf-mode-'))
		const info = detectMode({ cwd, root: '/tmp/explicit-hub', env: {} })
		expect(info.fleetRoot).toBe('/tmp/explicit-hub')
	})
})
