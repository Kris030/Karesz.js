const editorObjectTypes = [], canvas = document.getElementById('canv'), panelSize = 400, drawGlobal = async () => {
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

		if (sel == entry) {
			selectedType = null;
			return;
		}
		entry.id = 'selected';
		selectedType = t;
		
		let cObj = t.factory.createControls();
		controls = Object.values(cObj).map(o => o[1]);
		controlsDiv.innerHTML = '';
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
	let saveMap = map;
	saveMap.objs = map.objs.map(unparseGameObject);
	delete saveMap.robotok;
	
	let n = document.getElementById('mapNameForm').value;
	if (!n)
		n = 'Unnamed';
	
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
		map.objs.splice(i1, 1);
		drawGlobal();
		return o;
	}
	return null;
}, widthInp = document.getElementById('pWidth'), heightInp = document.getElementById('pHeight'), containsPoint = (p, t, b) =>
	p.x >= t.x && p.x <= b.x && p.y >= t.y && p.y <= b.y;

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
addCustomType(Robot);

let btn = -1, dragging = false, lastClick = {x: -1, y: -1},
selectedType, controls, selectionStart, selectedObjs = [], ctrlPressed = false;
window.addEventListener('blur', () => dragging = false, false);
canvas.addEventListener('contextmenu', e => e.preventDefault(), false);

document.addEventListener('keydown', e => {
	if (e.key.toLowerCase() == 'control')
		ctrlPressed = true;
}, false);
document.addEventListener('keyup', e => {
	if (e.key.toLowerCase() == 'control')
		ctrlPressed = false;
}, false);

document.addEventListener('mouseup', e => {
	dragging = e.button != btn;
	if (selectedType)
		return;
	
	if (btn == 0) {
		let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize);
		
		if (ctrlPressed)
			selectedObjs = selectedObjs.concat(map.objs.filter(o => !selectedObjs.includes(o) && containsPoint({x: o.x, y: o.y}, selectionStart, {x, y})));
		else
			selectedObjs = map.objs.filter(o => containsPoint({x: o.x, y: o.y}, selectionStart, {x, y}));
		
		console.log(selectedObjs, ctrlPressed);
		lastClick = {x: -1, y: -1};
		selectionStart = {};
	}
}, false);
canvas.addEventListener('mousedown', async e => {
	dragging = true;
	btn = e.button;
	
	let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize);
	if (btn == 2) { // right
		KeressTömb(x, y).forEach(putOut);
		return;
	}
	if (selectedType) {
		if (btn == 0) { // left
			putIn(await selectedType.factory.createObject(x, y, controls.map(p => p())));
			lastClick.x = x;
			lastClick.y = y;
		}
	} else
		selectionStart = {x, y};
});
canvas.addEventListener('mousemove', async e => {
	if (!dragging)
		return;
	let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize);
	if (btn == 0) { // left
		
		if ((Keress(x, y) && !checkB.checked) || (lastClick.x != x && lastClick.y != y))
			return;
			putIn(await selectedType.factory.createObject(x, y, controls.map(p => p())));
		lastClick.x = x;
		lastClick.y = y;
	} else if (btn == 2) // right
		KeressTömb(x, y).forEach(putOut);
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
