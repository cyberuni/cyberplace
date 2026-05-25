import { expect, test } from 'vitest'

import {
	formatCommitDisciplineSection,
	mergeCommitDisciplineIntoAgentsMd,
	parseCommitDisciplineSection,
} from './content.js'

test('formatCommitDisciplineSection includes skill name without auto-commit by default', () => {
	const section = formatCommitDisciplineSection('commit-work')
	expect(section).toContain('## Commit Discipline')
	expect(section).toContain('commit-work')
	expect(section).toContain('Conventional Commits')
	expect(section).not.toContain('Auto-commit rule')
})

test('formatCommitDisciplineSection includes auto-commit when opted in', () => {
	const section = formatCommitDisciplineSection('commit-work', { autoCommit: true })
	expect(section).toContain('Auto-commit rule')
	expect(section).toContain('do not wait for the user to ask')
})

test('formatCommitDisciplineSection uses agent-compatible staging guidance', () => {
	const section = formatCommitDisciplineSection('commit')
	expect(section).toContain('Unit of work')
	expect(section).toContain('git add <files>')
	expect(section).toContain('git diff --cached')
	expect(section).toContain('git add -p')
	expect(section).not.toMatch(/Use `git add -p`/)
})

test('mergeCommitDisciplineIntoAgentsMd appends when section missing', () => {
	const agents = '# AGENTS.md\n\nSome intro.\n'
	const merged = mergeCommitDisciplineIntoAgentsMd(agents, 'commit')
	expect(merged).toContain('## Commit Discipline')
	expect(merged).toContain('`commit` skill')
})

test('mergeCommitDisciplineIntoAgentsMd replaces existing section', () => {
	const agents = '# AGENTS.md\n\n## Commit Discipline\n\nOld content.\n\n## Other\n\nStay.\n'
	const merged = mergeCommitDisciplineIntoAgentsMd(agents, 'commit-work', { autoCommit: true })
	expect(merged).not.toContain('Old content')
	expect(merged).toContain('commit-work')
	expect(merged).toContain('Auto-commit rule')
	expect(merged).toContain('## Other')
})

test('parseCommitDisciplineSection returns section text', () => {
	const agents = '## Commit Discipline\n\n- Rule one\n\n## Next\n'
	const parsed = parseCommitDisciplineSection(agents)
	expect(parsed).toContain('Rule one')
})
