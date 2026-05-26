import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, expect, test } from 'vitest'

import { detectPackageManager, detectWorkspaceRoot, listNpmSkills, resolveNodeModulesDir } from './npm.js'

let root: string

beforeEach(() => {
	root = fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-skills-npm-'))
})

afterEach(() => {
	fs.rmSync(root, { recursive: true, force: true })
})

test('detectPackageManager returns pnpm when pnpm-lock.yaml present', () => {
	fs.writeFileSync(path.join(root, 'pnpm-lock.yaml'), '')
	expect(detectPackageManager(root)).toBe('pnpm')
})

test('detectPackageManager returns yarn when yarn.lock present', () => {
	fs.writeFileSync(path.join(root, 'yarn.lock'), '')
	expect(detectPackageManager(root)).toBe('yarn')
})

test('detectPackageManager prefers pnpm over yarn', () => {
	fs.writeFileSync(path.join(root, 'pnpm-lock.yaml'), '')
	fs.writeFileSync(path.join(root, 'yarn.lock'), '')
	expect(detectPackageManager(root)).toBe('pnpm')
})

test('detectPackageManager defaults to npm', () => {
	expect(detectPackageManager(root)).toBe('npm')
})

test('resolveNodeModulesDir returns expected path', () => {
	expect(resolveNodeModulesDir(root, '@org/pkg')).toBe(path.join(root, 'node_modules', '@org/pkg'))
})

test('listNpmSkills returns skill names from skills dir', () => {
	const skillsDir = path.join(root, 'skills')
	fs.mkdirSync(path.join(skillsDir, 'commit'), { recursive: true })
	fs.writeFileSync(path.join(skillsDir, 'commit', 'SKILL.md'), '# Commit')
	fs.mkdirSync(path.join(skillsDir, 'empty-dir'), { recursive: true }) // no SKILL.md

	const names = listNpmSkills(skillsDir)
	expect(names).toContain('commit')
	expect(names).not.toContain('empty-dir')
})

test('listNpmSkills returns empty array when dir does not exist', () => {
	expect(listNpmSkills(path.join(root, 'nonexistent'))).toEqual([])
})

test('detectWorkspaceRoot returns true when pnpm-workspace.yaml present', () => {
	fs.writeFileSync(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
	expect(detectWorkspaceRoot(root)).toBe(true)
})

test('detectWorkspaceRoot returns true when lerna.json present', () => {
	fs.writeFileSync(path.join(root, 'lerna.json'), '{}')
	expect(detectWorkspaceRoot(root)).toBe(true)
})

test('detectWorkspaceRoot returns true when package.json has workspaces array', () => {
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ workspaces: ['packages/*'] }))
	expect(detectWorkspaceRoot(root)).toBe(true)
})

test('detectWorkspaceRoot returns false when package.json workspaces is not an array', () => {
	fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ workspaces: {} }))
	expect(detectWorkspaceRoot(root)).toBe(false)
})

test('detectWorkspaceRoot returns false when no workspace indicators present', () => {
	expect(detectWorkspaceRoot(root)).toBe(false)
})
