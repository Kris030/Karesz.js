
//#region load
const content = document.getElementById('content'), inpText = document.createElement('input'), fileInp = document.createElement('input');
inpText.style.cssText = 'border:2px solid grey;border-radius:10px;padding:3px;width:100px;outline:none;';
inpText.type = 'text';
inpText.name = 'palyaName';
inpText.placeholder = 'palya.json';

fileInp.type = 'file';
fileInp.name = 'palyaFile';

let errored, mode;
const loadBeep = () => {
	errored = false;
	mode = 0;
	content.innerHTML = '';
	content.appendChild(inpText);
}

loadBeep();

const loadSajt = () => {
	errored = false;
	mode = 1;
	content.innerHTML = '';
	let btn = document.createElement('button');
	btn.innerText = 'Válassz fájlt';
	btn.addEventListener('click', () => fileInp.click(), false);
	content.appendChild(btn);
};
let wIn, hIn;
const loadEmpty = () => {

	errored = false;
	mode = 2;
	content.innerHTML = '';

	let pW = document.createElement('p');
	pW.innerText = 'Szélesség';
	content.appendChild(pW);

	wIn = document.createElement('input');
	wIn.type = 'text';
	wIn.name = 'widthIn';
	wIn.placeholder = '0';
	wIn.style.border = '2px solid grey';
	wIn.style.borderRadius = '10px';
	wIn.style.padding = '3px';
	wIn.style.width = '60px';
	wIn.style.outline = 'none';
	content.appendChild(wIn);

	let pH = document.createElement('p');
	pH.innerText = 'Magasság';
	content.appendChild(pH);

	hIn = document.createElement('input');
	hIn.type = 'text';
	hIn.name = 'heighthIn';
	hIn.placeholder = '0';
	hIn.style.border = '2px solid grey';
	hIn.style.borderRadius = '10px';
	hIn.style.padding = '3px';
	hIn.style.width = '60px';
	hIn.style.outline = 'none';
	content.appendChild(hIn);

	setInputFilter(wIn, methFilter);
	setInputFilter(hIn, methFilter);
};

document.getElementById('sajatpalya').addEventListener('change', loadSajt, false);
document.getElementById('beeppalya').addEventListener('change', loadBeep, false);
document.getElementById('ures').addEventListener('change', loadEmpty, false);

//#endregion load
//#region game

let map;
const parseGameObject = o => new window[o.type](...o.args),
loadMap = async () => {
	switch (mode) {
		case 0:
		case 1:
			let json = mode == 0 ? await (await fetch('map--' + inpText.value)).json() : JSON.parse(await new Response(fileInp.files[0]).text());
			eval(json.initClasses);
			json.objs = await Promise.all(json.objs.map(parseGameObject));
			map = json;
			map.robotok = map.objs.filter(o => o instanceof Robot);
			map.loadResult = eval(map.onload);
			break;
		case 2:
			map = {
				width: new Number(wIn.value),
				height: new Number(hIn.value),
				objs: [],
				robotok: []
			};
			break;
		
		default:
			break;
	}
};

