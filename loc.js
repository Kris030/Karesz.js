
//#region load
const content = document.getElementById('content'), inpText = document.createElement('input'), fileInp = document.createElement('input');
inpText.type = 'text';
inpText.name = 'palyaName';
inpText.placeholder = 'palya.json';
inpText.style.border = '2px solid grey';
inpText.style.borderRadius = '10px';
inpText.style.padding = '3px';
inpText.style.width = '100px';
inpText.style.outline = 'none';

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
	pH.innerText = 'Hosszúság';
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
			} else {
				this.value = "";
			}
			});
		});
	}
	let meth = value => {
		if (value.includes('.'))
			return false;
		let n = new Number(value);
		return n % 1 == 0 && n > 0;
	};
	setInputFilter(wIn, meth);
	setInputFilter(hIn, meth);
};

document.querySelector('#sajatpalya').addEventListener('change', loadSajt, false);
document.querySelector('#beeppalya').addEventListener('change', loadBeep, false);
document.querySelector('#ures').addEventListener('change', loadEmpty, false);

//#endregion load
//#region game

let map;
const parseGameObject = (o) => new window[o.type](...o.args), unparseGameObject = (o) => {
	return {type: o.getClass(), args: o.asArgs()};
}, loadMap = async () => {
	switch (mode) {
		case 0:
		case 1:
			let json = mode == 0 ? await (await fetch('map--' + inpText.value)).json() : JSON.parse(await new Response(fileInp.files[0]).text());
			json.objs = json.objs.map(parseGameObject);
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

let canvas, panel, ctx;
const panelSize = 300, drawGlobal = () => {
	ctx = canvas.getContext('2d');
	let gridSize = canvas.clientWidth / map.width;
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
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

	let w = window.innerWidth - panelSize, h = map.height / map.width * w;
	
	if (h > window.innerHeight) {
		h = window.innerHeight;
		w = map.width / map.height * h;
		panel.style.width = window.innerWidth - w + 'px';
		panel.style.borderBottom = '';
		canvas.style.borderBottom = '';
	} else
		panel.style.width = panelSize + 'px';
	panel.style.left = w + 'px';
	panel.style.top = '0px'; panel.style.height = h + 'px';

	canvas.style.top = '0px'; canvas.style.left = '0px';
	canvas.width = w; canvas.height = h;

	drawGlobal();
}, startListener = async () => {
	try {
		await loadMap();
		document.body.innerHTML = '';
		document.head.removeChild(document.getElementById('st'));
		document.body.style.cssText =
'display:block;padding:0;margin:0;background:rgb(79,79,79);width:100vw;height:100vh;';

		canvas = document.createElement('canvas');
		canvas.style.cssText =
'position:absolute;display:block;background:white;border-right:solid 2px black;';

		panel = document.createElement('div');
		panel.style.cssText =
'position:absolute;min-width:' + panelSize + 'px;background:rgb(79,79,79);';

		document.body.appendChild(panel);
		document.body.appendChild(canvas);

		let button = document.createElement('button');
		button.innerText = 'click moi';
		panel.appendChild(button);

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
	resize();
};
document.querySelector('#startButton').addEventListener('click', startListener, false);
//#endregion game

//#region classes / classic
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

const irány = (value) => {
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
		this.fill = fill ? fill : 'darkred';
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
		this.fill = fill ? fill : 'black';
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

	turn(irány) {
		if (irány == balra || irány == balra.valueOf())
			this.turnLeft();
		else if (irány == jobbra || irány == jobbra.valueOf())
			this.turnRight();
	}

	turnLeft() {
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

	turnRight() {
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

this.Robot = class extends Movable {

	constructor(name, x, y, res, facing) {
		super(x, y, facing);
		this.name = name;
		/*this.res = res ? res.map(s => {
			let img = new Image();
			img.src = s;
			return img;
		}) : null;*/
		if (res) { // TODO await load
			Promise.all(res.map(path => new Promise((res, err) => {
				const img = new Image();
				img.addEventListener('load', () => res(img), false);
				img.addEventListener('error', e => err(e), false);
				img.src = path;
			}))).then(imgs => this.res = imgs);
		} else
			this.res = [];
	}

	draw(g, gridSize) {
		if (this.res) g.drawImage(this.res[this.facing.resIndex], this.x * gridSize, this.y * gridSize, gridSize, gridSize);
	}

	Lépj() { 
		this.move();
	}

	Fordulj(irány) {
		this.turn(irány);
	}

	Fordulj_jobbra() {
		this.turnRight();
	}

	Fordulj_balra() {
		this.turnLeft();
	}

	Tegyél_le_egy_kavicsot(szín) {
		Adj_hozzá(new Kavics(this.x, this.y, szín));
	}
	
	Vegyél_fel_egy_kavicsot() {
		// TODO kavics storage
		let arr = KeressTömb(this.x, this.y);
		for (let i = 0; i < arr.length; i++)
			if (arr[i] instanceof Kavics) {
				map.objs.splice(i, 1);
				break;
			}
	}
	
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

	asArgs() {
		return [this.name, this.x, this.y, `["${this.res[0].src}","${this.res[1].src}","${this.res[2].src}","${this.res[3].src}"]`, this.facing.valueOf()];
	}

	toString() {
		return `Robot[name: ${this.name}, x: ${this.x}, y: ${this.y}]`;
	}

	getClass() {
		return 'Robot';
	}

}

const arrOr0 = (arr) => {
	switch (arr.length) {
		case 0: return null;
		case 1: return arr[0];
		default: return arr;
	}
}, Adj_hozzá = o => {
	map.objs.push(o);
	if (o instanceof Robot)
		map.robotok.push(o);
	drawGlobal();
}, Vedd_ki = o => {
	let i1 = map.objs.indexOf(o);
	if (i1 != -1)
		map.objs.splice(i1, 1);
	
	if (o instanceof Robot) {
		let i2 = map.robotok.indexOf(o);
		if (i2 != -1)
			map.robotok.splice(i2, 1);
	}
	drawGlobal();
}, KeressTömb = (x, y) => map.objs.filter(o => o.x == x && o.y == y),
Keress = (x, y) => arrOr0(KeressTömb(x, y));

//#endregion classes / classic
