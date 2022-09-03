/**
 * This module implements a HTTP-based approxomiation of NTP
 * Theory around synchronising time in distrubuted systems: https://www.inf.ed.ac.uk/teaching/courses/ds/handouts/part3.pdf
 **/

/**
 * Returns the current unix timestamp, as according to the local client
 * 
 * @returns {number} A unix timestamp
 **/
function clientTime() {
	return new Date().getTime();
}

/**
 * Does a HTTP request to the lucos time server to calculate the offset and delay between client and server
 * Warning: it is NOT reccomended to trust the offset from a single HTTP request.  Best practice is to do multiple requests and choose the one with the lowest delay.
 * 
 * @returns {Object} An object with the properties offset and delay
 **/
const calculateOffset = async () => new Promise((resolve, reject) => {
	let t0, t1, t2, t3;
	const req = new XMLHttpRequest();
	req.addEventListener('readystatechange', event => {
		switch (req.readyState) {
			case 1: // opened
				t3 = clientTime();
				break;
			case 2: // headers received
				t0 = clientTime();
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

	req.open('GET', "https://am.l42.eu/now?_cb="+clientTime(), true);
	req.send(null);
});

/**
 * Does multiple HTTP requests to the server to calculate offsets between client and server time
 * Choose the value which had the lowest delay
 * The new value is stored in localStorage, so future calls to `getTime` will use it
 * Note: This function has some basic debouncing logic to avoid mulitple simultaneous requests.
 **/
export async function getNewOffset() {
	let offset, delay;
	const fetching = localStorage.getItem('lucos_time_component-fetching');
	
	// If a fetch has been started in the last minute, then don't bother
	if (fetching && fetching > clientTime()-(60*1000)) return;
	localStorage.setItem('lucos_time_component-fetching', clientTime());

	// Try eight times to get the most accurate value
	for (let ii = 0; ii < 8; ii++) {
		const output = await calculateOffset();
		if (typeof delay === "undefined" || output.delay < delay) { // Replace existing offset if there is a more accurate one
			({offset, delay} = output);
		}
	}
						
	// Save in local storage (savedAt uses client time for consistency)
	localStorage.setItem('lucos_time_component-offset', JSON.stringify({offset, savedAt: clientTime()}));
	localStorage.removeItem('lucos_time_component-fetching');
}

/**
 * Returns the current unix timestamp
 * Uses the client's current time, adjusted by a known offset with server time (where available)
 * If the offset hasn't been calculated in a while, triggers an asynchronous recalculation
 * 
 * @returns {number} A unix timestamp
 **/
export function getTime() {
	const rawSavedOffset = localStorage.getItem('lucos_time_component-offset');
	
	// If the offset isn't saved, then request an update and just use client time.
	if (!rawSavedOffset) {
		getNewOffset();
		return clientTime();
	}
	const savedOffset = JSON.parse(rawSavedOffset);
	
	// If the offset hasn't been updated in over an hour, request an update
	if (savedOffset.savedAt > clientTime() + (60 * 60 * 1000)) getNewOffset();
	return clientTime() + savedOffset.offset;
}

