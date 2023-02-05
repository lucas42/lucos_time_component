import { getDatetime } from './time.js';

/**
 * Calculates a human-readable string in English explaining how long ago the given date was
 * @param {Date} dateToCompare When to compare to now
 * @param {Date} [overrideNow] A native javascript Date object used to override the current time,
 *               normally used for testing or circumstance where a consistent out is required
 * @returns string A human-readable string in English
 */
export function relativeDate(dateToCompare, overrideNow=null) {
	const now = overrideNow || getDatetime();
	const diffmillisec = now - dateToCompare;
	const diffsec = Math.round(diffmillisec / 1000);
	if (diffsec < 3) return "Just now";
	if (diffsec < 60) return diffsec + " seconds ago";
	const diffmins = Math.round(diffsec / 60);
	if (diffmins === 1) return "1 minute ago";
	if (diffmins < 60) return diffmins + " minutes ago";
	const diffhours = Math.round(diffmins / 60);
	if (diffhours === 1) return "1 hour ago";
	if (diffhours < 24) return diffhours + " hours ago";
	const diffdays = Math.round(diffhours / 24);
	if (diffdays === 1) return "1 day ago";
	return diffdays + " days ago";
}