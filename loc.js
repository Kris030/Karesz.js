
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

	// TODO cleanup
	function setInputFilter(textbox, inputFilter) {
		["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
			textbox.addEventListener(event, function() {
			if (inputFilter(this.value)) {
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			} else
				this.value = "";
			});
		});
	}
	let meth = v => {
		if (v.includes('.'))
			return false;
		let n = new Number(v);
		return n % 1 == 0 && n > 0;
	};
	setInputFilter(wIn, meth);
	setInputFilter(hIn, meth);
};

document.getElementById('sajatpalya').addEventListener('change', loadSajt, false);
document.getElementById('beeppalya').addEventListener('change', loadBeep, false);
document.getElementById('ures').addEventListener('change', loadEmpty, false);

//#endregion load
//#region game

let map;
const parseGameObject = o => new window[o.type](...o.args), unparseGameObject = o => ({type: o.getClass(), args: o.asArgs()}),
loadMap = async () => {
	switch (mode) {
		case 0:
		case 1:
			let json = mode == 0 ? await (await fetch('map--' + inpText.value)).json() : JSON.parse(await new Response(fileInp.files[0]).text());
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
//#endregion game

//#region classes
const fel = {
	ellenkező: undefined, valueOf() {
		return 1;
	}, toString() {
		return 'fel';
	}, resIndex: 0
}, le = {
	ellenkező: fel, valueOf() {
		return -1;
	}, toString() {
		return 'le';
	}, resIndex: 1
};
fel.ellenkező = le;
const jobbra = {
	ellenkező: undefined, valueOf() {
		return 2;
	}, toString() {
		return 'jobbra';
	}, resIndex: 2
}, balra = {
	ellenkező: jobbra, valueOf() {
		return -2;
	}, toString() {
		return 'balra';
	}, resIndex: 3
};
jobbra.ellenkező = balra;

const irány = value => {
	switch (value) {
		case le:
		case fel:
		case jobbra:
		case balra:
			return value;

		case fel.valueOf(): return fel;
		case le.valueOf(): return le;
		case jobbra.valueOf(): return jobbra;
		case balra.valueOf(): return balra;
		default: return null;
	}
};

this.GameObject = class {

	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	draw(g, gridSize) {}

	asArgs() {
		return [this.x, this.y];
	}

	toString() {
		return `GameObject[x: ${this.x}, y: ${this.y}]`;
	}

	getClass() {
		return 'GameObject';
	}

}

this.Wall = class extends GameObject {

	constructor(x, y, fill) {
		super(x, y);
		this.fill = fill || 'darkred';
	}

	draw(g, gridSize) {
		g.fillStyle = this.fill;
		g.fillRect(this.x * gridSize + g.lineWidth, this.y * gridSize + g.lineWidth, gridSize - g.lineWidth * 2, gridSize - g.lineWidth * 2);
	}

	asArgs() {
		return [this.x, this.y, this.fill];
	}

	toString() {
		return `Wall[x: ${this.x}, y: ${this.y}, fill: ${this.fill}]`;
	}

	getClass() {
		return 'Wall';
	}

}

this.Kavics = class extends GameObject {

	constructor(x, y, fill) {
		super(x, y);
		this.fill = fill || 'black';
	}

	draw(g, gridSize) {
		g.fillStyle = this.fill;
		g.beginPath();
		g.arc(this.x * gridSize + gridSize / 2, this.y * gridSize + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
		g.fill();
	}

	asArgs() {
		return [this.x, this.y, this.fill];
	}

	toString() {
		return `Kavics[x: ${this.x}, y: ${this.y}, fill: ${this.fill}]`;
	}

	getClass() {
		return 'Kavics';
	}

}

this.Movable = class extends GameObject {

	constructor(x, y, facing) {
		super(x, y);
		this.facing = facing ? irány(facing) : fel;
	}

	move(speed) {
		speed = speed || 1; 
		switch (this.facing) {
			case fel: this.y -= speed; break;
			case le: this.y += speed; break;
			case jobbra: this.x += speed; break;
			case balra: this.x -= speed; break;
			default: break;
		}
		drawGlobal();
	}

	turn(ir) {
		if (irány == ir || irány == ir.valueOf())
			this.turnLeft();
		else if (irány == ir || irány == ir.valueOf())
			this.turnRight();
	}

	turnLeft() {
		switch (this.facing) {

			case fel.valueOf():
			case fel: this.facing = balra; break;
			
			case le.valueOf():
			case le: this.facing = jobbra; break;

			case jobbra.valueOf():
			case jobbra: this.facing = fel; break;

			case balra.valueOf():
			case balra: this.facing = le; break;

			default: break;
		}
		drawGlobal();
	}

	turnRight() {
		switch (this.facing) {

			case fel.valueOf():
			case fel: this.facing = jobbra; break;

			case le.valueOf():
			case le: this.facing = balra; break;
			
			case jobbra.valueOf():
			case jobbra: this.facing = le; break;
			
			case balra.valueOf():
			case balra: this.facing = fel; break;

			default: break;
		}
		drawGlobal();
	}
	
	asArgs() {
		return [this.x, this.y, this.facing.valueOf()];
	}

	toString() {
		return `Movable[x: ${this.x}, y: ${this.y}, facing: ${this.facing.toString()}]`;
	}

	getClass() {
		return 'Movable';
	}

}

const createRobot = async (name, x, y, res, facing, round) =>
	new Robot(name, x, y, await Promise.all(res.map(path => new Promise((res, err) => {
		const img = new Image();
		img.addEventListener('load', () => res(img), false);
		img.addEventListener('error', e => err(e), false);
		img.src = path;
	}))), facing, round);

this.Robot = class extends Movable {

	constructor(name, x, y, res, facing, round) {
		super(x, y, facing);
		this.res = res;
		this.name = name;
		this.round = round || 0;
	}

	Befejez() {
		this.finished = true;
	}

	async handleRoundEnd() {
		await awaitRoundEnd(this);
	}

	//#region Time consuming

	async Várd_meg_a_kör_végét() {
		await this.handleRoundEnd();
	}

	async Lépj() {
		await this.handleRoundEnd();
		this.move();
	}

	async Fordulj(irány) {
		await this.handleRoundEnd();
		this.turn(irány);
	}

	async Fordulj_jobbra() {
		await this.handleRoundEnd();
		this.turnRight();
	}

	async Fordulj_balra() {
		await this.handleRoundEnd();
		this.turnLeft();
	}

	async Tegyél_le_egy_kavicsot(szín) {
		await this.handleRoundEnd();
		Adj_hozzá(new Kavics(this.x, this.y, szín));
	}
	
	async Vegyél_fel_egy_kavicsot() {
		await this.handleRoundEnd();
		// TODO kavics storage
		let arr = KeressTömb(this.x, this.y);
		for (let i = 0; i < arr.length; i++)
			if (arr[i] instanceof Kavics) {
				map.objs.splice(i, 1);
				break;
			}
	}
	//#endregion Time consuming

	//#region Non time consuming

	Merre_néz() {
		return this.facing;
	}

	Mi_van_előttem() {
		let előttemX;
		switch (this.facing) {
	
			case jobbra.valueOf():
			case jobbra: előttemX = this.x + 1; break;
	
			case balra.valueOf():
			case balra: előttemX = this.x - 1; break;
	
			default: előttemX = this.x; break;
		}
		let előttemY;
		switch (this.facing) {

			case fel.valueOf():
			case fel: előttemY = this.y - 1; break;
	
			case fel.valueOf():
			case fel: előttemY = this.y + 1; break;
	
			default: előttemY = this.y; break;
		}
		return Keress(előttemX, előttemY);
	}

	Mi_van_alattam() {
		let arr = KeressTömb(this.x, this.y);
		return arrOr0(arr.splice(arr.indexOf(this), 1));
	}
	//#endregion Non time consuming

	//#region non player

	draw(g, gridSize) {
		if (this.res) g.drawImage(this.res[this.facing.resIndex], this.x * gridSize, this.y * gridSize, gridSize, gridSize);
	}

	asArgs() {
		return [this.name, this.x, this.y, `["${this.res[0].src}","${this.res[1].src}","${this.res[2].src}","${this.res[3].src}"]`, this.facing.valueOf()];
	}

	toString() {
		return `Robot[name: ${this.name}, x: ${this.x}, y: ${this.y}]`;
	}

	getClass() {
		return 'Robot';
	}
	//#endregion non player

}
//#endregion classes

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

};
//#region global
const sleep = async ms => {
	if (ms < 0)
		return;
	await new Promise(res => setTimeout(res, ms));
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
}, arrOr0 = arr => {
	switch (arr.length) {
		case 0: return null;
		case 1: return arr[0];
		default: return arr;
	}
}, Adj_hozzá = o => {
	if (map.objs.indexOf(o) != -1)
		return;
	map.objs.push(o);
	if (o instanceof Robot)
		map.robotok.push(o);
	drawGlobal();
	return o;
}, Vedd_ki = o => {
	let i1 = map.objs.indexOf(o);
	if (i1 != -1) {
		map.objs.splice(i1, 1);
		if (o instanceof Robot) {
			let i2 = map.robotok.indexOf(o);
			if (i2 != -1)
				map.robotok.splice(i2, 1);
		}
		drawGlobal();
		return o;
	}
	return null;
}, KeressTömb = (x, y) => map.objs.filter(o => o.x == Math.floor(x) && o.y == Math.floor(y)), Keress = (x, y) => arrOr0(KeressTömb(x, y));
//#endregion global
