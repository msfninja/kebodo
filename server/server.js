/// Kebodo Server v0.01
/// © 2020 - 2021 Kebodo, © Kebodo Server, All Rights Reserved
/// Created by msfninja
/// Required npm modules:
/// http, url, fs, querystring, path, colors, crypto, uuid, readline, console.
/// Above modules are included in the repository.

const
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	qs = require('querystring'),
	path = require('path'),
	colors = require('colors'),
	crypto = require('crypto'),
	readline = require('readline'),
	cmd = require('console'),
	algorithm = 'aes-256-ctr',
	iv = crypto.randomBytes(16),
	baseDir = __dirname,
	homeDir = `${baseDir}/../`,
	{
		v1: uuidv1,
		v4: uuidv4,
	} = require('uuid'),
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

var time = () => {
	var dt = new Date();
	return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2);
};

var syslog = (hdr, tab, title, time, txt) => {
	if (hdr) {
		console.log(title);
	} else {
		var str = title;
		if (time) {
			str += ' @' + time();
		}
		if (tab) {
			str = '\t' + str;
		}
		str += '> ' + txt;
		console.log(str);
	}
};

var log = txt => {
	console.log('\nkbdconsole > '.bold.blue + txt);
};

var clear = () => {
	console.clear();
};

var table = () => {
	cmd.table();
};

var startServer = () => {
	clear();
	syslog(true, false, `© 2020-2021 Kebodo Server v0.01, kbdconsole, created by msfninja\nSee ${homeDir}README.md for more information, ${homeDir}LICENSE for license`.bold.blue);
	rl.question('\nEnter a hosting port [xx/xxx/xxxx]: '.bold.blue, serverPort => {
		var verification = serverPort.split('');
		if (!isNaN(serverPort) && (verification.length >= 2 && verification.length <= 4)) {
			var port = parseInt(serverPort, 10);
			start(port);
			syslog(true, false, 'Server is running on '.bold.blue + `http://143.176.32.149:${serverPort}`.green);
		} else {
			syslog(true, false, serverPort.bold.red + ' is an invalid port'.bold.blue);
			process.exit(0);
		}
		rl.close();
	});
};

var parseCookies = req => {
	var obj = {},
		rc = req.headers.cookie;
	rc && rc.split(';').forEach((cookie) => {
		var parts = cookie.split('=');
		obj[parts.shift().trim()] = decodeURI(parts.join('='));
	});
	return obj;
};

var encrypt = (text, key) => {
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
	return {
		iv: iv.toString('hex'),
		content: encrypted.toString('hex')
	};
};

var decrypt = (hash, key) => {
	const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
	const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
	return decrpyted.toString();
};

const response = (res, statusCode, header, data) => {
	res.writeHead(statusCode, header);
	if (data == !undefined) res.write(data);
	res.end();
};

var resEndWith200 = (res, data) => {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});
	res.write(data);
	res.end();
};

var resEndWith301 = (res, pathname) => {
	res.writeHead(301, {
		'Location': pathname
	});
	res.end();
};

var resEndWith302 = (res, pathname) => {
	res.writeHead(302, {
		'Location': pathname
	});
	res.end();
};

var resEndWith404 = (res, req, ip, renderFile, pageTitle, navBtnSelected, pageHeader, pageFooter) => {
	res.writeHead(404, {
		'Content-Type': 'text/html'
	});

	var q = url.parse(req.url, true);
	var langUrl = q.pathname.split('/');

	if (langUrl[1] == 'ee' || langUrl[1] == 'en' || langUrl[1] == 'nl') {
		resEndWithRenderHTML(res, req, ip, renderFile, pageTitle, '', '', '', insertFile(baseDir + '/site-parts/' + langUrl[1] + '/header.html'), insertFile(baseDir + '/site-parts/' + langUrl[1] + '/footer.html'));
	} else {
		resEndWithRenderHTML(res, req, ip, renderFile, pageTitle, '', '', '', insertFile(baseDir + '/site-parts/en/header.html'), insertFile(baseDir + '/site-parts/en/footer.html'));
	}
};

var rf = handle => {
	return fs.readFileSync(handle).toString();
};

