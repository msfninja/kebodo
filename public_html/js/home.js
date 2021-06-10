var $ = (id) => { return document.getElementById(id); };

const welcomeBg = $('welcomeBg');

const homeImages = [
	'url("http://143.176.32.149/images/keyboard_1.jpg")',
	'url("http://143.176.32.149/images/keyboard_3.jpg")',
	'url("http://143.176.32.149/images/keyboard_4.jpg")',
	'url("http://143.176.32.149/images/keyboard_5.jpg")'
];

var x = 0;

//w.style.transition = 'ease 400ms';

setInterval(() => {
	if(x < homeImages.length - 1) {
		welcomeBg.style.opacity = '0';
		setTimeout(() => {
			x++;
			welcomeBg.style.backgroundImage = homeImages[x];
		},400);
		setTimeout(() => {
			welcomeBg.style.opacity = '1';
		},800);
	} else {
		welcomeBg.style.opacity = '0';
		setTimeout(() => {
			welcomeBg.style.backgroundImage = homeImages[0];
		},400);
		setTimeout(() => {
			welcomeBg.style.opacity = '1';
		},800);
		x = 0;
	}
},7000);