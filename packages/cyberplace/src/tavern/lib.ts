import { findAwesomeSkills, type SearchResult } from '../awesome/lib.js'

const CREW_TAG = 'crew'

export type CrewEntry = SearchResult

/** Crew roster: catalog entries tagged "crew", optionally filtered by free-text query. */
export async function findCrews(cwd: string, query: string): Promise<CrewEntry[]> {
	const results = await findAwesomeSkills(cwd, query)
	return results.filter((entry) => entry.tags.includes(CREW_TAG))
}
