import { describe, expect, it } from 'vitest'
import { resolveRoot, sanitizePane } from './paths.ts'

describe('resolveRoot', () => {
	it('prefers explicit --root/--space over the env', () => {
		expect(resolveRoot({ root: '/tmp/a', env: { CYBERFLEET_ROOT: '/tmp/b' } })).toBe('/tmp/a')
		expect(resolveRoot({ space: '/tmp/c', env: {} })).toBe('/tmp/c')
	})
	it('falls back to CYBERFLEET_ROOT, then a project-scoped default', () => {
		expect(resolveRoot({ env: { CYBERFLEET_ROOT: '/tmp/b' } })).toBe('/tmp/b')
		expect(resolveRoot({ cwd: '/tmp', env: {} })).toMatch(/\.cyberfleet$/)
	})
})

describe('sanitizePane', () => {
	it('makes a tmux pane id filesystem-safe', () => {
		expect(sanitizePane('%3')).toBe('_3')
		expect(sanitizePane('pane-1_2')).toBe('pane-1_2')
	})
})
