import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { mergeCommitDisciplineIntoAgentsMd } from './content.js'

export interface InjectOptions {
	root?: string
	commitSkill: string
	autoCommit?: boolean
	dryRun?: boolean
	verbose?: boolean
}

export function injectCommitDiscipline(options: InjectOptions): { path: string; changed: boolean } {
	const root = options.root ?? process.cwd()
	const agentsPath = join(root, 'AGENTS.md')

	if (!existsSync(agentsPath)) {
		throw new Error('AGENTS.md not found — run the init skill first or create AGENTS.md')
	}

	const before = readFileSync(agentsPath, 'utf8')
	const after = mergeCommitDisciplineIntoAgentsMd(before, options.commitSkill, {
		autoCommit: options.autoCommit,
	})
	const changed = before !== after

	if (changed && !options.dryRun) {
		writeFileSync(agentsPath, after)
	}

	if (options.verbose) {
		process.stderr.write(
			changed ? 'Updated ## Commit Discipline in AGENTS.md\n' : '## Commit Discipline already up to date\n',
		)
	}

	return { path: agentsPath, changed }
}
