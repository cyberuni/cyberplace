import { expect, test } from 'vitest'

import {
	formatCommitDisciplineSection,
	mergeCommitDisciplineIntoAgentsMd,
	parseCommitDisciplineSection,
} from '../../hooks/lib/commit-discipline-content.mts'

test('formatCommitDisciplineSection includes skill name', () => {
	const section = formatCommitDisciplineSection('commit-work')
	expect(section).toContain('## Commit Discipline')
	expect(section).toContain('commit-work')
	expect(section).toContain('Conventional Commits')
})

test('mergeCommitDisciplineIntoAgentsMd appends when section missing', () => {
	const agents = '# AGENTS.md\n\nSome intro.\n'
	const merged = mergeCommitDisciplineIntoAgentsMd(agents, 'commit')
	expect(merged).toContain('## Commit Discipline')
	expect(merged).toContain('`commit` skill')
})

test('mergeCommitDisciplineIntoAgentsMd replaces existing section', () => {
	const agents = '# AGENTS.md\n\n## Commit Discipline\n\nOld content.\n\n## Other\n\nStay.\n'
	const merged = mergeCommitDisciplineIntoAgentsMd(agents, 'commit-work')
	expect(merged).not.toContain('Old content')
	expect(merged).toContain('commit-work')
	expect(merged).toContain('## Other')
})

test('parseCommitDisciplineSection returns section text', () => {
	const agents = '## Commit Discipline\n\n- Rule one\n\n## Next\n'
	const parsed = parseCommitDisciplineSection(agents)
	expect(parsed).toContain('Rule one')
})
