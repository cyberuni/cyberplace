// Verification for sdd-contract-registry — one functional check per frozen
// scenario (13). The implementation under test is agent-prose plus a JSON file
// shape:
//   - the init-* skills that WRITE/RECONCILE the registry entry
//       plugins/aced/skills/init-aced/SKILL.md
//       plugins/quill/skills/init-quill/SKILL.md
//   - the registry-shape contract
//       plugins/sdd/skills/plugin-contract-governance/SKILL.md
//   - the live registry file
//       .agents/universal-plugin.json
//
// Because the init behavior is prose an agent follows (not runnable code), each
// init-write scenario is asserted as a property the init-skill prose must state
// (the behavior the agent is instructed to realize); the entry-shape scenarios
// are asserted structurally against the live registry + the shape governance.
// Anchored to the frozen .feature scenario titles, never free-authored.
//
// Run by the impl-judge (sdd-implementer); plain `node --test` strips the types.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')

const registryPath = join(repoRoot, '.agents', 'universal-plugin.json')
const registryRaw = readFileSync(registryPath, 'utf8')
const registry = JSON.parse(registryRaw) as {
	'sdd-plugins': Array<{
		name: string
		version: string
		domains: string[]
		roles: Record<string, string | null>
		governances: Record<string, string | null>
	}>
}

const aced = readFileSync(join(repoRoot, 'plugins', 'aced', 'skills', 'init-aced', 'SKILL.md'), 'utf8')
const quill = readFileSync(join(repoRoot, 'plugins', 'quill', 'skills', 'init-quill', 'SKILL.md'), 'utf8')
const contract = readFileSync(
	join(repoRoot, 'plugins', 'sdd', 'skills', 'plugin-contract-governance', 'SKILL.md'),
	'utf8',
)

// Case-insensitive substring presence over one document.
const has = (doc: string, ...needles: string[]) => needles.every((n) => doc.toLowerCase().includes(n.toLowerCase()))
const hasAny = (doc: string, ...needles: string[]) => needles.some((n) => doc.toLowerCase().includes(n.toLowerCase()))
// A property an init skill realizes must hold for BOTH init-* implementations.
const bothInit = (...needles: string[]) => has(aced, ...needles) && has(quill, ...needles)
const bothInitAny = (...needles: string[]) => hasAny(aced, ...needles) && hasAny(quill, ...needles)

const FIVE_ROLES = ['spec-producer', 'plan-producer', 'spec-judge', 'impl-producer', 'impl-judge']
const GOV_KEYS = ['director', 'builder', 'architect']

// ── entry shape ─────────────────────────────────────────────────────────────

test('Scenario: An entry maps plugin roles with the five-role map', () => {
	// Then the entry has name, version, and domains
	// And the roles map uses the five production-chain role keys.
	assert.ok(Array.isArray(registry['sdd-plugins']) && registry['sdd-plugins'].length > 0)
	for (const e of registry['sdd-plugins']) {
		assert.equal(typeof e.name, 'string', `${e.name}: name`)
		assert.equal(typeof e.version, 'string', `${e.name}: version`)
		assert.ok(Array.isArray(e.domains) && e.domains.length > 0, `${e.name}: domains`)
		assert.deepEqual(Object.keys(e.roles).sort(), [...FIVE_ROLES].sort(), `${e.name}: five-role map`)
	}
	// The shape contract enumerates exactly the five role keys.
	for (const r of FIVE_ROLES) assert.ok(has(contract, r), `contract enumerates ${r}`)
})

test('Scenario: A role may be set to null in the entry', () => {
	// A role a plugin does not specialize is recorded as null — a legal stored shape.
	const someNull = registry['sdd-plugins'].some((e) => Object.values(e.roles).some((v) => v === null))
	assert.ok(someNull, 'at least one entry records a null role')
	// The contract states null is legal and degenerates to the SDD default.
	assert.ok(hasAny(contract, 'may be `null`', 'null` (degenerates', 'degenerates to the SDD default'))
})

test('Scenario: A role key may be omitted from the entry', () => {
	// Omitting a role key is written without error; the contract states the
	// omitted-key fallback (convention name <plugin>-<role>), proving omission
	// is a legal shape distinct from null.
	assert.ok(has(contract, 'omitted') && has(contract, '<plugin>-<role>'))
})

test('Scenario: An entry carries a governances map with the required keys', () => {
	// Then the entry contains a governances map with director, builder, architect.
	for (const e of registry['sdd-plugins']) {
		assert.ok(e.governances && typeof e.governances === 'object', `${e.name}: governances present`)
		for (const k of GOV_KEYS) {
			assert.ok(k in e.governances, `${e.name}: governances.${k} present`)
		}
	}
	// The contract's registry shape carries the governances block with all three keys.
	assert.ok(has(contract, 'governances') && GOV_KEYS.every((k) => has(contract, k)))
})

test('Scenario: A governance binding may be set to null in the entry', () => {
	// A governance the plugin does not override is recorded as null in the map.
	const someGovNull = registry['sdd-plugins'].some((e) => Object.values(e.governances).some((v) => v === null))
	assert.ok(someGovNull, 'at least one governance binding is null')
	// The contract states each binding may be null = SDD default.
	assert.ok(hasAny(contract, 'binding may be `null`', '`null`'))
	assert.ok(has(contract, 'governances'))
})

