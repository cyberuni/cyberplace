import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printTable } from '../output.js'
import { buildPlugin, type VendorRow } from './build.js'

const NEXT_STEP = '→ universal-plugin plugin validate\n'

interface BuildCliOptions {
	vendor?: string
	dryRun?: boolean
	verbose?: boolean
	clean?: boolean
	root?: string
}

export function buildCommand(): Command {
	const cmd = new Command('build').description('Generate vendor manifests from .plugin/plugin.json')

	cmd
		.option('--vendor <id>', 'Build only the named vendor')
		.option('--dry-run', 'Print what would be written without writing')
		.option('--verbose', 'Print field-by-field transformation decisions')
		.option('--clean', 'Delete generated manifests before building')
		.option('--format <format>', 'Output format: json or toon (default: toon)')
		.addOption(new Option('--json').hideHelp())
		.addOption(ROOT_OPTION)
		.addHelpText('after', '\nExample:\n  $ universal-plugin plugin build --vendor claude-code\n')
		.action((opts: BuildCliOptions) => {
			try {
				const root = resolveRoot(opts.root)
				const result = buildPlugin(root, {
					vendor: opts.vendor,
					dryRun: opts.dryRun,
					verbose: opts.verbose,
					clean: opts.clean,
				})

				for (const warning of result.warnings) {
					process.stderr.write(`warn: ${warning}\n`)
				}

				const { built, skipped, failed } = result.summary
				const jsonResult = {
					built: result.rows.filter((r) => r.status === 'built'),
					skipped: result.rows.filter((r) => r.status === 'skipped'),
					failed: result.rows.filter((r) => r.status === 'failed'),
					summary: result.summary,
					warnings: result.warnings,
				}
				output(jsonResult, () => {
					if (result.rows.length > 0) {
						printTable(result.rows, [
							{ label: 'vendor', get: (r: VendorRow) => r.vendor },
							{ label: 'path', get: (r: VendorRow) => r.path },
							{ label: 'status', get: (r: VendorRow) => r.status },
						])
					}
					console.log(`built ${built}, skipped ${skipped}, failed ${failed}`)
				})

				process.stderr.write(NEXT_STEP)
				if (failed > 0) process.exitCode = 1
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
