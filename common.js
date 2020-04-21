
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
		case le: case fel: case jobbra: case balra:
			return value;

		case fel.valueOf():
		case fel.toString(): return fel;

		case le.valueOf():
		case le.toString(): return le;

		case jobbra.valueOf():
		case jobbra.toString(): return jobbra;

		case balra.valueOf():
		case balra.toString(): return balra;

		default: return null;
	}
};

this.GameObject = class {

	constructor(x, y) {
		this.listeners = [];
		this.x = x;
		this.y = y;
	}

	addEventListener(type, fire) {
		this.listeners.push({ type, fire });
	}

	fireListeners(type) {
		listeners.forEach(l=>{if (l.type == type) l.fire();});
	}

	Mondj(bubble, timeout, callback) {
		this.textBubble = bubble;
		setTimeout(() => {
			delete this.textBubble;
			if (callback)
				callback();
			drawGlobal();
		}, timeout);
		drawGlobal();
	}

	draw(g, s) {}

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

	getEditor() {
		let Color = document.createElement('input');
		Color.type = 'color';
		Color.value = this.fill;
		Color.addEventListener('input', () => { this.fill = Color.value; drawGlobal(); }, false);
		return {Color};
	}
	
}
Wall.factory = {
	createControls() {
		let picker = document.createElement('input');
		picker.type = 'color';
		picker.value = '#8b0000';
		picker.style.width = '80px';
		return {
			'Color': [
				picker,
				function() {
					return picker.value;
				}
			]
		};
	}, async createObject(x, y, vals) {
		return new Wall(x, y, vals[0]);
	}, drawIcon(g, w, h) {
		g.fillStyle = 'darkred';
		g.fillRect(0, 0, w, h);
	}, toString() {
		return 'Wall';
	}
};

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

	getEditor() {
		let Color = document.createElement('input');
		Color.type = 'color';
		Color.value = this.fill;
		Color.addEventListener('input', () => { this.fill = Color.value; drawGlobal(); }, false);
		return {Color};
	}

}
Kavics.factory = {
	createControls() {
		let picker = document.createElement('input');
		picker.type = 'color';
		picker.value = '#ffff00';
		picker.style.width = '80px';
		return {
			'Color': [
				picker, function() {
					return picker.value;
				}
			]
		};
	}, async createObject(x, y, vals) {
		return new Kavics(x, y, vals[0]);
	}, drawIcon(g, s) {
		g.fillStyle = 'yellow';
		g.beginPath();
		g.arc(25, 25, s / 2, 0, 2 * Math.PI);
		g.fill();
	}, toString() {
		return 'Kavics';
	}
};

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
		this.queue = [];
		this.resolves = [];
	}

	Befejez() {
		this.finished = true;
	}

	wait() {
		return new Promise(res => this.resolves.push(res));
	}
	
	async action(a) {
		switch (a.a) {
			case 0: return;
			case 1: this.move(); return;
			case 2: this.turn(a.irány); return;
			case 3: this.turnRight(); return;
			case 4: this.turnLeft(); return;
			case 5: Adj_hozzá(new Kavics(this.x, this.y, a.szín)); return;
			case 6:
				// TODO kavics storage
				let arr = KeressTömb(this.x, this.y);
				for (let i = 0; i < arr.length; i++)
					if (arr[i] instanceof Kavics) {
						map.objs.splice(i, 1);
						break;
					}
				return;
			
			default: await this.wait(); this.round++; return;
		}
	}
	
	//#region Time consuming

	async Várd_meg_a_kör_végét() {
		this.queue.push({a: 0});
		await this.wait();
		this.round++;
	}

	async Lépj() {
		this.queue.push({a: 1});
		await this.wait();
		this.round++;
	}

	async Fordulj(irány) {
		this.queue.push({a: 2, irány});
		await this.wait();
		this.round++;
	}

	async Fordulj_jobbra() {
		this.queue.push({a: 3});
		await this.wait();
		this.round++;
	}

	async Fordulj_balra() {
		this.queue.push({a: 4});
		await this.wait();
		this.round++;
	}

	async Tegyél_le_egy_kavicsot(szín) {
		this.queue.push({a: 5, szín});
		await this.wait();
		this.round++;
	}
	
	async Vegyél_fel_egy_kavicsot() {
		this.queue.push({a: 6});
		await this.wait();
		this.round++;
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

	Mi_van_előttem_tömb() {
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
		return KeressTömb(előttemX, előttemY);
	}

	Mi_van_alattam() {
		let arr = KeressTömb(this.x, this.y);
		return arrOr0(arr.splice(arr.indexOf(this), 1));
	}

	Mi_van_alattam_tömb() {
		let arr = KeressTömb(this.x, this.y);
		return arr.splice(arr.indexOf(this), 1);
	}
	//#endregion Non time consuming

	//#region non player

	draw(g, gridSize) {
		if (this.res) g.drawImage(this.res[this.facing.resIndex], this.x * gridSize, this.y * gridSize, gridSize, gridSize);
	}

	asArgs() {
		return [this.name, this.x, this.y, [this.res[0].src, this.res[1].src, this.res[2].src, this.res[3].src], this.facing.valueOf()];
	}

	toString() {
		return `Robot[name: ${this.name}, x: ${this.x}, y: ${this.y}]`;
	}

	getClass() {
		return 'Robot';
	}

	getEditor() {
		let Name = document.createElement('input'), Facing = document.createElement('select');
		Facing.innerHTML = '<option>fel</option><option>le</option><option>jobbra</option><option>balra</option>';
		let ir = [fel, le, jobbra, balra];
		Facing.selectedIndex = ir.indexOf(this.facing);
		Facing.addEventListener('input', () => { this.facing = irány(ir[Facing.selectedIndex]); drawGlobal(); }, false);
		Name.type = 'text';
		Name.value = this.name;
		Name.addEventListener('input', () => { this.name = Name.value; drawGlobal(); }, false);
		return {Name, Facing};
	}

	getMethods() {
		let r = this;
		return [
			()=>this.Befejez(),
			async ()=>await r.handleRoundEnd(),
			async ()=>await r.Várd_meg_a_kör_végét(),
			async ()=>await r.Lépj(),
			async ()=>await r.Fordulj_jobbra(),
			async ()=>await r.Fordulj_balra(),
			async s=>await r.Tegyél_le_egy_kavicsot(s),
			async i=>await r.Fordulj(i),
			async ()=>await r.Vegyél_fel_egy_kavicsot(),
			()=>r.Mi_van_előttem(),
			()=>r.Mi_van_előttem_tömb(),
			()=>r.Mi_van_alattam_tömb(),
			()=>r.Mi_van_alattam(),
			()=>r.toString(),
			()=>r.move(),
			()=>r.turn(),
			()=>r.turnLeft(),
			()=>r.turnRight(),
			b=>r.Mondj(b)
		];
	}

	//#endregion non player

}
Robot.factory = {
	createControls() {
		let name = document.createElement('input'), facing = document.createElement('select');
		facing.innerHTML = '<option>fel</option><option>le</option><option>jobbra</option><option>balra</option>';
		name.type = 'text';
		return {
			Name: [
				name, function() { return name.value; }
			], Facing: [
				facing, function () { return irány(facing.value); }
			]
		};
	}, async createObject(x, y, vals) {
		return await createRobot(vals[0], x, y, ['Karesz0.png','Karesz2.png','Karesz1.png','Karesz3.png'], vals[1], 0);
	}, drawIcon(g, w, h) {
		let img = new Image();
		img.src = 'Karesz_up.png';
		img.onload = () => g.drawImage(img, 0, 0, w, h);
	}, toString() {
		return 'Robot';
	}
};

//#endregion classes

//#region global
const sleep = ms => new Promise(res => setTimeout(res, Math.max(ms, 0))),
arrOr0 = arr => {
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
		kiválaszott = null;
		drawGlobal();
		return o;
	}
	return null;
}, KeressTömb = (x, y) => map.objs.filter(o => o.x == Math.floor(x) && o.y == Math.floor(y)), Keress = (x, y) => arrOr0(KeressTömb(x, y));
//#endregion global

//#region util
const download = (data, filename, type) => {
    let file = new Blob([data], {type});
    if (navigator.msSaveOrOpenBlob) // IE10+
        navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement('a'), url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 0); 
    }
}, setInputFilter = (textbox, inputFilter) => {
	textbox.addEventListener('input', function() {
		if (inputFilter(this.value)) {
			this.oldValue = this.value;
			this.oldSelectionStart = this.selectionStart;
			this.oldSelectionEnd = this.selectionEnd;
		} else if (this.oldValue) {
			this.value = this.oldValue;
			this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
		} else
			this.value = '';
	});
}, methFilter = v => {
	if (v.includes('.'))
		return false;
	let n = new Number(v);
	return n % 1 == 0 && n > 0;
};
//#endregion util
