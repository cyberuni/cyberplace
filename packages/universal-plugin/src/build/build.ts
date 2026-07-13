import * as fs from 'node:fs'
import * as path from 'node:path'

type VendorId = 'claude-code' | 'cursor' | 'codex' | 'copilot-cli'

const VENDOR_OUTPUT: Record<VendorId, string> = {
	'claude-code': '.claude-plugin/plugin.json',
	cursor: '.cursor-plugin/plugin.json',
	codex: '.codex-plugin/plugin.json',
	'copilot-cli': 'plugin.json',
}

const KNOWN_VENDORS = new Set<string>(Object.keys(VENDOR_OUTPUT))

export interface PluginManifest {
	$schema?: string
	name: string
	version?: string
	description?: string
	vendorExtensions?: Record<string, Record<string, unknown>>
	[key: string]: unknown
}

export interface BuildOptions {
	vendor?: string
	dryRun?: boolean
	verbose?: boolean
	clean?: boolean
}

export type VendorStatus = 'built' | 'skipped' | 'failed'

export interface VendorRow {
	vendor: string
	path: string
	status: VendorStatus
}

export interface BuildResult {
	vendors: VendorId[]
	written: string[]
	warnings: string[]
	rows: VendorRow[]
	summary: { built: number; skipped: number; failed: number }
}

function detectIndent(json: string): string | number {
	const match = json.match(/\n([ \t]+)/)
	if (!match) return '\t'
	return match[1].startsWith('\t') ? '\t' : match[1].length
}

export function readManifest(root: string): PluginManifest {
	const manifestPath = path.join(root, '.plugin', 'plugin.json')
	if (!fs.existsSync(manifestPath)) {
		throw new Error(`No .plugin/plugin.json found at ${root}`)
	}
	return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as PluginManifest
}

export function validateManifest(manifest: PluginManifest): string[] {
	const errors: string[] = []
	if (!manifest.name) errors.push('name is required')
	if (manifest.vendorExtensions?.codex && !manifest.description) {
		errors.push('description is required when targeting codex')
	}
	if (manifest.vendorExtensions?.codex && !manifest.version) {
		errors.push('version is required when targeting codex')
	}
	return errors
}

export function buildPlugin(root: string, opts: BuildOptions = {}): BuildResult {
	const manifestPath = path.join(root, '.plugin', 'plugin.json')
	if (!fs.existsSync(manifestPath)) {
		throw new Error(`No .plugin/plugin.json found at ${root}`)
	}
	const manifestRaw = fs.readFileSync(manifestPath, 'utf8')
	const indent = detectIndent(manifestRaw)
	const manifest = readManifest(root)
	const errors = validateManifest(manifest)
	if (errors.length > 0) throw new Error(`plugin.json validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`)

	const warnings: string[] = []
	const rows: VendorRow[] = []
	const vendorExtensions = manifest.vendorExtensions ?? {}

	let vendors = Object.keys(vendorExtensions).filter((v): v is VendorId => {
		if (!KNOWN_VENDORS.has(v)) {
			warnings.push(`Unknown vendor "${v}" in vendorExtensions — skipped`)
			rows.push({ vendor: v, path: '-', status: 'skipped' })
			return false
		}
		return true
	})

	if (opts.vendor) {
		if (!vendors.includes(opts.vendor as VendorId)) {
			throw new Error(`Vendor "${opts.vendor}" not declared in vendorExtensions`)
		}
		vendors = [opts.vendor as VendorId]
	}

	if (vendors.length === 0) {
		warnings.push('No vendors declared in vendorExtensions — nothing to build')
		return { vendors: [], written: [], warnings, rows, summary: summarize(rows) }
	}

	const written: string[] = []
	const { vendorExtensions: _ext, $schema: _schema, ...canonical } = manifest

	for (const vendor of vendors) {
		const relPath = VENDOR_OUTPUT[vendor]
		const outputPath = path.join(root, relPath)
		const outputDir = path.dirname(outputPath)
		const vendorFields = vendorExtensions[vendor] ?? {}
		const vendorManifest = { ...canonical, ...vendorFields }

		if (opts.verbose) {
			console.log(`[${vendor}] → ${outputPath}`)
			for (const key of Object.keys(vendorFields)) {
				console.log(`  + ${key} (from vendorExtensions)`)
			}
		}

		try {
			if (!opts.dryRun) {
				if (opts.clean && fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
				fs.mkdirSync(outputDir, { recursive: true })
				fs.writeFileSync(outputPath, `${JSON.stringify(vendorManifest, null, indent)}\n`)
			}
			written.push(outputPath)
			rows.push({ vendor, path: relPath, status: 'built' })
		} catch (err) {
			warnings.push(`Failed to write "${vendor}" → ${relPath}: ${err instanceof Error ? err.message : String(err)}`)
			rows.push({ vendor, path: relPath, status: 'failed' })
		}
	}

	return { vendors, written, warnings, rows, summary: summarize(rows) }
}

function summarize(rows: VendorRow[]): BuildResult['summary'] {
	return {
		built: rows.filter((r) => r.status === 'built').length,
		skipped: rows.filter((r) => r.status === 'skipped').length,
		failed: rows.filter((r) => r.status === 'failed').length,
	}
}
