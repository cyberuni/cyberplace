import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields } from '../output.js'
import { injectCommitDiscipline } from './inject.js'
import {
	BUNDLED_COMMIT_SKILL,
	detectCommitSkills,
	RECOMMENDED_COMMIT_SKILL,
	RECOMMENDED_INSTALL,
	resolveCommitSkillName,
} from './resolve-skill.js'

export function commitCommand(): Command {
	const cmd = new Command('commit').description('Commit discipline injection and skill detection')

	cmd
		.command('inject')
		.description('Inject or update ## Commit Discipline in AGENTS.md')
		.requiredOption('--commit-skill <name>', 'Commit helper skill name')
		.option('--auto-commit', 'Include auto-commit rule in AGENTS.md Commit Discipline section')
		.addOption(ROOT_OPTION)
		.option('--dry-run', 'Preview without writing')
		.option('--verbose', 'Human-readable status on stderr')
		.option('--json', 'Output raw JSON')
		.action((opts: { commitSkill: string; autoCommit?: boolean; root: string; dryRun: boolean; verbose: boolean }) => {
			try {
				const result = injectCommitDiscipline(opts)
				output(result, () => printFields({ path: result.path, changed: String(result.changed) }))
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	cmd
		.command('resolve-skill')
		.description('Detect installed commit helper skills')
		.addOption(ROOT_OPTION)
		.option('--check', 'Exit 1 if no commit skill detected')
		.option('--recommend', 'Print recommended install command and exit')
		.option('--json', 'Output raw JSON')
		.action((opts: { root?: string; check: boolean; recommend: boolean }) => {
			if (opts.recommend) {
				process.stdout.write(`${RECOMMENDED_INSTALL}\n`)
				process.exit(0)
			}
			const detected = detectCommitSkills(resolveRoot(opts.root))
			const result = {
				detected,
				recommended: RECOMMENDED_COMMIT_SKILL,
				recommendedInstall: RECOMMENDED_INSTALL,
				bundledFallback: BUNDLED_COMMIT_SKILL,
				resolved: resolveCommitSkillName(detected),
			}
			output(result, () => {
				if (detected.length === 0) {
					console.log('No commit skills detected.')
					console.log(`Recommended: ${RECOMMENDED_INSTALL}`)
				} else {
					for (const s of detected) console.log(`${s.name}  ${s.path}`)
				}
			})
			if (opts.check && detected.length === 0) process.exit(1)
		})

	return cmd
}
