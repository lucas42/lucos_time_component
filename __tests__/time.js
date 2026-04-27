import { getDatetime, calculateOffset } from '../time.js';

describe('getDatetime', () => {
	it('returns a Date object without throwing in a Node environment', () => {
		const result = getDatetime();
		expect(result).toBeInstanceOf(Date);
		expect(result.getTime()).not.toBeNaN();
	});

	it('returns a Date close to the current system time when localStorage is not available', () => {
		const before = Date.now();
		const result = getDatetime();
		const after = Date.now();
		expect(result.getTime()).toBeGreaterThanOrEqual(before);
		expect(result.getTime()).toBeLessThanOrEqual(after);
	});
});

describe('calculateOffset', () => {
	it('returns without throwing when XMLHttpRequest is not available', async () => {
		// In the Node test environment XMLHttpRequest is not defined, so calculateOffset
		// should resolve immediately rather than throwing a ReferenceError.
		await expect(calculateOffset()).resolves.toBeUndefined();
	});
});
