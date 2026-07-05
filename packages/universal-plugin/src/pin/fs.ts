import * as fsNode from 'node:fs'
import * as path from 'node:path'

const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.markdown', '.json', '.yaml', '.yml', '.txt'])

export interface PinFs {
	/** Every text file under the plugin's skills directory (recursive), absolute paths. */
	listSkillFiles(): string[]
	readFile(filePath: string): string
	writeFile(filePath: string, content: string): void
}

/** Resolves the plugin's skills directory: the manifest's `skills` field under `root`,
 *  defaulting to `<root>/skills/`. */
export function resolveSkillsDir(root: string, manifestSkills?: string): string {
	return path.join(root, manifestSkills ?? 'skills/')
}

function walk(dir: string): string[] {
	if (!fsNode.existsSync(dir)) return []
	const files: string[] = []
	for (const entry of fsNode.readdirSync(dir, { withFileTypes: true })) {
		const entryPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...walk(entryPath))
		} else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
			files.push(entryPath)
		}
	}
	return files
}

export function realPinFs(skillsDir: string): PinFs {
	return {
		listSkillFiles: () => walk(skillsDir),
		readFile: (p) => fsNode.readFileSync(p, 'utf8'),
		writeFile: (p, c) => fsNode.writeFileSync(p, c, 'utf8'),
	}
}
