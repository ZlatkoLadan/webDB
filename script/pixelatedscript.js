var WebFontConfig = { google: { families: [ 'Press+Start+2P::latin,latin-ext,cyrillic' ]}};
var ZLOYT = {
	title: "Pixelated",
	fontSize: 32,
	speed: 100,
	width: 320,
	height: 480,
	color: "#fff",
	backgroundColor: "#000",
	maxWidthLetters: 0,
	current: 0,
	erase: false,
	canvas: null,
	cx: null,
	progressId: 0,
	progress: 0,
	progressNode: null,
	sleep: 60000,
	sleepCheck: 1000,
	column: 0,
	row: 0,
	maxrows: 0,
	maxcolumns: 0,
	linebreak: false,
	azbuka: "АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ",
	loopId: 0,
	smallScreen: false,

	getProgress: function () {
		"use strict";
		ZLOYT.progress += ZLOYT.sleepCheck;
		ZLOYT.progressNode.nodeValue = String((ZLOYT.progress - ZLOYT.sleepCheck) / ZLOYT.sleepCheck) + "s/" + String(ZLOYT.sleep / 1000) + "s";
		ZLOYT.progressId = window.setTimeout(ZLOYT.getProgress, ZLOYT.sleepCheck);
	},

	onReadyState: function () {
		"use strict";
		var result = null;
		if (this.readyState === 4 && this.status === 200) {
			result = JSON.parse(this.responseText);
			if (result.returnvalue === 1) {
				ZLOYT.cx.fillStyle = ZLOYT.backgroundColor;
				ZLOYT.cx.fillRect(0, 0, ZLOYT.width, ZLOYT.height);
				ZLOYT.cx.fillStyle = ZLOYT.color;
				ZLOYT.erase = false;
				ZLOYT.current = 0;
				ZLOYT.azbuka = result.motd;
				ZLOYT.cx.fillStyle = ZLOYT.color;
				ZLOYT.row = 0;
				ZLOYT.column = 0;
				ZLOYT.linebreak = result.linebreak;
			}
		}
	},

	loop: function () {
		"use strict";
		if (ZLOYT.current >= ZLOYT.azbuka.length) {
			if (ZLOYT.erase) {
				ZLOYT.cx.fillRect(0, 0, ZLOYT.width, ZLOYT.height);
				ZLOYT.cx.fillStyle = ZLOYT.color;
				ZLOYT.erase = false;
			} else {
				ZLOYT.cx.fillStyle = ZLOYT.backgroundColor;
				ZLOYT.erase = true;
			}

			ZLOYT.current = 0;
			ZLOYT.line = 0;
			ZLOYT.row = 0;
		}
		if (!ZLOYT.linebreak) {
			if (!ZLOYT.erase) {
				ZLOYT.cx.fillText(ZLOYT.azbuka.charAt(ZLOYT.current), (ZLOYT.current % ZLOYT.maxWidthLetters) * ZLOYT.fontSize, Math.floor(ZLOYT.current / ZLOYT.maxWidthLetters) * ZLOYT.fontSize + ZLOYT.fontSize);
			} else {
				ZLOYT.cx.fillRect((ZLOYT.current % ZLOYT.maxWidthLetters) * ZLOYT.fontSize, Math.floor(ZLOYT.current / ZLOYT.maxWidthLetters) * ZLOYT.fontSize, ZLOYT.fontSize, ZLOYT.fontSize);
			}
		} else {
			if (ZLOYT.azbuka.charAt(ZLOYT.current) !== "\n") {
				if (!ZLOYT.erase) {
					ZLOYT.cx.fillText(ZLOYT.azbuka.charAt(ZLOYT.current), ZLOYT.column * ZLOYT.fontSize, ZLOYT.row * ZLOYT.fontSize + ZLOYT.fontSize);
				} else {
					ZLOYT.cx.fillRect(ZLOYT.column * ZLOYT.fontSize, ZLOYT.column * ZLOYT.fontSize, ZLOYT.fontSize, ZLOYT.fontSize);
				}
				ZLOYT.column += 1;
			} else {
				ZLOYT.row += 1;
				ZLOYT.column = 0;
			}
		}
		ZLOYT.current += 1;
		ZLOYT.loopId = window.setTimeout(ZLOYT.loop, ZLOYT.speed);
	},

	init: function () {
		"use strict";
		var wrapper = null, xhr = null, xhrFetch = null, reqButton = null;
		wrapper = document.createElement("div");
		ZLOYT.progressNode = document.createTextNode("0");
		wrapper.id = "wrapper";
		wrapper.appendChild(document.createElement("h1"));
		wrapper.lastChild.appendChild(document.createTextNode(ZLOYT.title));
		wrapper.appendChild(document.createElement("p"));
		wrapper.lastChild.id = "status";
		wrapper.lastChild.appendChild(ZLOYT.progressNode);
		document.body.appendChild(wrapper);

		if (ZLOYT.width < document.body.clientWidth || ZLOYT.height < document.body.clientHeight ) {
				ZLOYT.width = document.body.clientWidth - 1;
				ZLOYT.height = document.body.clientHeight - wrapper.clientHeight + 55;
				ZLOYT.smallScreen = true;
		}

		ZLOYT.canvas = document.createElement("canvas");
		ZLOYT.canvas.width = String(ZLOYT.width);
		ZLOYT.canvas.height = String(ZLOYT.height);
		ZLOYT.cx = ZLOYT.canvas.getContext("2d");
		ZLOYT.cx.font = ZLOYT.fontSize + "px 'Press Start 2P'";
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = ZLOYT.onReadyState;
		xhrFetch = function () {
			xhr.open("GET", "php/texts.php", true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(null);
			ZLOYT.progress = 0;
			window.clearTimeout(ZLOYT.progressId);
			ZLOYT.getProgress();
			window.setTimeout(xhrFetch, ZLOYT.sleep);
		};
		xhrFetch();
		wrapper.appendChild(ZLOYT.canvas);

		ZLOYT.cx.fillStyle = ZLOYT.backgroundColor;
		ZLOYT.cx.fillRect(0, 0, ZLOYT.width, ZLOYT.height);
		ZLOYT.cx.fillStyle = ZLOYT.color;
		ZLOYT.maxWidthLetters = ZLOYT.width / ZLOYT.fontSize;
		if (!ZLOYT.smallScreen) {
			wrapper.style.marginLeft = -wrapper.clientWidth / 2 + "px";
			wrapper.style.marginTop = -wrapper.clientHeight / 2 + "px";
		}
		ZLOYT.maxcolumns = Math.floor(ZLOYT.width / ZLOYT.fontSize);
		ZLOYT.maxrows = Math.floor(ZLOYT.height / ZLOYT.fontSize);
		window.scrollTo(0, 1);
		ZLOYT.loop();
	}
};
(function () {
	"use strict";
	var wf = null, s = null;
	wf = document.createElement('script');
	wf.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'false';
	s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
}());

window.onload = ZLOYT.init;
