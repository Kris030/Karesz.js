const canvas = document.getElementById('canv'), panelSize = 300, drawGlobal = async () => {
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
};

// TODO convert to mousedown
let btn = -1, dragging = false;
canvas.addEventListener('contextmenu', e => {
	e.preventDefault();
	let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize);
	console.log('deleting on: ' + x + ' ' + y);
	map.objs = map.objs.filter(e => e.x != x && e.y != y);
	drawGlobal();
}, false);
canvas.addEventListener('click', e => {
	if (e.button != 0)
		return;
	let gridSize = canvas.width / map.width, x = Math.floor(e.clientX / gridSize), y = Math.floor(e.clientY / gridSize);
	console.log('placing on: ' + x + " " + y);
	map.objs.push({
		x: x, y: y
	});
	drawGlobal();
});

window.addEventListener('resize', resize, false);
resize();

document.querySelectorAll('.obj-entry').forEach(e => e.addEventListener('click', s => {
	let sel = document.getElementById('selected');
	if (sel)
		sel.id = '';
	if (s.target.tagName.toLowerCase() == 'li')
		s.target.id = 'selected';
	else
		s.target.parentNode.id = 'selected';
}, false));
