import { getDatetime, calculateOffset } from './time.js';

const leadingZero = (num) => num.toString().padStart(2, '0');

export function initWebComponent() {
	class LucosTimeElement extends HTMLElement {
		constructor() {
			super();

			const shadow = this.attachShadow({mode: 'open'});
			const timeNode = document.createElement("time");
			timeNode.appendChild(document.createTextNode(''));
			timeNode.id = 'lucos_navbar_time';
			let timeNode_timeout;
			function updateTime() {
				if (timeNode_timeout) clearTimeout(timeNode_timeout);
				const date = getDatetime();
				timeNode.firstChild.nodeValue = leadingZero(date.getHours()) + ':' + leadingZero(date.getMinutes()) + ':' + leadingZero(date.getSeconds());
				timeNode_timeout = setTimeout(updateTime, 1000-date.getMilliseconds());
				const tickEvent = new CustomEvent('tick', { detail: date });
				document.dispatchEvent(tickEvent);
			}
			updateTime();

			// Clicking the node triggers a new offset to be calculated
			timeNode.addEventListener('click', async function _timenodecolour() {
				timeNode.style.color = "red";
				updateTime();
				await calculateOffset();
				timeNode.style.color = "";
				updateTime();
			}, false);
			shadow.appendChild(timeNode);
		}
	}
	customElements.define('lucos-time', LucosTimeElement);
}