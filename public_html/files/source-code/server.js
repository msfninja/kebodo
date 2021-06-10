// © 2020 - 2021 Kebodo, © Kebodo Server, All Rights Reserved
// LICENSED, COPYRIGHTED. Created by msf.ninja
// Please read the README.md file located in the parent directory of the server.js file directory before editing the © Kebodo Server source code.
// License in LICENSE located in the parent directory of the server.js file directory.
// Required npm modules:
// http, url, fs, querystring, path, geoip-lite, colors, crypto, uuid, readline, console.

// SERVER CONSOLE IO/INTERFACE AND FUNCTIONS

const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const geoip = require('geoip-lite');
const colors = require('colors');
const crypto = require('crypto');
const readline = require('readline');
const cmd = require('console');
const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);
const baseDir = __dirname;
const homeDir = '/var/www/html/000/0000/';
const { 
	v1: uuidv1,
	v4: uuidv4,
} = require('uuid');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var time = () => {
	var dt = new Date();
	return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2);
};

var syslog = (hdr,tab,title,time,txt) => {
	if(hdr) {
		console.log(title);
	}
	else {
		var str = title;
		if(time) {
			str += ' @' + time();
		}
		if(tab) {
			str = '\t' + str;
		}
		str += '> ' + txt;
		console.log(str);
	}
};

var log = (txt) => {
	console.log('\nkbdconsole > '.bold.blue + txt);
};

var clear = () => {
	console.clear();
};

var table = () => {
	cmd.table();
};

var help = () => {
	syslog(true,false,'\n\tstart\t\tStart the server\n\trs\t\tRestart the server\n\tkill\t\tKill the server\n\tclear\t\tClear console\n\thelp\t\tShow this list\n\t^C\t\tExit');
};

var startKbdconsole = () => {
	clear();
	syslog(true,false,'\n© 2020-2021 Kebodo Server, kbdconsole, created by msf.ninja\nSee README.md for more information, LICENSE for license'.bold.blue);
	help();
	kbdconsole();
};

var kbdconsole = () => {
	rl.question('\nkbdconsole > '.bold.blue,(action) => {
		if(action == 'start') {
			startServer();
		}
		else if(action == 'kill') {
			process.exit(0);
		}
		else if(action == 'help') {
			help();
			kbdconsole();
		}
		else if(action == 'clear') {
			clear();
			kbdconsole();
		}
		else {
			kbdconsole();
		}
		rl.close();
	});
};

var startServer = () => {
	rl.question('Enter a hosting port [xx/xxxx] '.bold.blue,(serverPort) => {
		var verification = serverPort.split('');
		if(serverPort != NaN && (verification.length == 2 || verification.length == 4)) {
			var port = parseInt(serverPort,10);
			start(port);
			syslog(true,false,'Server is running on port '.bold.blue + serverPort.bold.green + '!'.bold.blue);
		}
		else {
			syslog(true,false,serverPort.bold.red + ' is an invalid port'.bold.blue);
		}
		kbdconsole();
		rl.close();
	});
};

// SERVER SOURCE CODE

var parseCookies = (req) => {
	var obj = {},
		rc = req.headers.cookie;
	rc && rc.split(';').forEach((cookie) => {
		var parts = cookie.split('=');
		obj[parts.shift().trim()] = decodeURI(parts.join('='));
	});
	return obj;
};

var encrypt = (text,key) => {
	const cipher = crypto.createCipheriv(algorithm,key,iv);
	const encrypted = Buffer.concat([cipher.update(text),cipher.final()]);
	return {
		iv: iv.toString('hex'),
		content: encrypted.toString('hex')
	};
};
	
var decrypt = (hash,key) => {
	const decipher = crypto.createDecipheriv(algorithm,key,Buffer.from(hash.iv,'hex'));
	const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content,'hex')),decipher.final()]);
	return decrpyted.toString();
};

var resEndWith200 = (res,data) => {
	res.writeHead(200,{'Content-Type':'text/html'});
	res.write(data);
	res.end();
};

var resEndWith301 = (res,pathname) => {
	res.writeHead(301,{'Location':pathname});
	res.end();
};

var resEndWith302 = (res,pathname) => {
	res.writeHead(302,{'Location':pathname});
	res.end();
};

