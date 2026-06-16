import * as fs from 'node:fs'

export interface GovernanceFs {
	exists(filePath: string): boolean
	read(filePath: string): string
	list(dir: string): string[]
}

export const realGovernanceFs: GovernanceFs = {
	exists: (p) => fs.existsSync(p),
	read: (p) => fs.readFileSync(p, 'utf8'),
	list: (dir) => {
		if (!fs.existsSync(dir)) return []
		return fs
			.readdirSync(dir)
			.filter((f) => f.endsWith('.md'))
			.map((f) => f.slice(0, -3))
	},
}
