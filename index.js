import * as pubsub from 'lucos_pubsub';
import getTime from './time.js';

const leadingZero = (num) => num.toString().padStart(2, '0');

class LucosTimeElement extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const timeNode = document.createElement("time");
		timeNode.appendChild(document.createTextNode(''));
		timeNode.id = 'lucos_navbar_time';
		let timeNode_timeout;
		function updateNavBarTime(force) {
			if (timeNode_timeout) clearTimeout(timeNode_timeout);
			const date = new Date(getTime(force));
			timeNode.firstChild.nodeValue = leadingZero(date.getHours()) + ':' + leadingZero(date.getMinutes()) + ':' + leadingZero(date.getSeconds());
			timeNode_timeout=setTimeout(updateNavBarTime, 1000-date.getMilliseconds());
		}
		updateNavBarTime();
		timeNode.addEventListener('click', function _timenodecolour() {
			timeNode.classList.add("updating");
			timeNode.style.color = "red";
			updateNavBarTime(true);
		}, false);
		pubsub.listen('offsetupdate', function _timenodecolourend(offset) {
			if (offset.fresh) timeNode.classList.remove("updating");
			timeNode.style.color = "";
		});
		shadow.appendChild(timeNode);
	}
}
customElements.define('lucos-time', LucosTimeElement);