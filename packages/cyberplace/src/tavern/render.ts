import * as fs from 'node:fs'
import * as path from 'node:path'

import { type AwesomeEntry, deriveInstallCommand, flattenAwesomeEntries, validateAwesomeList } from '../awesome/lib.js'

const CREW_TAG = 'crew'

/** Renders the crew roster body for the Tavern website page from crew-tagged catalog entries. */
export function renderTavernRosterMarkdown(entries: AwesomeEntry[]): string {
	const crews = entries
		.filter((entry) => entry.tags.includes(CREW_TAG))
		.sort(
			(a, b) =>
				a.repo.localeCompare(b.repo) ||
				(a.type === 'skill' ? a.skill : '').localeCompare(b.type === 'skill' ? b.skill : ''),
		)

	if (crews.length === 0) return 'No crews are cataloged yet.'

	const lines: string[] = []
	for (const crew of crews) {
		const title = crew.type === 'repo' ? `\`${crew.repo}\`` : `\`${crew.repo}#${crew.skill}\``
		lines.push(`- ${title}`)
		lines.push(`  ${crew.summary}`)
		lines.push(`  Install: \`${deriveInstallCommand(crew)}\``)
		lines.push('')
	}
	return lines.join('\n').trimEnd()
}

function updateMarkedSection(content: string, markerName: string, replacement: string): string {
	const start = `<!-- ${markerName}:START -->`
	const end = `<!-- ${markerName}:END -->`
	if (!content.includes(start) || !content.includes(end))
		throw new Error(`Missing ${markerName} markers in target file`)
	return content.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'm'), `${start}\n${replacement}\n${end}`)
}

/**
 * Regenerates the crew roster section of the Tavern docs page from the repo's own catalog.
 * `repoRoot` is the monorepo root: the catalog lives at packages/cyberplace/awesome-skills.json
 * and the page at apps/website/src/content/docs/tavern/index.md.
 */
export function renderTavernPage(repoRoot: string): { pagePath: string; changed: boolean } {
	const awesomePath = path.join(repoRoot, 'packages', 'cyberplace', 'awesome-skills.json')
	const pagePath = path.join(repoRoot, 'apps', 'website', 'src', 'content', 'docs', 'tavern', 'index.md')
	const awesome = validateAwesomeList(JSON.parse(fs.readFileSync(awesomePath, 'utf8')), awesomePath)
	const markdown = renderTavernRosterMarkdown(flattenAwesomeEntries(awesome))
	const before = fs.readFileSync(pagePath, 'utf8')
	const updated = updateMarkedSection(before, 'TAVERN-ROSTER', markdown)
	const changed = before !== updated
	if (changed) fs.writeFileSync(pagePath, updated)
	return { pagePath, changed }
}
