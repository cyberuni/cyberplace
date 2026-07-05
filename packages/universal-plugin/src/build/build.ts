import * as fs from 'node:fs'
import * as path from 'node:path'
import type { PinFs } from '../pin/fs.js'
import type { PinResolution, RangeStyle, RegistryClient } from '../pin/pin.js'
import { extractPins, isConcreteVersion, pickTarget, styleRange } from '../pin/pin.js'

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

// ── Pin resolution ──

export interface PinOptions {
	/** Limits resolution to these packages; empty/omitted means all detected packages. */
	packages?: string[]
	allowMajor?: boolean
	dryRun?: boolean
	range?: RangeStyle
}

/** A `PinResolution[]` carrying per-package warnings (registry-unreachable / unresolvable) for the
 *  CLI to print to stderr, without widening the documented `Promise<PinResolution[]>` return shape. */
export type PinResolutionList = PinResolution[] & { warnings: string[] }

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Rewrites every `npx <pkg>@<anything>` occurrence to `npx <pkg>@<next>`, regardless of the
 *  version each occurrence currently carries — so a plugin's references to one CLI converge
 *  (a concrete pin, a placeholder, and a stale pin all land on the same resolved value). */
function rewritePin(content: string, pkg: string, next: string): string {
	const pattern = new RegExp(`(npx\\s+(?:--yes\\s+|-y\\s+)?${escapeRegExp(pkg)}@)[^\\s\`'")]+`, 'g')
	return content.replace(pattern, `$1${next}`)
}

/** Scans the plugin's skills for `npx <pkg>@<pin>` references and resolves each distinct
 *  in-scope package's current version from the registry, rewriting the pins in place. */
export async function resolvePins(
	root: string,
	opts: PinOptions,
	client: RegistryClient,
	pinFs: PinFs,
): Promise<PinResolution[]> {
	void root // skill files are already scoped via pinFs; kept for interface symmetry with buildPlugin
	const range = opts.range ?? 'exact'
	const files = pinFs.listSkillFiles()

	const contents = new Map<string, string>()
	const currentsByPkg = new Map<string, string[]>()
	for (const file of files) {
		const content = pinFs.readFile(file)
		contents.set(file, content)
		for (const pin of extractPins(content)) {
			const list = currentsByPkg.get(pin.pkg) ?? []
			list.push(pin.current)
			currentsByPkg.set(pin.pkg, list)
		}
	}

	const scope = opts.packages && opts.packages.length > 0 ? new Set(opts.packages) : null
	const inScope = [...currentsByPkg.entries()].filter(([pkg]) => !scope || scope.has(pkg))

	const results = [] as unknown as PinResolutionList
	results.warnings = []

	for (const [pkg, currents] of inScope) {
		// Anchor the major on a concrete pin when one exists, so a placeholder alongside it
		// cannot drag the resolution to absolute latest across the major boundary.
		const anchor = currents.find(isConcreteVersion) ?? currents[0]!

		const available = await client.fetchVersions(pkg)
		if (!available) {
			results.warnings.push(`registry lookup for "${pkg}" failed — skipped`)
			results.push({ package: pkg, current: anchor, resolved: anchor, status: 'skipped' })
			continue
		}

		const target = pickTarget(anchor, available, { allowMajor: opts.allowMajor ?? false })
		const written = styleRange(target, range)

		let changed = false
		for (const file of files) {
			const content = contents.get(file)!
			const rewritten = rewritePin(content, pkg, written)
			if (rewritten !== content) {
				changed = true
				contents.set(file, rewritten)
				if (!opts.dryRun) pinFs.writeFile(file, rewritten)
			}
		}

		results.push({ package: pkg, current: anchor, resolved: written, status: changed ? 'updated' : 'unchanged' })
	}

	return results
}
