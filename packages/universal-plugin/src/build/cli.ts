import { Command, Option } from 'commander'

import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printFields, printTable } from '../output.js'
import { realPinFs, resolveSkillsDir } from '../pin/fs.js'
import { normalizeRange } from '../pin/pin.js'
import { realRegistryClient } from '../pin/registry.js'
import type { PinResolutionList } from './build.js'
import { buildPlugin, readManifest, resolvePins } from './build.js'

const DEFAULT_REGISTRY = 'https://registry.npmjs.org'

function collect(value: string, previous: string[]): string[] {
	return [...previous, value]
}

interface BuildCliOptions {
	vendor?: string
	dryRun?: boolean
	verbose?: boolean
	clean?: boolean
	root?: string
	registry: string
	range: string
	package: string[]
	allowMajor?: boolean
	skipPins?: boolean
}

export function buildCommand(): Command {
	const cmd = new Command('build').description('Generate vendor manifests from .plugin/plugin.json')

	cmd
		.option('--vendor <id>', 'Build only the named vendor')
		.option('--dry-run', 'Print what would be written without writing')
		.option('--verbose', 'Print field-by-field transformation decisions')
		.option('--clean', 'Delete generated manifests before building')
		.option('--format <format>', 'Output format: json or text (default: text)')
		.option('--registry <url>', 'Registry to resolve pinned CLI versions from', DEFAULT_REGISTRY)
		.option('--range <style>', 'Pin style to write: exact, tilde, or caret (~/^ accepted)', 'exact')
		.option('--package <name>', 'Limit pin resolution to this package (repeatable)', collect, [] as string[])
		.option('--allow-major', 'Allow pin resolution to cross a major version boundary')
		.option('--skip-pins', 'Skip pin resolution entirely (manifests only)')
		.addOption(new Option('--json').hideHelp())
		.addOption(ROOT_OPTION)
		.addHelpText('after', '\nExample:\n  $ universal-plugin plugin build --vendor claude-code --range tilde\n')
		.action(async (opts: BuildCliOptions) => {
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

				let pins: PinResolutionList = Object.assign([], { warnings: [] }) as PinResolutionList
				if (!opts.skipPins) {
					const manifest = readManifest(root)
					const skillsDir = resolveSkillsDir(root, manifest.skills as string | undefined)
					const client = realRegistryClient(opts.registry)
					const pinFs = realPinFs(skillsDir)
					pins = (await resolvePins(
						root,
						{
							packages: opts.package,
							allowMajor: opts.allowMajor,
							dryRun: opts.dryRun,
							range: normalizeRange(opts.range),
						},
						client,
						pinFs,
					)) as PinResolutionList

					for (const warning of pins.warnings) {
						process.stderr.write(`warn: ${warning}\n`)
					}
				}

				output({ ...result, pins }, () => {
					if (result.vendors.length > 0) {
						printFields({ vendors: result.vendors.join(', ') })
						printTable(
							result.written.map((p) => ({ path: p })),
							[{ label: 'output', get: (r) => (opts.dryRun ? `(dry-run) ${r.path}` : r.path) }],
						)
					}
					for (const p of pins) {
						console.log(`${p.package}  ${p.current} → ${p.resolved}  ${p.status}`)
					}
				})
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
