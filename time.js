/**
 * This module implements a HTTP-based approxomiation of NTP
 * Theory around synchronising time in distrubuted systems: https://www.inf.ed.ac.uk/teaching/courses/ds/handouts/part3.pdf
 **/

/**
 * Returns the current unix timestamp, as according to the local system time
 * 
 * @returns {number} A unix timestamp
 **/
function localTime() {
	return new Date().getTime();
}

/**
 * Does a HTTP request to the lucos time server to calculate the offset and delay between client and server
 * Warning: it is NOT reccomended to trust the offset from a single HTTP request.  Best practice is to do multiple requests and choose the one with the lowest delay.
 * 
 * @returns {Object} An object with the properties offset and delay
 **/
const calculateIndividualOffset = async () => new Promise((resolve, reject) => {
	let t0, t1, t2, t3;
	const req = new XMLHttpRequest();
	req.addEventListener('readystatechange', event => {
		switch (req.readyState) {
			case 1: // opened
				t3 = localTime();
				break;
			case 2: // headers received
				t0 = localTime();
				break;
			case 4: // done
				t1 = t2 = parseInt(req.responseText); // Assume the server replied instantaneously
				resolve({
					offset: (t2 - t3 + t1 - t0) / 2, // Estimate for the actual offset between two clocks
					delay: t2 - t3 + t0 -t1, // Total transmission time for the pair of messages
				});
				break;
		}
	});
	req.addEventListener('error', event => {
		reject(event);
	});

	req.open('GET', "https://am.l42.eu/now?_cb="+localTime(), true);
	req.send(null);
});

/**
 * Does multiple HTTP requests to the server to calculate offsets between client and server time
 * Choose the value which had the lowest delay
 * The new value is stored in localStorage, so future calls to `getTime` will use it
 * Note: This function has some basic debouncing logic to avoid mulitple simultaneous requests.
 **/
export async function calculateOffset() {
	let offset, delay;
	const fetching = localStorage.getItem('lucos_time_component-fetching');
	
	// If a fetch has been started in the last minute, then don't bother
	if (fetching && fetching > localTime()-(60*1000)) return;
	localStorage.setItem('lucos_time_component-fetching', localTime());

	// Try eight times to get the most accurate value
	for (let ii = 0; ii < 8; ii++) {
		const output = await calculateIndividualOffset();
		if (typeof delay === "undefined" || output.delay < delay) { // Replace existing offset if there is a more accurate one
			({offset, delay} = output);
		}
	}
						
	// Save in local storage (savedAt uses client time for consistency)
	localStorage.setItem('lucos_time_component-offset', JSON.stringify({offset, savedAt: localTime()}));
	localStorage.removeItem('lucos_time_component-fetching');
}

/**
 * Returns the current unix timestamp
 * Uses the client's current time, adjusted by a known offset with server time (where available)
 * If the offset hasn't been calculated in a while, triggers an asynchronous recalculation
 *
 * @returns {number} A unix timestamp
 **/
function getTimestamp() {

	// If localStorage isn't available, then it's likely we're running server side, so just trust the local time
	if (typeof localStorage !== 'object') return localTime();

	const rawSavedOffset = localStorage.getItem('lucos_time_component-offset');
	
	// If the offset isn't saved, then request an update and just use client time.
	if (!rawSavedOffset) {
		calculateOffset();
		return localTime();
	}
	const savedOffset = JSON.parse(rawSavedOffset);
	
	// If the offset hasn't been updated in over an hour, request an update
	if (savedOffset.savedAt > localTime() + (60 * 60 * 1000)) calculateOffset();
	return localTime() + savedOffset.offset;
}

/**
 * Returns the current date and time
 * Uses the client's current time, adjusted by a known offset with server time (where available)
 * If the offset hasn't been calculated in a while, triggers an asynchronous recalculation
 *
 * @returns {Date} The current date and time in a native javascript Date object
 **/
export function getDatetime() {
	return new Date(getTimestamp());
}