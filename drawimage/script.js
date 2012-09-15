var ZEDAPP = {};
ZEDAPP.drawImage = {
	db: null,
	aside: null,
	imageDisplay: null,
	ctx: null,
	nameInput: null,
	commentInput: null,
	list: {},
	currentId: 0,

	clearCanvas: function () {
		"use strict";
		ZEDAPP.drawImage.ctx.fillStyle = "#fff";
		ZEDAPP.drawImage.ctx.fillRect(0, 0, 800, 600);
	},

	setSelectedImage: function (divElement) {
		"use strict";
		divElement.id = "selected";
	},

	unSelectImage: function () {
		"use strict";
		var selected = null;
		selected = document.getElementById("selected");
		if (selected !== null) {
			selected.id = "";
		}
	},

	openImg: function (name, comment, data) {
		"use strict";
		var img = null;
		img = document.createElement("img");
		img.src = data;
		img.onload = function () {
			ZEDAPP.drawImage.nameInput.value = name;
			ZEDAPP.drawImage.commentInput.value = comment;
			ZEDAPP.drawImage.ctx.drawImageFromRect(img, 0, 0, img.width, img.height, 0, 0, 800, 600);
		};
	},

	selectImage: function (files) {
		"use strict";
		var file = files[0], reader = null;
		if (file.type.match(/^image\/*/)) {
			reader = new FileReader();
			reader.onload = function (d) {
				var name = null;
				if (file.name.indexOf(".") !== -1) {
					name = file.name.substr(0, file.name.lastIndexOf("."));
				} else {
					name = file.name;
				}
				ZEDAPP.drawImage.openImg(name, "", d.target.result);
				ZEDAPP.drawImage.currentId = 0;
				ZEDAPP.drawImage.unSelectImage();
			};
			reader.readAsDataURL(file);
		}
	},

	successCallback: function () {
		"use strict";
		console.log("ok");
		//TODO PROBABLY ADD BETTER MSG OR SOMETHING
	},

	errorCallback: function () {
		"use strict";
		console.log("error");
		//TODO PROBABLY ADD BETTER MSG OR SOMETHING
	},

	addToImgList: function (id, name, comment, data) {
		"use strict";
		var tmpContainer = null;
		tmpContainer = document.createElement("div");
		tmpContainer.appendChild(document.createElement("p"));
		tmpContainer.lastChild.appendChild(document.createTextNode(name));
		tmpContainer.appendChild(document.createElement("img"));
		tmpContainer.lastChild.src = data;
		tmpContainer.lastChild.title = name;
		tmpContainer.lastChild.width = "80";
		tmpContainer.lastChild.height = "60";
		tmpContainer.appendChild(document.createElement("p"));
		tmpContainer.lastChild.appendChild(document.createTextNode(comment));
		ZEDAPP.drawImage.aside.appendChild(tmpContainer);
		tmpContainer.onclick = function () {
			ZEDAPP.drawImage.openImg(ZEDAPP.drawImage.list[id].name, ZEDAPP.drawImage.list[id].comment, ZEDAPP.drawImage.list[id].data);
			ZEDAPP.drawImage.currentId = id;
		};
	},

	selectSuccessCallback: function (db, row) {
		"use strict";
		var i = 0, len = 0;
		for (i = 0, len = row.rows.length; i < len; i++) {
			ZEDAPP.drawImage.list[row.rows.item(i).id] = {};
			ZEDAPP.drawImage.list[row.rows.item(i).id].name = row.rows.item(i).name;
			ZEDAPP.drawImage.list[row.rows.item(i).id].comment = row.rows.item(i).comment;
			ZEDAPP.drawImage.list[row.rows.item(i).id].data = row.rows.item(i).data;
			ZEDAPP.drawImage.addToImgList(row.rows.item(i).id, row.rows.item(i).name, row.rows.item(i).comment, row.rows.item(i).data);
		}
	},

	create: function () {
		"use strict";
		ZEDAPP.drawImage.db.transaction(function (tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS image (id INTEGER PRIMARY KEY, name TEXT, comment TEXT, data TEXT)", [], ZEDAPP.drawImage.successCallback, ZEDAPP.drawImage.errorCallback);
		});
	},

	insert: function (name, comment, data, onSuccess) {
		"use strict";
		if (onSuccess === undefined) {
			onSuccess = ZEDAPP.drawImage.successCallback;
		}
		if (typeof (name) === "string" && typeof (comment) === "string" && typeof (data) === "string") {
			ZEDAPP.drawImage.db.transaction(function (tx) {
				tx.executeSql("INSERT INTO image (name, comment, data) VALUES (?, ?, ?)", [name, comment, data], onSuccess, ZEDAPP.drawImage.errorCallback);
			});
		} else {
			console.log("errr");
		}
	},

	select: function (id) {
		"use strict";
		if (id === undefined) {
			ZEDAPP.drawImage.db.transaction(function (tx) {
				tx.executeSql("SELECT * FROM image", [], ZEDAPP.drawImage.selectSuccessCallback, ZEDAPP.drawImage.errorCallback);
			});
		} else {
			ZEDAPP.drawImage.db.transaction(function (tx) {
				tx.executeSql("SELECT * FROM image WHERE id = ?", [id], ZEDAPP.drawImage.selectSuccessCallback, ZEDAPP.drawImage.errorCallback);
			});
		}
	},

	update: function (id, name, comment, data) {
		"use strict";
		if (typeof (id) === "number" && typeof (name) === "string" && typeof (comment) === "string" && typeof (data) === "string") {
			ZEDAPP.drawImage.db.transaction(function (tx) {
				tx.executeSql("UPDATE image SET name=?, comment=?, data=? WHERE id=?", [name, comment, data, id], ZEDAPP.drawImage.successCallback, ZEDAPP.drawImage.errorCallback);
			});
		} else {
			console.log("errr");
		}
	},

	drawCircle: function (x, y, width) {
		"use strict";
		ZEDAPP.drawImage.ctx.fillStyle = "#000";
		ZEDAPP.drawImage.ctx.beginPath();
		ZEDAPP.drawImage.ctx.arc(x, y, width / 2, 0, 2 * Math.PI, false);
		ZEDAPP.drawImage.ctx.fill();
	},

	getter: function (db, row) {
		"use strict";
		ZEDAPP.drawImage.select(row.insertId);
		console.log("ok");
	},

	init: function () {
		"use strict";
		//DELETE FROM image WHERE id > 2;
		ZEDAPP.drawImage.db = window.openDatabase("files", "1.0", "for files", 104857600);
		ZEDAPP.drawImage.aside = document.getElementsByTagName("aside")[0];
		ZEDAPP.drawImage.aside.onclick = function (e) {
			if (e.target !== e.currentTarget) {
				ZEDAPP.drawImage.unSelectImage();
				if (e.target.parentElement === e.currentTarget) {
					ZEDAPP.drawImage.setSelectedImage(e.target);
				} else {
					ZEDAPP.drawImage.setSelectedImage(e.target.parentElement);
				}
			}
		};
		ZEDAPP.drawImage.imageDisplay = document.getElementById("imgdisplay");
		ZEDAPP.drawImage.nameInput = document.getElementById("name");
		ZEDAPP.drawImage.commentInput = document.getElementById("comment");
		ZEDAPP.drawImage.ctx = ZEDAPP.drawImage.imageDisplay.getContext("2d");
		ZEDAPP.drawImage.clearCanvas();
		ZEDAPP.drawImage.save = document.getElementById("save");
		ZEDAPP.drawImage.save.onclick = function () {
			if (ZEDAPP.drawImage.currentId > 0) {
				ZEDAPP.drawImage.update(ZEDAPP.drawImage.currentId, ZEDAPP.drawImage.nameInput.value, ZEDAPP.drawImage.commentInput.value, ZEDAPP.drawImage.imageDisplay.toDataURL());
			} else {
				ZEDAPP.drawImage.insert(ZEDAPP.drawImage.nameInput.value, ZEDAPP.drawImage.commentInput.value, ZEDAPP.drawImage.imageDisplay.toDataURL(), ZEDAPP.drawImage.getter);
			}
			ZEDAPP.drawImage.nameInput.value = "";
			ZEDAPP.drawImage.commentInput.value = "";
			ZEDAPP.drawImage.clearCanvas();
		};
		ZEDAPP.drawImage.imageDisplay.onmousedown = function (e) {
			if (e.button === 0) {
				ZEDAPP.drawImage.drawCircle(e.offsetX, e.offsetY, 20);
				ZEDAPP.drawImage.imageDisplay.onmousemove = function (e) {
					ZEDAPP.drawImage.drawCircle(e.offsetX, e.offsetY, 20);
				};
				document.onmouseup = function () {
					ZEDAPP.drawImage.imageDisplay.onmousemove = null;
				};
			}
		};
		ZEDAPP.drawImage.create();
		ZEDAPP.drawImage.select();
		document.getElementsByTagName("input")[0].onchange = function () {
			ZEDAPP.drawImage.selectImage(this.files);
		};
	}
};
window.onload = ZEDAPP.drawImage.init;