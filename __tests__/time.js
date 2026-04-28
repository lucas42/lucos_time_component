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

describe('getDatetime with a saved offset in localStorage', () => {
	const ONE_HOUR_MS = 60 * 60 * 1000;

	beforeEach(() => {
		const store = {};
		global.localStorage = {
			getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
			setItem: (key, value) => { store[key] = value; },
			removeItem: (key) => { delete store[key]; },
		};
	});

	afterEach(() => {
		delete global.localStorage;
	});

	it('applies the saved offset when the offset is fresh (saved < 1 hour ago)', () => {
		const knownOffset = 5000; // 5 seconds ahead of server
		localStorage.setItem('lucos_time_component-offset', JSON.stringify({
			offset: knownOffset,
			savedAt: Date.now(), // saved just now
		}));
		const before = Date.now();
		const result = getDatetime();
		const after = Date.now();
		expect(result.getTime()).toBeGreaterThanOrEqual(before + knownOffset);
		expect(result.getTime()).toBeLessThanOrEqual(after + knownOffset);
	});

	it('applies the saved offset when the offset is stale (saved > 1 hour ago)', () => {
		// Verifies the staleness condition does not crash and the offset is still returned.
		// (The stale path also triggers an async calculateOffset(), which exits early in Node
		// because XMLHttpRequest is undefined.)
		const knownOffset = 5000;
		localStorage.setItem('lucos_time_component-offset', JSON.stringify({
			offset: knownOffset,
			savedAt: Date.now() - (2 * ONE_HOUR_MS), // saved 2 hours ago — stale
		}));
		const before = Date.now();
		const result = getDatetime();
		const after = Date.now();
		expect(result.getTime()).toBeGreaterThanOrEqual(before + knownOffset);
		expect(result.getTime()).toBeLessThanOrEqual(after + knownOffset);
	});

	it('returns local time and triggers recalculation when no offset is stored', () => {
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
