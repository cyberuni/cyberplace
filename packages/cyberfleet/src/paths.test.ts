import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Exec } from './identity.ts'
import { detectMode, ensureFleetMarker, resolveRoot, sanitizePane } from './paths.ts'

describe('resolveRoot', () => {
	it('prefers explicit --root/--space over the env', () => {
		expect(resolveRoot({ root: '/tmp/a', env: { CYBERFLEET_ROOT: '/tmp/b' } })).toBe('/tmp/a')
		expect(resolveRoot({ space: '/tmp/c', env: {} })).toBe('/tmp/c')
	})
	it('falls back to CYBERFLEET_ROOT, then a project-scoped default', () => {
		expect(resolveRoot({ env: { CYBERFLEET_ROOT: '/tmp/b' } })).toBe('/tmp/b')
		expect(resolveRoot({ cwd: '/tmp', env: {} })).toMatch(/\.cyberfleet$/)
	})
	it('pins the shared root at the primary checkout via --git-common-dir (ADR-0022 decision 10)', () => {
		const exec: Exec = () => '/primary/.git'
		expect(resolveRoot({ cwd: '/primary/.cyberfleet/worktrees/ship-1', env: {}, exec })).toBe('/primary/.cyberfleet')
	})
	it('falls back to the project-scoped root when not inside a git repository', () => {
		const exec: Exec = () => null
		expect(resolveRoot({ cwd: '/tmp/not-a-repo', env: {}, exec })).toBe('/tmp/not-a-repo/.cyberfleet')
	})
})

describe('detectMode', () => {
	it('reports ship when this project root carries the tracked .cyberfleet/config.json marker', () => {
		const dir = mkdtempSync(join(tmpdir(), 'cf-ship-'))
		mkdirSync(join(dir, '.cyberfleet'))
		writeFileSync(join(dir, '.cyberfleet', 'config.json'), '{}\n')
		const exec: Exec = () => null
		const info = detectMode({ cwd: dir, env: {}, exec })
		expect(info.mode).toBe('ship')
		expect(info.cwdRoot).toBe(dir)
	})
	it('reports command-center when there is no .cyberfleet/ marker here', () => {
		const dir = mkdtempSync(join(tmpdir(), 'cf-flagship-'))
		const exec: Exec = () => null
		const info = detectMode({ cwd: dir, env: {}, exec })
		expect(info.mode).toBe('command-center')
	})
	it('reports command-center when a stray empty .cyberfleet/ dir exists with no marker file', () => {
		const dir = mkdtempSync(join(tmpdir(), 'cf-stray-'))
		mkdirSync(join(dir, '.cyberfleet'))
		const exec: Exec = () => null
		const info = detectMode({ cwd: dir, env: {}, exec })
		expect(info.mode).toBe('command-center')
	})
	it('reports ship from a worktree once ensureFleetMarker has stamped its own .cyberfleet/', () => {
		const dir = mkdtempSync(join(tmpdir(), 'cf-worktree-ship-'))
		ensureFleetMarker(join(dir, '.cyberfleet'))
		const exec: Exec = () => null
		const info = detectMode({ cwd: dir, env: {}, exec })
		expect(info.mode).toBe('ship')
	})
})

describe('ensureFleetMarker', () => {
	it('creates the .cyberfleet dir and a fresh config.json marker when absent', () => {
		const dir = mkdtempSync(join(tmpdir(), 'cf-marker-'))
		const root = join(dir, '.cyberfleet')
		ensureFleetMarker(root)
		expect(existsSync(join(root, 'config.json'))).toBe(true)
	})
	it('is idempotent — never overwrites an existing marker', () => {
		const dir = mkdtempSync(join(tmpdir(), 'cf-marker-'))
		const root = join(dir, '.cyberfleet')
		mkdirSync(root, { recursive: true })
		writeFileSync(join(root, 'config.json'), 'kept\n')
		ensureFleetMarker(root)
		expect(readFileSync(join(root, 'config.json'), 'utf8')).toBe('kept\n')
	})
})

describe('sanitizePane', () => {
	it('makes a tmux pane id filesystem-safe', () => {
		expect(sanitizePane('%3')).toBe('_3')
		expect(sanitizePane('pane-1_2')).toBe('pane-1_2')
	})
})
