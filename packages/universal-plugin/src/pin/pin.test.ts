import { describe, expect, it } from 'vitest'
import { extractPins } from './pin.js'

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
