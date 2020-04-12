
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

		case fel.valueOf(): return fel;
		case fel.toString(): return fel;

		case le.valueOf(): return le;
		case le.toString(): return le;

		case jobbra.valueOf(): return jobbra;
		case jobbra.toString(): return jobbra;

		case balra.valueOf(): return balra;
		case balra.toString(): return balra;

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