#!/usr/bin/env node
/**
 * Inject or update the ## Commit Discipline section in AGENTS.md.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { mergeCommitDisciplineIntoAgentsMd } from './lib/commit-discipline-content.mts'

export interface InjectOptions {
	root?: string
	commitSkill: string
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
	const after = mergeCommitDisciplineIntoAgentsMd(before, options.commitSkill)
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

if (process.argv[1] === import.meta.filename) {
	const args = process.argv.slice(2)
	const dryRun = args.includes('--dry-run')
	const verbose = args.includes('--verbose')
	const skillIdx = args.indexOf('--commit-skill')
	const rootIdx = args.indexOf('--root')
	const commitSkill = skillIdx !== -1 ? args[skillIdx + 1] : undefined
	const root = rootIdx !== -1 ? args[rootIdx + 1] : process.cwd()

	if (!commitSkill) {
		process.stderr.write(
			'Usage: inject-commit-discipline.mts --commit-skill <name> [--root <path>] [--dry-run] [--verbose]\n',
		)
		process.exit(1)
	}

	try {
		const result = injectCommitDiscipline({ root, commitSkill, dryRun, verbose })
		process.stdout.write(`${JSON.stringify(result)}\n`)
	} catch (err) {
		process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
		process.exit(1)
	}
}
