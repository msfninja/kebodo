var $ = (id) => { return document.getElementById(id); };

const
	mHead = $('mobileHeader'),
	mHeadOpen = $('mobileHeaderBtnOpen'),
	mHeadClose = $('mobileHeaderBtnClose'),
	mHeadCnt = $('mobileHeaderContent'),
	mobileNavBtnContact = $('mobileNavBtnContact');

const
	b = document.body,
	cnt = $('cnt');

cnt.style.transition = 'all 300ms ease-out';
var bodyLoad = () => { cnt.style.opacity = '1'; };

mHead.style.transition = 'ease 200ms';
mHead.style.top = '0';

mHeadCnt.style.display = 'none';
mHeadCnt.style.transition = 'ease 200ms';
mHeadCnt.style.marginLeft = '-100px';
mHeadCnt.style.opacity = '0';

mHeadOpen.addEventListener('click',() => {
	mHeadCnt.style.display = 'block';
	mHeadCnt.style.marginLeft = '-100px';
	mHeadCnt.style.opacity = '0';
	setTimeout(() => {
		mHeadCnt.style.opacity = '1';
		mHeadCnt.style.marginLeft = '0';
	},50);
	mHead.style.top = '-150px';
	b.style.overflow = 'hidden';
});

mHeadClose.addEventListener('click',() => {
	mHeadCnt.style.transition = 'ease 200ms';
	mHeadCnt.style.marginLeft = '-100px';
	mHeadCnt.style.opacity = '0';
	mHead.style.top = '0';
	setTimeout(() => { mHeadCnt.style.display = 'none'; },200);
	b.style.overflow = 'visible';
});

mobileNavBtnContact.addEventListener('click',() => {
	mHeadCnt.style.transition = 'ease 200ms';
	mHeadCnt.style.marginLeft = '-100px';
	mHeadCnt.style.opacity = '0';
	mHead.style.top = '0';
	setTimeout(() => { mHeadCnt.style.display = 'none'; },200);
	b.style.overflow = 'visible';
});

var signOutAdmin = () => {
	var expires = (new Date(Date.now() - (86400 * 1000))).toUTCString();
	document.cookie = 'TOKEN=; expires' + expires + '; path=/;';
	window.location.reload(true);
};