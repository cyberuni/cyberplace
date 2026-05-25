import { parseMarkdownSection } from '../hook/extract-section.js'

const COMMIT_DISCIPLINE_HEADING = '## Commit Discipline'

export function formatCommitDisciplineSection(commitSkill: string): string {
	return `${COMMIT_DISCIPLINE_HEADING}

Commit every self-contained unit of work — code, config, skills — as its own commit before moving on.

**Unit of work:** one coherent, independently revertable change — one domain's refactor, one feature, one bugfix, one test suite expansion for one concern, one config change. Never two unrelated concerns in the same commit. A TDD red-green-refactor cycle alone is not a commit boundary; commit when the full intended change is complete and tests pass. If the working tree has unrelated changes, leave them unstaged — commit the current unit first, then continue.

- Conventional Commits: \`feat:\`, \`fix:\`, \`refactor:\`, \`test:\`, \`docs:\`, \`chore:\`
- One concern per commit; never batch unrelated changes
- Stage only files for this unit: \`git add <files>\`, then verify with \`git diff --cached\`
- Never use \`git add .\`, \`git add -A\`, or \`git add -p\` (interactive commands agents cannot run)
- Never commit with red tests; run validation commands first
- Use the \`${commitSkill}\` skill when committing (staging, splitting, message writing)
`
}

/** Extract body of ## Commit Discipline from AGENTS.md, or null if missing. */
export function parseCommitDisciplineSection(agentsMd: string): string | null {
	return parseMarkdownSection(agentsMd, COMMIT_DISCIPLINE_HEADING)
}

/** Replace or append the Commit Discipline section in AGENTS.md. */
export function mergeCommitDisciplineIntoAgentsMd(agentsMd: string, commitSkill: string): string {
	const section = formatCommitDisciplineSection(commitSkill)
	const existing = parseCommitDisciplineSection(agentsMd)

	if (existing !== null) {
		const heading = COMMIT_DISCIPLINE_HEADING
		const start = agentsMd.indexOf(heading)
		const afterHeading = agentsMd.slice(start + heading.length)
		const nextHeading = afterHeading.search(/\n## /)
		const end = nextHeading === -1 ? agentsMd.length : start + heading.length + nextHeading
		return agentsMd.slice(0, start) + section.trimEnd() + '\n' + agentsMd.slice(end).replace(/^\n*/, '\n')
	}

	const skillAugHeading = '## Skill Augmentations'
	const augIdx = agentsMd.indexOf(skillAugHeading)
	if (augIdx !== -1) {
		const afterAug = agentsMd.slice(augIdx)
		const nextHeading = afterAug.search(/\n## /)
		const insertAt = nextHeading === -1 ? agentsMd.length : augIdx + nextHeading
		return `${agentsMd.slice(0, insertAt).trimEnd()}\n\n${section.trimEnd()}\n${agentsMd.slice(insertAt)}`
	}

	return `${agentsMd.trimEnd()}\n\n${section.trimEnd()}\n`
}
