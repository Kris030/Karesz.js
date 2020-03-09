
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

const map = {
	width:  100,
	height: 50
}, loadMap = _ => {
	let json;
	if (sajt) {
		let fr = new FileReader();
		fr.readAsText(file);
		fr.onload = (e) => json = JSON.parse(e.target.result);
		fr.onerror = _ => { throw new Error("Couldn't read file") };
	}
	Object.assign(map, json);
};

let canvas;
const panelSize = 300, resize = _ => {
    /*let minWidth = Math.min(window.innerWidth - panelSize, window.innerHeight);
	if (map.width > map.height) {
		canvas.width = minWidth;
		canvas.height = map.height / map.width * minWidth;
	} else {
		canvas.height = minWidth;
		canvas.width = map.width / map.height * minWidth;
	}*/

}, startListener = _ => {
	try {
		//loadMap();
		document.body.innerHTML = '';
		document.head.removeChild(document.getElementById('st'));
		document.body.style.cssText = 'display:flex;flex-direction:row;padding:0;margin:0;background:linear-gradient(rgb(221,138,83),rgb(62,62,184))fixed;';
		canvas = document.createElement('canvas');
		canvas.style.display = 'block';
		document.body.appendChild(canvas);
		let div = document.createElement('div');
		div.style.minWidth = panelSize + 'px';
		document.body.appendChild(div);
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
//#endregion game
document.querySelector('#startButton').addEventListener('click', startListener, false);