var resEndWith404 = (res,req,ip,renderFile,pageTitle,navBtnSelected,pageHeader,pageFooter) => {
	res.writeHead(404,{'Content-Type':'text/html'});

	var q = url.parse(req.url,true);
	var langUrl = q.pathname.split('/');
	
	if(langUrl[1] == 'ee' || langUrl[1] == 'en' || langUrl[1] == 'nl') {
		resEndWithRenderHTML(res,req,ip,renderFile,pageTitle,'','','',InsFile(baseDir + '/site-parts/' + langUrl[1] + '/header.html'),InsFile(baseDir + '/site-parts/' + langUrl[1] + '/footer.html'));
	}
	else {
		resEndWithRenderHTML(res,req,ip,renderFile,pageTitle,'','','',InsFile(baseDir + '/site-parts/en/header.html'),InsFile(baseDir + '/site-parts/en/footer.html'));
	}
};

var readFile = (filePath) => {
	return fs.readFileSync(filePath).toString();
};

var keyboardOptionsItems = (item) => {
	var item = JSON.parse(readFile(baseDir + '/json/keyboard-item-list-' + item + '.json'));
	var html = '';	
	for (var i = 0; i <= item.length - 1; i++) {
		html += `<span onclick="document.getElementById('builder_keyboardOptions_Keycaps').innerHTML = this.innerHTML">` + item[i] + `</span>`;
	}
	return `<div class="keyboardOptionsWrapper">` + html + `</div>`;
};

var keyboardPartsSubmit = (req,item) => {
	var body = '';

	req.on('data',(data) => {
		body += data;
	});

	req.on('end',() => {
		var values = qs.parse(body);
		fs.writeFile(baseDir + '/json/keyboard-item-list-' + item + '.json',JSON.stringify(values.arrayValues.split(',').sort(),null,4),(err) => { if(err) log(err); });
		resEndWith302(res,'/admin/builder');
	});
};

var InsFile = (filePath) => {
	var f_ext = filePath.split('.');
	switch(f_ext[f_ext.length - 1]) {
		case 'html':
			return readFile(filePath);
			break;

		case 'css':
			return `<link rel="stylesheet" type="text/css" href="` + filePath + `">`;
			break;

		case 'js':
			return `<script type="text/javascript" src="` + filePath + `"></script>`;
			break;

		case 'jpg' || 'jpeg' || 'png' || 'gif' || 'ico':
			return `<link rel="icon" type="image/` + f_ext[f_ext.length - 1] + `" href="` + filePath + `">`;
			break;

		default: 
			return '';
			break;
	}
};

var propellerAds = (checkToken) => {
	if(checkToken != JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token) {
		return `<script>(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(document.createElement('script'),'https://iclickcdn.com/tag.min.js',4139150,document.body||document.documentElement)</script>`;
	}
};

