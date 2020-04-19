const editorObjectTypes = [], canvas = document.getElementById('canv'), canvas3 = document.getElementById('selCanv'), panelSize = 400,
drawGlobal = async () => {
	ctx = canvas.getContext('2d');
	let gridSize = canvas.clientWidth / map.width;
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	for (let i = 1; i < map.width; i++) {
		ctx.beginPath(); let xx = i * gridSize;
		ctx.moveTo(xx, 0);
		ctx.lineTo(xx, canvas.clientHeight);
		ctx.stroke();
	}
	for (let i = 1; i < map.height; i++) {
		ctx.beginPath(); let yy = i * gridSize;
		ctx.moveTo(0, yy);
		ctx.lineTo(canvas.clientWidth, yy);
		ctx.stroke();
	}
	map.objs.forEach(o => o.draw(ctx, gridSize));
	selectedObjs.forEach(o => {
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'rgb(255, 165, 0)';
		ctx.strokeRect(o.x * gridSize, o.y * gridSize, gridSize, gridSize);
	});
}, resize = () => {
	let oldW = canvas.width, w = window.innerWidth - panelSize, h = map.height / map.width * w;
	if (h > window.innerHeight) {
		h = window.innerHeight;
		w = map.width / map.height * h;
		if (oldW == w)
			return;
		panel.style.width = window.innerWidth - w + 'px';
	} else
		panel.style.width = panelSize + 'px';
	if (oldW == w)
		return;
	panel.style.left = w + 'px';
	panel.style.top = '0px'; panel.style.height = h + 'px';

	canvas.style.top = '0px'; canvas.style.left = '0px';
	canvas.width = w; canvas.height = h;
	canvas3.style.top = '0px'; canvas3.style.left = '0px';
	canvas3.width = w; canvas3.height = h;
	drawGlobal();
}, map = {
	width: 15,
	height: 10,
	objs: []
}, checkB = document.getElementById('dragDupe'), controlsDiv = document.getElementById('controls'), addCustomType = t => {
	
	editorObjectTypes.push(t);
	
	let entry = document.createElement('div');
	entry.classList.add('obj-entry');

	let canvasBOI = document.createElement('canvas');
	canvasBOI.width = 50;
	canvasBOI.height = 50;
	canvasBOI.style.width = '50px';
	canvasBOI.style.height = '50px';
	entry.appendChild(canvasBOI);

	let TESSA = document.createElement('span');
	TESSA.innerText = t.factory.toString();
	entry.appendChild(TESSA);
	
	t.factory.drawIcon(canvasBOI.getContext('2d'), 50, 50);

	entry.addEventListener('click', () => {
		let sel = document.getElementById('selected');
		if (sel)
			sel.id = '';

		controlsDiv.innerHTML = '';
		if (sel == entry) {
			selectedType = null;
			return;
		}
		entry.id = 'selected';
		selectedType = t;
		
		let cObj = t.factory.createControls();
		controls = Object.values(cObj).map(o => o[1]);
		Object.entries(cObj).forEach(([k, v]) => {
			let div = document.createElement('div'), p = document.createElement('h2');
			p.innerText = k;
			div.appendChild(p);
			div.appendChild(v[0]);
			div.classList.add('controlDivEntry');
			controlsDiv.appendChild(div);
		});

	}, false);
	let table = document.getElementById('objs-table');
	table.insertBefore(entry, table.lastElementChild);
}, unparseGameObject = o => ({type: o.getClass(), args: o.asArgs()}), save = () => {
	let saveMap = {};
	Object.assign(saveMap, map);
	saveMap.objs = map.objs.map(unparseGameObject);
	delete saveMap.robotok;
	
	let n = document.getElementById('mapNameForm').value || 'Unnamed';
	saveMap.name = n;
	download(JSON.stringify(saveMap), `${n}.json`, 'text/json');
}, putIn = o => {
	if (map.objs.indexOf(o) != -1)
		return;
	map.objs.push(o);
	drawGlobal();
	return o;
}, putOut = o => {
	let i1 = map.objs.indexOf(o);
	if (i1 != -1) {
		let i2 = selectedObjs.indexOf(o);
		if (i2 != -1)
			selectedObjs.splice(i1, 1);
		map.objs.splice(i1, 1);
		drawGlobal();
		return o;
	}
	return null;
}, widthInp = document.getElementById('pWidth'), heightInp = document.getElementById('pHeight'), containsPoint = (p, t, b) => {
	if (!t || !t || !b)
		return false;
	if (t.x > b.x) {
		let q = t.x;
		t.x = b.x;
		b.x = q;
	}
	if (t.y > b.y) {
		let q = t.y;
		t.y = b.y;
		b.y = q;
	}
	return p.x >= t.x && p.x <= b.x && p.y >= t.y && p.y <= b.y;
}, cancelMove = () => {
	moving = false;
	document.body.style.cursor = 'auto';
}, selected = () => {
	selectDiv.innerHTML = '';
	if (selectedObjs.length == 0)
		selectDiv.style.display = 'none';
	else if (selectedObjs.length == 1) {
		selectDiv.style.display = 'flex';
		let s = document.createElement('span');
		s.innerText = `Editing [${selectedObjs[0].getClass()}]`;
		selectDiv.appendChild(s);
		Object.entries(selectedObjs[0].getEditor()).forEach(([k, v]) => {
			let div = document.createElement('div'), p = document.createElement('h2');
			p.innerText = k;
			div.appendChild(p);
			div.appendChild(v);
			div.classList.add('controlDivEntry');
			selectDiv.appendChild(div);
		});
	} else {
		selectDiv.style.display = 'flex';
		let s = document.createElement('span');
		s.innerText = `Selected ${selectedObjs.length} objects`;
		selectDiv.appendChild(s);
	}
}, selectDiv = document.getElementById('selection');

