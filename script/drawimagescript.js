var ZEDAPP = {};
/**
 * Drawing object.
 * @author Zlatko Ladan
 */
ZEDAPP.drawImage = {
	db: null,
	aside: null,
	imageDisplay: null,
	ctx: null,
	nameInput: null,
	commentInput: null,
	list: {},
	currentId: 0,

	/**
	 * Clears the canvas
	 * @author Zlatko Ladan
	 */
	clearCanvas: function () {
		"use strict";
		ZEDAPP.drawImage.ctx.fillStyle = "#fff";
		ZEDAPP.drawImage.ctx.fillRect(0, 0, 800, 600);
	},

	/**
	 * Selects an image from the aside element.
	 * @param {HTMLElement} divElement
	 * @author Zlatko Ladan
	 */
	setSelectedImage: function (divElement) {
		"use strict";
		divElement.id = "selected";
	},

	/**
	 * Unselects an image from the aside element.
	 * @author Zlatko Ladan
	 */
	unSelectImage: function () {
		"use strict";
		var selected = null;
		selected = document.getElementById("selected");
		if (selected !== null) {
			selected.id = "";
		}
	},

	/**
	 * Sets canvas, name and comment.
	 * @param {String} name
	 * @param {String} comment
	 * @param {String} data
	 * @author Zlatko Ladan
	 */
	openImg: function (name, comment, data) {
		"use strict";
		var img = null;
		img = document.createElement("img");
		img.src = data;
		img.onload = function () {
			ZEDAPP.drawImage.nameInput.value = name;
			ZEDAPP.drawImage.commentInput.value = comment;
			ZEDAPP.drawImage.ctx.drawImage(img, 0, 0, img.width, img.height);
		};
	},

	/**
	 * Opens an image.
	 * @param {FileList} files
	 * @author Zlatko ladan
	 */
	selectImage: function (files) {
		"use strict";
		var file = files[0], reader = null;
		if (file.type.match(/^image\//)) {
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

	/**
	 * If success occures for WebSQL.
	 * @author Zlatko Ladan
	 */
	successCallback: function () {
		"use strict";
		console.log("ok");
		//TODO PROBABLY ADD BETTER MSG OR SOMETHING
	},

	/**
	 * If error occures for WebSQL.
	 * @author Zlatko Ladan
	 */
	errorCallback: function () {
		"use strict";
		console.log("error");
		//TODO PROBABLY ADD BETTER MSG OR SOMETHING
	},

	/**
	 * Adds to list
	 * @param {Integer} id
	 * @param {String} name
	 * @param {String} comment
	 * @param {String} data
	 * @author Zlatko Ladan
	 */
	addToImgList: function (id, name, comment, data) {
		"use strict";
		var tmpContainer = null, nameElement = null, imageElement = null, commentElement = null;

		if (ZEDAPP.drawImage.list[id] === undefined) {
			ZEDAPP.drawImage.list[id] = {};

			tmpContainer = document.createElement("div");

			nameElement = document.createElement("p");
			nameElement.appendChild(document.createTextNode(name));

			imageElement = document.createElement("img");
			imageElement.src = data;
			imageElement.title = name;
			imageElement.width = "80";
			imageElement.height = "60";

			commentElement = document.createElement("p");
			commentElement.appendChild(document.createTextNode(comment));

			tmpContainer.appendChild(nameElement);
			tmpContainer.appendChild(imageElement);
			tmpContainer.appendChild(commentElement);
			ZEDAPP.drawImage.aside.appendChild(tmpContainer);

			tmpContainer.onclick = function () {
				ZEDAPP.drawImage.openImg(ZEDAPP.drawImage.list[id].name, ZEDAPP.drawImage.list[id].comment, ZEDAPP.drawImage.list[id].data);
				ZEDAPP.drawImage.currentId = id;
			};
			ZEDAPP.drawImage.list[id].nameElement = nameElement;
			ZEDAPP.drawImage.list[id].imageElement = imageElement;
			ZEDAPP.drawImage.list[id].commentElement = commentElement;
		} else {
			ZEDAPP.drawImage.list[id].nameElement.firstChild.nodeValue = name;
			ZEDAPP.drawImage.list[id].imageElement.src = data;
			ZEDAPP.drawImage.list[id].commentElement.firstChild.nodeValue = comment;
		}

		ZEDAPP.drawImage.list[id].name = name;
		ZEDAPP.drawImage.list[id].comment = comment;
		ZEDAPP.drawImage.list[id].data = data;
	},

	/**
	 * Adds all images to list.
	 * @param {SQLTransaction} db
	 * @param {SQLResultSet} row
	 * @author Zlatko Ladan
	 */
	selectSuccessCallback: function (db, row) {
		"use strict";
		var i = 0, len = 0;
		for (i = 0, len = row.rows.length; i < len; i++) {
			ZEDAPP.drawImage.addToImgList(row.rows.item(i).id, row.rows.item(i).name, row.rows.item(i).comment, row.rows.item(i).data);
		}
	},

	/**
	 * Creates table.
	 * @author Zlatko Ladan
	 */
	create: function () {
		"use strict";
		ZEDAPP.drawImage.db.transaction(function (tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS image (id INTEGER PRIMARY KEY, name TEXT, comment TEXT, data TEXT)", [], ZEDAPP.drawImage.successCallback, ZEDAPP.drawImage.errorCallback);
		});
	},

	/**
	 * Inserts image and its data, name and comment to its table.
	 * @param {String} name
	 * @param {String} comment
	 * @param {String} data
	 * @param {Function} onSuccess
	 * @author Zlatko Ladan
	 */
	insert: function (name, comment, data, onSuccess) {
		"use strict";
		alert("df");
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

	/**
	 * Selects one or all images from table.
	 * @param {Integer} id
	 */
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

	/**
	 * Updates an row from the table.
	 * @param {Integer} id
	 * @param {String} name
	 * @param {String} comment
	 * @param {String} data
	 * @author Zlatko Ladan
	 */
	update: function (id, name, comment, data) {
		"use strict";
		if (typeof (id) === "number" && typeof (name) === "string" && typeof (comment) === "string" && typeof (data) === "string") {
			ZEDAPP.drawImage.db.transaction(function (tx) {
				tx.executeSql("UPDATE image SET name=?, comment=?, data=? WHERE id=?", [name, comment, data, id], function () {
					ZEDAPP.drawImage.addToImgList(id, name, comment, data);
				}, ZEDAPP.drawImage.errorCallback);
			});
		} else {
			console.log("errr");
		}
	},

	/**
	 * Draws a circle.
	 * @param {Integer} x
	 * @param {Integer} y
	 * @param {Integer} width
	 * @author Zlatko Ladan
	 */
	drawCircle: function (x, y, width) {
		"use strict";
		ZEDAPP.drawImage.ctx.fillStyle = "#000";
		ZEDAPP.drawImage.ctx.beginPath();
		ZEDAPP.drawImage.ctx.arc(x, y, width / 2, 0, 2 * Math.PI, false);
		ZEDAPP.drawImage.ctx.fill();
	},

	/**
	 * Inserts a single image
	 * @param {SQLTransaction} db
	 * @param {SQLResultSet} row
	 * @author Zlatko Ladan
	 */
	getter: function (db, row) {
		"use strict";
		ZEDAPP.drawImage.select(row.insertId);
		console.log("ok");
	},

	/**
	 * The starter function.
	 * @author Zlatko Ladan
	 */
	init: function () {
		"use strict";
		ZEDAPP.drawImage.db = window.openDatabase("files", "1.0", "for files", 104857600); // 100 MB
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
			ZEDAPP.drawImage.unSelectImage();
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
		ZEDAPP.drawImage.imageDisplay.oncontextmenu = function () {
			alert("hej");
			return false;
			//TODO: FIX functionality
		};
		ZEDAPP.drawImage.create();
		ZEDAPP.drawImage.select();
		document.getElementsByTagName("input")[0].onchange = function () {
			ZEDAPP.drawImage.selectImage(this.files);
		};
	}
};

window.onload = ZEDAPP.drawImage.init;
