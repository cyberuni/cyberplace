import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getPackageRoot } from './package-root.js'

function getPackageVersion(): string {
	const pkgPath = join(getPackageRoot(), 'package.json')
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string }
	return pkg.version
}

/**
 * Build a hook command string for registration in agent settings.
 * Prefers local node_modules bin when present; otherwise pins npx to the current version.
 */
export function hookCommand(subcommand: string, root = process.cwd()): string {
	const localBin = join(root, 'node_modules', '.bin', 'cyber-skills')
	if (existsSync(localBin)) {
		return `${localBin} ${subcommand}`
	}
	const version = getPackageVersion()
	return `npx cyber-skills@${version} ${subcommand}`
}

function extractFlagValue(command: string, flag: string): string | null {
	const match = command.match(new RegExp(`${flag}\\s+('[^']*'|"[^"]*"|\\S+)`))
	if (!match?.[1]) return null
	const value = match[1]
	if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
		return value.slice(1, -1)
	}
	return value
}

function extractNpxVersion(command: string): string | null {
	const match = command.match(/npx cyber-skills@(\S+)/)
	return match?.[1] ?? null
}

function legacyEquivalent(hookId: string, existing: string): boolean {
	if (hookId === 'commit-discipline') {
		return (
			existing.includes('hook run commit-discipline') ||
			existing.includes('run-hook commit-discipline') ||
			(existing.includes('hook run') && existing.includes('--extract') && existing.includes('Commit Discipline'))
		)
	}
	if (hookId === 'local-augmentations' || hookId === 'inject-local-augmentations') {
		return (
			existing.includes('hook run inject-local-augmentations') ||
			existing.includes('run-hook inject-local-augmentations') ||
			existing.includes('inject-local-augmentations.sh') ||
			(existing.includes('hook run') && existing.includes('--glob') && existing.includes('SKILL.local.md'))
		)
	}
	if (hookId === 'mark-internal') {
		return (
			existing.includes('hook run mark-internal') ||
			existing.includes('run-hook mark-internal') ||
			existing.includes('mark-internal.sh')
		)
	}
	return false
}

/** Same logical hook target (--name + input flags, or legacy equivalent), ignoring semver and local bin vs npx. */
export function sameHookTarget(existing: string, hookId: string, expectedCommand: string): boolean {
	if (existing === expectedCommand) return true

	const existingName = extractFlagValue(existing, '--name')
	const expectedName = extractFlagValue(expectedCommand, '--name')
	if (existingName && expectedName && existingName !== expectedName) {
		return false
	}
	if (existingName && expectedName && existingName === expectedName) {
		for (const flag of ['--file', '--glob', '--extract', '--heading'] as const) {
			const existingValue = extractFlagValue(existing, flag)
			const expectedValue = extractFlagValue(expectedCommand, flag)
			if (existingValue !== expectedValue) return false
		}
		return true
	}

	return legacyEquivalent(hookId, existing)
}

/** True when an existing registered command refers to the same hook id and semver/path. */
export function commandMatchesHook(existing: string, hookId: string, expectedCommand: string): boolean {
	if (existing === expectedCommand) return true
	if (!sameHookTarget(existing, hookId, expectedCommand)) return false

	const existingVersion = extractNpxVersion(existing)
	const expectedVersion = extractNpxVersion(expectedCommand)
	if (existingVersion && expectedVersion && existingVersion !== expectedVersion) {
		return false
	}

	const existingUsesLocalBin = /node_modules[/\\]\.bin[/\\]cyber-skills/.test(existing)
	const expectedUsesLocalBin = /node_modules[/\\]\.bin[/\\]cyber-skills/.test(expectedCommand)
	if (existingUsesLocalBin !== expectedUsesLocalBin) {
		return false
	}

	return true
}