widthInp.value = map.width;
setInputFilter(widthInp, v => {
	if (v.includes('.'))
		return false;
	let n = new Number(v), b = n % 1 == 0 && n > 0;
	if (b) {
		map.width = n;
		resize();
	}
	return b;
});
heightInp.value = map.height;
setInputFilter(heightInp, v => {
	if (v.includes('.'))
		return false;
	let n = new Number(v), b = n % 1 == 0 && n > 0;
	if (b) {
		map.height = n;
		resize();
	}
	return b;
});

addCustomType(Wall);
addCustomType(Kavics);

let btn = -1, dragging = false, lastClick = {x: -1, y: -1}, moving = false,
selectedType, controls, selectionStart, selectedObjs = [], ctrlPressed = false;
window.addEventListener('blur', () => dragging = false, false);
canvas3.addEventListener('contextmenu', e => e.preventDefault(), false);
document.body.addEventListener('selectstart', e => {if (e.target == document.body) e.preventDefault()}, false);

document.addEventListener('keydown', e => {
	switch (e.key.toLowerCase()) {
		case 'control':
			ctrlPressed = true;
			break;

		case 'a':
			if (ctrlPressed) {
				selectedObjs = map.objs.concat([]);
				selected();
				drawGlobal();
			}
			break;

		case 'm':
			if (ctrlPressed) {
				if (moving)
					cancelMove();
				else {
					document.body.style.cursor = 'move';
					moving = true;
				}
			}
			break;

		case 'z':
			if (ctrlPressed)
				console.log('ctrl Z');
			break;
		
		case 'escape':
			if (moving)
				cancelMove();
			else if (selectedType) {
				let st = document.getElementById('selected');
				st.id = '';
				controlsDiv.innerHTML = '';
				selectedType = null;
			} else {
				selectedObjs = [];
				selected();
				drawGlobal();
			}
			break;

		case 'delete':
		case 'backspace':
			map.objs = map.objs.filter(o => !selectedObjs.includes(o));
			selectedObjs = [];
			selected();
			drawGlobal();
			break;
	}
}, false);
document.addEventListener('keyup', e => {
	switch (e.key.toLowerCase()) {
		case 'control':
			ctrlPressed = false;
			break;
	}
}, false);

