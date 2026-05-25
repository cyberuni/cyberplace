import { Command } from 'commander'

import { output, printTable } from '../output.js'
import { type HookSet, printResults, registerHooksForSet } from './register.js'
import runCommitDiscipline from './runtime/commit-discipline.js'
import runInjectLocalAugmentations from './runtime/inject-local-augmentations.js'
import runMarkInternal from './runtime/mark-internal.js'

const HOOK_RUNNERS: Record<string, () => Promise<void>> = {
	'commit-discipline': runCommitDiscipline,
	'inject-local-augmentations': runInjectLocalAugmentations,
	'mark-internal': runMarkInternal,
}

export function hookCommand(): Command {
	const cmd = new Command('hook').description('Manage and run agent hooks')

	cmd
		.command('run <name>')
		.description('Run a runtime hook by name')
		.option('--verbose', 'Human-readable status on stderr')
		.action(async (name: string) => {
			const runner = HOOK_RUNNERS[name]
			if (!runner) {
				process.stderr.write(`Unknown hook: ${name}\nAvailable: ${Object.keys(HOOK_RUNNERS).join(', ')}\n`)
				process.exit(1)
			}
			await runner()
		})

	cmd
		.command('register')
		.description('Register agent hooks for a named set')
		.requiredOption('--set <set>', 'Hook set to register (init | commit-discipline)')
		.option('--root <path>', 'Repo root', process.cwd())
		.option('--dry-run', 'Preview without writing')
		.option('--verbose', 'Human-readable status on stderr')
		.option('--json', 'Output raw JSON')
		.action((opts: { set: string; root: string; dryRun: boolean; verbose: boolean }) => {
			const { set, root, dryRun, verbose } = opts
			if (set !== 'init' && set !== 'commit-discipline') {
				process.stderr.write('--set must be one of: init, commit-discipline\n')
				process.exit(1)
			}
			const results = registerHooksForSet(set as HookSet, { root, dryRun })
			if (verbose) {
				printResults(results, dryRun)
			} else {
				output(results, () =>
					printTable(results, [
						{ label: 'Agent', get: (r) => r.agent },
						{ label: 'Hook', get: (r) => r.hook },
						{ label: 'Status', get: (r) => r.status },
					]),
				)
			}
		})

	return cmd
}
