
//#region load
const content = document.getElementById('content'), inpText = document.createElement('input'), fileInp = document.createElement('input');
inpText.style.cssText = 'border:2px solid grey;border-radius:10px;padding:3px;width:100px;outline:none;';
inpText.type = 'text';
inpText.name = 'palyaName';
inpText.placeholder = 'palya.json';

fileInp.type = 'file';
fileInp.name = 'palyaFile';

let errored, mode, wIn, hIn, scMode = 0;
const loadBeep = () => {
	errored = false;
	mode = 0;
	content.innerHTML = '';
	content.appendChild(inpText);
}, scContent = document.getElementById('scContent');

loadBeep();

document.getElementById('sajatpalya').addEventListener('change', () => {
	errored = false;
	mode = 1;
	content.innerHTML = '';
	let btn = document.createElement('button');
	btn.innerText = 'Válassz fájlt';
	btn.addEventListener('click', () => fileInp.click(), false);
	content.appendChild(btn);
}, false);
document.getElementById('beeppalya').addEventListener('change', loadBeep, false);
document.getElementById('ures').addEventListener('change', () => {

	errored = false;
	mode = 2;
	content.innerHTML = '';

	let pW = document.createElement('p');
	pW.innerText = 'Szélesség';
	pW.style.marginRight = '2px';
	content.appendChild(pW);

	wIn = document.createElement('input');
	wIn.type = 'text';
	wIn.name = 'widthIn';
	wIn.placeholder = '0';
	content.appendChild(wIn);

	let pH = document.createElement('p');
	pH.innerText = 'Magasság';
	pH.style.marginLeft = '5px';
	pH.style.marginRight = '2px';
	content.appendChild(pH);

	hIn = document.createElement('input');
	hIn.type = 'text';
	hIn.name = 'heighthIn';
	hIn.placeholder = '0';
	let inCss = 'border:2px solid grey;border-radius:10px;padding:3px;width:40px;outline:none';
	hIn.style.cssText = inCss;
	wIn.style.cssText = inCss;
	content.appendChild(hIn);

	setInputFilter(wIn, methFilter);
	setInputFilter(hIn, methFilter);
}, false), scIn1 = document.createElement('input'), scIn2 = document.createElement('input');
scIn1.type = scIn2.type = 'file';
scIn1.name = 'eachScript';
scIn1.multiple= 'multiple';
scIn2.name = 'oneScript';

let scButton;
document.getElementById('sc1').addEventListener('change', () => { scContent.innerHTML = ''; scMode = 0; scButton = null; }, false);
document.getElementById('sc2').addEventListener('change', () => {
	scMode = 1;
	if (!scButton) {
		scButton = document.createElement('button');
		scButton.innerText = 'Válassz Fájlokat';
		scContent.appendChild(scButton);
	}
	scButton.onclick = () => scIn1.click();
}, false);
document.getElementById('sc3').addEventListener('change', () => {
	scMode = 2;
	if (!scButton) {
		scButton = document.createElement('button');
		scButton.innerText = 'Válassz Fájlt';
		scContent.appendChild(scButton);
	}
	scButton.onclick = () => scIn2.click();
}, false);

//#endregion load
//#region game

let map;
const createScript = async f => {
	let funcText = await new Response(f).text(), trimmed = funcText.trim(), s = '/*robot:', roboNameI = trimmed.indexOf(s),
        roboName = roboNameI == 0 ? trimmed.substring(roboNameI + s.length, trimmed.indexOf('*/')).trim() : f.name.substring(0, f.name.lastIndexOf('.')); // TODO add more functions
	scriptFunctions.push([eval(`(async function(r,Befejez,handleRoundEnd,Várd_meg_a_kör_végét,Lépj,Fordulj_jobbra,Fordulj_balra,Tegyél_le_egy_kavicsot,Fordulj,
		Vegyél_fel_egy_kavicsot,Mi_van_előttem,Mi_van_alattam,toString,move,turn,turnLeft,turnRight,Mondj){${funcText}})`), map.robotok.filter(o=>o.name==roboName)[0]]);
}, scriptFunctions = [], parseGameObject = async o => o.type == 'Robot' ? await createRobot(...o.args) : new window[o.type](...o.args),
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
	switch (scMode) {
		case 1:
			Array.from(scIn1.files).forEach(createScript);
			break;
		case 2:
			scriptFunctions.push(eval(`async function() {${await new Response(f).text()}}`));
			break;
		default:
			break;
	}
};