document.addEventListener('mouseup', e => {
	dragging = e.button != btn;
	if (selectedType)
		return;
	
	if (btn == 0) {
		let gridSize = canvas.width / map.width, xy = {x: Math.floor(e.clientX / gridSize), y: Math.floor(e.clientY / gridSize)};
		
		if (!selectionStart)
			return;

		if (ctrlPressed)
			selectedObjs = selectedObjs.concat(map.objs.filter(o => {
				let inSelection = containsPoint({x: o.x, y: o.y}, selectionStart, xy);
				if (inSelection) {
					let ind = selectedObjs.indexOf(o)
					if (ind != -1) {
						selectedObjs.splice(ind, 1);
						return false;
					}
				}
				return inSelection;
			}));
		else
			selectedObjs = map.objs.filter(o => containsPoint({x: o.x, y: o.y}, selectionStart, xy));
		selected();

		lastClick = {x: -1, y: -1};
		let ctx2 = canvas3.getContext('2d');
		ctx2.clearRect(0, 0, canvas3.width, canvas3.height);
		drawGlobal();
		selectionStart = null;
	}
}, false);
canvas3.addEventListener('mousedown', async e => {
	dragging = true;
	btn = e.button;
	
	let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize);
	if (btn == 2) { // right
		KeressTömb(x, y).forEach(putOut);
		selected();
		return;
	}
	if (moving)
		return;
	if (selectedType) {
		if (btn == 0) { // left
			putIn(await selectedType.factory.createObject(x, y, controls.map(p => p())));
			lastClick.x = x;
			lastClick.y = y;
		}
	} else
		selectionStart = {x, y};
});
canvas3.addEventListener('mousemove', async e => {
	if (!dragging)
		return;
	let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize),
		oX = lastClick.x, oY = lastClick.y;
	lastClick.x = x;
	lastClick.y = y;
	if (btn == 2) {// right
		KeressTömb(x, y).forEach(putOut);
		selected();
		return;
	}
	if (btn != 0)
		return;
	if (moving) {
		let diffX = oX == -1 ? 0 : x - oX, diffY = oY == -1 ? 0 : y - oY;
		if (diffX || diffY) {
			selectedObjs.forEach(o => { o.x += diffX; o.y += diffY; });
			drawGlobal();
		}
		return;
	}

	if (selectedType) {
		if ((Keress(x, y) && !checkB.checked) || (lastClick.x != x && lastClick.y != y))
			return;
		putIn(await selectedType.factory.createObject(x, y, controls.map(p => p())));
	} else if (x != oX || y != oY) {
		
		let xx = selectionStart.x, yy = selectionStart.y, w = lastClick.x - selectionStart.x, h = lastClick.y - selectionStart.y;
		if (w >= 0) w++;
		else {xx++; w--;}

		if (h >= 0) h++;
		else {yy++; h--;}

		xx *= gridSize;
		yy *= gridSize;
		w *= gridSize;
		h *= gridSize;

		let ctx2 = canvas3.getContext('2d');
		ctx2.clearRect(0, 0, canvas3.width, canvas3.height);
		ctx2.fillStyle = 'rgba(255, 80, 0, 0.5)';
		ctx2.fillRect(xx, yy, w, h);
		ctx2.lineWidth = 3;
		ctx2.strokeStyle = 'rgb(255, 80, 0)';
		ctx2.strokeRect(xx, yy, w, h);
	}
}, false);

document.getElementById('addCustomB').addEventListener('click', () => {
	let fi = document.createElement('input');
	fi.type = 'file';
	fi.name = 'addCustomType';
	fi.addEventListener('change', async () => {
		let scr = document.createElement('script');
		scr.innerText = await fi.files[0].text();
		document.head.appendChild(scr);
	}, false);
	fi.click();
}, false);

document.getElementById('save').addEventListener('click', save, false);
window.addEventListener('resize', resize, false);
resize();
