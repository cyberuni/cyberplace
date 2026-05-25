/** Normalize a heading to `## Title` form. */
export function normalizeMarkdownHeading(heading: string): string {
	return heading.startsWith('#') ? heading : `## ${heading}`
}

/** Extract a markdown section including its heading, or null if missing. */
export function parseMarkdownSection(markdown: string, heading: string): string | null {
	const normalized = normalizeMarkdownHeading(heading)
	const start = markdown.indexOf(normalized)
	if (start === -1) return null

	const afterHeading = markdown.slice(start + normalized.length)
	const nextHeading = afterHeading.search(/\n## /)
	const body = nextHeading === -1 ? afterHeading : afterHeading.slice(0, nextHeading)
	const trimmed = body.trim()
	return trimmed.length > 0 ? `${normalized}\n\n${trimmed}\n` : `${normalized}\n`
}
