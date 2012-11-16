var ZEDAPP = {};
ZEDAPP.StringUtil = {
	numberOfMatches: function (searchString, textString, ignoreCase) {
		"use strict";
		var matches = 0, regEx = null, setting = "g";
		if (ignoreCase === true) {
			setting = setting + "i";
		}
		regEx = new RegExp(searchString, setting);
		matches = textString.match(regEx);
		return matches === null ? 0 : matches.length;
	},

	sprintf: function (format) {
		"use strict";
		var i = 0, len = 0, result = "";
		if (arguments.length > 0) {
			if (arguments.length - 1 !== ZEDAPP.StringUtil.numberOfMatches("^%s|[^%]%s", format, true)) {
				throw new EvalError("Too many or too few replacements!");
			}
			result = format;
			for (i = 1, len = arguments.length; i < len; i++) {
				result = result.replace(/^%s|([^%])%s/i, "$1" + arguments[i]);
			}
			return result;
		}
		throw new Error("Empty call to function!");
	}
};

/**
 * Drawing object.
 * @author Zlatko Ladan
 */
ZEDAPP.drawImage = {
	MESSAGE_REMOVE_IMAGE: 'Do you want to remove "%s"?',
	DB_DATABASE: "files",
	DB_VERSION: "1.0",
	DB_DESCRIPTION: "for files",
	DB_SIZE: 104857600,
	 
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

			tmpContainer.oncontextmenu = function (e) {
				var menu = ZEDAPP.drawImage.contextMenu.thumbnail;
				menu.menu.style.display = "";
				menu.menu.style.left = e.pageX + "px";
				menu.menu.style.top = e.pageY + "px";
				menu.id = id;
				return false;
			};
			ZEDAPP.drawImage.list[id].nameElement = nameElement;
			ZEDAPP.drawImage.list[id].imageElement = imageElement;
			ZEDAPP.drawImage.list[id].commentElement = commentElement;
		} else {
			ZEDAPP.drawImage.list[id].imageElement.title = name;
			ZEDAPP.drawImage.list[id].nameElement.firstChild.nodeValue = name;
			ZEDAPP.drawImage.list[id].imageElement.src = data;
			ZEDAPP.drawImage.list[id].commentElement.firstChild.nodeValue = comment;
		}

		ZEDAPP.drawImage.list[id].name = name;
		ZEDAPP.drawImage.list[id].comment = comment;
		ZEDAPP.drawImage.list[id].data = data;
	},

	removeImgFromList: function (id) {
		"use strict";
		ZEDAPP.drawImage.aside.removeChild(ZEDAPP.drawImage.list[id].imageElement.parentElement);
		delete ZEDAPP.drawImage.list[id];
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
	 * Deletes an image and its data from the table.
	 * @param {Integer} id
	 * @author Zlatko Ladan
	 */
	remove: function (id) {
		"use strict";
		if (typeof (id) === "number") {
			ZEDAPP.drawImage.db.transaction(function (tx) {
				tx.executeSql("DELETE FROM image WHERE id = ?", [id], function () {
					ZEDAPP.drawImage.removeImgFromList(id);
				}, ZEDAPP.drawImage.errorCallback);
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

	contextMenu: {
		thumbnail: {
			menu: null,
			id: 0
		},

		initMenues: function () {
			"use strict";
			ZEDAPP.drawImage.contextMenu.initThumbnailMenu();
		},

		initThumbnailMenu: function () {
			"use strict";
			var thumbnailMenu = null, ULlist = null, listItem = null, anchor = null, textNode = null;

			thumbnailMenu = document.createElement("div");
			ULlist = document.createElement("ul");

			thumbnailMenu.id = "contextmenu";
			thumbnailMenu.style.display = "none";

			listItem = document.createElement("li");
			anchor = document.createElement("a");
			textNode = document.createTextNode("Remove");

			anchor.href = "#";
			anchor.onclick = function () {
				var id = 0;
				id = ZEDAPP.drawImage.contextMenu.thumbnail.id;
				if (confirm(ZEDAPP.StringUtil.sprintf(ZEDAPP.drawImage.MESSAGE_REMOVE_IMAGE, ZEDAPP.drawImage.list[id].name))) {
					ZEDAPP.drawImage.remove(id);
				}
				return false;
			};

			anchor.appendChild(textNode);
			listItem.appendChild(anchor);
			ULlist.appendChild(listItem);
			thumbnailMenu.appendChild(ULlist);
			document.body.appendChild(thumbnailMenu);
			ZEDAPP.drawImage.contextMenu.thumbnail.menu = thumbnailMenu;
		}
	},

	/**
	 * The starter function.
	 * @author Zlatko Ladan
	 */
	init: function () {
		"use strict";
		var fileChoosingElement = document.getElementsByTagName("input")[0];

		ZEDAPP.drawImage.contextMenu.initMenues(); //TODO EDIT

		ZEDAPP.drawImage.db = window.openDatabase(ZEDAPP.drawImage.DB_DATABASE, ZEDAPP.drawImage.DB_VERSION, ZEDAPP.drawImage.DB_DESCRIPTION, ZEDAPP.drawImage.DB_SIZE);
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
		document.body.onclick = function () {
			//TODO: FIX functionality
			ZEDAPP.drawImage.contextMenu.thumbnail.menu.style.display = "none";
		};
		document.body.oncontextmenu = function (e) {
			return false;
		};
		ZEDAPP.drawImage.create();
		ZEDAPP.drawImage.select();
		ZEDAPP.drawImage.nameInput.oncontextmenu = function (e) {
			e.stopPropagation();
			return true;
		};
		ZEDAPP.drawImage.commentInput.oncontextmenu = ZEDAPP.drawImage.nameInput.oncontextmenu;
		fileChoosingElement.onchange = function () {
			ZEDAPP.drawImage.selectImage(this.files);
		};
	}
};

window.onload = ZEDAPP.drawImage.init;