let canvas, panel, ctx, kiválaszott, viwer, pctx, prt;
const noEl = '<no element there>', panelSize = 300, drawGlobal = async () => {
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
	if (kiválaszott) {
		ctx.strokeStyle = 'orange';
		ctx.lineWidth = gridSize * .04;
		ctx.strokeRect(kiválaszott.x * gridSize, kiválaszott.y * gridSize, gridSize, gridSize);
	}
	setSelJSON();
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
}, setSelJSON = () => {
	pctx.setTransform(1, 0, 0, 1, 0, 0);
	pctx.fillStyle = 'gray';
	pctx.fillRect(0, 0, prt.width, prt.width);
	if (kiválaszott) {
		let str = JSON.stringify(kiválaszott, (key, val)=>key=='facing'?val.valueOf():val, 2), arr = str.split('\n'), max = 0;
		arr.forEach(e=>{if(e.length>max)max=e.length;});
		viwer.rows = arr.length;
		viwer.cols = Math.min(max, 37);
		viwer.value = str;
		let gs = -prt.width;
		pctx.translate(gs * kiválaszott.x, gs * kiválaszott.y);
		kiválaszott.draw(pctx, prt.width);
	} else {
		viwer.value = noEl;
		viwer.rows = 1;
		viwer.cols = noEl.length;
		return;
	}
}, startListener = async () => {
	try {
		await loadMap();
		
		document.documentElement.style.setProperty('--backg', 'rgb(79,79,79)');

		document.head.removeChild(document.getElementById('st'));
		document.body.innerHTML = `
		<style>
			body {
				display:block;
				padding:0; margin:0;
				background:var(--backg);
				width:100vw; height:100vh;
				overflow:hidden;
			}
			::selection{color: red; background: white;}
			</style>
		<div id="panel" style="display:flex;justify-content:space-between;flex-direction:column;position:absolute;min-width:${panelSize}px;">
			<div style="padding:10px 0 10px 10px;display:flex;flex-direction:column;">
				<h1 style="color:darkgoldenrod;" id="map-name">Map Name</h1>
				<div style="color:burlywood;font-size:1.5em; margin-left: 8px" id="selected">
					<h3>Selected Object</h3>
					<p id="sel-type">Type: -</p>
					<canvas id="portrait" width="50px" height="50px" style="border:2px solid sandybrown;border-radius:4px;"></canvas>
					<p>View JSON</p>
					<textarea id="JSON-viewer" style="caret-color:white;background:grey;color:burlywood;border:2px solid sandybrown;border-radius:5px;outline:none;"><no element here></textarea>
				</div>
			</div>
			<img src="start.png" id="st-button" style="padding:0;outline:none;background:none;width:fit-content;height:fit-content;margin:0 0 10px 10px;user-select:none;">
		</div>`;

		// Preload pause icon
		new Image().src = 'pause.png';

		panel = document.getElementById('panel');
		canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:absolute;display:block;background:white;border-right:solid 2px black;';

		viwer = document.getElementById('JSON-viewer');
		prt = document.getElementById('portrait');
		pctx = prt.getContext('2d')
		
		let selType = document.getElementById('sel-type');
		
		pctx.fillStyle = 'gray';
		pctx.fillRect(0, 0, prt.width, prt.width);
		viwer.contentEditable = false;
		viwer.spellcheck = false;
		viwer.rows = 0;
		viwer.cols = noEl.length;
		canvas.addEventListener('click', e => {
			let gridSize = canvas.width / map.width, oldKiv = kiválaszott, oldfac = oldKiv ? oldKiv.facing : null;
			kiválaszott = Keress(e.clientX / gridSize, e.clientY / gridSize);
			if (!kiválaszott) {
				viwer.value = noEl;
				viwer.rows = 1;
				viwer.cols = noEl.length;
				selType.innerText = 'Type: -';
				if (kiválaszott !== oldKiv)
					drawGlobal();
				return;
			}
			selType.innerText = `Type: ${kiválaszott.getClass()}`;
			if (kiválaszott !== oldKiv || kiválaszott.facing !== oldfac)
				drawGlobal();
		}, false);
		document.body.appendChild(canvas);

		let st = document.getElementById('st-button')
		st.addEventListener('click', () => {
			st.src = roundHandler.paused ? 'start.png' : 'pause.png';
			roundHandler.paused = !roundHandler.paused;
			if (!roundHandler.paused)
				roundHandler.első = Date.now();
		}, false);

		window.addEventListener('resize', resize, false);
	} catch (ex) {
		console.error(ex);
		if (!errored) {
			let p = document.createElement('p');
			p.innerText = 'Unknown or invalid file';
			p.style.color = 'red';
			p.style.padding = '0 5px 5px 5px';
			content.appendChild(p);
			errored = true;
		}
	}
	setTimeout(resize, 0);
};
document.querySelector('#startButton').addEventListener('click', startListener, false);

const roundHandler = {
	
	kör: 0, első: 0, length: 500,
	i: 0, nr: null, waitSet: false, paused: true,

	next(arg) {
		if (arg) {
			this.waitSet = false;
			this.i++;
			if (this.i == map.robotok.length) {
				this.i = 0;
				this.kör++;
				let tempNr = this.nr;
				this.nr = null;
				return tempNr - Date.now();
			}
			return (this.nr === null ? (this.nr = (this.első + (this.kör + 1) * this.length)) : this.nr) - Date.now();
		} else {
			if (this.waitSet && this.nr > Date.now())
				return this.nr - Date.now();
			else {
				this.nr = Date.now() + this.length;
				this.waitSet = true;
				return this.length;
			}
		}
	}

}, awaitRoundEnd = async r => {
	let a = roundHandler.next(true);
	console.log(`[${r.name}] sleeping ${a} ms`);
	await sleep(a);
	r.round++;
	while (roundHandler.paused || map.robotok.some(o => o !== r && !o.finished && o.round < r.round)) { // TODO fix this shiet
		let b = roundHandler.next(false);
		console.log(`[${r.name}] waiting ${b} ms`);
		await sleep(b);
	}
}
//#endregion game