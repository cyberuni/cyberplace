import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import { join } from 'node:path'

export type PackageManager = 'pnpm' | 'yarn' | 'npm'

export interface NpmInstallResult {
	packageName: string
	installedDir: string
	skillsDir: string | null
	packageManager: PackageManager
}

export function detectPackageManager(root: string): PackageManager {
	if (fs.existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm'
	if (fs.existsSync(join(root, 'yarn.lock'))) return 'yarn'
	return 'npm'
}

export function resolveNodeModulesDir(root: string, packageName: string): string {
	return join(root, 'node_modules', packageName)
}

export function installNpmPackage(root: string, packageName: string): NpmInstallResult {
	const pm = detectPackageManager(root)

	const args: string[] = pm === 'pnpm' ? ['add', '--save-dev', packageName]
		: pm === 'yarn' ? ['add', '--dev', packageName]
		: ['install', '--save-dev', packageName]

	const result = spawnSync(pm, args, { cwd: root, encoding: 'utf8', stdio: 'inherit' })
	if (result.status !== 0) {
		throw new Error(`${pm} install failed for ${packageName}`)
	}

	const installedDir = resolveNodeModulesDir(root, packageName)
	const skillsDir = fs.existsSync(join(installedDir, 'skills')) ? join(installedDir, 'skills') : null

	return { packageName, installedDir, skillsDir, packageManager: pm }
}

export function listNpmSkills(skillsDir: string): string[] {
	if (!fs.existsSync(skillsDir)) return []
	return fs
		.readdirSync(skillsDir, { withFileTypes: true })
		.filter((e) => e.isDirectory() && fs.existsSync(join(skillsDir, e.name, 'SKILL.md')))
		.map((e) => e.name)
}