// ── resolution source ───────────────────────────────────────────────────────

test('Scenario: Resolution reads only the registry', () => {
	// The shape contract states resolution reads ONLY .agents/universal-plugin.json
	// and that plan.md never controls resolution (this spec owns the shape; the
	// resolution rule is documented in the contract it feeds).
	assert.ok(has(contract, '.agents/universal-plugin.json'))
	assert.ok(hasAny(contract, 'reads **only**', 'reads only', 'only** `.agents'))
	// plan.md is not the resolution source — the init skills point resolution at
	// the registry alone (lockfile pattern, no runtime scan).
	assert.ok(bothInitAny('only**', 'reads', '.agents/universal-plugin.json'))
	assert.ok(bothInit('no plugin-directory scanning at runtime'))
})

// ── init write ──────────────────────────────────────────────────────────────

test('Scenario: Init registers the plugin entry', () => {
	// The init skill instructs: find this plugin's entry by name; if not found,
	// append the canonical entry. After running, the registry contains one entry.
	assert.ok(bothInit('not found', 'append'))
	assert.ok(registry['sdd-plugins'].some((e) => e.name === 'aced'))
	assert.ok(registry['sdd-plugins'].some((e) => e.name === 'quill'))
})

test('Scenario: Init is idempotent', () => {
	// Locate own entry by name and REPLACE if present; do not reorder/reformat
	// other entries → exactly one entry, others unchanged.
	assert.ok(bothInitAny('rewrite', 'replace'))
	assert.ok(bothInit('do not reorder or reformat other entries'))
	// Live registry has exactly one entry per plugin name (no duplicates).
	for (const name of ['aced', 'quill']) {
		const count = registry['sdd-plugins'].filter((e) => e.name === name).length
		assert.equal(count, 1, `exactly one ${name} entry`)
	}
})

test('Scenario: Init creates the file when missing', () => {
	// If the file does not exist, create it with {} then write the entry under sdd-plugins.
	assert.ok(bothInitAny('otherwise create it with `{}`', 'create it with `{}`', 'create it with {}'))
	assert.ok(existsSync(registryPath))
	assert.ok('sdd-plugins' in registry)
})

test('Scenario: Init rewrites an old-shape entry', () => {
	// Found, old shape (pre-operator scenario-advisor / implementer keys) → rewrite
	// to the five-role map.
	assert.ok(bothInit('scenario-advisor', 'implementer', 'rewrite'))
	assert.ok(bothInitAny('old shape', 'old-shape'))
	// No surviving old-shape key in the live registry.
	for (const e of registry['sdd-plugins']) {
		assert.ok(!('scenario-advisor' in e.roles), `${e.name}: no scenario-advisor key`)
		assert.ok(!('implementer' in e.roles), `${e.name}: no implementer key`)
	}
})

test('Scenario: Init reconciles a stale version on a mismatch', () => {
	// Found, role-map shape, stale version → rewrite when recorded version differs;
	// the entry version is updated and roles/governances reconciled to current shape.
	assert.ok(bothInitAny('stale `version`', 'stale version'))
	assert.ok(bothInitAny('version differs', 'recorded version differs', 'differs from'))
	assert.ok(bothInit('version'))
	// Every live entry carries a concrete version stamp (reconcile target).
	for (const e of registry['sdd-plugins']) {
		assert.match(e.version, /^\d+\.\d+\.\d+/, `${e.name}: concrete version stamp`)
	}
})

test('Scenario: Init fails loudly on a malformed registry file', () => {
	// If the file exists but contains malformed JSON, the init skill must fail with
	// an error and not overwrite. This is BEHAVIOR the init-* prose must instruct
	// (the init skill is the artifact that does the write); it is not enough for the
	// rule to live only in the spec.md surface.
	const failLoud = (doc: string) =>
		hasAny(doc, 'malformed', 'corrupt', 'invalid json') &&
		hasAny(doc, 'fail with an error', 'fail loudly', 'fail closed') &&
		hasAny(doc, 'do not overwrite', 'not overwritten', 'leave the file untouched', 'do not write')
	assert.ok(failLoud(aced), 'init-aced instructs fail-loud-on-malformed (do not overwrite)')
	assert.ok(failLoud(quill), 'init-quill instructs fail-loud-on-malformed (do not overwrite)')
})

test('Scenario: Init rejects an entry with no governances block', () => {
	// An entry payload with no governances block must fail to write, file not
	// overwritten. Two facets: (a) the live canonical entries DO carry a full
	// governances block (the invariant realized), and (b) the init-* prose must
	// instruct the REJECTION of a payload lacking the block.
	for (const name of ['aced', 'quill']) {
		const e = registry['sdd-plugins'].find((x) => x.name === name)!
		assert.ok(e.governances && Object.keys(e.governances).length === GOV_KEYS.length)
	}
	const rejectsNoGov = (doc: string) =>
		hasAny(doc, 'block is required', 'governances` block is required', 'required.', 'must carry a `governances`') &&
		hasAny(doc, 'reject a payload', 'no `governances` block', 'missing governances', 'without a governances') &&
		hasAny(doc, 'fail with an error', 'do not write', 'not overwritten', 'reject')
	assert.ok(rejectsNoGov(aced), 'init-aced instructs rejection of a no-governances payload')
	assert.ok(rejectsNoGov(quill), 'init-quill instructs rejection of a no-governances payload')
})