var keyboardOptionsItems = item => {
	var item = JSON.parse(rf(baseDir + '/json/keyboard-item-list-' + item + '.json'));
	var html = '';
	for (var i = 0; i <= item.length - 1; i++) {
		html += `<span onclick="document.getElementById('builder_keyboardOptions_Keycaps').innerHTML = this.innerHTML">${item[i]}</span>`;
	}
	return `<div class="keyboardOptionsWrapper">${html}</div>`;
};

var keyboardPartsSubmit = (req, item) => {
	let body = '';
	req.on('data', chunk => body += chunk);
	req.on('end', () => {
		let post = qs.parse(body);
		fs.writeFile(
			`${__dirname}/json/keyboard-item-list-${item}.json`,
			JSON.stringify(post.arrayValues.split(',').sort(), null, 4),
			err => {
				if (err) throw err;
			}
		);
		resEndWith302(res, '/admin/builder');
	});
};

var insertFile = handle => {
	var f_ext = handle.split('.');
	switch (f_ext[f_ext.length - 1]) {
		case 'html':
			return rf(handle);
			break;

		case 'css':
			return `<link rel="stylesheet" type="text/css" href="${handle}">`;
			break;

		case 'js':
			return `<script type="text/javascript" src="${handle}"></script>`;
			break;

		case 'jpg' || 'jpeg' || 'png' || 'gif' || 'ico':
			return `<link rel="icon" type="image/${f_ext[f_ext.length - 1]}" href="${handle}">`;
			break;

		default:
			return '';
			break;
	}
};

var propellerAds = checkToken => {
	if (checkToken != JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token) {
		return `<script>(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(document.createElement('script'),'https://iclickcdn.com/tag.min.js',4139150,document.body||document.documentElement)</script>`;
	}
};

