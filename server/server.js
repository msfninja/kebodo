// (c) 2020 - 2021 Kebodo
// Kebodo's server source code

// Note:
// This file is in active development, and a lot of features are yet to be added.

'use strict';

const // modules
	http = require('http'),
	path = require('path'),
	url = require('url'),
	fs = require('fs'),
	qs = require('qs'),
	ip = require('ip'),
	YAML = require('yaml'),
	crypto = require('crypto'),
	{
		v1: uuidv1,
		v4: uuidv4
	} = require('uuid');

let config;

const // basic variables
	dir = path.resolve(__dirname,'..');

const // basic operation functions
	ex = h => { return fs.existsSync(h); },
	rd = h => { return ex(h) ? fs.readFileSync(h).toString() : ''; },
	compare = (a,b) => {
		let arr = [];
		for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) if (a[i] === b[j]) arr.push(a[i]);
		return {
			array: arr,
			match: arr.length > 0,
			size: arr.length
		};
	},
	format = s => {
		return s.replace(/\s/g,'-').replace(/[^a-z0-9]/gi,'').toLowerCase();
	};

try { config = YAML.parse(rd(`${dir}/config.yml`)); } catch (e) { throw e; }

const // operation functions
	term = (res,s,h,c) => {
		res.writeHead(s,h);
		if (c) res.write(c);
		res.end();
	},
	render = (res,req,h,m) => {
		let
			html = '',
			accept = ['a','b','r','x'],
			modes = m.split('');

		if (compare(modes,accept).match) {
			if (modes.includes('r')) {
				html = rd(h).replace(/\{component\.meta\}/g,rd(`${dir}/server/client/component/meta.xhtml`)).replace(/\{component\.link\}/g,rd(`${dir}/server/client/component/link.xhtml`)).replace(/\{component\.script\}/g,rd(`${dir}/server/client/component/script.xhtml`)).replace(/\{component\.noscript\}/g,rd(`${dir}/server/client/component/noscript.xhtml`)).replace(/\{component\.header\}/g,rd(`${dir}/server/client/component/header.xhtml`)).replace(/\{component\.footer\}/g,rd(`${dir}/server/client/component/footer.xhtml`)).replace(/\{component\.loader\}/g,rd(`${dir}/server/client/component/loader.xhtml`)).replace(/\{component\.doctype\}/g,rd(`${dir}/server/client/component/doctype.xhtml`));
				html = html.replace(/\{app\.name\}/g,config.app.name).replace(/\{app\.lname\}/g,config.app.lname).replace(/\{app\.desc\}/g,config.app.desc).replace(/\{app\.version\}/g,config.app.version).replace(/\{app\.release\}/g,config.app.release).replace(/\{app.nav.tabs\}/g,createNav());
			}
			if (modes.includes('a')) {
				html = html.replace(/\{token\}/g,token);
			}
		}

		html = html.replace(/[\n\t]/g,''); // some sort of custom minifying...

		return html;
	};


const // miscellaneous functions
	cookies = req => {
		let
			obj = {},
			rc = req.headers.cookie;
		rc && rc.split(';').forEach(e => {
			let parts = e.split('=');
			obj[parts.shift().trim()] = decodeURIComponent(parts.join('='));
		});
		return obj;
	};

const // site functions
	createNav = () => {
		let
			html = '';
		config.app.nav.forEach(e => {
			html += `
				<div${e.nav ? ' data-nav="' + format(e.path) + '"' : ''} class="btn-nav" onclick="${e.nav ? 'window.location.pathname = \'' + e.path + '\';' : 'window.open(\'' + e.path + '\',\'_blank\');'}">
					<div class="ico">
						<span><i class="bi bi-${e.icon}"></i></span>
					</div>
					<div class="txt">
						<span>${e.name}</span>
					</div>
				</div>
			`;
		});
		return html;
	};

function Root(res) { // root function
	this.verify = (usr,psw) => {
		//
	};
	this.direct = c => {
		if (c) term(res,302,{'Location':`/${token}`});
		else term(res,200,{'Content-Type','application/xhtml+xml'},render(res,req,`${dir}/server/root/index.xhtml`,'ar'));
	};
	this.login = c => {
		if (c) {
			term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/root/panel/index.xhtml`,'arx'));
		}
		else term(res,200,{'Content-Type','application/xhtml+xml'},render(res,req,`${dir}/server/root/index.xhtml`,'ar'));
	};
}

const // http server
	init = port => {
		http.createServer((req,res) => {
			let
				q = url.parse(req.url,true),
				p = q.pathname,
				ip = req.connection.remoteAddress.replace(/\:+[a-z]{4}\:/i,''),
				root = new Root(res),
				cookie = cookies(req);

			if (p === '/') term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/index.xhtml`,'r'));
			else if (p.split('/')[1] === 'builder') term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/builder/index.xhtml`,'r'));
			else if (p.split('/')[1] === 'builder') term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/public/forum/index.xhtml`,'r'));
			else if (p.split('/').includes('root')) {
				if (p === '/root' && req.method === 'GET') {
					term(res,200,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/root/index.xhtml`,'ar'));
				}
			}
			else {
				const h = path.resolve(dir,p.replace(/^\/*/,'public/'));
				if (ex(h)) {
					fs.readFile(h,(err,dat) => {
						if (err) term(res,500,{'Content-Type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/500.xhtml`,'r'));
						res.statusCode = 200;
						return res.end(dat);
					});
				}
				else term(res,404,{'Content-type':'application/xhtml+xml'},render(res,req,`${dir}/server/client/err/404.xhtml`,'r'));
			}
		}).listen(port);
	};

const // crypt variables
	algorithm = 'aes-256-ctr',
	iv = crypto.randomBytes(16);

const // security functions
	getuuid = n => {
		let str = '';
		for (var i = 0; i < n; i++) str += uuidv4().toString().replace(/\-/g,'');
		return str;
	};

const // security variables
	token = getuuid(3),
	utoken = getuuid(3),
	recover = getuuid(9);

const // crypt functions
	encrypt = (t,k) => {
		const
			cipher = crypto.createCipheriv(algorithm,k,iv),
			encrypted = Buffer.concat([cipher.update(t),cipher.final()]);
		return {
			iv: iv.toString('hex'),
			content: encrypted.toString('hex')
		};
	},
	decrypt = (h,k) => {
		const
			decipher = crypto.createDecipheriv(algorithm,k,Buffer.from(h.iv,'hex')),
			decrpyted = Buffer.concat([decipher.update(Buffer.from(h.content,'hex')),decipher.final()]);
		return decrpyted.toString();
	};

console.clear();

try {
	init(config.server.port);
	console.log(`Server running at http://${ip.address()}:${config.server.port}\n\nPress ^C to kill server.\n\n`);
}
catch (e) { throw e; }