let canvas, panel, ctx, kiválaszott, viwer, pctx, prt;
const noEl = '<no element there>', panelSize = 300, drawGlobal = async () => {
	let gridSize = canvas.clientWidth / map.width;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'black';
	ctx.fillStyle = 'white';
	ctx.imageSmoothingEnabled = false;
	ctx.direction = 'ltr';
	ctx.filter = 'none';
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
	if (kiválaszott) {
		ctx.strokeStyle = 'orange';
		ctx.lineWidth = gridSize * .04;
		ctx.strokeRect(kiválaszott.x * gridSize, kiválaszott.y * gridSize, gridSize, gridSize);
	}
	map.objs.forEach(o => drawBubble(ctx, o, gridSize));
	setSelJSON();
}, drawBubble = (ctx, o, gridSize) => {
	let bubble = o.textBubble;
	if (!bubble || !bubble.text)
		return;
	
	ctx.font = bubble.font || '50px sans-serif';
	let lines = bubble.text.split('\n'), wrap = bubble.wrap || true, tmWidth = 0, padding;

	if (bubble.padding) {
		while (bubble.padding.length < 4)
			bubble.padding.push(0);
		padding = bubble.padding;
	} else
		padding = [5, 5, 5, 10];

	if (wrap && bubble.width !== undefined) {
		if (bubble.width == 0)
			lines = bubble.text.split('');
		else {
			for (let i = 0; i < lines.length; i++) {
				const s = lines[i];
				if (s.trim().length == 0 || s.length == 1)
					continue;
				let lW = ctx.measureText(s).width;
				if (lW > bubble.width) {
					let splitIndex = s.length + 1;
					while (splitIndex >= 0 && ctx.measureText(s.substring(0, splitIndex)).width + padding[3] > bubble.width)
						splitIndex--;
					if (splitIndex < 0)
						splitIndex = 0;
					lines[i] = s.substring(0, splitIndex + 1);
					lines.splice(i + 1, 0, s.substring(splitIndex + 1, s.length - 1));
				}
			}
		}
	}

	for (let i = 0, ls = lines.length; i < ls; i++) {
		let m = ctx.measureText(lines[i]).width;
		if (m > tmWidth)
			tmWidth = m;
	}
	let lineSpacing = bubble.lineSpacing || 5, w = (bubble.width || tmWidth) + padding[1] + padding[3],
		x = o.x * gridSize + gridSize * .1, objY = (o.y + 1) * gridSize, y = objY + 5,
		tH = ctx.measureText(bubble.text).actualBoundingBoxAscent,
		h = lines.length * (tH + lineSpacing) + padding[0] + padding[2],
		radius = bubble.radius || 10;

	ctx.strokeStyle = bubble.outline || 'black';
	ctx.fillStyle = bubble.backgroundStyle || 'white';
	ctx.lineWidth = gridSize * .02;
	ctx.globalAlpha = bubble.alpha || .75;

	let r = x + w, b = y + h;

	if (objY + h > canvas.height)
		ctx.translate(0, -gridSize - h);
	
	ctx.beginPath();
	ctx.moveTo(x+radius, y);
	ctx.lineTo(r-radius, y);
	ctx.quadraticCurveTo(r, y, r, y+radius);
	ctx.lineTo(r, y + h - radius);
	ctx.quadraticCurveTo(r, b, r - radius, b);
	ctx.lineTo(x + radius, b);
	ctx.quadraticCurveTo(x, b, x, b - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = bubble.textStyle || 'black';
	
	for (let i = 0, tS = tH + lineSpacing, px = x + padding[1], py = padding[0] + y; i < lines.length; i++)
		ctx.fillText(lines[i], px, py + (i + 1) * tS);

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
	panel.style.height = Math.min(h, window.innerHeight) + 'px';
	panel.style.left = w + 'px';
	panel.style.top = '0px';

	canvas.style.top = '0px'; canvas.style.left = '0px';
	canvas.width = w; canvas.height = h;

	drawGlobal();
}, setSelJSON = () => {
	pctx.setTransform(1, 0, 0, 1, 0, 0);
	pctx.fillStyle = 'gray';
	pctx.fillRect(0, 0, prt.width, prt.width);
	if (kiválaszott) {
		let str = JSON.stringify(kiválaszott, function(key, val) {
			if (this instanceof Robot) {
				if (key == 'facing')
					return val.valueOf();
				else if (key == 'res')
					return val.map(i => i.src);
			}
			return val;
		}, 2), arr = str.split('\n'), max = 0;
		arr.forEach(e => {
			if (e.length > max)
				max = e.length;
		});
		viwer.rows = arr.length;
		viwer.cols = Math.min(max, 38);
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
		document.documentElement.style.setProperty('--orange', 'rgb(255,165,0)');

		document.head.removeChild(document.getElementById('st'));
		document.body.innerHTML = `
		<style>
			body {
				display:block;
				padding:0;margin:0;
				background:var(--backg);
				width:100vw; height:100vh;
				overflow:hidden;
				color:var(--orange);
			}
			h1 {margin-block-end:0;}
			h3 {margin-block-end:0;}
			p {margin-block-end:5px;}
			::selection{color:red;background:white;}
			</style>
		<div id="panel" style="display:flex;justify-content:space-between;flex-direction:column;position:absolute;min-width:${panelSize}px;">
			<div style="padding:0 0 0 10px;display:flex;flex-direction:column;">
				<h1 id="map-name"></h1>
				<h1 style="font-size:1.3em;padding-left:5px;margin-block-start:0;" id="round-display">Round: 0</h1>
				<div style="font-size:1.5em;margin-left:8px" id="selected">
					<h3>Selected Object</h3>
					<p id="sel-type">Type: -</p>
					<canvas id="portrait" width="50px" height="50px" style="border:2px solid sandybrown;border-radius:4px;"></canvas>
					<p>View JSON</p>
					<textarea id="JSON-viewer" style="color:var(--orange);max-height:400px;caret-color:white;background:grey;border:2px solid sandybrown;border-radius:5px;outline:none;"><no element here></textarea>
				</div>
			</div>
			<img src="start.png" id="st-button" style="padding:0;outline:none;background:none;width:fit-content;height:fit-content;margin:0 0 10px 10px;user-select:none;">
		</div>`;
		document.getElementById('map-name').innerText = map.name || 'Unnamed Map';

		// Preload pause icon
		new Image().src = 'pause.png';

		panel = document.getElementById('panel');
		canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:absolute;display:block;background:white;border-right:solid 2px black;';
		ctx = canvas.getContext('2d');

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
			kiválaszott = KeressTömb(e.clientX / gridSize, e.clientY / gridSize)[0];
			if (!kiválaszott) {
				viwer.value = noEl;
				viwer.rows = 1;
				viwer.cols = noEl.length;
				setSelJSON();
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

		let st = document.getElementById('st-button'), notStarted = true;
		st.addEventListener('click', () => {
			if (notStarted) {
				notStarted = false;
				rDisp = document.getElementById('round-display');
				if (scMode == 2)
					scriptFunctions[0]();
				else
					scriptFunctions.forEach(([f, r]) => f(r, ...r.getMethods()));
				interval = setInterval(intervalFunc, roundLength);
			}
			paused = !paused;
			st.src = paused ? 'start.png' : 'pause.png';
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
	requestAnimationFrame(resize, 0);
};
document.querySelector('#startButton').addEventListener('click', startListener, false);

let round = 0, paused = true, roundLength = 500, interval, rDisp;
const intervalFunc = () => {
	if (paused)
		return;
	let allFinished = true, allCompleted = true;
	map.robotok.forEach(r => {
		if (r.round < round)
			allFinished = false;
		if (!r.finished)
			allCompleted = false;
	});
	if (allCompleted) {
		rDisp.innerText = `All done`;
		return;
	}
	if (allFinished)
		rDisp.innerText = `Round ${round}`;
	else
		return;
	
	let allStepped = true;
	map.robotok.forEach(r => {
		if (r.resolves.length)
			r.resolves.shift()();
		else
			allStepped = false;
		if (r.queue.length)
			r.action(r.queue.shift());
	});
	if (allStepped)
		round++;
};
//#endregion game