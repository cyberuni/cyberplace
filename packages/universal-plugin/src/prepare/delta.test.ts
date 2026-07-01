import { describe, expect, it } from 'vitest'
import { emptyState, takeSnapshot } from '../state/state.js'
import { computeDelta } from './delta.js'

describe('computeDelta', () => {
	describe('Given no previous snapshot for this vendor+scope', () => {
		it('When first run, Then no actions (bootstrap — take snapshot, no diff)', () => {
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.0.0' },
				state: emptyState(),
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions).toHaveLength(0)
		})
	})

	describe('Given plugin added to current vendor', () => {
		it('When other vendor has no snapshot yet, Then no action (other vendor unknown)', () => {
			const state = takeSnapshot(emptyState(), 'claude-code', 'global', {}, '2026-06-06T00:00:00Z')
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.0.0' },
				state,
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions).toHaveLength(0)
		})

		it('When other vendor has snapshot without the plugin, Then generates install action', () => {
			let state = takeSnapshot(emptyState(), 'claude-code', 'global', {}, '2026-06-06T00:00:00Z')
			state = takeSnapshot(state, 'cursor', 'global', {}, '2026-06-06T00:00:00Z')
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.0.0' },
				state,
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions).toHaveLength(1)
			expect(actions[0]!.type).toBe('install')
			expect(actions[0]!.plugin).toBe('cyber-github')
			expect(actions[0]!.toVendor).toBe('cursor')
			expect(actions[0]!.fromVendor).toBe('claude-code')
		})
	})

	describe('Given plugin removed from current vendor', () => {
		it('When other vendor still has it, Then generates remove action', () => {
			let state = takeSnapshot(
				emptyState(),
				'claude-code',
				'global',
				{ 'cyber-github': '1.0.0' },
				'2026-06-06T00:00:00Z',
			)
			state = takeSnapshot(state, 'cursor', 'global', { 'cyber-github': '1.0.0' }, '2026-06-06T00:00:00Z')
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: {},
				state,
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions).toHaveLength(1)
			expect(actions[0]!.type).toBe('remove')
			expect(actions[0]!.toVendor).toBe('cursor')
		})
	})

	describe('Given version skew across vendors', () => {
		it('When cursor has older version, Then generates upgrade action toward cursor', () => {
			let state = takeSnapshot(
				emptyState(),
				'claude-code',
				'global',
				{ 'cyber-github': '1.2.0' },
				'2026-06-06T00:00:00Z',
			)
			state = takeSnapshot(state, 'cursor', 'global', { 'cyber-github': '1.0.0' }, '2026-06-06T00:00:00Z')
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.2.0' },
				state,
				now: '2026-06-07T10:00:00Z',
			})
			const upgrade = actions.find((a) => a.type === 'upgrade')
			expect(upgrade).toBeDefined()
			expect(upgrade!.toVendor).toBe('cursor')
			expect(upgrade!.version).toBe('1.2.0')
		})

		it('When current vendor has older version, Then no upgrade action (other vendor is newer)', () => {
			let state = takeSnapshot(
				emptyState(),
				'claude-code',
				'global',
				{ 'cyber-github': '1.0.0' },
				'2026-06-06T00:00:00Z',
			)
			state = takeSnapshot(state, 'cursor', 'global', { 'cyber-github': '1.2.0' }, '2026-06-06T00:00:00Z')
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.0.0' },
				state,
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions.filter((a) => a.type === 'upgrade')).toHaveLength(0)
		})
	})

	describe('Given action is dismissed', () => {
		it('When install is dismissed for this version, Then no action generated', () => {
			let state = takeSnapshot(emptyState(), 'claude-code', 'global', {}, '2026-06-06T00:00:00Z')
			state = takeSnapshot(state, 'cursor', 'global', {}, '2026-06-06T00:00:00Z')
			state = {
				...state,
				dismissed: {
					'cursor/global/cyber-github': {
						reason: 'version-skipped',
						version: '1.0.0',
						dismissedAt: '2026-06-01T00:00:00Z',
					},
				},
			}
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.0.0' },
				state,
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions).toHaveLength(0)
		})

		it('When install dismissed for old version but newer version is present, Then action is generated', () => {
			let state = takeSnapshot(emptyState(), 'claude-code', 'global', {}, '2026-06-06T00:00:00Z')
			state = takeSnapshot(state, 'cursor', 'global', {}, '2026-06-06T00:00:00Z')
			state = {
				...state,
				dismissed: {
					'cursor/global/cyber-github': {
						reason: 'version-skipped',
						version: '1.0.0',
						dismissedAt: '2026-06-01T00:00:00Z',
					},
				},
			}
			const actions = computeDelta({
				vendorId: 'claude-code',
				scope: 'global',
				currentPlugins: { 'cyber-github': '1.1.0' },
				state,
				now: '2026-06-07T10:00:00Z',
			})
			expect(actions).toHaveLength(1)
		})
	})
})
