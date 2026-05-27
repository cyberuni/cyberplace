import * as fs from 'node:fs'
import { join } from 'node:path'

export interface SkillManifest {
	distribution?: {
		install_via: string
		package?: { name: string; bin?: string }
	}
}

export function readSkillManifest(skillDir: string): SkillManifest | null {
	const filePath = join(skillDir, 'skill.json')
	if (!fs.existsSync(filePath)) return null
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8')) as SkillManifest
	} catch {
		return null
	}
}

export function isPackageManaged(manifest: SkillManifest | null): boolean {
	return manifest?.distribution?.install_via === 'package_manager'
}
