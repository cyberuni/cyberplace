//#region src/hooks/lib/commit-discipline-content.mts
const COMMIT_DISCIPLINE_HEADING = "## Commit Discipline";
function formatCommitDisciplineSection(commitSkill) {
	return `${COMMIT_DISCIPLINE_HEADING}

Commit every self-contained unit of work — code, config, skills — as its own commit before moving on.

- Conventional Commits: \`feat:\`, \`fix:\`, \`refactor:\`, \`test:\`, \`docs:\`, \`chore:\`
- One concern per commit; never batch unrelated changes
- Use \`git add -p\` for mixed changes in one file
- Never commit with red tests; run validation commands first
- Use the \`${commitSkill}\` skill when committing (staging, splitting, message writing)
`;
}
/** Extract body of ## Commit Discipline from AGENTS.md, or null if missing. */
function parseCommitDisciplineSection(agentsMd) {
	const heading = COMMIT_DISCIPLINE_HEADING;
	const start = agentsMd.indexOf(heading);
	if (start === -1) return null;
	const afterHeading = agentsMd.slice(start + 20);
	const nextHeading = afterHeading.search(/\n## /);
	const trimmed = (nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading)).trim();
	return trimmed.length > 0 ? `${heading}\n\n${trimmed}\n` : `${heading}\n`;
}
/** Replace or append the Commit Discipline section in AGENTS.md. */
function mergeCommitDisciplineIntoAgentsMd(agentsMd, commitSkill) {
	const section = formatCommitDisciplineSection(commitSkill);
	if (parseCommitDisciplineSection(agentsMd) !== null) {
		const heading = COMMIT_DISCIPLINE_HEADING;
		const start = agentsMd.indexOf(heading);
		const nextHeading = agentsMd.slice(start + 20).search(/\n## /);
		const end = nextHeading === -1 ? agentsMd.length : start + 20 + nextHeading;
		return agentsMd.slice(0, start) + section.trimEnd() + "\n" + agentsMd.slice(end).replace(/^\n*/, "\n");
	}
	const augIdx = agentsMd.indexOf("## Skill Augmentations");
	if (augIdx !== -1) {
		const nextHeading = agentsMd.slice(augIdx).search(/\n## /);
		const insertAt = nextHeading === -1 ? agentsMd.length : augIdx + nextHeading;
		return `${agentsMd.slice(0, insertAt).trimEnd()}\n\n${section.trimEnd()}\n${agentsMd.slice(insertAt)}`;
	}
	return `${agentsMd.trimEnd()}\n\n${section.trimEnd()}\n`;
}
//#endregion
export { COMMIT_DISCIPLINE_HEADING, formatCommitDisciplineSection, mergeCommitDisciplineIntoAgentsMd, parseCommitDisciplineSection };
