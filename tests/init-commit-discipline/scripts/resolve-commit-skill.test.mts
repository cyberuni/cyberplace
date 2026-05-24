import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { expect, test } from 'vitest'

import {
	BUNDLED_COMMIT_SKILL,
	detectCommitSkills,
	RECOMMENDED_COMMIT_SKILL,
	resolveCommitSkillName,
} from '../../../skills/init-commit-discipline/scripts/resolve-commit-skill.mts'

test('resolveCommitSkillName prefers commit-work when present', () => {
	const detected = [
		{ name: 'commit', path: '/x/commit/SKILL.md' },
		{ name: 'commit-work', path: '/x/commit-work/SKILL.md' },
	]
	expect(resolveCommitSkillName(detected)).toBe(RECOMMENDED_COMMIT_SKILL)
})

test('resolveCommitSkillName returns null when multiple and no preference', () => {
	const detected = [
		{ name: 'commit', path: '/x/commit/SKILL.md' },
		{ name: 'git-commit', path: '/x/git-commit/SKILL.md' },
	]
	expect(resolveCommitSkillName(detected)).toBeNull()
})

test('resolveCommitSkillName uses preferred name', () => {
	expect(resolveCommitSkillName([], 'my-commit')).toBe('my-commit')
})

test('detectCommitSkills finds repo-local commit skill', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-commit-'))
	try {
		const skillDir = path.join(root, '.agents', 'skills', 'commit')
		fs.mkdirSync(skillDir, { recursive: true })
		fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '---\nname: commit\n---\n')
		const detected = detectCommitSkills(root)
		expect(detected.some((s) => s.name === 'commit')).toBe(true)
	} finally {
		fs.rmSync(root, { recursive: true, force: true })
	}
})

test('bundled fallback constant matches commit skill name', () => {
	expect(BUNDLED_COMMIT_SKILL).toBe('commit')
})