var resEndWithRenderHTML = (res, req, ip, renderFile, pageTitle, insertFilesHdr, insertFilesB, navBtnSelected, pageHeader, pageFooter) => {
	var
		js_jquery_plg = `<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>`,
		js_fontawesome_plg = `<script src="https://kit.fontawesome.com/ca27e311bf.js" crossorigin="anonymous"></script>`,
		css_fonts_plg = `<link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Roboto&family=Roboto+Mono&display=swap" rel="stylesheet">`,
		style = `<style>#cnt{opacity:0;}</style><link rel="icon" href="/images/logo/icon48.png">`,
		meta = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><meta name="propeller" content="a868420e045f6b28e19069d547d01677">`;

	res.writeHead(200, {
		'Content-Type': 'text/html'
	});

	var cookie = parseCookies(req);
	var q = url.parse(req.url, true);

	var data = renderFile.replace(
		/\{\{metaCnt\}\}/g,
		meta
	).replace(
		/\{\{pageTitle\}\}/g,
		pageTitle
	).replace(
		/\{\{hdrCnt\}\}/g,
		style + css_fonts_plg + js_fontawesome_plg + insertFile('/css/icons.css') + insertFile('/css/general.css') + insertFile('/js/g_abbr.js') + insertFilesHdr
	).replace(
		/\{\{bCnt\}\}/g,
		insertFile('/js/main.js') + js_jquery_plg + insertFilesB + propellerAds(cookie['TOKEN'])
	).replace(
		/\{\{pageFooter\}\}/g,
		pageFooter
	).replace(
		/\{\{pageHeader\}\}/g,
		pageHeader
	);

	var langUrl = q.pathname.split('/');

	if ((cookie['TOKEN'] == JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token) && (langUrl[1] == 'ee' || langUrl[1] == 'en' || langUrl[1] == 'nl')) {
		res.write(selectHdrNavBtn(data.replace(/\{\{headerUserMenu\}\}/g, rf(baseDir + '/site-parts/admin/header-user-menu.html').replace(/\{\{admin\}\}/g, JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token).replace(/\{\{headerUserMenuM\}\}/g, rf(baseDir + '/site-parts/admin/header-user-menu-m.html').replace(/\{\{admin\}\}/g, JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token), navBtnSelected))));
	} else if (langUrl[1] == 'ee' || langUrl[1] == 'en' || langUrl[1] == 'nl') {
		res.write(selectHdrNavBtn(data.replace(/\{\{headerUserMenu\}\}/g, insertFile(baseDir + '/site-parts/' + langUrl[1] + '/header-user-menu.html')).replace(/\{\{headerUserMenuM\}\}/g, insertFile(baseDir + '/site-parts/' + langUrl[1] + '/header-user-menu-m.html')), navBtnSelected));
	} else {
		res.write(selectHdrNavBtn(data.replace(/\{\{headerUserMenu\}\}/g, insertFile(baseDir + '/site-parts/en/header-user-menu.html')).replace(/\{\{headerUserMenuM\}\}/g, insertFile(baseDir + '/site-parts/en/header-user-menu-m.html')), navBtnSelected));
	}
	res.end();
};

var selectHdrNavBtn = (renderFile, hdrNavBtn) => {
	switch (hdrNavBtn) {
		case 'home':
			return renderFile.replace(
				/\{\{hdrNavBtnHome\}\}/g,
				'navBtnSelected'
			).replace(
				/\{\{hdrNavBtnBuilder\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnForum\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnAbout\}\}/g,
				''
			);
			break;

		case 'builder':
			return renderFile.replace(
				/\{\{hdrNavBtnHome\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnBuilder\}\}/g,
				'navBtnSelected'
			).replace(
				/\{\{hdrNavBtnForum\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnAbout\}\}/g,
				''
			);
			break;

		case 'forum':
			return renderFile.replace(
				/\{\{hdrNavBtnHome\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnBuilder\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnForum\}\}/g,
				'navBtnSelected'
			).replace(
				/\{\{hdrNavBtnAbout\}\}/g,
				''
			);
			break;

		case 'about':
			return renderFile.replace(
				/\{\{hdrNavBtnHome\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnBuilder\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnForum\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnAbout\}\}/g,
				'navBtnSelected'
			);
			break;

		default:
			return renderFile.replace(
				/\{\{hdrNavBtnHome\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnBuilder\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnForum\}\}/g,
				''
			).replace(
				/\{\{hdrNavBtnAbout\}\}/g,
				''
			);
			break;
	}
};

var replaceItems = handle => {
	var array = JSON.parse(rf(handle));
	var html = '';
	var partPath = handle.split('.')[0];
	var part = partPath.split('/');
	array.forEach(e => html += `<li><a class="noLink"><div onclick="setPart('${part[part.length - 1]}','${encodeURIComponent(e)}')" class="searchItem"><input name="${part[part.length - 1]}" class="searchItemInput" type="radio" id="${encodeURIComponent(e)}" /><label style="cursor: pointer;" for="${encodeURIComponent(e)}" onload="this.innerText = decodeURIComponent('${encodeURIComponent(e)}');"></label></div></a></li>\n`);
	return html;
};

var insertItems = renderFile => {
	return renderFile.replace(
		/\{\{pcb\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/pcb.json')
	).replace(
		/\{\{overview\-pcb\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/pcb.json')
	).replace(
		/\{\{pcb\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/pcb.json')).length
	).replace(
		/\{\{switches\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/switches.json')
	).replace(
		/\{\{overview\-switches\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/switches.json')
	).replace(
		/\{\{switches\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/switches.json')).length
	).replace(
		/\{\{plate\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/plate.json')
	).replace(
		/\{\{overview\-plate\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/plate.json')
	).replace(
		/\{\{plate\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/plate.json')).length
	).replace(
		/\{\{stabilizers\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/stabilizers.json')
	).replace(
		/\{\{overview\-stabilizers\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/stabilizers.json')
	).replace(
		/\{\{stabilizers\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/stabilizers.json')).length
	).replace(
		/\{\{case\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/case.json')
	).replace(
		/\{\{overview\-case\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/case.json')
	).replace(
		/\{\{case\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/case.json')).length
	).replace(
		/\{\{lube\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/lube.json')
	).replace(
		/\{\{overview\-lube\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/lube.json')
	).replace(
		/\{\{lube\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/lube.json')).length
	).replace(
		/\{\{keycaps\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/keycaps.json')
	).replace(
		/\{\{overview\-keycaps\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/keycaps.json')
	).replace(
		/\{\{keycaps\-items\-count\}\}/g,
		JSON.parse(rf(baseDir + '/keyboard/parts/keycaps.json')).length
	);
};

var adminPanel = (res, req, ip) => {
	var expires = (new Date(Date.now() + (86400 * 1000))).toUTCString();
	res.writeHead(302, {
		'Set-Cookie': 'TOKEN=' + JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token + '; expires=' + expires + '; path=/',
		'Location': '/' + JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token
	});
	res.end();
};

var getServerFiles = () => {
	var html = '';
	fs.readdir(homeDir, (err, files) => {
		if (err) log(err);
		files.forEach(file => {
			html += '<br>File: ' + file + '<br>';
		});
	});
	log(html);
};

var updateToken = () => {
	var rawToken = uuidv4().toString();
	var token = rawToken.replace(/\-/g, '');
	var totalFile = JSON.parse(rf(baseDir + '/login/admin-login-details.json'));
	totalFile['token'] = token;
	fs.writeFile(baseDir + '/login/admin-login-details.json', JSON.stringify(totalFile, null, 4), (err) => {
		if (err) throw err;
	})
};

var start = port => {
	http.createServer((req, res) => {
		var ip = req.connection.remoteAddress.toString().replace(/([\:]{2,})([a-z]{4,})\:/gi, '');
		var acc = 0;
		var grantedIPs = JSON.parse(rf(baseDir + '/grantedIPs.json'));
		var cookie = parseCookies(req);
		// for(var i = grantedIPs.length - 1; i >= 0; i--) {
		// 	if(ip == grantedIPs[i]) {
		// 		acc = 1;
		// 	}
		// }
		// if(acc != 1) {
		// 	res.writeHead(403,{'Content-Type':'text/html'});
		// 	res.write('<h2>401 Unauthorized</h2><p>Access restricted to unauthorized users.</p><hr>');
		// 	res.end();
		// }
		if (true) {
			if (rf(baseDir + '/maintenance.asc') == 1) {
				resEndWith302(res, 'http://143.176.32.149:8000/');
				res.end();
			} else if (rf(baseDir + '/maintenance.asc') == 'ddos') {
				res.writeHead(418, 'I\'m a Teapot');
				res.write('418: I\'m a Teapot. Waiting for DDoS attacks...\n\nYour IP address is ' + req.connection.remoteAddress.toString().replace(/\:\:ffff\:/g, ''));
				res.end();
			} else {
				var q = url.parse(req.url, true);
				var locked;
				var userSignInLogFile = 'user-sign-in';

				switch (q.pathname) {
					case '/':
						resEndWith302(res, '/en');
						break;

					case '/join':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/join/index.html'),
							'Kebodo | Join',
							'', '', '',
							insertFile(baseDir + '/site-parts/en/header.html'),
							insertFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

						/// ENGLISH ///

					case '/en':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/en/index.html').replace(
								/\{\{totalKeyboardPartsAvailable\}\}/g,
								'0'
							),
							'Kebodo',
							insertFile('/css/welcome-section.css'),
							insertFile('/js/home.js'),
							'home',
							insertFile(baseDir + '/site-parts/en/header.html'),
							insertFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/builder':
						resEndWithRenderHTML(res, req, ip,
							insertItems(rf(homeDir + 'public_html/en/builder/index.html')),
							'Builder | Kebodo',
							insertFile('/css/c_b.css') + insertFile('/css/s_b.css'),
							insertFile('/js/c_b.js') + insertFile('/js/s_b.js'),
							'builder',
							insertFile(baseDir + '/site-parts/en/header.html'),
							insertFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/forum':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/en/forum/index.html'),
							'Forum | Kebodo',
							'',
							'',
							'forum',
							insertFile(baseDir + '/site-parts/en/header.html'),
							insertFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/about':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/en/about/index.html'),
							'About | Kebodo',
							'',
							'',
							'about',
							insertFile(baseDir + '/site-parts/en/header.html'),
							insertFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/sign-in':
						if (req.method === 'POST') {
							var body = '';

							req.on('data', (data) => {
								body += data;
							});

							req.on('end', () => {
								var loginDetails = qs.parse(body);
								var adminUsername = JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].username,
									adminPassword = JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].password;

								if (req.method === 'POST' && loginDetails.username === adminUsername && loginDetails.password === adminPassword) {
									var dt = new Date();
									var logTxt = ' [+] | IP: ' + ip + ' | Date: ' + dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2) + ' ' + (('0' + dt.getHours()).slice(-2) - 2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2) + ' UTC | Username: ' + loginDetails.username + ' | Password: ' + loginDetails.password;
									if (fs.existsSync(baseDir + '/logs/' + userSignInLogFile + '.log')) {
										var logFileCnt = rf(baseDir + '/logs/' + userSignInLogFile + '.log');
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log', logFileCnt += logTxt + '\n', (err) => {
											if (err) log(err);
										});
									} else {
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log', logTxt + '\n', (err) => {
											if (err) log(err);
										});
									}
									log('Login attempt:\r\n' + logTxt);
									adminPanel(res, req, ip);
								} else if (false) {
									return;
								} else {
									log(logTxt);
									resEndWithRenderHTML(res, req, ip,
										rf(homeDir + 'public_html/en/sign-in/index.html').replace(
											/\<br\>\<\!\-\-loginIncorrect\-\-\>/g,
											`<style>#flg{cursor:default;font-size:14px;padding:7px;background:#b51324;color:#fff;border-radius:10px;} #flg::selection{background:transparent;color:#fff;}</style><span id="flg" align="center">The username or password you entered is incorrect</span><br>`),
										'Admin | Kebodo',
										'',
										'',
										'none',
										insertFile(baseDir + '/site-parts/en/header.html'),
										insertFile(baseDir + '/site-parts/en/footer.html')
									);
									res.end();
								}
							});
						} else {
							resEndWithRenderHTML(res, req, ip,
								rf(homeDir + 'public_html/en/sign-in/index.html'),
								'Sign In | Kebodo',
								'',
								'',
								'none',
								insertFile(baseDir + '/site-parts/en/header.html'),
								insertFile(baseDir + '/site-parts/en/footer.html')
							);
						}
						break;

					case '/en/donate':
						resEndWithRenderHTML(
							res,
							req,
							ip,
							rf(homeDir + 'public_html/en/donate/index.html'),
							'Donate | Kebodo',
							'',
							'',
							'donate',
							insertFile(baseDir + '/site-parts/en/header.html'),
							insertFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

						/// DUTCH ///

					case '/nl':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/nl/index.html').replace(
								/\{\{totalKeyboardPartsAvailable\}\}/g,
								'0'
							),
							'Kebodo',
							insertFile('/css/welcome-section.css'),
							insertFile('/js/home.js'),
							'home',
							insertFile(baseDir + '/site-parts/nl/header.html'),
							insertFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/builder':
						resEndWithRenderHTML(res, req, ip,
							insertItems(rf(homeDir + 'public_html/nl/builder/index.html')),
							'Builder | Kebodo',
							insertFile('/css/c_b.css') + insertFile('/css/s_b.css'),
							insertFile('/js/c_b.js') + insertFile('/js/s_b.js'),
							'builder',
							insertFile(baseDir + '/site-parts/nl/header.html'),
							insertFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/forum':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/nl/forum/index.html'),
							'Forum | Kebodo',
							'',
							'',
							'forum',
							insertFile(baseDir + '/site-parts/nl/header.html'),
							insertFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/about':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/nl/about/index.html'),
							'Over ons | Kebodo',
							'',
							'',
							'about',
							insertFile(baseDir + '/site-parts/nl/header.html'),
							insertFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/sign-in':
						if (req.method === 'POST') {
							var body = '';

							req.on('data', (data) => {
								body += data;
							});

							req.on('end', () => {
								var loginDetails = qs.parse(body);
								var adminUsername = JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].username,
									adminPassword = JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].password;

								if (req.method === 'POST' && loginDetails.username === adminUsername && loginDetails.password === adminPassword) {
									var dt = new Date();
									var logTxt = ' [+] | IP: ' + ip + ' | Date: ' + dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2) + ' ' + (('0' + dt.getHours()).slice(-2) - 2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2) + ' UTC | Username: ' + loginDetails.username + ' | Password: ' + loginDetails.password;
									if (fs.existsSync(baseDir + '/logs/' + userSignInLogFile + '.log')) {
										var logFileCnt = rf(baseDir + '/logs/' + userSignInLogFile + '.log');
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log', logFileCnt += logTxt + '\n', (err) => {
											if (err) log(err);
										});
									} else {
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log', logTxt + '\n', (err) => {
											if (err) log(err);
										});
									}
									log('\r\nLogin attempt:\r\n' + logTxt + '\r\n');
									adminPanel(res, req, ip);
								} else if (false) {
									return;
								} else {
									log(logTxt);
									resEndWithRenderHTML(res, req, ip,
										rf(homeDir + 'public_html/nl/sign-in/index.html').replace(
											/\<br\>\<\!\-\-loginIncorrect\-\-\>/g,
											`<style>#flg{cursor:default;font-size:14px;padding:7px;background:#b51324;color:#fff;border-radius:10px;} #flg::selection{background:transparent;color:#fff;}</style><span id="flg" align="center">The username or password you entered is incorrect</span><br>`),
										'Admin | Kebodo',
										'',
										'',
										'none',
										insertFile(baseDir + '/site-parts/nl/header.html'),
										insertFile(baseDir + '/site-parts/nl/footer.html')
									);
									res.end();
								}
							});
						} else {
							resEndWithRenderHTML(res, req, ip,
								rf(homeDir + 'public_html/nl/sign-in/index.html'),
								'Sign In | Kebodo',
								'',
								'',
								'none',
								insertFile(baseDir + '/site-parts/nl/header.html'),
								insertFile(baseDir + '/site-parts/nl/footer.html')
							);
						}
						break;

						/// ESTONIAN ///

					case '/ee':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/ee/index.html').replace(
								/\{\{totalKeyboardPartsAvailable\}\}/g,
								'0'
							),
							'Kebodo',
							insertFile('/css/welcome-section.css'),
							insertFile('/js/home.js'),
							'home',
							insertFile(baseDir + '/site-parts/ee/header.html'),
							insertFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;


					case '/ee/builder':
						resEndWithRenderHTML(res, req, ip,
							insertItems(rf(homeDir + 'public_html/ee/builder/index.html')),
							'Ehitaja | Kebodo',
							insertFile('/css/c_b.css') + insertFile('/css/s_b.css'),
							insertFile('/js/c_b.js') + insertFile('/js/s_b.js'),
							'builder',
							insertFile(baseDir + '/site-parts/ee/header.html'),
							insertFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;

					case '/ee/forum':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/ee/forum/index.html'),
							'Foorum | Kebodo',
							'',
							'',
							'forum',
							insertFile(baseDir + '/site-parts/ee/header.html'),
							insertFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;

					case '/ee/about':
						resEndWithRenderHTML(res, req, ip,
							rf(homeDir + 'public_html/ee/about/index.html'),
							'Meist | Kebodo',
							'',
							'',
							'about',
							insertFile(baseDir + '/site-parts/ee/header.html'),
							insertFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;

					case '/ee/sign-in':
						if (req.method === 'POST') {
							var body = '';

							req.on('data', (data) => {
								body += data;
							});

							req.on('end', () => {
								var loginDetails = qs.parse(body);
								var adminUsername = JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].username,
									adminPassword = JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].password;

								if (req.method === 'POST' && loginDetails.username === adminUsername && loginDetails.password === adminPassword) {
									var dt = new Date();
									var logTxt = ' [+] | IP: ' + ip + ' | Date: ' + dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2) + ' ' + (('0' + dt.getHours()).slice(-2) - 2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2) + ' UTC | Username: ' + loginDetails.username + ' | Password: ' + loginDetails.password;
									if (fs.existsSync(baseDir + '/logs/' + userSignInLogFile + '.log')) {
										var logFileCnt = rf(baseDir + '/logs/' + userSignInLogFile + '.log');
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log', logFileCnt += logTxt + '\n', (err) => {
											if (err) log(err);
										});
									} else {
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log', logTxt + '\n', (err) => {
											if (err) log(err);
										});
									}
									log('\r\nLogin attempt:\r\n' + logTxt + '\r\n');
									adminPanel(res, req, ip);
								} else if (false) {
									return;
								} else {
									log(logTxt);
									resEndWithRenderHTML(res, req, ip,
										rf(homeDir + 'public_html/ee/sign-in/index.html').replace(
											/\<br\>\<\!\-\-loginIncorrect\-\-\>/g,
											`<style>#flg{cursor:default;font-size:14px;padding:7px;background:#b51324;color:#fff;border-radius:10px;} #flg::selection{background:transparent;color:#fff;}</style><span id="flg" align="center">The username or password you entered is incorrect</span><br>`),
										'Admin | Kebodo',
										'',
										'',
										'none',
										insertFile(baseDir + '/site-parts/ee/header.html'),
										insertFile(baseDir + '/site-parts/ee/footer.html')
									);
									res.end();
								}
							});
						} else {
							resEndWithRenderHTML(res, req, ip,
								rf(homeDir + 'public_html/ee/sign-in/index.html'),
								'Sign In | Kebodo',
								'',
								'',
								'none',
								insertFile(baseDir + '/site-parts/ee/header.html'),
								insertFile(baseDir + '/site-parts/ee/footer.html')
							);
						}
						break;

					case '/' + JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token:
						if (cookie['TOKEN'] == JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token) {
							resEndWithRenderHTML(res, req, ip, rf(baseDir + '/admin-panel/index.html'), 'Admin | Kebodo', '', insertFile('/js/admin/main.js'), 'none', insertFile(baseDir + '/admin-panel/header.html').replace(/\{\{admin\}\}/g, JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token), '');
						} else {
							resEndWith302(res, '/en/sign-in');
						}
						break;

					case '/' + JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token + '/dom':
						if (cookie['TOKEN'] == JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token) {
							var domHtml = rf(baseDir + '/admin-panel/dom.html').replace(
								/\{\{serverLocalFiles\}\}/g,
								getServerFiles()
							);
							resEndWithRenderHTML(res, req, ip, domHtml, 'Admin | Kebodo', '', insertFile('/js/admin/main.js'), 'none', insertFile(baseDir + '/admin-panel/header.html').replace(/\{\{admin\}\}/g, JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token), '');
						} else {
							resEndWith302(res, '/en/sign-in');
						}
						break;

					case '/' + JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token + '/builder':
						if (cookie['TOKEN'] == JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token) {
							resEndWithRenderHTML(res, req, ip, rf(baseDir + '/admin-panel/builder.html'), 'Admin | Kebodo', '', insertFile('/js/admin/main.js'), 'none', insertFile(baseDir + '/admin-panel/header.html').replace(/\{\{admin\}\}/g, JSON.parse(rf(baseDir + '/login/admin-login-details.json'))[0].token), '');
						} else {
							resEndWith302(res, '/en/sign-in');
						}
						break;

						/// DEFAULT ///

					default:
						const possibleFilePath = path.resolve(baseDir, q.pathname.replace(/^\/*/, homeDir + 'public_html/'));
						if (fs.existsSync(possibleFilePath)) {
							fs.readFile(possibleFilePath, (err, data) => {
								if (err) {
									resEndWith404(res, req, ip,
										rf(baseDir + '/404.html'),
										'Page Not Found',
										'none',
										insertFile(baseDir + '/site-parts/ee/header.html'),
										insertFile(baseDir + '/site-parts/en/footer.html')
									);
								}
								res.statusCode = 200;
								return res.end(data);
							});
						} else {
							resEndWith404(res, req, ip,
								rf(baseDir + '/404.html'),
								'Page Not Found',
								'none',
								insertFile(baseDir + '/site-parts/en/header.html'),
								insertFile(baseDir + '/site-parts/en/footer.html')
							);
						}
						break;
				}
			}
		}
	}).listen(port);
}

startServer();