
const http = require('http'), url = require('url'), fs = require('fs'), port = 9000,
types = {
    'ico': 'image/x-icon', 'html': 'text/html', 'js': 'text/javascript',
	'json': 'application/json', 'css': 'text/css', 'png': 'image/png',
	'jpg': 'image/jpeg', 'wav': 'audio/wav', 'mp3': 'audio/mpeg',
    'pdf': 'application/pdf'
}, requestListener = (req, res) => {
	switch (req.method) {
	case 'GET':
		let parsURL = url.parse(req.url, true).pathname.substring(1);
		
		if (parsURL.startsWith('map--')) {
			let p = `palyak/${parsURL.substring(5)}.json`;
			if (!fs.existsSync(p)) {
				res.writeHead(404, {"Content-Type": "text/html"});
				fs.createReadStream('404.html').pipe(res);
				return;
			}
			res.writeHead(200, {"Content-Type": "text/html"});
			fs.createReadStream(p).pipe(res);
			return;
		}
		switch (parsURL) {
		case '':
			parsURL = 'index.html';
			break;
		case 'loc':
		case 'editor':
		case 'lore':
			parsURL += '.html';
			break;
		default:
			break;
		}
		if (!fs.existsSync(parsURL)) {
			res.writeHead(404, {"Content-Type": "text/html"});
			fs.createReadStream('404.html').pipe(res);
			return;
		}
		res.writeHead(200, {'content-type': types[parsURL.substring(parsURL.lastIndexOf('.') + 1)], 'content-length' : fs.statSync(parsURL).size});
		fs.createReadStream(parsURL).pipe(res);
		break;
	default:
		break;
	}
}, server = http.createServer(requestListener);
server.listen(port);
console.log(`Server listening on port ${port}`);
