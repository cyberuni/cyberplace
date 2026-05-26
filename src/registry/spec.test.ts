import { expect, test } from 'vitest'
import { formatRepoSpec, isNpmSpec, isRepoSpec, parseSpec } from './spec.js'

test('parseSpec: org/repo → repo spec', () => {
	const spec = parseSpec('cyberuni/cyber-skills')
	expect(spec).toMatchObject({ type: 'repo', owner: 'cyberuni', repo: 'cyber-skills' })
})

test('parseSpec: org/repo:skill → repo spec with skill', () => {
	const spec = parseSpec('cyberuni/cyber-skills:commit')
	expect(spec).toMatchObject({ type: 'repo', owner: 'cyberuni', repo: 'cyber-skills', skill: 'commit' })
})

test('parseSpec: @org/package → npm spec', () => {
	const spec = parseSpec('@myorg/skills')
	expect(spec).toMatchObject({ type: 'npm', packageName: '@myorg/skills' })
})

test('parseSpec: @org/scoped → npm spec', () => {
	const spec = parseSpec('@myorg/cyber-asana')
	expect(spec).toMatchObject({ type: 'npm', packageName: '@myorg/cyber-asana' })
})

test('parseSpec: plain-name → npm spec', () => {
	const spec = parseSpec('cyber-asana')
	expect(spec).toMatchObject({ type: 'npm', packageName: 'cyber-asana' })
})

test('parseSpec: preserves raw input on repo spec', () => {
	expect(parseSpec('org/repo').raw).toBe('org/repo')
})

test('parseSpec: preserves raw input on npm spec', () => {
	expect(parseSpec('@org/pkg').raw).toBe('@org/pkg')
})

test('isRepoSpec returns true for repo', () => {
	expect(isRepoSpec(parseSpec('org/repo'))).toBe(true)
})

test('isRepoSpec returns false for npm', () => {
	expect(isRepoSpec(parseSpec('@org/pkg'))).toBe(false)
})

test('isNpmSpec returns true for npm', () => {
	expect(isNpmSpec(parseSpec('@org/pkg'))).toBe(true)
})

test('isNpmSpec returns false for repo', () => {
	expect(isNpmSpec(parseSpec('org/repo'))).toBe(false)
})

test('formatRepoSpec without skill', () => {
	const spec = parseSpec('org/repo')
	if (!isRepoSpec(spec)) throw new Error('expected repo spec')
	expect(formatRepoSpec(spec)).toBe('org/repo')
})

test('formatRepoSpec with skill', () => {
	const spec = parseSpec('org/repo:commit')
	if (!isRepoSpec(spec)) throw new Error('expected repo spec')
	expect(formatRepoSpec(spec)).toBe('org/repo:commit')
})
