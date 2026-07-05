import { describe, expect, it } from 'vitest'
import { compareSemver, extractPins, normalizeRange, pickTarget, styleRange } from './pin.js'

describe('extractPins', () => {
	it('extracts a single npx pin', () => {
		const pins = extractPins('Run `npx cyberplace@1.2.0` to install.')
		expect(pins).toEqual([{ pkg: 'cyberplace', current: '1.2.0', file: '' }])
	})

	it('extracts multiple pins', () => {
		const pins = extractPins('npx cyberplace@1.2.0 and npx cyberfleet@1.0.0')
		expect(pins.map((p) => p.pkg)).toEqual(['cyberplace', 'cyberfleet'])
	})

	it('extracts a scoped package', () => {
		const pins = extractPins('npx @cyberuni/tool@2.0.0')
		expect(pins[0]?.pkg).toBe('@cyberuni/tool')
	})

	it('strips a trailing backtick from the pin', () => {
		const pins = extractPins('`npx cyberplace@1.2.0`')
		expect(pins[0]?.current).toBe('1.2.0')
	})

	it('strips a trailing quote from the pin', () => {
		const pins = extractPins('"npx cyberplace@1.2.0"')
		expect(pins[0]?.current).toBe('1.2.0')
	})

	it('handles a placeholder pin', () => {
		const pins = extractPins('npx cyberplace@<version>')
		expect(pins[0]?.current).toBe('<version>')
	})

	it('handles --yes / -y prefixes', () => {
		expect(extractPins('npx --yes cyberplace@1.2.0')[0]?.pkg).toBe('cyberplace')
		expect(extractPins('npx -y cyberplace@1.2.0')[0]?.pkg).toBe('cyberplace')
	})

	it('returns empty when no pin is present', () => {
		expect(extractPins('no references here')).toEqual([])
	})
})

describe('compareSemver', () => {
	it('orders by major, minor, patch', () => {
		expect(compareSemver('1.4.2', '1.2.0')).toBe(1)
		expect(compareSemver('1.2.0', '1.4.2')).toBe(-1)
		expect(compareSemver('1.2.0', '1.2.0')).toBe(0)
		expect(compareSemver('2.0.0', '1.9.9')).toBe(1)
	})
})

describe('pickTarget', () => {
	it('resolves the newest version within the current major', () => {
		const target = pickTarget(
			'1.2.0',
			{ latest: '2.0.0', versions: ['1.2.0', '1.4.2', '2.0.0'] },
			{ allowMajor: false },
		)
		expect(target).toBe('1.4.2')
	})

	it('does not cross a major boundary by default', () => {
		const target = pickTarget('1.2.0', { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] }, { allowMajor: false })
		expect(target).toBe('1.4.2')
	})

	it('crosses the major boundary when allowMajor is set', () => {
		const target = pickTarget('1.2.0', { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] }, { allowMajor: true })
		expect(target).toBe('2.0.0')
	})

	it('resolves a placeholder pin to the absolute latest', () => {
		const target = pickTarget('<version>', { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] }, { allowMajor: false })
		expect(target).toBe('2.0.0')
	})

	it('leaves the pin unchanged when no newer version exists in the current major', () => {
		const target = pickTarget('1.2.0', { latest: '2.0.0', versions: ['1.2.0', '2.0.0'] }, { allowMajor: false })
		expect(target).toBe('1.2.0')
	})

	it('excludes prerelease versions from candidates', () => {
		const target = pickTarget(
			'1.2.0',
			{ latest: '1.5.0-beta.1', versions: ['1.2.0', '1.3.0-beta.1', '1.4.0'] },
			{ allowMajor: false },
		)
		expect(target).toBe('1.4.0')
	})

	it('treats a range-prefixed current as semver — stays in major, never jumps to latest', () => {
		// A pin already written by a prior `--range caret` build must not be mistaken for a
		// placeholder and resolved to absolute latest (which would silently cross the major).
		expect(pickTarget('^1.2.0', { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] }, { allowMajor: false })).toBe('1.4.2')
		expect(pickTarget('~1.2.0', { latest: '2.0.0', versions: ['1.4.2', '2.0.0'] }, { allowMajor: false })).toBe('1.4.2')
	})
})

describe('styleRange', () => {
	it('writes exact', () => {
		expect(styleRange('1.4.2', 'exact')).toBe('1.4.2')
	})
	it('writes tilde', () => {
		expect(styleRange('1.4.2', 'tilde')).toBe('~1.4.2')
	})
	it('writes caret', () => {
		expect(styleRange('1.4.2', 'caret')).toBe('^1.4.2')
	})
})

describe('normalizeRange', () => {
	it('passes through canonical names', () => {
		expect(normalizeRange('exact')).toBe('exact')
		expect(normalizeRange('tilde')).toBe('tilde')
		expect(normalizeRange('caret')).toBe('caret')
	})

	it('maps aliases', () => {
		expect(normalizeRange('~')).toBe('tilde')
		expect(normalizeRange('^')).toBe('caret')
	})

	it('throws on an unknown value', () => {
		expect(() => normalizeRange('bogus')).toThrow('Invalid --range value')
	})
})
