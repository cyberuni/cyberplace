import * as fs from 'node:fs'
import * as path from 'node:path'

export type VendorId = 'claude-code' | 'cursor' | 'codex' | 'copilot-cli'

export const VENDOR_OUTPUT: Record<VendorId, string> = {
	'claude-code': '.claude-plugin/plugin.json',
	cursor: '.cursor-plugin/plugin.json',
	codex: '.codex-plugin/plugin.json',
	'copilot-cli': 'plugin.json',
}

export const KNOWN_VENDORS = new Set<string>(Object.keys(VENDOR_OUTPUT))

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

export interface BuildResult {
	vendors: VendorId[]
	written: string[]
	warnings: string[]
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
	const manifestRaw = fs.readFileSync(path.join(root, '.plugin', 'plugin.json'), 'utf8')
	const indent = detectIndent(manifestRaw)
	const manifest = readManifest(root)
	const errors = validateManifest(manifest)
	if (errors.length > 0) throw new Error(`plugin.json validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`)

	const warnings: string[] = []
	const vendorExtensions = manifest.vendorExtensions ?? {}

	let vendors = Object.keys(vendorExtensions).filter((v): v is VendorId => {
		if (!KNOWN_VENDORS.has(v)) {
			warnings.push(`Unknown vendor "${v}" in vendorExtensions — skipped`)
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
		return { vendors: [], written: [], warnings }
	}

	const written: string[] = []
	const { vendorExtensions: _ext, $schema: _schema, ...canonical } = manifest

	for (const vendor of vendors) {
		const outputPath = path.join(root, VENDOR_OUTPUT[vendor])
		const outputDir = path.dirname(outputPath)
		const vendorFields = vendorExtensions[vendor] ?? {}
		const vendorManifest = { ...canonical, ...vendorFields }

		if (opts.verbose) {
			console.log(`[${vendor}] → ${outputPath}`)
			for (const key of Object.keys(vendorFields)) {
				console.log(`  + ${key} (from vendorExtensions)`)
			}
		}

		if (!opts.dryRun) {
			if (opts.clean && fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
			fs.mkdirSync(outputDir, { recursive: true })
			fs.writeFileSync(outputPath, `${JSON.stringify(vendorManifest, null, indent)}\n`)
		}

		written.push(outputPath)
	}

	return { vendors, written, warnings }
}
