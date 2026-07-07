import type { PinFs } from '../pin/fs.js'
import { extractPins } from '../pin/pin.js'

type BundleStatus = 'pinned' | 'unchanged' | 'skipped'

/** The outcome of resolving one distinct in-scope package's pin against the workspace. */
export interface BundlePin {
	package: string
	current: string
	resolved: string
	status: BundleStatus
}

export interface BundleResult {
	pins: BundlePin[]
	warnings: string[]
}

export interface BundleOptions {
	dryRun?: boolean
}

/** Resolves a package's version from the monorepo workspace — the release-time source of truth
 *  (no network, no registry, no same-major reasoning). `inWorkspace: false` means the package has
 *  no workspace entry (external, e.g. a separate repo's CLI). `inWorkspace: true, version:
 *  undefined` means the package IS a workspace member but its local `package.json` version is
 *  missing or unreadable — a best-effort skip, not an external pin. */
export interface VersionSource {
	resolve(pkg: string): { inWorkspace: false } | { inWorkspace: true; version: string | undefined }
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Rewrites every `npx <pkg>@<anything>` occurrence in `content` to `npx <pkg>@<next>`, regardless
 *  of whether the occurrence is a concrete version or a placeholder like `<version>` — so every
 *  reference to one CLI converges on the same resolved value. */
function rewritePin(content: string, pkg: string, next: string): string {
	const pattern = new RegExp(`(npx\\s+(?:--yes\\s+|-y\\s+)?${escapeRegExp(pkg)}@)[^\\s\`'")]+`, 'g')
	return content.replace(pattern, `$1${next}`)
}

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---/
const PIN_EXEMPT_PATTERN = /(^|\n)\s*pin-exempt:\s*true\s*(\n|$)/

/** True when a SKILL.md's frontmatter declares `metadata.pin-exempt: true` — its version strings
 *  are documentation/illustration, never rewritten by `bundle`. Nesting under `metadata` is not
 *  enforced structurally (no YAML dependency); the key's presence anywhere in the frontmatter block
 *  is the marker. */
export function isPinExempt(skillMdContent: string): boolean {
	const match = skillMdContent.match(FRONTMATTER_PATTERN)
	if (!match) return false
	return PIN_EXEMPT_PATTERN.test(match[1]!)
}

function dirOf(filePath: string): string {
	const idx = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
	return idx === -1 ? '' : filePath.slice(0, idx)
}

function isUnderExemptDir(filePath: string, exemptDirs: Set<string>): boolean {
	for (const dir of exemptDirs) {
		if (filePath.startsWith(`${dir}/`) || filePath.startsWith(`${dir}\\`)) return true
	}
	return false
}

/** Scans the plugin's skills for `npx <pkg>@<pin>` references and, for each in-scope package that
 *  resolves against the workspace, rewrites every occurrence to that package's local version. A
 *  pin-exempt skill (and every file under its directory) is excluded entirely — never scanned,
 *  never rewritten, never reported. */
export function bundlePins(pinFs: PinFs, versionSource: VersionSource, opts: BundleOptions = {}): BundleResult {
	const files = pinFs.listSkillFiles()
	const contents = new Map<string, string>()
	for (const file of files) contents.set(file, pinFs.readFile(file))

	const exemptDirs = new Set<string>()
	for (const file of files) {
		if (!file.endsWith('/SKILL.md') && !file.endsWith('\\SKILL.md')) continue
		if (isPinExempt(contents.get(file)!)) exemptDirs.add(dirOf(file))
	}

	const inScope = files.filter((file) => !isUnderExemptDir(file, exemptDirs))

	const currentsByPkg = new Map<string, string[]>()
	for (const file of inScope) {
		for (const pin of extractPins(contents.get(file)!)) {
			const list = currentsByPkg.get(pin.pkg) ?? []
			list.push(pin.current)
			currentsByPkg.set(pin.pkg, list)
		}
	}

	const warnings: string[] = []
	const pins: BundlePin[] = []

	for (const [pkg, currents] of currentsByPkg) {
		const current = currents[0]!
		const lookup = versionSource.resolve(pkg)

		if (!lookup.inWorkspace) {
			pins.push({ package: pkg, current, resolved: current, status: 'skipped' })
			continue
		}
		if (lookup.version === undefined) {
			warnings.push(`workspace package "${pkg}" has no readable package.json version — skipped`)
			pins.push({ package: pkg, current, resolved: current, status: 'skipped' })
			continue
		}

		const target = lookup.version
		let changed = false
		for (const file of inScope) {
			const content = contents.get(file)!
			const rewritten = rewritePin(content, pkg, target)
			if (rewritten !== content) {
				changed = true
				contents.set(file, rewritten)
				if (!opts.dryRun) pinFs.writeFile(file, rewritten)
			}
		}

		pins.push({ package: pkg, current, resolved: target, status: changed ? 'pinned' : 'unchanged' })
	}

	return { pins, warnings }
}
