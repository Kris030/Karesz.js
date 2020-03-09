
//#region load
const content = document.getElementById('content'), inpText = document.createElement('input');
inpText.type = 'text';
inpText.name = 'palyaName';
inpText.placeholder = 'palya.json';
inpText.style.border = '2px solid grey';
inpText.style.borderRadius = '10px';
inpText.style.padding = '3px';
inpText.style.width = '100px';
inpText.style.outline = 'none';

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
	btn.innerText = 'Válassz ki fájlt';
	btn.addEventListener('click', _ => inpText.click(), false);
	content.appendChild(btn);
};

document.querySelector('#sajatpalya').addEventListener('change', loadSajt, false);
document.querySelector('#beeppalya').addEventListener('change', loadBeep, false);

const map = {}, loadMap = _ => {
	let json;
	if (sajt) {
		let fr = new FileReader();
		fr.readAsText(file);
		fr.onload = (e) => json = JSON.parse(e.target.result);
		fr.onerror = _ => { throw new Error("Couldn't read file") };
	}
	Object.assign(map, json);
};

//#endregion load
//#region game

let canvas;
const startListener = _ => {
	try {
		//loadMap();
		document.body.innerHTML = '';
		document.body.removeAttribute('style');
		document.head.removeChild(document.getElementById('st'));
		document.body.style = '*{background:red;}';
		canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
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