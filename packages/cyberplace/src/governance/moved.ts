/**
 * Governances that no longer ship with this package.
 *
 * Each governance now lives in the package that owns its subject
 * (repobuddy/buddy-agent-harness#122). This table is a forwarder kept for one
 * release so a pinned caller gets a name and a path instead of
 * `Unknown governance`. Remove it in the release after the callers migrate.
 */
export interface MovedGovernance {
	/** The package that owns the governance now. */
	owner: string
	/** Where to read it. */
	source: string
}

export const MOVED_GOVERNANCES: Readonly<Record<string, MovedGovernance>> = {
	'agent-tool-output': {
		owner: 'cyber-aced',
		source: 'https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/agent-tool-output.md',
	},
	'cli-resolution': {
		owner: 'cyber-aced',
		source: 'https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/cli-resolution.md',
	},
	'skill-design': {
		owner: 'cyber-aced',
		source: 'https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-design.md',
	},
	'skill-repo-structure': {
		owner: 'cyber-aced',
		source: 'https://github.com/cyberuni/cyber-sdd/blob/main/plugins/aced/governances/skill-repo-structure.md',
	},
}

export function movedGovernance(name: string): MovedGovernance | undefined {
	return MOVED_GOVERNANCES[name]
}

/** One line, for stderr. */
export function movedGovernanceNotice(name: string, moved: MovedGovernance): string {
	return `${name} moved to ${moved.owner} and no longer ships with cyberplace: ${moved.source}`
}
