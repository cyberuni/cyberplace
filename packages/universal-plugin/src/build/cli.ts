import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields, printTable } from '../output.js'
import { buildPlugin } from './build.js'

export function buildCommand(): Command {
	const cmd = new Command('build').description('Generate vendor manifests from .plugin/plugin.json')

	cmd
		.option('--vendor <id>', 'Build only the named vendor')
		.option('--dry-run', 'Print what would be written without writing')
		.option('--verbose', 'Print field-by-field transformation decisions')
		.option('--clean', 'Delete generated manifests before building')
		.option('--format <format>', 'Output format: json or text (default: text)')
		.addOption(new Option('--json').hideHelp())
		.addOption(ROOT_OPTION)
		.action((opts: { vendor?: string; dryRun?: boolean; verbose?: boolean; clean?: boolean; root?: string }) => {
			try {
				const result = buildPlugin(resolveRoot(opts.root), {
					vendor: opts.vendor,
					dryRun: opts.dryRun,
					verbose: opts.verbose,
					clean: opts.clean,
				})

				for (const warning of result.warnings) {
					process.stderr.write(`warn: ${warning}\n`)
				}

				output(result, () => {
					if (result.vendors.length === 0) return
					printFields({ vendors: result.vendors.join(', ') })
					printTable(
						result.written.map((p) => ({ path: p })),
						[{ label: 'output', get: (r) => (opts.dryRun ? `(dry-run) ${r.path}` : r.path) }],
					)
				})
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
