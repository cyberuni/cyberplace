import * as fs from 'node:fs'
import * as path from 'node:path'

import { Command } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output } from '../output.js'
import { type Finding, findSkillFiles, runChecks, SKILL_DIRS } from './validate.js'

function printFinding(f: Finding): void {
	const icon = f.severity === 'CRITICAL' ? '❌' : '⚠️ '
	console.info(`  ${icon} [${f.severity}] ${f.checkId} — ${f.name}`)
	console.info(`     Evidence: ${f.evidence}`)
	console.info(`     Fix:      ${f.fix}`)
}

export function auditCommand(): Command {
	const cmd = new Command('audit').description('Audit and validate skills')

	cmd
		.command('validate')
		.description('Validate skills against structural and quality checks (S1–S5, Q1–Q5, Q10, E1–E2, E6)')
		.option('--path <path>', 'Validate a single skill directory or SKILL.md file')
		.addOption(ROOT_OPTION)
		.option('--json', 'Output raw JSON')
		.action((opts: { path?: string; root?: string }) => {
			const cwd = resolveRoot(opts.root)
			let skillFiles: string[]

			if (opts.path) {
				const resolved = path.resolve(cwd, opts.path)
				const skillMd = resolved.endsWith('SKILL.md') ? resolved : path.join(resolved, 'SKILL.md')
				if (!fs.existsSync(skillMd)) {
					console.error(`No SKILL.md found at ${skillMd}`)
					process.exit(1)
				}
				skillFiles = [fs.realpathSync(skillMd)]
			} else {
				skillFiles = findSkillFiles(SKILL_DIRS, cwd)
			}

			if (skillFiles.length === 0) {
				console.info('No SKILL.md files found.')
				process.exit(0)
			}

			const allResults = skillFiles.map((filePath) => ({
				filePath,
				dirName: path.basename(path.dirname(filePath)),
				...runChecks(filePath),
			}))

			output(allResults, () => {
				console.info(`Validating ${skillFiles.length} skill(s)…`)

				let totalCriticals = 0
				let totalWarnings = 0

				for (const { dirName, criticals, warnings } of allResults) {
					console.info(`\n── ${dirName} ─────────────────────────`)
					totalCriticals += criticals.length
					totalWarnings += warnings.length

					for (const f of criticals) printFinding(f)
					for (const f of warnings) printFinding(f)

					if (criticals.length === 0) {
						console.info('  ✅ no CRITICAL findings')
					} else {
						console.info('  🚨 DO NOT commit or install until all CRITICAL findings are resolved.')
					}
				}

				console.info('\n══════════════════════════════════════')
				console.info(`Results: ${totalCriticals} critical failure(s), ${totalWarnings} warning(s)`)

				if (totalCriticals > 0) {
					console.info('❌ Fix all CRITICAL findings before merging.')
					process.exit(1)
				}

				console.info('✅ All checks passed (S1–S5, Q1–Q5, Q10, E1–E2, E6).')
				console.info('   Run the audit-skill agent skill for full quality review (Q6–Q11, E3–E5, E7).')
			})
		})

	return cmd
}
