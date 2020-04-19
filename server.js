const http = require('http'), url = require('url'), fs = require('fs'), port = 9000,
types = {
    'ico': 'image/x-icon', 'html': 'text/html', 'js': 'text/javascript',
	'json': 'application/json', 'css': 'text/css', 'png': 'image/png',
	'jpg': 'image/jpeg', 'wav': 'audio/wav', 'mp3': 'audio/mpeg',
    'pdf': 'application/pdf'
}, requestListener = (req, res) => {
	switch (req.method) {
	case 'GET':
		cookieParser(req, res);
		if (!req.cookies['seen-tutorial']) {
			res.setHeader('Set-Cookie', genCookie('seen-tutorial', 'true',
				{sameSite: 'strict', httpOnly: true, expires: 'Tue, 19 Jan 2038 03:14:07 UTC'})); // fuck 32 bit users
			res.writeHead(200, {'Content-Type': 'text/html'});
			fs.createReadStream('tutorial.html').pipe(res);
			return;
		}
		let parsURL = url.parse(req.url, true).pathname.substring(1);
		
		if (parsURL.startsWith('map--')) {
			let p = `palyak/${parsURL.substring(5)}.json`;
			if (!fs.existsSync(p)) {
				res.writeHead(404, {'Content-Type': 'text/html'});
				fs.createReadStream('404.html').pipe(res);
				return;
			}
			res.writeHead(200, {'Content-Type': 'text/html'});
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
			res.writeHead(404, {'Content-Type': 'text/html'});
			fs.createReadStream('404.html').pipe(res);
			return;
		}
		res.writeHead(200, {'content-type': types[parsURL.substring(parsURL.lastIndexOf('.') + 1)], 'content-length' : fs.statSync(parsURL).size});
		fs.createReadStream(parsURL).pipe(res);
		break;
	default:
		break;
	}
}, server = http.createServer(requestListener), cookieParser = (req, res) => { // Credit: Szűcs Geri

    let reportInvalidSyntax = () => {
        res.writeHead(400, {'Content-Type': 'text/html'});
        res.end('400 Rossz kérés: Hibás a kérés sütiket tároló fejlécének a szintaxisa');
    }

    const cookies = {};

    if (!req.headers.cookie) {
        req.cookies = {};
        return;
    }

    const cookieString = req.headers.cookie;
    let keyBuffer = '', valueBuffer = '', readingKey = true;
    
    for (let i = 0; i < cookieString.length; i++) {
        if (cookieString[i] === '=') {
            if (keyBuffer === '')
                return reportInvalidSyntax();
            
            readingKey = false;
            continue;
        }

        if (cookieString[i] === ';') {
            if (keyBuffer === '')
                return reportInvalidSyntax();
            
            const num = Number(valueBuffer);

            cookies[keyBuffer] = valueBuffer === 'true' ? true :
                                 valueBuffer === 'false' ? false :
                                 !Number.isNaN(num) ? num :
                                 valueBuffer;
            keyBuffer = '';
            valueBuffer = '';
            readingKey = true;            

            i++;
            continue;
        }
        
        if (readingKey)
            keyBuffer += cookieString[i];
        else
            valueBuffer += cookieString[i];
    }

    if (cookieString[cookieString.length - 1] !== ';') {
        if (valueBuffer === '' || keyBuffer === '')
            return reportInvalidSyntax();
    
        const num = Number(valueBuffer);

        cookies[keyBuffer] = valueBuffer === 'true' ? true :
                             valueBuffer === 'false' ? false :
                             !Number.isNaN(num) ? num :
                             valueBuffer;
    }
    req.cookies = cookies;
}, genCookie = (key, value, options) => { // Credit: Szűcs Geri
    let c = `${key}=${value};`;
	
	if (options) {
		if (options.domain !== undefined)
			c += ` Domain=${options.domain};`;
		if (options.path !== undefined)
			c += ` Path=${options.path};`;
		if (options.expires !== undefined)
			c += ` Expires=${options.expires};`;
		if (options.maxAge !== undefined)
			c += ` Max-Age=${options.maxAge};`;
		if (options.sameSite !== undefined)
			c += ` SameSite=${options.sameSite};`;
		if (options.httpOnly)
			c += ` HttpOnly;`;
		if (options.secure)
			c += ` Secure;`;
	}

    return c.substr(0, c.length - 1);
};
server.listen(port);
console.log(`Server listening on port ${port}`);
