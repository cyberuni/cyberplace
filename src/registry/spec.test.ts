import { expect, test } from 'vitest'
import { formatRepoSpec, isGitUrlSpec, isNpmSpec, isRepoSpec, parseSpec } from './spec.js'

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

// git-url specs

test('parseSpec: GitHub browser URL with branch → git-url spec', () => {
	const spec = parseSpec('https://github.com/repobuddy/storybook/tree/variant')
	expect(spec).toMatchObject({
		type: 'git-url',
		owner: 'repobuddy',
		repo: 'storybook',
		branch: 'variant',
		cloneUrl: 'https://github.com/repobuddy/storybook',
		host: 'https://github.com',
		providerHint: 'github',
	})
})

test('parseSpec: GitHub bare HTTPS URL → git-url spec with no branch', () => {
	const spec = parseSpec('https://github.com/cyberuni/cyber-skills')
	expect(spec).toMatchObject({
		type: 'git-url',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		cloneUrl: 'https://github.com/cyberuni/cyber-skills',
		host: 'https://github.com',
		providerHint: null,
	})
	if (!isGitUrlSpec(spec)) throw new Error('expected git-url spec')
	expect(spec.branch).toBeUndefined()
})

test('parseSpec: HTTPS URL with .git suffix stripped', () => {
	const spec = parseSpec('https://github.com/cyberuni/cyber-skills.git')
	expect(spec).toMatchObject({
		type: 'git-url',
		cloneUrl: 'https://github.com/cyberuni/cyber-skills',
	})
})

test('parseSpec: bare HTTPS URL with #branch fragment', () => {
	const spec = parseSpec('https://github.com/cyberuni/cyber-skills#develop')
	expect(spec).toMatchObject({
		type: 'git-url',
		branch: 'develop',
		cloneUrl: 'https://github.com/cyberuni/cyber-skills',
		providerHint: null,
	})
})

test('parseSpec: GitLab browser URL (/-/tree/) → git-url spec with gitlab hint', () => {
	const spec = parseSpec('https://gitlab.com/owner/myrepo/-/tree/main')
	expect(spec).toMatchObject({
		type: 'git-url',
		owner: 'owner',
		repo: 'myrepo',
		branch: 'main',
		cloneUrl: 'https://gitlab.com/owner/myrepo',
		host: 'https://gitlab.com',
		providerHint: 'gitlab',
	})
})

test('parseSpec: self-hosted GitLab URL → providerHint gitlab', () => {
	const spec = parseSpec('https://git.mycompany.com/team/myrepo/-/tree/feature')
	expect(spec).toMatchObject({
		type: 'git-url',
		owner: 'team',
		repo: 'myrepo',
		branch: 'feature',
		host: 'https://git.mycompany.com',
		providerHint: 'gitlab',
	})
})

test('parseSpec: Gitea /src/branch/ URL → git-url spec with gitea hint', () => {
	const spec = parseSpec('https://gitea.example.com/owner/repo/src/branch/feature')
	expect(spec).toMatchObject({
		type: 'git-url',
		owner: 'owner',
		repo: 'repo',
		branch: 'feature',
		host: 'https://gitea.example.com',
		providerHint: 'gitea',
	})
})

test('parseSpec: SSH URL → git-url spec with no providerHint', () => {
	const spec = parseSpec('git@github.com:cyberuni/cyber-skills.git')
	expect(spec).toMatchObject({
		type: 'git-url',
		owner: 'cyberuni',
		repo: 'cyber-skills',
		host: 'https://github.com',
		providerHint: null,
	})
	if (!isGitUrlSpec(spec)) throw new Error('expected git-url spec')
	expect(spec.branch).toBeUndefined()
})

test('parseSpec: preserves raw input on git-url spec', () => {
	const url = 'https://github.com/owner/repo/tree/main'
	expect(parseSpec(url).raw).toBe(url)
})

test('isGitUrlSpec returns true for git-url', () => {
	expect(isGitUrlSpec(parseSpec('https://github.com/owner/repo'))).toBe(true)
})

test('isGitUrlSpec returns false for repo shorthand', () => {
	expect(isGitUrlSpec(parseSpec('owner/repo'))).toBe(false)
})

test('isGitUrlSpec returns false for npm', () => {
	expect(isGitUrlSpec(parseSpec('@org/pkg'))).toBe(false)
})
