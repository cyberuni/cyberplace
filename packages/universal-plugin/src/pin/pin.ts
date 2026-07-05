/** A `npx <pkg>@<pin>` reference detected in a skill file. */
export interface Pin {
	pkg: string
	current: string
	file: string
}

export type PinStatus = 'updated' | 'unchanged' | 'skipped'

/** The outcome of resolving one distinct in-scope package's pin. */
export interface PinResolution {
	package: string
	current: string
	resolved: string
	status: PinStatus
}

export type RangeStyle = 'exact' | 'tilde' | 'caret'

/** Registry lookup for a package's published versions. Returns null when the package can't be resolved. */
export interface RegistryClient {
	fetchVersions(pkg: string): Promise<{ latest: string; versions: string[] } | null>
}

const PIN_PATTERN = /npx\s+(?:--yes\s+|-y\s+)?([@a-z0-9/._-]+)@(\S+)/g

/** Strips a trailing backtick, quote, or paren that isn't part of the version token. */
function stripTrailing(raw: string): string {
	return raw.replace(/[`'")]+$/, '')
}

export function extractPins(text: string): Pin[] {
	const pins: Pin[] = []
	for (const match of text.matchAll(PIN_PATTERN)) {
		const pkg = match[1]
		const current = match[2]
		if (!pkg || !current) continue
		pins.push({ pkg, current: stripTrailing(current), file: '' })
	}
	return pins
}

// Accepts an optional leading ~/^ so a pin already written as a range (from a prior
// `--range` build) is parsed as semver — never mistaken for a placeholder and resolved
// to absolute latest, which would silently cross majors on rebuild.
const SEMVER_PATTERN = /^[~^]?\d+\.\d+\.\d+$/

function isValidSemver(version: string): boolean {
	return SEMVER_PATTERN.test(version)
}

/** True when a pin is a concrete version (optionally range-prefixed), not a placeholder like `<version>`. */
export function isConcreteVersion(version: string): boolean {
	return isValidSemver(version)
}

function majorOf(version: string): number {
	const stripped = version.replace(/^[~^]/, '')
	const [major] = stripped.split('.')
	return Number(major)
}

/** Pure semver compare: -1 if a < b, 0 if equal, 1 if a > b. Ignores build/prerelease metadata. */
export function compareSemver(a: string, b: string): number {
	const partsA = a.split('.').map(Number)
	const partsB = b.split('.').map(Number)
	for (let i = 0; i < 3; i++) {
		const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0)
		if (diff !== 0) return diff > 0 ? 1 : -1
	}
	return 0
}

export function pickTarget(
	current: string,
	available: { latest: string; versions: string[] },
	opts: { allowMajor: boolean },
): string {
	if (!isValidSemver(current)) return available.latest

	// Always resolve to a bare version — styleRange re-applies any ~/^ prefix.
	const currentBare = current.replace(/^[~^]/, '')
	const currentMajor = majorOf(current)
	const candidates = available.versions.filter((v) => {
		if (!isValidSemver(v)) return false
		if (opts.allowMajor) return true
		return majorOf(v) === currentMajor
	})

	if (candidates.length === 0) return currentBare

	let best = candidates[0]!
	for (const candidate of candidates.slice(1)) {
		if (compareSemver(candidate, best) > 0) best = candidate
	}
	// Never downgrade: if every published version is older than the current pin
	// (e.g. the local pin is ahead of the registry), keep the current pin.
	if (compareSemver(best, currentBare) < 0) return currentBare
	return best
}

export function styleRange(version: string, style: RangeStyle): string {
	switch (style) {
		case 'exact':
			return version
		case 'tilde':
			return `~${version}`
		case 'caret':
			return `^${version}`
	}
}

export function normalizeRange(raw: string): RangeStyle {
	switch (raw) {
		case 'exact':
			return 'exact'
		case 'tilde':
		case '~':
			return 'tilde'
		case 'caret':
		case '^':
			return 'caret'
		default:
			throw new Error(`Invalid --range value "${raw}" — expected exact, tilde, caret, ~, or ^`)
	}
}
