import {getTime, getNewOffset} from './time.js';

const leadingZero = (num) => num.toString().padStart(2, '0');

class LucosTimeElement extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const timeNode = document.createElement("time");
		timeNode.appendChild(document.createTextNode(''));
		timeNode.id = 'lucos_navbar_time';
		let timeNode_timeout;
		function updateNavBarTime() {
			if (timeNode_timeout) clearTimeout(timeNode_timeout);
			const date = new Date(getTime());
			timeNode.firstChild.nodeValue = leadingZero(date.getHours()) + ':' + leadingZero(date.getMinutes()) + ':' + leadingZero(date.getSeconds());
			timeNode_timeout = setTimeout(updateNavBarTime, 1000-date.getMilliseconds());
		}
		updateNavBarTime();

		// Clicking the node triggers a new offset to be calculated
		timeNode.addEventListener('click', async function _timenodecolour() {
			timeNode.style.color = "red";
			updateNavBarTime();
			await getNewOffset();
			timeNode.style.color = "";
			updateNavBarTime();
		}, false);
		shadow.appendChild(timeNode);
	}
}
customElements.define('lucos-time', LucosTimeElement);