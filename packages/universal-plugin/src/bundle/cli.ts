import { Command } from 'commander'

import { readManifest } from '../build/build.js'
import { ROOT_OPTION, resolveRoot } from '../cli-options.js'
import { output, printTable } from '../output.js'
import { realPinFs, resolveSkillsDir } from '../pin/fs.js'
import type { BundlePin } from './bundle.js'
import { bundlePins } from './bundle.js'
import { discoverWorkspace, realVersionSource } from './fs.js'

const TRUNCATE_THRESHOLD = 20
const NEXT_STEP = '→ review and commit the pinned skills\n'

interface BundleCliOptions {
	dryRun?: boolean
	full?: boolean
	root?: string
}

export function bundleCommand(): Command {
	const cmd = new Command('bundle').description(
		"Pin the plugin's skill npx references to their workspace package.json versions (release form)",
	)

	cmd
		.option('--dry-run', 'Resolve and report pins without writing them')
		.option('--full', 'Show every pins row without truncation')
		.option('--format <format>', 'Output format: json or toon (default: toon)')
		.addOption(ROOT_OPTION)
		.addHelpText('after', '\nExample:\n  $ universal-plugin plugin bundle --dry-run --full\n')
		.action((opts: BundleCliOptions) => {
			try {
				const root = resolveRoot(opts.root)
				const manifest = readManifest(root)
				const skillsDir = resolveSkillsDir(root, manifest.skills as string | undefined)
				const pinFs = realPinFs(skillsDir)
				const versionSource = realVersionSource(discoverWorkspace(root))

				const result = bundlePins(pinFs, versionSource, { dryRun: opts.dryRun })

				for (const warning of result.warnings) {
					process.stderr.write(`warn: ${warning}\n`)
				}

				const pinned = result.pins.filter((p) => p.status === 'pinned').length
				const unchanged = result.pins.filter((p) => p.status === 'unchanged').length
				const skipped = result.pins.filter((p) => p.status === 'skipped').length

				output({ pins: result.pins }, () => {
					const truncated = !opts.full && result.pins.length > TRUNCATE_THRESHOLD
					const rows = truncated ? result.pins.slice(0, TRUNCATE_THRESHOLD) : result.pins

					if (rows.length > 0) {
						printTable(rows, [
							{ label: 'package', get: (r: BundlePin) => r.package },
							{ label: 'current', get: (r: BundlePin) => r.current },
							{ label: 'resolved', get: (r: BundlePin) => r.resolved },
							{ label: 'status', get: (r: BundlePin) => r.status },
						])
					}
					if (truncated) {
						console.log(`… +${result.pins.length - TRUNCATE_THRESHOLD} more — rerun with --full`)
					}
					console.log(`pinned ${pinned}, unchanged ${unchanged}, skipped ${skipped}`)
				})

				if (result.pins.length === 0) {
					process.stderr.write('nothing to bundle\n')
				}
				process.stderr.write(NEXT_STEP)
			} catch (err) {
				process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`)
				process.exit(1)
			}
		})

	return cmd
}
