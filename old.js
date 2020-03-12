
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

let errored, sajt;
const loadBeep = _ => {
	errored = false;
	sajt = false;
	content.innerHTML = '';
	content.appendChild(inpText);
}

loadBeep();

const loadSajt = _ => {
	errored = false;
	sajt = true;
	content.innerHTML = '';
	let btn = document.createElement('button');
	btn.innerText = 'Válassz fájlt';
	btn.addEventListener('click', _ => fileInp.click(), false);
	content.appendChild(btn);
};

document.querySelector('#sajatpalya').addEventListener('change', loadSajt, false);
document.querySelector('#beeppalya').addEventListener('change', loadBeep, false);

//#endregion load
//#region game

let map;
const loadMap = _ => {
	if (sajt) {
		let fr = new FileReader();
		fr.readAsText(fileInp.files[0]);
		fr.onload = (e) => {
			let json = JSON.parse(e.target.result);
			json.objs = json.objs.map((o) => new window[o.type](...o.args));
			map = json;
			resize();
		};
		fr.onerror = _ => { throw new Error("Couldn't read file") };
	}
};

let canvas, panel, ctx;
const panelSize = 300, drawGlobal = _ => {
	//canvas = document.createElement('canvas');
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
}, resize = _ => {

	let w = window.innerWidth - panelSize, h = map.height / map.width * w;
	
	if (h > document.body.clientHeight) {
		h = window.innerHeight;
		w = map.width / map.height * h;
		panel.style.width = window.innerWidth - w - 1 + 'px';
	} else
		panel.style.width = panelSize - 1 + 'px';
	panel.style.left = w + 'px';
	panel.style.top = '0px'; panel.style.height = h + 'px';

	canvas.style.top = '0px'; canvas.style.left = '0px';
	canvas.width = w; canvas.height = h;

	drawGlobal();
}, startListener = _ => {
	try {
		loadMap();
		document.body.innerHTML = '';
		document.head.removeChild(document.getElementById('st'));
		document.body.style.cssText =
'display:block;padding:0;margin:0;background:linear-gradient(rgb(221,138,83),rgb(62,62,184))fixed;width:100vw;height:100vh;';

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

const irány = function(value) {
	switch (value) {
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

}

this.Wall = class extends GameObject {

	constructor(x, y, fill) {
		super(x, y);
		this.fill = fill;
	}

	draw(g, gridSize) {
		g.fillStyle = this.fill ? this.fill : 'darkred';
		g.fillRect(this.x * gridSize + g.lineWidth, this.y * gridSize + g.lineWidth, gridSize - g.lineWidth * 2, gridSize - g.lineWidth * 2);
	}

}

this.Kavics = class extends GameObject {
	
	constructor(x, y, fill) {
		super(x, y);
		this.fill = fill;
	}

	draw(g, gridSize) {
		g.fillStyle = this.fill ? this.fill : 'black';
		g.beginPath();
		g.arc(this.x * gridSize + gridSize / 2, this.y * gridSize + gridSize / 2, gridSize / 2 - 1, 0, 2 * Math.PI);
		g.fill();
	}

}

this.Movable = class extends GameObject {

	constructor(x, y, facing) {
		super(x, y);
		this.facing = facing ? facing : fel;
	}

	move() {
		switch (this.facing) {
			case fel: this.y--; break;
			case le: this.y++; break;
			case jobbra: this.x++; break;
			case balra: this.x--; break;
			default: break;
		}
		drawGlobal();
	}

	move(speed) {
		switch (this.facing) {
			case fel: this.y -= speed; break;
			case le: this.y += speed; break;
			case jobbra: this.x += speed; break;
			case balra: this.x -= speed; break;
			default: break;
		}
		drawGlobal();
	}

	turnLeft() {
		switch (this.facing) {
			case fel: this.facing = jobbra; break;
			case le: this.facing = balra; break;
			case jobbra: this.facing = le; break;
			case balra: this.facing = fel; break;
			default: break;
		}
		drawGlobal();
	}

	turnRight() {
		switch (this.facing) {
			case fel: this.facing = balra; break;
			case le: this.facing = jobbra; break;
			case jobbra: this.facing = fel; break;
			case balra: this.facing = le; break;
			default: break;
		}
		drawGlobal();
	}
}

this.Robot = class extends Movable {
	
	constructor(x, y, res, facing) {
		super(x, y, facing);
		this.res = res ? res.map(s => {
			let img = new Image();
			img.src = s;
			return img;
		}) : [];
	}

	draw(g, gridSize) {
		g.drawImage(this.res[this.facing.resIndex], this.x * gridSize, this.y * gridSize, gridSize, gridSize);
	}

	Lépj() {
		this.move();
	}

	Fordulj_jobbra() {
		this.turnRight();
	}

	Fordulj_balra() {
		this.turnLeft();
	}

	Tegyél_le_egy_kavicsot(kavics) {

	}

}

//#endregion classes / classic
