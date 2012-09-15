var db = null, selectImage = null, aside = null, imageDisplay = null, ctx = null, nameInput = null, commentInput = null,
	save = null, successCallback = null, errorCallback = null, create = null, selectSuccessCallback = null,
	insert = null, select = null, update = null, addToImgList = null;

var list = {};
var currentId = 0;

var clearCanvas = function () {
	"use strict";
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, 800, 600);
};

var setSelectedImage = function (divElement) {
	"use strict";
	divElement.id = "selected";
};

var unSelectImage = function () {
	"use strict";
	var selected = null;
	selected = document.getElementById("selected");
	if (selected !== null) {
		selected.id = "";
	}
};

var openImg = function (name, comment, data) {
	"use strict";
	var img = null;
	img = document.createElement("img");
	img.src = data;
	img.onload = function () {
		nameInput.value = name;
		commentInput.value = comment;
		ctx.drawImageFromRect(img, 0, 0, img.width, img.height, 0, 0, 800, 600);
	};
};

selectImage = function (files) {
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
			openImg(name, "", d.target.result);
			currentId = 0;
			unSelectImage();
		};
		reader.readAsDataURL(file);
	}
};

successCallback = function () {
	"use strict";
	console.log("ok");
	//TODO PROBABLY ADD BETTER MSG OR SOMETHING
};

errorCallback = function () {
	"use strict";
	console.log("error");
	//TODO PROBABLY ADD BETTER MSG OR SOMETHING
};

addToImgList = function (id, name, comment, data) {
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
	aside.appendChild(tmpContainer);
	tmpContainer.onclick = function () {
		openImg(list[id].name, list[id].comment, list[id].data);
		currentId = id;
	};
};

selectSuccessCallback = function (db, row) {
	"use strict";
	var i = 0, len = 0;
	for (i = 0, len = row.rows.length; i < len; i++) {
		list[row.rows.item(i).id] = {};
		list[row.rows.item(i).id].name = row.rows.item(i).name;
		list[row.rows.item(i).id].comment = row.rows.item(i).comment;
		list[row.rows.item(i).id].data = row.rows.item(i).data;
		addToImgList(row.rows.item(i).id, row.rows.item(i).name, row.rows.item(i).comment, row.rows.item(i).data);
	}
};

create = function () {
	"use strict";
	db.transaction(function (tx) {
		tx.executeSql("CREATE TABLE IF NOT EXISTS image (id INTEGER PRIMARY KEY, name TEXT, comment TEXT, data TEXT)", [], successCallback, errorCallback);
	});
};

insert = function (name, comment, data, onSuccess) {
	"use strict";
	if (onSuccess === undefined) {
		onSuccess = successCallback;
	}
	if (typeof (name) === "string" && typeof (comment) === "string" && typeof (data) === "string") {
		db.transaction(function (tx) {
			tx.executeSql("INSERT INTO image (name, comment, data) VALUES (?, ?, ?)", [name, comment, data], onSuccess, errorCallback);
		});
	} else {
		console.log("errr");
	}
};

select = function (id) {
	"use strict";
	if (id === undefined) {
		db.transaction(function (tx) {
			tx.executeSql("SELECT * FROM image", [], selectSuccessCallback, errorCallback);
		});
	} else {
		db.transaction(function (tx) {
			tx.executeSql("SELECT * FROM image WHERE id = ?", [id], selectSuccessCallback, errorCallback);
		});
	}
};

update = function (id, name, comment, data) {
	"use strict";
	if (typeof (id) === "number" && typeof (name) === "string" && typeof (comment) === "string" && typeof (data) === "string") {
		db.transaction(function (tx) {
			tx.executeSql("UPDATE image SET name=?, comment=?, data=? WHERE id=?", [name, comment, data, id], successCallback, errorCallback);
		});
	} else {
		console.log("errr");
	}
};

var drawCircle = function (x, y, width) {
	"use strict";
	ctx.fillStyle = "#000";
	ctx.beginPath();
	ctx.arc(x, y, width / 2, 0, 2 * Math.PI, false);
	ctx.fill();
};

window.onload = function () {
	"use strict";
	//DELETE FROM image WHERE id > 2;
	db = window.openDatabase("files", "1.0", "for files", 104857600);
	aside = document.getElementsByTagName("aside")[0];
	aside.onclick = function (e) {
		if (e.target !== e.currentTarget) {
			unSelectImage();
			if (e.target.parentElement === e.currentTarget) {
				setSelectedImage(e.target);
			} else {
				setSelectedImage(e.target.parentElement);
			}
		}
	};
	imageDisplay = document.getElementById("imgdisplay");
	nameInput = document.getElementById("name");
	commentInput = document.getElementById("comment");
	ctx = imageDisplay.getContext("2d");
	clearCanvas();
	save = document.getElementById("save");
	save.onclick = function () {
		if (currentId > 0) {
			update(currentId, nameInput.value, commentInput.value, imageDisplay.toDataURL());
		} else {
			insert(nameInput.value, commentInput.value, imageDisplay.toDataURL(), function (db, row) {
				select(row.insertId);
			});
		}
		nameInput.value = "";
		commentInput.value = "";
		clearCanvas();
	};
	imageDisplay.onmousedown = function (e) {
		if (e.button === 0) {
			drawCircle(e.offsetX, e.offsetY, 20);
			imageDisplay.onmousemove = function (e) {
				drawCircle(e.offsetX, e.offsetY, 20);
			};
			document.onmouseup = function () {
				imageDisplay.onmousemove = null;
			};
		}
	};
	create();
	select();
	document.getElementsByTagName("input")[0].onchange = function () {
		selectImage(this.files);
	};
};