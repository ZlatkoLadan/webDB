var selectAudio = function (files) {
	"use strict";
	var file = files[0], reader = null;
	if (file.type.match(/audio\.*/)) {
		reader = new FileReader();
		reader.onload = function (d) {
			insert(d.target.result);
		};
		reader.readAsDataURL(file);
	}
};
var db;
var successCallback = function (val) {
	"use strict";
	console.log("ok");
	//TODO PROBABLY ADD BETTER MSG OR SOMETHING
};
var errorCallback = function (val) {
	"use strict";
	console.log("error");
	//TODO PROBABLY ADD BETTER MSG OR SOMETHING
};
// var rowOutput = [];
var insertSuccessCallback = function (db, row) {
	"use strict";
	var text = null, i = 0;
	//for (i = 0; i < row.rows.length; i++) {
	//text[i].type = text[i].src.substring(text[i].src.search(":") + 1, text[i].src.search(";"));
	text = document.createElement("audio");
	text.src = row.rows.item(Math.floor(Math.random() * text.length)).text;
	text.controls = "controls";
	//rowOutput[i].text;
	//}
	document.body.appendChild(text).play();
};

var create = function () {
	"use strict";
	db.transaction(function(tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS audio (id INTEGER PRIMARY KEY, text TEXT)", [], successCallback, errorCallback);
	});
};
var insert = function (value) {
	"use strict";
	db.transaction(function(tx) {
		tx.executeSql("INSERT INTO audio(text) VALUES (?)", [value], successCallback, errorCallback);
	});
};
var select = function (value) {
	"use strict";
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM audio ", [], insertSuccessCallback, errorCallback);
	});
};
window.onload = function () {
	"use strict";
	var i = 0;
	db = window.openDatabase("files", "1.0", "for files", 100 * 1024 * 1024);
	create();
	document.getElementsByTagName("input")[0].onchange = function () {
		selectAudio(this.files);
	};
	select();
};