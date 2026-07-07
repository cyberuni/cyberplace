/** A `npx <pkg>@<pin>` reference detected in a skill file. */
export interface Pin {
	pkg: string
	current: string
	file: string
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