var resEndWithRenderHTML = (res,req,ip,renderFile,pageTitle,InsFilesHdr,InsFilesB,navBtnSelected,pageHeader,pageFooter) => {
	var
		js_jquery_plg = `<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>`,
		js_fontawesome_plg = `<script src="https://kit.fontawesome.com/ca27e311bf.js" crossorigin="anonymous"></script>`,
		css_fonts_plg = `<link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Roboto&family=Roboto+Mono&display=swap" rel="stylesheet">`,
		style = `<style>#cnt{opacity:0;}</style><link rel="icon" href="/images/logo/icon48.png">`,
		meta = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><meta name="propeller" content="a868420e045f6b28e19069d547d01677">`;

	res.writeHead(200,{'Content-Type':'text/html'});

	var cookie = parseCookies(req);
	var q = url.parse(req.url,true);

	var data = renderFile.replace(
		/\{\{metaCnt\}\}/g,
		meta
	).replace(
		/\{\{pageTitle\}\}/g,
		pageTitle
	).replace(
		/\{\{hdrCnt\}\}/g,
		style + css_fonts_plg + js_fontawesome_plg + InsFile('/css/icons.css') + InsFile('/css/general.css') + InsFile('/js/g_abbr.js') + InsFilesHdr
	).replace(
		/\{\{bCnt\}\}/g,
		InsFile('/js/main.js') + js_jquery_plg + InsFilesB + propellerAds(cookie['TOKEN'])
	).replace(
		/\{\{pageFooter\}\}/g,
		pageFooter
	).replace(
		/\{\{pageHeader\}\}/g,
		pageHeader
	);

	var langUrl = q.pathname.split('/');

	if((cookie['TOKEN'] == JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token) && (langUrl[1] == 'ee' || langUrl[1] == 'en' || langUrl[1] == 'nl')) {
		res.write(selectHdrNavBtn(data.replace(/\{\{headerUserMenu\}\}/g,readFile(baseDir + '/site-parts/admin/header-user-menu.html').replace(/\{\{admin\}\}/g,JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token).replace(/\{\{headerUserMenuM\}\}/g,readFile(baseDir + '/site-parts/admin/header-user-menu-m.html').replace(/\{\{admin\}\}/g,JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token),navBtnSelected))));
	}
	else if(langUrl[1] == 'ee' || langUrl[1] == 'en' || langUrl[1] == 'nl') {
		res.write(selectHdrNavBtn(data.replace(/\{\{headerUserMenu\}\}/g,InsFile(baseDir + '/site-parts/' + langUrl[1] + '/header-user-menu.html')).replace(/\{\{headerUserMenuM\}\}/g,InsFile(baseDir + '/site-parts/' + langUrl[1] + '/header-user-menu-m.html')),navBtnSelected));
	}
	else {
		res.write(selectHdrNavBtn(data.replace(/\{\{headerUserMenu\}\}/g,InsFile(baseDir + '/site-parts/en/header-user-menu.html')).replace(/\{\{headerUserMenuM\}\}/g,InsFile(baseDir + '/site-parts/en/header-user-menu-m.html')),navBtnSelected));
	}

	logIp(req,ip);
	res.end();
};

var selectHdrNavBtn = (renderFile,hdrNavBtn) => {
	switch(hdrNavBtn) {
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

var replaceItems = (filePath) => {
	var array = JSON.parse(readFile(filePath));
	var html = '';
	var partPath = filePath.split('.')[0];
	log(partPath);
	var part = partPath.split('/')[part.length - 1];
	console.log('Part: ' + part);
	array.forEach(e => html += `
<li>
	<a class="noLink">
		<div onclick="setPart('${part}','${encodeURIComponent(e)}')" class="searchItem">
			<input name="${part}" class="searchItemInput" type="radio" id="${encodeURIComponent(e)}" />
			<label style="cursor: pointer;" for="${encodeURIComponent(e)}">${e}</label>
		</div>
	</a>
</li>`);
	return html;
};

var insertItems = (renderFile) => {
	log('oioioioi')
	return renderFile.replace(
		/\{\{pcb\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/pcb.json')
	).replace(
		/\{\{overview\-pcb\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/pcb.json')
	).replace(
		/\{\{pcb\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/pcb.json')).length
	).replace(
		/\{\{switches\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/switches.json')
	).replace(
		/\{\{overview\-switches\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/switches.json')
	).replace(
		/\{\{switches\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/switches.json')).length
	).replace(
		/\{\{plate\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/plate.json')
	).replace(
		/\{\{overview\-plate\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/plate.json')
	).replace(
		/\{\{plate\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/plate.json')).length
	).replace(
		/\{\{stabilizers\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/stabilizers.json')
	).replace(
		/\{\{overview\-stabilizers\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/stabilizers.json')
	).replace(
		/\{\{stabilizers\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/stabilizers.json')).length
	).replace(
		/\{\{case\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/case.json')
	).replace(
		/\{\{overview\-case\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/case.json')
	).replace(
		/\{\{case\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/case.json')).length
	).replace(
		/\{\{lube\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/lube.json')
	).replace(
		/\{\{overview\-lube\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/lube.json')
	).replace(
		/\{\{lube\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/lube.json')).length
	).replace(
		/\{\{keycaps\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/keycaps.json')
	).replace(
		/\{\{overview\-keycaps\-items\}\}/g,
		replaceItems(baseDir + '/keyboard/parts/keycaps.json')
	).replace(
		/\{\{keycaps\-items\-count\}\}/g,
		JSON.parse(readFile(baseDir + '/keyboard/parts/keycaps.json')).length
	);
};

var adminPanel = (res,req,ip) => {
	var expires = (new Date(Date.now() + (86400 * 1000))).toUTCString();
	res.writeHead(302,{'Set-Cookie':'TOKEN=' + JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token + '; expires=' + expires + '; path=/','Location':'/' + JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token});
	res.end();
};

var logIp = (req,ip) => {
	if(!(ip == null || ip == undefined)) {
		if(ip != '143.176.32.149' && ip != '127.0.0.1' && ip != '89.200.38.251') {
			var dt = new Date();
			if(fs.existsSync(baseDir + '/logs/ip.json')) {
				var logFile = JSON.parse(readFile(baseDir + '/logs/ip.json'));
			}
			else {
				var logFile = {};
			}
			var currentTime = dt.getFullYear() + ('0' + (dt.getMonth() + 1)).slice(-2) + ('0' + dt.getDate()).slice(-2) + ('0' + dt.getHours()).slice(-2) + ('0' + dt.getMinutes()).slice(-2) + ('0' + dt.getSeconds()).slice(-2) + '+0200';
			var ipObj = geoip.lookup(ip);
			var q = url.parse(req.url,true);
			log(q.pathname + ' | ' + ip + ' | ' + ipObj.country + ', ' + ipObj.region + ', ' + ipObj.city);
			if(logFile[ip] == undefined) {
				ipObj.timestamps = [currentTime];
			}
			else {
				var currentTimestamps = logFile[ip].timestamps;
				currentTimestamps.push(currentTime);
				ipObj.timestamps = currentTimestamps;
			}
			logFile[ip] = ipObj;
			fs.writeFile(baseDir + '/logs/ip.json',JSON.stringify(logFile,null,4),(err) => { if(err) log(err); });
		}
	}
};

var getServerFiles = () => {
	var html = '';
	fs.readdir(homeDir,(err,files) => {
		if(err) log(err);
		files.forEach(file => {
			html += '<br>File: ' + file + '<br>';
		});
	});
	log(html);
};

var updateToken = () => {
	var rawToken = uuidv4().toString();
	var token = rawToken.replace(/\-/g,'');
	var totalFile = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'));
	totalFile['token'] = token;
	fs.writeFile(baseDir + '/login/admin-login-details.json',JSON.stringify(totalFile,null,4),(err) => { if(err) log(err); })
};

var start = (port) => {
	http.createServer((req,res) => {
		var ip = req.connection.remoteAddress.toString().replace(/([\:]{2,})([a-z]{4,})\:/gi,'');
		var acc = 0;
		var grantedIPs = JSON.parse(readFile(baseDir + '/grantedIPs.json'));
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
		if(true) {
			if(readFile(baseDir + '/maintenance.asc') == 1) {
				resEndWith302(res,'http://143.176.32.149:8000/');
				res.end();
			}
			else if(readFile(baseDir + '/maintenance.asc') == 'ddos') {
				res.writeHead(418,'I\'m a Teapot');
				res.write('418: I\'m a Teapot. Waiting for DDoS attacks...\n\nYour IP address is ' + req.connection.remoteAddress.toString().replace(/\:\:ffff\:/g,''));
				res.end();
			}
			else {
				var q = url.parse(req.url,true);
				var locked;
				var userSignInLogFile = 'user-sign-in';

				switch(q.pathname) {
					case '/':
						resEndWith302(res,'/en');
						break;

					/// ENGLISH ///

					case '/en':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/en/index.html').replace(
								/\{\{totalKeyboardPartsAvailable\}\}/g,
								'0'
							),
							'Kebodo',
							InsFile('/css/welcome-section.css'),
							InsFile('/js/home.js'),
							'home',
							InsFile(baseDir + '/site-parts/en/header.html'),
							InsFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/builder':
						resEndWithRenderHTML(res,req,ip,
							insertItems(readFile(homeDir + 'public_html/en/builder/index.html')),
							'Builder | Kebodo',
							InsFile('/css/c_b.css') + InsFile('/css/s_b.css'),
							InsFile('/js/c_b.js') + InsFile('/js/s_b.js'),
							'builder',
							InsFile(baseDir + '/site-parts/en/header.html'),
							InsFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/forum':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/en/forum/index.html'),
							'Forum | Kebodo',
							'',
							'',
							'forum',
							InsFile(baseDir + '/site-parts/en/header.html'),
							InsFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/about':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/en/about/index.html'),
							'About | Kebodo',
							'',
							'',
							'about',
							InsFile(baseDir + '/site-parts/en/header.html'),
							InsFile(baseDir + '/site-parts/en/footer.html')
						);
						break;

					case '/en/sign-in':
						if(req.method === 'POST') {
							var body = '';

							req.on('data',(data) => {
								body += data;
							});

							req.on('end',() => {
								var loginDetails = qs.parse(body);
								var adminUsername = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].username,adminPassword = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].password;

								if(req.method === 'POST' && loginDetails.username === adminUsername && loginDetails.password === adminPassword) {
									var dt = new Date();
									var logTxt = ' [+] | IP: ' + ip + ' | Date: ' + dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2) + ' ' + (('0' + dt.getHours()).slice(-2) - 2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2) + ' UTC | Username: ' + loginDetails.username + ' | Password: ' + loginDetails.password;
									if(fs.existsSync(baseDir + '/logs/' + userSignInLogFile + '.log')) {
										var logFileCnt = readFile(baseDir + '/logs/' + userSignInLogFile + '.log');
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log',logFileCnt += logTxt + '\n',(err) => { if(err) log(err); });
									} else {
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log',logTxt + '\n',(err) => { if(err) log(err); });
									}
									log('Login attempt:\r\n' + logTxt);
									adminPanel(res,req,ip);
								}
								else if(false) { return; }
								else {
									log(logTxt);
									resEndWithRenderHTML(res,req,ip,
										readFile(homeDir + 'public_html/en/sign-in/index.html').replace(
										/\<br\>\<\!\-\-loginIncorrect\-\-\>/g,
										`<style>#flg{cursor:default;font-size:14px;padding:7px;background:#b51324;color:#fff;border-radius:10px;} #flg::selection{background:transparent;color:#fff;}</style><span id="flg" align="center">The username or password you entered is incorrect</span><br>`),
										'Admin | Kebodo',
										'',
										'',
										'none',
										InsFile(baseDir + '/site-parts/en/header.html'),
										InsFile(baseDir + '/site-parts/en/footer.html')
									);
									res.end();
								}
							});
						}
						else {
							resEndWithRenderHTML(res,req,ip,
								readFile(homeDir + 'public_html/en/sign-in/index.html'),
								'Sign In | Kebodo',
								'',
								'',
								'none',
								InsFile(baseDir + '/site-parts/en/header.html'),
								InsFile(baseDir + '/site-parts/en/footer.html')
							);
						}
						break;

					/// DUTCH ///

					case '/nl':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/nl/index.html').replace(
								/\{\{totalKeyboardPartsAvailable\}\}/g,
								'0'
							),
							'Kebodo',
							InsFile('/css/welcome-section.css'),
							InsFile('/js/home.js'),
							'home',
							InsFile(baseDir + '/site-parts/nl/header.html'),
							InsFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/builder':
						resEndWithRenderHTML(res,req,ip,
							insertItems(readFile(homeDir + 'public_html/nl/builder/index.html')),
							'Builder | Kebodo',
							InsFile('/css/c_b.css') + InsFile('/css/s_b.css'),
							InsFile('/js/c_b.js') + InsFile('/js/s_b.js'),
							'builder',
							InsFile(baseDir + '/site-parts/nl/header.html'),
							InsFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/forum':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/nl/forum/index.html'),
							'Forum | Kebodo',
							'',
							'',
							'forum',
							InsFile(baseDir + '/site-parts/nl/header.html'),
							InsFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/about':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/nl/about/index.html'),
							'Over ons | Kebodo',
							'',
							'',
							'about',
							InsFile(baseDir + '/site-parts/nl/header.html'),
							InsFile(baseDir + '/site-parts/nl/footer.html')
						);
						break;

					case '/nl/sign-in':
						if(req.method === 'POST') {
							var body = '';

							req.on('data',(data) => {
								body += data;
							});

							req.on('end',() => {
								var loginDetails = qs.parse(body);
								var adminUsername = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].username,adminPassword = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].password;

								if(req.method === 'POST' && loginDetails.username === adminUsername && loginDetails.password === adminPassword) {
									var dt = new Date();
									var logTxt = ' [+] | IP: ' + ip + ' | Date: ' + dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2) + ' ' + (('0' + dt.getHours()).slice(-2) - 2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2) + ' UTC | Username: ' + loginDetails.username + ' | Password: ' + loginDetails.password;
									if(fs.existsSync(baseDir + '/logs/' + userSignInLogFile + '.log')) {
										var logFileCnt = readFile(baseDir + '/logs/' + userSignInLogFile + '.log');
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log',logFileCnt += logTxt + '\n',(err) => { if(err) log(err); });
									} else {
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log',logTxt + '\n',(err) => { if(err) log(err); });
									}
									log('\r\nLogin attempt:\r\n' + logTxt + '\r\n');
									adminPanel(res,req,ip);
								}
								else if(false) { return; }
								else {
									log(logTxt);
									resEndWithRenderHTML(res,req,ip,
										readFile(homeDir + 'public_html/nl/sign-in/index.html').replace(
										/\<br\>\<\!\-\-loginIncorrect\-\-\>/g,
										`<style>#flg{cursor:default;font-size:14px;padding:7px;background:#b51324;color:#fff;border-radius:10px;} #flg::selection{background:transparent;color:#fff;}</style><span id="flg" align="center">The username or password you entered is incorrect</span><br>`),
										'Admin | Kebodo',
										'',
										'',
										'none',
										InsFile(baseDir + '/site-parts/nl/header.html'),
										InsFile(baseDir + '/site-parts/nl/footer.html')
									);
									res.end();
								}
							});
						}
						else {
							resEndWithRenderHTML(res,req,ip,
								readFile(homeDir + 'public_html/nl/sign-in/index.html'),
								'Sign In | Kebodo',
								'',
								'',
								'none',
								InsFile(baseDir + '/site-parts/nl/header.html'),
								InsFile(baseDir + '/site-parts/nl/footer.html')
							);
						}
						break;

					/// ESTONIAN ///

					case '/ee':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/ee/index.html').replace(
								/\{\{totalKeyboardPartsAvailable\}\}/g,
								'0'
							),
							'Kebodo',
							InsFile('/css/welcome-section.css'),
							InsFile('/js/home.js'),
							'home',
							InsFile(baseDir + '/site-parts/ee/header.html'),
							InsFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;


					case '/ee/builder':
						resEndWithRenderHTML(res,req,ip,
							insertItems(readFile(homeDir + 'public_html/ee/builder/index.html')),
							'Ehitaja | Kebodo',
							InsFile('/css/c_b.css') + InsFile('/css/s_b.css'),
							InsFile('/js/c_b.js') + InsFile('/js/s_b.js'),
							'builder',
							InsFile(baseDir + '/site-parts/ee/header.html'),
							InsFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;

					case '/ee/forum':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/ee/forum/index.html'),
							'Foorum | Kebodo',
							'',
							'',
							'forum',
							InsFile(baseDir + '/site-parts/ee/header.html'),
							InsFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;

					case '/ee/about':
						resEndWithRenderHTML(res,req,ip,
							readFile(homeDir + 'public_html/ee/about/index.html'),
							'Meist | Kebodo',
							'',
							'',
							'about',
							InsFile(baseDir + '/site-parts/ee/header.html'),
							InsFile(baseDir + '/site-parts/ee/footer.html')
						);
						break;

					case '/ee/sign-in':
						if(req.method === 'POST') {
							var body = '';

							req.on('data',(data) => {
								body += data;
							});

							req.on('end',() => {
								var loginDetails = qs.parse(body);
								var adminUsername = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].username,adminPassword = JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].password;

								if(req.method === 'POST' && loginDetails.username === adminUsername && loginDetails.password === adminPassword) {
									var dt = new Date();
									var logTxt = ' [+] | IP: ' + ip + ' | Date: ' + dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2) + ' ' + (('0' + dt.getHours()).slice(-2) - 2) + ':' + ('0' + dt.getMinutes()).slice(-2) + ':' + ('0' + dt.getSeconds()).slice(-2) + ' UTC | Username: ' + loginDetails.username + ' | Password: ' + loginDetails.password;
									if(fs.existsSync(baseDir + '/logs/' + userSignInLogFile + '.log')) {
										var logFileCnt = readFile(baseDir + '/logs/' + userSignInLogFile + '.log');
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log',logFileCnt += logTxt + '\n',(err) => { if(err) log(err); });
									} else {
										fs.writeFile(baseDir + '/logs/' + userSignInLogFile + '.log',logTxt + '\n',(err) => { if(err) log(err); });
									}
									log('\r\nLogin attempt:\r\n' + logTxt + '\r\n');
									adminPanel(res,req,ip);
								}
								else if(false) { return; }
								else {
									log(logTxt);
									resEndWithRenderHTML(res,req,ip,
										readFile(homeDir + 'public_html/ee/sign-in/index.html').replace(
										/\<br\>\<\!\-\-loginIncorrect\-\-\>/g,
										`<style>#flg{cursor:default;font-size:14px;padding:7px;background:#b51324;color:#fff;border-radius:10px;} #flg::selection{background:transparent;color:#fff;}</style><span id="flg" align="center">The username or password you entered is incorrect</span><br>`),
										'Admin | Kebodo',
										'',
										'',
										'none',
										InsFile(baseDir + '/site-parts/ee/header.html'),
										InsFile(baseDir + '/site-parts/ee/footer.html')
									);
									res.end();
								}
							});
						}
						else {
							resEndWithRenderHTML(res,req,ip,
								readFile(homeDir + 'public_html/ee/sign-in/index.html'),
								'Sign In | Kebodo',
								'',
								'',
								'none',
								InsFile(baseDir + '/site-parts/ee/header.html'),
								InsFile(baseDir + '/site-parts/ee/footer.html')
							);
						}
						break;

					case '/' + JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token:
						if(cookie['TOKEN'] == JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token) {
							resEndWithRenderHTML(res,req,ip,readFile(baseDir + '/admin-panel/index.html'),'Admin | Kebodo','',InsFile('/js/admin/main.js'),'none',InsFile(baseDir + '/admin-panel/header.html').replace(/\{\{admin\}\}/g,JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token),'');
						}
						else {
							resEndWith302(res,'/en/sign-in');
						}
						break;

					case '/' + JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token + '/dom':
						if(cookie['TOKEN'] == JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token) {
							var domHtml = readFile(baseDir + '/admin-panel/dom.html').replace(
								/\{\{serverLocalFiles\}\}/g,
								getServerFiles()
							);
							resEndWithRenderHTML(res,req,ip,domHtml,'Admin | Kebodo','',InsFile('/js/admin/main.js'),'none',InsFile(baseDir + '/admin-panel/header.html').replace(/\{\{admin\}\}/g,JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token),'');
						}
						else {
							resEndWith302(res,'/en/sign-in');
						}
						break;

					case '/' + JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token + '/builder':
						if(cookie['TOKEN'] == JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token) {
							resEndWithRenderHTML(res,req,ip,readFile(baseDir + '/admin-panel/builder.html'),'Admin | Kebodo','',InsFile('/js/admin/main.js'),'none',InsFile(baseDir + '/admin-panel/header.html').replace(/\{\{admin\}\}/g,JSON.parse(readFile(baseDir + '/login/admin-login-details.json'))[0].token),'');
						}
						else {
							resEndWith302(res,'/en/sign-in');
						}
						break;

					/// DEFAULT ///

					default:
						const possibleFilePath = path.resolve(baseDir,q.pathname.replace(/^\/*/,homeDir + 'public_html/'));
						if(fs.existsSync(possibleFilePath)) {
							fs.readFile(possibleFilePath,(err,data) => {
								if(err) {
									resEndWith404(res,req,ip,
										readFile(baseDir + '/404.htm'),
										'Page Not Found',
										'none',
										InsFile(baseDir + '/site-parts/ee/header.html'),
										InsFile(baseDir + '/site-parts/en/footer.html')
									);
								}
								res.statusCode = 200;
								return res.end(data);
							});
						}
						else {
							resEndWith404(res,req,ip,
								readFile(baseDir + '/404.htm'),
								'Page Not Found',
								'none',
								InsFile(baseDir + '/site-parts/en/header.html'),
								InsFile(baseDir + '/site-parts/en/footer.html')
							);
						}
						break;
				}
			}
		}
	}).listen(port);
}

start(80);