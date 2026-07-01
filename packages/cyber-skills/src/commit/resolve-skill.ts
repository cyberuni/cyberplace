import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const RECOMMENDED_COMMIT_SKILL = 'commit-work'
export const RECOMMENDED_INSTALL = 'npx skills add softaworks/agent-toolkit --skill commit-work -g'
export const BUNDLED_COMMIT_SKILL = 'commit'

const KNOWN_COMMIT_SKILL_NAMES = new Set(['commit-work', 'commit', 'git-commit', 'commit-workflow'])

export interface DetectedCommitSkill {
	name: string
	path: string
}

function skillDirs(root: string): string[] {
	const home = homedir()
	return [
		join(root, '.agents', 'skills'),
		join(home, '.agents', 'skills'),
		join(root, '.claude', 'skills'),
		join(home, '.claude', 'skills'),
	]
}

export function detectCommitSkills(root = process.cwd()): DetectedCommitSkill[] {
	const found = new Map<string, DetectedCommitSkill>()

	for (const base of skillDirs(root)) {
		if (!existsSync(base)) continue
		for (const name of KNOWN_COMMIT_SKILL_NAMES) {
			const skillPath = join(base, name, 'SKILL.md')
			if (existsSync(skillPath) && !found.has(name)) {
				found.set(name, { name, path: skillPath })
			}
		}
	}

	return [...found.values()]
}

export function resolveCommitSkillName(detected: DetectedCommitSkill[], preferred?: string): string | null {
	if (preferred) return preferred
	const commitWork = detected.find((s) => s.name === RECOMMENDED_COMMIT_SKILL)
	if (commitWork) return commitWork.name
	if (detected.length === 1) return detected[0]!.name
	return null
}
